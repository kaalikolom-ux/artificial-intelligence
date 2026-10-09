import React, { useState } from "react";
import { Header } from "./components/Header";
import { ChatSidebar } from "./components/ChatSidebar";
import { FileTree } from "./components/FileTree";
import { EditorPanel } from "./components/EditorPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { ExportModal } from "./components/ExportModal";
import { SettingsModal } from "./components/SettingsModal";
import { useProject } from "./hooks/useProject";

export function App() {
  const {
    project,
    files,
    activeFile,
    activeFilePath,
    setActiveFilePath,
    messages,
    user,
    isLoading,
    isSaving,
    updateFileContent,
    saveFilesToD1,
    sendMessage,
  } = useProject();

  const [activeTab, setActiveTab] = useState<"preview" | "code" | "split">("split");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        project={project}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSaving={isSaving}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left AI Chat Panel */}
        <ChatSidebar
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />

        {/* Right Workspace (Split / Code / Preview) */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "split" && (
            <>
              <FileTree
                files={files}
                activeFilePath={activeFilePath}
                onSelectFile={setActiveFilePath}
              />
              <div className="w-1/2 flex h-full border-r border-slate-800">
                <EditorPanel
                  activeFile={activeFile}
                  onContentChange={updateFileContent}
                  onSave={saveFilesToD1}
                />
              </div>
              <div className="w-1/2 flex h-full">
                <PreviewPanel files={files} />
              </div>
            </>
          )}

          {activeTab === "code" && (
            <>
              <FileTree
                files={files}
                activeFilePath={activeFilePath}
                onSelectFile={setActiveFilePath}
              />
              <div className="flex-1 flex h-full">
                <EditorPanel
                  activeFile={activeFile}
                  onContentChange={updateFileContent}
                  onSave={saveFilesToD1}
                />
              </div>
            </>
          )}

          {activeTab === "preview" && (
            <div className="flex-1 flex h-full">
              <PreviewPanel files={files} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        user={user}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
