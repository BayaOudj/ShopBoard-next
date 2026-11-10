import { loadCatalog } from '../../../modules/products/server/catalog'
export async function GET() {
  const result = await loadCatalog()
  return result.status === 'success'
    ? Response.json(result.products)
    : Response.json({ error: result.message }, { status: 500 })
}
