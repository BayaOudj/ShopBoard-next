import { readFile, readdir } from 'node:fs/promises'
const app = process.env.APP_URL ?? 'http://127.0.0.1:3190/'
const fixture = JSON.parse(
  await readFile(
    new URL('../public/api/products.json', import.meta.url),
    'utf8',
  ),
)
const response = await fetch(new URL('/api/products.json', app))
if (
  !response.ok ||
  !response.headers.get('content-type')?.includes('application/json')
)
  throw Error('Catalog HTTP contract failed')
const products = await response.json()
if (JSON.stringify(products) !== JSON.stringify(fixture))
  throw Error('HTTP catalog differs from fixture')
for (const product of products) {
  const single = await fetch(
    new URL(`/api/products/${encodeURIComponent(product.id)}.json`, app),
  )
  if (
    !single.ok ||
    JSON.stringify(await single.json()) !== JSON.stringify(product)
  )
    throw Error(`Product contract failed: ${product.id}`)
}
const missing = await fetch(new URL('/api/products/missing.json', app))
if (missing.status !== 404 || !(await missing.json()).error)
  throw Error('Missing product must return 404 JSON')
const imageDir = new URL('../public/images/products/', import.meta.url)
const names = await readdir(imageDir)
if (names.length !== 45)
  throw Error(`Expected 45 images, found ${names.length}`)
for (const name of names) {
  const image = await fetch(new URL(`/images/products/${name}`, app))
  const actual = Buffer.from(await image.arrayBuffer())
  const expected = await readFile(new URL(name, imageDir))
  if (!image.ok || !actual.equals(expected))
    throw Error(`Asset differs: ${name}`)
}
console.log(
  'PASS canonical catalog, all 15 single-product endpoints, JSON 404, and all 45 exact image assets',
)
