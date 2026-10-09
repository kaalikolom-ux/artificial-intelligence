import { Hono } from "hono";
import { getDb } from "../db";
import { projects, projectFiles, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { pushFilesToGitHub } from "../lib/github";

type Bindings = {
  DB: D1Database;
};

export const githubRouter = new Hono<{ Bindings: Bindings }>();

// Export a project's files to GitHub repository
githubRouter.post("/export", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { projectId, repoName, customToken, isPrivate = false } = body;

  if (!projectId || !repoName) {
    return c.json({ error: "projectId and repoName are required" }, 400);
  }

  const db = getDb(c.env.DB);

  // Retrieve user access token from session or custom token
  let token = customToken;
  if (!token) {
    const cookie = c.req.header("Cookie");
    const match = cookie?.match(/user_id=([^;]+)/);
    const userId = match ? match[1] : null;

    if (userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.accessToken) {
        token = user.accessToken;
      }
    }
  }

  if (!token) {
    return c.json(
      {
        error:
          "GitHub Personal Access Token is required or you need to log in with GitHub first.",
      },
      401
    );
  }

  // Fetch all files of the project from D1
  const files = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, projectId));

  if (!files || files.length === 0) {
    return c.json({ error: "No files found for this project to export" }, 400);
  }

  try {
    const result = await pushFilesToGitHub(
      token,
      repoName,
      files.map((f) => ({ path: f.path, content: f.content })),
      isPrivate
    );

    // Save repo url in project
    await db
      .update(projects)
      .set({ githubRepo: result.repoUrl, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId));

    return c.json({
      success: true,
      repoUrl: result.repoUrl,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to push files to GitHub" }, 500);
  }
});
