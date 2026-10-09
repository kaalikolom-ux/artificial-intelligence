import React from "react";
import { Sparkles, Key, Play, Code2, ExternalLink, RefreshCw } from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import { Project, User } from "../lib/types";

interface HeaderProps {
  project: Project | null;
  user: User | null;
  activeTab: "preview" | "code" | "split";
  setActiveTab: (tab: "preview" | "code" | "split") => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  user,
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenSettings,
  isSaving = false,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-[#090d16] px-4 flex items-center justify-between z-20 select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Lovable AI <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/30">D1+Pages</span>
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">
            {project?.title || "New Project"}
          </span>
          {isSaving && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <RefreshCw className="w-3 h-3 animate-spin" /> Saving to D1...
            </span>
          )}
        </div>
      </div>

      {/* Center Tabs: Code, Preview, Split */}
      <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
        <button
          onClick={() => setActiveTab("split")}
          className={`px-3 py-1.5 rounded-md font-medium transition ${
            activeTab === "split"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Split
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
            activeTab === "preview"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Play className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
            activeTab === "code"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Code
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSettings}
          title="API Key Settings"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <Key className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Export to GitHub</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={user.avatarUrl || "https://github.com/ghost.png"}
              alt={user.username}
              className="w-7 h-7 rounded-full border border-slate-700"
            />
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              {user.username}
            </span>
          </div>
        ) : (
          <a
            href="/api/auth/github"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Login</span>
          </a>
        )}
      </div>
    </header>
  );
};
