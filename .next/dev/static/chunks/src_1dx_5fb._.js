(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/components/CommandPalette.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommandPalette",
    ()=>CommandPalette,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cmdk/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/files.js [app-client] (ecmascript) <export default as Files>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-client] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bug.js [app-client] (ecmascript) <export default as Bug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/layoutStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/terminalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/fileSystemStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
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
const CommandPalette = ({ onClose })=>{
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommandPalette.useEffect": ()=>{
            inputRef.current?.focus();
        }
    }["CommandPalette.useEffect"], []);
    const closePalette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandPalette.useCallback[closePalette]": ()=>{
            onClose();
        }
    }["CommandPalette.useCallback[closePalette]"], [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommandPalette.useEffect": ()=>{
            const handler = {
                "CommandPalette.useEffect.handler": (e)=>{
                    if (e.key === "Escape") closePalette();
                }
            }["CommandPalette.useEffect.handler"];
            window.addEventListener("keydown", handler);
            return ({
                "CommandPalette.useEffect": ()=>window.removeEventListener("keydown", handler)
            })["CommandPalette.useEffect"];
        }
    }["CommandPalette.useEffect"], [
        closePalette
    ]);
    const items = [
        {
            id: "open-folder",
            label: "Open Folder",
            description: "Open a project folder",
            category: "Files",
            keywords: [
                "open",
                "folder",
                "directory",
                "project"
            ],
            icon: "FolderOpen",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:open-folder"));
                closePalette();
            }
        },
        {
            id: "save-file",
            label: "Save File",
            description: "Save the current file",
            category: "Files",
            shortcut: "\u2318S",
            keywords: [
                "save",
                "write",
                "persist"
            ],
            icon: "Save",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:save-file"));
                closePalette();
            }
        },
        {
            id: "close-file",
            label: "Close Current Tab",
            description: "Close the active file tab",
            category: "Files",
            shortcut: "\u2318W",
            keywords: [
                "close",
                "tab",
                "file"
            ],
            icon: "X",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:close-tab"));
                closePalette();
            }
        },
        {
            id: "close-all-tabs",
            label: "Close All Tabs",
            description: "Close all open file tabs",
            category: "Files",
            keywords: [
                "close",
                "all",
                "tabs",
                "files"
            ],
            icon: "X",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$fileSystemStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFileSystemStore"].getState().closeAllTabs();
                closePalette();
            }
        },
        {
            id: "ai-chat",
            label: "Toggle AI Chat",
            description: "Open or close the AI chat panel",
            category: "AI Actions",
            shortcut: "\u2318L",
            keywords: [
                "ai",
                "chat",
                "assistant",
                "toggle"
            ],
            icon: "MessageSquare",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"].getState().toggleAiSidebar();
                closePalette();
            }
        },
        {
            id: "inline-ai",
            label: "Inline AI Edit",
            description: "Edit code with AI inline",
            category: "AI Actions",
            shortcut: "\u2318K",
            keywords: [
                "inline",
                "ai",
                "edit",
                "code"
            ],
            icon: "Sparkles",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:inline-ai"));
                closePalette();
            }
        },
        {
            id: "ai-agent-mode",
            label: "Agent Mode",
            description: "Let AI autonomously modify files",
            category: "AI Actions",
            keywords: [
                "agent",
                "autonomous",
                "mode"
            ],
            icon: "Bot",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().setMode("agent");
                closePalette();
            }
        },
        {
            id: "ai-review-mode",
            label: "Code Review Mode",
            description: "Review selected code with AI",
            category: "AI Actions",
            keywords: [
                "review",
                "code review",
                "audit"
            ],
            icon: "Search",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().setMode("review");
                closePalette();
            }
        },
        {
            id: "ai-debug-mode",
            label: "Debug Mode",
            description: "Debug code with AI assistance",
            category: "AI Actions",
            keywords: [
                "debug",
                "fix",
                "error"
            ],
            icon: "Bug",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().setMode("debug");
                closePalette();
            }
        },
        {
            id: "clear-chat",
            label: "Clear Chat History",
            description: "Clear all AI chat messages",
            category: "AI Actions",
            keywords: [
                "clear",
                "chat",
                "history",
                "reset"
            ],
            icon: "X",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$aiStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAIStore"].getState().clearMessages();
                closePalette();
            }
        },
        {
            id: "global-search",
            label: "Global Search",
            description: "Search across all files",
            category: "Editor",
            shortcut: "\u2318\u21E7F",
            keywords: [
                "search",
                "find",
                "global"
            ],
            icon: "Search",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:global-search"));
                closePalette();
            }
        },
        {
            id: "toggle-sidebar",
            label: "Toggle Sidebar",
            description: "Show or hide the file sidebar",
            category: "Editor",
            shortcut: "\u2318B",
            keywords: [
                "sidebar",
                "toggle",
                "panel"
            ],
            icon: "Files",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"].getState().toggleSidebar();
                closePalette();
            }
        },
        {
            id: "toggle-terminal",
            label: "Toggle Terminal",
            description: "Open or close the terminal panel",
            category: "Editor",
            shortcut: "\u2318`",
            keywords: [
                "terminal",
                "console",
                "shell"
            ],
            icon: "Terminal",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$terminalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTerminalStore"].getState().toggleTerminal();
                closePalette();
            }
        },
        {
            id: "zen-mode",
            label: "Toggle Zen Mode",
            description: "Focus on code with minimal UI",
            category: "Editor",
            keywords: [
                "zen",
                "focus",
                "distraction",
                "fullscreen"
            ],
            icon: "Maximize2",
            action: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$layoutStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutStore"].getState().toggleZenMode();
                closePalette();
            }
        },
        {
            id: "focus-explorer",
            label: "Focus File Explorer",
            description: "Jump to the file explorer",
            category: "Editor",
            shortcut: "\u2318\u21E7E",
            keywords: [
                "explorer",
                "files",
                "focus"
            ],
            icon: "Files",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:focus-explorer"));
                closePalette();
            }
        },
        {
            id: "focus-ai",
            label: "Focus AI Panel",
            description: "Jump to the AI chat panel",
            category: "Editor",
            shortcut: "\u2318\u21E7G",
            keywords: [
                "ai",
                "focus",
                "chat"
            ],
            icon: "MessageSquare",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:focus-ai"));
                closePalette();
            }
        },
        {
            id: "preview",
            label: "Toggle Preview",
            description: "Open or close the live preview panel",
            category: "View",
            keywords: [
                "preview",
                "live",
                "html",
                "browser"
            ],
            icon: "Globe",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:toggle-preview"));
                closePalette();
            }
        },
        {
            id: "file-explorer",
            label: "Show File Explorer",
            description: "Switch sidebar to file explorer",
            category: "View",
            keywords: [
                "explorer",
                "files"
            ],
            icon: "Files",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:sidebar-view", {
                    detail: "explorer"
                }));
                closePalette();
            }
        },
        {
            id: "search-view",
            label: "Show Search Panel",
            description: "Switch sidebar to search",
            category: "View",
            keywords: [
                "search",
                "find"
            ],
            icon: "Search",
            action: ()=>{
                window.dispatchEvent(new CustomEvent("ide:sidebar-view", {
                    detail: "search"
                }));
                closePalette();
            }
        }
    ];
    const getIcon = (iconName)=>{
        const size = 16;
        switch(iconName){
            case "FolderOpen":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 76,
                    columnNumber: 33
                }, ("TURBOPACK compile-time value", void 0));
            case "Save":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 77,
                    columnNumber: 27
                }, ("TURBOPACK compile-time value", void 0));
            case "X":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 78,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            case "MessageSquare":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 79,
                    columnNumber: 36
                }, ("TURBOPACK compile-time value", void 0));
            case "Sparkles":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 80,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0));
            case "Search":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 81,
                    columnNumber: 29
                }, ("TURBOPACK compile-time value", void 0));
            case "Terminal":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 82,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0));
            case "Files":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__["Files"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 83,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            case "Maximize2":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 84,
                    columnNumber: 32
                }, ("TURBOPACK compile-time value", void 0));
            case "Bug":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__["Bug"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 85,
                    columnNumber: 26
                }, ("TURBOPACK compile-time value", void 0));
            case "Globe":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 86,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            case "Code":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 87,
                    columnNumber: 27
                }, ("TURBOPACK compile-time value", void 0));
            case "Settings":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 88,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0));
            case "File":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 89,
                    columnNumber: 27
                }, ("TURBOPACK compile-time value", void 0));
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"], {
                    size: size
                }, void 0, false, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 90,
                    columnNumber: 23
                }, ("TURBOPACK compile-time value", void 0));
        }
    };
    const groupedItems = items.reduce((acc, item)=>{
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});
    const categories = [
        "Files",
        "AI Actions",
        "Editor",
        "View"
    ].filter((cat)=>groupedItems[cat] && groupedItems[cat].length > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in",
        onClick: closePalette,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
            }, void 0, false, {
                fileName: "[project]/src/components/CommandPalette.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-[600px] max-w-[90vw] bg-ide-surface border border-ide-border rounded-xl shadow-2xl overflow-hidden animate-slide-up",
                onClick: (e)=>e.stopPropagation(),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"], {
                    label: "Command Palette",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center border-b border-ide-border px-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Input, {
                                    ref: inputRef,
                                    value: search,
                                    onValueChange: setSearch,
                                    placeholder: "Search commands...",
                                    className: "flex-1 bg-transparent py-3.5 text-sm text-white placeholder-ide-muted/50 outline-none"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: closePalette,
                                    className: "p-1 text-ide-muted hover:text-white rounded-md hover:bg-ide-hover transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                        lineNumber: 127,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CommandPalette.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].List, {
                            className: "max-h-[350px] overflow-y-auto p-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Empty, {
                                    className: "py-8 text-center text-sm text-ide-muted",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                size: 20,
                                                className: "text-ide-muted/50"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/CommandPalette.tsx",
                                                lineNumber: 134,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    'No commands found for "',
                                                    search,
                                                    '"'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/CommandPalette.tsx",
                                                lineNumber: 135,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Group, {
                                        heading: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-semibold uppercase tracking-wider text-ide-muted px-2 py-1.5",
                                            children: category
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CommandPalette.tsx",
                                            lineNumber: 143,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        children: groupedItems[category]?.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Item, {
                                                value: item.id + " " + item.label + " " + item.keywords.join(" "),
                                                onSelect: ()=>item.action(),
                                                className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 aria-selected:bg-ide-hover aria-selected:text-white cursor-pointer transition-colors group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-7 h-7 flex items-center justify-center rounded-md bg-ide-elevated border border-ide-border text-ide-muted group-aria-selected:text-ide-accent-light group-aria-selected:border-ide-accent/20 transition-colors",
                                                        children: getIcon(item.icon)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-medium truncate",
                                                                children: item.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/CommandPalette.tsx",
                                                                lineNumber: 159,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            item.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[10px] text-ide-muted truncate mt-0.5",
                                                                children: item.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/CommandPalette.tsx",
                                                                lineNumber: 161,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    item.shortcut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                        className: "flex-shrink-0 text-[10px] font-mono bg-ide-elevated border border-ide-border rounded px-1.5 py-0.5 text-ide-muted",
                                                        children: item.shortcut
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                                        lineNumber: 167,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, item.id, true, {
                                                fileName: "[project]/src/components/CommandPalette.tsx",
                                                lineNumber: 149,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, category, false, {
                                        fileName: "[project]/src/components/CommandPalette.tsx",
                                        lineNumber: 140,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CommandPalette.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-ide-border px-4 py-2 flex items-center justify-between text-[10px] text-ide-muted/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                    className: "font-mono bg-ide-elevated border border-ide-border rounded px-1",
                                                    children: "\\u2191\\u2193"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                                    lineNumber: 179,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                " Navigate"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CommandPalette.tsx",
                                            lineNumber: 179,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                    className: "font-mono bg-ide-elevated border border-ide-border rounded px-1",
                                                    children: "\\u21B5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                                    lineNumber: 180,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                " Select"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CommandPalette.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                    className: "font-mono bg-ide-elevated border border-ide-border rounded px-1",
                                                    children: "Esc"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                                    lineNumber: 181,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                " Close"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CommandPalette.tsx",
                                            lineNumber: 181,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                    lineNumber: 178,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden sm:inline",
                                    children: [
                                        items.length,
                                        " commands"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CommandPalette.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CommandPalette.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CommandPalette.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/CommandPalette.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/CommandPalette.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(CommandPalette, "uH96sgZF1HnYeCbUUeit3ewILMc=");
_c = CommandPalette;
const __TURBOPACK__default__export__ = CommandPalette;
var _c;
__turbopack_context__.k.register(_c, "CommandPalette");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/CommandPalette.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/CommandPalette.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_1dx_5fb._.js.map