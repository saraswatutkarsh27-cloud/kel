import type { AIStreamChunk, AIProvider } from "@/types";

/**
 * A tool definition that's provider-agnostic.
 */
export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

/**
 * A message format that's provider-agnostic.
 */
export interface AIMessageInput {
  role: "user" | "assistant" | "system";
  content: string | any[];
  toolCallResults?: Array<{
    name: string;
    result: unknown;
  }>;
}

/**
 * Result of a tool call from the model.
 */
export interface AIToolCall {
  name: string;
  args: Record<string, unknown>;
  id: string;
}

/**
 * Stream event from a provider.
 */
export type ProviderStreamEvent =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: AIToolCall }
  | { type: "done"; content: string }
  | { type: "error"; message: string };

/**
 * Provider interface - all providers must implement this.
 */
export interface AIProviderInterface {
  readonly name: AIProvider;

  /**
   * Stream a chat completion with optional tool support.
   * Yields events as they arrive from the API.
   */
  streamChat(
    messages: AIMessageInput[],
    options?: {
      model?: string;
      tools?: AITool[];
      systemPrompt?: string;
      signal?: AbortSignal;
      onToolCall?: (toolCall: AIToolCall) => Promise<unknown>;
    }
  ): AsyncGenerator<ProviderStreamEvent, void, undefined>;

  /**
   * Non-streaming chat completion (for simple queries).
   */
  chat(
    messages: AIMessageInput[],
    options?: {
      model?: string;
      tools?: AITool[];
      systemPrompt?: string;
      signal?: AbortSignal;
    }
  ): Promise<string>;
}

export type { AIStreamChunk };
