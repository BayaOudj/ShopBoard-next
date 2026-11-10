import { Suspense } from 'react'
import Content from '../../modules/checkout/components/CheckoutPage'
export const metadata = { title: 'Checkout' }
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading checkout…</p>}>
      <Content />
    </Suspense>
  )
}
