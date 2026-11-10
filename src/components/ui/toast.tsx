export function Toast({ message }: { message: string }) {
  return (
    <p
      id="cart-status"
      role="status"
      aria-live="polite"
      className={
        message
          ? 'pointer-events-none fixed bottom-5 left-1/2 z-50 m-0 w-max max-w-[calc(100%-28px)] -translate-x-1/2 rounded-toast bg-primary px-5 py-3.5 text-body text-primary-foreground shadow-toast'
          : 'sr-only'
      }
    >
      {message}
    </p>
  )
}
