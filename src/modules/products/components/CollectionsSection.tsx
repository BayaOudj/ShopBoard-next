'use client'
import type { Ref } from 'react'
import type { Collection } from '../model/products.types'
import { COLLECTIONS } from '../model/products.collections'
import { SafeImage } from '../../../components/ui/safe-image'
import { useHydrated } from '../../../shared/hooks/useHydrated'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
export function CollectionsSection({
  sectionRef,
  selectedId,
  disabled,
  onSelect,
}: {
  sectionRef: Ref<HTMLElement>
  selectedId?: string
  disabled: boolean
  onSelect: (collection: Collection) => void
}) {
  const hydrated = useHydrated()
  return (
    <section
      id="collections"
      ref={sectionRef}
      className="py-8"
      aria-labelledby="collections-title"
      tabIndex={-1}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.75">
        <div>
          <p className="mb-3 text-tiny font-semibold tracking-[2px] text-subtle">
            GOOD THINGS, TOGETHER
          </p>
          <h2 id="collections-title" className="text-catalog-title">
            Curated for your everyday.
          </h2>
        </div>
        <p className="m-0 text-label text-subtle">
          Thoughtful edits for the way you live.
        </p>
      </div>
      <div id="collection-grid" className="grid gap-4.5 md:grid-cols-3">
        {COLLECTIONS.map((collection) => (
          <Card
            key={collection.id}
            asChild
            className="transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <Button
              variant="unstyled"
              className="flex items-center justify-start gap-0 p-3 text-left aria-pressed:outline-2 aria-pressed:outline-accent-ink aria-pressed:outline-offset-3 md:block xl:flex"
              data-collection={collection.id}
              aria-pressed={selectedId === collection.id}
              disabled={disabled || !hydrated}
              onClick={() => onSelect(collection)}
            >
              <SafeImage
                className="h-27.5 w-22.5 shrink-0 rounded-thumb bg-art object-contain md:h-38.75 md:w-full xl:h-32.5 xl:w-25"
                src={collection.image}
                alt=""
                width={500}
                height={350}
                loading="lazy"
              />
              <span className="block px-3.5 py-2 md:px-2 md:pt-4.5 md:pb-2.5 xl:px-3.75 xl:py-2.5">
                <span className="block text-heading font-semibold tracking-[-0.4px]">
                  {collection.name}
                </span>
                <span className="mt-1.75 mb-2.5 block text-caption text-subtle">
                  {collection.description}
                </span>
                <span className="block text-caption font-medium text-accent-ink">
                  Explore {collection.productIds.length} pieces ↗
                </span>
              </span>
            </Button>
          </Card>
        ))}
      </div>
    </section>
  )
}
