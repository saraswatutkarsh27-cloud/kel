import React from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, Loader2, Copy } from 'lucide-react';
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

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

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

      let result = await chat.sendMessage(context + "\n\nUser Question: " + input);
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
      let errorMessage = 'Error: Failed to get response from Gemini.';
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API Key.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeBlocks = (text: string) => {
    const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const isDark = theme === 'vs-dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#1e1e1e] text-white border-[#333]' : 'bg-[#f3f3f3] text-black border-[#cccccc]'} border-l w-80`}>
      <div className={`p-4 border-b ${isDark ? 'border-[#333]' : 'border-[#cccccc]'} font-bold flex items-center justify-between`}>
        <div className="flex items-center gap-2">
            <Bot size={18} className="text-blue-400" /> Agentic AI
        </div>
        <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`text-[10px] bg-transparent border ${isDark ? 'border-[#444]' : 'border-[#ccc]'} rounded px-1 outline-none`}
        >
            <option value="gemini-3.5-flash">3.5 Flash</option>
            <option value="gemini-1.5-flash">1.5 Flash</option>
            <option value="gemini-1.5-pro">1.5 Pro</option>
            <option value="gemini-2.0-flash-exp">2.0 Flash (Exp)</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-10">
            I am your agentic assistant. I can see and modify your project files!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-lg max-w-full text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-700 text-white'
                : (isDark ? 'bg-[#2d2d2d] text-white' : 'bg-white border border-[#cccccc] text-black')
            }`}>
              {m.content}
              {m.role === 'assistant' && extractCodeBlocks(m.content).length > 0 && (
                <div className={`mt-2 pt-2 border-t ${isDark ? 'border-[#444]' : 'border-[#eeeeee]'} flex flex-wrap gap-2`}>
                  {extractCodeBlocks(m.content).map((code, idx) => (
                    <button
                      key={idx}
                      onClick={() => onApplyCode?.(code)}
                      className={`flex items-center gap-1 text-[10px] ${isDark ? 'bg-[#3d3d3d] hover:bg-[#4d4d4d]' : 'bg-[#eeeeee] hover:bg-[#dddddd]'} px-2 py-1 rounded`}
                    >
                      <Copy size={12} /> Apply Snippet {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-400" />
            <span className="text-[10px] text-gray-500">Thinking & Acting...</span>
          </div>
        )}
      </div>
      <div className={`p-4 border-t ${isDark ? 'border-[#333] bg-[#252526]' : 'border-[#cccccc] bg-white'}`}>
        {!apiKey && <div className="text-[10px] text-yellow-500 mb-2 text-center italic">API Key required</div>}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Tell the agent what to do..."
            rows={2}
            className={`flex-1 ${isDark ? 'bg-[#2d2d2d] border-[#444] text-white' : 'bg-white border-[#cccccc] text-black'} border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 resize-none`}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !apiKey || !input.trim()}
            className="p-2 self-end bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
