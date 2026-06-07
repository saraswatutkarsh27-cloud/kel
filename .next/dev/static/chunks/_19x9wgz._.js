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
"[project]/src/lib/ai/providers/openai.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpenAIProvider",
    ()=>OpenAIProvider,
    "default",
    ()=>__TURBOPACK__default__export__
]);
class OpenAIProvider {
    name = "openai";
    async *streamChat(messages, options) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            yield {
                type: "error",
                message: "OpenAI API key not configured"
            };
            return;
        }
        const hasTools = options?.tools && options.tools.length > 0;
        let currentMessages = [
            ...messages
        ];
        let lastContent = "";
        let hasToolCalls = true;
        let iterations = 0;
        const maxIterations = 10;
        while(hasToolCalls && iterations < maxIterations){
            hasToolCalls = false;
            iterations++;
            try {
                const body = {
                    model: options?.model || "gpt-4o",
                    messages: [
                        ...options?.systemPrompt ? [
                            {
                                role: "system",
                                content: options.systemPrompt
                            }
                        ] : [],
                        ...currentMessages.map((m)=>({
                                role: m.role === "assistant" ? "assistant" : "user",
                                content: m.content
                            }))
                    ],
                    stream: false
                };
                if (hasTools) {
                    body.tools = options.tools.map((t)=>({
                            type: "function",
                            function: {
                                name: t.name,
                                description: t.description,
                                parameters: t.parameters
                            }
                        }));
                }
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(body),
                    signal: options?.signal
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    yield {
                        type: "error",
                        message: `OpenAI API error: ${errorText}`
                    };
                    return;
                }
                const data = await response.json();
                const choice = data.choices?.[0];
                const message = choice?.message;
                if (message?.content) {
                    yield {
                        type: "text",
                        content: message.content
                    };
                    lastContent = message.content;
                }
                const toolCalls = message?.tool_calls;
                if (toolCalls && toolCalls.length > 0 && options?.onToolCall) {
                    hasToolCalls = true;
                    for (const tc of toolCalls){
                        const toolCall = {
                            name: tc.function.name,
                            args: JSON.parse(tc.function.arguments),
                            id: tc.id
                        };
                        yield {
                            type: "tool_call",
                            toolCall
                        };
                        const result = await options.onToolCall(toolCall);
                        currentMessages.push({
                            role: "assistant",
                            content: message?.content || ""
                        }, {
                            role: "user",
                            content: JSON.stringify({
                                tool_call_id: tc.id,
                                output: result
                            })
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
        if (!apiKey) throw new Error("OpenAI API key not configured");
        const body = {
            model: options?.model || "gpt-4o",
            messages: [
                ...options?.systemPrompt ? [
                    {
                        role: "system",
                        content: options.systemPrompt
                    }
                ] : [],
                ...messages.map((m)=>({
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: m.content
                    }))
            ]
        };
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }
    getApiKey() {
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                const { useAIStore } = __turbopack_context__.r("[project]/src/stores/aiStore.ts [app-client] (ecmascript)");
                const config = useAIStore.getState().providerConfigs.openai;
                if (config.apiKey) return config.apiKey;
            } catch  {}
            return localStorage.getItem("openai_api_key") || "";
        }
        //TURBOPACK unreachable
        ;
    }
}
const __TURBOPACK__default__export__ = OpenAIProvider;
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

//# sourceMappingURL=_19x9wgz._.js.map