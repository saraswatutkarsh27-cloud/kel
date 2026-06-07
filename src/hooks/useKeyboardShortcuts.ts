"use client";

import { useEffect } from "react";
import { useLayoutStore } from "@/stores/layoutStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useFileSystemStore } from "@/stores/fileSystemStore";
import { useAIStore } from "@/stores/aiStore";

export type ShortcutHandler = () => void;

export interface ShortcutRegistry {
  [key: string]: ShortcutHandler;
}

/**
 * Global keyboard shortcut hook.
 * Registers all IDE keyboard shortcuts.
 */
export function useKeyboardShortcuts(customShortcuts?: ShortcutRegistry): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Custom shortcuts take priority
      if (customShortcuts) {
        const customKey = getKeyCombo(isCtrlOrCmd, isShift, e.altKey, key);
        if (customShortcuts[customKey]) {
          e.preventDefault();
          customShortcuts[customKey]();
          return;
        }
      }

      // Escape closes overlays (handled by individual components)
      if (key === "escape") {
        // Dispatch a custom event that overlays can listen to
        window.dispatchEvent(new CustomEvent("ide:close-overlay"));
        return;
      }

      // Ctrl/Cmd + shortcuts
      if (isCtrlOrCmd && !isShift && !e.altKey) {
        switch (key) {
          case "`": // Toggle terminal
            e.preventDefault();
            useTerminalStore.getState().toggleTerminal();
            break;
          case "b": // Toggle sidebar
            e.preventDefault();
            useLayoutStore.getState().toggleSidebar();
            break;
          case "s": // Save
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:save-file"));
            break;
          case "w": // Close tab
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:close-tab"));
            break;
          case "tab": // Next tab
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:next-tab"));
            break;
          case "k": // Inline AI
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:inline-ai"));
            break;
        }
      }

      // Ctrl/Cmd + Shift + shortcuts
      if (isCtrlOrCmd && isShift && !e.altKey) {
        switch (key) {
          case "p": // Command palette
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:command-palette"));
            break;
          case "e": // Focus file explorer
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:focus-explorer"));
            break;
          case "g": // Focus AI panel
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:focus-ai"));
            break;
          case "tab": // Previous tab
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:prev-tab"));
            break;
          case "f": // Global search
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ide:global-search"));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customShortcuts]);
}

function getKeyCombo(ctrl: boolean, shift: boolean, alt: boolean, key: string): string {
  const parts: string[] = [];
  if (ctrl) parts.push("ctrl");
  if (shift) parts.push("shift");
  if (alt) parts.push("alt");
  parts.push(key);
  return parts.join("+");
}

// Also expose a simpler version for inline use
export function useShortcut(key: string, handler: () => void): void {
  useEffect(() => {
    const onEvent = () => handler();
    window.addEventListener(key, onEvent);
    return () => window.removeEventListener(key, onEvent);
  }, [key, handler]);
}
