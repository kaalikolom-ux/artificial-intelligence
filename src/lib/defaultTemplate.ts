export interface TemplateFile {
  path: string;
  content: string;
}

export const DEFAULT_PROJECT_FILES: TemplateFile[] = [
  {
    path: "package.json",
    content: JSON.stringify(
      {
        name: "ai-generated-app",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.344.0",
          clsx: "^2.1.1",
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.2.1",
          autoprefixer: "^10.4.19",
          postcss: "^8.4.38",
          tailwindcss: "^3.4.3",
          vite: "^5.2.0",
        },
      },
      null,
      2
    ),
  },
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-900 text-slate-100 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  },
  {
    path: "src/main.tsx",
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
  },
  {
    path: "src/App.tsx",
    content: `import React, { useState } from 'react';
import { Sparkles, Rocket, Code2, Zap } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          Ready to Build
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
          Your AI App Sandbox
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          Ask the AI assistant on the left panel to build landing pages, dashboards, components, or entire apps!
        </p>

        <div className="pt-2">
          <button
            onClick={() => setCount(c => c + 1)}
            className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            Interactive Counter: {count}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-left text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>React + Tailwind</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-violet-400" />
            <span>Instant Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
];
