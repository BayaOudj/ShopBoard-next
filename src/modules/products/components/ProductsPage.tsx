'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CatalogSection } from './CatalogSection'
import { CatalogError } from './CatalogError'
import { useCatalogFilters } from '../hooks/useCatalogFilters'
import { useCatalogResult } from '../hooks/useShop'
import { COLLECTIONS } from '../model/products.collections'
import { useProductSearchShortcut } from '../../../shared/hooks/useProductSearchShortcut'
export default function ProductsPage({
  collectionId,
}: {
  collectionId?: string
}) {
  const result = useCatalogResult()
  const router = useRouter()
  const controls = useCatalogFilters()
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const focus = () => {
      if (window.location.hash === '#search-products') search.current?.focus()
    }
    focus()
    window.addEventListener('hashchange', focus)
    return () => window.removeEventListener('hashchange', focus)
  }, [])
  useProductSearchShortcut(search)
  if (result.status === 'error')
    return <CatalogError message={result.message} />
  const collection = COLLECTIONS.find((item) => item.id === collectionId)
  const effectiveControls = collection
    ? {
        ...controls,
        filters: { ...controls.filters, collection },
        resetFilters: () => {
          controls.resetFilters()
          router.push('/products')
        },
      }
    : controls
  return (
    <CatalogSection
      sectionRef={null}
      searchRef={search}
      controls={effectiveControls}
      state={
        result.products.length
          ? { status: 'success', products: result.products }
          : { status: 'empty' }
      }
      onRetry={() => router.refresh()}
    />
  )
}
