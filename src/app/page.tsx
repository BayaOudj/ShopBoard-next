import { Suspense } from 'react'
import { Hero } from './components/Hero'
import { OverviewMetrics } from '../modules/dashboard/components/OverviewMetrics'
export default function OverviewPage() {
  return (
    <>
      <Hero sectionRef={null} />
      <Suspense fallback={<p role="status">Loading catalog metrics…</p>}>
        <OverviewMetrics />
      </Suspense>
    </>
  )
}
