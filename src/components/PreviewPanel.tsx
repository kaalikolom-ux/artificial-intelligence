import React, { useState } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { ProjectFile } from "../lib/types";

interface PreviewPanelProps {
  files: ProjectFile[];
}

function RefreshButton() {
  const { sandpack } = useSandpack();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    sandpack.runSandpack();
    setTimeout(() => setSpinning(false), 500);
  };

  return (
    <button
      onClick={handleRefresh}
      title="Reload Preview"
      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
    </button>
  );
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ files }) => {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Transform project files into Sandpack files object format
  const sandpackFiles: Record<string, string> = {};
  for (const f of files) {
    const formattedPath = f.path.startsWith("/") ? f.path : `/${f.path}`;
    sandpackFiles[formattedPath] = f.content;
  }

  // Ensure index.html and basic Vite setup exists
  if (!sandpackFiles["/public/index.html"] && sandpackFiles["/index.html"]) {
    sandpackFiles["/public/index.html"] = sandpackFiles["/index.html"];
  }

  const getContainerWidth = () => {
    switch (deviceMode) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a12] border-l border-slate-800 overflow-hidden">
      <SandpackProvider
        template="vite-react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: {
            "lucide-react": "^0.344.0",
            clsx: "^2.1.1",
          },
        }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 300,
        }}
      >
        {/* Browser Top Bar */}
        <div className="h-10 border-b border-slate-800 bg-[#0a0e1a] px-3 flex items-center justify-between text-xs select-none">
          {/* Simulated address bar */}
          <div className="flex items-center gap-2">
            <RefreshButton />
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-md text-[11px] text-slate-400 font-mono flex items-center gap-1.5 min-w-[200px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>localhost:3000</span>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={`p-1 rounded ${
                deviceMode === "desktop"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode("tablet")}
              className={`p-1 rounded ${
                deviceMode === "tablet"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`p-1 rounded ${
                deviceMode === "mobile"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sandpack Preview Container */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
          <div
            className={`h-full transition-all duration-300 rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 ${getContainerWidth()}`}
          >
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};
