import { create } from 'zustand'

interface ProjectDialogState {
  isOpen: boolean
  editingId: string | null
  open: (editingId?: string | null) => void
  close: () => void
}

export const useProjectDialogStore = create<ProjectDialogState>((set) => ({
  isOpen: false,
  editingId: null,
  open: (editingId = null) => set({ isOpen: true, editingId }),
  close: () => set({ isOpen: false, editingId: null }),
}))

interface ShortcutsHelpState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useShortcutsHelpStore = create<ShortcutsHelpState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
