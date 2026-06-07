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
"[project]/src/lib/ai/providers/claude.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClaudeProvider",
    ()=>ClaudeProvider,
    "default",
    ()=>__TURBOPACK__default__export__
]);
class ClaudeProvider {
    name = "claude";
    async *streamChat(messages, options) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            yield {
                type: "error",
                message: "Claude API key not configured"
            };
            return;
        }
        const hasTools = options?.tools && options.tools.length > 0;
        let currentMessages = [
            ...messages
        ];
        let lastContent = "";
        // Claude uses a multi-turn approach similar to Gemini for tool use
        let hasToolCalls = true;
        let iterations = 0;
        const maxIterations = 10;
        while(hasToolCalls && iterations < maxIterations){
            hasToolCalls = false;
            iterations++;
            try {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": apiKey,
                        "anthropic-version": "2023-06-01"
                    },
                    body: JSON.stringify({
                        model: options?.model || "claude-sonnet-4",
                        max_tokens: 8192,
                        system: options?.systemPrompt || undefined,
                        messages: currentMessages.filter((m)=>m.role !== "system").map((m)=>{
                            // If content is already an array (content blocks), pass as-is
                            if (Array.isArray(m.content)) {
                                return {
                                    role: m.role === "assistant" ? "assistant" : "user",
                                    content: m.content
                                };
                            }
                            return {
                                role: m.role === "assistant" ? "assistant" : "user",
                                content: m.content
                            };
                        }),
                        tools: hasTools ? options.tools.map((t)=>({
                                name: t.name,
                                description: t.description,
                                input_schema: {
                                    type: t.parameters.type,
                                    properties: t.parameters.properties,
                                    required: t.parameters.required
                                }
                            })) : undefined
                    }),
                    signal: options?.signal
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    yield {
                        type: "error",
                        message: `Claude API error: ${errorText}`
                    };
                    return;
                }
                const data = await response.json();
                // Process content blocks
                for (const block of data.content || []){
                    if (block.type === "text") {
                        yield {
                            type: "text",
                            content: block.text
                        };
                        lastContent = block.text;
                    } else if (block.type === "tool_use" && options?.onToolCall) {
                        hasToolCalls = true;
                        const toolCall = {
                            name: block.name,
                            args: block.input,
                            id: block.id
                        };
                        yield {
                            type: "tool_call",
                            toolCall
                        };
                        const result = await options.onToolCall(toolCall);
                        currentMessages.push({
                            role: "assistant",
                            content: [
                                {
                                    type: "text",
                                    text: lastContent || ""
                                },
                                {
                                    type: "tool_use",
                                    id: block.id,
                                    name: block.name,
                                    input: block.input
                                }
                            ]
                        }, {
                            role: "user",
                            content: [
                                {
                                    type: "tool_result",
                                    tool_use_id: block.id,
                                    content: JSON.stringify(result)
                                }
                            ]
                        });
                    }
                }
                if (!hasToolCalls) {
                    yield {
                        type: "done",
                        content: lastContent
                    };
                    return;
                }
            } catch (err) {
                if (err.name === "AbortError") return;
                yield {
                    type: "error",
                    message: err.message
                };
                return;
            }
        }
        yield {
            type: "done",
            content: lastContent
        };
    }
    async chat(messages, options) {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error("Claude API key not configured");
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: options?.model || "claude-sonnet-4",
                max_tokens: 8192,
                system: options?.systemPrompt || undefined,
                messages: messages.filter((m)=>m.role !== "system").map((m)=>({
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: m.content
                    }))
            }),
            signal: options?.signal
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error: ${errorText}`);
        }
        const data = await response.json();
        return data.content?.[0]?.text || "";
    }
    getApiKey() {
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                // Use dynamic import-compatible pattern (handled by bundler)
                const { useAIStore } = __turbopack_context__.r("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
                const config = useAIStore.getState().providerConfigs.claude;
                if (config.apiKey) return config.apiKey;
            } catch  {}
            return localStorage.getItem("claude_api_key") || "";
        }
        //TURBOPACK unreachable
        ;
    }
}
const __TURBOPACK__default__export__ = ClaudeProvider;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStore",
    ()=>createStore
]);
const createStoreImpl = (createState)=>{
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace)=>{
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
            listeners.forEach((listener)=>listener(state, previousState));
        }
    };
    const getState = ()=>state;
    const getInitialState = ()=>initialState;
    const subscribe = (listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    };
    const api = {
        setState,
        getState,
        getInitialState,
        subscribe
    };
    const initialState = state = createState(setState, getState, api);
    return api;
};
const createStore = (createState)=>createState ? createStoreImpl(createState) : createStoreImpl;
;
}),
"[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "create",
    ()=>create,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)");
;
;
const identity = (arg)=>arg;
function useStore(api, selector = identity) {
    const slice = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useSyncExternalStore(api.subscribe, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getInitialState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]));
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDebugValue(slice);
    return slice;
}
const createImpl = (createState)=>{
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])(createState);
    const useBoundStore = (selector)=>useStore(api, selector);
    Object.assign(useBoundStore, api);
    return useBoundStore;
};
const create = (createState)=>createState ? createImpl(createState) : createImpl;
;
}),
]);

//# sourceMappingURL=_0i05qzk._.js.map