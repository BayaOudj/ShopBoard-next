import Link from 'next/link'
export default function MissingProduct() {
  return (
    <section>
      <h1>Product not found</h1>
      <p>This product is not in the demo catalog.</p>
      <Link href="/products">Back to products</Link>
    </section>
  )
}
