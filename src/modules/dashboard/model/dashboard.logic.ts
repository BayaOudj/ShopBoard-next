import type { Product } from '../../products/model/products.types'
import { CATEGORIES } from '../../products/model/products.collections'
const colors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]
export function catalogStats(products: readonly Product[]) {
  const total = products.reduce((sum, product) => sum + product.price, 0)
  return {
    count: products.length,
    total,
    average: products.length ? total / products.length : null,
    underFifty: products.filter((product) => product.price < 50).length,
    categories: CATEGORIES.map((name, index) => {
      const items = products.filter((product) => product.category === name)
      return {
        name,
        count: items.length,
        value: items.reduce((sum, item) => sum + item.price, 0),
        color: colors[index] ?? 'var(--color-chart-1)',
      }
    }),
  }
}
