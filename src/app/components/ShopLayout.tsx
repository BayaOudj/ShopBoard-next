'use client'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useShop } from '../../modules/products/hooks/useShop'
import { Header } from './Header'
import { Brand } from './Brand'
import { Footer } from './Footer'
import type { SectionId } from '../navigation'
const links = [
  ['/', 'Overview'],
  ['/products', 'Products'],
  ['/collections', 'Collections'],
  ['/insights', 'Catalog insights'],
  ['/community', 'Community'],
]
function CartButton() {
  const { cart } = useShop()
  const router = useRouter()
  return (
    <Button
      variant="unstyled"
      className="relative rounded-button border border-border bg-surface px-3 py-2 text-body whitespace-nowrap"
      id="open-cart"
      type="button"
      disabled={!cart.ready}
      onClick={() => router.push('/cart')}
    >
      Cart{' '}
      <Badge variant="counter" id="cart-count">
        {cart.count}
      </Badge>
    </Button>
  )
}
export function ShopLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const main = useRef<HTMLElement>(null)
  const router = useRouter()
  useEffect(() => {
    if (!window.location.hash) main.current?.focus({ preventScroll: true })
  }, [path])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (target instanceof HTMLElement &&
          (target.matches('input,textarea,select') ||
            target.isContentEditable ||
            Boolean(target.closest('dialog[open]'))))
      )
        return
      event.preventDefault()
      router.push('/products#search-products')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
      <a
        className="fixed -top-25 left-3.75 z-30 bg-control-solid p-3 focus:top-3"
        href="#main"
      >
        Skip to content
      </a>
      <aside className="min-w-0 border-b border-border bg-sidebar p-5 backdrop-blur-[18px] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-4.5 lg:pt-8 lg:pb-5 xl:px-6 xl:pt-8.75">
        <Brand />
        <p className="hidden text-micro tracking-[1.7px] text-faint lg:mx-3 lg:mt-11.25 lg:mb-3.75 lg:block">
          YOUR WORKSPACE
        </p>
        <nav
          className="flex gap-1.25 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-3.75 pb-1.25 [&_a]:flex [&_a]:items-center [&_a]:gap-2.5 [&_a]:rounded-button [&_a]:px-3.25 [&_a]:py-2.5 [&_a]:text-body [&_a]:whitespace-nowrap [&_a]:text-subtle [&_a]:transition-colors [&_a]:duration-250 [&_a:hover]:bg-nav-hover [&_a[aria-current]]:bg-(image:--background-image-nav-active) [&_a[aria-current]]:text-nav-ink [&_a[aria-current]]:shadow-inset-light motion-reduce:[&_a]:transition-none lg:grid lg:gap-1.75 lg:overflow-visible lg:p-0 lg:[&_a]:p-3"
          aria-label="Main navigation"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === '/' ? path === href : path.startsWith(href))
                  ? 'page'
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <Header
          activeSection={sectionForPath(path)}
          pageTitle={
            path === '/cart'
              ? 'Cart'
              : path === '/checkout'
                ? 'Checkout'
                : undefined
          }
          cartButton={
            <Suspense
              fallback={
                <Button
                  variant="unstyled"
                  className="relative rounded-button border border-border bg-surface px-3 py-2 text-body whitespace-nowrap"
                  type="button"
                  disabled
                  aria-label="Cart loading"
                >
                  Cart …
                </Button>
              }
            >
              <CartButton />
            </Suspense>
          }
        />
        <main
          ref={main}
          id="main"
          className="mx-auto max-w-[1450px] px-4.5 focus:outline-none sm:px-7 lg:px-9.5"
          tabIndex={-1}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
function sectionForPath(path: string): SectionId {
  if (path.startsWith('/products')) return 'products'
  if (path === '/collections') return 'collections'
  if (path === '/insights') return 'catalog-insights'
  if (path === '/community') return 'register'
  return 'hero'
}
