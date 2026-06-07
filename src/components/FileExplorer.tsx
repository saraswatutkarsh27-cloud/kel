import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, FolderPlus, Trash2, FileText } from 'lucide-react';
import { FileSystemItem } from '../lib/fileSystem';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';

interface FileExplorerProps {
  items: FileSystemItem[];
  onFileSelect: (item: FileSystemItem) => void;
  onOpenFolder: () => void;
  onCreateFile: (parent: FileSystemDirectoryHandle) => void;
  onCreateFolder: (parent: FileSystemDirectoryHandle) => void;
  onDelete: (item: FileSystemItem) => void;
  rootHandle: FileSystemDirectoryHandle | null;
  activeFilePath: string | null;
}

const getFileIcon = (name: string, isDir: boolean) => {
  if (isDir) return Folder;
  const ext = name.split('.').pop()?.toLowerCase();
  const icons: Record<string, React.ElementType> = {
    ts: FileText, tsx: FileText,
    js: FileText, jsx: FileText,
    json: FileText,
    html: FileText, css: FileText,
    md: FileText,
    py: FileText, go: FileText, rs: FileText,
  };
  return icons[ext || ''] || File;
};

const FileTreeNode: React.FC<{
  item: FileSystemItem;
  onFileSelect: (item: FileSystemItem) => void;
  onCreateFile: (parent: FileSystemDirectoryHandle) => void;
  onCreateFolder: (parent: FileSystemDirectoryHandle) => void;
  onDelete: (item: FileSystemItem) => void;
  activeFilePath: string | null;
  rootHandle: FileSystemDirectoryHandle | null;
  level: number;
}> = ({
  item,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDelete,
  activeFilePath,
  rootHandle,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(item.kind === 'directory');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileSystemItem; parentHandle: FileSystemDirectoryHandle | null } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.kind === 'file') {
      onFileSelect(item);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, parentHandle: FileSystemDirectoryHandle | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item, parentHandle });
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    const isRoot = !item.path.includes('/');
    const parentHandle = item.kind === 'directory' ? item.handle as FileSystemDirectoryHandle : null;

    return [
      {
        label: item.kind === 'directory' ? 'New File' : 'Open',
        icon: <FileText size={12} />,
        onClick: () => item.kind === 'directory' && parentHandle && onCreateFile(parentHandle),
        disabled: item.kind === 'file',
      },
      {
        label: 'New Folder',
        icon: <FolderPlus size={12} />,
        onClick: () => parentHandle && onCreateFolder(parentHandle),
        disabled: item.kind === 'file',
      },
      { label: '', divider: true },
      {
        label: 'Delete',
        icon: <Trash2 size={12} />,
        onClick: () => onDelete(item),
        danger: true,
        disabled: isRoot,
      },
    ];
  };

  const Icon = getFileIcon(item.name, item.kind === 'directory');
  const isActive = activeFilePath === item.path;

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={(e) => handleContextMenu(e, item.kind === 'directory' ? item.handle as FileSystemDirectoryHandle : null)}
        className={`flex items-center gap-1.5 px-2 py-1.5 text-sm cursor-pointer select-none transition-colors rounded-md ${
          isActive ? 'bg-ide-accent/10 text-white' : 'text-ide-muted hover:text-white hover:bg-ide-hover/50'
        }`}
        style={{ paddingLeft: `${12 + level * 14}px` }}
      >
        {item.kind === 'directory' ? (
          <ChevronDown size={12} className={`text-ide-muted/60 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-4" />
        )}
        <Icon size={13} className={isActive ? 'text-ide-accent-light' : 'text-ide-muted'} />
        <span className="truncate flex-1">{item.name}</span>
      </div>

      {item.kind === 'directory' && isExpanded && item.children && (
        <div className="animate-slide-down">
          {item.children.map((child) => (
            <FileTreeNode
              key={child.path}
              item={child}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDelete={onDelete}
              activeFilePath={activeFilePath}
              rootHandle={rootHandle}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          items={getContextMenuItems()}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  items,
  onFileSelect,
  onOpenFolder,
  onCreateFile,
  onCreateFolder,
  onDelete,
  rootHandle,
  activeFilePath,
}) => {
  return (
    <div className="w-64 h-full bg-ide-surface border-r border-ide-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-ide-border">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ide-muted">Explorer</div>
        </div>
        <button
          onClick={onOpenFolder}
          className="p-1.5 hover:bg-ide-hover rounded text-ide-muted hover:text-white transition-colors"
          title="Open Folder"
        >
          <Folder size={15} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ide-accent/15 to-ide-accent-light/10 border border-ide-accent/15 flex items-center justify-center">
            <Folder size={28} className="text-ide-accent-light" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-white">No folder opened</p>
            <p className="text-xs text-ide-muted">Click Open Folder to start</p>
          </div>
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-2 px-4 py-2 bg-ide-accent hover:bg-ide-accent-light text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Folder size={14} />
            Open Folder
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          {items.map((item) => (
            <FileTreeNode
              key={item.path}
              item={item}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDelete={onDelete}
              activeFilePath={activeFilePath}
              rootHandle={rootHandle}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};