import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type {
  AIProviderInterface,
  AIMessageInput,
  AITool,
  AIToolCall,
  ProviderStreamEvent,
} from "./index";

function convertTools(tools: AITool[]): any[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: {
      type: SchemaType.OBJECT,
      properties: Object.fromEntries(
        Object.entries(t.parameters.properties).map(([k, v]) => [
          k,
          { type: toGeminiType(v.type), description: v.description },
        ])
      ),
      required: t.parameters.required,
    },
  }));
}

function toGeminiType(type: string): SchemaType {
  switch (type) {
    case "string": return SchemaType.STRING;
    case "number": return SchemaType.NUMBER;
    case "boolean": return SchemaType.BOOLEAN;
    case "array": return SchemaType.ARRAY;
    case "object": return SchemaType.OBJECT;
    default: return SchemaType.STRING;
  }
}

function convertMessages(messages: AIMessageInput[]): { history: any[]; systemPrompt?: string } {
  const history: any[] = [];
  let systemPrompt: string | undefined;

  for (const msg of messages) {
    if (msg.role === "system") {
      systemPrompt = (systemPrompt || "") + msg.content;
      continue;
    }
    if (msg.toolCallResults && msg.toolCallResults.length > 0) {
      history.push({
        role: "function",
        parts: msg.toolCallResults.map((r) => ({
          functionResponse: { name: r.name, response: r.result },
        })),
      });
    } else {
      history.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  return { history, systemPrompt };
}

export class GeminiProvider implements AIProviderInterface {
  readonly name = "gemini" as const;

  async *streamChat(
    messages: AIMessageInput[],
    options?: {
      model?: string;
      tools?: AITool[];
      systemPrompt?: string;
      signal?: AbortSignal;
      onToolCall?: (toolCall: AIToolCall) => Promise<unknown>;
    }
  ): AsyncGenerator<ProviderStreamEvent, void, undefined> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      yield { type: "error", message: "Gemini API key not configured" };
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { history, systemPrompt } = convertMessages(messages);

    const geminiTools = options?.tools?.length
      ? [{ functionDeclarations: convertTools(options.tools) }]
      : undefined;

    const modelConfig: any = {
      model: options?.model || "gemini-2.0-flash",
      tools: geminiTools,
    };

    if (options?.systemPrompt || systemPrompt) {
      modelConfig.systemInstruction = options?.systemPrompt || systemPrompt;
    }

    const model = genAI.getGenerativeModel(modelConfig);
    const chat = model.startChat({ history });

    // We need to handle the tool-calling loop internally
    // since Gemini doesn't support streaming with function calls well
    let lastContent = "";
    let hasToolCalls = true;
    let currentMessages = [...messages];

    while (hasToolCalls) {
      hasToolCalls = false;
      const lastMsg = currentMessages[currentMessages.length - 1];

      try {
        const result = await chat.sendMessage(lastMsg?.content || "");
        const response = result.response;
        const text = response.text();
        const functionCalls = response.functionCalls();

        if (text) {
          yield { type: "text", content: text };
          lastContent = text;
        }

        if (functionCalls && functionCalls.length > 0 && options?.onToolCall) {
          hasToolCalls = true;
          for (const call of functionCalls) {
            const toolCall: AIToolCall = {
              name: call.name,
              args: call.args as Record<string, unknown>,
              id: call.name,
            };
            yield { type: "tool_call", toolCall };

            const result = await options.onToolCall(toolCall);
            // Add the tool result to messages for the next iteration
            currentMessages.push({
              role: "assistant",
              content: "",
              toolCallResults: [{ name: call.name, result }],
            });
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        yield { type: "error", message: err.message };
        return;
      }
    }

    yield { type: "done", content: lastContent };
  }

  async chat(
    messages: AIMessageInput[],
    options?: {
      model?: string;
      tools?: AITool[];
      systemPrompt?: string;
      signal?: AbortSignal;
    }
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error("Gemini API key not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const { history, systemPrompt } = convertMessages(messages);

    const model = genAI.getGenerativeModel({
      model: options?.model || "gemini-2.0-flash",
      systemInstruction: options?.systemPrompt || systemPrompt,
    });

    const chat = model.startChat({ history });
    const lastMsg = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMsg?.content || "");
    return result.response.text();
  }

  private getApiKey(): string {
    // Check zustand store first, then localStorage, then env
    if (typeof window !== "undefined") {
      try {
        const { useAIStore } = require("@/stores/aiStore");
        const config = useAIStore.getState().providerConfigs.gemini;
        if (config.apiKey) return config.apiKey;
      } catch {}
      return localStorage.getItem("gemini_api_key") || "";
    }
    return process.env.GEMINI_API_KEY || "";
  }
}

export default GeminiProvider;
