'use client'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

import { useShop } from '../hooks/useShop'
import { useId } from 'react'
import type { Product } from '../model/products.types'
import { colorSwatches, getColors } from '../model/products.colors'

export function PurchaseControls({ product }: { product: Product }) {
  const { colorFor, changeColor, cart } = useShop()
  const color = colorFor(product)
  const group = useId()
  return (
    <div className="mx-2.25 mt-3.75 grid cursor-default gap-3">
      <fieldset
        className="m-0 min-w-0 border-0 p-0 [&_legend]:mb-0.5 [&_legend]:p-0 [&_legend]:text-caption [&_legend]:text-subtle"
        disabled={!cart.ready}
      >
        <legend>Colour: {color}</legend>
        <div className="flex flex-wrap gap-0.5">
          {getColors(product).map((option) => (
            <Label
              key={option}
              className="relative m-0 grid size-11 cursor-pointer place-items-center rounded-full [&_input]:absolute [&_input]:m-0 [&_input]:size-px [&_input]:p-0 [&_input]:opacity-0"
              title={option}
            >
              <Input
                variant="bare"
                className="peer"
                type="radio"
                name={group}
                value={option}
                checked={color === option}
                aria-label={`${option} for ${product.name}`}
                onChange={() => changeColor(product, option)}
              />
              <span
                className="block size-5.75 rounded-full border border-swatch-border transition-shadow duration-250 peer-checked:outline-2 peer-checked:outline-focus peer-checked:outline-offset-3 peer-focus-visible:outline-3 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-5 hover:shadow-swatch motion-reduce:transition-none"
                style={{
                  background:
                    colorSwatches[option] ?? 'var(--color-swatch-natural)',
                }}
                aria-hidden="true"
              />
            </Label>
          ))}
        </div>
      </fieldset>
      <Button
        disabled={!cart.ready}
        aria-label={`Add ${product.name} to cart`}
        onClick={() => cart.add(product, color)}
      >
        Add to cart +
      </Button>
    </div>
  )
}
