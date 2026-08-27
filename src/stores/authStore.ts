import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  initialized: boolean
  setSession: (session: Session | null) => void
  setInitialized: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (v) => set({ initialized: v }),
}))
