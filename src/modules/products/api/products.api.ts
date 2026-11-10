import { isProduct, parseProducts } from '../model/products.validation'
import { ApiError, fetchJson } from '../../../shared/api/client'
import type { Product } from '../model/products.types'

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  // This preserves the original static demo catalog; no live backend is implied.
  const data = await fetchJson('/api/products.json', { signal })
  return parseProducts(data)
}

export async function getProduct(
  id: string,
  signal?: AbortSignal,
): Promise<Product | undefined> {
  let data: unknown
  try {
    data = await fetchJson(`/api/products/${encodeURIComponent(id)}.json`, {
      signal,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
  if (!isProduct(data) || String(data.id) !== id)
    throw new Error('The server returned invalid product data.')
  return data
}
