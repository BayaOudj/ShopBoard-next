import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../shared/lib/utils'
const glass = 'rounded-card border border-glass shadow-surface'
const cardVariants = cva('min-w-0', {
  variants: {
    variant: {
      default: glass + ' bg-surface',
      value: glass + ' bg-(image:--background-image-value-panel)',
      mix: glass + ' bg-(image:--background-image-mix-panel)',
      solid: glass + ' bg-surface-strong',
      plain: '',
    },
  },
  defaultVariants: { variant: 'default' },
})
export type CardProps = ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & { asChild?: boolean }
export function Card({
  variant,
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}
