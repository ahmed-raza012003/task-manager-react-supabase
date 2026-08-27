import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-text-on-accent hover:bg-accent-hover shadow-token-sm hover:shadow-[0_0_0_4px_var(--color-accent-subtle-bg)]',
  secondary: 'bg-surface text-text-primary border border-border-subtle hover:bg-hover shadow-token-sm',
  outline: 'bg-transparent text-text-primary border border-border-strong hover:bg-hover',
  ghost: 'bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary',
  danger: 'bg-danger text-white hover:brightness-110 shadow-token-sm',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-md',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-md justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
