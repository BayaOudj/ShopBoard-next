import { Suspense } from 'react'
import Content from '../../modules/dashboard/components/InsightsPage'
export const metadata = { title: 'Catalog insights' }
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading catalog insights…</p>}>
      <Content />
    </Suspense>
  )
}
