import { useState, useEffect, useCallback } from "react";
import { Project, ProjectFile, ChatMessage, User } from "../lib/types";
import { DEFAULT_PROJECT_FILES } from "../lib/defaultTemplate";

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>(DEFAULT_PROJECT_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>("src/App.tsx");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("lovable_selected_model") || "cf-deepseek-r1";
  });

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("lovable_selected_model", modelId);
  };

  // 1. Load initial user and project (or create one in D1)
  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        const projRes = await fetch("/api/projects");
        if (projRes.ok) {
          const data = await projRes.json();
          if (data.projects && data.projects.length > 0) {
            loadProject(data.projects[0].id);
          } else {
            createProject("My Lovable App");
          }
        }
      } catch (err) {
        console.error("Init project error:", err);
      }
    }

    init();
  }, []);

  const createProject = async (title: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        loadProject(data.id);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const loadProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
        }
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const updateFileContent = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === activeFilePath ? { ...f, content: newContent } : f))
    );
  };

  const saveFilesToD1 = useCallback(async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${project.id}/files`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
    } catch (err) {
      console.error("Error saving files to D1:", err);
    } finally {
      setIsSaving(false);
    }
  }, [project, files]);

  const sendMessage = async (prompt: string) => {
    if (!project) return;
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Retrieve API key relevant to the selected model if needed
    let key = "";
    if (selectedModel === "claude-3-5-sonnet") {
      key = localStorage.getItem("lovable_anthropic_key") || "";
    } else if (selectedModel === "kimi-3") {
      key = localStorage.getItem("lovable_kimi_key") || "";
    } else if (selectedModel.includes("gemini")) {
      key = localStorage.getItem("lovable_gemini_key") || "";
    } else if (selectedModel.includes("openrouter")) {
      key = localStorage.getItem("lovable_openrouter_key") || "";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          prompt,
          model: selectedModel,
          userApiKey: key || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process AI response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `local_res_${Date.now()}`,
          role: "assistant",
          content: data.reply,
        },
      ]);

      if (data.filesUpdated && data.filesUpdated.length > 0) {
        setFiles((prev) => {
          const map = new Map(prev.map((f) => [f.path, f]));
          for (const upd of data.filesUpdated) {
            map.set(upd.path, upd);
          }
          return Array.from(map.values());
        });

        if (data.filesUpdated[0]?.path) {
          setActiveFilePath(data.filesUpdated[0].path);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local_err_${Date.now()}`,
          role: "assistant",
          content: `⚠️ Error: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  return {
    project,
    files,
    activeFile,
    activeFilePath,
    setActiveFilePath,
    messages,
    user,
    isLoading,
    isSaving,
    selectedModel,
    handleSelectModel,
    updateFileContent,
    saveFilesToD1,
    sendMessage,
    createProject,
  };
}
