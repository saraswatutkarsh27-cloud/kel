import type {
  AIProviderInterface,
  AIMessageInput,
  AITool,
  AIToolCall,
  ProviderStreamEvent,
} from "./index";

export class ClaudeProvider implements AIProviderInterface {
  readonly name = "claude" as const;

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
      yield { type: "error", message: "Claude API key not configured" };
      return;
    }

    const hasTools = options?.tools && options.tools.length > 0;
    let currentMessages = [...messages];
    let lastContent = "";

    // Claude uses a multi-turn approach similar to Gemini for tool use
    let hasToolCalls = true;
    let iterations = 0;
    const maxIterations = 10;

    while (hasToolCalls && iterations < maxIterations) {
      hasToolCalls = false;
      iterations++;

      try {
        const response = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: options?.model || "claude-sonnet-4",
              max_tokens: 8192,
              system: options?.systemPrompt || undefined,
      messages: currentMessages
        .filter((m) => m.role !== "system")
        .map((m) => {
          // If content is already an array (content blocks), pass as-is
          if (Array.isArray(m.content)) {
            return {
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            };
          }
          return {
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          };
        }),
              tools: hasTools
                ? options!.tools!.map((t) => ({
                    name: t.name,
                    description: t.description,
                    input_schema: {
                      type: t.parameters.type,
                      properties: t.parameters.properties,
                      required: t.parameters.required,
                    },
                  }))
                : undefined,
            }),
            signal: options?.signal,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          yield { type: "error", message: `Claude API error: ${errorText}` };
          return;
        }

        const data = await response.json();

        // Process content blocks
        for (const block of data.content || []) {
          if (block.type === "text") {
            yield { type: "text", content: block.text };
            lastContent = block.text;
          } else if (block.type === "tool_use" && options?.onToolCall) {
            hasToolCalls = true;
            const toolCall: AIToolCall = {
              name: block.name,
              args: block.input as Record<string, unknown>,
              id: block.id,
            };
            yield { type: "tool_call", toolCall };

            const result = await options.onToolCall(toolCall);
            currentMessages.push(
              {
                role: "assistant",
                content: [
                  { type: "text", text: lastContent || "" },
                  {
                    type: "tool_use",
                    id: block.id,
                    name: block.name,
                    input: block.input,
                  },
                ],
              },
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: JSON.stringify(result),
                  },
                ],
              }
            );
          }
        }

        if (!hasToolCalls) {
          yield { type: "done", content: lastContent };
          return;
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
    if (!apiKey) throw new Error("Claude API key not configured");

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: options?.model || "claude-sonnet-4",
          max_tokens: 8192,
          system: options?.systemPrompt || undefined,
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
        }),
        signal: options?.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
  }

  private getApiKey(): string {
    if (typeof window !== "undefined") {
      try {
        // Use dynamic import-compatible pattern (handled by bundler)
        const { useAIStore } = require("@/stores/aiStore");
        const config = useAIStore.getState().providerConfigs.claude;
        if (config.apiKey) return config.apiKey;
      } catch {}
      return localStorage.getItem("claude_api_key") || "";
    }
    return process.env.CLAUDE_API_KEY || "";
  }
}

export default ClaudeProvider;
