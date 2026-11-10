'use client'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../shared/lib/utils'
import { X } from 'lucide-react'
import { Card } from './card'
import { Button } from './button'
const modalVariants = cva(
  'fixed inset-0 m-auto max-h-[calc(100dvh-48px)] w-[calc(100%-24px)] overflow-y-auto rounded-modal p-6.25 text-ink shadow-modal backdrop:bg-overlay backdrop:backdrop-blur-sm [&:not([open])]:hidden',
  {
    variants: {
      size: { sm: 'max-w-[340px]', default: 'max-w-lg', lg: 'max-w-3xl' },
    },
    defaultVariants: { size: 'default' },
  },
)
export interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size,
  className,
}: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const node = dialog.current
    if (open && node && !node.open) node.showModal()
    if (!open && node?.open) node.close()
  }, [open])
  return (
    <Card
      asChild
      variant="solid"
      className={cn(modalVariants({ size }), className)}
    >
      <dialog
        ref={dialog}
        aria-labelledby={id}
        aria-describedby={description ? id + '-description' : undefined}
        onCancel={(event) => {
          event.preventDefault()
          onClose()
        }}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.target === event.currentTarget &&
            (event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom)
          )
            onClose()
        }}
      >
        <div className="mb-3.75 flex items-start justify-between gap-3">
          <h2 id={id} className="text-logo">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="-mt-2 -mr-2"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        {description && (
          <p id={id + '-description'} className="mb-3 text-body text-subtle">
            {description}
          </p>
        )}
        {children}
      </dialog>
    </Card>
  )
}
