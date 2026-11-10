'use client'
import { Card } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

import { useEffect, useRef } from 'react'
import { useHydrated } from '../../../shared/hooks/useHydrated'
import type { Ref, RefObject } from 'react'
import type { LoadState } from '../model/products.types'
import { CATEGORIES } from '../model/products.collections'
import { selectProducts } from '../model/products.logic'
import type { useCatalogFilters } from '../hooks/useCatalogFilters'
import { CatalogFeedback } from './CatalogFeedback'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { money } from '../../../shared/lib/money'

export interface CatalogSectionProps {
  state: LoadState
  onRetry: () => void
  sectionRef: Ref<HTMLElement>
  searchRef: RefObject<HTMLInputElement | null>
  controls: ReturnType<typeof useCatalogFilters>
  categoryRef?: RefObject<HTMLButtonElement | null>
}

export function CatalogSection({
  state,
  onRetry,
  sectionRef,
  searchRef,
  controls,
  categoryRef,
}: CatalogSectionProps) {
  const hydrated = useHydrated()
  const localCategory = useRef<HTMLButtonElement>(null)
  const firstCategory = categoryRef ?? localCategory
  const retryFocus = useRef(false)
  const { filters, namesOnly, setNamesOnly, updateFilters, resetFilters } =
    controls
  const ready = state.status === 'success' && state.products.length > 0
  const interactive = ready && hydrated
  useEffect(() => {
    if (ready && retryFocus.current) {
      retryFocus.current = false
      firstCategory.current?.focus({ preventScroll: true })
    }
  }, [ready, firstCategory])
  const products = state.status === 'success' ? state.products : []
  const visible = selectProducts(products, filters)
  const hasFilters = Boolean(
    filters.collection ||
    filters.category !== 'All' ||
    filters.query ||
    filters.underFifty,
  )
  const clearFilters = () => {
    resetFilters()
    firstCategory.current?.focus({ preventScroll: true })
  }
  return (
    <section
      id="products"
      ref={sectionRef}
      className="py-8"
      aria-labelledby="products-title"
      aria-busy={state.status === 'loading'}
      data-load-state={state.status}
      tabIndex={-1}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.75 [&>h2]:text-catalog-title [&>p]:m-0 [&>p]:text-label [&>p]:text-subtle">
        <div>
          <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
            THE SHOPBOARD EDIT
          </p>
          <h2 id="products-title">Good things, all in one place.</h2>
        </div>
        <p>{products.length} good finds. AI-generated product previews.</p>
      </div>
      <div
        id="category-filters"
        className="mb-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter products by category"
      >
        {['All', ...CATEGORIES].map((category, index) => (
          <Button
            variant="chip"
            ref={index === 0 ? firstCategory : undefined}
            key={category}
            type="button"
            data-category={category}
            aria-pressed={filters.category === category}
            disabled={!interactive}
            onClick={() => updateFilters({ category })}
          >
            {category === 'All' ? 'Shop all' : category}
          </Button>
        ))}
      </div>
      <div className="mb-3.75 flex min-h-11 items-center justify-between gap-3.5 text-label [&_p]:m-0 [&_p]:text-subtle [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-label [&_button]:text-accent-ink [&_button]:underline [&_button]:underline-offset-4">
        <p id="active-collection">
          {filters.collection
            ? `Collection: ${filters.collection.name}`
            : 'Browsing all collections'}
        </p>
        {ready && hasFilters && (
          <Button
            variant="unstyled"
            id="reset-filters"
            type="button"
            disabled={!interactive}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      <Card
        asChild
        className="mb-3.5 rounded-panel border-border p-4.5 [&_label]:mb-2 [&_label]:block [&_label]:text-body [&_label]:font-medium"
      >
        <form
          id="product-search"
          role="search"
          aria-label="Search collection"
          onSubmit={(event) => event.preventDefault()}
        >
          <Label htmlFor="search-products">Search products</Label>
          <div className="flex items-center gap-2.5 [&_input]:flex-1 [&_button]:rounded-control [&_button]:border [&_button]:border-line [&_button]:bg-control-solid [&_button]:px-3.5 [&_button]:py-2.5 [&_button]:text-label">
            <Input
              ref={searchRef}
              id="search-products"
              type="search"
              name="q"
              placeholder="Search all products…"
              autoComplete="off"
              aria-controls="catalog-grid product-names"
              disabled={!interactive}
              value={filters.query}
              onChange={(event) =>
                updateFilters({ query: event.currentTarget.value })
              }
            />
            <Button
              variant="unstyled"
              id="clear-search"
              type="button"
              disabled={!interactive || !filters.query}
              onClick={() => {
                updateFilters({ query: '' })
                searchRef.current?.focus()
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>
      {ready && visible.length > 0 && (
        <Card
          className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-panel border-border px-4.5 py-4"
          role="group"
          aria-label="Collection controls"
        >
          <Label className="m-0 flex min-h-7.5 cursor-pointer items-center gap-2.25 text-label">
            <Input
              id="names-only"
              type="checkbox"
              checked={namesOnly}
              disabled={!interactive}
              onChange={(event) => setNamesOnly(event.currentTarget.checked)}
            />
            Names only
          </Label>
          <Label className="m-0 flex min-h-7.5 cursor-pointer items-center gap-2.25 text-label">
            <Input
              id="under-fifty"
              type="checkbox"
              checked={filters.underFifty}
              disabled={!interactive}
              onChange={(event) =>
                updateFilters({ underFifty: event.currentTarget.checked })
              }
            />
            Under $50
          </Label>
          <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto [&_label]:text-label [&_select]:w-auto [&_select]:max-w-full [&_select]:min-w-0 [&_select]:rounded-control [&_select]:border [&_select]:border-control-border [&_select]:bg-control [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-body">
            <Label htmlFor="product-sort">Sort by</Label>
            <select
              id="product-sort"
              disabled={!interactive}
              value={filters.sort}
              onChange={(event) =>
                updateFilters({
                  sort:
                    event.currentTarget.value === 'expensive'
                      ? 'expensive'
                      : event.currentTarget.value === 'original'
                        ? 'original'
                        : 'cheapest',
                })
              }
            >
              <option value="cheapest">Price: low to high</option>
              <option value="expensive">Price: high to low</option>
              <option value="original">Featured order</option>
            </select>
          </div>
        </Card>
      )}
      {(!ready || visible.length === 0) && (
        <CatalogFeedback
          state={state}
          onRetry={() => {
            retryFocus.current = true
            onRetry()
          }}
          visibleCount={visible.length}
          onClearFilters={clearFilters}
        />
      )}
      {ready && (
        <p
          id="catalog-summary"
          className="mt-4.5 mb-5.5 text-label text-subtle"
          role="status"
        >
          {visible.length} of {products.length} products · Shown total:{' '}
          {money(visible.reduce((sum, product) => sum + product.price, 0))} ·
          All products total:{' '}
          {money(products.reduce((sum, product) => sum + product.price, 0))}
        </p>
      )}
      {ready && !namesOnly && visible.length > 0 && (
        <div
          id="catalog-grid"
          className="grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-3"
          aria-labelledby="products-title"
        >
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {ready && namesOnly && visible.length > 0 && (
        <ul
          id="product-names"
          className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 [&_li]:rounded-item [&_li]:border [&_li]:border-border [&_li]:bg-surface [&_li]:px-4.5 [&_li]:py-2.5 [&_li]:text-product"
          aria-label="Product names"
        >
          {visible.map((product) => (
            <li key={product.id}>
              <Link
                className="min-h-11 max-w-full border-0 bg-transparent p-0 text-left wrap-anywhere [font:inherit] hover:text-accent-ink hover:underline hover:underline-offset-4"
                aria-label={`View details for ${product.name}`}
                href={`/products/${encodeURIComponent(product.id)}`}
              >
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
