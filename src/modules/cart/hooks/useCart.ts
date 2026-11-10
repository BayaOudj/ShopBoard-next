'use client'
import { useHydrated } from '../../../shared/hooks/useHydrated'
import { useEffect, useMemo, useReducer } from 'react'
import type { Product } from '../../products/model/products.types'
import type { CartAction } from '../model/cart.types'
import {
  cartCount,
  cartReducer,
  lineItems,
  subtotal,
} from '../model/cart.logic'
import { decodeCart, readStoredCart, saveCart } from '../model/cart.persistence'

interface State {
  saved: unknown
  restored: boolean
}
type Action = CartAction | { type: 'restore'; saved: unknown }
function reducer(state: State, action: Action): State {
  if (action.type === 'restore')
    return state.restored ? state : { saved: action.saved, restored: true }
  return state.restored
    ? { ...state, saved: cartReducer(state.saved, action) }
    : state
}
export function useCartOwner() {
  const [state, dispatch] = useReducer(reducer, {
    saved: null,
    restored: false,
  })
  useEffect(() => {
    let active = true
    // Browser storage is read after hydration, never during server/client rendering.
    queueMicrotask(() => {
      if (active) dispatch({ type: 'restore', saved: readStoredCart() })
    })
    return () => {
      active = false
    }
  }, [])
  return { ...state, dispatch }
}
export function useCart(
  catalog: Product[] | null,
  owner: ReturnType<typeof useCartOwner>,
) {
  // Each streamed consumer must hydrate with the server's unready cart, even
  // when the persistent owner restored storage before this boundary arrived.
  const hydrated = useHydrated()
  const ready = hydrated && owner.restored && Boolean(catalog?.length)
  const cart = useMemo(
    () => (ready && catalog ? decodeCart(owner.saved, catalog) : {}),
    [ready, owner.saved, catalog],
  )
  const items = lineItems(cart, catalog ?? [])
  return {
    ready,
    cart,
    items,
    count: cartCount(cart),
    subtotal: subtotal(items),
    add: (product: Product, color: string) => {
      if (ready && catalog)
        owner.dispatch({ type: 'add', products: catalog, product, color })
    },
    remove: (id: string) => {
      if (ready && catalog)
        owner.dispatch({ type: 'remove', products: catalog, id })
    },
    setQuantity: (id: string, quantity: number) => {
      if (ready && catalog)
        owner.dispatch({ type: 'quantity', products: catalog, id, quantity })
    },
  }
}
export function useCartPersistence(
  catalog: Product[] | null,
  owner: ReturnType<typeof useCartOwner>,
) {
  const cart = useCart(catalog, owner)
  useEffect(() => {
    if (cart.ready) saveCart(cart.cart)
  }, [cart.ready, cart.cart])
}
