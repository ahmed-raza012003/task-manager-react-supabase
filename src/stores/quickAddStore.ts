import { create } from 'zustand'

interface QuickAddState {
  isOpen: boolean
  prefill: { text?: string; projectId?: string; columnId?: string; dueDate?: string }
  open: (prefill?: QuickAddState['prefill']) => void
  close: () => void
}

export const useQuickAddStore = create<QuickAddState>((set) => ({
  isOpen: false,
  prefill: {},
  open: (prefill = {}) => set({ isOpen: true, prefill }),
  close: () => set({ isOpen: false, prefill: {} }),
}))
