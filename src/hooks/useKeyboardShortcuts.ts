import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { useCommandPaletteStore, useSearchStore } from '@/stores/commandPaletteStore'
import { useProjectDialogStore, useShortcutsHelpStore } from '@/stores/projectDialogStore'
import { completeTask } from '@/data/tasks'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const toggleCommandPalette = useCommandPaletteStore((s) => s.toggle)
  const openSearch = useSearchStore((s) => s.open)
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const shortcutsHelpOpen = useShortcutsHelpStore((s) => s.isOpen)
  const openShortcutsHelp = useShortcutsHelpStore((s) => s.open)
  const closeShortcutsHelp = useShortcutsHelpStore((s) => s.close)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggleCommandPalette()
        return
      }

      if (isTypingTarget(e.target) || mod || e.altKey) return

      switch (e.key) {
        case 'c':
        case 'C':
          e.preventDefault()
          openQuickAdd()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          openProjectDialog()
          break
        case '/':
          e.preventDefault()
          openSearch()
          break
        case 't':
        case 'T':
          navigate('/today')
          break
        case 'g':
        case 'G':
          navigate('/projects')
          break
        case '?':
          e.preventDefault()
          shortcutsHelpOpen ? closeShortcutsHelp() : openShortcutsHelp()
          break
        case ' ': {
          const el = document.activeElement
          const taskEl = el instanceof HTMLElement ? el.closest<HTMLElement>('[data-task-id]') : null
          if (taskEl?.dataset.taskId) {
            e.preventDefault()
            void completeTask(taskEl.dataset.taskId)
          }
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, openQuickAdd, toggleCommandPalette, openSearch, openProjectDialog, shortcutsHelpOpen, openShortcutsHelp, closeShortcutsHelp])
}
