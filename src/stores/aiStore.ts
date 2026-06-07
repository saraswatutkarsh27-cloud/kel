import { create } from "zustand";
import type { AIMessage, AIMode, AIProvider, AgentPlan, AgentStep, ToolCall, AIProviderConfig } from "@/types";

interface AIState {
  messages: AIMessage[];
  mode: AIMode;
  selectedProvider: AIProvider;
  providerConfigs: Record<AIProvider, AIProviderConfig>;
  currentPlan: AgentPlan | null;
  isStreaming: boolean;
  abortController: AbortController | null;

  // Messages
  addMessage: (msg: Omit<AIMessage, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  removeMessage: (id: string) => void;

  // Mode
  setMode: (mode: AIMode) => void;

  // Provider
  setProvider: (provider: AIProvider) => void;
  updateProviderConfig: (provider: AIProvider, config: Partial<AIProviderConfig>) => void;
  getProviderConfig: (provider: AIProvider) => AIProviderConfig;

  // Agent Plan
  setPlan: (plan: AgentPlan | null) => void;
  addPlanStep: (step: AgentStep) => void;
  updateStepStatus: (stepId: string, status: AgentStep["status"], result?: string) => void;
  setPlanStatus: (status: AgentPlan["status"]) => void;
  clearPlan: () => void;

  // Streaming
  setStreaming: (streaming: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  cancelStreaming: () => void;

  // Tool calls
  addToolCall: (toolCall: ToolCall) => void;
  updateToolCall: (name: string, updates: Partial<ToolCall>) => void;
}

let messageCounter = 0;
function generateMessageId(): string {
  messageCounter++;
  return `msg-${messageCounter}-${Date.now().toString(36)}`;
}

let stepCounter = 0;
function generateStepId(): string {
  stepCounter++;
  return `step-${stepCounter}-${Date.now().toString(36)}`;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  mode: "chat",
  selectedProvider: "gemini",
  providerConfigs: {
    gemini: { provider: "gemini", apiKey: "", model: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    claude: { provider: "claude", apiKey: "", model: "claude-sonnet-4", label: "Claude Sonnet 4" },
    openai: { provider: "openai", apiKey: "", model: "gpt-4o", label: "GPT-4o" },
  },
  currentPlan: null,
  isStreaming: false,
  abortController: null,

  addMessage: (msg) => {
    const newMsg: AIMessage = {
      ...msg,
      id: generateMessageId(),
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, newMsg] }));
  },

  updateLastMessage: (content) => {
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      const last = { ...updated[updated.length - 1] };
      last.content = content;
      updated[updated.length - 1] = last;
      return { messages: updated };
    });
  },

  clearMessages: () => set({ messages: [], currentPlan: null }),

  removeMessage: (id) => {
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
  },

  setMode: (mode) => set({ mode }),

  setProvider: (provider) => set({ selectedProvider: provider }),

  updateProviderConfig: (provider, config) => {
    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        [provider]: { ...state.providerConfigs[provider], ...config },
      },
    }));
  },

  getProviderConfig: (provider) => get().providerConfigs[provider],

  setPlan: (plan) => set({ currentPlan: plan }),

  addPlanStep: (step) => {
    set((state) => {
      if (!state.currentPlan) return state;
      return {
        currentPlan: {
          ...state.currentPlan,
          steps: [...state.currentPlan.steps, { ...step, id: step.id || generateStepId() }],
        },
      };
    });
  },

  updateStepStatus: (stepId, status, result) => {
    set((state) => {
      if (!state.currentPlan) return state;
      return {
        currentPlan: {
          ...state.currentPlan,
          steps: state.currentPlan.steps.map((s) =>
            s.id === stepId ? { ...s, status, result: result || s.result } : s
          ),
        },
      };
    });
  },

  setPlanStatus: (status) => {
    set((state) => {
      if (!state.currentPlan) return state;
      return { currentPlan: { ...state.currentPlan, status } };
    });
  },

  clearPlan: () => set({ currentPlan: null }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setAbortController: (controller) => set({ abortController: controller }),

  cancelStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, isStreaming: false });
    }
  },

  addToolCall: (toolCall) => {
    // Add tool call to the last assistant message
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      const last = { ...updated[updated.length - 1] };
      last.toolCalls = [...(last.toolCalls || []), toolCall];
      updated[updated.length - 1] = last;
      return { messages: updated };
    });
  },

  updateToolCall: (name, updates) => {
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      const last = { ...updated[updated.length - 1] };
      last.toolCalls = (last.toolCalls || []).map((tc) =>
        tc.name === name ? { ...tc, ...updates } : tc
      );
      updated[updated.length - 1] = last;
      return { messages: updated };
    });
  },
}));
