import React, { useState, useEffect } from "react";
import { Key, X, Check, Database, Server } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("lovable_ai_key") || "";
    const savedProvider = localStorage.getItem("lovable_ai_provider") || "gemini";
    setApiKey(savedKey);
    setProvider(savedProvider);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("lovable_ai_key", apiKey.trim());
    localStorage.setItem("lovable_ai_provider", provider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
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
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI & Settings</h3>
            <p className="text-[11px] text-slate-400">
              Configure your AI Provider and API Keys
            </p>
          </div>
        </div>

        {/* Cloudflare D1 connection status badge */}
        <div className="p-3 mb-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[11px] font-medium text-slate-200">Cloudflare D1 Database</div>
              <div className="text-[10px] text-slate-500 font-mono">artificial-intelligence</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            Connected
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="gemini">Google Gemini 1.5 Flash / Pro (Recommended)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              API Key (Stored locally in your browser)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... / sk-..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              If not set here, the worker will use the default server-side API key from Wrangler secrets.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-600/20"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
