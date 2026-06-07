"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Command } from "cmdk";
import {
  Files,
  Search,
  Terminal,
  MessageSquare,
  Settings,
  File,
  FolderOpen,
  Save,
  Sparkles,
  X,
  Code,
  Maximize2,
  Bug,
  Globe,
} from "lucide-react";
import { useLayoutStore } from "@/stores/layoutStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useFileSystemStore } from "@/stores/fileSystemStore";
import { useAIStore } from "@/stores/aiStore";
import type { CommandPaletteItem } from "@/types";

interface CommandPaletteProps {
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const closePalette = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closePalette]);

  const items: CommandPaletteItem[] = [
    { id: "open-folder", label: "Open Folder", description: "Open a project folder", category: "Files", keywords: ["open", "folder", "directory", "project"], icon: "FolderOpen", action: () => { window.dispatchEvent(new CustomEvent("ide:open-folder")); closePalette(); } },
    { id: "save-file", label: "Save File", description: "Save the current file", category: "Files", shortcut: "\u2318S", keywords: ["save", "write", "persist"], icon: "Save", action: () => { window.dispatchEvent(new CustomEvent("ide:save-file")); closePalette(); } },
    { id: "close-file", label: "Close Current Tab", description: "Close the active file tab", category: "Files", shortcut: "\u2318W", keywords: ["close", "tab", "file"], icon: "X", action: () => { window.dispatchEvent(new CustomEvent("ide:close-tab")); closePalette(); } },
    { id: "close-all-tabs", label: "Close All Tabs", description: "Close all open file tabs", category: "Files", keywords: ["close", "all", "tabs", "files"], icon: "X", action: () => { useFileSystemStore.getState().closeAllTabs(); closePalette(); } },
    { id: "ai-chat", label: "Toggle AI Chat", description: "Open or close the AI chat panel", category: "AI Actions", shortcut: "\u2318L", keywords: ["ai", "chat", "assistant", "toggle"], icon: "MessageSquare", action: () => { useLayoutStore.getState().toggleAiSidebar(); closePalette(); } },
    { id: "inline-ai", label: "Inline AI Edit", description: "Edit code with AI inline", category: "AI Actions", shortcut: "\u2318K", keywords: ["inline", "ai", "edit", "code"], icon: "Sparkles", action: () => { window.dispatchEvent(new CustomEvent("ide:inline-ai")); closePalette(); } },
    { id: "ai-agent-mode", label: "Agent Mode", description: "Let AI autonomously modify files", category: "AI Actions", keywords: ["agent", "autonomous", "mode"], icon: "Bot", action: () => { useAIStore.getState().setMode("agent"); closePalette(); } },
    { id: "ai-review-mode", label: "Code Review Mode", description: "Review selected code with AI", category: "AI Actions", keywords: ["review", "code review", "audit"], icon: "Search", action: () => { useAIStore.getState().setMode("review"); closePalette(); } },
    { id: "ai-debug-mode", label: "Debug Mode", description: "Debug code with AI assistance", category: "AI Actions", keywords: ["debug", "fix", "error"], icon: "Bug", action: () => { useAIStore.getState().setMode("debug"); closePalette(); } },
    { id: "clear-chat", label: "Clear Chat History", description: "Clear all AI chat messages", category: "AI Actions", keywords: ["clear", "chat", "history", "reset"], icon: "X", action: () => { useAIStore.getState().clearMessages(); closePalette(); } },
    { id: "global-search", label: "Global Search", description: "Search across all files", category: "Editor", shortcut: "\u2318\u21E7F", keywords: ["search", "find", "global"], icon: "Search", action: () => { window.dispatchEvent(new CustomEvent("ide:global-search")); closePalette(); } },
    { id: "toggle-sidebar", label: "Toggle Sidebar", description: "Show or hide the file sidebar", category: "Editor", shortcut: "\u2318B", keywords: ["sidebar", "toggle", "panel"], icon: "Files", action: () => { useLayoutStore.getState().toggleSidebar(); closePalette(); } },
    { id: "toggle-terminal", label: "Toggle Terminal", description: "Open or close the terminal panel", category: "Editor", shortcut: "\u2318`", keywords: ["terminal", "console", "shell"], icon: "Terminal", action: () => { useTerminalStore.getState().toggleTerminal(); closePalette(); } },
    { id: "zen-mode", label: "Toggle Zen Mode", description: "Focus on code with minimal UI", category: "Editor", keywords: ["zen", "focus", "distraction", "fullscreen"], icon: "Maximize2", action: () => { useLayoutStore.getState().toggleZenMode(); closePalette(); } },
    { id: "focus-explorer", label: "Focus File Explorer", description: "Jump to the file explorer", category: "Editor", shortcut: "\u2318\u21E7E", keywords: ["explorer", "files", "focus"], icon: "Files", action: () => { window.dispatchEvent(new CustomEvent("ide:focus-explorer")); closePalette(); } },
    { id: "focus-ai", label: "Focus AI Panel", description: "Jump to the AI chat panel", category: "Editor", shortcut: "\u2318\u21E7G", keywords: ["ai", "focus", "chat"], icon: "MessageSquare", action: () => { window.dispatchEvent(new CustomEvent("ide:focus-ai")); closePalette(); } },
    { id: "preview", label: "Toggle Preview", description: "Open or close the live preview panel", category: "View", keywords: ["preview", "live", "html", "browser"], icon: "Globe", action: () => { window.dispatchEvent(new CustomEvent("ide:toggle-preview")); closePalette(); } },
    { id: "file-explorer", label: "Show File Explorer", description: "Switch sidebar to file explorer", category: "View", keywords: ["explorer", "files"], icon: "Files", action: () => { window.dispatchEvent(new CustomEvent("ide:sidebar-view", { detail: "explorer" })); closePalette(); } },
    { id: "search-view", label: "Show Search Panel", description: "Switch sidebar to search", category: "View", keywords: ["search", "find"], icon: "Search", action: () => { window.dispatchEvent(new CustomEvent("ide:sidebar-view", { detail: "search" })); closePalette(); } },
  ];

  const getIcon = (iconName?: string) => {
    const size = 16;
    switch (iconName) {
      case "FolderOpen": return <FolderOpen size={size} />;
      case "Save": return <Save size={size} />;
      case "X": return <X size={size} />;
      case "MessageSquare": return <MessageSquare size={size} />;
      case "Sparkles": return <Sparkles size={size} />;
      case "Search": return <Search size={size} />;
      case "Terminal": return <Terminal size={size} />;
      case "Files": return <Files size={size} />;
      case "Maximize2": return <Maximize2 size={size} />;
      case "Bug": return <Bug size={size} />;
      case "Globe": return <Globe size={size} />;
      case "Code": return <Code size={size} />;
      case "Settings": return <Settings size={size} />;
      case "File": return <File size={size} />;
      default: return <Code size={size} />;
    }
  };

  const groupedItems = items.reduce<Record<string, CommandPaletteItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = ["Files", "AI Actions", "Editor", "View"].filter(
    (cat) => groupedItems[cat] && groupedItems[cat].length > 0
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in"
      onClick={closePalette}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-[600px] max-w-[90vw] bg-ide-surface border border-ide-border rounded-xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Palette">
          <div className="flex items-center border-b border-ide-border px-4">
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Search commands..."
              className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder-ide-muted/50 outline-none"
            />
            <button
              onClick={closePalette}
              className="p-1 text-ide-muted hover:text-white rounded-md hover:bg-ide-hover transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-ide-muted">
              <div className="flex flex-col items-center gap-2">
                <Search size={20} className="text-ide-muted/50" />
                <span>No commands found for &quot;{search}&quot;</span>
              </div>
            </Command.Empty>

            {categories.map((category) => (
              <Command.Group
                key={category}
                heading={
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ide-muted px-2 py-1.5">
                    {category}
                  </span>
                }
              >
                {groupedItems[category]?.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.id + " " + item.label + " " + item.keywords.join(" ")}
                    onSelect={() => item.action()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 aria-selected:bg-ide-hover aria-selected:text-white cursor-pointer transition-colors group"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-md bg-ide-elevated border border-ide-border text-ide-muted group-aria-selected:text-ide-accent-light group-aria-selected:border-ide-accent/20 transition-colors">
                      {getIcon(item.icon)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-[10px] text-ide-muted truncate mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd className="flex-shrink-0 text-[10px] font-mono bg-ide-elevated border border-ide-border rounded px-1.5 py-0.5 text-ide-muted">
                        {item.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          <div className="border-t border-ide-border px-4 py-2 flex items-center justify-between text-[10px] text-ide-muted/50">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-ide-elevated border border-ide-border rounded px-1">\u2191\u2193</kbd> Navigate</span>
              <span><kbd className="font-mono bg-ide-elevated border border-ide-border rounded px-1">\u21B5</kbd> Select</span>
              <span><kbd className="font-mono bg-ide-elevated border border-ide-border rounded px-1">Esc</kbd> Close</span>
            </div>
            <span className="hidden sm:inline">{items.length} commands</span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
