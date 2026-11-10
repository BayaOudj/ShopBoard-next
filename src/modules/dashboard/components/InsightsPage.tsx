'use client'

import { useRouter } from 'next/navigation'
import { CatalogInsights } from '../../dashboard/components/CatalogInsights'
import { useCatalog } from '../../products/hooks/useShop'
export default function InsightsPage() {
  const products = useCatalog()
  const { push: navigate } = useRouter()
  return (
    <CatalogInsights
      sectionRef={null}
      products={products}
      loaded
      onDetails={(product) =>
        navigate(`/products/${encodeURIComponent(product.id)}`)
      }
    />
  )
}
