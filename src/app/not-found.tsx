import Link from 'next/link'
export default function NotFound() {
  return (
    <section>
      <h1>404 — Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/products">Browse products</Link>
    </section>
  )
}
