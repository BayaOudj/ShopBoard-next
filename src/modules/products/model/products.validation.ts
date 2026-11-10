import type { Product } from './products.types'

export function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false
  if (
    !('id' in value) ||
    !('name' in value) ||
    !('price' in value) ||
    !('category' in value)
  )
    return false
  return (
    ((typeof value.id === 'string' &&
      value.id.trim().length > 0 &&
      !value.id.includes('::')) ||
      (typeof value.id === 'number' && Number.isFinite(value.id))) &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    typeof value.category === 'string' &&
    value.category.trim().length > 0 &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    (!('description' in value) ||
      value.description === undefined ||
      typeof value.description === 'string')
  )
}

export function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data) || !data.every(isProduct)) {
    throw new Error('The server returned invalid product data.')
  }
  if (new Set(data.map((product) => String(product.id))).size !== data.length) {
    throw new Error('The server returned duplicate product IDs.')
  }
  return data
}
