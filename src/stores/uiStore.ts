import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  selectedTaskId: string | null
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  openTaskPanel: (taskId: string) => void
  closeTaskPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  selectedTaskId: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  openTaskPanel: (taskId) => set({ selectedTaskId: taskId }),
  closeTaskPanel: () => set({ selectedTaskId: null }),
}))
