import React from "react";
import Editor from "@monaco-editor/react";
import { ProjectFile } from "../lib/types";
import { Save, Check } from "lucide-react";

interface EditorPanelProps {
  activeFile: ProjectFile | undefined;
  onContentChange: (newContent: string) => void;
  onSave?: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  activeFile,
  onContentChange,
  onSave,
}) => {
  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d111d] text-slate-500 text-xs">
        Select a file from the explorer to view or edit
      </div>
    );
  }

  const getLanguage = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".css")) return "css";
    return "plaintext";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d111d] overflow-hidden">
      {/* Tab bar */}
      <div className="h-9 border-b border-slate-800 bg-[#090d16] flex items-center justify-between px-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-300 font-medium">
            {activeFile.path}
          </span>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
          >
            <Save className="w-3 h-3 text-indigo-400" />
            <span>Save</span>
          </button>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 w-full h-full">
        <Editor
          height="100%"
          language={getLanguage(activeFile.path)}
          value={activeFile.content}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "Fira Code, Menlo, Monaco, 'Courier New', monospace",
          }}
          onChange={(val) => onContentChange(val || "")}
        />
      </div>
    </div>
  );
};
