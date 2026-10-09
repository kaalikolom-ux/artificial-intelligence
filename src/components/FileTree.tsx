import React from "react";
import { FileCode, FileText, File, Plus } from "lucide-react";
import { ProjectFile } from "../lib/types";

interface FileTreeProps {
  files: ProjectFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onAddFile?: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onAddFile,
}) => {
  const getFileIcon = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".jsx") || path.endsWith(".js")) {
      return <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
    if (path.endsWith(".json")) {
      return <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (path.endsWith(".html")) {
      return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="w-48 bg-[#090d16] border-r border-slate-800 flex flex-col h-full text-xs shrink-0 select-none">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
        <span>Files</span>
        {onAddFile && (
          <button
            onClick={onAddFile}
            title="Create new file"
            className="hover:text-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {files.map((file) => {
          const isActive = file.path === activeFilePath;
          return (
            <button
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {getFileIcon(file.path)}
              <span className="truncate">{file.path}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
