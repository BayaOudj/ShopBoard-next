'use client'
import { Button } from '../components/ui/button'
export default function ErrorPage({
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <section role="alert">
      <h1>This section could not load</h1>
      <p>Please try again. Your saved cart is preserved.</p>
      <Button variant="unstyled" type="button" onClick={retry}>
        Try again
      </Button>
    </section>
  )
}
