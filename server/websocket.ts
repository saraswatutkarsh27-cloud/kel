import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import ShellManager from "./shell-manager.js";

interface WSSession {
  ws: WebSocket;
  sessionId: string;
  shellId: string | null;
}

class WSShellHandler {
  private wss: WebSocketServer | null = null;
  private shellManager: ShellManager;
  private sessions: Map<string, WSSession> = new Map();

  constructor(shellManager: ShellManager) {
    this.shellManager = shellManager;
  }

  /**
   * Attach the WebSocket server to an existing HTTP server.
   */
  attach(server: Server, path: string = "/ws/terminal"): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const sessionId = url.searchParams.get("sessionId") || crypto.randomUUID();

      const wsSession: WSSession = {
        ws,
        sessionId,
        shellId: null,
      };

      this.sessions.set(sessionId, wsSession);

      // Send session created confirmation
      ws.send(
        JSON.stringify({
          type: "session_created",
          sessionId,
        })
      );

      ws.on("message", async (raw: Buffer) => {
        try {
          const message = JSON.parse(raw.toString());
          await this.handleMessage(wsSession, message);
        } catch (err: any) {
          ws.send(
            JSON.stringify({
              type: "error",
              sessionId,
              message: err.message || "Invalid message format",
            })
          );
        }
      });

      ws.on("close", () => {
        if (wsSession.shellId) {
          this.shellManager.killSession(wsSession.shellId);
        }
        this.sessions.delete(sessionId);
      });

      ws.on("error", () => {
        if (wsSession.shellId) {
          this.shellManager.killSession(wsSession.shellId);
        }
        this.sessions.delete(sessionId);
      });
    });
  }

  private async handleMessage(session: WSSession, message: any): Promise<void> {
    const { type, data, cols, rows } = message;

    switch (type) {
      case "connect": {
        if (!session.shellId) {
          const shellId = session.sessionId;
          const shellCols = cols || 80;
          const shellRows = rows || 24;

          await this.shellManager.createSession(shellId, shellCols, shellRows);
          session.shellId = shellId;

          // Pipe shell output to WebSocket
          this.shellManager.onData(shellId, (output: string) => {
            if (session.ws.readyState === WebSocket.OPEN) {
              session.ws.send(
                JSON.stringify({
                  type: "output",
                  sessionId: session.sessionId,
                  data: output,
                })
              );
            }
          });

          session.ws.send(
            JSON.stringify({
              type: "connected",
              sessionId: session.sessionId,
            })
          );
        }
        break;
      }

      case "input": {
        if (session.shellId && data) {
          this.shellManager.write(session.shellId, data);
        }
        break;
      }

      case "command": {
        if (session.shellId && data) {
          // AI commands appear in amber - we send them as regular input
          // The frontend will style them differently based on the sender
          this.shellManager.write(session.shellId, data + "\n");
        }
        break;
      }

      case "resize": {
        if (session.shellId && cols && rows) {
          this.shellManager.resize(session.shellId, cols, rows);
        }
        break;
      }

      case "disconnect": {
        if (session.shellId) {
          this.shellManager.killSession(session.shellId);
          session.shellId = null;
        }
        if (session.ws.readyState === WebSocket.OPEN) {
          session.ws.send(
            JSON.stringify({
              type: "session_closed",
              sessionId: session.sessionId,
            })
          );
        }
        break;
      }
    }
  }

  /**
   * Send a command from the AI agent to a specific terminal session.
   * Used by the AI agent to run commands programmatically.
   */
  sendAICommand(sessionId: string, command: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.shellId) return false;
    this.shellManager.write(session.shellId, command + "\n");
    return true;
  }

  /**
   * Broadcast a message to all sessions (e.g., AI agent activity).
   */
  broadcast(data: Record<string, unknown>): void {
    for (const [, session] of this.sessions) {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(JSON.stringify(data));
      }
    }
  }

  /**
   * Clean up all WebSocket sessions and shell processes.
   */
  cleanup(): void {
    for (const [, session] of this.sessions) {
      if (session.shellId) {
        this.shellManager.killSession(session.shellId);
      }
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }
    }
    this.sessions.clear();
    this.wss?.close();
  }
}

export default WSShellHandler;
