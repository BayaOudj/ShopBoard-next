import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderShop, products } from '../../../test/renderShop'
import { router } from '../../../test/navigation'
import ProductsPage from './ProductsPage'
import ProductPage from './ProductPage'
import CartPage from '../../cart/components/CartPage'
import CheckoutPage from '../../checkout/components/CheckoutPage'
import { RegistrationSection } from '../../registration/components/RegistrationSection'
import { OverviewMetrics } from '../../dashboard/components/OverviewMetrics'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
describe('Next shopping feature behavior', () => {
  it('combines filters and preserves sort/view when recovering from no matches', async () => {
    const user = userEvent.setup()
    await renderShop(<ProductsPage />)
    await screen.findByRole('article', { name: 'Everyday Tote' })
    await user.type(screen.getByRole('searchbox'), 'tote')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    await user.click(screen.getByLabelText('Names only'))
    await user.selectOptions(screen.getByLabelText('Sort by'), 'expensive')
    await user.click(
      within(
        screen.getByRole('group', { name: 'Filter products by category' }),
      ).getByRole('button', { name: 'Shoes' }),
    )
    expect(
      screen.getByRole('heading', { name: 'No products match these filters' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Collection controls' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getAllByRole('button', { name: 'Clear filters' })[0],
    )
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByLabelText('Names only')).toBeChecked()
    expect(screen.getByLabelText('Sort by')).toHaveValue('expensive')
    expect(
      within(screen.getByRole('list', { name: 'Product names' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(15)
  })
  it('uses the URL collection and clears it through Next navigation', async () => {
    const user = userEvent.setup()
    await renderShop(<ProductsPage collectionId="everyday" />)
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(products).toHaveLength(15)
    await user.click(
      screen.getAllByRole('button', { name: 'Clear filters' })[0],
    )
    expect(router.push).toHaveBeenCalledWith('/products')
  })
  it('shares colors and cart between feature views, with validated variants and quantities', async () => {
    const user = userEvent.setup()
    const product = products.find((item) => item.id === 1)
    if (!product) throw new Error('Missing fixture')
    await renderShop(
      <>
        <ProductPage product={product} />
        <CartPage />
      </>,
    )
    await user.click(
      screen.getByRole('radio', { name: 'Black for Leather Tote Bag' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Add Leather Tote Bag to cart' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Leather Tote Bag · Black' }),
    ).toBeInTheDocument()
    const quantity = screen.getByRole('spinbutton')
    fireEvent.change(quantity, { target: { value: '2' } })
    expect(quantity).toHaveValue(2)
    fireEvent.change(quantity, { target: { value: '0' } })
    expect(quantity).toHaveValue(2)
    await waitFor(() =>
      expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Black":2}'),
    )
    await user.click(
      screen.getByRole('button', { name: 'Remove Leather Tote Bag, Black' }),
    )
    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })
  it('migrates legacy storage once and announces the quantity limit', async () => {
    localStorage.setItem(
      'shopboard-cart-v1',
      '{"1":2,"1::Brown":97,"1::Purple":9}',
    )
    const user = userEvent.setup()
    await renderShop(<ProductsPage />)
    const card = await screen.findByRole('article', {
      name: 'Leather Tote Bag',
    })
    await user.click(
      within(card).getByRole('button', {
        name: 'Add Leather Tote Bag to cart',
      }),
    )
    expect(
      screen.getByText('Maximum quantity is 99 per product.'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Brown":99}'),
    )
  })
  it('validates checkout, focuses errors, completes locally, and retains the cart', async () => {
    localStorage.setItem('shopboard-cart-v1', '{"1::Brown":1}')
    const request = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', request)
    const user = userEvent.setup()
    await renderShop(<CheckoutPage />)
    const form = await screen.findByRole('form', { name: 'Checkout' })
    await user.click(
      within(form).getByRole('button', { name: 'Complete demo checkout' }),
    )
    expect(
      await screen.findByText('Enter your full name (at least 2 characters).'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    expect(screen.getByLabelText('Full name')).toHaveAttribute(
      'aria-describedby',
      'name-error',
    )
    for (const [label, value] of [
      ['Full name', 'Test Buyer'],
      ['Email', 'test@example.com'],
      ['Street address', '123 Sample Street'],
      ['City', 'Istanbul'],
      ['Postal code', '34000'],
      ['Country', 'Türkiye'],
    ])
      await user.type(screen.getByLabelText(label), value)
    await user.click(
      within(form).getByRole('button', { name: 'Complete demo checkout' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Demo checkout complete' }),
    ).toBeInTheDocument()
    expect(request).not.toHaveBeenCalled()
    expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Brown":1}')
  })
  it('keeps empty catalogs distinct from filtered results and preserves saved carts', async () => {
    localStorage.setItem('shopboard-cart-v1', '{"1::Brown":2}')
    await renderShop(<ProductsPage />, { status: 'success', products: [] })
    expect(
      await screen.findByRole('heading', { name: 'No products yet' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Brown":2}')
  })
  it('refreshes failed server data while leaving hero/community and saved carts usable', async () => {
    localStorage.setItem('shopboard-cart-v1', '{"1::Brown":2}')
    const user = userEvent.setup()
    await renderShop(
      <>
        <OverviewMetrics />
        <RegistrationSection sectionRef={null} />
      </>,
      { status: 'error', message: 'Catalog unavailable' },
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Catalog unavailable',
    )
    expect(
      screen.getByRole('form', { name: 'Join the ShopBoard community' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(router.refresh).toHaveBeenCalledOnce()
    expect(localStorage.getItem('shopboard-cart-v1')).toBe('{"1::Brown":2}')
  })
})
