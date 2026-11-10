import { loadCatalog } from '../../../../modules/products/server/catalog'
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params
  const result = await loadCatalog()
  if (result.status === 'error')
    return Response.json({ error: result.message }, { status: 500 })
  const product = file.endsWith('.json')
    ? result.products.find((item) => String(item.id) === file.slice(0, -5))
    : undefined
  return product
    ? Response.json(product)
    : Response.json({ error: 'Product not found' }, { status: 404 })
}
