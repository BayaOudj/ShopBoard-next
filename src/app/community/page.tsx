import { Suspense } from 'react'
import Content from '../../modules/registration/components/CommunityPage'
export const metadata = { title: 'Community' }
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading community…</p>}>
      <Content />
    </Suspense>
  )
}
