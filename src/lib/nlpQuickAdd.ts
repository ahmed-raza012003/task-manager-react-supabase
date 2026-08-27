import { addDays } from 'date-fns'
import type { Priority, TimeOfDay } from '@/data/types'
import { toDateKey } from './dateHelpers'

export interface ParsedQuickAdd {
  title: string
  priority: Priority
  labelNames: string[]
  projectName: string | null
  dueDate: string | null
  dueTime: string | null
  timeOfDay: TimeOfDay
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WEEKDAY_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const PRIORITY_WORDS: Record<string, Priority> = {
  p1: 'urgent',
  urgent: 'urgent',
  asap: 'urgent',
  p2: 'high',
  high: 'high',
  'high priority': 'high',
  p3: 'medium',
  medium: 'medium',
  p4: 'low',
  low: 'low',
  'low priority': 'low',
}

/**
 * Local, deterministic parser — no AI involved. Strips recognized tokens out
 * of the raw input and returns structured fields plus the cleaned title.
 */
export function parseQuickAdd(raw: string, referenceDate = new Date()): ParsedQuickAdd {
  let text = raw

  let projectName: string | null = null
  text = text.replace(/@([a-zA-Z0-9][\w-]*(?:\s[a-zA-Z0-9][\w-]*)?)/, (_m, name) => {
    projectName = name.trim()
    return ''
  })

  const labelNames: string[] = []
  text = text.replace(/#([a-zA-Z0-9][\w-]*)/g, (_m, name) => {
    labelNames.push(name)
    return ''
  })

  let priority: Priority = null
  text = text.replace(/\b(p[1-4]|urgent|asap|high priority|low priority|high|medium|low)\b/i, (m) => {
    const key = m.toLowerCase()
    if (PRIORITY_WORDS[key]) {
      priority = PRIORITY_WORDS[key]
      return ''
    }
    return m
  })

  let dueDate: string | null = null
  let timeOfDay: TimeOfDay = null

  const relativeDayMatch = text.match(/\bin (\d+) (day|days|week|weeks)\b/i)
  if (relativeDayMatch) {
    const n = parseInt(relativeDayMatch[1], 10)
    const unit = relativeDayMatch[2].toLowerCase()
    const days = unit.startsWith('week') ? n * 7 : n
    dueDate = toDateKey(addDays(referenceDate, days))
    text = text.replace(relativeDayMatch[0], '')
  } else if (/\btoday\b/i.test(text)) {
    dueDate = toDateKey(referenceDate)
    text = text.replace(/\btoday\b/i, '')
  } else if (/\btonight\b/i.test(text)) {
    dueDate = toDateKey(referenceDate)
    timeOfDay = 'evening'
    text = text.replace(/\btonight\b/i, '')
  } else if (/\btomorrow\b/i.test(text)) {
    dueDate = toDateKey(addDays(referenceDate, 1))
    text = text.replace(/\btomorrow\b/i, '')
  } else {
    const weekdayRegex = new RegExp(`\\b(next\\s+)?(${WEEKDAYS.join('|')}|${WEEKDAY_SHORT.join('|')})\\b`, 'i')
    const wdMatch = text.match(weekdayRegex)
    if (wdMatch) {
      const isNext = !!wdMatch[1]
      const name = wdMatch[2].toLowerCase()
      const idx = WEEKDAYS.indexOf(name) >= 0 ? WEEKDAYS.indexOf(name) : WEEKDAY_SHORT.indexOf(name)
      const todayIdx = referenceDate.getDay()
      let delta = (idx - todayIdx + 7) % 7
      if (delta === 0) delta = 7 // same weekday as today -> the upcoming occurrence
      if (isNext) delta += 7 // "next friday" -> the occurrence after the upcoming one
      dueDate = toDateKey(addDays(referenceDate, delta))
      text = text.replace(wdMatch[0], '')
    }
  }

  let dueTime: string | null = null
  const timeMatch = text.match(/\b(\d{1,2})(:(\d{2}))?\s?(am|pm)\b/i)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10)
    const min = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0
    const isPm = /pm/i.test(timeMatch[4])
    if (isPm && hour < 12) hour += 12
    if (!isPm && hour === 12) hour = 0
    dueTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    if (!timeOfDay) timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    text = text.replace(timeMatch[0], '')
  }

  const title = text.replace(/\s{2,}/g, ' ').trim()

  return { title, priority, labelNames, projectName, dueDate, dueTime, timeOfDay }
}
