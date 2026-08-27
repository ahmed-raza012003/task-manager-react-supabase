import { useState } from 'react'
import { Lock, Mail, LoaderCircle } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { signIn, signUp } from '@/data/auth'

export function LoginScreen() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signedUpNotice, setSignedUpNotice] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password)
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')
      } else if (mode === 'signUp') {
        setSignedUpNotice(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-6 shadow-token-lg">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-white">
            F
          </div>
          <h1 className="font-display text-lg font-semibold text-text-primary">Flowline</h1>
          <p className="mt-1 text-sm text-text-secondary">{mode === 'signIn' ? 'Sign in to your workspace' : 'Create your workspace'}</p>
        </div>

        {signedUpNotice ? (
          <div className="rounded-lg bg-success-subtle-bg p-4 text-center text-sm text-success">
            Account created. Check your email to confirm it, then sign in.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <Input
                type="email"
                required
                autoFocus
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={busy}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === 'signIn' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        )}

        {!signedUpNotice && (
          <button
            onClick={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn')
              setError(null)
            }}
            className="mt-4 w-full text-center text-xs font-medium text-text-tertiary hover:text-accent"
          >
            {mode === 'signIn' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        )}
      </div>
    </div>
  )
}
