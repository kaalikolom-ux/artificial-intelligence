import { Hono } from "hono";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { chatRouter } from "./routes/chat";
import { githubRouter } from "./routes/github";

type Bindings = {
  DB: D1Database;
  ASSETS?: Fetcher;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount API sub-routers
app.route("/api/auth", authRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/chat", chatRouter);
app.route("/api/github", githubRouter);

// Cloudflare Workers with Static Assets handler:
// If request doesn't match /api, fallback to static assets
app.all("*", async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("AI App Studio - Assets not loaded", 404);
});

export default app;
