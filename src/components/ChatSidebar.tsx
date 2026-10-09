import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Sparkles, Loader2, ChevronDown, Cpu } from "lucide-react";
import { ChatMessage } from "../lib/types";

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const MODELS_LIST = [
  { id: "cf-deepseek-r1", name: "DeepSeek R1", badge: "Free (No Key)", desc: "Reasoning & Logic" },
  { id: "cf-qwen-coder", name: "Qwen 2.5 Coder", badge: "Free (No Key)", desc: "Specialized for Code" },
  { id: "cf-llama-70b", name: "Llama 3.3 70B", badge: "Free (No Key)", desc: "Flagship 70B Open LLM" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", badge: "Pro Coding", desc: "Anthropic Claude" },
  { id: "kimi-3", name: "Kimi 3 / Moonshot", badge: "Long Context", desc: "Moonshot K1.5 / Kimi 3" },
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", badge: "Google AI", desc: "Fast & Free Tier" },
];

const QUICK_PROMPTS = [
  "Add a modern hero section with glowing gradient buttons",
  "Build a pricing card section with monthly/yearly toggle",
  "Create an interactive kanban task board",
  "Add dark/light theme switcher and modern stats widget",
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedModel,
  onSelectModel,
}) => {
  const [input, setInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS_LIST.find((m) => m.id === selectedModel) || MODELS_LIST[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const prompt = input;
    setInput("");
    onSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-[#0c101d] border-r border-slate-800 shrink-0">
      {/* Top Header & Model Switcher */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Model:
          </span>
        </div>

        {/* Model dropdown toggle */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs transition"
        >
          <span className="font-medium text-slate-200">{currentModel.name}</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentModel.badge}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-3 top-12 w-64 bg-[#111728] border border-slate-700 rounded-xl shadow-2xl z-30 p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" /> Select AI Engine
            </div>
            {MODELS_LIST.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelectModel(m.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition ${
                  m.id === selectedModel
                    ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.desc}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  m.badge.includes("Free") ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-300"
                }`}>
                  {m.badge}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role !== "user" && (
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs leading-relaxed items-center text-slate-400 bg-slate-900/40 border border-indigo-500/20 p-3 rounded-xl">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Thinking with {currentModel.name} & updating code...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-3 pb-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
          </div>
          <div className="flex flex-col gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(prompt)}
                className="text-left text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 p-2 rounded-lg transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="p-3 border-t border-slate-800 bg-[#090d16]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentModel.name} to build anything...`}
            rows={2}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="text-[10px] text-slate-500 text-center mt-1.5 flex items-center justify-between px-1">
          <span>Enter to send</span>
          <span className="text-emerald-400/80">Active: {currentModel.name}</span>
        </div>
      </div>
    </div>
  );
};
