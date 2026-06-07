import { create } from "zustand";
import type { TerminalSession, TerminalSessionStatus } from "@/types";

interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isTerminalOpen: boolean;
  terminalHeight: number;

  addSession: () => string;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  updateSessionStatus: (id: string, status: TerminalSessionStatus) => void;
  appendToBuffer: (id: string, data: string) => void;
  clearBuffer: (id: string) => void;
  resizeSession: (id: string, cols: number, rows: number) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  getActiveSession: () => TerminalSession | undefined;
  getSessionBuffer: (id: string) => string;
}

let sessionCounter = 0;

function generateId(): string {
  sessionCounter++;
  return `terminal-${sessionCounter}-${Date.now().toString(36)}`;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isTerminalOpen: false,
  terminalHeight: 220,

  addSession: () => {
    const id = generateId();
    const newSession: TerminalSession = {
      id,
      title: `Terminal ${get().sessions.length + 1}`,
      status: "disconnected",
      cols: 80,
      rows: 24,
      buffer: "",
      createdAt: Date.now(),
    };
    set((state) => ({
      sessions: [...state.sessions, newSession],
      activeSessionId: id,
      isTerminalOpen: true,
    }));
    return id;
  },

  removeSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter((s) => s.id !== id);
      const newActive =
        state.activeSessionId === id
          ? filtered.length > 0
            ? filtered[filtered.length - 1].id
            : null
          : state.activeSessionId;
      return {
        sessions: filtered,
        activeSessionId: newActive,
        isTerminalOpen: filtered.length > 0 ? state.isTerminalOpen : false,
      };
    });
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  updateSessionStatus: (id, status) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    }));
  },

  appendToBuffer: (id, data) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== id) return s;
        const newBuffer = s.buffer + data;
        return {
          ...s,
          buffer: newBuffer.length > 102400 ? newBuffer.slice(-102400) : newBuffer,
        };
      }),
    }));
  },

  clearBuffer: (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, buffer: "" } : s
      ),
    }));
  },

  resizeSession: (id, cols, rows) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, cols, rows } : s
      ),
    }));
  },

  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),

  setTerminalHeight: (height) =>
    set({ terminalHeight: Math.max(80, Math.min(600, height)) }),

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId);
  },

  getSessionBuffer: (id) => {
    const session = get().sessions.find((s) => s.id === id);
    return session?.buffer || "";
  },
}));
