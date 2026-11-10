'use client'

import Link from 'next/link'
import { useShop } from '../hooks/useShop'
import { PurchaseControls } from './PurchaseControls'
import { SafeImage } from '../../../components/ui/safe-image'
import { getProductImage } from '../model/products.images'
import { money } from '../../../shared/lib/money'
import type { Product } from '../model/products.types'
export default function ProductPage({ product }: { product: Product }) {
  const shop = useShop()
  const color = shop.colorFor(product)
  return (
    <section className="py-8">
      <Link
        className="inline-block py-3 text-accent-ink underline"
        href="/products"
      >
        ← All products
      </Link>
      <div className="mt-5.5 grid items-start gap-7 md:grid-cols-2">
        <SafeImage
          className="aspect-square w-full rounded-detail object-cover"
          {...getProductImage(product, color)}
          width={600}
          height={600}
        />
        <div className="grid gap-5 py-5 [&_h1]:m-0 [&_p]:m-0">
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="text-price font-semibold">{money(product.price)}</p>
          <p className="text-product leading-[1.7] text-subtle">
            Demo listing · Representative colour previews; stock is unverified.
          </p>
          <PurchaseControls product={product} />
          <Link
            className="inline-block py-3 text-accent-ink underline"
            href="/cart"
          >
            View cart →
          </Link>
        </div>
      </div>
    </section>
  )
}
