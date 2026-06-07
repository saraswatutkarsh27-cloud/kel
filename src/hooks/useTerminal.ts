"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useTerminalStore } from "@/stores/terminalStore";
import { wsClient } from "@/lib/ws-client";

import "@xterm/xterm/css/xterm.css";

interface UseTerminalOptions {
  sessionId?: string;
  theme?: {
    background?: string;
    foreground?: string;
    cursor?: string;
    cursorAccent?: string;
    selectionBackground?: string;
    black?: string;
    red?: string;
    green?: string;
    yellow?: string;
    blue?: string;
    magenta?: string;
    cyan?: string;
    white?: string;
    brightBlack?: string;
    brightRed?: string;
    brightGreen?: string;
    brightYellow?: string;
    brightBlue?: string;
    brightMagenta?: string;
    brightCyan?: string;
    brightWhite?: string;
  };
}

const defaultTheme = {
  background: "#0d0f12",
  foreground: "#e8eaf0",
  cursor: "#4fc3f7",
  cursorAccent: "#0d0f12",
  selectionBackground: "rgba(79, 195, 247, 0.3)",
  black: "#1a1d24",
  red: "#f07178",
  green: "#c3e88d",
  yellow: "#ffcc80",
  blue: "#82aaff",
  magenta: "#c792ea",
  cyan: "#89ddff",
  white: "#e8eaf0",
  brightBlack: "#4a5068",
  brightRed: "#f07178",
  brightGreen: "#c3e88d",
  brightYellow: "#ffcc80",
  brightBlue: "#82aaff",
  brightMagenta: "#c792ea",
  brightCyan: "#89ddff",
  brightWhite: "#ffffff",
};

/**
 * Hook to integrate xterm.js with the WebSocket terminal client.
 * Handles terminal lifecycle, resize, and data piping.
 */
export function useTerminal(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseTerminalOptions = {}
) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const webLinksAddonRef = useRef<WebLinksAddon | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const store = useTerminalStore();

  const initTerminal = useCallback(() => {
    if (!containerRef.current || terminalRef.current) return;

    const term = new Terminal({
      cols: 80,
      rows: 24,
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Geist Mono', 'Fira Code', monospace",
      lineHeight: 1.6,
      allowTransparency: false,
      theme: { ...defaultTheme, ...options.theme },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);

    // Fit terminal to container
    setTimeout(() => fitAddon.fit(), 50);

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;
    webLinksAddonRef.current = webLinksAddon;

    // Handle user input -> WebSocket
    term.onData((data: string) => {
      wsClient.sendInput(data);
    });

    // Store terminal size for resize events
    const updateSize = () => {
      if (fitAddon && term) {
        fitAddon.fit();
        const dims = term;
        const cols = dims.cols;
        const rows = dims.rows;
        if (sessionIdRef.current) {
          store.resizeSession(sessionIdRef.current, cols, rows);
          wsClient.sendResize(cols, rows);
        }
      }
    };

    // Observe container resize
    if (containerRef.current) {
      const observer = new ResizeObserver(() => {
        updateSize();
      });
      observer.observe(containerRef.current);
      resizeObserverRef.current = observer;
    }

    // Handle resize via window resize
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [containerRef, options.theme, store]);

  /**
   * Connect to the backend terminal via WebSocket.
   */
  const connect = useCallback(
    async (sessionId?: string): Promise<string> => {
      initTerminal();

      const id = sessionId || store.activeSessionId;
      if (!id) return "";

      sessionIdRef.current = id;

      try {
        await wsClient.connect(id);

        // Pipe WebSocket output -> xterm.js
        wsClient.onMessage((data: any) => {
          if (data.type === "output" && data.sessionId === id) {
            terminalRef.current?.write(data.data);
          }
        });

        return id;
      } catch (err) {
        console.error("Terminal connection failed:", err);
        terminalRef.current?.writeln(
          `\x1b[31mFailed to connect to terminal backend.\x1b[0m`
        );
        return "";
      }
    },
    [initTerminal, store.activeSessionId]
  );

  /**
   * Write text directly to the terminal (e.g., for AI commands).
   */
  const write = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  /**
   * Write a line to the terminal.
   */
  const writeln = useCallback((data: string) => {
    terminalRef.current?.writeln(data);
  }, []);

  /**
   * Clear the terminal.
   */
  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  /**
   * Fit the terminal to its container.
   */
  const fit = useCallback(() => {
    fitAddonRef.current?.fit();
  }, []);

  /**
   * Disconnect and destroy the terminal.
   */
  const disconnect = useCallback(() => {
    wsClient.disconnect();
    sessionIdRef.current = null;
  }, []);

  /**
   * Send an AI command to the terminal (displayed in amber).
   */
  const sendAICommand = useCallback((command: string) => {
    wsClient.sendAICommand(command);
    terminalRef.current?.writeln(`\x1b[33m$ ${command}\x1b[0m`);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      terminalRef.current?.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  return {
    terminal: terminalRef.current,
    connect,
    write,
    writeln,
    clear,
    fit,
    disconnect,
    sendAICommand,
  };
}
