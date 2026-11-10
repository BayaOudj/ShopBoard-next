'use client'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

import { useRef } from 'react'
import type { LoadState } from '../model/products.types'

interface CatalogFeedbackProps {
  state: LoadState
  onRetry: () => void
  visibleCount?: number
  onClearFilters?: () => void
}

export function CatalogFeedback({
  state,
  onRetry,
  visibleCount,
  onClearFilters,
}: CatalogFeedbackProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  let title: string
  let message: string
  const empty =
    state.status === 'empty' ||
    (state.status === 'success' && state.products.length === 0)
  const noMatches =
    state.status === 'success' &&
    state.products.length > 0 &&
    visibleCount === 0

  if (state.status === 'loading') {
    title = 'Loading products…'
    message = 'Your collection is on its way.'
  } else if (state.status === 'error') {
    title = 'Products could not be loaded'
    message = state.message
  } else if (empty) {
    title = 'No products yet'
    message = 'Check back soon for new additions to the collection.'
  } else if (noMatches) {
    title = 'No products match these filters'
    message = 'Try another search or clear your filters to see all products.'
  } else {
    const count = state.status === 'success' ? state.products.length : 0
    title = `${count} ${count === 1 ? 'product' : 'products'} loaded`
    message = 'Browse the collection and find your everyday essentials.'
  }

  return (
    <Card className="min-h-45 p-7 [&_h3]:w-fit [&_h3]:text-logo-compact [&_p]:mt-2.5 [&_p]:mb-0 [&_p]:max-w-[600px] [&_p]:text-body [&_p]:text-subtle">
      <div role="status" aria-live="polite" aria-atomic="true">
        <h3 ref={heading} tabIndex={-1}>
          {title}
        </h3>
        <p>{message}</p>
      </div>
      {state.status === 'error' && (
        <Button
          variant="unstyled"
          id="retry-products"
          className="mt-5 rounded-button border border-primary bg-primary px-4.5 py-3 text-body text-primary-foreground transition-colors duration-250 hover:bg-primary-hover motion-reduce:transition-none"
          type="button"
          onClick={() => {
            heading.current?.focus({ preventScroll: true })
            onRetry()
          }}
        >
          Try again
        </Button>
      )}
      {noMatches && onClearFilters && (
        <Button
          variant="unstyled"
          className="mt-5 rounded-button border border-primary bg-primary px-4.5 py-3 text-body text-primary-foreground transition-colors duration-250 hover:bg-primary-hover motion-reduce:transition-none"
          type="button"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      )}
    </Card>
  )
}
