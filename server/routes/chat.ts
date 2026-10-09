import { Hono } from "hono";
import { getDb } from "../db";
import { messages, projectFiles, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { SYSTEM_PROMPT, extractFilesFromResponse } from "../lib/ai";

type Bindings = {
  DB: D1Database;
  AI?: any; // Cloudflare Workers AI
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  KIMI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

export const chatRouter = new Hono<{ Bindings: Bindings }>();

export interface AvailableModel {
  id: string;
  name: string;
  provider: "free-cloudflare" | "claude" | "kimi" | "gemini" | "deepseek" | "openai" | "openrouter";
  badge: string;
  description: string;
}

export const SUPPORTED_MODELS: AvailableModel[] = [
  {
    id: "cf-deepseek-r1",
    name: "DeepSeek R1 (Reasoning)",
    provider: "free-cloudflare",
    badge: "100% Free",
    description: "Cloudflare Workers AI - DeepSeek R1 Distill Qwen 32B (No key needed)",
  },
  {
    id: "cf-qwen-coder",
    name: "Qwen 2.5 Coder 32B",
    provider: "free-cloudflare",
    badge: "100% Free",
    description: "Cloudflare Workers AI - Specialized Coding LLM (No key needed)",
  },
  {
    id: "cf-llama-70b",
    name: "Llama 3.3 70B",
    provider: "free-cloudflare",
    badge: "100% Free",
    description: "Cloudflare Workers AI - Meta Llama 3.3 70B Instruct (No key needed)",
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "claude",
    badge: "Top Tier",
    description: "Anthropic Claude 3.5 Sonnet - Lovable's flagship coding engine",
  },
  {
    id: "kimi-3",
    name: "Kimi 3 / Moonshot",
    provider: "kimi",
    badge: "Long Context",
    description: "Moonshot Kimi K1.5 / Kimi 3 - 128k-200k context code reasoning",
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    badge: "Ultra Fast",
    description: "Google Gemini 2.0 Flash - Generous free tier from Google AI",
  },
  {
    id: "openrouter-free",
    name: "OpenRouter Free Models",
    provider: "openrouter",
    badge: "Free Tier",
    description: "DeepSeek R1 / V3 / Qwen Coder via OpenRouter free pool",
  },
];

chatRouter.get("/models", (c) => {
  return c.json({ models: SUPPORTED_MODELS });
});

chatRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { projectId, prompt, model = "cf-deepseek-r1", userApiKey, customEndpoint } = body;

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

  const fullPrompt = `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}\n\nUSER REQUEST: ${prompt}`;

  // Save the user's message to D1
  await db.insert(messages).values({
    id: `msg_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    projectId,
    role: "user",
    content: prompt,
  });

  try {
    let assistantReply = "";

    // 1. FREE CLOUDFLARE WORKERS AI (No API key needed!)
    if (
      model.startsWith("cf-") ||
      (!userApiKey && !c.env.GEMINI_API_KEY && !c.env.ANTHROPIC_API_KEY && !c.env.KIMI_API_KEY)
    ) {
      if (c.env.AI) {
        let cfModel = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";
        if (model === "cf-qwen-coder") {
          cfModel = "@cf/qwen/qwen-2.5-coder-32b-instruct";
        } else if (model === "cf-llama-70b") {
          cfModel = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
        }

        const cfResult = await c.env.AI.run(cfModel, {
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}` },
            ...pastMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
          max_tokens: 4096,
        });

        assistantReply = cfResult?.response || cfResult?.text || "";
      } else {
        // Fallback to OpenRouter free or Gemini
        throw new Error("Cloudflare Workers AI binding is initializing. Please select Gemini or add an API key.");
      }
    }
    // 2. ANTHROPIC CLAUDE 3.5 SONNET
    else if (model === "claude-3-5-sonnet") {
      const anthropicKey = userApiKey || c.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        throw new Error("Anthropic API key required for Claude 3.5 Sonnet. Please add your key in Settings, or select 'DeepSeek R1 (100% Free)'");
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}`,
          messages: [
            ...pastMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude API error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply = data.content?.[0]?.text || "";
    }
    // 3. KIMI 3 / MOONSHOT
    else if (model === "kimi-3") {
      const kimiKey = userApiKey || c.env.KIMI_API_KEY;
      if (!kimiKey) {
        throw new Error("Kimi/Moonshot API key required. Please add your Kimi key in Settings, or select 'DeepSeek R1 (100% Free)'");
      }

      const endpoint = customEndpoint || "https://api.moonshot.cn/v1/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${kimiKey}`,
        },
        body: JSON.stringify({
          model: "moonshot-v1-32k",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}` },
            ...pastMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kimi API error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply = data.choices?.[0]?.message?.content || "";
    }
    // 4. GOOGLE GEMINI 2.0 / 1.5
    else if (model.includes("gemini") || c.env.GEMINI_API_KEY || userApiKey?.startsWith("AIza")) {
      const geminiKey = userApiKey || c.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("Google Gemini API key required. Get a free key at aistudio.google.com");
      }

      const geminiModel = model === "gemini-2-flash" ? "gemini-2.0-flash-exp" : "gemini-1.5-flash";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }],
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    // 5. OPENROUTER FREE POOL
    else if (model === "openrouter-free" || userApiKey?.startsWith("sk-or-")) {
      const routerKey = userApiKey || c.env.OPENROUTER_API_KEY || "sk-or-v1-free";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${routerKey}`,
          "HTTP-Referer": "https://ai.wooniche.com",
          "X-Title": "Lovable AI Studio",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\nCURRENT PROJECT FILES:\n${fileContextString}` },
            ...pastMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenRouter error (${res.status}): ${err}`);
      }

      const data = (await res.json()) as any;
      assistantReply = data.choices?.[0]?.message?.content || "";
    }

    if (!assistantReply) {
      assistantReply = "No response generated. Please check your model selection or API key.";
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
