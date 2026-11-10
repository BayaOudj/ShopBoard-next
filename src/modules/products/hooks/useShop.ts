'use client'
import { createContext, useContext, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '../model/products.types'
import type { CatalogResult } from '../model/catalog-result'
import { useCart, type useCartOwner } from '../../cart/hooks/useCart'
import { getColors, variantKey } from '../model/products.colors'

export interface ShopOwner {
  catalog: Promise<CatalogResult>
  cart: ReturnType<typeof useCartOwner>
  colors: Record<string, string>
  changeColor: (product: Product, color: string) => void
  notify: (message: string) => void
}
export const ShopContext = createContext<ShopOwner | null>(null)
export function useShopOwner() {
  const owner = useContext(ShopContext)
  if (!owner) throw new Error('ShopProvider is required')
  return owner
}
export function useCatalogResult() {
  return use(useShopOwner().catalog)
}
export function useCatalog() {
  const result = useCatalogResult()
  if (result.status === 'error') throw new Error(result.message)
  return result.products
}
export function useShop() {
  const owner = useShopOwner()
  const result = useCatalogResult()
  const cart = useCart(
    result.status === 'success' ? result.products : null,
    owner.cart,
  )
  const router = useRouter()
  return {
    productCount: result.status === 'success' ? result.products.length : null,
    cart: {
      ...cart,
      add: (product: Product, color: string) => {
        if (!cart.ready) return
        if ((cart.cart[variantKey(product, color)] ?? 0) >= 99) {
          owner.notify('Maximum quantity is 99 per product.')
          return
        }
        cart.add(product, color)
        owner.notify(`${product.name} (${color}) added to your cart.`)
      },
    },
    retry: () => router.refresh(),
    colorFor: (product: Product) =>
      owner.colors[String(product.id)] ?? getColors(product)[0],
    changeColor: owner.changeColor,
  }
}
