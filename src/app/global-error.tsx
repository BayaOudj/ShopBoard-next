'use client'
import { Button } from '../components/ui/button'
export default function GlobalError({
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <html lang="en">
      <body>
        <h1>The workspace could not load</h1>
        <p>Your saved cart is preserved.</p>
        <Button variant="unstyled" type="button" onClick={retry}>
          Try again
        </Button>
      </body>
    </html>
  )
}
