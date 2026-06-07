import type { IPty } from "node-pty";

// Dynamic import for ESM/CJS compatibility
let pty: any = null;
async function getPty() {
  if (!pty) {
    pty = (await import("node-pty")).default || require("node-pty");
  }
  return pty;
}

interface PtySession {
  pty: IPty;
  sessionId: string;
  buffer: string;
  createdAt: number;
}

class ShellManager {
  private sessions: Map<string, PtySession> = new Map();

  /**
   * Spawn a new shell process for a terminal session.
   * Uses PowerShell on Windows, bash on Mac/Linux.
   */
  async createSession(sessionId: string, cols: number = 80, rows: number = 24): Promise<PtySession> {
    const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
    const shellArgs = process.platform === "win32" ? [] : ["--login"];

    const ptyModule = await getPty();
    const ptyProcess = ptyModule.spawn(shell, shellArgs, {
      name: "xterm-256color",
      cols,
      rows,
      cwd: process.cwd(),
      env: {
        ...(process.env as Record<string, string>),
        TERM: "xterm-256color",
      },
    });

    const session: PtySession = {
      pty: ptyProcess,
      sessionId,
      buffer: "",
      createdAt: Date.now(),
    };

    // Capture output into buffer
    ptyProcess.onData((data: string) => {
      session.buffer += data;
      // Keep only last 100KB of buffer
      if (session.buffer.length > 102400) {
        session.buffer = session.buffer.slice(-102400);
      }
    });

    ptyProcess.onExit(() => {
      this.sessions.delete(sessionId);
    });

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Write data to a shell session (user input or AI commands).
   */
  write(sessionId: string, data: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      session.pty.write(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resize a terminal session.
   */
  resize(sessionId: string, cols: number, rows: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      session.pty.resize(cols, rows);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Kill and remove a shell session.
   */
  killSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      session.pty.kill();
      this.sessions.delete(sessionId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the accumulated output buffer for a session.
   */
  getBuffer(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    return session ? session.buffer : null;
  }

  /**
   * List all active session IDs.
   */
  listSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Register a data handler for a session.
   */
  onData(sessionId: string, callback: (data: string) => void): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.pty.onData(callback);
    return true;
  }

  /**
   * Clean up all sessions.
   */
  killAll(): void {
    for (const [id] of this.sessions) {
      this.killSession(id);
    }
  }
}

export { type PtySession };
export default ShellManager;
