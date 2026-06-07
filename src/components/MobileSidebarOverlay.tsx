import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayoutStore } from '../stores/layoutStore';

interface MobileSidebarOverlayProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebarOverlay: React.FC<MobileSidebarOverlayProps> = ({
  children,
  side,
  title,
  isOpen,
  onClose,
}) => {
  const { isMobile } = useLayoutStore();

  if (!isMobile || !isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed z-50 h-full transition-transform duration-300 ease-out ${
          side === 'left'
            ? 'left-0 top-0 w-[280px] max-w-[85vw] transform translate-x-0'
            : 'right-0 top-0 w-[320px] max-w-[85vw] transform translate-x-0'
        } ${isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'}`}
        role="dialog"
        aria-label={title}
        aria-modal="true"
      >
        <div className="flex flex-col h-full bg-[#252526] border-r border-[#333] shadow-xl">
          <div className="flex items-center justify-between p-3 border-b border-[#333]">
            <h3 className="text-xs font-bold uppercase text-gray-400">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </aside>
    </>
  );
};