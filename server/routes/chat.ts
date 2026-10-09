import { Hono } from "hono";
import { getDb } from "../db";
import { messages, projectFiles, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { SYSTEM_PROMPT, extractFilesFromResponse } from "../lib/ai";

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

export const chatRouter = new Hono<{ Bindings: Bindings }>();

chatRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { projectId, prompt, userApiKey, provider = "gemini" } = body;

  if (!projectId || !prompt) {
    return c.json({ error: "projectId and prompt are required" }, 400);
  }

  const db = getDb(c.env.DB);

  // 1. Fetch current project files for context
  const currentFiles = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, projectId));

  // 2. Fetch past conversation messages
  const pastMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.projectId, projectId));

  // Build the context string with current project files
  const fileContextString = currentFiles
    .map((f) => `--- File: ${f.path} ---\n${f.content}\n--- End File ---`)
    .join("\n\n");

  const effectiveKey =
    userApiKey ||
    c.env.GEMINI_API_KEY ||
    c.env.ANTHROPIC_API_KEY ||
    c.env.OPENAI_API_KEY;

  if (!effectiveKey) {
    return c.json(
      {
        error:
          "No AI API key found. Please provide an API key in the UI settings or configure GEMINI_API_KEY in Cloudflare environment variables.",
      },
      400
    );
  }

  // Save the user's message to D1
  await db.insert(messages).values({
    id: `msg_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    projectId,
    role: "user",
    content: prompt,
  });

  try {
    let assistantReply = "";

    // If Gemini key is used (Google Gemini 1.5 Flash / Pro API)
    if (provider === "gemini" || c.env.GEMINI_API_KEY || userApiKey?.startsWith("AIza")) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;
      
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}\n\nUSER REQUEST: ${prompt}`,
            },
          ],
        },
      ];

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    } else {
      // Fallback OpenAI compatible (e.g. GPT-4o / Groq / OpenRouter)
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}` },
            ...pastMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`AI API error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply = data.choices?.[0]?.message?.content || "";
    }

    // Extract any modified or generated files from the XML <file path="...">...</file>
    const generatedFiles = extractFilesFromResponse(assistantReply);

    // Save modified files into Cloudflare D1
    for (const file of generatedFiles) {
      await db
        .insert(projectFiles)
        .values({
          id: `file_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
          projectId,
          path: file.filePath,
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

    // Save assistant reply to D1
    await db.insert(messages).values({
      id: `msg_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      projectId,
      role: "assistant",
      content: assistantReply,
    });

    // Update project timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId));

    return c.json({
      reply: assistantReply,
      filesUpdated: generatedFiles.map((f) => ({ path: f.filePath, content: f.content })),
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to process AI chat" }, 500);
  }
});
