'use client'
import { Card } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

import Link from 'next/link'
import { useCatalog, useShop } from '../../products/hooks/useShop'
import { money } from '../../../shared/lib/money'
export default function CartPage() {
  const products = useCatalog()
  const { cart } = useShop()
  if (!cart.ready && products.length > 0)
    return (
      <section>
        <h1>Your shopping cart</h1>
        <p role="status">Restoring your cart…</p>
      </section>
    )
  return (
    <section className="py-8">
      <h1>Your shopping cart</h1>
      {!cart.items.length ? (
        <p>
          Your cart is empty.{' '}
          <Link href="/products">Find something you love.</Link>
        </p>
      ) : (
        <>
          <ul className="grid list-none gap-4.5 p-0">
            {cart.items.map((item) => (
              <Card
                key={item.id}
                asChild
                className="flex flex-wrap items-center gap-4.5 rounded-thumb border-border p-5 [&_h2]:flex-[1_1_260px] [&_h2]:text-chart-title [&_input]:w-18 [&_input]:rounded-input [&_input]:border-input-border [&_input]:p-2 [&_label]:flex [&_label]:items-center [&_label]:gap-2 [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-danger [&_button]:underline"
              >
                <li>
                  <h2>
                    {item.product.name} · {item.color}
                  </h2>
                  <Label>
                    Quantity{' '}
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      value={item.qty}
                      onChange={(event) => {
                        const value = event.currentTarget.valueAsNumber
                        if (
                          Number.isInteger(value) &&
                          value >= 1 &&
                          value <= 99
                        )
                          cart.setQuantity(item.id, value)
                      }}
                    />
                  </Label>
                  <span>{money(item.lineTotal)}</span>
                  <Button
                    variant="unstyled"
                    type="button"
                    onClick={() => cart.remove(item.id)}
                  >
                    Remove {item.product.name}, {item.color}
                  </Button>
                </li>
              </Card>
            ))}
          </ul>
          <p>Subtotal: {money(cart.subtotal)}</p>
          <Button
            asChild
            variant="accent"
            className="inline-block rounded-icon bg-action px-5.5 py-3.5 text-action-foreground"
          >
            <Link href="/checkout">Continue to checkout</Link>
          </Button>
        </>
      )}
    </section>
  )
}
