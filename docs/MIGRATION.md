# ShopBoard: React/Vite to Next.js migration plan

## Scope and baseline

Source: `/Users/mac/shopboard-react`, commit `e7fc8c8421502f71fd9ce18146754fc718e5a22e`.
Target: `/Users/mac/shopboard-next`. Original reference `/Users/mac/CodeHub/shopboard` stays unchanged.

All seven migration phases have been implemented. This plan records the scope and acceptance gates used for the migration. Preserve the current product, URLs, accessibility, and styling; no redesign or new backend is included. The source's README, routes, tests, cart persistence, filters, checkout schema, and audit are the current specification. Its older single-page migration history does not override the routed app.

## Route mapping

| Current URL                 | Next App Router destination      | Required behavior                                                          |
| --------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| `/`                         | `src/app/page.tsx`               | Overview, hero and suspended catalog metrics                               |
| `/products`                 | `src/app/products/page.tsx`      | Combined search/category/collection/price filters, sorting and view toggle |
| `/products?collection=<id>` | Same route, parsed searchParams  | Deep-linked collection membership and reset behavior                       |
| `/products/:id`             | `src/app/products/[id]/page.tsx` | Encoded stable ID, variant controls; notFound() for missing product        |
| `/collections`              | `src/app/collections/page.tsx`   | Same three collections and links                                           |
| `/insights`                 | `src/app/insights/page.tsx`      | Same charts, accessible data and product table                             |
| `/community`                | `src/app/community/page.tsx`     | Validated local registration demo                                          |
| `/cart`                     | `src/app/cart/page.tsx`          | Shared variants, quantities, removal, subtotal and checkout link           |
| `/checkout`                 | `src/app/checkout/page.tsx`      | Validated delivery form and explicit local confirmation                    |
| Unknown URL                 | `src/app/not-found.tsx`          | 404 retaining normal shell                                                 |

Shared layout belongs in `src/app/layout.tsx`; add segment loading/error boundaries where data suspends. Root layout failures need a separate global-error boundary if introduced. Next handles page code splitting; React Router and manual lazy page imports are removed.

## Target ownership and data decisions

- Default to Server Components for route adapters and noninteractive display. Client islands own filters, purchases, navigation interactions, cart persistence and forms.
- Port pure product/cart/dashboard models with minimal changes. Keep one canonical catalog fixture and the same 45 product color images. Validate source data in a server-only repository, not during arbitrary client renders.
- Server pages call that repository directly. Do not depend on an already running Next server during builds or call localhost API routes from Server Components.
- Preserve the public HTTP contracts `/api/products.json` and `/api/products/:id.json` using a canonical static catalog plus Next route handlers for single products, or a documented generated-static approach. Choose and verify one implementation in phase 2. Missing IDs return HTTP 404 JSON, never an HTML fallback.
- One client ShopProvider stays mounted under the shared layout and owns cart/colors. Feed catalog through serialized server data, with an inner Suspense boundary around catalog-dependent provider consumers so shell/hero remain usable. Prototype this boundary before moving cart logic; confirm provider identity survives navigation. Do not create request-shared mutable cart state or duplicate client catalog caches.
- Replace the Vite loader/resource/useSyncExternalStore mechanism with Next server data flow. Retain pure parsing/filtering logic and explicit user-triggered retries. Specify cache behavior with the generated cacheComponents configuration; no implicit perpetual cache for external data.
- Await Next params/searchParams as required. Only missing products use notFound(); malformed data/network errors reach retryable boundaries. Keep native URL history and direct-link behavior. The installed Next 16.4.5 error boundary exposes `retry()` for refetch-and-render recovery; use that rather than relying on older `reset()` examples.
- Keep feature-owned cart storage and hydration gating. SSR starts with a deterministic unready cart, restores in the browser, and only then persists validated data. Empty/failed catalog must not overwrite saved storage.
- Keep react-hook-form, Zod resolver, and local shadcn/ui checkout controls when that phase begins. No personal form data in storage or Server Actions implying a real order service.

## Parity requirements

1. Preserve all 15 product IDs (including string IDs), names, prices, descriptions, categories, images/colors and collection memberships. Whole-dollar USD remains unchanged.
2. Search matches names/categories case-insensitively. Combine category, collection, search and strict price < $50. Sorting must not mutate the original catalog order.
3. Clear filters resets query/category/collection/price while preserving sorting and names-only selection. Selecting a collection resets query/category/price; selecting it again deselects it.
4. Intentionally hide the entire collection-controls bar (Names only, Under $50, Sort by) when no products match; show feedback and Clear filters. Restore the controls and previous view/sort after recovery. Names-only links still open product details.
5. Preserve selected colors between cards/details/routes. One cart uses per-color lines, quantity limits 1–99, removal, count, subtotal, and refresh persistence.
6. Keep storage key `shopboard-cart-v1`, `id::color` encoding, legacy keys, malformed-data tolerance, unavailable storage fallback and StrictMode safety. Migration between origins is not automatic.
7. Preserve checkout associated errors, first-invalid focus, duplicate-submit prevention, completion focus, retained cart and explicit demo messaging. Community creates no real account.
8. Distinguish loading, transport error, invalid data, empty catalog, zero matches, empty cart, unknown product and unknown URL. Preserve useful retry without losing valid data.
9. Preserve header search/keyboard shortcut, notifications demo, sidebar/nav, footer, skip link, live toast, responsive behavior and missing-image fallback.
10. Keep shell/hero usable during delayed or failed metrics. Validate direct routes, refresh and history with no hydration or console warnings.

## Phases and acceptance gates

### Phase 0 — Initialization (completed)

- Scaffold Next App Router, TypeScript, npm, CSS Modules and the generated Next ESLint setup.
- Add rules, this plan, setup/audit docs, Node pin, formatting, Vitest/Testing Library and a single check command.
- Initialize a separate local Git repository and a tracked pre-commit check. Do not configure the source remote or push this new project.
- Acceptance: clearly labeled preparation screen; typecheck/lint/format/tests/build pass; production home/unknown route smoke check. This is not shopping parity.

### Phase 1 — Shell and routing

- Port design tokens, CSS Modules, responsive shell, metadata, links and keyboard navigation.
- Add all route adapters, loading/error/not-found boundaries and global error handling as needed.
- Acceptance: every mapped route/direct link and back/forward works; shared shell stays mounted; narrow layout and keyboard navigation pass. Unmigrated screens are explicitly labeled placeholders.

### Phase 2 — Catalog and server/client boundary

- Port canonical catalog/assets, runtime validation and pure product logic. Implement public API parity without a Vite plugin.
- Implement server repository and prototype provider/Suspense ownership. Port loading/empty/error feedback and recoverable retry.
- Add isolated delay/500/empty configuration via a server-only test mode; disable it in normal production and document testing in a dedicated build/server. Never mutate a shared fixture or saved carts.
- Acceptance: catalog and per-ID HTTP contracts, malformed/duplicate IDs, 404 semantics, 3-second delay, HTTP 500 retry, empty catalog, and responsive shell isolation all pass. Server rendering works without self-HTTP.

### Phase 3 — Catalog browsing and product details

- Port collection links, filters, search, sort, summaries, product cards, names-only view, colors, detail page and image fallbacks.
- Acceptance: combined filter/reset behavior, exact $50 exclusion, intentional bar disappearance/reappearance, URL collection selection, same IDs and prices, detail links, missing product and long text pass.

### Phase 4 — Shared cart and persistence

- Port cart reducer, storage decoder, legacy migration, Context actions, toast and cart page into the single persistent provider.
- Acceptance: variants and colors survive route changes; quantities, removal and totals are correct; refresh restores; storage failure/corruption/legacy data and StrictMode tests pass. Failed/empty catalog and test modes preserve seeded storage. No hydration mismatch or initial overwrite.

### Phase 5 — Checkout and community

- Port the Zod checkout schema, react-hook-form resolver, local shadcn/ui controls/license and local registration demo.
- Acceptance: invalid fields have associated errors and focus, successful local completion is announced/focused, no duplicate submission, no personal data storage/request, empty cart feedback and cart preservation pass.

### Phase 6 — Overview and insights

- Port pure dashboard statistics, hero, metrics, charts, accessible chart data and linked product table.
- Acceptance: source fixture totals match ($931, 15 products, three collections, eight under-$50 products); empty charts remain valid; delayed metrics do not block shell/hero.

### Phase 7 — Full parity and deployment readiness

- Port/update behavior tests rather than retaining React Router-specific plumbing. Use browser tests for async Server Components/streaming and hydration.
- Run production shopping flows, all direct URLs, refresh/history, checkout, not-found handling, delay/500/empty with cart safety, missing assets, reduced motion and 375/768/1024/1440px layouts.
- Prove commit-gate failure behavior in a disposable repository. Keep zero-warning lint and console/hydration checks.
- Remove obsolete Vite files, React Router dependency, old external-store loader and replaced tests; retain migration history and tests for replacement behavior.
- Document Node-capable Next hosting, build/start commands, environment variables and cache behavior. Do not reuse Vite's blanket SPA index.html fallback. Static export would require a separately reviewed deployment plan.
- Acceptance: npm run check plus production browser/state/hook checks pass; visual comparison matches the source; audit records real evidence and remaining demo limits. Publishing/pushing requires user authorization.

## Risks and rollback

Server/client boundaries, hydration-safe persistence, streaming under caching options, and HTTP route parity are the main migration risks. Resolve them in phases 2 and 4 before broad UI porting. Avoid blanket `'use client'` on the root or a second catalog owner to hide boundary problems. Keep changes phase-sized and independently verifiable. The unchanged React repository remains the working reference and rollback option.

## Documentation references

Check the installed package's bundled documentation before implementation; the project is pinned by package-lock.json.

- [Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Error handling](https://nextjs.org/docs/app/getting-started/error-handling)

## Status

Phases 0–7 are complete. The application now uses native App Router routes,
server-only validated catalog access, a persistent client shop owner, compatible
cart storage, local demo forms, and the original design and assets.

Implementation decisions:

- One canonical JSON fixture remains in `public/api/products.json`; a before-files
  rewrite serves its validated representation from `/api/catalog`. Per-product
  Route Handlers preserve JSON 404 responses.
- The root provider receives a server-created catalog-result promise. Only
  dependent consumers suspend; the shell and hero remain usable. Expected
  catalog errors offer a server refresh, while unexpected failures use Next's
  installed `retry()` boundary API.
- Each streamed cart consumer hydrates with a deterministic unready snapshot,
  even if storage has already restored in its persistent owner. Interactive
  catalog and registration controls wait for their own hydration.
- Isolated production state tests build into `.next-test`; normal production
  continues to use `.next`. Both test environment flags are required to activate
  fixtures. No query parameter or browser request can enable them.
- The original Inter font is bundled locally. The existing adapted shadcn
  checkout controls and license remain intact alongside the initialized CLI.
- React Router, Vite middleware, browser catalog resources, and initialization
  screen/tests were replaced with Next routes and appropriate regression checks.

See [AUDIT.md](AUDIT.md) for actual check results, the streamed-hydration defect
found and fixed during verification, browser coverage, and remaining demo limits.
No backend, deployment, commit, or remote push was performed.
