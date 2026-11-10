'use client'
import { Suspense, useState, type ReactNode } from 'react'
import { ShopContext, useCatalogResult, useShopOwner } from './hooks/useShop'
import type { CatalogResult } from './model/catalog-result'
import type { Product } from './model/products.types'
import { getColors } from './model/products.colors'
import { useCartOwner, useCartPersistence } from '../cart/hooks/useCart'
import { Toast } from '../../components/ui/toast'
import { useToast } from '../../shared/hooks/useToast'

function CartPersistence() {
  const owner = useShopOwner()
  const result = useCatalogResult()
  useCartPersistence(
    result.status === 'success' ? result.products : null,
    owner.cart,
  )
  return null
}
export function ShopProvider({
  catalog,
  children,
}: {
  catalog: Promise<CatalogResult>
  children: ReactNode
}) {
  const cart = useCartOwner()
  const [colors, setColors] = useState<Record<string, string>>({})
  const toast = useToast()
  function changeColor(product: Product, color: string) {
    if (getColors(product).includes(color))
      setColors((previous) => ({ ...previous, [String(product.id)]: color }))
  }
  return (
    <ShopContext.Provider
      value={{ catalog, cart, colors, changeColor, notify: toast.notify }}
    >
      {children}
      <Suspense fallback={null}>
        <CartPersistence />
      </Suspense>
      <Toast message={toast.message} />
    </ShopContext.Provider>
  )
}
