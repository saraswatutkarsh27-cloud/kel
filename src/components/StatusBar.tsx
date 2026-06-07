"use client";

import React from "react";
import {
  GitBranch,
  Sparkles,
  Terminal,
  Loader2,
} from "lucide-react";
import { useFileSystemStore } from "@/stores/fileSystemStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useAIStore } from "@/stores/aiStore";
import { useLayoutStore } from "@/stores/layoutStore";

export const StatusBar: React.FC = () => {
  const { activeFilePath, openTabs } = useFileSystemStore();
  const { sessions, isTerminalOpen, toggleTerminal } = useTerminalStore();
  const { isStreaming, selectedProvider, mode } = useAIStore();
  const { zenMode } = useLayoutStore();

  const activeTab = openTabs.find((t) => t.file.path === activeFilePath);
  const activeSessionCount = sessions.filter(
    (s) => s.status === "connected"
  ).length;
  const hasActiveTerminal = activeSessionCount > 0;

  const getLanguageLabel = (path?: string | null): string => {
    if (!path) return "PLAIN TEXT";
    const ext = path.split(".").pop()?.toUpperCase() || "TXT";
    const extMap: Record<string, string> = {
      TS: "TypeScript",
      TSX: "TSX",
      JS: "JavaScript",
      JSX: "JSX",
      CSS: "CSS",
      HTML: "HTML",
      JSON: "JSON",
      MD: "Markdown",
      PY: "Python",
      RS: "Rust",
      GO: "Go",
      JAVA: "Java",
      RB: "Ruby",
      PHP: "PHP",
      C: "C",
      CPP: "C++",
      H: "C Header",
      YML: "YAML",
      YAML: "YAML",
      TOML: "TOML",
      XML: "XML",
      SQL: "SQL",
      SH: "Shell",
      BASH: "Shell",
      ZSH: "Shell",
      LOCK: "",
    };
    return extMap[ext] || ext;
  };

  const modeLabel: Record<string, string> = {
    chat: "Chat",
    agent: "Agent",
    review: "Review",
    debug: "Debug",
  };

  if (zenMode) return null;

  return (
    <div className="h-6 bg-[#0d0d1a] border-t border-ide-border/50 text-[10px] flex items-center px-3 justify-between select-none flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {activeFilePath && (
          <span
            className="text-gray-400 truncate max-w-[300px] hover:text-white transition-colors cursor-default"
            title={activeFilePath}
          >
            {activeFilePath}
          </span>
        )}
        {activeTab && (
          <span className="font-mono text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 hidden sm:inline">
            {getLanguageLabel(activeFilePath)}
          </span>
        )}
        {activeTab?.isDirty && (
          <span className="flex items-center gap-1 text-yellow-400/70">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Unsaved
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors cursor-default">
          <GitBranch size={10} />
          <span className="hidden sm:inline">main</span>
        </div>

        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1 transition-colors ${
            isTerminalOpen
              ? "text-ide-accent-light hover:text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          title="Toggle Terminal"
        >
          <Terminal size={10} />
          {hasActiveTerminal && (
            <span className="hidden sm:inline">{activeSessionCount}</span>
          )}
        </button>

        <div
          className={`flex items-center gap-1 transition-colors ${
            isStreaming
              ? "text-ide-accent-light"
              : "text-gray-500 hover:text-gray-300"
          }`}
          title={`AI Mode: ${modeLabel[mode] || "Chat"} \u2014 ${selectedProvider}`}
        >
          {isStreaming ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Sparkles size={10} />
          )}
          <span className="hidden sm:inline">
            {isStreaming ? "Thinking..." : modeLabel[mode] || "Chat"}
          </span>
        </div>

        <span className="font-mono text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 hidden md:inline">
          {selectedProvider}
        </span>

        <span className="text-gray-500 hidden lg:inline">UTF-8</span>
      </div>
    </div>
  );
};

export default StatusBar;
