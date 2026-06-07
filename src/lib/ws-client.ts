/**
 * WebSocket client service for terminal connectivity.
 * Manages connections to the backend WebSocket server and routes messages.
 */

import { useTerminalStore } from "@/stores/terminalStore";

interface WSClientOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WSPendingMessage {
  type: string;
  data?: string;
  cols?: number;
  rows?: number;
}

class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private sessionId: string | null = null;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingMessages: WSPendingMessage[] = [];
  private isConnecting: boolean = false;
  private isReconnecting: boolean = false;
  private messageHandler: ((data: any) => void) | null = null;

  constructor(options: WSClientOptions = {}) {
    this.url = options.url || this.getDefaultUrl();
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
  }

  private getDefaultUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    // In development with custom server, use the same port
    // In production, the WebSocket is on the same server
    return `${protocol}//${host}/ws/terminal`;
  }

  /**
   * Connect to the WebSocket server.
   */
  connect(sessionId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve(this.sessionId || "");
        return;
      }

      this.isConnecting = true;
      const wsUrl = sessionId ? `${this.url}?sessionId=${sessionId}` : this.url;
      this.sessionId = sessionId || null;

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err) {
        this.isConnecting = false;
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Flush any pending messages
        this.flushPending();

        // Send connect message to spawn shell
        const store = useTerminalStore.getState();
        const activeSession = store.getActiveSession();
        this.send({
          type: "connect",
          cols: activeSession?.cols || 80,
          rows: activeSession?.rows || 24,
        });

        resolve(this.sessionId || "");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          if (this.messageHandler) {
            this.messageHandler(data);
          }
        } catch {
          // Ignore non-JSON messages
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        if (this.sessionId) {
          useTerminalStore.getState().updateSessionStatus(this.sessionId, "disconnected");
        }
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
      };
    });
  }

  /**
   * Send a message to the WebSocket server.
   */
  send(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.pendingMessages.push(message as WSPendingMessage);
      // Attempt to connect if not already connecting or reconnecting
      if (!this.isConnecting && !this.isReconnecting && this.sessionId) {
        this.isReconnecting = true;
        this.connect(this.sessionId).finally(() => {
          this.isReconnecting = false;
        });
      }
    }
  }

  /**
   * Send terminal input to the server.
   */
  sendInput(data: string): void {
    if (!this.sessionId) return;
    this.send({ type: "input", sessionId: this.sessionId, data });
  }

  /**
   * Send a command from the AI agent (styled differently in the terminal).
   */
  sendAICommand(data: string): void {
    if (!this.sessionId) return;
    this.send({ type: "command", sessionId: this.sessionId, data });
  }

  /**
   * Send terminal resize dimensions.
   */
  sendResize(cols: number, rows: number): void {
    if (!this.sessionId) return;
    this.send({ type: "resize", sessionId: this.sessionId, cols, rows });
  }

  /**
   * Disconnect and clean up.
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.sessionId) {
      this.send({ type: "disconnect", sessionId: this.sessionId });
    }
    this.ws?.close();
    this.ws = null;
    this.sessionId = null;
    this.pendingMessages = [];
  }

  /**
   * Register a handler for incoming messages.
   */
  onMessage(handler: (data: any) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Check if connected.
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current session ID.
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set a custom WebSocket URL.
   */
  setUrl(url: string): void {
    this.url = url;
  }

  private handleMessage(data: any): void {
    const store = useTerminalStore.getState();

    switch (data.type) {
      case "session_created":
        this.sessionId = data.sessionId;
        store.updateSessionStatus(data.sessionId, "connecting");
        break;

      case "connected":
        this.sessionId = data.sessionId;
        store.updateSessionStatus(data.sessionId, "connected");
        break;

      case "output":
        store.appendToBuffer(data.sessionId, data.data);
        break;

      case "session_closed":
        store.updateSessionStatus(data.sessionId, "disconnected");
        break;

      case "error":
        console.error("Terminal WS error:", data.message);
        break;
    }
  }

  private flushPending(): void {
    while (this.pendingMessages.length > 0) {
      const msg = this.pendingMessages.shift();
      if (msg && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(msg));
      }
    }
  }

  private attemptReconnect(): void {
    if (
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      !this.sessionId ||
      this.isReconnecting
    ) {
      return;
    }

    this.reconnectAttempts++;
    this.isReconnecting = true;
    this.reconnectTimer = setTimeout(() => {
      if (this.sessionId) {
        this.connect(this.sessionId).finally(() => {
          this.isReconnecting = false;
        });
      } else {
        this.isReconnecting = false;
      }
    }, this.reconnectInterval);
  }
}

// Singleton instance
export const wsClient = new WSClient();
export default WSClient;
