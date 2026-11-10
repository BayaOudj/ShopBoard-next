import type { Product } from './products.types'
export type CatalogResult =
  | { status: 'success'; products: Product[] }
  | { status: 'error'; message: string }
