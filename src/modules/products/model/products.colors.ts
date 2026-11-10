import type { Product } from './products.types'
// Sample color options for the demo catalog, pending supplier inventory.
const productColors: Record<string, [string, ...string[]]> = {
  1: ['Brown', 'Black', 'Tan'],
  2: ['Sage', 'Sand', 'Black'],
  3: ['Terracotta', 'Black', 'Cream'],
  4: ['White', 'Cream', 'Black'],
  5: ['Red', 'Black', 'Blue'],
  6: ['Tan', 'Brown', 'Black'],
  7: ['Oat', 'Rose', 'Charcoal'],
  8: ['Silver', 'Gold', 'Black'],
  9: ['Black', 'Tortoiseshell', 'Brown'],
  10: ['Brown', 'Olive', 'Black'],
  11: ['Olive', 'Black', 'Navy'],
  12: ['Brown', 'Black', 'Tan'],
  'featured-0': ['Sage', 'Natural', 'Black'],
  'featured-1': ['Oat', 'White', 'Sage'],
  'featured-2': ['Terracotta', 'Sage', 'Cream'],
}

export function getColors(product: Pick<Product, 'id'>): [string, ...string[]] {
  return Object.hasOwn(productColors, product.id)
    ? productColors[product.id]
    : ['Natural']
}

export function variantKey(product: Pick<Product, 'id'>, color: string) {
  return `${product.id}::${color}`
}

export const colorSwatches: Record<string, string> = {
  Brown: 'var(--color-swatch-brown)',
  Black: 'var(--color-swatch-black)',
  Tan: 'var(--color-swatch-tan)',
  Sage: 'var(--color-swatch-sage)',
  Sand: 'var(--color-swatch-sand)',
  Terracotta: 'var(--color-swatch-terracotta)',
  Cream: 'var(--color-swatch-cream)',
  White: 'var(--color-swatch-white)',
  Red: 'var(--color-swatch-red)',
  Blue: 'var(--color-swatch-blue)',
  Oat: 'var(--color-swatch-oat)',
  Rose: 'var(--color-swatch-rose)',
  Charcoal: 'var(--color-swatch-charcoal)',
  Olive: 'var(--color-swatch-olive)',
  Navy: 'var(--color-swatch-navy)',
  Natural: 'var(--color-swatch-natural)',
  Silver: 'var(--background-image-swatch-silver)',
  Gold: 'var(--background-image-swatch-gold)',
  Tortoiseshell: 'var(--background-image-swatch-tortoiseshell)',
}
