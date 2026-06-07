"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, Globe, RefreshCw, Maximize2, ExternalLink } from "lucide-react";
import { useFileSystemStore } from "@/stores/fileSystemStore";

interface LivePreviewProps {
  onClose: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { activeFilePath, openTabs } = useFileSystemStore();

  const activeTab = openTabs.find((t) => t.file.path === activeFilePath);

  const isPreviewable = useCallback(() => {
    if (!activeFilePath) return false;
    const ext = activeFilePath.split(".").pop()?.toLowerCase() || "";
    return ["html", "htm", "svg", "md"].includes(ext);
  }, [activeFilePath]);

  const getPreviewContent = useCallback(() => {
    if (!activeTab) return "<html><body><p>No file selected</p></body></html>";
    const ext = activeTab.file.path.split(".").pop()?.toLowerCase() || "";

    if (ext === "html" || ext === "htm") {
      return activeTab.content;
    }

    if (ext === "md") {
      const html = activeTab.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>");

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #e0e0e0; background: #1a1a2e; }
        h1, h2, h3 { color: #fff; } code { background: #2a2a4e; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
        pre { background: #2a2a4e; padding: 16px; border-radius: 8px; overflow-x: auto; }
        li { margin: 4px 0; } a { color: #7c3aed; }
      </style></head><body><p>${html}</p></body></html>`;
    }

    if (ext === "svg") {
      return activeTab.content;
    }

    return "<html><body><p>Preview not available for this file type</p></body></html>";
  }, [activeTab]);

  useEffect(() => {
    if (!autoRefresh || !iframeRef.current) return;
    if (!isPreviewable()) return;

    const content = getPreviewContent();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    return () => URL.revokeObjectURL(url);
  }, [activeTab?.content, refreshKey, activeFilePath, getPreviewContent, isPreviewable, autoRefresh]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    if (!iframeRef.current?.src) return;
    window.open(iframeRef.current.src, "_blank");
  };

  if (!isPreviewable()) return null;

  return (
    <div
      className={`flex flex-col bg-ide-surface border-l border-ide-border ${
        isFullscreen ? "fixed inset-0 z-50" : "w-[400px]"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-ide-border bg-ide-surface/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Globe size={10} className="text-white" />
          </div>
          <span className="text-[11px] font-medium text-white">Preview</span>
        </div>

        <div className="flex items-center gap-1">
          {previewUrl && (
            <input
              type="text"
              value={previewUrl}
              readOnly
              className="w-[180px] bg-ide-elevated border border-ide-border rounded px-2 py-0.5 text-[9px] font-mono text-ide-muted outline-none"
            />
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded transition-all duration-200 ${
              autoRefresh
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-ide-muted hover:text-white hover:bg-ide-hover"
            }`}
            title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
          >
            <RefreshCw size={11} className={autoRefresh ? "" : "opacity-50"} />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw size={11} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={11} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200"
            title="Open in browser"
          >
            <ExternalLink size={11} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200"
            title="Close preview"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white min-h-0">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin"
          title="Live Preview"
        />
        {!activeTab && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-center text-ide-muted">
              <Globe size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Open an HTML file to preview</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-5 flex items-center px-3 border-t border-ide-border text-[9px] text-ide-muted/50">
        <span>
          {autoRefresh ? "Auto-refresh" : "Manual refresh"} \u00b7{" "}
          {activeTab?.file.name || "No file"}
        </span>
      </div>
    </div>
  );
};

export default LivePreview;
