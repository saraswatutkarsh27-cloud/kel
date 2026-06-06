import React from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import type { FileSystemItem } from '../lib/fileSystem';

interface FileTreeProps {
  items: FileSystemItem[];
  onFileSelect: (item: FileSystemItem) => void;
}

const FileTreeItem: React.FC<{ item: FileSystemItem; onFileSelect: (item: FileSystemItem) => void; depth: number }> = ({ item, onFileSelect, depth }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (item.kind === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-sm text-[#cccccc]"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {item.kind === 'directory' ? (
          <>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-blue-400" />
          </>
        ) : (
          <>
            <div className="w-[14px]" />
            <File size={14} className="text-gray-400" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </div>
      {item.kind === 'directory' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem key={child.path} item={child} onFileSelect={onFileSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileTreeProps & { onOpenFolder: () => void }> = ({ items, onFileSelect, onOpenFolder }) => {
  return (
    <div className="w-64 h-full bg-[#252526] border-r border-[#333] flex flex-col overflow-hidden">
      <div className="p-3 text-xs font-bold uppercase text-gray-400 flex justify-between items-center">
        Explorer
        <button onClick={onOpenFolder} className="hover:bg-[#333] p-1 rounded">Open Folder</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <FileTreeItem key={item.path} item={item} onFileSelect={onFileSelect} depth={0} />
        ))}
      </div>
    </div>
  );
};
