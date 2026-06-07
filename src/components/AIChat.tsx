import React from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, Loader2, Copy, User, Sparkles, Check } from 'lucide-react';
import { marked } from 'marked';
import type { FileSystemItem } from '../lib/fileSystem';
import { readFile, writeFile, createFile, createDirectory, deleteItem, findHandleByPath, findParentDirectoryHandle } from '../lib/fileSystem';
import { aiTools } from '../lib/aiTools';

interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: any[];
}

interface AIChatProps {
  apiKey: string;
  currentFileContent: string;
  fileName: string;
  onApplyCode?: (code: string) => void;
  theme?: 'vs-dark' | 'light';
  projectFiles?: FileSystemItem[];
  rootHandle: FileSystemDirectoryHandle | null;
  onRefreshFileSystem: () => Promise<void>;
}

// Configure marked for safe inline rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

const suggestedPrompts = [
  "Explain this file",
  "Add error handling",
  "Write tests",
  "Refactor this code",
];

export const AIChat: React.FC<AIChatProps> = ({
  apiKey,
  currentFileContent,
  fileName,
  onApplyCode,
  theme = 'vs-dark',
  projectFiles = [],
  rootHandle,
  onRefreshFileSystem
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState('gemini-3.5-flash');
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getFullProjectStructure = (items: FileSystemItem[], depth = 0): string => {
    let structure = '';
    for (const item of items) {
      structure += '  '.repeat(depth) + `- ${item.name}${item.kind === 'directory' ? '/' : ''} (${item.path})\n`;
      if (item.children) {
        structure += getFullProjectStructure(item.children, depth + 1);
      }
    }
    return structure;
  };

  const executeTool = async (call: any) => {
    const { name, args } = call;
    console.log(`Executing tool: ${name}`, args);

    try {
      switch (name) {
        case 'read_file': {
          const handle = findHandleByPath(projectFiles, args.path);
          if (handle && handle.kind === 'file') {
            const content = await readFile(handle as FileSystemFileHandle);
            return { content };
          }
          return { error: `File not found: ${args.path}` };
        }
        case 'write_file': {
          const handle = findHandleByPath(projectFiles, args.path);
          if (handle && handle.kind === 'file') {
            await writeFile(handle as FileSystemFileHandle, args.content);
            await onRefreshFileSystem();
            return { success: true };
          }
          return { error: `File not found: ${args.path}` };
        }
        case 'create_file': {
          const parentHandle = findParentDirectoryHandle(projectFiles, args.path, rootHandle);
          if (parentHandle) {
            await createFile(parentHandle, args.name);
            await onRefreshFileSystem();
            return { success: true };
          }
          return { error: `Parent directory not found for: ${args.path}` };
        }
        case 'create_directory': {
          const parentHandle = findParentDirectoryHandle(projectFiles, args.path, rootHandle);
          if (parentHandle) {
            await createDirectory(parentHandle, args.name);
            await onRefreshFileSystem();
            return { success: true };
          }
          return { error: `Parent directory not found for: ${args.path}` };
        }
        case 'delete_item': {
            const parts = args.path.split('/');
            const name = parts.pop();
            const parentPath = parts.join('/');
            const parentHandle = parentPath ? (findHandleByPath(projectFiles, parentPath) as FileSystemDirectoryHandle) : rootHandle;

            if (parentHandle && name) {
              await deleteItem(parentHandle, name);
              await onRefreshFileSystem();
              return { success: true };
            }
            return { error: `Could not delete: ${args.path}` };
        }
        case 'list_files': {
          return { structure: getFullProjectStructure(projectFiles) };
        }
        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const sendMessage = async (messageText?: string) => {
    const msg = messageText || input;
    if (!msg.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        tools: [{ functionDeclarations: aiTools }] as any
      });

      const chat = model.startChat({
        history: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        })),
      });

      const projectStructure = getFullProjectStructure(projectFiles);
      const context = `Context: User editing "${fileName}". Current file content:\n\`\`\`\n${currentFileContent}\n\`\`\`\nProject Structure:\n${projectStructure}\n\nYou are an agentic AI assistant. You can read/write files and manage directories using the provided tools. Always list files if you are unsure about the structure.`;

      let result = await chat.sendMessage(context + "\n\nUser Question: " + msg);
      let response = result.response;

      let toolCalls = response.functionCalls();

      while (toolCalls && toolCalls.length > 0) {
        const toolResults = [];
        for (const call of toolCalls) {
          const toolResult = await executeTool(call);
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: toolResult
            }
          });
        }

        result = await chat.sendMessage(toolResults as any);
        response = result.response;
        toolCalls = response.functionCalls();
      }

      const text = response.text();
      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      let errorMessage = 'Failed to get response from Gemini.';
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API Key. Please check your key and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeBlocks = (text: string) => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches: { lang: string; code: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ lang: match[1] || 'code', code: match[2] });
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

  return (
    <div className="flex flex-col h-full bg-ide-surface border-l border-ide-border w-[380px] animate-slide-in-right">
      {/* ── Header ──────────────────────────────────── */}
      <div className="p-4 border-b border-ide-border flex items-center justify-between bg-ide-surface/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm">
            <Bot size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              Agentic AI
              <Sparkles size={11} className="text-ide-accent-light" />
            </div>
            <div className="text-[9px] text-ide-muted">Powered by Gemini</div>
          </div>
        </div>
        <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] bg-ide-elevated border border-ide-border rounded-md px-2 py-1 outline-none text-ide-muted focus:border-ide-accent/50 transition-colors cursor-pointer"
        >
            <option value="gemini-3.5-flash">3.5 Flash</option>
            <option value="gemini-1.5-flash">1.5 Flash</option>
            <option value="gemini-1.5-pro">1.5 Pro</option>
            <option value="gemini-2.0-flash-exp">2.0 Flash (Exp)</option>
        </select>
      </div>

      {/* ── Messages ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ide-accent/15 to-ide-accent-light/10 border border-ide-accent/15 flex items-center justify-center">
              <Sparkles size={20} className="text-ide-accent-light" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white">What can I help with?</p>
              <p className="text-xs text-ide-muted">I can see and modify your project files</p>
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
          <div key={i} className={`flex gap-3 animate-slide-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              m.role === 'user'
                ? 'bg-ide-accent/20 border border-ide-accent/30'
                : 'bg-gradient-to-br from-ide-accent to-ide-accent-light shadow-glow-sm'
            }`}>
              {m.role === 'user'
                ? <User size={12} className="text-ide-accent-light" />
                : <Bot size={12} className="text-white" />
              }
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col gap-1 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-xl text-sm ${
                m.role === 'user'
                  ? 'bg-ide-accent text-white rounded-tr-sm'
                  : 'bg-ide-elevated border border-ide-border text-gray-200 rounded-tl-sm'
              }`}>
                {m.role === 'assistant' ? (
                  <div
                    className="chat-markdown"
                    dangerouslySetInnerHTML={renderMarkdown(m.content)}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>

              {/* Code Actions */}
              {m.role === 'assistant' && extractCodeBlocks(m.content).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {extractCodeBlocks(m.content).map((block, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <button
                        onClick={() => onApplyCode?.(block.code)}
                        className="flex items-center gap-1 text-[10px] bg-ide-accent/10 hover:bg-ide-accent/20 text-ide-accent-light px-2 py-1 rounded-md border border-ide-accent/15 transition-all duration-200 hover:shadow-glow-sm"
                      >
                        <Sparkles size={10} />
                        Apply {block.lang !== 'code' ? block.lang.toUpperCase() : ''} #{idx + 1}
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

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center shadow-glow-sm flex-shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-ide-elevated border border-ide-border rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-typing-dot" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ──────────────────────────────── */}
      <div className="p-4 border-t border-ide-border bg-ide-surface/80 backdrop-blur-sm">
        {!apiKey && (
          <div className="mb-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-400 text-center">
            API Key required — add your Gemini API key above
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Tell the agent what to do..."
            rows={1}
            className="w-full bg-ide-elevated border border-ide-border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-ide-muted/50 focus:outline-none focus:border-ide-accent/40 focus:shadow-glow-sm resize-none transition-all duration-200"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !apiKey || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-ide-accent hover:bg-ide-accent-light disabled:bg-ide-elevated disabled:text-ide-muted/30 rounded-lg text-white transition-all duration-200 disabled:cursor-not-allowed hover:shadow-glow-sm"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] text-ide-muted/40">Enter to send • Shift+Enter for newline</span>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-[9px] text-ide-muted/40">{apiKey ? 'Connected' : 'No API Key'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
