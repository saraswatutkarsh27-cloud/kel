import React from 'react';
import { GripVertical } from 'lucide-react';
import { useLayoutStore } from '../stores/layoutStore';

interface SidebarResizerProps {
  side: 'left' | 'right';
  className?: string;
}

export const SidebarResizer: React.FC<SidebarResizerProps> = ({ side, className = '' }) => {
  const { sidebarWidth, aiSidebarWidth, setSidebarWidth, setAiSidebarWidth } = useLayoutStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const startX = React.useRef(0);
  const startWidth = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startX.current = e.clientX;
    startWidth.current = side === 'left' ? sidebarWidth : aiSidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = side === 'left' ? e.clientX - startX.current : startX.current - e.clientX;
    const newWidth = startWidth.current + deltaX;
    if (side === 'left') setSidebarWidth(newWidth);
    else setAiSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, side, setSidebarWidth, setAiSidebarWidth]);

  return (
    <div
      className={`relative w-1 hover:w-2 cursor-col-resize transition-colors ${
        isDragging ? 'bg-blue-500/50' : 'bg-transparent'
      } ${className}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-label={`Resize ${side} sidebar`}
      aria-orientation="vertical"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GripVertical size={16} className="text-gray-500 hover:text-white transition-colors" />
      </div>
    </div>
  );
};