import { useEffect } from 'react'
import { useSettings } from '@/data/settings'

function resolveTheme(mode: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings()
  const mode = settings?.theme ?? 'system'

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(mode))
    }
    apply()
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [mode])

  return <>{children}</>
}
