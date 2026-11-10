import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../shared/lib/utils'
const inputVariants = cva(
  'min-w-0 focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-50 aria-invalid:border-danger',
  {
    variants: {
      variant: {
        soft: 'block min-h-11 w-full rounded-control border border-control-border bg-control px-3.5 py-3 text-field text-input-ink placeholder:text-placeholder focus:border-focus',
        default:
          'mt-1.5 block min-h-11 w-full rounded-input border border-input-border bg-control-solid px-3 py-2.5 text-field text-input-ink focus-visible:outline-offset-3',
        choice: 'm-0 size-4.25 shrink-0 cursor-pointer accent-focus',
        bare: '',
      },
    },
    defaultVariants: { variant: 'soft' },
  },
)
export type InputProps = ComponentProps<'input'> &
  VariantProps<typeof inputVariants>
export function Input({
  type = 'text',
  variant,
  className,
  ...props
}: InputProps) {
  const appearance =
    variant ?? (type === 'checkbox' || type === 'radio' ? 'choice' : 'soft')
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(inputVariants({ variant: appearance }), className)}
      {...props}
    />
  )
}
