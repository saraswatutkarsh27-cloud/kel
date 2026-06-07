/**
 * AI Engine - Public API
 *
 * Usage:
 *   import { runAgent, quickChat, generatePlan } from "@/lib/ai";
 *
 *   await runAgent("Build me a login page", { mode: "agent" });
 *   const answer = await quickChat("What is React?");
 */

export { runAgent, quickChat, generatePlan } from "./agent";
export { agentTools, executeToolCall } from "./tools";
export type { AITool, AIToolCall, AIMessageInput, AIProviderInterface, ProviderStreamEvent } from "./providers/index";
