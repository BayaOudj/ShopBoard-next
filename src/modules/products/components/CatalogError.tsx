'use client'
import { Button } from '../../../components/ui/button'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useHydrated } from '../../../shared/hooks/useHydrated'
export function CatalogError({ message }: { message: string }) {
  const hydrated = useHydrated()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <section role="alert">
      <h2>Products could not be loaded</h2>
      <p>{message}</p>
      <Button
        variant="unstyled"
        type="button"
        disabled={!hydrated || pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        {pending ? 'Retrying…' : 'Try again'}
      </Button>
      <p role="status">{pending ? 'Loading products…' : ''}</p>
    </section>
  )
}
