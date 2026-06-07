"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Send,
  Bot,
  Loader2,
  Copy,
  User,
  Sparkles,
  Check,
  Trash2,
  Settings,
  Code,
  Bug,
  MessageSquare,
} from "lucide-react";
import { marked } from "marked";
import { useAIStore } from "@/stores/aiStore";
import { runAgent } from "@/lib/ai";
import type { AIProvider, AIMode } from "@/types";

marked.setOptions({ breaks: true, gfm: true });

const suggestedPrompts = [
  "Explain this file",
  "Add error handling",
  "Write tests",
  "Refactor this code",
];

export const AIPanel: React.FC = () => {
  const {
    messages,
    mode,
    selectedProvider,
    providerConfigs,
    currentPlan,
    isStreaming,
    clearMessages,
    setMode,
    setProvider,
    updateProviderConfig,
    cancelStreaming,
  } = useAIStore();

  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = async (messageText?: string) => {
    const msg = messageText || input;
    if (!msg.trim()) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await runAgent(msg, { mode });
  };

  const extractCodeBlocks = (text: string) => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches: { lang: string; code: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ lang: match[1] || "code", code: match[2] });
    }
    return matches;
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const renderMarkdown = (text: string) => {
    try {
      const html = marked.parse(text) as string;
      return { __html: html };
    } catch {
      return { __html: text };
    }
  };

  const modes: { id: AIMode; label: string; icon: React.ReactNode }[] = [
    { id: "chat", label: "Chat", icon: <MessageSquare size={12} /> },
    { id: "agent", label: "Agent", icon: <Bot size={12} /> },
    { id: "review", label: "Review", icon: <Code size={12} /> },
    { id: "debug", label: "Debug", icon: <Bug size={12} /> },
  ];

  const providers: AIProvider[] = ["gemini", "claude", "openai"];

  const handleApiKeyChange = (provider: AIProvider, key: string) => {
    updateProviderConfig(provider, { apiKey: key });
    localStorage.setItem(`${provider}_api_key`, key);
  };

  return (
    <div className="flex flex-col h-full bg-ide-surface border-l border-ide-border w-[380px] animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ide-border bg-ide-surface/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm">
            <Bot size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              AI {mode === "agent" ? "Agent" : mode === "review" ? "Review" : mode === "debug" ? "Debug" : "Chat"}
              <Sparkles size={11} className="text-ide-accent-light" />
            </div>
            <div className="text-[9px] text-ide-muted">{providerConfigs[selectedProvider]?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { clearMessages(); }}
            className="p-1.5 rounded-md text-ide-muted hover:text-white hover:bg-ide-hover transition-all duration-200"
            title="Clear chat"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              showSettings ? "text-ide-accent-light bg-ide-accent/10" : "text-ide-muted hover:text-white hover:bg-ide-hover"
            }`}
            title="Settings"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex px-3 py-2 gap-1 border-b border-ide-border/50 bg-ide-elevated/30">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
              mode === m.id
                ? "bg-ide-accent/15 text-ide-accent-light border border-ide-accent/20"
                : "text-ide-muted hover:text-white hover:bg-ide-hover/50"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-ide-border bg-ide-elevated/50 space-y-3 animate-slide-down">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-ide-muted uppercase tracking-wider min-w-[60px]">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="flex-1 bg-ide-elevated border border-ide-border rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-ide-accent/50 transition-colors cursor-pointer"
            >
              {providers.map((p) => (
                <option key={p} value={p}>{providerConfigs[p]?.label || p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-ide-muted uppercase tracking-wider">
              API Key ({selectedProvider})
            </label>
            <input
              type="password"
              value={providerConfigs[selectedProvider]?.apiKey || ""}
              onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
              placeholder="Enter your API key..."
              className="w-full bg-ide-elevated border border-ide-border rounded-md px-3 py-1.5 text-xs text-white placeholder-ide-muted/50 outline-none focus:border-ide-accent/50 transition-colors font-mono"
            />
          </div>
        </div>
      )}

      {/* Plan Display */}
      {currentPlan && currentPlan.status !== "completed" && (
        <div className="px-4 py-3 border-b border-ide-border bg-ide-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-ide-accent animate-pulse" />
            <span className="text-[10px] font-medium text-ide-accent-light uppercase tracking-wider">
              Plan: {currentPlan.status}
            </span>
          </div>
          <div className="text-xs text-ide-muted mb-2">{currentPlan.title}</div>
          {currentPlan.steps.length > 0 && (
            <div className="space-y-1">
              {currentPlan.steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-[10px]">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    step.status === "completed" ? "bg-green-400" :
                    step.status === "in_progress" ? "bg-ide-accent animate-pulse" :
                    step.status === "error" ? "bg-red-400" : "bg-ide-muted/30"
                  }`} />
                  <span className={`${
                    step.status === "completed" ? "text-gray-400 line-through" :
                    step.status === "in_progress" ? "text-white" : "text-gray-500"
                  }`}>
                    {step.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ide-accent/15 to-ide-accent-light/10 border border-ide-accent/15 flex items-center justify-center">
              <Sparkles size={20} className="text-ide-accent-light" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white">What can I help with?</p>
              <p className="text-xs text-ide-muted">
                {mode === "agent" ? "I can autonomously modify your project files" :
                 mode === "review" ? "I can review your code for issues" :
                 mode === "debug" ? "I can help debug errors" : "I can answer coding questions"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-ide-border text-ide-muted hover:text-white hover:border-ide-accent/30 hover:bg-ide-accent/5 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex gap-3 animate-slide-up ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              m.role === "user"
                ? "bg-ide-accent/20 border border-ide-accent/30"
                : "bg-gradient-to-br from-ide-accent to-ide-accent-light shadow-glow-sm"
            }`}>
              {m.role === "user"
                ? <User size={12} className="text-ide-accent-light" />
                : <Bot size={12} className="text-white" />
              }
            </div>

            <div className={`flex flex-col gap-1 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-3 py-2 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-ide-accent text-white rounded-tr-sm"
                  : "bg-ide-elevated border border-ide-border text-gray-200 rounded-tl-sm"
              }`}>
                {m.role === "assistant" ? (
                  <div className="chat-markdown" dangerouslySetInnerHTML={renderMarkdown(m.content)} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>

              {m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {m.toolCalls.map((tc, tci) => (
                    <div
                      key={tci}
                      className={`text-[9px] px-2 py-0.5 rounded-full border transition-all duration-200 ${
                        tc.status === "completed"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : tc.status === "running"
                          ? "bg-ide-accent/10 border-ide-accent/20 text-ide-accent-light animate-pulse"
                          : tc.status === "error"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-ide-elevated border-ide-border text-ide-muted"
                      }`}
                    >
                      {tc.name}
                    </div>
                  ))}
                </div>
              )}

              {m.role === "assistant" && extractCodeBlocks(m.content).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {extractCodeBlocks(m.content).map((block, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("ide:apply-code", { detail: block.code }));
                        }}
                        className="flex items-center gap-1 text-[10px] bg-ide-accent/10 hover:bg-ide-accent/20 text-ide-accent-light px-2 py-1 rounded-md border border-ide-accent/15 transition-all duration-200 hover:shadow-glow-sm"
                      >
                        <Sparkles size={10} />
                        Apply
                      </button>
                      <button
                        onClick={() => copyCode(block.code, i * 100 + idx)}
                        className="p-1 rounded-md bg-ide-elevated hover:bg-ide-hover border border-ide-border text-ide-muted hover:text-white transition-all duration-200"
                        title="Copy code"
                      >
                        {copiedIdx === i * 100 + idx ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm flex-shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-ide-elevated border border-ide-border rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: "200ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-ide-border bg-ide-surface/80 backdrop-blur-sm">
        {!providerConfigs[selectedProvider]?.apiKey && (
          <div className="mb-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-400 text-center">
            API Key required — add it in settings
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={mode === "agent" ? "Tell the agent what to do..." : "Ask a question..."}
            rows={1}
            className="w-full bg-ide-elevated border border-ide-border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-ide-muted/50 focus:outline-none focus:border-ide-accent/40 focus:shadow-glow-sm resize-none transition-all duration-200"
          />
          <button
            onClick={() => isStreaming ? cancelStreaming() : sendMessage()}
            className="absolute right-2 bottom-2 p-2 bg-ide-accent hover:bg-ide-accent-light rounded-lg text-white transition-all duration-200 hover:shadow-glow-sm"
          >
            {isStreaming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] text-ide-muted/40">Enter to send · Shift+Enter for newline</span>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${providerConfigs[selectedProvider]?.apiKey ? "bg-green-400" : "bg-yellow-400"}`} />
            <span className="text-[9px] text-ide-muted/40">
              {providerConfigs[selectedProvider]?.apiKey ? "Connected" : "No Key"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
