import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../shared/lib/utils'
const buttonVariants = cva(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-6 focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'rounded-button border border-primary bg-primary px-4.5 py-3 text-body text-primary-foreground transition-[transform,background,box-shadow] duration-250 enabled:hover:-translate-y-0.5 enabled:hover:bg-primary-hover enabled:hover:shadow-action motion-reduce:enabled:hover:translate-y-0',
        accent:
          'rounded-input border border-action bg-action px-5 py-3 text-field text-action-foreground enabled:hover:brightness-110',
        outline:
          'rounded-control border border-control-border bg-control-solid px-3.5 py-2.5 text-label hover:bg-chip',
        ghost: 'rounded-button px-3 py-2 text-body hover:bg-chip',
        link: 'border-0 bg-transparent p-0 text-accent-ink underline underline-offset-4',
        chip: 'rounded-full border border-border bg-chip px-4 py-2.25 text-label transition-colors duration-250 enabled:hover:bg-chip-hover aria-pressed:border-selected aria-pressed:bg-selected aria-pressed:text-selected-foreground [&[aria-pressed=true]:hover]:bg-selected',
        unstyled: 'gap-0 border-0 bg-transparent p-0 text-inherit',
      },
      size: {
        default: '',
        sm: 'min-h-8 px-3 py-1.5',
        icon: 'size-11 shrink-0 gap-0 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }
export function Button({
  asChild = false,
  variant,
  size,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      type={asChild ? undefined : type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
