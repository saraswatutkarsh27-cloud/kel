import { create } from "zustand";
import type { VirtualFile, OpenTab } from "@/types";

interface FileSystemState {
  files: VirtualFile[];
  rootHandle: FileSystemDirectoryHandle | null;
  openTabs: OpenTab[];
  activeFilePath: string | null;
  useBackend: boolean;

  setFiles: (files: VirtualFile[]) => void;
  setRootHandle: (handle: FileSystemDirectoryHandle | null) => void;
  setUseBackend: (use: boolean) => void;

  openFile: (file: VirtualFile) => void;
  closeTab: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  updateTabContent: (path: string, content: string) => void;
  markTabSaved: (path: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (path: string) => void;
  closeTabsToRight: (path: string) => void;
  reorderTabs: (tabs: OpenTab[]) => void;

  addFile: (file: VirtualFile) => void;
  updateFile: (path: string, updates: Partial<VirtualFile>) => void;
  removeFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  getFileByPath: (path: string) => VirtualFile | undefined;
  addFolder: (folder: VirtualFile) => void;

  activeTab: () => OpenTab | null;
  dirtyFiles: () => VirtualFile[];
}

function findFileInTree(files: VirtualFile[], path: string): VirtualFile | undefined {
  for (const file of files) {
    if (file.path === path) return file;
    if (file.children) {
      const found = findFileInTree(file.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

function addFileToTree(files: VirtualFile[], file: VirtualFile): VirtualFile[] {
  const parts = file.path.split("/");
  if (parts.length === 1) {
    const exists = files.find((f) => f.path === file.path);
    if (exists) return files;
    return [...files, file].sort(sortFiles);
  }
  const parentPath = parts.slice(0, -1).join("/");
  return files.map((f) => {
    if (f.path === parentPath && f.children) {
      return { ...f, children: [...f.children!, file].sort(sortFiles) };
    }
    if (f.children) {
      return { ...f, children: addFileToTree(f.children, file) };
    }
    return f;
  });
}

function updateFileInTree(files: VirtualFile[], path: string, updates: Partial<VirtualFile>): VirtualFile[] {
  return files.map((f) => {
    if (f.path === path) return { ...f, ...updates };
    if (f.children) return { ...f, children: updateFileInTree(f.children, path, updates) };
    return f;
  });
}

function removeFileFromTree(files: VirtualFile[], path: string): VirtualFile[] {
  return files.filter((f) => f.path !== path).map((f) => {
    if (f.children) return { ...f, children: removeFileFromTree(f.children, path) };
    return f;
  });
}

function renameFileInTree(files: VirtualFile[], oldPath: string, newPath: string, newName: string): VirtualFile[] {
  return files.map((f) => {
    if (f.path === oldPath) return { ...f, path: newPath, name: newName };
    if (f.children) return { ...f, children: renameFileInTree(f.children, oldPath, newPath, newName) };
    return f;
  });
}

function sortFiles(a: VirtualFile, b: VirtualFile): number {
  if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
  return a.name.localeCompare(b.name);
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  files: [],
  rootHandle: null,
  openTabs: [],
  activeFilePath: null,
  useBackend: false,

  setFiles: (files) => set({ files }),
  setRootHandle: (handle) => set({ rootHandle: handle }),
  setUseBackend: (use) => set({ useBackend: use }),

  openFile: (file) => {
    const { openTabs } = get();
    if (openTabs.find((t) => t.file.path === file.path)) {
      set({ activeFilePath: file.path });
      return;
    }
    set({
      openTabs: [...openTabs, { file, content: file.content || "", originalContent: file.content || "", isDirty: false }],
      activeFilePath: file.path,
    });
  },

  closeTab: (path) => {
    const { openTabs, activeFilePath } = get();
    const updatedTabs = openTabs.filter((t) => t.file.path !== path);
    let newActive = activeFilePath;
    if (activeFilePath === path) {
      const idx = openTabs.findIndex((t) => t.file.path === path);
      newActive = updatedTabs.length > 0 ? updatedTabs[Math.min(idx, updatedTabs.length - 1)].file.path : null;
    }
    set({ openTabs: updatedTabs, activeFilePath: newActive });
  },

  setActiveFile: (path) => set({ activeFilePath: path }),

  updateTabContent: (path, content) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.file.path === path ? { ...t, content, isDirty: content !== t.originalContent } : t
      ),
      files: updateFileInTree(state.files, path, { content, isDirty: true }),
    }));
  },

  markTabSaved: (path) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.file.path === path ? { ...t, isDirty: false, originalContent: t.content } : t
      ),
      files: updateFileInTree(state.files, path, { isDirty: false }),
    }));
  },

  closeAllTabs: () => set({ openTabs: [], activeFilePath: null }),

  closeOtherTabs: (path) => {
    const tab = get().openTabs.find((t) => t.file.path === path);
    if (tab) set({ openTabs: [tab], activeFilePath: path });
  },

  closeTabsToRight: (path) => {
    const idx = get().openTabs.findIndex((t) => t.file.path === path);
    if (idx >= 0) set({ openTabs: get().openTabs.slice(0, idx + 1), activeFilePath: path });
  },

  reorderTabs: (tabs) => set({ openTabs: tabs }),

  addFile: (file) => set((state) => ({ files: addFileToTree(state.files, file) })),

  updateFile: (path, updates) => set((state) => ({ files: updateFileInTree(state.files, path, updates) })),

  removeFile: (path) => {
    set((state) => {
      // Close any open tabs for this file
      const updatedTabs = state.openTabs.filter((t) => !t.file.path.startsWith(path));
      let newActive = state.activeFilePath;
      if (state.activeFilePath?.startsWith(path)) {
        const idx = state.openTabs.findIndex((t) => t.file.path === state.activeFilePath);
        newActive = updatedTabs.length > 0
          ? updatedTabs[Math.min(idx, updatedTabs.length - 1)].file.path
          : null;
      }
      return {
        files: removeFileFromTree(state.files, path),
        openTabs: updatedTabs,
        activeFilePath: newActive,
      };
    });
  },

  renameFile: (oldPath, newPath) => {
    const newName = newPath.split("/").pop() || "";
    set((state) => {
      // Update tabs that reference the old path
      const updatedTabs = state.openTabs.map((t) => {
        if (t.file.path === oldPath) {
          return {
            ...t,
            file: { ...t.file, path: newPath, name: newName },
          };
        }
        return t;
      });
      return {
        files: renameFileInTree(state.files, oldPath, newPath, newName),
        openTabs: updatedTabs,
        activeFilePath:
          state.activeFilePath === oldPath ? newPath : state.activeFilePath,
      };
    });
  },

  getFileByPath: (path) => findFileInTree(get().files, path),

  addFolder: (folder) => set((state) => ({ files: addFileToTree(state.files, folder) })),

  activeTab: () => {
    const { openTabs, activeFilePath } = get();
    return openTabs.find((t) => t.file.path === activeFilePath) || null;
  },

  dirtyFiles: () => get().files.filter((f) => f.isDirty),
}));
