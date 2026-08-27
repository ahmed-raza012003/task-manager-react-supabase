export interface ShortcutEntry {
  keys: string
  description: string
  group: string
}

export const SHORTCUTS: ShortcutEntry[] = [
  { keys: 'C', description: 'Create a task (Quick Add)', group: 'Global' },
  { keys: 'P', description: 'Create a project', group: 'Global' },
  { keys: '/', description: 'Search', group: 'Global' },
  { keys: 'Ctrl K', description: 'Open command palette', group: 'Global' },
  { keys: 'T', description: 'Go to Today', group: 'Navigation' },
  { keys: 'G', description: 'Go to Projects', group: 'Navigation' },
  { keys: '?', description: 'Show keyboard shortcuts', group: 'Global' },
  { keys: 'Esc', description: 'Close dialog / panel', group: 'Global' },
  { keys: 'Space', description: 'Complete the focused task', group: 'Tasks' },
]
