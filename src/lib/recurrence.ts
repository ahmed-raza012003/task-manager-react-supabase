import { addDays, addMonths, addWeeks, addYears } from 'date-fns'
import type { RecurrenceRule } from '@/data/types'
import { fromDateKey, toDateKey } from './dateHelpers'

export function recurrenceSummary(rule: RecurrenceRule | null): string {
  if (!rule) return 'Does not repeat'
  const n = rule.interval > 1 ? `${rule.interval} ` : ''
  switch (rule.freq) {
    case 'daily':
      return rule.interval > 1 ? `Every ${rule.interval} days` : 'Daily'
    case 'weekdays':
      return 'Every weekday'
    case 'weekly': {
      if (rule.byWeekday && rule.byWeekday.length > 0) {
        const names = rule.byWeekday.map((d) => WEEKDAY_SHORT[d]).join(', ')
        return `Weekly on ${names}`
      }
      return rule.interval > 1 ? `Every ${n}weeks` : 'Weekly'
    }
    case 'monthly':
      return rule.interval > 1 ? `Every ${n}months` : 'Monthly'
    case 'yearly':
      return rule.interval > 1 ? `Every ${n}years` : 'Yearly'
    default:
      return 'Repeats'
  }
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function computeNextDueDate(rule: RecurrenceRule, fromDateKeyStr: string): string {
  const from = fromDateKey(fromDateKeyStr)
  switch (rule.freq) {
    case 'daily':
      return toDateKey(addDays(from, rule.interval))
    case 'weekdays': {
      let next = addDays(from, 1)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next = addDays(next, 1)
      }
      return toDateKey(next)
    }
    case 'weekly': {
      if (rule.byWeekday && rule.byWeekday.length > 0) {
        const sorted = [...rule.byWeekday].sort((a, b) => a - b)
        const currentDay = from.getDay()
        const next = sorted.find((d) => d > currentDay)
        if (next !== undefined) {
          return toDateKey(addDays(from, next - currentDay))
        }
        const wrapped = addWeeks(from, rule.interval)
        const daysToFirst = (sorted[0] - wrapped.getDay() + 7) % 7
        return toDateKey(addDays(wrapped, daysToFirst))
      }
      return toDateKey(addWeeks(from, rule.interval))
    }
    case 'monthly':
      return toDateKey(addMonths(from, rule.interval))
    case 'yearly':
      return toDateKey(addYears(from, rule.interval))
    default:
      return toDateKey(addDays(from, 1))
  }
}

export function shouldStopSeries(rule: RecurrenceRule, nextDateKey: string, occurrenceIndex: number): boolean {
  if (rule.count != null && occurrenceIndex >= rule.count) return true
  if (rule.endDate && nextDateKey > rule.endDate) return true
  return false
}
