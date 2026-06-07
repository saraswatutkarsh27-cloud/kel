import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarOpen: boolean;
  aiSidebarOpen: boolean;
  sidebarWidth: number;
  aiSidebarWidth: number;
  activityBarPosition: 'left' | 'right';
  isMobile: boolean;
  zenMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setAiSidebarOpen: (open: boolean) => void;
  toggleAiSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setAiSidebarWidth: (width: number) => void;
  setActivityBarPosition: (pos: 'left' | 'right') => void;
  setIsMobile: (mobile: boolean) => void;
  setZenMode: (zen: boolean) => void;
  toggleZenMode: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      aiSidebarOpen: true,
      sidebarWidth: 256,
      aiSidebarWidth: 320,
      activityBarPosition: 'left',
      isMobile: false,
      zenMode: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setAiSidebarOpen: (open) => set({ aiSidebarOpen: open }),
      toggleAiSidebar: () => set({ aiSidebarOpen: !get().aiSidebarOpen }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(500, width)) }),
      setAiSidebarWidth: (width) => set({ aiSidebarWidth: Math.max(240, Math.min(600, width)) }),
      setActivityBarPosition: (pos) => set({ activityBarPosition: pos }),
      setIsMobile: (mobile) => set({ isMobile: mobile, sidebarOpen: !mobile, aiSidebarOpen: !mobile }),
      setZenMode: (zen) => set({ zenMode: zen }),
      toggleZenMode: () => set({ zenMode: !get().zenMode }),
    }),
    {
      name: 'layout-store',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        aiSidebarWidth: state.aiSidebarWidth,
        activityBarPosition: state.activityBarPosition,
      }),
    }
  )
);