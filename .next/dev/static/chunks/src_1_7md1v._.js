(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/stores/terminalStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTerminalStore",
    ()=>useTerminalStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
let sessionCounter = 0;
function generateId() {
    sessionCounter++;
    return `terminal-${sessionCounter}-${Date.now().toString(36)}`;
}
const useTerminalStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        sessions: [],
        activeSessionId: null,
        isTerminalOpen: false,
        terminalHeight: 220,
        addSession: ()=>{
            const id = generateId();
            const newSession = {
                id,
                title: `Terminal ${get().sessions.length + 1}`,
                status: "disconnected",
                cols: 80,
                rows: 24,
                buffer: "",
                createdAt: Date.now()
            };
            set((state)=>({
                    sessions: [
                        ...state.sessions,
                        newSession
                    ],
                    activeSessionId: id,
                    isTerminalOpen: true
                }));
            return id;
        },
        removeSession: (id)=>{
            set((state)=>{
                const filtered = state.sessions.filter((s)=>s.id !== id);
                const newActive = state.activeSessionId === id ? filtered.length > 0 ? filtered[filtered.length - 1].id : null : state.activeSessionId;
                return {
                    sessions: filtered,
                    activeSessionId: newActive,
                    isTerminalOpen: filtered.length > 0 ? state.isTerminalOpen : false
                };
            });
        },
        setActiveSession: (id)=>set({
                activeSessionId: id
            }),
        updateSessionStatus: (id, status)=>{
            set((state)=>({
                    sessions: state.sessions.map((s)=>s.id === id ? {
                            ...s,
                            status
                        } : s)
                }));
        },
        appendToBuffer: (id, data)=>{
            set((state)=>({
                    sessions: state.sessions.map((s)=>{
                        if (s.id !== id) return s;
                        const newBuffer = s.buffer + data;
                        return {
                            ...s,
                            buffer: newBuffer.length > 102400 ? newBuffer.slice(-102400) : newBuffer
                        };
                    })
                }));
        },
        clearBuffer: (id)=>{
            set((state)=>({
                    sessions: state.sessions.map((s)=>s.id === id ? {
                            ...s,
                            buffer: ""
                        } : s)
                }));
        },
        resizeSession: (id, cols, rows)=>{
            set((state)=>({
                    sessions: state.sessions.map((s)=>s.id === id ? {
                            ...s,
                            cols,
                            rows
                        } : s)
                }));
        },
        toggleTerminal: ()=>set((state)=>({
                    isTerminalOpen: !state.isTerminalOpen
                })),
        setTerminalHeight: (height)=>set({
                terminalHeight: Math.max(80, Math.min(600, height))
            }),
        getActiveSession: ()=>{
            const { sessions, activeSessionId } = get();
            return sessions.find((s)=>s.id === activeSessionId);
        },
        getSessionBuffer: (id)=>{
            const session = get().sessions.find((s)=>s.id === id);
            return session?.buffer || "";
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ws-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "wsClient",
    ()=>wsClient
]);
/**
 * WebSocket client service for terminal connectivity.
 * Manages connections to the backend WebSocket server and routes messages.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/terminalStore.ts [app-client] (ecmascript)");
;
class WSClient {
    ws = null;
    url;
    sessionId = null;
    reconnectInterval;
    maxReconnectAttempts;
    reconnectAttempts = 0;
    reconnectTimer = null;
    pendingMessages = [];
    isConnecting = false;
    isReconnecting = false;
    messageHandler = null;
    constructor(options = {}){
        this.url = options.url || this.getDefaultUrl();
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    }
    getDefaultUrl() {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        // In development with custom server, use the same port
        // In production, the WebSocket is on the same server
        return `${protocol}//${host}/ws/terminal`;
    }
    /**
   * Connect to the WebSocket server.
   */ connect(sessionId) {
        return new Promise((resolve, reject)=>{
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
            this.ws.onopen = ()=>{
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                // Flush any pending messages
                this.flushPending();
                // Send connect message to spawn shell
                const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState();
                const activeSession = store.getActiveSession();
                this.send({
                    type: "connect",
                    cols: activeSession?.cols || 80,
                    rows: activeSession?.rows || 24
                });
                resolve(this.sessionId || "");
            };
            this.ws.onmessage = (event)=>{
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                    if (this.messageHandler) {
                        this.messageHandler(data);
                    }
                } catch  {
                // Ignore non-JSON messages
                }
            };
            this.ws.onclose = ()=>{
                this.isConnecting = false;
                if (this.sessionId) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState().updateSessionStatus(this.sessionId, "disconnected");
                }
                this.attemptReconnect();
            };
            this.ws.onerror = ()=>{
                this.isConnecting = false;
            };
        });
    }
    /**
   * Send a message to the WebSocket server.
   */ send(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            this.pendingMessages.push(message);
            // Attempt to connect if not already connecting or reconnecting
            if (!this.isConnecting && !this.isReconnecting && this.sessionId) {
                this.isReconnecting = true;
                this.connect(this.sessionId).finally(()=>{
                    this.isReconnecting = false;
                });
            }
        }
    }
    /**
   * Send terminal input to the server.
   */ sendInput(data) {
        if (!this.sessionId) return;
        this.send({
            type: "input",
            sessionId: this.sessionId,
            data
        });
    }
    /**
   * Send a command from the AI agent (styled differently in the terminal).
   */ sendAICommand(data) {
        if (!this.sessionId) return;
        this.send({
            type: "command",
            sessionId: this.sessionId,
            data
        });
    }
    /**
   * Send terminal resize dimensions.
   */ sendResize(cols, rows) {
        if (!this.sessionId) return;
        this.send({
            type: "resize",
            sessionId: this.sessionId,
            cols,
            rows
        });
    }
    /**
   * Disconnect and clean up.
   */ disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
        if (this.sessionId) {
            this.send({
                type: "disconnect",
                sessionId: this.sessionId
            });
        }
        this.ws?.close();
        this.ws = null;
        this.sessionId = null;
        this.pendingMessages = [];
    }
    /**
   * Register a handler for incoming messages.
   */ onMessage(handler) {
        this.messageHandler = handler;
    }
    /**
   * Check if connected.
   */ isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
    /**
   * Get the current session ID.
   */ getSessionId() {
        return this.sessionId;
    }
    /**
   * Set a custom WebSocket URL.
   */ setUrl(url) {
        this.url = url;
    }
    handleMessage(data) {
        const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState();
        switch(data.type){
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
    flushPending() {
        while(this.pendingMessages.length > 0){
            const msg = this.pendingMessages.shift();
            if (msg && this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(msg));
            }
        }
    }
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.sessionId || this.isReconnecting) {
            return;
        }
        this.reconnectAttempts++;
        this.isReconnecting = true;
        this.reconnectTimer = setTimeout(()=>{
            if (this.sessionId) {
                this.connect(this.sessionId).finally(()=>{
                    this.isReconnecting = false;
                });
            } else {
                this.isReconnecting = false;
            }
        }, this.reconnectInterval);
    }
}
const wsClient = new WSClient();
const __TURBOPACK__default__export__ = WSClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TerminalPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TerminalPanel",
    ()=>TerminalPanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$xterm$2f$lib$2f$xterm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xterm/xterm/lib/xterm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$addon$2d$fit$2f$lib$2f$addon$2d$fit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xterm/addon-fit/lib/addon-fit.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$addon$2d$web$2d$links$2f$lib$2f$addon$2d$web$2d$links$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xterm/addon-web-links/lib/addon-web-links.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/terminalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ws-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
const TerminalPanel = ()=>{
    _s();
    const { sessions, activeSessionId, isTerminalOpen, terminalHeight, addSession, removeSession, setActiveSession, toggleTerminal, setTerminalHeight } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"])();
    const terminalRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const terminalInstances = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const fitAddons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const resizeObserverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const initTerminal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TerminalPanel.useCallback[initTerminal]": (sessionId)=>{
            const container = terminalRefs.current.get(sessionId);
            if (!container || terminalInstances.current.has(sessionId)) return;
            const term = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$xterm$2f$lib$2f$xterm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Terminal"]({
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
                    brightWhite: "#ffffff"
                },
                allowProposedApi: true,
                allowTransparency: false
            });
            const fitAddon = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$addon$2d$fit$2f$lib$2f$addon$2d$fit$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FitAddon"]();
            term.loadAddon(fitAddon);
            term.loadAddon(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$addon$2d$web$2d$links$2f$lib$2f$addon$2d$web$2d$links$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebLinksAddon"]());
            fitAddons.current.set(sessionId, fitAddon);
            term.open(container);
            setTimeout({
                "TerminalPanel.useCallback[initTerminal]": ()=>{
                    try {
                        fitAddon.fit();
                    } catch  {}
                }
            }["TerminalPanel.useCallback[initTerminal]"], 50);
            term.onData({
                "TerminalPanel.useCallback[initTerminal]": (data)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsClient"].sendInput(data);
                }
            }["TerminalPanel.useCallback[initTerminal]"]);
            term.onResize({
                "TerminalPanel.useCallback[initTerminal]": ({ cols, rows })=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState().resizeSession(sessionId, cols, rows);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsClient"].sendResize(cols, rows);
                }
            }["TerminalPanel.useCallback[initTerminal]"]);
            terminalInstances.current.set(sessionId, term);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsClient"].connect(sessionId).catch({
                "TerminalPanel.useCallback[initTerminal]": ()=>{
                    term.writeln("\r\n\x1b[33m\u26a0 WebSocket server not available.\x1b[0m");
                    term.writeln("\x1b[33m  Start the server with: npm run server\x1b[0m");
                    term.write("\r\n$ ");
                }
            }["TerminalPanel.useCallback[initTerminal]"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsClient"].onMessage({
                "TerminalPanel.useCallback[initTerminal]": (data)=>{
                    if (data.type === "output" && data.sessionId === sessionId) {
                        term.write(data.data);
                    }
                    if (data.type === "error" && data.sessionId === sessionId) {
                        term.writeln(`\r\n\x1b[31mError: ${data.message}\x1b[0m`);
                    }
                }
            }["TerminalPanel.useCallback[initTerminal]"]);
        }
    }["TerminalPanel.useCallback[initTerminal]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TerminalPanel.useEffect": ()=>{
            return ({
                "TerminalPanel.useEffect": ()=>{
                    terminalInstances.current.forEach({
                        "TerminalPanel.useEffect": (term)=>{
                            term.dispose();
                        }
                    }["TerminalPanel.useEffect"]);
                    terminalInstances.current.clear();
                    fitAddons.current.clear();
                }
            })["TerminalPanel.useEffect"];
        }
    }["TerminalPanel.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TerminalPanel.useEffect": ()=>{
            if (activeSessionId) {
                setTimeout({
                    "TerminalPanel.useEffect": ()=>initTerminal(activeSessionId)
                }["TerminalPanel.useEffect"], 100);
            }
        }
    }["TerminalPanel.useEffect"], [
        activeSessionId,
        initTerminal
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TerminalPanel.useEffect": ()=>{
            if (!activeSessionId) return;
            const container = terminalRefs.current.get(activeSessionId);
            if (!container) return;
            resizeObserverRef.current = new ResizeObserver({
                "TerminalPanel.useEffect": ()=>{
                    const fitAddon = fitAddons.current.get(activeSessionId);
                    if (fitAddon) {
                        try {
                            fitAddon.fit();
                        } catch  {}
                    }
                }
            }["TerminalPanel.useEffect"]);
            resizeObserverRef.current.observe(container);
            return ({
                "TerminalPanel.useEffect": ()=>{
                    resizeObserverRef.current?.disconnect();
                }
            })["TerminalPanel.useEffect"];
        }
    }["TerminalPanel.useEffect"], [
        activeSessionId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TerminalPanel.useEffect": ()=>{
            if (activeSessionId) {
                setTimeout({
                    "TerminalPanel.useEffect": ()=>{
                        const fitAddon = fitAddons.current.get(activeSessionId);
                        if (fitAddon) {
                            try {
                                fitAddon.fit();
                            } catch  {}
                        }
                    }
                }["TerminalPanel.useEffect"], 100);
            }
        }
    }["TerminalPanel.useEffect"], [
        terminalHeight,
        activeSessionId
    ]);
    const handleAddSession = ()=>{
        const id = addSession();
        setActiveSession(id);
        setTimeout(()=>initTerminal(id), 150);
    };
    const handleRemoveSession = (id)=>{
        const term = terminalInstances.current.get(id);
        if (term) {
            term.dispose();
            terminalInstances.current.delete(id);
        }
        fitAddons.current.delete(id);
        removeSession(id);
    };
    const handleResizeStart = (e)=>{
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = terminalHeight;
        const onMouseMove = (moveEvent)=>{
            const delta = startY - moveEvent.clientY;
            setTerminalHeight(startHeight + delta);
        };
        const onMouseUp = ()=>{
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    if (!isTerminalOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col bg-ide-surface border-t border-ide-border",
        style: {
            height: terminalHeight
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1.5 cursor-ns-resize hover:bg-ide-accent/30 active:bg-ide-accent/50 transition-colors flex-shrink-0 relative group",
                onMouseDown: handleResizeStart,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full w-16 mx-auto bg-ide-accent/20 rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerminalPanel.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/TerminalPanel.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/TerminalPanel.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center h-8 px-2 bg-ide-elevated/50 border-b border-ide-border gap-0.5 flex-shrink-0",
                children: [
                    sessions.map((session)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveSession(session.id),
                            className: `flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-t transition-all duration-150 ${session.id === activeSessionId ? "bg-ide-surface text-white border-t border-ide-accent" : "text-ide-muted hover:text-white hover:bg-ide-hover/50"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-1.5 h-1.5 rounded-full ${session.status === "connected" ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]" : session.status === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate max-w-[100px]",
                                    children: session.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 218,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        handleRemoveSession(session.id);
                                    },
                                    className: "p-0.5 rounded opacity-0 hover:opacity-100 hover:bg-ide-hover transition-all duration-150 text-ide-muted hover:text-white",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 10
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerminalPanel.tsx",
                                        lineNumber: 226,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 219,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, session.id, true, {
                            fileName: "[project]/src/components/TerminalPanel.tsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAddSession,
                        className: "p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-150 ml-1",
                        title: "New Terminal",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            size: 12
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerminalPanel.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerminalPanel.tsx",
                        lineNumber: 230,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerminalPanel.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleTerminal,
                        className: "p-1 rounded text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-150",
                        title: "Close Terminal",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            size: 12
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerminalPanel.tsx",
                            lineNumber: 243,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerminalPanel.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TerminalPanel.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative min-h-0",
                children: [
                    sessions.map((session)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: (el)=>{
                                if (el) terminalRefs.current.set(session.id, el);
                            },
                            className: `absolute inset-0 ${session.id === activeSessionId ? "z-10" : "z-0 opacity-0 pointer-events-none"}`
                        }, session.id, false, {
                            fileName: "[project]/src/components/TerminalPanel.tsx",
                            lineNumber: 249,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))),
                    sessions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center h-full text-sm text-ide-muted",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xterm$2f$xterm$2f$lib$2f$xterm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Terminal"], {
                                    size: 24,
                                    className: "text-ide-muted/30"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 262,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "No terminals open"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 263,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleAddSession,
                                    className: "flex items-center gap-1.5 text-xs text-ide-accent-light hover:text-white px-3 py-1.5 rounded-lg border border-ide-accent/20 hover:bg-ide-accent/10 transition-all duration-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TerminalPanel.tsx",
                                            lineNumber: 268,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        "New Terminal"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TerminalPanel.tsx",
                                    lineNumber: 264,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TerminalPanel.tsx",
                            lineNumber: 261,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerminalPanel.tsx",
                        lineNumber: 260,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TerminalPanel.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TerminalPanel.tsx",
        lineNumber: 185,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(TerminalPanel, "6QkdTyTiP7rJf7xdnS9oiHtTjbM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"]
    ];
});
_c = TerminalPanel;
const __TURBOPACK__default__export__ = TerminalPanel;
var _c;
__turbopack_context__.k.register(_c, "TerminalPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TerminalPanel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/TerminalPanel.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_1_7md1v._.js.map