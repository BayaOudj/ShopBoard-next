import { ThemeBoundary } from './components/ThemeBoundary'
import { Suspense, type ReactNode } from 'react'
import type { Metadata } from 'next'
import { ShopProvider } from '../modules/products/ShopProvider'
import { loadCatalog } from '../modules/products/server/catalog'
import { ShopLayout } from './components/ShopLayout'
import '../shared/styles/global.css'
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: {
    default: 'Shopboard — Your everyday, elevated',
    template: '%s | Shopboard',
  },
  description:
    'Thoughtful products, curated collections, and a little everyday joy. A local shopping demo.',
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p role="status">Loading workspace…</p>}>
          <ThemeBoundary>
            <ShopProvider catalog={loadCatalog()}>
              <Suspense fallback={<p role="status">Loading workspace…</p>}>
                <ShopLayout>{children}</ShopLayout>
              </Suspense>
            </ShopProvider>
          </ThemeBoundary>
        </Suspense>
      </body>
    </html>
  )
}
