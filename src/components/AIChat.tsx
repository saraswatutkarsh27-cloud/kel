import React from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, Loader2, Copy } from 'lucide-react';
import type { FileSystemItem } from '../lib/fileSystem';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  apiKey: string;
  currentFileContent: string;
  fileName: string;
  onApplyCode?: (code: string) => void;
  theme?: 'vs-dark' | 'light';
  projectFiles?: FileSystemItem[];
}

export const AIChat: React.FC<AIChatProps> = ({ apiKey, currentFileContent, fileName, onApplyCode, theme = 'vs-dark', projectFiles = [] }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const getFullProjectStructure = (items: FileSystemItem[], depth = 0): string => {
    let structure = '';
    for (const item of items) {
      structure += '  '.repeat(depth) + `- ${item.name}${item.kind === 'directory' ? '/' : ''}\n`;
      if (item.children) {
        structure += getFullProjectStructure(item.children, depth + 1);
      }
    }
    return structure;
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const projectStructure = getFullProjectStructure(projectFiles);

      const context = `You are an AI Coding Assistant in a Web IDE.

Project Structure:
${projectStructure}

The user is currently editing: "${fileName}".

Current File Content:
\`\`\`
${currentFileContent}
\`\`\`

User Question/Task: ${input}

Instructions:
1. Provide helpful explanations and code snippets.
2. If you need content from another file to answer better, mention which file you'd like to see.
3. Wrap all code in markdown code blocks.`;

      const result = await model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      let errorMessage = 'Error: Failed to get response from Gemini.';
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API Key. Please check your key and try again.';
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
      <div className={`p-4 border-b ${isDark ? 'border-[#333]' : 'border-[#cccccc]'} font-bold flex items-center gap-2`}>
        <Bot size={18} className="text-blue-400" /> AI Assistant
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-10">
            Ask me anything about your code! I can see your project structure.
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
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-blue-400" />
          </div>
        )}
      </div>
      <div className={`p-4 border-t ${isDark ? 'border-[#333] bg-[#252526]' : 'border-[#cccccc] bg-white'}`}>
        {!apiKey && <div className="text-[10px] text-yellow-500 mb-2 text-center italic">API Key required to chat</div>}
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
            placeholder="Ask AI..."
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
