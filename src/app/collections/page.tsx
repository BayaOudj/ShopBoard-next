import { Suspense } from 'react'
import Content from '../../modules/products/components/CollectionsPage'
export const metadata = { title: 'Collections' }
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading collections…</p>}>
      <Content />
    </Suspense>
  )
}
