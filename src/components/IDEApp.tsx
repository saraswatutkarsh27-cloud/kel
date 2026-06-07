"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  X,
  Save,
  Search,
  Files,
  Settings,
  MessageSquare,
  Bot,
  FolderOpen,
  Keyboard,
  Sparkles,
  Terminal,
  Globe,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Store imports
import { useFileSystemStore } from "@/stores/fileSystemStore";
import { useLayoutStore } from "@/stores/layoutStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useAIStore } from "@/stores/aiStore";
import { useKeyboardShortcuts, useShortcut } from "@/hooks/useKeyboardShortcuts";
import { getFilesRecursively } from "@/lib/fileSystem";
import type { VirtualFile } from "@/types";

// Dynamic imports for components that use browser APIs
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const TerminalPanel = dynamic(() => import("./TerminalPanel"), { ssr: false });
const StatusBar = dynamic(() => import("./StatusBar"), { ssr: false });
const LivePreview = dynamic(() => import("./LivePreview"), { ssr: false });
const AIPanel = dynamic(() => import("./AIPanel"), { ssr: false });
const InlineAI = dynamic(() => import("./InlineAI").then(mod => mod.InlineAI), { ssr: false });
const GlobalSearch = dynamic(() => import("./GlobalSearch").then(mod => mod.GlobalSearch), { ssr: false });
const FileExplorer = dynamic(() => import("./FileExplorer").then(mod => mod.FileExplorer), { ssr: false });
const MobileSidebarOverlay = dynamic(() => import("./MobileSidebarOverlay").then(mod => mod.MobileSidebarOverlay), { ssr: false });

const IDEApp: React.FC = () => {
  // ── Store State ─────────────────────────────────────────
  const { files, openTabs, activeFilePath, setFiles, setRootHandle, openFile, closeTab, setActiveFile, updateTabContent, markTabSaved } = useFileSystemStore();
  const { sidebarOpen, aiSidebarOpen, sidebarWidth, isMobile, zenMode, toggleSidebar, toggleAiSidebar } = useLayoutStore();
  const { isTerminalOpen, toggleTerminal, addSession, setActiveSession } = useTerminalStore();
  const { selectedProvider, providerConfigs, updateProviderConfig } = useAIStore();

  // ── Local State ─────────────────────────────────────────
  const [sidebarView, setSidebarView] = useState<"explorer" | "search" | "settings">("explorer");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [inlineAI, setInlineAI] = useState<{ visible: boolean; position: { top: number; left: number } }>({
    visible: false,
    position: { top: 0, left: 0 },
  });

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // ── Keyboard Shortcuts ──────────────────────────────────
  useKeyboardShortcuts();

  useShortcut("ide:command-palette", useCallback(() => setShowCommandPalette(true), []));
  useShortcut("ide:open-folder", useCallback(() => handleOpenFolder(), []));
  useShortcut("ide:inline-ai", useCallback(() => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      if (!position) return;
      const pos = editorRef.current.getScrolledVisiblePosition(position);
      const domNode = editorRef.current.getDomNode();
      if (domNode && pos) {
        const rect = domNode.getBoundingClientRect();
        setInlineAI({ visible: true, position: { top: rect.top + pos.top + 20, left: rect.left + pos.left } });
      }
    }
  }, []));
  useShortcut("ide:save-file", useCallback(() => handleSave(), []));
  useShortcut("ide:close-tab", useCallback(() => {
    if (activeFilePath) closeTab(activeFilePath);
  }, [activeFilePath, closeTab]));
  useShortcut("ide:sidebar-view", useCallback(() => {
    setSidebarView("explorer");
  }, []));
  useShortcut("ide:toggle-preview", useCallback(() => setShowPreview((p) => !p), []));
  // Apply code from AI via custom event (needs event.detail, so direct listener instead of useShortcut)
  useEffect(() => {
    const handler = (e: Event) => {
      const code = (e as CustomEvent).detail;
      if (!code || !editorRef.current || !monacoRef.current) return;
      const selection = editorRef.current.getSelection();
      const range = new monacoRef.current.Range(
        selection.startLineNumber, selection.startColumn,
        selection.endLineNumber, selection.endColumn
      );
      editorRef.current.executeEdits("ai-edit", [{
        identifier: { major: 1, minor: 1 },
        range,
        text: code,
        forceMoveMarkers: true,
      }]);
    };
    window.addEventListener("ide:apply-code", handler);
    return () => window.removeEventListener("ide:apply-code", handler);
  }, []);

  // ── File System Handlers ────────────────────────────────
  const handleOpenFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setRootHandle(handle);
      const files = await getFilesRecursively(handle);
      setFiles(files);
    } catch (err) {
      console.error("Directory access denied", err);
    }
  };

  const handleFileSelect = async (item: VirtualFile) => {
    openFile(item);
  };

  const handleSave = async () => {
    const activeTab = openTabs.find((t) => t.file.path === activeFilePath);
    if (activeTab && activeTab.isDirty) {
      markTabSaved(activeFilePath!);
      window.dispatchEvent(new CustomEvent("ide:file-saved", { detail: { path: activeFilePath, content: activeTab.content } }));
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath && value !== undefined) {
      updateTabContent(activeFilePath, value);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
    });

    // Inline AI shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const position = editor.getPosition();
      if (!position) return;
      const pos = editor.getScrolledVisiblePosition(position);
      const domNode = editor.getDomNode();
      if (domNode && pos) {
        const rect = domNode.getBoundingClientRect();
        setInlineAI({ visible: true, position: { top: rect.top + pos.top + 20, left: rect.left + pos.left } });
      }
    });
  };

  const handleInlineAISubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    setInlineAI({ ...inlineAI, visible: false });

    try {
      const apiKey = providerConfigs.gemini?.apiKey;
      if (!apiKey) return;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      const selectedText = editor.getModel().getValueInRange(selection);
      const activeFile = openTabs.find((t) => t.file.path === activeFilePath);

      const context = `Task: ${prompt}\n\nContext file: ${activeFile?.file.name || "unknown"}\n\nSelected Code:\n\`\`\`\n${selectedText}\n\`\`\`\n\nEntire File Content:\n\`\`\`\n${activeFile?.content || ""}\n\`\`\`\n\nInstructions: Return ONLY the code to replace the selection or the new code to insert. Do not provide markdown formatting unless it is part of the code. Just the raw code.`;

      const result = await model.generateContent(context);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```")) {
        text = text.replace(/^```\w+\n/, "").replace(/\n```$/, "");
      }

      const range = new monacoRef.current.Range(
        selection.startLineNumber, selection.startColumn,
        selection.endLineNumber, selection.endColumn
      );
      editor.executeEdits("ai-edit", [{
        identifier: { major: 1, minor: 1 },
        range,
        text,
        forceMoveMarkers: true,
      }]);
    } catch (e) {
      console.error("Inline AI error", e);
    }
  };

  const activeFile = openTabs.find((f) => f.file.path === activeFilePath);

  return (
    <div className={`flex flex-col h-screen bg-[#0d0d1a] text-gray-300 font-sans antialiased ${zenMode ? "overflow-hidden" : ""}`}>
      {/* ── Header ────────────────────────────────────────── */}
      <header className="h-11 flex items-center px-4 justify-between border-b border-[#1e1e3a] bg-[#12122a]/80 backdrop-blur-sm relative z-10 flex-shrink-0">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed]/30 to-transparent" />

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-shadow duration-300">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-white text-sm">
              KEL<span className="text-[#a78bfa]">IDE</span>
            </span>
          </div>

          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white px-2.5 py-1 rounded-md hover:bg-[#1e1e3a] transition-all duration-200"
          >
            <FolderOpen size={13} />
            Open Folder
          </button>

          <button
            onClick={handleSave}
            disabled={!activeFile?.isDirty}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all duration-200 ${
              activeFile?.isDirty
                ? "bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/20"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <Save size={13} />
            Save
            {activeFile?.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#1a1a3a] border border-[#1e1e3a] rounded-md px-2.5 py-1 text-[10px] text-gray-500">
            <Keyboard size={11} className="text-[#7c3aed]/60" />
            <span className="font-mono">⌘K</span>
            <span className="text-gray-600">Inline AI</span>
          </div>

          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white bg-[#1a1a3a] border border-[#1e1e3a] rounded-md px-2.5 py-1 transition-all duration-200 hover:border-[#7c3aed]/30"
          >
            <Search size={11} />
            <span className="font-mono">⌘⇧P</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Activity Bar ──────────────────────────────────── */}
        <div className="w-12 bg-[#12122a] border-r border-[#1e1e3a] flex flex-col items-center py-3 gap-1 flex-shrink-0">
          <ActivityIcon
            icon={<Files size={20} />}
            active={sidebarView === "explorer" && sidebarOpen}
            onClick={() => { setSidebarView("explorer"); if (!sidebarOpen) toggleSidebar(); }}
            tooltip="Explorer"
            shortcut="⌘B"
          />
          <ActivityIcon
            icon={<Search size={20} />}
            active={sidebarView === "search"}
            onClick={() => { setSidebarView("search"); if (!sidebarOpen) toggleSidebar(); }}
            tooltip="Search"
            shortcut="⌘⇧F"
          />

          {!zenMode && (
            <>
              <div className="flex-1" />
              <ActivityIcon
                icon={<Terminal size={20} />}
                active={isTerminalOpen}
                onClick={() => { if (!isTerminalOpen) addSession(); toggleTerminal(); }}
                tooltip="Terminal"
                shortcut="⌘`"
                accent={isTerminalOpen}
              />
              <ActivityIcon
                icon={<MessageSquare size={20} />}
                active={aiSidebarOpen}
                onClick={toggleAiSidebar}
                tooltip="AI Chat"
                shortcut="⌘L"
                accent={aiSidebarOpen}
              />
              <ActivityIcon
                icon={<Globe size={20} />}
                active={showPreview}
                onClick={() => setShowPreview(!showPreview)}
                tooltip="Live Preview"
              />
              <ActivityIcon
                icon={<Settings size={20} />}
                active={sidebarView === "settings"}
                onClick={() => { setSidebarView("settings"); if (!sidebarOpen) toggleSidebar(); }}
                tooltip="Settings"
              />
            </>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        {sidebarOpen && !zenMode && (
          <div
            className="bg-[#12122a] border-r border-[#1e1e3a] flex flex-col overflow-hidden animate-slide-in-left"
            style={{ width: sidebarWidth }}
          >
            {sidebarView === "explorer" && (
              <FileExplorer
                items={files}
                onFileSelect={(item: any) => handleFileSelect(item)}
                onOpenFolder={handleOpenFolder}
                rootHandle={null}
                activeFilePath={activeFilePath}
              />
            )}
            {sidebarView === "search" && (
              <GlobalSearch
                items={files}
                onResultClick={(item: any) => handleFileSelect(item)}
              />
            )}
            {sidebarView === "settings" && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1e1e3a] flex items-center gap-2">
                  <Settings size={13} />
                  Settings
                </div>
                <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Font Size</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="8" max="32"
                        value={fontSize}
                        onChange={(e) => { setFontSize(parseInt(e.target.value)); localStorage.setItem("editor_font_size", e.target.value); }}
                        className="flex-1 accent-[#7c3aed] h-1"
                      />
                      <span className="text-xs text-[#a78bfa] font-mono w-8 text-right">{fontSize}px</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Theme</label>
                    <select
                      value={editorTheme}
                      onChange={(e) => { setEditorTheme(e.target.value as any); localStorage.setItem("editor_theme", e.target.value); }}
                      className="bg-[#1a1a3a] border border-[#1e1e3a] p-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#7c3aed]/50 transition-colors cursor-pointer"
                    >
                      <option value="vs-dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">AI Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => useAIStore.getState().setProvider(e.target.value as any)}
                      className="bg-[#1a1a3a] border border-[#1e1e3a] p-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#7c3aed]/50 transition-colors cursor-pointer"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="claude">Claude</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Keyboard Shortcuts</label>
                    <div className="space-y-2">
                      <ShortcutRow keys="⌘K" action="Inline AI" />
                      <ShortcutRow keys="⌘L" action="Toggle AI Chat" />
                      <ShortcutRow keys="⌘S" action="Save File" />
                      <ShortcutRow keys="⌘B" action="Toggle Sidebar" />
                      <ShortcutRow keys="⌘`" action="Toggle Terminal" />
                      <ShortcutRow keys="⌘⇧P" action="Command Palette" />
                      <ShortcutRow keys="⌘⇧F" action="Global Search" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Editor Area ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d1a]">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex h-9 bg-[#12122a]/50 overflow-x-auto border-b border-[#1e1e3a] flex-shrink-0">
              {openTabs.map((tab) => (
                <div
                  key={tab.file.path}
                  onClick={() => setActiveFile(tab.file.path)}
                  className={`group flex items-center gap-2 px-3 text-xs border-r border-[#1e1e3a] cursor-pointer min-w-fit transition-all duration-150 ${
                    activeFilePath === tab.file.path
                      ? "bg-[#0d0d1a] text-white border-t-2 border-t-[#7c3aed]"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1e3a]/50"
                  }`}
                >
                  <span className="text-[10px] font-semibold">
                    {tab.file.name.split(".").pop()?.toUpperCase() || "TXT"}
                  </span>
                  <span className="max-w-[120px] truncate">{tab.file.name}</span>
                  {tab.isDirty ? (
                    <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeTab(tab.file.path); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#1e1e3a] transition-all duration-150"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 relative min-h-0">
            {activeFile ? (
              <Editor
                height="100%"
                theme={editorTheme}
                path={activeFile.file.path}
                defaultLanguage="typescript"
                language={activeFile.file.name.split(".").pop()}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  wordWrap: "on",
                  automaticLayout: true,
                  padding: { top: 10 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  renderWhitespace: "selection",
                  bracketPairColorization: { enabled: true },
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#7c3aed]/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#a78bfa]/10 border border-[#7c3aed]/20 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.15)] animate-pulse">
                    <Bot size={28} className="text-[#a78bfa]" />
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold text-white">
                      Welcome to <span className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">KEL IDE</span>
                    </h2>
                    <p className="text-sm text-gray-500 max-w-[280px]">
                      Open a folder to start coding with AI-powered assistance
                    </p>
                  </div>

                  <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#a78bfa] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FolderOpen size={15} />
                    Open Folder
                  </button>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <Keyboard size={11} />
                      <span><kbd className="text-[#7c3aed]/60 font-mono">⌘K</kbd> Inline AI</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <Keyboard size={11} />
                      <span><kbd className="text-[#7c3aed]/60 font-mono">⌘⇧P</kbd> Commands</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {inlineAI.visible && (
              <InlineAI
                onClose={() => setInlineAI({ ...inlineAI, visible: false })}
                onSubmit={handleInlineAISubmit}
                position={inlineAI.position}
              />
            )}
          </div>

          {/* Terminal Panel */}
          {!zenMode && <TerminalPanel />}

          {/* Status Bar */}
          {!zenMode && <StatusBar />}
        </div>

        {/* ── AI Sidebar ────────────────────────────────────── */}
        {aiSidebarOpen && !zenMode && (
          <AIPanel />
        )}

        {/* ── Live Preview ──────────────────────────────────── */}
        {showPreview && !zenMode && (
          <LivePreview onClose={() => setShowPreview(false)} />
        )}
      </div>

      {/* ── Command Palette Overlay ─────────────────────────── */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}

      {/* ── Mobile Sidebar Overlay ──────────────────────────── */}
      {isMobile && sidebarOpen && (
        <MobileSidebarOverlay onClose={() => toggleSidebar()}>
          <FileExplorer
            items={files}
            onFileSelect={(item: any) => { handleFileSelect(item); if (isMobile) toggleSidebar(); }}
            onOpenFolder={handleOpenFolder}
            rootHandle={null}
            activeFilePath={activeFilePath}
          />
        </MobileSidebarOverlay>
      )}
    </div>
  );
};

/* ── Activity Bar Icon ────────────────────────────────────── */
const ActivityIcon: React.FC<{
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip: string;
  shortcut?: string;
  accent?: boolean;
}> = ({ icon, active, onClick, tooltip, shortcut, accent }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
        active
          ? "text-white bg-[#1e1e3a]"
          : accent
            ? "text-[#a78bfa] hover:text-white hover:bg-[#1e1e3a]/50"
            : "text-gray-500 hover:text-white hover:bg-[#1e1e3a]/50"
      }`}
    >
      {icon}
    </button>
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#7c3aed] rounded-r-full" />
    )}
    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1a1a3a] border border-[#1e1e3a] rounded-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
      <div>{tooltip}</div>
      {shortcut && <div className="text-[8px] text-gray-500 mt-0.5 font-mono">{shortcut}</div>}
    </div>
  </div>
);

/* ── Shortcut Row ─────────────────────────────────────────── */
const ShortcutRow: React.FC<{ keys: string; action: string }> = ({ keys, action }) => (
  <div className="flex items-center justify-between text-[11px]">
    <span className="text-gray-500">{action}</span>
    <kbd className="bg-[#1a1a3a] border border-[#1e1e3a] rounded px-1.5 py-0.5 font-mono text-[10px] text-[#a78bfa]">
      {keys}
    </kbd>
  </div>
);

export default IDEApp;
