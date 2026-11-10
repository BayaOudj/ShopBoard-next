'use client'
import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'

import type { Ref } from 'react'
import type { Product } from '../../products/model/products.types'
import { getColors } from '../../products/model/products.colors'
import { money } from '../../../shared/lib/money'

export function CatalogInsights({
  products,
  loaded,
  sectionRef,
  onDetails,
}: {
  products: Product[]
  loaded: boolean
  sectionRef: Ref<HTMLElement>
  onDetails: (product: Product) => void
}) {
  return (
    <section
      id="catalog-insights"
      hidden={!loaded}
      ref={sectionRef}
      className="py-8"
      aria-labelledby="insights-title"
      tabIndex={-1}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.75 [&>h2]:text-catalog-title [&>p]:m-0 [&>p]:text-label [&>p]:text-subtle">
        <div>
          <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
            BEHIND THE COLLECTION
          </p>
          <h2 id="insights-title">Catalog at a glance</h2>
        </div>
        <Badge>{products.length} demo listings</Badge>
      </div>
      <Card className="overflow-x-auto px-5.5 py-2.5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-label [&_caption]:pt-3 [&_caption]:pb-4.5 [&_caption]:text-left [&_caption]:text-caption [&_caption]:text-subtle [&_th]:border-b [&_th]:border-table-line [&_th]:px-2.5 [&_th]:py-3.25 [&_th]:align-middle [&_th]:font-medium [&_td]:border-b [&_td]:border-table-line [&_td]:px-2.5 [&_td]:py-3.25 [&_td]:align-middle [&_td]:font-normal [&_thead_th]:text-caption [&_thead_th]:text-subtle">
        <table className="min-w-[660px] [&_tr:last-child>*]:border-b-0 [&_td:last-child]:text-caption [&_td:last-child]:text-success [&_button]:min-h-8 [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-left [&_button]:[font:inherit] [&_button:hover]:text-accent-ink [&_button:hover]:underline">
          <caption>
            Product prices, categories, and available preview colours. Stock is
            unverified.
          </caption>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Preview colours</th>
              <th scope="col">Listing</th>
            </tr>
          </thead>
          <tbody id="insights-products">
            {products.map((product) => (
              <tr key={product.id}>
                <th scope="row">
                  <Button
                    variant="unstyled"
                    type="button"
                    onClick={() => onDetails(product)}
                  >
                    {product.name}
                  </Button>
                </th>
                <td>{product.category}</td>
                <td>{money(product.price)}</td>
                <td>{getColors(product).join(' · ')}</td>
                <td>
                  <Badge variant="success">Demo listing</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 mb-0 text-label leading-[1.7] text-subtle">
        Catalog insights describe demo listings. Sales, customer, order, and
        stock data are not connected.
      </p>
    </section>
  )
}
