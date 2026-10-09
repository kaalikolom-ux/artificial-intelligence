import { Hono } from "hono";
import { getDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { exchangeGitHubCode, getGitHubUserProfile } from "../lib/github";

type Bindings = {
  DB: D1Database;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  APP_URL?: string;
};

export const authRouter = new Hono<{ Bindings: Bindings }>();

// Redirect to GitHub OAuth
authRouter.get("/github", (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: "GITHUB_CLIENT_ID is not configured in Workers environment variables" }, 400);
  }

  const redirectUri = `${c.env.APP_URL || new URL(c.req.url).origin}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=repo,read:user,user:email`;

  return c.redirect(url);
});

// GitHub OAuth callback
authRouter.get("/github/callback", async (c) => {
  const code = c.req.query("code");
  const clientId = c.env.GITHUB_CLIENT_ID;
  const clientSecret = c.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return c.text("Missing required OAuth configuration or code parameter", 400);
  }

  try {
    const accessToken = await exchangeGitHubCode(clientId, clientSecret, code);
    const profile = await getGitHubUserProfile(accessToken);

    const db = getDb(c.env.DB);
    const userId = `usr_${profile.id}`;

    // Upsert user into D1
    await db
      .insert(users)
      .values({
        id: userId,
        githubId: profile.id.toString(),
        username: profile.login,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        accessToken,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          username: profile.login,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          accessToken,
        },
      });

    // Set cookie and redirect back to app
    c.header("Set-Cookie", `user_id=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    return c.redirect("/");
  } catch (err: any) {
    return c.text(`Authentication error: ${err.message}`, 500);
  }
});

// Get current logged-in user profile
authRouter.get("/me", async (c) => {
  const cookie = c.req.header("Cookie");
  const match = cookie?.match(/user_id=([^;]+)/);
  const userId = match ? match[1] : null;

  if (!userId) {
    return c.json({ user: null });
  }

  const db = getDb(c.env.DB);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return c.json({ user: null });
  }

  return c.json({
    user: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      email: user.email,
      hasGithubToken: Boolean(user.accessToken),
    },
  });
});

// Logout
authRouter.post("/logout", (c) => {
  c.header("Set-Cookie", "user_id=; Path=/; HttpOnly; Max-Age=0");
  return c.json({ success: true });
});
