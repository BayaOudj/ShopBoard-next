'use client'
import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'

import { getProductImage } from '../model/products.images'
import { PurchaseControls } from './PurchaseControls'
import { useShop } from '../hooks/useShop'
import { useRouter } from 'next/navigation'
import type { Product } from '../model/products.types'
import { SafeImage } from '../../../components/ui/safe-image'
import { money } from '../../../shared/lib/money'

export function ProductCard({ product }: { product: Product }) {
  const { colorFor } = useShop()
  const color = colorFor(product)
  const { push: navigate } = useRouter()
  const onDetails = (selected: Product) => {
    void navigate(`/products/${encodeURIComponent(selected.id)}`)
  }
  const photo = getProductImage(product, color)
  return (
    <Card
      asChild
      className="group animate-enter cursor-pointer px-2.5 pt-2.5 pb-4.5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <article
        data-product-id={product.id}
        aria-labelledby={`product-${product.id}-title`}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            !event.target.closest('button, a, input, select, label, fieldset')
          )
            onDetails(product)
        }}
      >
        <Button
          variant="unstyled"
          type="button"
          className="block w-full overflow-hidden rounded-photo border-0 bg-art p-0"
          aria-label={`View details for ${product.name}`}
          onClick={() => onDetails(product)}
        >
          <div className="h-65 overflow-hidden rounded-photo bg-art [&>*]:block [&>*]:size-full [&>*]:object-contain [&>*]:transition-transform [&>*]:duration-350 group-hover:[&>*]:scale-[1.035] xl:h-72.5 motion-reduce:[&>*]:transition-none motion-reduce:group-hover:[&>*]:scale-100">
            <SafeImage
              {...photo}
              width={800}
              height={900}
              loading="lazy"
              decoding="async"
              data-product-id={product.id}
            />
          </div>
        </Button>
        <div className="mx-2.25 mt-4.5 flex items-baseline justify-between gap-3 [&_h3]:min-w-0 [&_h3]:text-product [&_h3]:tracking-[-0.3px] [&_p]:m-0 [&_p]:text-product [&_p]:font-semibold [&_p]:whitespace-nowrap">
          <h3 id={`product-${product.id}-title`}>
            <Button
              variant="unstyled"
              type="button"
              className="min-h-11 max-w-full border-0 bg-transparent p-0 text-left wrap-anywhere [font:inherit] hover:text-accent-ink hover:underline hover:underline-offset-4"
              onClick={() => onDetails(product)}
            >
              {product.name}
            </Button>
          </h3>
          <p>{money(product.price)}</p>
        </div>
        <Badge
          variant="category"
          className="mx-2.25 mt-0.5 block text-tiny tracking-[1px] text-subtle uppercase"
        >
          {product.category}
        </Badge>
        <PurchaseControls product={product} />
      </article>
    </Card>
  )
}
