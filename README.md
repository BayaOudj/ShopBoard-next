# ShopBoard Next

The ShopBoard shopping demo migrated to Next.js App Router, React, and strict
TypeScript. It preserves the React reference's catalog, design, routes, cart
format, local checkout, and community form.

## Setup

```sh
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. Node is pinned in `.nvmrc`. No environment variables
are needed for the normal demo. `npm ci` activates the tracked pre-commit hook;
it runs the full quality gate and must not be bypassed.

## Routes

| URL                                  | Content                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `/`                                  | Hero, catalog statistics, category chart, and product mix              |
| `/products`                          | Combined search/category/collection/price filters, sorting, names view |
| `/products?collection=slow-mornings` | Deep-linked collection                                                 |
| `/products/[id]`                     | Product details, synchronized color, add to cart                       |
| `/collections`                       | Three curated collections                                              |
| `/insights`                          | Accessible catalog table and detail links                              |
| `/community`                         | Validated local registration demo                                      |
| `/cart`                              | Per-color quantities, removal, subtotal                                |
| `/checkout`                          | Validated delivery form and local confirmation                         |
| Unknown URLs                         | Shared-shell 404; missing products use their own not-found UI          |

## Architecture and data

`src/app` contains Server Component route adapters, metadata, loading/error/not-found
boundaries and shell composition. Interactive feature code lives in
`src/modules`; reusable UI, transport and CSS live in `src/shared`.

The single canonical catalog is `public/api/products.json`. A server-only
repository validates it using the same domain parser as the HTTP feature API.
Server rendering never calls its own HTTP server. React `cache` deduplicates
repository reads per render. The immutable local fixture can be prerendered with
Next's existing Cache Components configuration; there is no external inventory
freshness promise or user data in a server cache.

`/api/products.json` rewrites before public-file handling to `/api/catalog`.
It returns that same validated catalog. `/api/products/[id].json` is a Route
Handler; missing IDs return HTTP 404 JSON. All 45 images retain their paths.
Images use Next Image with `unoptimized` to preserve exact local preview assets
without requiring an image transformation service.

One root client `ShopProvider` stays mounted across route changes. It receives a
server-created catalog-result promise without copying catalog props into state.
Only catalog consumers suspend; the shell, hero, collections and community remain
usable. An inner Suspense boundary lets persistence wait independently. Expected
catalog errors are serializable results with `router.refresh()` retry; unexpected
errors use Next's `error.tsx`/`global-error.tsx` and `retry()`.

The provider owns cart state, session colors, and toast feedback. Cart storage is
read in an effect after hydration. Each streamed consumer uses deterministic hydration readiness; writes wait
for restoration and a valid nonempty catalog. Catalog and registration controls
wait for hydration before enabling client-only actions. The feature persistence layer keeps
`shopboard-cart-v1`, `id::color`, legacy migration and quantities 1–99. Failed or
empty data never writes storage. Browser storage belongs to its origin, so a cart
is not automatically transferred between development ports or domains.

Filters, sort, view and form state stay local. Totals and filtered lists are
computed from domain functions. There is no React Router, Vite catalog resource,
parallel browser catalog store, or self-HTTP loader.

## UI and shadcn

CSS Modules and the original ShopBoard tokens preserve the visual design. Inter
is bundled locally, including its license, so builds need no Google Fonts access.
Tailwind v4 and shadcn Radix Nova remain initialized. `components.json` generates
new controls into `src/shared/ui`:

```sh
npx shadcn add dialog
```

The checkout retains the original adapted shadcn controls in
`src/shared/ui/shadcn`, including their MIT attribution. `ActionButton` is the
original shared visual control; lowercase `button` is the initialized shadcn
control. Different names avoid case-insensitive filesystem collisions.

## Verification

```sh
npm run check
npm run test:watch
npm run test:hooks
npm run build
npm run start -- --port 3190
# In another terminal, while that production server runs:
npm run test:http
npm run test:browser
npm run test:states
```

`check` runs Next type generation/TypeScript, zero-warning ESLint, Prettier,
Vitest/Testing Library, and the production build. The hook test uses a disposable
Git repository, never commits application files, and verifies all failure gates.

Browser checks launch their own temporary headless Chrome profile; they never
open the user's real profile. Override `CHROME_PATH` on other systems. The default
application URL is http://127.0.0.1:3190/; override with `APP_URL`. Checks cover
shopping, navigation/history, hydration, checkout, missing pages/images, and
375/768/1024/1440px layouts. Screenshots are written to the OS temporary directory.

`test:states` builds a separate `.next-test` artifact and starts isolated production
servers for a three-second delay, HTTP 500, and an empty catalog. Both
`SHOPBOARD_TEST_MODE=1` and `SHOPBOARD_CATALOG_MODE` are required. Normal production
must leave both unset. The test artifact is never the normal `.next` artifact.
See `.env.example` and [the audit](docs/AUDIT.md) for evidence and limitations.

## Deployment and demo limits

Use a Node-capable host supporting the installed Next.js version. Run `npm ci`,
`npm run build`, then `npm start`. Preserve Next route handling; a Vite SPA
fallback or static export does not support this server-rendered application.

The catalog is a static demo; stock is unverified. Community creates no account.
Checkout sends/saves no delivery information, takes no payment, places no order,
and retains the cart. No authentication, payment, shipping, tax or order backend
has been invented. Public `NEXT_PUBLIC_*` values contain no secrets.

The React and original reference folders are unchanged. Migration does not publish,
deploy or push the project. See [the migration plan](docs/MIGRATION.md).
