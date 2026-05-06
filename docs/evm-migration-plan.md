# EVM Next Migration Plan

This plan covers the first migration slice only: `apps/evm` and the shared feature code it needs.
It does not remove `apps/evm` or `packages/orpc` up front. The current app stays intact while the new app is built beside it and validated.

## Goals

- Keep the implementation aligned with the repo's app-runtime patterns.
- Support SSR first, then RSC, then client interactivity, then Server Actions.
- Use TanStack Query only for client-side cache and hydration workflows.
- Remove ORPC usage from the migrated EVM flow.
- Keep the new app on the latest stable Next.js release and refresh it when the repo shows a version staleness notice.
- Keep backend API boundaries responsible for snake_case conversion.
- Standardize names for files, functions, variables, and components as part of the move.
- Keep `data-sim` as an app-local module inside `apps/evm-next`, not part of the shared package.

## Working Names

- Shared feature package working name: `packages/portal`
- New migrated app working name: `apps/evm-next`
- Legacy code archive folder: `migrations/evm`

These names are working names, not a commitment to a final public package name.

## Non-Negotiable Rules

- No framework-agnostic abstraction layer.
- No shared helper that hides Next.js behavior such as `revalidateTag`, cache invalidation, cookies, or headers.
- No raw `fetch` in feature code.
- No ORPC usage in the new EVM path.
- No async client components.
- No `use client` in files that are meant to remain server-side.
- No snake_case outside backend API boundary adapters.
- No generated source artifacts committed under `src`.

## Architecture

### Shared package

`packages/portal` is the shared feature package for the EVM flows and any future app that uses the same app-runtime conventions in this repository.
It may be imported by `apps/*`, but it must stay aligned to the runtime conventions used here: server-rendered routes, server actions, client components, and suspense-driven data loading.

### App layer

`apps/evm-next` owns:

- Route structure
- module-scoped enterprise bootstrap in `app/[module]/layout.tsx`
- Server Actions
- cache invalidation
- app-specific `headers()` / `cookies()` access
- client-only behavior that depends on the browser

### API layer

`packages/api` owns:

- request transport
- backend endpoint wrappers
- response normalization
- browser-safe client transport when needed

`packages/api` is the place to expose the HTTP client util that shared feature code uses.

Authenticated server calls must be wired at the app boundary. In `apps/evm-next`,
`createServerApi()` reads Next `headers()` and `cookies()` and passes plain HTTP
headers into `packages/api`, including `Authorization: Bearer <accessToken>`
when the `accessToken` cookie is present. Do not read Next cookies inside
`packages/api`; keep endpoint helpers framework-safe and pass any one-off token,
such as the verified EVM initialization token, through route input/options before
the session cookie exists.

## Data Flow Standard

### Reads

1. Server Component fetches data first when the page needs it for initial render.
2. The Server Component passes serializable data to a Client Component only when interaction is needed.
3. If a client surface needs the same data, it uses `useSuspenseQuery` with hydration from the server.
4. Query functions call the shared HTTP client util from `packages/api`, not `fetch`.

### Mutations

1. Client component triggers a Server Action.
2. Server Action calls `packages/api`.
3. App layer owns cache invalidation.
4. Shared package does not import Next cache utilities.
5. Shared client components must treat app-provided Server Actions as
   capabilities, not reactive state. Effects that call Server Actions must be
   driven by semantic request keys, must dedupe repeated keys, and must call the
   latest action through a stable ref or explicit event handler. Do not depend
   on action object identity, because RSC runtimes can recreate action proxies
   after a response.

### Client-only API calls

Some APIs may need a browser-origin call or a distinct base URL, such as public IP lookup or browser-dependent request forwarding.
Those calls must use a dedicated client adapter in the app layer or a browser-safe helper from `packages/api`.
Do not bury this behind a generic framework-agnostic wrapper.

## Package Shape

Suggested `packages/portal` layout:

```txt
src/
  server/
  actions/
  client/
  queries/
  modules/
  components/
  lib/
  types/
```

Suggested exports:

```json
{
  "./server/*": "./src/server/*.ts",
  "./actions/*": "./src/actions/*.ts",
  "./client/*": "./src/client/*.ts",
  "./queries/*": "./src/queries/*.ts",
  "./modules/*": "./src/modules/*/index.ts"
}
```

`./modules/*` is allowed because the module folders are the intended integration surface for pages.

## Naming Rules

- File names use kebab-case.
- Component names use PascalCase.
- Functions and variables use camelCase.
- Keep names aligned with the domain and feature they represent.
- Rename any requirement, feature, function, variable, or component that does not match the domain language.
- Do not keep legacy names if they make the architecture unclear.
- TypeScript path aliases must not duplicate the same workspace package with both a bare alias and a wildcard alias. Use one package-root pattern such as `@workspace/api*` -> `../../packages/api/src*` when both `@workspace/api` and `@workspace/api/*` imports need to resolve.

Examples:

- `price_change_alert_dialog.tsx` becomes `price-change-alert-dialog.tsx`
- `SubmitApplication` becomes `submitApplication`
- `VisaDocuments` becomes `visaDocuments`
- `GetUserProfileDetailsInput` should be renamed only if the new module domain needs a different name
- `apps/evm` and `apps/qr-visa` route trees should collapse into `app/[module]` in the migrated app unless a module truly needs a unique bootstrap path

## Backend Boundary Rules

- Convert snake_case only at the backend API boundary.
- Keep frontend and package-level APIs in camelCase.
- Keep backend payload adapters in `packages/api`.
- Do not leak backend field names into app-facing code.

## Migration Phases

### Phase 1: Freeze The Current EVM Surface

- Stop expanding ORPC usage in `apps/evm`.
- Stop adding new shared feature code to `packages/common-ui` for EVM.
- Keep `apps/evm` working as-is while the new app is built.

### Phase 2: Create The New App With A Dynamic Module Route Tree

- Add `apps/evm-next`.
- Use a single dynamic module segment under `app/[module]/`, then mount static child route directories such as `initialize`, `apply-visa`, `review`, `payment-summary`, `payment-success`, `application-details`, and `track-applications`.
- Make `initialize` the bootstrap entrypoint for each supported module, with a client runner that shows the shared loading state while the session action executes.
- `evm` and `qr-visa` can share the same flow methods and data handling, while only the initialization and route bootstrapping differ.
- Fetch enterprise host details in `app/[module]/layout.tsx` as SSR-only data through `packages/api`.
- Apply enterprise theme variables from the server layout before rendering module children.
- For `evm`, derive enterprise domain as `{host}-{domain}` where `host` comes from the initialize URL or existing session cookie.
- For `qr-visa`, pass the request domain directly to the enterprise host lookup.
- Wrap the module scope with app-local providers for enterprise context and TanStack Query before migrating feature components.
- Keep module-specific initialization inside the `initialize` entrypoint and its loader, not a catch-all slug route.
- Copy only the app shell patterns needed for the migrated flow.
- Keep the old `apps/evm` app untouched.
- Use this app as the test bed for the new architecture.

### Phase 3: Create The Shared Feature Package

- Add `packages/portal`.
- Move reusable EVM feature code out of `packages/common-ui`.
- Do not move `data-sim` into this package unless a sub-flow is proven reusable across apps.
- Split the code into server, action, client, query, and module folders.
- Keep this package aligned to the app-runtime conventions used by the repo, not a framework-neutral abstraction.
- Consume enterprise data from the app-provided context or server props; do not refetch enterprise theme data inside feature components.
- Keep feature query functions backed by `packages/api`, with TanStack Query used only for client cache and hydration.

### Phase 4: Build The API Adapter Surface

- Move ORPC-backed logic into `packages/api` route helpers or adapters.
- Add browser-safe client transport where client-side calls are required.
- Keep transport code and endpoint normalization centralized.
- Do not add framework-neutral abstractions.

### Phase 5: Migrate One EVM Flow At A Time

This phase is incremental by design, the same way we are handling `packages/common-ui` extraction:
move one dynamic module slice at a time, keep the current app working, and only widen the migrated surface after each slice is stable.

Current target:

- Migrate the first legacy `apps/evm/src/app/evm/new-visa/page.tsx` surface into `apps/evm-next/src/app/[module]/apply-visa/page.tsx`.
- Treat this as the first successful `apply-visa` page in the new app, with reusable feature code landing in `packages/portal`.
- Use `packages/ui` for shared UI primitives inside `packages/portal`; do not continue expanding EVM feature UI in `packages/common-ui`.
- Keep the legacy `apps/evm` `new-visa` route working while this new route is built and verified beside it.

Strict slice guardrails:

- Do not break the existing UI contract, flow behavior, route intent, or feature availability while migrating.
- Migrated feature UI must preserve the legacy `packages/common-ui/src/modules/new-visa` behavior and visual affordances unless a deliberate product change is documented first, including country flags, searchable selection controls, modal sizing, upload document interactions, card animations, notices, and mobile column behavior.
- Preserve legacy column interior spacing such as the `max-w-sm mx-auto` field container pattern from `max-width-container.tsx`; do not let controls stretch edge-to-edge inside each column unless the legacy UI did.
- Preserve the browser-side IP defaulting behavior for nationality selection. IP lookup remains client-only and must not be moved into RSC/SSR.
- Multi-column flow layout must reveal only active columns: one active column uses 100% width, two active columns use 50%/50%, and three active columns use equal thirds. Forward navigation should animate new columns from right to left; backward navigation should animate from left to right without changing the upload column width after a visa offer is selected.
- `apps/evm-next` pages should use route-level `loading.tsx` for segment loading and `Suspense` with feature-specific skeletons around RSC-fed client surfaces where the page renders async data.
- The migrated `apply-visa` route must expose the shared three-section `ApplyVisaSkeleton` through both app-level route loading and local Suspense fallbacks. `apps/evm-next/src/app/[module]/apply-visa/loading.tsx` owns the Next segment fallback, while the B2B RSC route exports `HydrateFallback` and wraps the async route content in `Suspense`.
- App styles that consume `packages/portal` must include the portal source in Tailwind scanning. Keep this app-local, for example in `apps/b2b/src/routes/root/styles.css` and `apps/evm-next/src/app/globals.css`, instead of changing `packages/ui` core component styles.
- The `apply-visa` slice is not complete until the migrated route exposes the working nationality, destination, visa type, currency, document upload, and create-application UI from the legacy `new-visa` flow.
- Portal apply-visa controls should stay feature-local: the country combobox owns its loading trigger, empty state, and destination-list placeholder in `packages/portal`, and document upload owns accepted-file copy, empty document requirements, and uploaded-document modal sizing without changing `packages/ui`.
- B2B initialization should use the shared product loading treatment instead of a plain text card, with the client initializer rendering the loader while the session action runs.
- Do not remove legacy code paths during this slice.
- Do not introduce ORPC imports, raw `fetch`, async client components, or snake_case app-facing fields.
- Do not add client interactivity before the Server Component page shell and RSC data loading are in place.
- Do not add Server Actions until a mutation is migrated and the app layer can own cache invalidation for that mutation.
- When Server Actions are passed into `packages/portal`, effect-driven reads such as visa offers and required documents must be idempotent across React StrictMode, Next RSC, and Vite RSC. Use stable request keys rather than function/object identity as effect dependencies.
- Backtracking or resetting an `apply-visa` flow must synchronously invalidate in-flight offer, document, and upload actions. Pending responses may finish at the transport layer, but shared client state must reject stale results so a user cannot return to column 1 and have an old visa offer or uploaded document applied later.
- Server Action request cancellation must use the shared browser-side singleton in `@workspace/rsc-action-requests`. App entries wire `rscActionRequests.fetch` into the RSC runtime, and package client components import the same manager or `./react` hook instead of importing app-local request files.
- If this slice needs behavior not listed in this plan, update this document before implementation.

Recommended order:

1. `initialize`
2. `apply-visa`
3. `review`
4. `payment-summary`
5. `payment-success`
6. `application-details`
7. `track-applications`
8. `data-sim` app-local module later, in its own app-local path set

Each flow should follow the same sequence:

1. Server Component page shell
2. RSC data loader
3. TanStack hydration where needed
4. Client component for interactions
5. Server Actions for mutations
6. Migrate the initialization API for that flow at the same time as the page shell

For the first `apply-visa` slice, client components and Server Actions are required because the legacy `new-visa` surface includes selection, document upload, and application creation interactions. The app layer must own those Server Actions, and `packages/portal` must consume them as explicit props.

### Phase 6: Archive Legacy Code

- Move replaced code into `migrations/evm`.
- Treat it as dead code and do not run it from scripts.
- Keep it out of lint, typecheck, format, turbo, and build entry points.
- Keep archive content readable for reference but unreachable from normal app execution.

### Phase 7: Remove Legacy Dependencies

- Remove ORPC imports from the migrated EVM path.
- Remove legacy app routes and handlers only after the new app is validated.
- Remove old package exports only after consumers are migrated.

## Impacted Repo Files

Expect to update these categories of files during the implementation:

- `apps/evm-next/**`
- `apps/evm-next/src/components/*provider*.tsx`
- `apps/evm-next/src/server/api.ts`
- `apps/evm-next/src/server/enterprise.ts`
- `apps/evm-next/src/app/[module]/initialize/**`
- `packages/portal/**`
- `packages/api/**`
- `packages/common/**` if it becomes constants-only
- initialization route handlers and bootstrap APIs for the migrated modules
- `apps/evm/**` once the old surface is retired
- `pnpm-workspace.yaml`
- `turbo.json`
- root `.gitignore`
- package `scripts`
- package `exports`
- ESLint configs
- Prettier configs
- TypeScript configs

## Validation Order

Run these after each migration slice:

1. `pnpm --filter @workspace/api typecheck`
2. `pnpm --filter @workspace/portal typecheck`
3. `pnpm --filter @workspace/portal lint`
4. `pnpm --filter @workspace/portal format`
5. `pnpm --filter @workspace/evm-next typecheck`
6. `pnpm --filter @workspace/evm-next lint`
7. `pnpm --filter @workspace/evm-next format`
8. `pnpm typecheck`
9. `pnpm lint`
10. `pnpm format`

For the legacy app, keep verification scoped so we do not break the current flow during migration.

## Why This Shape

- It keeps the current app safe while the replacement is built.
- It avoids abstractions that hide app-runtime behavior.
- It keeps TanStack Query for client caching only.
- It keeps `packages/api` as the transport boundary.
- It allows shared module code across `apps/*` without making the package generic.
- It gives us a place to standardize names and remove legacy output from `src`.
