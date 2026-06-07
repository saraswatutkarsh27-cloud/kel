/* ── File System Types ──────────────────────────────────── */

export interface VirtualFile {
  path: string;
  name: string;
  type: "file" | "directory";
  content?: string;
  language?: string;
  isDirty: boolean;
  children?: VirtualFile[];
}

export interface FileSearchResult {
  path: string;
  name: string;
  line: number;
  content: string;
  matchStart?: number;
  matchEnd?: number;
}

/* ── Open File / Tab Types ──────────────────────────────── */

export interface OpenTab {
  file: VirtualFile;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

/* ── AI Types ───────────────────────────────────────────── */

export type AIProvider = "gemini" | "claude" | "openai";

export type AIMode = "chat" | "agent" | "review" | "debug";

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "completed" | "error";
}

export interface AgentPlan {
  id: string;
  title: string;
  status: "waiting" | "in_progress" | "completed" | "error";
  steps: AgentStep[];
}

export interface AgentStep {
  id: string;
  description: string;
  status: "waiting" | "in_progress" | "completed" | "error";
  toolCall?: ToolCall;
  result?: string;
}

export type AIStreamChunk =
  | { type: "text"; content: string }
  | { type: "tool_call"; tool: ToolCall }
  | { type: "tool_result"; toolCallId: string; result: unknown }
  | { type: "plan_step"; step: AgentStep }
  | { type: "done" }
  | { type: "error"; message: string };

/* ── Terminal Types ─────────────────────────────────────── */

export type TerminalSessionStatus = "connecting" | "connected" | "disconnected";

export interface TerminalSession {
  id: string;
  title: string;
  status: TerminalSessionStatus;
  cols: number;
  rows: number;
  buffer: string;
  createdAt: number;
}

export interface TerminalMessage {
  type: "input" | "output" | "resize" | "command" | "error" | "exit";
  sessionId: string;
  data?: string;
  cols?: number;
  rows?: number;
  exitCode?: number;
}

/* ── WebSocket Types ────────────────────────────────────── */

export interface WSConnectMessage {
  type: "connect";
  sessionId?: string;
  cols?: number;
  rows?: number;
}

export type WSMessage =
  | { type: "input"; sessionId: string; data: string }
  | { type: "output"; sessionId: string; data: string }
  | { type: "resize"; sessionId: string; cols: number; rows: number }
  | { type: "command"; sessionId: string; data: string }
  | { type: "exit"; sessionId: string; exitCode: number }
  | { type: "error"; sessionId: string; message: string }
  | { type: "session_created"; sessionId: string }
  | { type: "session_closed"; sessionId: string };

/* ── Review Types ───────────────────────────────────────── */

export interface CodeReview {
  summary: string;
  issues: CodeReviewIssue[];
  score: number;
}

export interface CodeReviewIssue {
  severity: "critical" | "high" | "medium" | "low" | "info";
  file: string;
  line?: number;
  title: string;
  description: string;
  suggestion?: string;
}

/* ── Command Palette Types ──────────────────────────────── */

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  category: "Files" | "AI Actions" | "Editor" | "Terminal" | "View";
  shortcut?: string;
  keywords: string[];
  icon?: string;
  action: () => void;
}

/* ── AI Provider Config ─────────────────────────────────── */

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  label: string;
}

/* ── Layout Types ───────────────────────────────────────── */

export type SidebarView = "explorer" | "search" | "source-control" | "extensions" | "settings";
