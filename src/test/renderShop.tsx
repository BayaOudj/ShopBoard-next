import { StrictMode, Suspense, type ReactNode } from 'react'
import { act, render } from '@testing-library/react'
import { ShopProvider } from '../modules/products/ShopProvider'
import fixture from '../../public/api/products.json'
import { parseProducts } from '../modules/products/model/products.validation'
import type { CatalogResult } from '../modules/products/model/catalog-result'
export const products = parseProducts(fixture)
export async function renderShop(
  children: ReactNode,
  result: CatalogResult = { status: 'success', products },
) {
  const catalog = Promise.resolve(result)
  let view: ReturnType<typeof render> | undefined
  await act(async () => {
    view = render(
      <StrictMode>
        <ShopProvider catalog={catalog}>
          <Suspense fallback={<p role="status">Loading products…</p>}>
            {children}
          </Suspense>
        </ShopProvider>
      </StrictMode>,
    )
  })
  if (!view) throw new Error('Test render failed')
  return view
}
