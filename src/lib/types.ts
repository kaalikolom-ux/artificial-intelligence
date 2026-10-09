export interface ProjectFile {
  path: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  githubRepo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  hasGithubToken: boolean;
}
