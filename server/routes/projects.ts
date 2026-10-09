import { Hono } from "hono";
import { getDb } from "../db";
import { projects, projectFiles, messages } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { DEFAULT_PROJECT_FILES } from "../../src/lib/defaultTemplate";

type Bindings = {
  DB: D1Database;
};

export const projectsRouter = new Hono<{ Bindings: Bindings }>();

// List all projects
projectsRouter.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
  return c.json({ projects: allProjects });
});

// Create a new project
projectsRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = body.title || "Untitled Project";
  const description = body.description || "Created with AI App Studio";

  const db = getDb(c.env.DB);
  const projectId = `proj_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  // 1. Insert Project record
  await db.insert(projects).values({
    id: projectId,
    title,
    description,
  });

  // 2. Insert Default Files for this project
  for (const file of DEFAULT_PROJECT_FILES) {
    await db.insert(projectFiles).values({
      id: `file_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      projectId,
      path: file.path,
      content: file.content,
    });
  }

  // 3. Insert welcome assistant message
  await db.insert(messages).values({
    id: `msg_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    projectId,
    role: "assistant",
    content: "Welcome! I'm ready to help you build your React & Tailwind app. What would you like to create or customize?",
  });

  return c.json({ id: projectId, title, description }, 201);
});

// Get a specific project with all its files & message history
projectsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DB);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, id));
  const msgs = await db.select().from(messages).where(eq(messages.projectId, id));

  return c.json({
    project,
    files: files.map((f) => ({ path: f.path, content: f.content })),
    messages: msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
  });
});

// Update or add files to a project
projectsRouter.put("/:id/files", async (c) => {
  const projectId = c.req.param("id");
  const { files } = (await c.req.json()) as { files: { path: string; content: string }[] };

  if (!files || !Array.isArray(files)) {
    return c.json({ error: "Invalid files array" }, 400);
  }

  const db = getDb(c.env.DB);

  for (const file of files) {
    await db
      .insert(projectFiles)
      .values({
        id: `file_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
        projectId,
        path: file.path,
        content: file.content,
      })
      .onConflictDoUpdate({
        target: [projectFiles.projectId, projectFiles.path],
        set: {
          content: file.content,
          updatedAt: new Date().toISOString(),
        },
      });
  }

  return c.json({ success: true, count: files.length });
});
