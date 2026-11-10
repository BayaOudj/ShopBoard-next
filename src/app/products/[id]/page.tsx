import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { requireCatalog } from '../../../modules/products/server/catalog'
import ProductPage from '../../../modules/products/components/ProductPage'
export const metadata = { title: 'Product details' }
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">Loading product…</p>}>
      <ProductContent params={params} />
    </Suspense>
  )
}
async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await requireCatalog()
  const product = products.find((item) => String(item.id) === id)
  if (!product) notFound()
  return <ProductPage product={product} />
}
