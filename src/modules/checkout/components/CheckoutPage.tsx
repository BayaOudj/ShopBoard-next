'use client'
import { Card } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCatalog, useShop } from '../../products/hooks/useShop'
import { checkoutSchema } from '../model/checkout.schema'
import type { CheckoutValues } from '../model/checkout.schema'
import { money } from '../../../shared/lib/money'
const fields: {
  name: keyof CheckoutValues
  label: string
  autoComplete: string
  type?: string
}[] = [
  { name: 'name', label: 'Full name', autoComplete: 'name' },
  { name: 'email', label: 'Email', autoComplete: 'email', type: 'email' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
]
export default function CheckoutPage() {
  const products = useCatalog()
  const { cart } = useShop()
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLElement>(null)
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
    mode: 'onBlur',
  })
  async function submit(values: CheckoutValues) {
    setConfirmation(
      `Thanks, ${values.name}. Your demo checkout is complete. No payment was collected and no order was placed.`,
    )
    requestAnimationFrame(() => confirmationRef.current?.focus())
  }
  if (!cart.ready && products.length > 0)
    return (
      <section>
        <h1>Checkout</h1>
        <p role="status">Restoring your cart…</p>
      </section>
    )
  if (confirmation)
    return (
      <section
        ref={confirmationRef}
        tabIndex={-1}
        className="mx-auto max-w-[760px] py-7.5"
      >
        <h1>Demo checkout complete</h1>
        <p role="status">{confirmation}</p>
        <p>Your cart is preserved.</p>
        <Link href="/products">Continue shopping</Link>
      </section>
    )
  if (!cart.items.length)
    return (
      <section>
        <h1>Checkout</h1>
        <p>
          Your cart is empty. <Link href="/products">Browse products</Link>
        </p>
      </section>
    )
  return (
    <section className="mx-auto max-w-[760px] py-7.5">
      <h1>Checkout</h1>
      <p>
        Demo checkout. No payment details are needed. Your information stays on
        this page and is never sent or saved.
      </p>
      <Card
        asChild
        variant="plain"
        className="my-5 rounded-button border border-summary-border p-5"
      >
        <aside aria-label="Order summary">
          <h2>Order summary</h2>
          <ul>
            {cart.items.map((item) => (
              <li key={item.id}>
                {item.qty} × {item.product.name} ({item.color}) —{' '}
                {money(item.lineTotal)}
              </li>
            ))}
          </ul>
          <strong>Subtotal {money(cart.subtotal)}</strong>
          <p>Shipping and tax are not calculated.</p>
          <Link href="/cart">Edit cart</Link>
        </aside>
      </Card>
      <Card
        asChild
        variant="plain"
        className="grid gap-5 rounded-thumb bg-surface p-6"
      >
        <form
          noValidate
          aria-label="Checkout"
          onSubmit={(event) => {
            void form.handleSubmit(submit)(event)
          }}
        >
          <p>All fields are required.</p>
          <div className="grid gap-4.5 min-[640px]:grid-cols-2">
            {fields.map((field) => {
              const error = form.formState.errors[field.name]
              return (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    variant="default"
                    id={field.name}
                    type={field.type ?? 'text'}
                    autoComplete={field.autoComplete}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                    {...form.register(field.name)}
                  />
                  {error && (
                    <p
                      id={`${field.name}-error`}
                      className="mt-1.5 mb-0 text-danger"
                    >
                      {error.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <Button
            variant="accent"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Completing…'
              : 'Complete demo checkout'}
          </Button>
        </form>
      </Card>
    </section>
  )
}
