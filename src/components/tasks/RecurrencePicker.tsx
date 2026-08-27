import { useState } from 'react'
import { Repeat } from 'lucide-react'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@/components/common/Popover'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { recurrenceSummary } from '@/lib/recurrence'
import { cn } from '@/lib/cn'
import type { RecurrenceFreq, RecurrenceRule } from '@/data/types'

const FREQ_OPTIONS: { value: RecurrenceFreq; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Every weekday' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function RecurrencePicker({ value, onChange }: { value: RecurrenceRule | null; onChange: (rule: RecurrenceRule | null) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<RecurrenceRule>(value ?? { freq: 'weekly', interval: 1, byWeekday: [] })

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setDraft(value ?? { freq: 'weekly', interval: 1, byWeekday: [] })
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium',
            value ? 'border-accent bg-accent-subtle-bg text-accent-subtle-text' : 'border-dashed border-border-strong text-text-secondary hover:bg-hover',
          )}
        >
          <Repeat className="h-3.5 w-3.5" /> {value ? recurrenceSummary(value) : 'Repeat'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Repeats</p>
        <div className="mb-3 grid grid-cols-2 gap-1">
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDraft({ ...draft, freq: opt.value })}
              className={cn(
                'rounded-md px-2 py-1.5 text-xs font-medium',
                draft.freq === opt.value ? 'bg-accent text-white' : 'bg-inset text-text-secondary hover:bg-hover',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {draft.freq === 'weekly' && (
          <div className="mb-3">
            <p className="mb-1.5 text-xs text-text-secondary">On days</p>
            <div className="flex gap-1">
              {WEEKDAYS.map((d, i) => {
                const active = draft.byWeekday?.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        byWeekday: active ? draft.byWeekday?.filter((x) => x !== i) : [...(draft.byWeekday ?? []), i],
                      })
                    }
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold',
                      active ? 'bg-accent text-white' : 'bg-inset text-text-secondary hover:bg-hover',
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {(draft.freq === 'daily' || draft.freq === 'weekly' || draft.freq === 'monthly' || draft.freq === 'yearly') && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-text-secondary">Every</span>
            <Input
              type="number"
              min={1}
              value={draft.interval}
              onChange={(e) => setDraft({ ...draft, interval: Math.max(1, parseInt(e.target.value) || 1) })}
              className="h-7 w-16 px-2 text-xs"
            />
            <span className="text-xs text-text-secondary">
              {draft.freq === 'daily' && 'day(s)'}
              {draft.freq === 'weekly' && 'week(s)'}
              {draft.freq === 'monthly' && 'month(s)'}
              {draft.freq === 'yearly' && 'year(s)'}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          {value && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Remove
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            className="ml-auto"
            onClick={() => {
              onChange(draft)
              setOpen(false)
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
