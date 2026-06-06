import React from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, Loader2, Copy } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  apiKey: string;
  currentFileContent: string;
  fileName: string;
  onApplyCode?: (code: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ apiKey, currentFileContent, fileName, onApplyCode }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const context = `You are an AI Coding Assistant. The user is currently editing a file named "${fileName}".

Current File Content:
\`\`\`
${currentFileContent}
\`\`\`

User Question/Task: ${input}

Instructions: Provide helpful explanations and code snippets. If you provide code, wrap it in markdown code blocks.`;

      const result = await model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to get response from Gemini. Please check your API key.' }]);
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

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333] text-white w-80">
      <div className="p-4 border-b border-[#333] font-bold flex items-center gap-2">
        <Bot size={18} className="text-blue-400" /> AI Assistant
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-10">
            Ask me anything about your code!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-lg max-w-full text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-700' : 'bg-[#2d2d2d]'}`}>
              {m.content}
              {m.role === 'assistant' && extractCodeBlocks(m.content).length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#444] flex flex-wrap gap-2">
                  {extractCodeBlocks(m.content).map((code, idx) => (
                    <button
                      key={idx}
                      onClick={() => onApplyCode?.(code)}
                      className="flex items-center gap-1 text-[10px] bg-[#3d3d3d] hover:bg-[#4d4d4d] px-2 py-1 rounded"
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
      <div className="p-4 border-t border-[#333] bg-[#252526]">
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
            className="flex-1 bg-[#2d2d2d] border border-[#444] rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !apiKey || !input.trim()}
            className="p-2 self-end bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
