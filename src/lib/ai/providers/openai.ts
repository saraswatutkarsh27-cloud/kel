import type {
  AIProviderInterface,
  AIMessageInput,
  AITool,
  AIToolCall,
  ProviderStreamEvent,
} from "./index";

export class OpenAIProvider implements AIProviderInterface {
  readonly name = "openai" as const;

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
      yield { type: "error", message: "OpenAI API key not configured" };
      return;
    }

    const hasTools = options?.tools && options.tools.length > 0;
    let currentMessages = [...messages];
    let lastContent = "";
    let hasToolCalls = true;
    let iterations = 0;
    const maxIterations = 10;

    while (hasToolCalls && iterations < maxIterations) {
      hasToolCalls = false;
      iterations++;

      try {
        const body: any = {
          model: options?.model || "gpt-4o",
          messages: [
            ...(options?.systemPrompt
              ? [{ role: "system" as const, content: options.systemPrompt }]
              : []),
            ...currentMessages.map((m) => ({
              role: (m.role === "assistant" ? "assistant" : "user") as
                | "user"
                | "assistant",
              content: m.content,
            })),
          ],
          stream: false,
        };

        if (hasTools) {
          body.tools = options!.tools!.map((t) => ({
            type: "function" as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          }));
        }

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
            signal: options?.signal,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          yield { type: "error", message: `OpenAI API error: ${errorText}` };
          return;
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;

        if (message?.content) {
          yield { type: "text", content: message.content };
          lastContent = message.content;
        }

        const toolCalls = message?.tool_calls;
        if (toolCalls && toolCalls.length > 0 && options?.onToolCall) {
          hasToolCalls = true;

          for (const tc of toolCalls) {
            const toolCall: AIToolCall = {
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments),
              id: tc.id,
            };
            yield { type: "tool_call", toolCall };

            const result = await options.onToolCall(toolCall);
            currentMessages.push(
              {
                role: "assistant",
                content: message?.content || "",
              },
              {
                role: "user",
                content: JSON.stringify({
                  tool_call_id: tc.id,
                  output: result,
                }),
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
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const body: any = {
      model: options?.model || "gpt-4o",
      messages: [
        ...(options?.systemPrompt
          ? [{ role: "system" as const, content: options.systemPrompt }]
          : []),
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
    };

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private getApiKey(): string {
    if (typeof window !== "undefined") {
      try {
        const { useAIStore } = require("@/stores/aiStore");
        const config = useAIStore.getState().providerConfigs.openai;
        if (config.apiKey) return config.apiKey;
      } catch {}
      return localStorage.getItem("openai_api_key") || "";
    }
    return process.env.OPENAI_API_KEY || "";
  }
}

export default OpenAIProvider;
