import { Suspense } from 'react'
import type { Metadata } from 'next'
import ProductsPage from '../../modules/products/components/ProductsPage'
export const metadata: Metadata = { title: 'Products' }
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  return (
    <Suspense fallback={<p role="status">Loading products…</p>}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  )
}
async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  const { collection } = await searchParams
  return <ProductsPage collectionId={collection} />
}
