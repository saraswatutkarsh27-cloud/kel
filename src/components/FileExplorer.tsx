import React from 'react';
import { File, Folder, ChevronRight, ChevronDown, FilePlus, FolderPlus, Trash2 } from 'lucide-react';
import type { FileSystemItem } from '../lib/fileSystem';

interface FileTreeProps {
  items: FileSystemItem[];
  onFileSelect: (item: FileSystemItem) => void;
  onCreateFile: (parent: FileSystemDirectoryHandle) => void;
  onCreateFolder: (parent: FileSystemDirectoryHandle) => void;
  onDelete: (item: FileSystemItem) => void;
}

const FileTreeItem: React.FC<{
  item: FileSystemItem;
  onFileSelect: (item: FileSystemItem) => void;
  onCreateFile: (parent: FileSystemDirectoryHandle) => void;
  onCreateFolder: (parent: FileSystemDirectoryHandle) => void;
  onDelete: (item: FileSystemItem) => void;
  depth: number
}> = ({ item, onFileSelect, onCreateFile, onCreateFolder, onDelete, depth }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (item.kind === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item);
    }
  };

  return (
    <div className="group">
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
        <span className="truncate flex-1">{item.name}</span>

        <div className="hidden group-hover:flex items-center gap-1">
          {item.kind === 'directory' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onCreateFile(item.handle as FileSystemDirectoryHandle); }}
                className="hover:bg-[#333] p-0.5 rounded" title="New File"
              >
                <FilePlus size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onCreateFolder(item.handle as FileSystemDirectoryHandle); }}
                className="hover:bg-[#333] p-0.5 rounded" title="New Folder"
              >
                <FolderPlus size={12} />
              </button>
            </>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="hover:bg-[#333] p-0.5 rounded text-red-400" title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {item.kind === 'directory' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileTreeProps & { onOpenFolder: () => void, rootHandle: FileSystemDirectoryHandle | null }> = ({
  items, onFileSelect, onOpenFolder, onCreateFile, onCreateFolder, onDelete, rootHandle
}) => {
  return (
    <div className="w-64 h-full bg-[#252526] border-r border-[#333] flex flex-col overflow-hidden">
      <div className="p-3 text-xs font-bold uppercase text-gray-400 flex justify-between items-center">
        Explorer
        <div className="flex gap-1">
          {rootHandle && (
            <>
              <button onClick={() => onCreateFile(rootHandle)} className="hover:bg-[#333] p-1 rounded" title="New File"><FilePlus size={14}/></button>
              <button onClick={() => onCreateFolder(rootHandle)} className="hover:bg-[#333] p-1 rounded" title="New Folder"><FolderPlus size={14}/></button>
            </>
          )}
          <button onClick={onOpenFolder} className="hover:bg-[#333] p-1 rounded">Open</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <FileTreeItem
            key={item.path}
            item={item}
            onFileSelect={onFileSelect}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDelete={onDelete}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};
