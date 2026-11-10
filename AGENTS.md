# ShopBoard Next project rules

## Scope and authority

- This is the Next.js migration workspace for ShopBoard. User instructions take precedence.
- Reference: `/Users/mac/shopboard-react`, baseline commit `e7fc8c8421502f71fd9ce18146754fc718e5a22e`. Keep it and `/Users/mac/CodeHub/shopboard` unchanged.
- Read `docs/MIGRATION.md`, `docs/AUDIT.md`, package.json, configuration, and relevant source before editing. Preserve unrelated work.
- Current authorization covers initialization, rules, and planning. Implement migration phases only when requested. Do not redesign, invent services, publish, or push without authorization.
- Complete authorized work and useful checks autonomously. Ask only when missing information materially changes scope, behavior, or external access.

## Stack and checks

- Use Next.js App Router, React, strict TypeScript, npm, and one package-lock.json. Use the supported Node LTS version pinned in `.nvmrc`.
- Preserve generated Next/TypeScript configuration; make small, justified changes. Consult documentation bundled in the installed Next package before relying on remembered APIs.
- Keep the generated ESLint Next configuration and React hook rules. Treat warnings as failures; retain exhaustive-deps. Do not add a second linter or silence errors to pass checks.
- Use Tailwind utilities exclusively for component styling. The only authored CSS file is src/shared/styles/global.css. Global reset, typography, and tokens belong in `src/shared/styles/`. Preserve ShopBoard's existing visual design.
- `npm run check` must run type generation/typecheck, lint, formatting, Vitest, and the production build. `npm test` runs once; `test:watch` is interactive. `preview` starts a production build using Next's server.
- Keep the tracked pre-commit hook enabled through `npm run prepare`. Never bypass or weaken checks. Add a disposable-repository hook rejection test during migration tooling parity.

## Architecture

- `src/app/` owns route files, layouts, metadata, loading/error/not-found boundaries, and composition. Keep business logic out of route adapters.
- Organize features in `src/modules/<feature>/`, with components, hooks, model, api, or server folders only as needed. Keep tests beside code.
- `src/shared/` holds genuinely reusable infrastructure and UI. Dependencies flow app → modules → shared. Shared code must not import features or app.
- Use Server Components by default. Put `'use client'` only at interactive boundaries needing state, events, context, or browser APIs. Client Components also prerender: never read browser globals during render.
- Use file-based App Router routes and `next/link`/`next/navigation`; do not carry over React Router, its loaders, or manual React.lazy page imports.
- Route params and searchParams may be asynchronous in the installed Next version: use its types and await them where required. Pass only serializable data across the server/client boundary.
- Keep server repositories/configuration server-only (`import 'server-only'`). No secrets, filesystem access, or server repository imports in client modules.
- Preserve generated cache options until evidence justifies changing them. Make caching and freshness explicit. Never cache user-specific cart/form data or mutable global state across requests.

## Data and state

- One validated canonical catalog source. Server pages/repositories read it directly; do not fetch the application's own route handlers during server rendering/builds.
- HTTP calls, if needed, go through `src/shared/api/client.ts`; validate unknown responses at feature API boundaries, handle status/empty responses and AbortSignal, and keep URLs centralized.
- Browser data comes from serialized server props. Do not copy server props into effect-synchronized catalog state or retain the Vite external-store resource in parallel.
- One persistent client ShopProvider owns cart and selected colors across route navigation. Public useShop/useCart interfaces coordinate products/cart. Document how catalog data reaches the owner without blocking the shell.
- Keep filters/view state local. Derive lists, counts, prices, cart lines, and dashboard metrics using pure domain functions. No speculative memoization or global state dependency.
- Keep cart persistence in its owning feature. Preserve `shopboard-cart-v1`, `id::color`, legacy migration, and integer quantities 1–99. Restore before persisting; tolerate corrupt data/storage failures. Failed or empty catalog loads must never erase saved carts. Prevent hydration mismatch and duplicate StrictMode migration.
- Browser storage is origin-specific: compatible schemas do not automatically transfer data between ports or domains.
- Checkout uses one Zod schema with react-hook-form's Zod resolver and the shared typed UI controls in src/components/ui. Never persist personal checkout data or passwords. Registration and checkout remain explicitly local demos.
- Do not invent authentication, payments, orders, stock, tax, or shipping services. Public NEXT_PUBLIC_* variables contain no secrets; document configuration in `.env.example`.

## UX, resilience, accessibility

- Preserve all current routes and behavior listed in the migration plan, including intentional hiding of the collection controls when there are zero matches.
- Use loading.tsx/Suspense for pending work and error.tsx for uncaught segment failures, with useful retry using the installed Next version's API. Keep shell/hero usable while catalog-dependent content loads.
- Use notFound() for missing products and not-found.tsx for unknown pages; distinguish these from HTTP failures, empty catalog, zero matches, and empty cart.
- Handle event/mutation errors explicitly, preserve input/valid data, prevent duplicate submissions, and provide pending/success/error feedback.
- Use JSX, semantic elements, accessible labels, visible focus, keyboard navigation, live feedback, associated field errors, and first-invalid-field focus. Refs are for imperative browser APIs, not DOM rendering.
- Use stable domain keys. Effects synchronize external systems and must include dependencies and cleanup. No side effects during rendering or mount-triggered non-idempotent mutations.
- Preserve responsive layouts, touch targets, long-text and missing-image behavior, contrast, and reduced-motion support. Maintain useful metadata and page titles.

## Verification and reporting

- Use Vitest/Testing Library for pure logic and synchronous interactive components; use real browser checks for async Server Components, streaming, hydration, routing, and layout.
- Test meaningful outcomes: filters, cart migration/storage, checkout validation, API decoding, retry, loading, empty/error states, and stale/cancelled responses where relevant. Never relax assertions to get green checks.
- Shopping changes require routed production browser checks: direct URLs, refresh, back/forward, shared state, checkout, 404/product-not-found, image failures, and 375/768/1024/1440px layouts.
- Preserve isolated delay/500/empty exercises and saved-cart safety through a Next-appropriate test mechanism. Gate fixtures from normal production; never use real user browser profiles.
- Run `npm run check` before completion and investigate runtime/React/hydration warnings. Record actual evidence and unavailable checks in `docs/AUDIT.md`; distinguish planned from implemented behavior.
- Keep generated output, browser artifacts, profiles, secrets, and `.env.local` ignored. Document setup, deployment requirements, and material limitations. Do not claim pushes or integrations that were not performed.

## UI rules

- Shared primitives live in src/components/ui: Button, Input, Card, Badge, Modal and Label. Reuse their typed variants; do not copy controls into features. Primitives may import shared infrastructure, never features or app code.
- Colors, radii, fonts, gradients and motion tokens belong in the global @theme. Use semantic utilities so light and dark modes remain consistent.
- Preserve the ShopBoard layout and breakpoints, touch targets, keyboard focus, reduced motion and native dialog focus/Escape behavior.
- The appearance feature owns a validated public theme cookie; the server-rendered theme and browser hydration must agree.
- Only data-driven chart proportions and product swatches may use inline styles; their colors still reference theme tokens.

- Import cn from src/shared/lib/utils, including in generated UI components. Its configured theme scales preserve semantic font sizes and radius overrides.
