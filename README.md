# AI App Studio (Lovable Clone)

> **Prompt-to-App AI Web Application Studio** powered by **React (Vite) + Cloudflare Pages + Cloudflare D1 (SQLite) + GitHub API**.

Inspired by platforms like **Lovable.dev**, **Bolt.new**, and **v0**, this platform lets users generate, preview, edit, and export full-stack React & Tailwind CSS web apps using AI prompts, backed directly by Cloudflare's global edge infrastructure.

---

## 🌟 Features

- ⚡ **Cloudflare Pages & Workers**: High-speed edge hosting and serverless functions via [Hono](https://hono.dev).
- 🗄️ **Cloudflare D1 (SQLite)**: Fully managed, serverless SQL database storing projects, users, chat history, and virtual files.
- 💻 **Live In-Browser Preview**: Powered by `@codesandbox/sandpack-react` — runs Vite, React, and Tailwind CSS directly inside the browser sandbox without server containers.
- ✍️ **Code Editor**: Integrated Monaco Editor (VS Code core) with multi-file explorer, real-time code updates, and manual saving.
- 🤖 **AI Code Generation**: Context-aware LLM prompt engine that modifies or creates project files on demand (supporting Google Gemini 1.5, OpenAI GPT-4o, and Anthropic Claude 3.5).
- 🐙 **GitHub Integration**:
  - GitHub OAuth authentication.
  - One-click **Export to GitHub**: automatically creates a repository and commits all project files from Cloudflare D1.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Monaco Editor, Sandpack.
- **Backend API**: Cloudflare Pages Functions (`/api/*`), Hono, Drizzle ORM.
- **Database**: Cloudflare D1 Database (`artificial-intelligence`).
  - Database ID: `7bdcdc2b-27b5-40a5-96b5-802c3e65d645`
- **Package Manager / Runtime**: Bun / Node.js.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. D1 Database Migration

Run migrations locally for development:
```bash
bun run db:migrate:local
```

Or execute against your remote Cloudflare D1 database:
```bash
bun run db:migrate:remote
```

### 3. Local Development

Run the frontend with Vite:
```bash
bun run dev
```

Or run the full Cloudflare Pages simulation with local D1 database:
```bash
bun run pages:dev
```

---

## ⚙️ Cloudflare Configuration (`wrangler.jsonc`)

The project is configured for Cloudflare Pages and D1:

```jsonc
{
  "name": "artificial-intelligence",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "artificial-intelligence",
      "database_id": "7bdcdc2b-27b5-40a5-96b5-802c3e65d645"
    }
  ]
}
```

### Environment Variables / Secrets (Cloudflare Dashboard)

Set the following in **Cloudflare Dashboard > Workers & Pages > Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI code generation |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `APP_URL` | Your production URL (e.g. `https://artificial-intelligence.pages.dev`) |

*(Note: Users can also input their own API Key directly in the UI Settings dialog via BYOK).*

---

## 📦 Deploying to Cloudflare Pages

### Option A: Via GitHub CI/CD (Recommended)
1. Since your GitHub repository `kaalikolom-ux/artificial-intelligence` is already connected to Cloudflare:
   - **Framework Preset**: `Vite`
   - **Build command**: `bun run build` (or `npm run build`)
   - **Build output directory**: `dist`
2. In Cloudflare Pages project settings, bind the D1 database:
   - Variable name: `DB`
   - D1 Database: `artificial-intelligence` (`7bdcdc2b-27b5-40a5-96b5-802c3e65d645`)

### Option B: Via Wrangler CLI
```bash
bun run pages:deploy
```
