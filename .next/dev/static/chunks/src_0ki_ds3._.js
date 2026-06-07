(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/stores/aiStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAIStore",
    ()=>useAIStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
let messageCounter = 0;
function generateMessageId() {
    messageCounter++;
    return `msg-${messageCounter}-${Date.now().toString(36)}`;
}
let stepCounter = 0;
function generateStepId() {
    stepCounter++;
    return `step-${stepCounter}-${Date.now().toString(36)}`;
}
const useAIStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        messages: [],
        mode: "chat",
        selectedProvider: "gemini",
        providerConfigs: {
            gemini: {
                provider: "gemini",
                apiKey: "",
                model: "gemini-2.0-flash",
                label: "Gemini 2.0 Flash"
            },
            claude: {
                provider: "claude",
                apiKey: "",
                model: "claude-sonnet-4",
                label: "Claude Sonnet 4"
            },
            openai: {
                provider: "openai",
                apiKey: "",
                model: "gpt-4o",
                label: "GPT-4o"
            }
        },
        currentPlan: null,
        isStreaming: false,
        abortController: null,
        addMessage: (msg)=>{
            const newMsg = {
                ...msg,
                id: generateMessageId(),
                timestamp: Date.now()
            };
            set((state)=>({
                    messages: [
                        ...state.messages,
                        newMsg
                    ]
                }));
        },
        updateLastMessage: (content)=>{
            set((state)=>{
                if (state.messages.length === 0) return state;
                const updated = [
                    ...state.messages
                ];
                const last = {
                    ...updated[updated.length - 1]
                };
                last.content = content;
                updated[updated.length - 1] = last;
                return {
                    messages: updated
                };
            });
        },
        clearMessages: ()=>set({
                messages: [],
                currentPlan: null
            }),
        removeMessage: (id)=>{
            set((state)=>({
                    messages: state.messages.filter((m)=>m.id !== id)
                }));
        },
        setMode: (mode)=>set({
                mode
            }),
        setProvider: (provider)=>set({
                selectedProvider: provider
            }),
        updateProviderConfig: (provider, config)=>{
            set((state)=>({
                    providerConfigs: {
                        ...state.providerConfigs,
                        [provider]: {
                            ...state.providerConfigs[provider],
                            ...config
                        }
                    }
                }));
        },
        getProviderConfig: (provider)=>get().providerConfigs[provider],
        setPlan: (plan)=>set({
                currentPlan: plan
            }),
        addPlanStep: (step)=>{
            set((state)=>{
                if (!state.currentPlan) return state;
                return {
                    currentPlan: {
                        ...state.currentPlan,
                        steps: [
                            ...state.currentPlan.steps,
                            {
                                ...step,
                                id: step.id || generateStepId()
                            }
                        ]
                    }
                };
            });
        },
        updateStepStatus: (stepId, status, result)=>{
            set((state)=>{
                if (!state.currentPlan) return state;
                return {
                    currentPlan: {
                        ...state.currentPlan,
                        steps: state.currentPlan.steps.map((s)=>s.id === stepId ? {
                                ...s,
                                status,
                                result: result || s.result
                            } : s)
                    }
                };
            });
        },
        setPlanStatus: (status)=>{
            set((state)=>{
                if (!state.currentPlan) return state;
                return {
                    currentPlan: {
                        ...state.currentPlan,
                        status
                    }
                };
            });
        },
        clearPlan: ()=>set({
                currentPlan: null
            }),
        setStreaming: (streaming)=>set({
                isStreaming: streaming
            }),
        setAbortController: (controller)=>set({
                abortController: controller
            }),
        cancelStreaming: ()=>{
            const { abortController } = get();
            if (abortController) {
                abortController.abort();
                set({
                    abortController: null,
                    isStreaming: false
                });
            }
        },
        addToolCall: (toolCall)=>{
            // Add tool call to the last assistant message
            set((state)=>{
                if (state.messages.length === 0) return state;
                const updated = [
                    ...state.messages
                ];
                const last = {
                    ...updated[updated.length - 1]
                };
                last.toolCalls = [
                    ...last.toolCalls || [],
                    toolCall
                ];
                updated[updated.length - 1] = last;
                return {
                    messages: updated
                };
            });
        },
        updateToolCall: (name, updates)=>{
            set((state)=>{
                if (state.messages.length === 0) return state;
                const updated = [
                    ...state.messages
                ];
                const last = {
                    ...updated[updated.length - 1]
                };
                last.toolCalls = (last.toolCalls || []).map((tc)=>tc.name === name ? {
                        ...tc,
                        ...updates
                    } : tc);
                updated[updated.length - 1] = last;
                return {
                    messages: updated
                };
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/fileSystemStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFileSystemStore",
    ()=>useFileSystemStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
function findFileInTree(files, path) {
    for (const file of files){
        if (file.path === path) return file;
        if (file.children) {
            const found = findFileInTree(file.children, path);
            if (found) return found;
        }
    }
    return undefined;
}
function addFileToTree(files, file) {
    const parts = file.path.split("/");
    if (parts.length === 1) {
        const exists = files.find((f)=>f.path === file.path);
        if (exists) return files;
        return [
            ...files,
            file
        ].sort(sortFiles);
    }
    const parentPath = parts.slice(0, -1).join("/");
    return files.map((f)=>{
        if (f.path === parentPath && f.children) {
            return {
                ...f,
                children: [
                    ...f.children,
                    file
                ].sort(sortFiles)
            };
        }
        if (f.children) {
            return {
                ...f,
                children: addFileToTree(f.children, file)
            };
        }
        return f;
    });
}
function updateFileInTree(files, path, updates) {
    return files.map((f)=>{
        if (f.path === path) return {
            ...f,
            ...updates
        };
        if (f.children) return {
            ...f,
            children: updateFileInTree(f.children, path, updates)
        };
        return f;
    });
}
function removeFileFromTree(files, path) {
    return files.filter((f)=>f.path !== path).map((f)=>{
        if (f.children) return {
            ...f,
            children: removeFileFromTree(f.children, path)
        };
        return f;
    });
}
function renameFileInTree(files, oldPath, newPath, newName) {
    return files.map((f)=>{
        if (f.path === oldPath) return {
            ...f,
            path: newPath,
            name: newName
        };
        if (f.children) return {
            ...f,
            children: renameFileInTree(f.children, oldPath, newPath, newName)
        };
        return f;
    });
}
function sortFiles(a, b) {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
}
const useFileSystemStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        files: [],
        rootHandle: null,
        openTabs: [],
        activeFilePath: null,
        useBackend: false,
        setFiles: (files)=>set({
                files
            }),
        setRootHandle: (handle)=>set({
                rootHandle: handle
            }),
        setUseBackend: (use)=>set({
                useBackend: use
            }),
        openFile: (file)=>{
            const { openTabs } = get();
            if (openTabs.find((t)=>t.file.path === file.path)) {
                set({
                    activeFilePath: file.path
                });
                return;
            }
            set({
                openTabs: [
                    ...openTabs,
                    {
                        file,
                        content: file.content || "",
                        originalContent: file.content || "",
                        isDirty: false
                    }
                ],
                activeFilePath: file.path
            });
        },
        closeTab: (path)=>{
            const { openTabs, activeFilePath } = get();
            const updatedTabs = openTabs.filter((t)=>t.file.path !== path);
            let newActive = activeFilePath;
            if (activeFilePath === path) {
                const idx = openTabs.findIndex((t)=>t.file.path === path);
                newActive = updatedTabs.length > 0 ? updatedTabs[Math.min(idx, updatedTabs.length - 1)].file.path : null;
            }
            set({
                openTabs: updatedTabs,
                activeFilePath: newActive
            });
        },
        setActiveFile: (path)=>set({
                activeFilePath: path
            }),
        updateTabContent: (path, content)=>{
            set((state)=>({
                    openTabs: state.openTabs.map((t)=>t.file.path === path ? {
                            ...t,
                            content,
                            isDirty: content !== t.originalContent
                        } : t),
                    files: updateFileInTree(state.files, path, {
                        content,
                        isDirty: true
                    })
                }));
        },
        markTabSaved: (path)=>{
            set((state)=>({
                    openTabs: state.openTabs.map((t)=>t.file.path === path ? {
                            ...t,
                            isDirty: false,
                            originalContent: t.content
                        } : t),
                    files: updateFileInTree(state.files, path, {
                        isDirty: false
                    })
                }));
        },
        closeAllTabs: ()=>set({
                openTabs: [],
                activeFilePath: null
            }),
        closeOtherTabs: (path)=>{
            const tab = get().openTabs.find((t)=>t.file.path === path);
            if (tab) set({
                openTabs: [
                    tab
                ],
                activeFilePath: path
            });
        },
        closeTabsToRight: (path)=>{
            const idx = get().openTabs.findIndex((t)=>t.file.path === path);
            if (idx >= 0) set({
                openTabs: get().openTabs.slice(0, idx + 1),
                activeFilePath: path
            });
        },
        reorderTabs: (tabs)=>set({
                openTabs: tabs
            }),
        addFile: (file)=>set((state)=>({
                    files: addFileToTree(state.files, file)
                })),
        updateFile: (path, updates)=>set((state)=>({
                    files: updateFileInTree(state.files, path, updates)
                })),
        removeFile: (path)=>{
            set((state)=>{
                // Close any open tabs for this file
                const updatedTabs = state.openTabs.filter((t)=>!t.file.path.startsWith(path));
                let newActive = state.activeFilePath;
                if (state.activeFilePath?.startsWith(path)) {
                    const idx = state.openTabs.findIndex((t)=>t.file.path === state.activeFilePath);
                    newActive = updatedTabs.length > 0 ? updatedTabs[Math.min(idx, updatedTabs.length - 1)].file.path : null;
                }
                return {
                    files: removeFileFromTree(state.files, path),
                    openTabs: updatedTabs,
                    activeFilePath: newActive
                };
            });
        },
        renameFile: (oldPath, newPath)=>{
            const newName = newPath.split("/").pop() || "";
            set((state)=>{
                // Update tabs that reference the old path
                const updatedTabs = state.openTabs.map((t)=>{
                    if (t.file.path === oldPath) {
                        return {
                            ...t,
                            file: {
                                ...t.file,
                                path: newPath,
                                name: newName
                            }
                        };
                    }
                    return t;
                });
                return {
                    files: renameFileInTree(state.files, oldPath, newPath, newName),
                    openTabs: updatedTabs,
                    activeFilePath: state.activeFilePath === oldPath ? newPath : state.activeFilePath
                };
            });
        },
        getFileByPath: (path)=>findFileInTree(get().files, path),
        addFolder: (folder)=>set((state)=>({
                    files: addFileToTree(state.files, folder)
                })),
        activeTab: ()=>{
            const { openTabs, activeFilePath } = get();
            return openTabs.find((t)=>t.file.path === activeFilePath) || null;
        },
        dirtyFiles: ()=>get().files.filter((f)=>f.isDirty)
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/lib/ai/tools.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agentTools",
    ()=>agentTools,
    "executeToolCall",
    ()=>executeToolCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/fileSystemStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ws-client.ts [app-client] (ecmascript)");
;
;
const agentTools = [
    {
        name: "read_file",
        description: "Read the content of a file at the given path.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path of the file to read, relative to project root."
                }
            },
            required: [
                "path"
            ]
        }
    },
    {
        name: "write_file",
        description: "Write content to a file at the given path. Creates intermediate directories if needed.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path of the file to write."
                },
                content: {
                    type: "string",
                    description: "The full content to write to the file."
                }
            },
            required: [
                "path",
                "content"
            ]
        }
    },
    {
        name: "create_file",
        description: "Create a new empty file at the given path.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path where the file should be created."
                }
            },
            required: [
                "path"
            ]
        }
    },
    {
        name: "create_directory",
        description: "Create a new directory at the given path.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path of the directory to create."
                }
            },
            required: [
                "path"
            ]
        }
    },
    {
        name: "delete_item",
        description: "Delete a file or directory at the given path.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path of the item to delete."
                }
            },
            required: [
                "path"
            ]
        }
    },
    {
        name: "rename_item",
        description: "Rename or move a file or directory.",
        parameters: {
            type: "object",
            properties: {
                oldPath: {
                    type: "string",
                    description: "The current path of the item."
                },
                newPath: {
                    type: "string",
                    description: "The new path for the item."
                }
            },
            required: [
                "oldPath",
                "newPath"
            ]
        }
    },
    {
        name: "list_files",
        description: "List all files and directories in the project workspace.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Optional subdirectory to list. Empty string lists root."
                }
            }
        }
    },
    {
        name: "search_code",
        description: "Search for text across all files in the project.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The text to search for."
                }
            },
            required: [
                "query"
            ]
        }
    },
    {
        name: "run_terminal_command",
        description: "Execute a command in the IDE terminal. Use this to run build commands, tests, install packages, etc.",
        parameters: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "The shell command to execute."
                }
            },
            required: [
                "command"
            ]
        }
    }
];
async function executeToolCall(toolCall) {
    const { name, args } = toolCall;
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFileSystemStore"].getState();
    try {
        switch(name){
            case "read_file":
                {
                    const path = args.path;
                    const file = store.getFileByPath(path);
                    if (file?.content !== undefined) return {
                        content: file.content
                    };
                    if (store.useBackend) {
                        const res = await fetch("/api/files?path=" + encodeURIComponent(path));
                        const data = await res.json();
                        if (data.success) return {
                            content: data.data
                        };
                    }
                    return {
                        error: "File not found: " + path
                    };
                }
            case "write_file":
                {
                    const wPath = args.path;
                    const content = args.content;
                    const existing = store.getFileByPath(wPath);
                    if (existing) {
                        store.updateFile(wPath, {
                            content,
                            isDirty: true
                        });
                        store.updateTabContent(wPath, content);
                    } else {
                        store.addFile({
                            path: wPath,
                            name: wPath.split("/").pop() || "",
                            type: "file",
                            content,
                            isDirty: true
                        });
                    }
                    if (store.useBackend) {
                        await fetch("/api/files", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "write",
                                path: wPath,
                                content
                            })
                        });
                    }
                    return {
                        success: true,
                        path: wPath
                    };
                }
            case "create_file":
                {
                    const cPath = args.path;
                    store.addFile({
                        path: cPath,
                        name: cPath.split("/").pop() || "",
                        type: "file",
                        content: "",
                        isDirty: false
                    });
                    if (store.useBackend) {
                        await fetch("/api/files", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "create",
                                path: cPath
                            })
                        });
                    }
                    return {
                        success: true,
                        path: cPath
                    };
                }
            case "create_directory":
                {
                    const dPath = args.path;
                    store.addFolder({
                        path: dPath,
                        name: dPath.split("/").pop() || "",
                        type: "directory",
                        isDirty: false,
                        children: []
                    });
                    if (store.useBackend) {
                        await fetch("/api/files", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "mkdir",
                                path: dPath
                            })
                        });
                    }
                    return {
                        success: true,
                        path: dPath
                    };
                }
            case "delete_item":
                {
                    const delPath = args.path;
                    store.removeFile(delPath);
                    if (store.useBackend) {
                        await fetch("/api/files", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "delete",
                                path: delPath
                            })
                        });
                    }
                    return {
                        success: true,
                        path: delPath
                    };
                }
            case "rename_item":
                {
                    const oldP = args.oldPath;
                    const newP = args.newPath;
                    store.renameFile(oldP, newP);
                    if (store.useBackend) {
                        await fetch("/api/files", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "rename",
                                path: oldP,
                                newPath: newP
                            })
                        });
                    }
                    return {
                        success: true,
                        oldPath: oldP,
                        newPath: newP
                    };
                }
            case "list_files":
                {
                    const listPath = args.path || "";
                    if (store.useBackend) {
                        const res = await fetch("/api/files?path=" + encodeURIComponent(listPath));
                        const data = await res.json();
                        if (data.success) return {
                            files: data.data
                        };
                    }
                    const formatTree = (items, indent = "")=>{
                        let result = "";
                        for (const item of items){
                            result += indent + "- " + item.name + (item.type === "directory" ? "/" : "") + "\n";
                            if (item.children) result += formatTree(item.children, indent + "  ");
                        }
                        return result;
                    };
                    return {
                        structure: formatTree(store.files),
                        files: store.files
                    };
                }
            case "search_code":
                {
                    const query = args.query;
                    if (store.useBackend) {
                        const res = await fetch("/api/files?search=" + encodeURIComponent(query));
                        const data = await res.json();
                        if (data.success) return {
                            results: data.data
                        };
                    }
                    const results = [];
                    const searchInFiles = (items)=>{
                        for (const item of items){
                            if (item.type === "file" && item.content) {
                                item.content.split("\n").forEach((line, i)=>{
                                    if (line.toLowerCase().includes(query.toLowerCase())) {
                                        results.push({
                                            path: item.path,
                                            line: i + 1,
                                            content: line.trim()
                                        });
                                    }
                                });
                            }
                            if (item.children) searchInFiles(item.children);
                        }
                    };
                    searchInFiles(store.files);
                    return {
                        results: results.slice(0, 100)
                    };
                }
            case "run_terminal_command":
                {
                    const cmd = args.command;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ws$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wsClient"].sendAICommand(cmd);
                    return {
                        success: true,
                        command: cmd,
                        output: "Command sent to terminal"
                    };
                }
            default:
                return {
                    error: "Unknown tool: " + name
                };
        }
    } catch (err) {
        return {
            error: err.message
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ai/agent.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * AI Agent Engine
 *
 * The agent loop takes a user goal, generates a plan, executes steps using tools,
 * and streams everything to the UI in real time.
 */ __turbopack_context__.s([
    "generatePlan",
    ()=>generatePlan,
    "quickChat",
    ()=>quickChat,
    "runAgent",
    ()=>runAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$tools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai/tools.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/fileSystemStore.ts [app-client] (ecmascript)");
;
;
;
// Provider instances (lazy-loaded)
let geminiProvider = null;
let claudeProvider = null;
let openaiProvider = null;
async function getProvider(providerName) {
    switch(providerName){
        case "gemini":
            if (!geminiProvider) {
                const { GeminiProvider } = await __turbopack_context__.A("[project]/src/lib/ai/providers/gemini.ts [app-client] (ecmascript, async loader)");
                geminiProvider = new GeminiProvider();
            }
            return geminiProvider;
        case "claude":
            if (!claudeProvider) {
                const { ClaudeProvider } = await __turbopack_context__.A("[project]/src/lib/ai/providers/claude.ts [app-client] (ecmascript, async loader)");
                claudeProvider = new ClaudeProvider();
            }
            return claudeProvider;
        case "openai":
            if (!openaiProvider) {
                const { OpenAIProvider } = await __turbopack_context__.A("[project]/src/lib/ai/providers/openai.ts [app-client] (ecmascript, async loader)");
                openaiProvider = new OpenAIProvider();
            }
            return openaiProvider;
    }
}
/**
 * Build the system prompt based on the current mode and context.
 */ function buildSystemPrompt(mode) {
    const files = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFileSystemStore"].getState().files;
    const fileContext = files.length > 0 ? "\nCurrent project files: " + files.map((f)=>f.path).join(", ") : "";
    switch(mode){
        case "agent":
            return `You are an AI software engineering agent inside a web IDE.
You have access to tools that let you read, write, create, and delete files.
You can also run terminal commands and search code.

When given a task:
1. First, understand what needs to be done
2. Use list_files to see the project structure
3. Use read_file to understand existing code
4. Use write_file to make changes
5. Use run_terminal_command to run builds/tests
6. Tell the user what you did

Be thorough and handle edge cases. If you're unsure about something, read the relevant files first.
Current project context:${fileContext}`;
        case "review":
            return `You are a senior code reviewer. Analyze the provided code and give structured feedback.
Focus on: code quality, security issues, performance, best practices, and potential bugs.
Format your response with clear severity levels: CRITICAL, HIGH, MEDIUM, LOW, INFO.`;
        case "debug":
            return `You are a debugging expert. Given an error message and the relevant code, identify the root cause and suggest a specific fix.
Be precise - point to the exact line numbers and explain why the error occurs.`;
        case "chat":
        default:
            return `You are an AI programming assistant inside a web IDE.
Help the user with code questions, explain concepts, and provide examples.
Keep responses concise and practical.${fileContext}`;
    }
}
async function runAgent(userMessage, options = {}) {
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState();
    const providerName = options.provider || store.selectedProvider;
    const mode = options.mode || store.mode;
    const signal = options.signal;
    // Get provider config
    const providerConfig = store.providerConfigs[providerName];
    if (!providerConfig?.apiKey && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env[`${providerName.toUpperCase()}_API_KEY`]) {
        store.addMessage({
            role: "assistant",
            content: "⚠️ API key not configured for " + providerName + ". Add it in settings."
        });
        return;
    }
    // Add user message to store
    store.addMessage({
        role: "user",
        content: userMessage
    });
    store.setStreaming(true);
    // Add placeholder assistant message for streaming
    const assistantMsgId = "msg-" + Date.now();
    store.addMessage({
        role: "assistant",
        content: ""
    });
    try {
        const provider = await getProvider(providerName);
        if (!provider) {
            store.updateLastMessage("⚠️ Unsupported provider: " + providerName);
            return;
        }
        // Build system prompt
        const systemPrompt = buildSystemPrompt(mode);
        // Build message history from store
        // Build chat history from store, excluding system messages
        // We slice off the last 2 messages (the user msg + placeholder we just added)
        // since we'll re-add the user query to the API call
        const messages = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().messages;
        const chatMessages = messages.filter((m)=>m.role !== "system").slice(0, -2) // Exclude the user msg + placeholder we just added to the store
        .map((m)=>({
                role: m.role,
                content: m.content
            }));
        // Add the current user query (once)
        chatMessages.push({
            role: "user",
            content: userMessage
        });
        // Determine which tools to use based on mode
        const tools = mode === "agent" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$tools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentTools"] : [];
        // Create abort controller if not provided
        const abortController = signal ? null : new AbortController();
        if (abortController) {
            store.setAbortController(abortController);
        }
        // Stream the response
        const stream = provider.streamChat(chatMessages, {
            model: providerConfig?.model || undefined,
            tools,
            systemPrompt,
            signal: signal || abortController?.signal,
            onToolCall: async (toolCall)=>{
                // Update store with tool call info
                const toolCallInfo = {
                    name: toolCall.name,
                    args: toolCall.args,
                    status: "running"
                };
                store.addToolCall(toolCallInfo);
                // Add plan step for agent mode
                if (mode === "agent") {
                    const currentPlan = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().currentPlan;
                    if (currentPlan) {
                        store.addPlanStep({
                            id: "step-" + Date.now(),
                            description: "Running " + toolCall.name + ": " + JSON.stringify(toolCall.args).slice(0, 100),
                            status: "in_progress",
                            toolCall: toolCallInfo
                        });
                    }
                }
                // Execute the tool
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$tools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["executeToolCall"])(toolCall);
                // Update store with result
                store.updateToolCall(toolCall.name, {
                    status: "completed",
                    result
                });
                return result;
            }
        });
        let fullContent = "";
        for await (const event of stream){
            if (signal?.aborted) break;
            switch(event.type){
                case "text":
                    fullContent += event.content;
                    store.updateLastMessage(fullContent);
                    break;
                case "tool_call":
                    break;
                case "done":
                    store.updateLastMessage(event.content || fullContent);
                    break;
                case "error":
                    store.updateLastMessage("⚠️ Error: " + event.message);
                    break;
            }
        }
        // Mark plan as complete
        if (mode === "agent") {
            const currentPlan = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().currentPlan;
            if (currentPlan) {
                store.setPlanStatus("completed");
            }
        }
    } catch (err) {
        if (err.name === "AbortError") {
            store.updateLastMessage("⏹️ Cancelled.");
        } else {
            store.updateLastMessage("⚠️ Error: " + err.message);
        }
    } finally{
        store.setAbortController(null);
        store.setStreaming(false);
    }
}
async function generatePlan(goal, providerName) {
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState();
    const pName = providerName || store.selectedProvider;
    const providerConfig = store.providerConfigs[pName];
    if (!providerConfig?.apiKey) return;
    store.setPlan({
        id: "plan-" + Date.now(),
        title: goal.slice(0, 100),
        status: "in_progress",
        steps: [
            {
                id: "step-understand",
                description: "Understanding the project structure and requirements...",
                status: "in_progress"
            }
        ]
    });
    // Record the goal
    store.addMessage({
        role: "user",
        content: "📋 Plan: " + goal
    });
    try {
        const provider = await getProvider(pName);
        if (!provider) {
            store.setPlanStatus("error");
            store.addMessage({
                role: "assistant",
                content: "⚠️ Could not load AI provider."
            });
            return;
        }
        const systemPrompt = `You are an AI planning assistant. Given a user goal, break it down into
a step-by-step plan. Each step should be a concrete action (e.g., "Create file X",
"Implement function Y", "Run tests"). Keep plans practical and actionable.

Respond with ONLY a numbered list of steps, nothing else.`;
        // Ask the provider to generate a detailed plan
        const planResponse = await provider.chat([
            {
                role: "user",
                content: goal
            }
        ], {
            systemPrompt,
            model: providerConfig?.model || undefined
        });
        // Parse steps from the response
        const stepLines = planResponse.split("\n").filter((line)=>/^\d+[\.\)]/.test(line.trim())).map((line)=>line.replace(/^\d+[\.\)]\s*/, "").trim()).filter(Boolean);
        if (stepLines.length > 0) {
            store.setPlan({
                id: "plan-" + Date.now(),
                title: goal.slice(0, 100),
                status: "ready",
                steps: stepLines.map((desc, i)=>({
                        id: "step-" + (i + 1) + "-" + Date.now(),
                        description: desc,
                        status: "pending"
                    }))
            });
        } else {
            // Fallback: store the raw plan response
            store.setPlan({
                id: "plan-" + Date.now(),
                title: goal.slice(0, 100),
                status: "ready",
                steps: [
                    {
                        id: "step-1-" + Date.now(),
                        description: planResponse.slice(0, 500),
                        status: "pending"
                    }
                ]
            });
        }
        store.setPlanStatus("ready");
    } catch (err) {
        store.setPlanStatus("error");
        store.addMessage({
            role: "assistant",
            content: "⚠️ Plan generation failed: " + err.message
        });
    }
}
async function quickChat(message, options = {}) {
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState();
    const providerName = options.provider || store.selectedProvider;
    const providerConfig = store.providerConfigs[providerName];
    if (!providerConfig?.apiKey) return "";
    try {
        const provider = await getProvider(providerName);
        if (!provider) return "";
        return await provider.chat([
            {
                role: "user",
                content: message
            }
        ], {
            systemPrompt: options.systemPrompt,
            model: providerConfig?.model || undefined
        });
    } catch  {
        return "";
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ai/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * AI Engine - Public API
 *
 * Usage:
 *   import { runAgent, quickChat, generatePlan } from "@/lib/ai";
 *
 *   await runAgent("Build me a login page", { mode: "agent" });
 *   const answer = await quickChat("What is React?");
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$agent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai/agent.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$tools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai/tools.ts [app-client] (ecmascript)");
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AIPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AIPanel",
    ()=>AIPanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bug.js [app-client] (ecmascript) <export default as Bug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$marked$2f$lib$2f$marked$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/marked/lib/marked.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/ai/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$agent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai/agent.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$marked$2f$lib$2f$marked$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marked"].setOptions({
    breaks: true,
    gfm: true
});
const suggestedPrompts = [
    "Explain this file",
    "Add error handling",
    "Write tests",
    "Refactor this code"
];
const AIPanel = ()=>{
    _s();
    const { messages, mode, selectedProvider, providerConfigs, currentPlan, isStreaming, clearMessages, setMode, setProvider, updateProviderConfig, cancelStreaming } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"])();
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [copiedIdx, setCopiedIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AIPanel.useEffect": ()=>{
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["AIPanel.useEffect"], [
        messages,
        isStreaming
    ]);
    const sendMessage = async (messageText)=>{
        const msg = messageText || input;
        if (!msg.trim()) return;
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2f$agent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runAgent"])(msg, {
            mode
        });
    };
    const extractCodeBlocks = (text)=>{
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        const matches = [];
        let match;
        while((match = regex.exec(text)) !== null){
            matches.push({
                lang: match[1] || "code",
                code: match[2]
            });
        }
        return matches;
    };
    const copyCode = (code, idx)=>{
        navigator.clipboard.writeText(code);
        setCopiedIdx(idx);
        setTimeout(()=>setCopiedIdx(null), 2000);
    };
    const renderMarkdown = (text)=>{
        try {
            const html = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$marked$2f$lib$2f$marked$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marked"].parse(text);
            return {
                __html: html
            };
        } catch  {
            return {
                __html: text
            };
        }
    };
    const modes = [
        {
            id: "chat",
            label: "Chat",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 93,
                columnNumber: 40
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: "agent",
            label: "Agent",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 94,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: "review",
            label: "Review",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 95,
                columnNumber: 44
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: "debug",
            label: "Debug",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__["Bug"], {
                size: 12
            }, void 0, false, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 96,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0))
        }
    ];
    const providers = [
        "gemini",
        "claude",
        "openai"
    ];
    const handleApiKeyChange = (provider, key)=>{
        updateProviderConfig(provider, {
            apiKey: key
        });
        localStorage.setItem(`${provider}_api_key`, key);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full bg-ide-surface border-l border-ide-border w-[380px] animate-slide-in-right",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-3 border-b border-ide-border bg-ide-surface/80 backdrop-blur-sm flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded-lg bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                    size: 15,
                                    className: "text-white"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm font-semibold text-white flex items-center gap-1.5",
                                        children: [
                                            "AI ",
                                            mode === "agent" ? "Agent" : mode === "review" ? "Review" : mode === "debug" ? "Debug" : "Chat",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                size: 11,
                                                className: "text-ide-accent-light"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/AIPanel.tsx",
                                                lineNumber: 117,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[9px] text-ide-muted",
                                        children: providerConfigs[selectedProvider]?.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 119,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    clearMessages();
                                },
                                className: "p-1.5 rounded-md text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200",
                                title: "Clear chat",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowSettings(!showSettings),
                                className: `p-1.5 rounded-md transition-all duration-200 ${showSettings ? "text-ide-accent-light bg-ide-accent/10" : "text-ide-muted hover:text-white hover:bg-ide-hover"}`,
                                title: "Settings",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex px-3 py-2 gap-1 border-b border-ide-border/50 bg-ide-elevated/30",
                children: modes.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setMode(m.id),
                        className: `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${mode === m.id ? "bg-ide-accent/15 text-ide-accent-light border border-ide-accent/20" : "text-ide-muted hover:text-white hover:bg-ide-hover/50"}`,
                        children: [
                            m.icon,
                            m.label
                        ]
                    }, m.id, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            showSettings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-3 border-b border-ide-border bg-ide-elevated/50 space-y-3 animate-slide-down",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-medium text-ide-muted uppercase tracking-wider min-w-[60px]",
                                children: "Provider"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: selectedProvider,
                                onChange: (e)=>setProvider(e.target.value),
                                className: "flex-1 bg-ide-elevated border border-ide-border rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-ide-accent/50 transition-colors cursor-pointer",
                                children: providers.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: p,
                                        children: providerConfigs[p]?.label || p
                                    }, p, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 171,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-medium text-ide-muted uppercase tracking-wider",
                                children: [
                                    "API Key (",
                                    selectedProvider,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "password",
                                value: providerConfigs[selectedProvider]?.apiKey || "",
                                onChange: (e)=>handleApiKeyChange(selectedProvider, e.target.value),
                                placeholder: "Enter your API key...",
                                className: "w-full bg-ide-elevated border border-ide-border rounded-md px-3 py-1.5 text-xs text-white placeholder-ide-muted/50 outline-none focus:border-ide-accent/50 transition-colors font-mono"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 179,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 175,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            currentPlan && currentPlan.status !== "completed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-3 border-b border-ide-border bg-ide-accent/5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2 h-2 rounded-full bg-ide-accent animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-medium text-ide-accent-light uppercase tracking-wider",
                                children: [
                                    "Plan: ",
                                    currentPlan.status
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 193,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-ide-muted mb-2",
                        children: currentPlan.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    currentPlan.steps.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: currentPlan.steps.map((step)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-[10px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-1.5 h-1.5 rounded-full flex-shrink-0 ${step.status === "completed" ? "bg-green-400" : step.status === "in_progress" ? "bg-ide-accent animate-pulse" : step.status === "error" ? "bg-red-400" : "bg-ide-muted/30"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 204,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `${step.status === "completed" ? "text-gray-400 line-through" : step.status === "in_progress" ? "text-white" : "text-gray-500"}`,
                                        children: step.description
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 209,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, step.id, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 203,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 201,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 192,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4 space-y-4",
                children: [
                    messages.length === 0 && !isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center h-full gap-5 animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-12 h-12 rounded-xl bg-gradient-to-br from-ide-accent/15 to-ide-accent-light/10 border border-ide-accent/15 flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    size: 20,
                                    className: "text-ide-accent-light"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 227,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-white",
                                        children: "What can I help with?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 230,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-ide-muted",
                                        children: mode === "agent" ? "I can autonomously modify your project files" : mode === "review" ? "I can review your code for issues" : mode === "debug" ? "I can help debug errors" : "I can answer coding questions"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 231,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 229,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 justify-center max-w-[280px]",
                                children: suggestedPrompts.map((prompt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>sendMessage(prompt),
                                        className: "text-[11px] px-3 py-1.5 rounded-full border border-ide-border text-ide-muted hover:text-white hover:border-ide-accent/30 hover:bg-ide-accent/5 transition-all duration-200",
                                        children: prompt
                                    }, prompt, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 239,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 237,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    messages.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex gap-3 animate-slide-up ${m.role === "user" ? "flex-row-reverse" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${m.role === "user" ? "bg-ide-accent/20 border border-ide-accent/30" : "bg-gradient-to-br from-ide-accent to-ide-accent-light shadow-glow-sm"}`,
                                    children: m.role === "user" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        size: 12,
                                        className: "text-ide-accent-light"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 259,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                        size: 12,
                                        className: "text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 260,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 253,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex flex-col gap-1 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `px-3 py-2 rounded-xl text-sm ${m.role === "user" ? "bg-ide-accent text-white rounded-tr-sm" : "bg-ide-elevated border border-ide-border text-gray-200 rounded-tl-sm"}`,
                                            children: m.role === "assistant" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chat-markdown",
                                                dangerouslySetInnerHTML: renderMarkdown(m.content)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/AIPanel.tsx",
                                                lineNumber: 271,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "whitespace-pre-wrap",
                                                children: m.content
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/AIPanel.tsx",
                                                lineNumber: 273,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 265,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-1.5 mt-1",
                                            children: m.toolCalls.map((tc, tci)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `text-[9px] px-2 py-0.5 rounded-full border transition-all duration-200 ${tc.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400" : tc.status === "running" ? "bg-ide-accent/10 border-ide-accent/20 text-ide-accent-light animate-pulse" : tc.status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-ide-elevated border-ide-border text-ide-muted"}`,
                                                    children: tc.name
                                                }, tci, false, {
                                                    fileName: "[project]/src/components/AIPanel.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 278,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        m.role === "assistant" && extractCodeBlocks(m.content).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-1.5 mt-1",
                                            children: extractCodeBlocks(m.content).map((block, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                window.dispatchEvent(new CustomEvent("ide:apply-code", {
                                                                    detail: block.code
                                                                }));
                                                            },
                                                            className: "flex items-center gap-1 text-[10px] bg-ide-accent/10 hover:bg-ide-accent/20 text-ide-accent-light px-2 py-1 rounded-md border border-ide-accent/15 transition-all duration-200 hover:shadow-glow-sm",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/AIPanel.tsx",
                                                                    lineNumber: 308,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                "Apply"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/AIPanel.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>copyCode(block.code, i * 100 + idx),
                                                            className: "p-1 rounded-md bg-ide-elevated hover:bg-ide-hover border border-ide-border text-ide-muted hover:text-white transition-all duration-200",
                                                            title: "Copy code",
                                                            children: copiedIdx === i * 100 + idx ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                size: 10,
                                                                className: "text-green-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/AIPanel.tsx",
                                                                lineNumber: 316,
                                                                columnNumber: 56
                                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/AIPanel.tsx",
                                                                lineNumber: 316,
                                                                columnNumber: 105
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/AIPanel.tsx",
                                                            lineNumber: 311,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/src/components/AIPanel.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 299,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 264,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, m.id || i, true, {
                            fileName: "[project]/src/components/AIPanel.tsx",
                            lineNumber: 252,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))),
                    isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-6 h-6 rounded-full bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                    size: 12,
                                    className: "text-white"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 328,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-ide-elevated border border-ide-border rounded-xl rounded-tl-sm px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot",
                                            style: {
                                                animationDelay: "0ms"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 333,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot",
                                            style: {
                                                animationDelay: "200ms"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 334,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot",
                                            style: {
                                                animationDelay: "400ms"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AIPanel.tsx",
                                            lineNumber: 335,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 332,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 331,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 327,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: messagesEndRef
                    }, void 0, false, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 340,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-ide-border bg-ide-surface/80 backdrop-blur-sm",
                children: [
                    !providerConfigs[selectedProvider]?.apiKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-400 text-center",
                        children: "API Key required — add it in settings"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 346,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                value: input,
                                onChange: (e)=>{
                                    setInput(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                                },
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                },
                                placeholder: mode === "agent" ? "Tell the agent what to do..." : "Ask a question...",
                                rows: 1,
                                className: "w-full bg-ide-elevated border border-ide-border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-ide-muted/50 focus:outline-none focus:border-ide-accent/40 focus:shadow-glow-sm resize-none transition-all duration-200"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 351,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>isStreaming ? cancelStreaming() : sendMessage(),
                                className: "absolute right-2 bottom-2 p-2 bg-ide-accent hover:bg-ide-accent-light rounded-lg text-white transition-all duration-200 hover:shadow-glow-sm",
                                children: isStreaming ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 14,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 374,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AIPanel.tsx",
                                    lineNumber: 376,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 369,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 350,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mt-2 px-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-ide-muted/40",
                                children: "Enter to send · Shift+Enter for newline"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 381,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-1.5 h-1.5 rounded-full ${providerConfigs[selectedProvider]?.apiKey ? "bg-green-400" : "bg-yellow-400"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] text-ide-muted/40",
                                        children: providerConfigs[selectedProvider]?.apiKey ? "Connected" : "No Key"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AIPanel.tsx",
                                        lineNumber: 384,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AIPanel.tsx",
                                lineNumber: 382,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AIPanel.tsx",
                        lineNumber: 380,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AIPanel.tsx",
                lineNumber: 344,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/AIPanel.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AIPanel, "ShRbdrROY5UhSHsBUCSv6/iYIF8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"]
    ];
});
_c = AIPanel;
const __TURBOPACK__default__export__ = AIPanel;
var _c;
__turbopack_context__.k.register(_c, "AIPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AIPanel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/AIPanel.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_0ki_ds3._.js.map