import type { Priority } from '@/data/types'

export const PROJECT_COLORS = [
  '#6D5EF5', // violet (accent)
  '#3E8FF0', // blue
  '#1FA88A', // teal
  '#1F9D66', // green
  '#D9A515', // gold
  '#D97B15', // amber
  '#E0483E', // red
  '#D64F94', // pink
  '#8A5CF6', // purple
  '#535660', // slate
] as const

export const LABEL_COLORS = PROJECT_COLORS

export const PROJECT_ICONS = [
  'Rocket',
  'Briefcase',
  'GraduationCap',
  'Home',
  'Megaphone',
  'Code2',
  'Palette',
  'Heart',
  'DollarSign',
  'Sparkles',
  'BookOpen',
  'Dumbbell',
] as const

export function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return 'var(--color-priority-urgent)'
    case 'high':
      return 'var(--color-priority-high)'
    case 'medium':
      return 'var(--color-priority-medium)'
    case 'low':
      return 'var(--color-priority-low)'
    default:
      return 'var(--color-text-tertiary)'
  }
}

export function priorityLabel(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'No priority'
  }
}

export function randomProjectColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]
}
