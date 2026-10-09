import React, { useState, useEffect } from "react";
import { Key, X, Check, Database, Cpu, Sparkles, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [kimiKey, setKimiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnthropicKey(localStorage.getItem("lovable_anthropic_key") || "");
    setKimiKey(localStorage.getItem("lovable_kimi_key") || "");
    setGeminiKey(localStorage.getItem("lovable_gemini_key") || "");
    setOpenRouterKey(localStorage.getItem("lovable_openrouter_key") || "");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("lovable_anthropic_key", anthropicKey.trim());
    localStorage.setItem("lovable_kimi_key", kimiKey.trim());
    localStorage.setItem("lovable_gemini_key", geminiKey.trim());
    localStorage.setItem("lovable_openrouter_key", openRouterKey.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1423] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-sm font-semibold text-white">AI Engine & Model Keys</h3>
            <p className="text-[11px] text-slate-400">
              Configure free and premium LLMs (Claude, Kimi, DeepSeek, Gemini)
            </p>
          </div>
        </div>

        {/* Free Cloudflare Workers AI Highlight */}
        <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-emerald-300">
              100% Free & Unrestricted Models (No API key needed!)
            </div>
            <p className="text-[11px] text-emerald-400/80 leading-relaxed mt-0.5">
              <strong>DeepSeek R1</strong>, <strong>Qwen 2.5 Coder 32B</strong>, and <strong>Llama 3.3 70B</strong> run natively on your Cloudflare Workers AI with zero setup and no keys required. Select them in the sidebar dropdown anytime!
            </p>
          </div>
        </div>

        {/* Cloudflare D1 connection status */}
        <div className="p-2.5 mb-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-slate-300 font-mono">D1 Database: artificial-intelligence</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            Active
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Claude */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Anthropic Claude 3.5 Sonnet Key
              </label>
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Kimi 3 / Moonshot */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Kimi 3 / Moonshot API Key
              </label>
              <a
                href="https://platform.moonshot.cn"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={kimiKey}
              onChange={(e) => setKimiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Google Gemini */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Google Gemini API Key (Generous Free Tier)
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                Free Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* OpenRouter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                OpenRouter Key (Optional for OpenRouter Free Pool)
              </label>
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                OpenRouter <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-600/20 pt-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Settings Saved!</span>
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
