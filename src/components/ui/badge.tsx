import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../shared/lib/utils'
const badgeVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default:
        'whitespace-nowrap rounded-full border border-border bg-chip px-3 py-1.5 text-caption',
      category: 'block text-tiny tracking-[1px] text-subtle uppercase',
      counter:
        'ml-1.5 rounded-md bg-counter px-1.5 py-0.5 text-caption text-counter-foreground',
      success: 'text-caption text-success',
    },
  },
  defaultVariants: { variant: 'default' },
})
export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>
export function Badge({ variant, className, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
