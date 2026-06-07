import React, { useState, useEffect, useRef } from 'react';
import { Wand2, X, Sparkles, ArrowRight } from 'lucide-react';

interface InlineAIProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  position: { top: number; left: number };
}

export const InlineAI: React.FC<InlineAIProps> = ({ onClose, onSubmit, position }) => {
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const quickActions = [
    { label: 'Fix', prompt: 'Fix any issues in the selected code' },
    { label: 'Explain', prompt: 'Explain what the selected code does' },
    { label: 'Optimize', prompt: 'Optimize the selected code for performance' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Inline AI Panel */}
      <div
        className={`fixed z-50 w-[420px] transition-all duration-200 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95'
        }`}
        style={{
          top: position.top,
          left: Math.min(position.left, window.innerWidth - 440),
        }}
      >
        <div className="bg-ide-surface border border-ide-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden glow-border">
          {/* Top accent line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-ide-accent to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-ide-border bg-ide-surface/80">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-ide-accent to-ide-accent-light flex items-center justify-center">
              <Wand2 size={10} className="text-white" />
            </div>
            <span className="text-[10px] text-ide-accent-light uppercase font-semibold tracking-wider">AI Edit</span>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-ide-hover text-ide-muted hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* Input */}
          <div className="p-2">
            <div className="relative">
              <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ide-accent/50" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input.trim()) onSubmit(input);
                }}
                placeholder="Ask AI to edit or generate code..."
                className="w-full bg-ide-elevated border border-ide-border rounded-lg pl-8 pr-10 py-2.5 text-xs text-white placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent/40 focus:shadow-glow-sm transition-all duration-200"
              />
              <button
                onClick={() => input.trim() && onSubmit(input)}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-ide-accent/20 text-ide-accent-light hover:bg-ide-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-2 pb-2 flex items-center gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => onSubmit(action.prompt)}
                className="text-[10px] px-2.5 py-1 rounded-md border border-ide-border text-ide-muted hover:text-white hover:border-ide-accent/30 hover:bg-ide-accent/5 transition-all duration-200"
              >
                {action.label}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[9px] text-ide-muted/40 flex items-center gap-1">
              <kbd className="text-ide-accent/40 font-mono">Enter</kbd> generate
              <span className="mx-0.5">•</span>
              <kbd className="text-ide-accent/40 font-mono">Esc</kbd> cancel
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
