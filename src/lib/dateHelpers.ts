import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const DATE_KEY_FORMAT = 'yyyy-MM-dd'

export function todayKey(): string {
  return format(new Date(), DATE_KEY_FORMAT)
}

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT)
}

export function fromDateKey(key: string): Date {
  return parseISO(key)
}

export function isPastDateKey(key: string | null): boolean {
  if (!key) return false
  return isBefore(startOfDay(fromDateKey(key)), startOfDay(new Date()))
}

export function isDueSoon(key: string | null, withinDays = 3): boolean {
  if (!key) return false
  const d = startOfDay(fromDateKey(key))
  const now = startOfDay(new Date())
  const limit = addDays(now, withinDays)
  return !isBefore(d, now) && isBefore(d, limit)
}

export function isTodayKey(key: string | null): boolean {
  if (!key) return false
  return isToday(fromDateKey(key))
}

export function friendlyDateLabel(key: string | null): string {
  if (!key) return ''
  const d = fromDateKey(key)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function friendlyDateTimeLabel(dateKey: string | null, time: string | null): string {
  const label = friendlyDateLabel(dateKey)
  if (!label) return ''
  return time ? `${label} · ${time}` : label
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatFullDate(date = new Date()): string {
  return format(date, 'EEEE, MMMM d')
}

export function buildMonthGrid(monthDate: Date, weekStartsOn: 0 | 1) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn })
  const days = eachDayOfInterval({ start, end })
  return days.map((date) => ({
    date,
    key: toDateKey(date),
    inMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
  }))
}

export function buildWeekRow(anchor: Date, weekStartsOn: 0 | 1) {
  const start = startOfWeek(anchor, { weekStartsOn })
  const end = endOfWeek(anchor, { weekStartsOn })
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    key: toDateKey(date),
    isToday: isToday(date),
  }))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${Math.max(seconds, 0)}s`
}

export function formatMinutes(minutes: number): string {
  return formatDuration(minutes * 60)
}

export { addDays, addWeeks, addMonths, isSameDay }
