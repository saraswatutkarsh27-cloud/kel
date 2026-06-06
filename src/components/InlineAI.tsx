import React, { useState, useEffect } from 'react';
import { Wand2, X } from 'lucide-react';

interface InlineAIProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  position: { top: number; left: number };
}

export const InlineAI: React.FC<InlineAIProps> = ({ onClose, onSubmit, position }) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-[#1e1e1e] border border-blue-500 rounded-lg shadow-2xl w-[400px] p-2 flex flex-col gap-2"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center gap-2 px-1">
        <Wand2 size={14} className="text-blue-400" />
        <span className="text-[10px] text-gray-400 uppercase font-bold">Edit Code</span>
        <div className="flex-1" />
        <button onClick={onClose} className="hover:bg-[#333] p-0.5 rounded">
          <X size={14} className="text-gray-500" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(input)}
          placeholder="Ask AI to edit or generate code..."
          className="flex-1 bg-[#252526] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-gray-500">Enter to Generate • Esc to Cancel</span>
      </div>
    </div>
  );
};
