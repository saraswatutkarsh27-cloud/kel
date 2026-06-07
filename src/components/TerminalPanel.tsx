"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { X, Plus, ChevronDown } from "lucide-react";
import { useTerminalStore } from "@/stores/terminalStore";
import { wsClient } from "@/lib/ws-client";

import "@xterm/xterm/css/xterm.css";

export const TerminalPanel: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    isTerminalOpen,
    terminalHeight,
    addSession,
    removeSession,
    setActiveSession,
    toggleTerminal,
    setTerminalHeight,
  } = useTerminalStore();

  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const terminalInstances = useRef<Map<string, Terminal>>(new Map());
  const fitAddons = useRef<Map<string, FitAddon>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const initTerminal = useCallback((sessionId: string) => {
    const container = terminalRefs.current.get(sessionId);
    if (!container || terminalInstances.current.has(sessionId)) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      theme: {
        background: "#1a1a2e",
        foreground: "#e0e0e0",
        cursor: "#7c3aed",
        cursorAccent: "#1a1a2e",
        selectionBackground: "#7c3aed40",
        black: "#1a1b2e",
        red: "#f87171",
        green: "#34d399",
        yellow: "#fbbf24",
        blue: "#60a5fa",
        magenta: "#a78bfa",
        cyan: "#22d3ee",
        white: "#e0e0e0",
        brightBlack: "#6b7280",
        brightRed: "#fca5a5",
        brightGreen: "#6ee7b7",
        brightYellow: "#fde68a",
        brightBlue: "#93c5fd",
        brightMagenta: "#c4b5fd",
        brightCyan: "#67e8f9",
        brightWhite: "#ffffff",
      },
      allowProposedApi: true,
      allowTransparency: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    fitAddons.current.set(sessionId, fitAddon);

    term.open(container);

    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {}
    }, 50);

    term.onData((data) => {
      wsClient.sendInput(data);
    });

    term.onResize(({ cols, rows }) => {
      useTerminalStore.getState().resizeSession(sessionId, cols, rows);
      wsClient.sendResize(cols, rows);
    });

    terminalInstances.current.set(sessionId, term);

    wsClient.connect(sessionId).catch(() => {
      term.writeln("\r\n\x1b[33m\u26a0 WebSocket server not available.\x1b[0m");
      term.writeln("\x1b[33m  Start the server with: npm run server\x1b[0m");
      term.write("\r\n$ ");
    });

    wsClient.onMessage((data: any) => {
      if (data.type === "output" && data.sessionId === sessionId) {
        term.write(data.data);
      }
      if (data.type === "error" && data.sessionId === sessionId) {
        term.writeln(`\r\n\x1b[31mError: ${data.message}\x1b[0m`);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      terminalInstances.current.forEach((term) => {
        term.dispose();
      });
      terminalInstances.current.clear();
      fitAddons.current.clear();
    };
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      setTimeout(() => initTerminal(activeSessionId), 100);
    }
  }, [activeSessionId, initTerminal]);

  useEffect(() => {
    if (!activeSessionId) return;
    const container = terminalRefs.current.get(activeSessionId);
    if (!container) return;
    resizeObserverRef.current = new ResizeObserver(() => {
      const fitAddon = fitAddons.current.get(activeSessionId);
      if (fitAddon) {
        try { fitAddon.fit(); } catch {}
      }
    });
    resizeObserverRef.current.observe(container);
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [activeSessionId]);

  useEffect(() => {
    if (activeSessionId) {
      setTimeout(() => {
        const fitAddon = fitAddons.current.get(activeSessionId);
        if (fitAddon) {
          try { fitAddon.fit(); } catch {}
        }
      }, 100);
    }
  }, [terminalHeight, activeSessionId]);

  const handleAddSession = () => {
    const id = addSession();
    setActiveSession(id);
    setTimeout(() => initTerminal(id), 150);
  };

  const handleRemoveSession = (id: string) => {
    const term = terminalInstances.current.get(id);
    if (term) {
      term.dispose();
      terminalInstances.current.delete(id);
    }
    fitAddons.current.delete(id);
    removeSession(id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      setTerminalHeight(startHeight + delta);
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!isTerminalOpen) return null;

  return (
    <div
      className="flex flex-col bg-ide-surface border-t border-ide-border"
      style={{ height: terminalHeight }}
    >
      <div
        className="h-1.5 cursor-ns-resize hover:bg-ide-accent/30 active:bg-ide-accent/50 transition-colors flex-shrink-0 relative group"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-full w-16 mx-auto bg-ide-accent/20 rounded-full" />
        </div>
      </div>

      <div className="flex items-center h-8 px-2 bg-ide-elevated/50 border-b border-ide-border gap-0.5 flex-shrink-0">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => setActiveSession(session.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-t transition-all duration-150 ${
              session.id === activeSessionId
                ? "bg-ide-surface text-white border-t border-ide-accent"
                : "text-ide-muted hover:text-white hover:bg-ide-hover/50"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                session.status === "connected"
                  ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]"
                  : session.status === "connecting"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="truncate max-w-[100px]">{session.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSession(session.id);
              }}
              className="p-0.5 rounded opacity-0 hover:opacity-100 hover:bg-ide-hover transition-all duration-150 text-ide-muted hover:text-white"
            >
              <X size={10} />
            </button>
          </button>
        ))}
        <button
          onClick={handleAddSession}
          className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-150 ml-1"
          title="New Terminal"
        >
          <Plus size={12} />
        </button>
        <div className="flex-1" />
        <button
          onClick={toggleTerminal}
          className="p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-150"
          title="Close Terminal"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex-1 relative min-h-0">
        {sessions.map((session) => (
          <div
            key={session.id}
            ref={(el) => {
              if (el) terminalRefs.current.set(session.id, el);
            }}
            className={`absolute inset-0 ${
              session.id === activeSessionId ? "z-10" : "z-0 opacity-0 pointer-events-none"
            }`}
          />
        ))}
        {sessions.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-ide-muted">
            <div className="flex flex-col items-center gap-3">
              <Terminal size={24} className="text-ide-muted/30" />
              <span>No terminals open</span>
              <button
                onClick={handleAddSession}
                className="flex items-center gap-1.5 text-xs text-ide-accent-light hover:text-white px-3 py-1.5 rounded-lg border border-ide-accent/20 hover:bg-ide-accent/10 transition-all duration-200"
              >
                <Plus size={12} />
                New Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPanel;
