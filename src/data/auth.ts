import { supabase, syncConfigured } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authStore'
import { updateSettings } from './settings'
import { pullAll, pushAllLocal, startRealtimeSync, stopRealtimeSync } from './sync'

export interface AuthResult {
  success: boolean
  error?: string
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { success: false, error: 'Sync is not configured for this deployment.' }
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { success: false, error: 'Sync is not configured for this deployment.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function signOut(): Promise<void> {
  stopRealtimeSync()
  await supabase?.auth.signOut()
}

export async function changePassword(newPassword: string): Promise<AuthResult> {
  if (!supabase) return { success: false, error: 'Sync is not configured for this deployment.' }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Wires Supabase Auth session state to the app: on login, this device's workspace
 *  becomes the account's UID (so any device signed into the same account shares
 *  data automatically), and a full sync kicks off. Call once at app boot. */
export function initAuthListener(): () => void {
  if (!syncConfigured || !supabase) {
    useAuthStore.getState().setInitialized(true)
    return () => {}
  }

  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session)
    useAuthStore.getState().setInitialized(true)
    if (data.session) void onSignedIn(data.session.user.id)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.getState().setSession(session)
    if (event === 'SIGNED_IN' && session) void onSignedIn(session.user.id)
    if (event === 'SIGNED_OUT') stopRealtimeSync()
  })

  return () => subscription.unsubscribe()
}

async function onSignedIn(userId: string): Promise<void> {
  await updateSettings({ workspaceId: userId, syncEnabled: true })
  await pushAllLocal()
  await pullAll()
  await startRealtimeSync()
}
