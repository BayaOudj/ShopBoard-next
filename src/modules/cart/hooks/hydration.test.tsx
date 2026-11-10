import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useCartOwner, useCart, useCartPersistence } from './useCart'
const products = [
  { id: 1, name: 'Leather Tote Bag', category: 'Bags', price: 89 },
]
function CartCount() {
  const owner = useCartOwner()
  const cart = useCart(products, owner)
  useCartPersistence(products, owner)
  return <p>{cart.ready ? cart.count : 'Loading cart'}</p>
}
it('hydrates deterministic markup before restoring and persisting a legacy cart', async () => {
  localStorage.setItem('shopboard-cart-v1', '{"1":2,"1::Brown":3}')
  const reads = vi.spyOn(Storage.prototype, 'getItem')
  const writes = vi.spyOn(Storage.prototype, 'setItem')
  const html = renderToString(<CartCount />)
  expect(html).toContain('Loading cart')
  expect(reads).not.toHaveBeenCalled()
  expect(writes).not.toHaveBeenCalled()
  const host = document.createElement('div')
  // Test fixture markup, outside the React-owned hydrated tree.
  const template = document.createElement('template')
  template.innerHTML = html
  host.append(template.content.cloneNode(true))
  document.body.append(host)
  const recover = vi.fn()
  let root: Root | undefined
  await act(async () => {
    root = hydrateRoot(host, <CartCount />, { onRecoverableError: recover })
  })
  await waitFor(() => expect(host).toHaveTextContent('5'))
  expect(recover).not.toHaveBeenCalled()
  expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Brown":5}')
  await act(async () => root?.unmount())
  host.remove()
})

it('hydrates a late cart consumer after the owner has already restored storage', async () => {
  const owner = { saved: { '1::Brown': 2 }, restored: true, dispatch: vi.fn() }
  function LateConsumer() {
    const cart = useCart(products, owner)
    return <p>{cart.ready ? cart.count : 'Loading cart'}</p>
  }
  const html = renderToString(<LateConsumer />)
  expect(html).toContain('Loading cart')
  const host = document.createElement('div')
  const template = document.createElement('template')
  template.innerHTML = html
  host.append(template.content.cloneNode(true))
  document.body.append(host)
  const recover = vi.fn()
  let root: Root | undefined
  await act(async () => {
    root = hydrateRoot(host, <LateConsumer />, { onRecoverableError: recover })
  })
  await waitFor(() => expect(host).toHaveTextContent('2'))
  expect(recover).not.toHaveBeenCalled()
  await act(async () => root?.unmount())
  host.remove()
})
