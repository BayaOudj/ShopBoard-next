import { Suspense } from 'react'
import Content from '../../modules/cart/components/CartPage'
export const metadata = { title: 'Cart' }
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading cart…</p>}>
      <Content />
    </Suspense>
  )
}
