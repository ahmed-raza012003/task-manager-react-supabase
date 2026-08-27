import { forwardRef } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-9 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary',
      'transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[var(--ring-accent)]',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
        'transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[var(--ring-accent)] resize-none',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
