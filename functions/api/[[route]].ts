import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { authRouter } from "../../server/routes/auth";
import { projectsRouter } from "../../server/routes/projects";
import { chatRouter } from "../../server/routes/chat";
import { githubRouter } from "../../server/routes/github";

type Bindings = {
  DB: D1Database;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount sub-routers
app.route("/auth", authRouter);
app.route("/projects", projectsRouter);
app.route("/chat", chatRouter);
app.route("/github", githubRouter);

export const onRequest = handle(app);
