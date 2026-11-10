# ShopBoard Next migration audit

Date: 2026-11-09.

## GitHub publication check — 2026-11-10

Requested publication target: a new public `shopboard-next` GitHub repository.
The workspace initially had no commits or remote. The current check passed
type generation, strict TypeScript, zero-warning lint, formatting, and 58 tests
across 13 files. The production build failed because Turbopack's PostCSS worker
could not bind a local port (`Operation not permitted`); an elevated retry failed
with the same restriction. This run does not establish a passing full check.
The required commit hook remains enabled and has not been bypassed.
Publication has not been completed.

The user subsequently supplied
`https://github.com/BayaOudj/ShopBoard-next.js.git`. A remote read succeeded and
returned no refs; this URL is now configured as `origin`. A fresh elevated
`npm run check` again passed TypeScript, lint, formatting and all 58 tests, then
failed at the same Turbopack worker-port restriction. No commit or push was made.

## Scope and status

Push diagnosis repeated on 2026-11-10: `main` still has no commits, all project
files are staged, and `origin` is reachable and has no refs. The sandboxed check
passed TypeScript, lint, formatting and all 58 tests, then failed at Turbopack's
worker-port restriction. An elevated full-check retry passed the first three
gates but timed out after 5000ms in the shopping filter recovery test (57 tests
passed); that retry did not reach the build. No assertions, timeouts or hooks
were changed. No commit or push was made.

The subsequent explicitly requested initial commit was attempted with elevated
permissions. Its enabled pre-commit hook passed TypeScript, lint, formatting and
all 58 tests, but the production build again failed because Turbopack could not
bind its worker port (`Operation not permitted`). Git rejected the commit;
the push was not attempted. Project files remain staged, with this audit update
as an additional unstaged change.

All seven migration phases are implemented in `/Users/mac/shopboard-next`.
The React workspace and `/Users/mac/CodeHub/shopboard` were used as references
and their application source was not modified. Changes remain local; no commit,
remote push, publication, or deployment was performed.

| Phase                     | Result                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — Shell and routing     | Original CSS Modules, design tokens, branding, responsive navigation, header search, native notifications, skip link, footer, route titles, loading/error/not-found boundaries |
| 2 — Catalog boundary      | One validated JSON source, server-only repository, deduplicated server reads, serialized promise, compatible catalog/product APIs, isolated test modes                         |
| 3 — Browsing and details  | Combined filters, sorting, names-only view, URL collections, clear semantics, synchronized color previews, product routes and image fallback                                   |
| 4 — Cart                  | One persistent owner, separate variants, quantity limits, removal/totals, legacy migration, storage failure tolerance and hydration-safe persistence                           |
| 5 — Forms                 | Existing Zod/react-hook-form checkout and adapted shadcn controls; native community validation; explicit local confirmations                                                   |
| 6 — Overview and insights | $931 total, 15 products, three collections, eight under $50, accessible charts/data table and product links                                                                    |
| 7 — Parity/readiness      | Production route, responsive, browser-state, HTTP/asset and commit-hook checks; setup/deployment documentation; obsolete scaffold assets removed                               |

## Data and ownership

`public/api/products.json` is the canonical fixture. The server-only repository
and HTTP feature API share one runtime parser, including malformed data and
numeric/string ID collision checks. Server rendering never fetches its own API.
React `cache` deduplicates local repository reads within a render; immutable
normal-mode data can be prerendered by the existing Cache Components settings.
No user cart or delivery information is cached on the server.

The root ShopProvider owns cart state, session colors and toast feedback. It
receives a catalog-result promise without effect-synchronized catalog state.
Catalog-dependent consumers suspend independently of the shell and hero. A
nested persistence consumer waits for data without blocking navigation.

The cart reads storage after hydration and writes only after restoration and a
valid nonempty catalog. `shopboard-cart-v1`, `id::color`, legacy migration and
integer quantities 1–99 remain compatible. Failed/empty catalogs never erase
saved data. Storage is browser-origin-specific; data is not copied between ports.

## Defects found and corrected

- Streaming exposed a real hydration mismatch: an owner could restore storage
  before a delayed cart consumer hydrated. Each consumer now uses deterministic
  server/hydration readiness before showing restored quantities. Regression tests
  cover normal hydration and an already-restored owner with a late consumer.
- Catalog controls could accept an interaction before their event handlers were
  ready. Their enabled state now waits for hydration. The registration submit
  action and color controls are also guarded.
- The URL collection adapter originally keyed the filter component by collection,
  which could discard sort/view on clear. It now preserves that local state; the
  production browser check verifies the URL, sort, and names-only view together.
- Initial shadcn setup introduced an Arial body override. Removed it and bundled
  the original Inter font locally. ShopBoard's favicon replaces the Next icon.
- The isolated browser driver now sends native key codes and trusted mouse input,
  waits for enabled controls, and keeps the test renderer foregrounded. Background
  throttling after viewport changes had stalled streamed route rendering in the
  long browser sequence. Assertions/timeouts were not loosened to pass checks.

## Verification results

- `npm run check`: Next type generation/strict TypeScript, zero-warning ESLint,
  Prettier, all **52 tests across 11 files**, and production build pass.
- `npm run test:http`: exact canonical catalog, all 15 per-product responses,
  missing-product HTTP 404 JSON, and all 45 byte-identical image assets pass.
- `npm run test:hooks`: all five deliberately failed gates reject real commits;
  the all-pass case accepts one commit, entirely in a disposable repository.
  The application's tracked executable hook remains activated as `.githooks`.
- `npm run test:browser`: production shopping, selected color/cart navigation,
  browser back/forward, direct URLs, refresh persistence, invalid quantities,
  checkout errors/focus and local confirmation, native community constraints,
  notifications/Escape, and global slash-to-search pass.
- That browser run also verifies deep-linked collection clear preserves sorting
  and names-only view, zero-match controls disappear/recover, all eight strict
  under-$50 products remain, long text wraps, reduced motion disables animation,
  and missing images recover after another color is selected.
- No horizontal overflow at **375, 768, 1024 and 1440px** on overview, products,
  product details, collections, insights, community, cart and checkout.
- `npm run test:states`: separate production `.next-test` build and isolated
  servers pass the actual 3000ms delay, HTTP 500 with a new refresh request on
  retry, and empty catalog. Shell/hero/community remain usable and the seeded
  cart survives every mode.
- Normal and all state browser runs report **zero Console warnings and zero
  unexpected runtime/React/hydration errors**. No warning suppression was added.

Domain, HTTP decoding, cancellation propagation, validation, corrupt/unavailable
storage, StrictMode legacy migration and behavior tests were retained/adapted.
Removed Vite resource and React Router loader tests were replaced by appropriate
client feature tests and real Next production route/streaming checks.

Browser checks use automatically created disposable Chrome profiles, never a
real user profile or cart. State fixtures require both server environment flags,
use `.next-test`, and are excluded from normal production. No shared catalog
fixture was mutated for tests.

## Visual comparison

Compared actual reference and target overview/product screenshots at 375px and
1440px. Typography, spacing, panels, navigation, colors and product images align
with the React design. All eight routes additionally passed four-width overflow
checks; this is not a claim of pixel-diff coverage for every page.

Reference/target screenshots are separate OS temporary artifacts, including
`/tmp/shopboard-reference-overview-1440.png`,
`/tmp/shopboard-next-overview-1440.png`, and matching mobile/product captures.
Repeatable browser checks also capture checkout and long-product-name layouts in
the OS temporary directory. Generated output and test artifacts are ignored.

## Remaining product and deployment limits

- Static demo catalog; stock is unverified. No authentication, payments, real
  accounts, shipping/tax calculation or orders are connected.
- Checkout information and community passwords are never sent or stored. Demo
  checkout retains the cart. Browser-only validation is not a backend service.
- JSON API missing IDs return HTTP 404. Next `notFound()` handles missing product
  pages; a streamed HTML response may already have HTTP 200 headers, as in Next's
  streaming behavior, while showing the correct not-found UI.
- Hosting needs the installed Next version and Node runtime. No static export or
  Vite SPA fallback is configured. Deployment has not been performed.
- Dependency installation reported 13 audit findings (two low, eleven moderate).
  No automatic breaking dependency upgrades or security-audit pass is claimed.

Setup, environment flags, test commands and ownership details are in README.md.
AGENTS.md received only a formatting correction for a leading blank line; its
project instructions were preserved.
