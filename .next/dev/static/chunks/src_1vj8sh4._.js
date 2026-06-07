(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/stores/layoutStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLayoutStore",
    ()=>useLayoutStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useLayoutStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        sidebarOpen: true,
        aiSidebarOpen: true,
        sidebarWidth: 256,
        aiSidebarWidth: 320,
        activityBarPosition: 'left',
        isMobile: false,
        zenMode: false,
        setSidebarOpen: (open)=>set({
                sidebarOpen: open
            }),
        toggleSidebar: ()=>set({
                sidebarOpen: !get().sidebarOpen
            }),
        setAiSidebarOpen: (open)=>set({
                aiSidebarOpen: open
            }),
        toggleAiSidebar: ()=>set({
                aiSidebarOpen: !get().aiSidebarOpen
            }),
        setSidebarWidth: (width)=>set({
                sidebarWidth: Math.max(200, Math.min(500, width))
            }),
        setAiSidebarWidth: (width)=>set({
                aiSidebarWidth: Math.max(240, Math.min(600, width))
            }),
        setActivityBarPosition: (pos)=>set({
                activityBarPosition: pos
            }),
        setIsMobile: (mobile)=>set({
                isMobile: mobile,
                sidebarOpen: !mobile,
                aiSidebarOpen: !mobile
            }),
        setZenMode: (zen)=>set({
                zenMode: zen
            }),
        toggleZenMode: ()=>set({
                zenMode: !get().zenMode
            })
    }), {
    name: 'layout-store',
    partialize: (state)=>({
            sidebarWidth: state.sidebarWidth,
            aiSidebarWidth: state.aiSidebarWidth,
            activityBarPosition: state.activityBarPosition
        })
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
"[project]/src/hooks/useKeyboardShortcuts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useKeyboardShortcuts",
    ()=>useKeyboardShortcuts,
    "useShortcut",
    ()=>useShortcut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/layoutStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/terminalStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
function useKeyboardShortcuts(customShortcuts) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useKeyboardShortcuts.useEffect": ()=>{
            const handleKeyDown = {
                "useKeyboardShortcuts.useEffect.handleKeyDown": (e)=>{
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
                        switch(key){
                            case "`":
                                e.preventDefault();
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState().toggleTerminal();
                                break;
                            case "b":
                                e.preventDefault();
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"].getState().toggleSidebar();
                                break;
                            case "s":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:save-file"));
                                break;
                            case "w":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:close-tab"));
                                break;
                            case "tab":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:next-tab"));
                                break;
                            case "k":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:inline-ai"));
                                break;
                        }
                    }
                    // Ctrl/Cmd + Shift + shortcuts
                    if (isCtrlOrCmd && isShift && !e.altKey) {
                        switch(key){
                            case "p":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:command-palette"));
                                break;
                            case "e":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:focus-explorer"));
                                break;
                            case "g":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:focus-ai"));
                                break;
                            case "tab":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:prev-tab"));
                                break;
                            case "f":
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent("ide:global-search"));
                                break;
                        }
                    }
                }
            }["useKeyboardShortcuts.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "useKeyboardShortcuts.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["useKeyboardShortcuts.useEffect"];
        }
    }["useKeyboardShortcuts.useEffect"], [
        customShortcuts
    ]);
}
_s(useKeyboardShortcuts, "OD7bBpZva5O2jO+Puf00hKivP7c=");
function getKeyCombo(ctrl, shift, alt, key) {
    const parts = [];
    if (ctrl) parts.push("ctrl");
    if (shift) parts.push("shift");
    if (alt) parts.push("alt");
    parts.push(key);
    return parts.join("+");
}
function useShortcut(key, handler) {
    _s1();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useShortcut.useEffect": ()=>{
            const onEvent = {
                "useShortcut.useEffect.onEvent": ()=>handler()
            }["useShortcut.useEffect.onEvent"];
            window.addEventListener(key, onEvent);
            return ({
                "useShortcut.useEffect": ()=>window.removeEventListener(key, onEvent)
            })["useShortcut.useEffect"];
        }
    }["useShortcut.useEffect"], [
        key,
        handler
    ]);
}
_s1(useShortcut, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fileSystem.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDirectory",
    ()=>createDirectory,
    "createFile",
    ()=>createFile,
    "deleteItem",
    ()=>deleteItem,
    "findHandleByPath",
    ()=>findHandleByPath,
    "findParentDirectoryHandle",
    ()=>findParentDirectoryHandle,
    "getFilesRecursively",
    ()=>getFilesRecursively,
    "readFile",
    ()=>readFile,
    "writeFile",
    ()=>writeFile
]);
async function getFilesRecursively(directoryHandle, path = '') {
    const items = [];
    // @ts-ignore
    for await (const entry of directoryHandle.values()){
        const itemPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === 'directory') {
            items.push({
                name: entry.name,
                kind: 'directory',
                handle: entry,
                path: itemPath,
                children: await getFilesRecursively(entry, itemPath)
            });
        } else {
            items.push({
                name: entry.name,
                kind: 'file',
                handle: entry,
                path: itemPath
            });
        }
    }
    return items.sort((a, b)=>{
        if (a.kind === b.kind) {
            return a.name.localeCompare(b.name);
        }
        return a.kind === 'directory' ? -1 : 1;
    });
}
async function readFile(fileHandle) {
    const file = await fileHandle.getFile();
    return await file.text();
}
async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}
async function createFile(directoryHandle, name) {
    return await directoryHandle.getFileHandle(name, {
        create: true
    });
}
async function createDirectory(directoryHandle, name) {
    return await directoryHandle.getDirectoryHandle(name, {
        create: true
    });
}
async function deleteItem(directoryHandle, name) {
    // @ts-ignore
    await directoryHandle.removeEntry(name, {
        recursive: true
    });
}
function findHandleByPath(items, path) {
    for (const item of items){
        if (item.path === path) {
            return item.handle;
        }
        if (item.children) {
            const found = findHandleByPath(item.children, path);
            if (found) return found;
        }
    }
    return null;
}
function findParentDirectoryHandle(items, path, rootHandle) {
    const parts = path.split('/');
    if (parts.length <= 1) return rootHandle;
    const parentPath = parts.slice(0, -1).join('/');
    const handle = findHandleByPath(items, parentPath);
    if (handle && handle.kind === 'directory') {
        return handle;
    }
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/IDEApp.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$monaco$2d$editor$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@monaco-editor/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/files.js [app-client] (ecmascript) <export default as Files>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$keyboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Keyboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/keyboard.js [app-client] (ecmascript) <export default as Keyboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-client] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-client] (ecmascript)");
// Store imports
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/fileSystemStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/layoutStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/terminalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useKeyboardShortcuts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fileSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fileSystem.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
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
;
;
;
// Dynamic imports for components that use browser APIs
const CommandPalette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/CommandPalette.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/CommandPalette.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = CommandPalette;
const TerminalPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/TerminalPanel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/TerminalPanel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c1 = TerminalPanel;
const StatusBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/StatusBar.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/StatusBar.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c2 = StatusBar;
const LivePreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/LivePreview.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/LivePreview.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c3 = LivePreview;
const AIPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/AIPanel.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/AIPanel.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c4 = AIPanel;
const InlineAI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/InlineAI.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.InlineAI), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/InlineAI.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c5 = InlineAI;
const GlobalSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/GlobalSearch.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.GlobalSearch), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/GlobalSearch.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c6 = GlobalSearch;
const FileExplorer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/FileExplorer.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.FileExplorer), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/FileExplorer.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c7 = FileExplorer;
const MobileSidebarOverlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/MobileSidebarOverlay.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.MobileSidebarOverlay), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/MobileSidebarOverlay.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c8 = MobileSidebarOverlay;
const IDEApp = ()=>{
    _s();
    // ── Store State ─────────────────────────────────────────
    const { files, openTabs, activeFilePath, setFiles, setRootHandle, openFile, closeTab, setActiveFile, updateTabContent, markTabSaved } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFileSystemStore"])();
    const { sidebarOpen, aiSidebarOpen, sidebarWidth, isMobile, zenMode, toggleSidebar, toggleAiSidebar } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"])();
    const { isTerminalOpen, toggleTerminal, addSession, setActiveSession } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"])();
    const { selectedProvider, providerConfigs, updateProviderConfig } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"])();
    // ── Local State ─────────────────────────────────────────
    const [sidebarView, setSidebarView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("explorer");
    const [showCommandPalette, setShowCommandPalette] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPreview, setShowPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(14);
    const [editorTheme, setEditorTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("vs-dark");
    const [inlineAI, setInlineAI] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        visible: false,
        position: {
            top: 0,
            left: 0
        }
    });
    const editorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const monacoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Keyboard Shortcuts ──────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:command-palette", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>setShowCommandPalette(true)
    }["IDEApp.useShortcut.useCallback"], []));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:open-folder", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>handleOpenFolder()
    }["IDEApp.useShortcut.useCallback"], []));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:inline-ai", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>{
            if (editorRef.current) {
                const position = editorRef.current.getPosition();
                if (!position) return;
                const pos = editorRef.current.getScrolledVisiblePosition(position);
                const domNode = editorRef.current.getDomNode();
                if (domNode && pos) {
                    const rect = domNode.getBoundingClientRect();
                    setInlineAI({
                        visible: true,
                        position: {
                            top: rect.top + pos.top + 20,
                            left: rect.left + pos.left
                        }
                    });
                }
            }
        }
    }["IDEApp.useShortcut.useCallback"], []));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:save-file", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>handleSave()
    }["IDEApp.useShortcut.useCallback"], []));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:close-tab", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>{
            if (activeFilePath) closeTab(activeFilePath);
        }
    }["IDEApp.useShortcut.useCallback"], [
        activeFilePath,
        closeTab
    ]));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:sidebar-view", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>{
            setSidebarView("explorer");
        }
    }["IDEApp.useShortcut.useCallback"], []));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"])("ide:toggle-preview", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IDEApp.useShortcut.useCallback": ()=>setShowPreview({
                "IDEApp.useShortcut.useCallback": (p)=>!p
            }["IDEApp.useShortcut.useCallback"])
    }["IDEApp.useShortcut.useCallback"], []));
    // Apply code from AI via custom event (needs event.detail, so direct listener instead of useShortcut)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IDEApp.useEffect": ()=>{
            const handler = {
                "IDEApp.useEffect.handler": (e)=>{
                    const code = e.detail;
                    if (!code || !editorRef.current || !monacoRef.current) return;
                    const selection = editorRef.current.getSelection();
                    const range = new monacoRef.current.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
                    editorRef.current.executeEdits("ai-edit", [
                        {
                            identifier: {
                                major: 1,
                                minor: 1
                            },
                            range,
                            text: code,
                            forceMoveMarkers: true
                        }
                    ]);
                }
            }["IDEApp.useEffect.handler"];
            window.addEventListener("ide:apply-code", handler);
            return ({
                "IDEApp.useEffect": ()=>window.removeEventListener("ide:apply-code", handler)
            })["IDEApp.useEffect"];
        }
    }["IDEApp.useEffect"], []);
    // ── File System Handlers ────────────────────────────────
    const handleOpenFolder = async ()=>{
        try {
            const handle = await window.showDirectoryPicker({
                mode: "readwrite"
            });
            setRootHandle(handle);
            const files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fileSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilesRecursively"])(handle);
            setFiles(files);
        } catch (err) {
            console.error("Directory access denied", err);
        }
    };
    const handleFileSelect = async (item)=>{
        openFile(item);
    };
    const handleSave = async ()=>{
        const activeTab = openTabs.find((t)=>t.file.path === activeFilePath);
        if (activeTab && activeTab.isDirty) {
            markTabSaved(activeFilePath);
            window.dispatchEvent(new CustomEvent("ide:file-saved", {
                detail: {
                    path: activeFilePath,
                    content: activeTab.content
                }
            }));
        }
    };
    const handleEditorChange = (value)=>{
        if (activeFilePath && value !== undefined) {
            updateTabContent(activeFilePath, value);
        }
    };
    const handleEditorDidMount = (editor, monaco)=>{
        editorRef.current = editor;
        monacoRef.current = monaco;
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowJs: true
        });
        // Inline AI shortcut
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, ()=>{
            const position = editor.getPosition();
            if (!position) return;
            const pos = editor.getScrolledVisiblePosition(position);
            const domNode = editor.getDomNode();
            if (domNode && pos) {
                const rect = domNode.getBoundingClientRect();
                setInlineAI({
                    visible: true,
                    position: {
                        top: rect.top + pos.top + 20,
                        left: rect.left + pos.left
                    }
                });
            }
        });
    };
    const handleInlineAISubmit = async (prompt)=>{
        if (!prompt.trim()) return;
        setInlineAI({
            ...inlineAI,
            visible: false
        });
        try {
            const apiKey = providerConfigs.gemini?.apiKey;
            if (!apiKey) return;
            const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"
            });
            const editor = editorRef.current;
            if (!editor) return;
            const selection = editor.getSelection();
            const selectedText = editor.getModel().getValueInRange(selection);
            const activeFile = openTabs.find((t)=>t.file.path === activeFilePath);
            const context = `Task: ${prompt}\n\nContext file: ${activeFile?.file.name || "unknown"}\n\nSelected Code:\n\`\`\`\n${selectedText}\n\`\`\`\n\nEntire File Content:\n\`\`\`\n${activeFile?.content || ""}\n\`\`\`\n\nInstructions: Return ONLY the code to replace the selection or the new code to insert. Do not provide markdown formatting unless it is part of the code. Just the raw code.`;
            const result = await model.generateContent(context);
            const response = await result.response;
            let text = response.text().trim();
            if (text.startsWith("```")) {
                text = text.replace(/^```\w+\n/, "").replace(/\n```$/, "");
            }
            const range = new monacoRef.current.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
            editor.executeEdits("ai-edit", [
                {
                    identifier: {
                        major: 1,
                        minor: 1
                    },
                    range,
                    text,
                    forceMoveMarkers: true
                }
            ]);
        } catch (e) {
            console.error("Inline AI error", e);
        }
    };
    const activeFile = openTabs.find((f)=>f.file.path === activeFilePath);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col h-screen bg-[#0d0d1a] text-gray-300 font-sans antialiased ${zenMode ? "overflow-hidden" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "h-11 flex items-center px-4 justify-between border-b border-[#1e1e3a] bg-[#12122a]/80 backdrop-blur-sm relative z-10 flex-shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed]/30 to-transparent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 group cursor-default",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-6 h-6 rounded-md bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-shadow duration-300",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            size: 13,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/IDEApp.tsx",
                                            lineNumber: 220,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 219,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold tracking-tight text-white text-sm",
                                        children: [
                                            "KEL",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#a78bfa]",
                                                children: "IDE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 223,
                                                columnNumber: 18
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 222,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleOpenFolder,
                                className: "flex items-center gap-1.5 text-xs text-gray-500 hover:text-white px-2.5 py-1 rounded-md hover:bg-[#1e1e3a] transition-all duration-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 231,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Open Folder"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSave,
                                disabled: !activeFile?.isDirty,
                                className: `flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all duration-200 ${activeFile?.isDirty ? "bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/20" : "text-gray-600 cursor-not-allowed"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Save",
                                    activeFile?.isDirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden sm:flex items-center gap-1.5 bg-[#1a1a3a] border border-[#1e1e3a] rounded-md px-2.5 py-1 text-[10px] text-gray-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$keyboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Keyboard$3e$__["Keyboard"], {
                                        size: 11,
                                        className: "text-[#7c3aed]/60"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono",
                                        children: "⌘K"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 255,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "Inline AI"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 256,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 253,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowCommandPalette(true),
                                className: "hidden md:flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white bg-[#1a1a3a] border border-[#1e1e3a] rounded-md px-2.5 py-1 transition-all duration-200 hover:border-[#7c3aed]/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 11
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 263,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono",
                                        children: "⌘⇧P"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 264,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 bg-[#12122a] border-r border-[#1e1e3a] flex flex-col items-center py-3 gap-1 flex-shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__["Files"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/components/IDEApp.tsx",
                                    lineNumber: 273,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0)),
                                active: sidebarView === "explorer" && sidebarOpen,
                                onClick: ()=>{
                                    setSidebarView("explorer");
                                    if (!sidebarOpen) toggleSidebar();
                                },
                                tooltip: "Explorer",
                                shortcut: "⌘B"
                            }, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/components/IDEApp.tsx",
                                    lineNumber: 280,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0)),
                                active: sidebarView === "search",
                                onClick: ()=>{
                                    setSidebarView("search");
                                    if (!sidebarOpen) toggleSidebar();
                                },
                                tooltip: "Search",
                                shortcut: "⌘⇧F"
                            }, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 279,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/IDEApp.tsx",
                                            lineNumber: 291,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        active: isTerminalOpen,
                                        onClick: ()=>{
                                            if (!isTerminalOpen) addSession();
                                            toggleTerminal();
                                        },
                                        tooltip: "Terminal",
                                        shortcut: "⌘`",
                                        accent: isTerminalOpen
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/IDEApp.tsx",
                                            lineNumber: 299,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        active: aiSidebarOpen,
                                        onClick: toggleAiSidebar,
                                        tooltip: "AI Chat",
                                        shortcut: "⌘L",
                                        accent: aiSidebarOpen
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 298,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/IDEApp.tsx",
                                            lineNumber: 307,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        active: showPreview,
                                        onClick: ()=>setShowPreview(!showPreview),
                                        tooltip: "Live Preview"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 306,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityIcon, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/IDEApp.tsx",
                                            lineNumber: 313,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        active: sidebarView === "settings",
                                        onClick: ()=>{
                                            setSidebarView("settings");
                                            if (!sidebarOpen) toggleSidebar();
                                        },
                                        tooltip: "Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 312,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 271,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    sidebarOpen && !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-[#12122a] border-r border-[#1e1e3a] flex flex-col overflow-hidden animate-slide-in-left",
                        style: {
                            width: sidebarWidth
                        },
                        children: [
                            sidebarView === "explorer" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FileExplorer, {
                                items: files,
                                onFileSelect: (item)=>handleFileSelect(item),
                                onOpenFolder: handleOpenFolder,
                                rootHandle: null,
                                activeFilePath: activeFilePath
                            }, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 329,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            sidebarView === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GlobalSearch, {
                                items: files,
                                onResultClick: (item)=>handleFileSelect(item)
                            }, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 338,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            sidebarView === "settings" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col h-full overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1e1e3a] flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                size: 13
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 346,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Settings"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 345,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 p-4 flex flex-col gap-6 overflow-y-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[11px] font-medium text-gray-500 uppercase tracking-wider",
                                                        children: "Font Size"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 351,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "range",
                                                                min: "8",
                                                                max: "32",
                                                                value: fontSize,
                                                                onChange: (e)=>{
                                                                    setFontSize(parseInt(e.target.value));
                                                                    localStorage.setItem("editor_font_size", e.target.value);
                                                                },
                                                                className: "flex-1 accent-[#7c3aed] h-1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 353,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-[#a78bfa] font-mono w-8 text-right",
                                                                children: [
                                                                    fontSize,
                                                                    "px"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 360,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 350,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[11px] font-medium text-gray-500 uppercase tracking-wider",
                                                        children: "Theme"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 364,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: editorTheme,
                                                        onChange: (e)=>{
                                                            setEditorTheme(e.target.value);
                                                            localStorage.setItem("editor_theme", e.target.value);
                                                        },
                                                        className: "bg-[#1a1a3a] border border-[#1e1e3a] p-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#7c3aed]/50 transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "vs-dark",
                                                                children: "Dark"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 370,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "light",
                                                                children: "Light"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 371,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 365,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 363,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[11px] font-medium text-gray-500 uppercase tracking-wider",
                                                        children: "AI Provider"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: selectedProvider,
                                                        onChange: (e)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().setProvider(e.target.value),
                                                        className: "bg-[#1a1a3a] border border-[#1e1e3a] p-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#7c3aed]/50 transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "gemini",
                                                                children: "Gemini"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 381,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "claude",
                                                                children: "Claude"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 382,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "openai",
                                                                children: "OpenAI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 383,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 374,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[11px] font-medium text-gray-500 uppercase tracking-wider",
                                                        children: "Keyboard Shortcuts"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘K",
                                                                action: "Inline AI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 389,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘L",
                                                                action: "Toggle AI Chat"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 390,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘S",
                                                                action: "Save File"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 391,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘B",
                                                                action: "Toggle Sidebar"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘`",
                                                                action: "Toggle Terminal"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 393,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘⇧P",
                                                                action: "Command Palette"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 394,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShortcutRow, {
                                                                keys: "⌘⇧F",
                                                                action: "Global Search"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 395,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 386,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 344,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 324,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col min-w-0 bg-[#0d0d1a]",
                        children: [
                            openTabs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-9 bg-[#12122a]/50 overflow-x-auto border-b border-[#1e1e3a] flex-shrink-0",
                                children: openTabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>setActiveFile(tab.file.path),
                                        className: `group flex items-center gap-2 px-3 text-xs border-r border-[#1e1e3a] cursor-pointer min-w-fit transition-all duration-150 ${activeFilePath === tab.file.path ? "bg-[#0d0d1a] text-white border-t-2 border-t-[#7c3aed]" : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1e3a]/50"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-semibold",
                                                children: tab.file.name.split(".").pop()?.toUpperCase() || "TXT"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 419,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "max-w-[120px] truncate",
                                                children: tab.file.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 422,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            tab.isDirty ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 424,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    closeTab(tab.file.path);
                                                },
                                                className: "opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#1e1e3a] transition-all duration-150",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    size: 11
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/IDEApp.tsx",
                                                    lineNumber: 430,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 426,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, tab.file.path, true, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 410,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 408,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 relative min-h-0",
                                children: [
                                    activeFile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$monaco$2d$editor$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
                                        height: "100%",
                                        theme: editorTheme,
                                        path: activeFile.file.path,
                                        defaultLanguage: "typescript",
                                        language: activeFile.file.name.split(".").pop(),
                                        value: activeFile.content,
                                        onChange: handleEditorChange,
                                        onMount: handleEditorDidMount,
                                        options: {
                                            minimap: {
                                                enabled: false
                                            },
                                            fontSize: fontSize,
                                            wordWrap: "on",
                                            automaticLayout: true,
                                            padding: {
                                                top: 10
                                            },
                                            lineNumbers: "on",
                                            renderLineHighlight: "all",
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            fontLigatures: true,
                                            cursorBlinking: "smooth",
                                            cursorSmoothCaretAnimation: "on",
                                            smoothScrolling: true,
                                            renderWhitespace: "selection",
                                            bracketPairColorization: {
                                                enabled: true
                                            }
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 440,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center justify-center h-full gap-6 animate-fade-in",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 overflow-hidden pointer-events-none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#7c3aed]/5 rounded-full blur-[100px]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/IDEApp.tsx",
                                                    lineNumber: 469,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 468,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative z-10 flex flex-col items-center gap-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#a78bfa]/10 border border-[#7c3aed]/20 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.15)] animate-pulse",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                                            size: 28,
                                                            className: "text-[#a78bfa]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/IDEApp.tsx",
                                                            lineNumber: 474,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "text-lg font-semibold text-white",
                                                                children: [
                                                                    "Welcome to ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent",
                                                                        children: "KEL IDE"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                                        lineNumber: 479,
                                                                        columnNumber: 34
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 478,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-500 max-w-[280px]",
                                                                children: "Open a folder to start coding with AI-powered assistance"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 481,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 477,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleOpenFolder,
                                                        className: "flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#a78bfa] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                                size: 15
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 490,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            "Open Folder"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 486,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-4 mt-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1.5 text-[10px] text-gray-600",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$keyboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Keyboard$3e$__["Keyboard"], {
                                                                        size: 11
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                                        lineNumber: 496,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                                                className: "text-[#7c3aed]/60 font-mono",
                                                                                children: "⌘K"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                                lineNumber: 497,
                                                                                columnNumber: 29
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            " Inline AI"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                                        lineNumber: 497,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 495,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1.5 text-[10px] text-gray-600",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$keyboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Keyboard$3e$__["Keyboard"], {
                                                                        size: 11
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                                        lineNumber: 500,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                                                className: "text-[#7c3aed]/60 font-mono",
                                                                                children: "⌘⇧P"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                                lineNumber: 501,
                                                                                columnNumber: 29
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            " Commands"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                                        lineNumber: 501,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                                lineNumber: 499,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/IDEApp.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/IDEApp.tsx",
                                                lineNumber: 472,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 467,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    inlineAI.visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineAI, {
                                        onClose: ()=>setInlineAI({
                                                ...inlineAI,
                                                visible: false
                                            }),
                                        onSubmit: handleInlineAISubmit,
                                        position: inlineAI.position
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/IDEApp.tsx",
                                        lineNumber: 509,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 438,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TerminalPanel, {}, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 518,
                                columnNumber: 24
                            }, ("TURBOPACK compile-time value", void 0)),
                            !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBar, {}, void 0, false, {
                                fileName: "[project]/src/components/IDEApp.tsx",
                                lineNumber: 521,
                                columnNumber: 24
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 405,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    aiSidebarOpen && !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIPanel, {}, void 0, false, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 526,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    showPreview && !zenMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LivePreview, {
                        onClose: ()=>setShowPreview(false)
                    }, void 0, false, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 531,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 269,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            showCommandPalette && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CommandPalette, {
                onClose: ()=>setShowCommandPalette(false)
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 537,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            isMobile && sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileSidebarOverlay, {
                onClose: ()=>toggleSidebar(),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FileExplorer, {
                    items: files,
                    onFileSelect: (item)=>{
                        handleFileSelect(item);
                        if (isMobile) toggleSidebar();
                    },
                    onOpenFolder: handleOpenFolder,
                    rootHandle: null,
                    activeFilePath: activeFilePath
                }, void 0, false, {
                    fileName: "[project]/src/components/IDEApp.tsx",
                    lineNumber: 543,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 542,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/IDEApp.tsx",
        lineNumber: 212,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(IDEApp, "vfrEVyMZeLTOKa0mV6hh1KFG43s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFileSystemStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useKeyboardShortcuts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useShortcut"]
    ];
});
_c9 = IDEApp;
/* ── Activity Bar Icon ────────────────────────────────────── */ const ActivityIcon = ({ icon, active, onClick, tooltip, shortcut, accent })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClick,
                className: `w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${active ? "text-white bg-[#1e1e3a]" : accent ? "text-[#a78bfa] hover:text-white hover:bg-[#1e1e3a]/50" : "text-gray-500 hover:text-white hover:bg-[#1e1e3a]/50"}`,
                children: icon
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 566,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#7c3aed] rounded-r-full"
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 579,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1a1a3a] border border-[#1e1e3a] rounded-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: tooltip
                    }, void 0, false, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 582,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    shortcut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[8px] text-gray-500 mt-0.5 font-mono",
                        children: shortcut
                    }, void 0, false, {
                        fileName: "[project]/src/components/IDEApp.tsx",
                        lineNumber: 583,
                        columnNumber: 20
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 581,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/IDEApp.tsx",
        lineNumber: 565,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c10 = ActivityIcon;
/* ── Shortcut Row ─────────────────────────────────────────── */ const ShortcutRow = ({ keys, action })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between text-[11px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-500",
                children: action
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 591,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                className: "bg-[#1a1a3a] border border-[#1e1e3a] rounded px-1.5 py-0.5 font-mono text-[10px] text-[#a78bfa]",
                children: keys
            }, void 0, false, {
                fileName: "[project]/src/components/IDEApp.tsx",
                lineNumber: 592,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/IDEApp.tsx",
        lineNumber: 590,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c11 = ShortcutRow;
const __TURBOPACK__default__export__ = IDEApp;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "CommandPalette");
__turbopack_context__.k.register(_c1, "TerminalPanel");
__turbopack_context__.k.register(_c2, "StatusBar");
__turbopack_context__.k.register(_c3, "LivePreview");
__turbopack_context__.k.register(_c4, "AIPanel");
__turbopack_context__.k.register(_c5, "InlineAI");
__turbopack_context__.k.register(_c6, "GlobalSearch");
__turbopack_context__.k.register(_c7, "FileExplorer");
__turbopack_context__.k.register(_c8, "MobileSidebarOverlay");
__turbopack_context__.k.register(_c9, "IDEApp");
__turbopack_context__.k.register(_c10, "ActivityIcon");
__turbopack_context__.k.register(_c11, "ShortcutRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/IDEApp.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/IDEApp.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_1vj8sh4._.js.map