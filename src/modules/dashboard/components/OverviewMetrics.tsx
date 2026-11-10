'use client'
import { useCatalogResult } from '../../products/hooks/useShop'
import { CatalogError } from '../../products/components/CatalogError'
import { DashboardOverview } from './DashboardOverview'
export function OverviewMetrics() {
  const result = useCatalogResult()
  return result.status === 'error' ? (
    <CatalogError message={result.message} />
  ) : (
    <DashboardOverview products={result.products} loaded />
  )
}
