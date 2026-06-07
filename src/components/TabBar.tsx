import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import type { FileSystemItem } from '../lib/fileSystem';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';

interface OpenFile {
  item: FileSystemItem;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

interface TabBarProps {
  openFiles: OpenFile[];
  activeFilePath: string | null;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
  onReorder: (files: OpenFile[]) => void;
  onSave: (path: string) => void;
  onCloseOthers: (path: string) => void;
  onCloseAll: () => void;
  onCloseToRight: (path: string) => void;
}

const getFileExtColor = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const colors: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400',
    js: 'text-yellow-400', jsx: 'text-yellow-400',
    json: 'text-yellow-500',
    html: 'text-orange-400', css: 'text-purple-400',
    md: 'text-gray-400', py: 'text-green-400',
    go: 'text-cyan-400', rs: 'text-orange-400',
  };
  return colors[ext || ''] || 'text-gray-400';
};

/* Sortable Tab */
const SortableTab: React.FC<{
  file: OpenFile;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}> = ({ file, isActive, onSelect, onClose, onContextMenu }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.item.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`group flex items-center gap-2 px-3 text-xs cursor-pointer min-w-fit transition-all duration-150 select-none border-r border-ide-border ${
        isDragging ? 'shadow-lg bg-ide-elevated' : ''
      } ${
        isActive
          ? 'bg-ide-bg text-white border-t-2 border-t-ide-accent'
          : 'text-ide-muted hover:text-gray-300 hover:bg-ide-hover/50'
      }`}
    >
      <span className={`text-[10px] font-semibold ${getFileExtColor(file.item.name)}`}>
        {file.item.name.split('.').pop()?.toUpperCase() || 'TXT'}
      </span>
      <span className="max-w-[120px] truncate">{file.item.name}</span>
      {file.isDirty ? (
        <span className="w-2 h-2 rounded-full bg-ide-accent animate-pulse flex-shrink-0" />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose(e);
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-ide-hover transition-all duration-150 flex-shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};

/* Tab Bar */
export const TabBar: React.FC<TabBarProps> = ({
  openFiles,
  activeFilePath,
  onTabSelect,
  onTabClose,
  onReorder,
  onSave,
  onCloseOthers,
  onCloseAll,
  onCloseToRight,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = openFiles.findIndex((f) => f.item.path === active.id);
    const newIndex = openFiles.findIndex((f) => f.item.path === over.id);
    onReorder(arrayMove(openFiles, oldIndex, newIndex));
  };

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const getContextMenuItems = (path: string): ContextMenuItem[] => {
    const file = openFiles.find((f) => f.item.path === path);
    const idx = openFiles.findIndex((f) => f.item.path === path);
    const isLast = idx === openFiles.length - 1;

    return [
      {
        label: 'Close',
        onClick: () => onTabClose(path),
        shortcut: '\u2318W',
      },
      {
        label: 'Close Others',
        onClick: () => onCloseOthers(path),
        disabled: openFiles.length <= 1,
      },
      {
        label: 'Close To Right',
        onClick: () => onCloseToRight(path),
        disabled: isLast,
      },
      {
        label: 'Close All',
        onClick: onCloseAll,
        disabled: openFiles.length === 0,
      },
      { label: '', divider: true },
      {
        label: 'Save',
        onClick: () => onSave(path),
        disabled: !file?.isDirty,
        shortcut: '\u2318S',
      },
      { label: '', divider: true },
      {
        label: file?.item.name || '',
        disabled: true,
      },
    ];
  };

  return (
    <>
      <div className="flex h-9 bg-ide-surface/50 overflow-x-auto border-b border-ide-border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={openFiles.map((f) => f.item.path)}
            strategy={horizontalListSortingStrategy}
          >
            {openFiles.map((file) => (
              <SortableTab
                key={file.item.path}
                file={file}
                isActive={activeFilePath === file.item.path}
                onSelect={() => onTabSelect(file.item.path)}
                onClose={() => onTabClose(file.item.path)}
                onContextMenu={(e) => handleContextMenu(e, file.item.path)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {contextMenu && (
        <ContextMenu
          items={getContextMenuItems(contextMenu.path)}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
