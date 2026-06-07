import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = React.useState(position);
  const [openSubmenu, setOpenSubmenu] = React.useState<number | null>(null);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const x = Math.min(position.x, window.innerWidth - rect.width - 8);
      const y = Math.min(position.y, window.innerHeight - rect.height - 8);
      setAdjustedPos({ x: Math.max(8, x), y: Math.max(8, y) });
    }
  }, [position]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200]" onContextMenu={(e) => e.preventDefault()}>
      <div
        ref={menuRef}
        className="fixed min-w-[180px] py-1 bg-ide-surface border border-ide-border rounded-xl shadow-2xl shadow-black/50 animate-scale-in overflow-visible"
        style={{ left: adjustedPos.x, top: adjustedPos.y }}
      >
        {items.map((item, i) => {
          if (item.divider) {
            return <div key={i} className="my-1 border-t border-ide-border" />;
          }

          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => item.submenu && setOpenSubmenu(i)}
              onMouseLeave={() => item.submenu && setOpenSubmenu(null)}
            >
              <button
                onClick={() => {
                  if (!item.disabled && !item.submenu && item.onClick) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors ${
                  item.disabled
                    ? 'text-ide-muted/40 cursor-not-allowed'
                    : item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-gray-300 hover:bg-ide-hover hover:text-white'
                }`}
              >
                {item.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="text-[10px] text-ide-muted/50 font-mono ml-4">{item.shortcut}</span>
                )}
                {item.submenu && <ChevronRight size={12} className="text-ide-muted/50" />}
              </button>

              {item.submenu && openSubmenu === i && (
                <div className="absolute left-full top-0 -mt-1 min-w-[160px] py-1 bg-ide-surface border border-ide-border rounded-xl shadow-2xl shadow-black/50 animate-fade-in">
                  {item.submenu.map((subItem, j) => {
                    if (subItem.divider) {
                      return <div key={j} className="my-1 border-t border-ide-border" />;
                    }
                    return (
                      <button
                        key={j}
                        onClick={() => {
                          if (!subItem.disabled && subItem.onClick) {
                            subItem.onClick();
                            onClose();
                          }
                        }}
                        disabled={subItem.disabled}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors ${
                          subItem.disabled
                            ? 'text-ide-muted/40 cursor-not-allowed'
                            : subItem.danger
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-gray-300 hover:bg-ide-hover hover:text-white'
                        }`}
                      >
                        {subItem.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{subItem.icon}</span>}
                        <span className="flex-1 text-left">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
