import React, { useState } from "react";
import { X, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import { Project, User } from "../lib/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  user: User | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  user,
}) => {
  const [repoName, setRepoName] = useState(
    project?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-ai-app"
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [customToken, setCustomToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsLoading(true);
    setError(null);
    setSuccessUrl(null);

    try {
      const res = await fetch("/api/github/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          repoName: repoName.trim(),
          isPrivate,
          customToken: customToken.trim() || undefined,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to export repository to GitHub");
      }

      setSuccessUrl(data.repoUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1423] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
            <GithubIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Export to GitHub</h3>
            <p className="text-[11px] text-slate-400">
              Commit and push all project files directly to a GitHub repository
            </p>
          </div>
        </div>

        {successUrl ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium text-xs">Successfully exported!</p>
                <p className="text-[11px] text-emerald-400/80">
                  Your project code is now live on GitHub.
                </p>
              </div>
            </div>

            <a
              href={successUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-md shadow-indigo-600/20"
            >
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleExport} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                required
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-ai-app"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {!user?.hasGithubToken && (
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Or log in with GitHub to export automatically without a PAT.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPrivate" className="text-slate-300 select-none">
                Make repository private
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !repoName.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Create & Push Code</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
