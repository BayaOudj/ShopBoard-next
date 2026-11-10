import 'server-only'
import { cache } from 'react'
import { connection } from 'next/server'
import fixture from '../../../../public/api/products.json'
import { parseProducts } from '../model/products.validation'
import type { CatalogResult } from '../model/catalog-result'

// Immutable local demo data: no self-HTTP and no shared mutable user state.
// React cache deduplicates repository calls within a single server render.
export const loadCatalog = cache(async (): Promise<CatalogResult> => {
  const testMode =
    process.env.SHOPBOARD_TEST_MODE === '1'
      ? process.env.SHOPBOARD_CATALOG_MODE
      : undefined
  if (testMode) await connection()
  if (testMode === 'delay')
    await new Promise<void>((resolve) => setTimeout(resolve, 3000))
  if (testMode === 'fail')
    return {
      status: 'error',
      message: 'The demo catalog is temporarily unavailable. Please try again.',
    }
  try {
    return {
      status: 'success',
      products: parseProducts(testMode === 'empty' ? [] : fixture),
    }
  } catch {
    return {
      status: 'error',
      message: 'The catalog contains invalid product data. Please try again.',
    }
  }
})
export async function requireCatalog() {
  const result = await loadCatalog()
  if (result.status === 'error') throw new Error(result.message)
  return result.products
}
