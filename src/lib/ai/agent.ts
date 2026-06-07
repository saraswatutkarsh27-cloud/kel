/**
 * AI Agent Engine
 *
 * The agent loop takes a user goal, generates a plan, executes steps using tools,
 * and streams everything to the UI in real time.
 */

import type { AIToolCall, AIMessageInput, AITool } from "./providers/index";
import type { AIProvider } from "@/types";
import { agentTools, executeToolCall } from "./tools";
import { useAIStore } from "@/stores/aiStore";
import { useFileSystemStore } from "@/stores/fileSystemStore";

// Provider instances (lazy-loaded)
let geminiProvider: any = null;
let claudeProvider: any = null;
let openaiProvider: any = null;

async function getProvider(providerName: AIProvider) {
  switch (providerName) {
    case "gemini":
      if (!geminiProvider) {
        const { GeminiProvider } = await import("./providers/gemini");
        geminiProvider = new GeminiProvider();
      }
      return geminiProvider;
    case "claude":
      if (!claudeProvider) {
        const { ClaudeProvider } = await import("./providers/claude");
        claudeProvider = new ClaudeProvider();
      }
      return claudeProvider;
    case "openai":
      if (!openaiProvider) {
        const { OpenAIProvider } = await import("./providers/openai");
        openaiProvider = new OpenAIProvider();
      }
      return openaiProvider;
  }
}

/**
 * Build the system prompt based on the current mode and context.
 */
function buildSystemPrompt(mode: string): string {
  const files = useFileSystemStore.getState().files;
  const fileContext = files.length > 0
    ? "\nCurrent project files: " + files.map(f => f.path).join(", ")
    : "";

  switch (mode) {
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

/**
 * Run the AI agent with a user message.
 * Handles the full agentic loop: plan -> act -> observe -> repeat.
 * Streams all output to the UI in real time.
 */
export async function runAgent(
  userMessage: string,
  options: {
    provider?: AIProvider;
    mode?: "chat" | "agent" | "review" | "debug";
    signal?: AbortSignal;
  } = {}
): Promise<void> {
  const store = useAIStore.getState();
  const providerName = options.provider || store.selectedProvider;
  const mode = options.mode || store.mode;
  const signal = options.signal;

  // Get provider config
  const providerConfig = store.providerConfigs[providerName];
  if (!providerConfig?.apiKey && !process.env[`${providerName.toUpperCase()}_API_KEY`]) {
    store.addMessage({ role: "assistant", content: "⚠️ API key not configured for " + providerName + ". Add it in settings." });
    return;
  }

  // Add user message to store
  store.addMessage({ role: "user", content: userMessage });
  store.setStreaming(true);

  // Add placeholder assistant message for streaming
  const assistantMsgId = "msg-" + Date.now();
  store.addMessage({ role: "assistant", content: "" });

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
    const messages = useAIStore.getState().messages;
    const chatMessages: AIMessageInput[] = messages
      .filter((m) => m.role !== "system")
      .slice(0, -2) // Exclude the user msg + placeholder we just added to the store
      .map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

    // Add the current user query (once)
    chatMessages.push({ role: "user", content: userMessage });

    // Determine which tools to use based on mode
    const tools: AITool[] = mode === "agent" ? agentTools : [];

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
      onToolCall: async (toolCall: AIToolCall) => {
        // Update store with tool call info
        const toolCallInfo = {
          name: toolCall.name,
          args: toolCall.args,
          status: "running" as const,
        };
        store.addToolCall(toolCallInfo);

        // Add plan step for agent mode
        if (mode === "agent") {
          const currentPlan = useAIStore.getState().currentPlan;
          if (currentPlan) {
            store.addPlanStep({
              id: "step-" + Date.now(),
              description: "Running " + toolCall.name + ": " + JSON.stringify(toolCall.args).slice(0, 100),
              status: "in_progress",
              toolCall: toolCallInfo,
            });
          }
        }

        // Execute the tool
        const result = await executeToolCall(toolCall);

        // Update store with result
        store.updateToolCall(toolCall.name, { status: "completed", result });

        return result;
      },
    });

    let fullContent = "";

    for await (const event of stream) {
      if (signal?.aborted) break;

      switch (event.type) {
        case "text":
          fullContent += event.content;
          store.updateLastMessage(fullContent);
          break;

        case "tool_call":
          // Tool calls are handled by onToolCall callback
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
      const currentPlan = useAIStore.getState().currentPlan;
      if (currentPlan) {
        store.setPlanStatus("completed");
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      store.updateLastMessage("⏹️ Cancelled.");
    } else {
      store.updateLastMessage("⚠️ Error: " + err.message);
    }
  } finally {
    store.setAbortController(null);
    store.setStreaming(false);
  }
}

/**
 * Generate a plan for a given goal in agent mode.
 * This is called before running the agent to show the user what will happen.
 */
export async function generatePlan(goal: string, providerName?: AIProvider): Promise<void> {
  const store = useAIStore.getState();
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
        status: "in_progress",
      },
    ],
  });

  // Record the goal
  store.addMessage({ role: "user", content: "📋 Plan: " + goal });

  try {
    const provider = await getProvider(pName);
    if (!provider) {
      store.setPlanStatus("error");
      store.addMessage({
        role: "assistant",
        content: "⚠️ Could not load AI provider.",
      });
      return;
    }

    const systemPrompt = `You are an AI planning assistant. Given a user goal, break it down into
a step-by-step plan. Each step should be a concrete action (e.g., "Create file X",
"Implement function Y", "Run tests"). Keep plans practical and actionable.

Respond with ONLY a numbered list of steps, nothing else.`;

    // Ask the provider to generate a detailed plan
    const planResponse = await provider.chat(
      [
        { role: "user", content: goal },
      ],
      {
        systemPrompt,
        model: providerConfig?.model || undefined,
      }
    );

    // Parse steps from the response
    const stepLines = planResponse
      .split("\n")
      .filter((line) => /^\d+[\.\)]/.test(line.trim()))
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter(Boolean);

    if (stepLines.length > 0) {
      store.setPlan({
        id: "plan-" + Date.now(),
        title: goal.slice(0, 100),
        status: "ready",
        steps: stepLines.map((desc, i) => ({
          id: "step-" + (i + 1) + "-" + Date.now(),
          description: desc,
          status: "pending" as const,
        })),
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
            status: "pending",
          },
        ],
      });
    }

    store.setPlanStatus("ready");
  } catch (err: any) {
    store.setPlanStatus("error");
    store.addMessage({
      role: "assistant",
      content: "⚠️ Plan generation failed: " + err.message,
    });
  }
}

/**
 * Quick non-streaming chat for simple queries.
 */
export async function quickChat(
  message: string,
  options: { provider?: AIProvider; systemPrompt?: string } = {}
): Promise<string> {
  const store = useAIStore.getState();
  const providerName = options.provider || store.selectedProvider;
  const providerConfig = store.providerConfigs[providerName];

  if (!providerConfig?.apiKey) return "";

  try {
    const provider = await getProvider(providerName);
    if (!provider) return "";

    return await provider.chat([{ role: "user", content: message }], {
      systemPrompt: options.systemPrompt,
      model: providerConfig?.model || undefined,
    });
  } catch {
    return "";
  }
}

