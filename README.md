# Carpur

South African automotive marketplace with editable ownership forecasting. Built from the supplied `carpur-source.zip`; its cinematic Carpur design, editorial imagery, initial financial module and product direction are retained and expanded into a routed application.

GitHub target: **thembaxx/nou2** (updated by the user during implementation).

## Stack

Next.js 16 App Router, React, TypeScript, Tailwind 4, shadcn-style Radix primitives, pnpm 10.18, Oxlint, Oxfmt, Motion, opt-in React Three Fiber / Three.js, Recharts, PostgreSQL, Prisma 6 and Better Auth.

## Local setup

Use Node 22+ and the pinned pnpm version. Copy `.env.example` to `.env.development.local`; configure your own local PostgreSQL URL and a cryptographically random `BETTER_AUTH_SECRET`. Do not commit secrets. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local development. Prisma CLI scripts need `DATABASE_URL` exported or supplied through an env-file loader; only Next.js automatically loads `.env.development.local`.

```sh
corepack enable
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

In managed environments whose fallback `pnpm` differs, use `npx -y pnpm@10.18.0` for each command. `pnpm-workspace.yaml` permits only the reviewed Prisma, esbuild and sharp build scripts.

Without database/auth configuration, browsing examples and financial tools work. Publishing and enquiries fail closed rather than reporting success.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Browser tests require a running app with an isolated PostgreSQL database and configured auth:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium` when the host provides Chromium. Use `BASE_URL` to test a deployment. Tests create clearly labelled QA fixtures and remove listings in a `finally` block. Use an isolated database; remove QA accounts after testing. Do not use real personal data.

## Features

- Separate seller inventory and explicitly illustrative inventory, search, make/price/body/seller filters and sorting.
- Routed vehicle details, photo galleries, seller information, safety guidance and enquiry inbox delivery.
- Private and dealership listings, compressed uploads or HTTPS photo URLs, drafts, publish/edit/sold/archive/delete workflows and owner checks.
- Seller dashboard, buyer garage with authenticated cross-device saves and anonymous browser saves.
- Editable fixed-rate finance, deposit, balloon, term, fuel/energy, insurance, maintenance and depreciation; 1/3/5-year cash and net ownership projections; comparison and accessible chart tables.
- No credit scores or finance approvals. All default financial figures are illustrative. Official source links and methodology are documented at `/sources`.
- Responsive layout, keyboard focus, skip link, Radix focus-managed enquiry/delete dialogs, reduced motion, lazy charts and opt-in schematic 3D.
- Installable PWA manifest and PNG icons, public asset caching and an offline fallback. Account pages, messages, RSC responses and APIs are never cached by the service worker.
- Page metadata, structured data for actual listings, dynamic sitemap, robots and llms.txt.

## Deployment

Create/link the Vercel project to `thembaxx/nou2`, set its framework to Next.js and use `pnpm install --frozen-lockfile` / `pnpm build`. Connect a **new** Neon PostgreSQL database. Set `DATABASE_URL`, a private `BETTER_AUTH_SECRET`, production-only `BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS production origin. Keep preview databases separate from production. Do not give preview builds production database credentials.

Apply migrations before enabling accounts. Normal PostgreSQL uses `pnpm db:migrate`. For managed executors with HTTPS-only access to Neon, the included script applies these SQL migrations transactionally and records Prisma-compatible checksums:

```sh
node --env-file=.env.local scripts/migrate-neon.mjs
```

The migration script only creates Carpur tables and indexes. It does not insert sample listings, rewrite existing data or drop tables. Use it only against the intended Carpur database. `/api/health` verifies database tables and auth configuration without exposing secrets.

## Current limits

No external inventory feed, lender, insurer, credit bureau, vehicle-history, payment or automated email integration. Enquiries are delivered to the seller's Carpur inbox; the seller replies by email. Email verification and password recovery are pending. Seller/dealership identity and vehicle condition are unverified. Dealership team seats, moderation tooling and a dedicated privacy/support channel are pending. Photos are capped at 6 and 1 MB total per listing and stored as separate PostgreSQL bytea records, served on demand; object storage/CDN is recommended at scale. Inventory shows the newest 200 published listings and accounts support up to 100 listings; server pagination is pending. Comparison applies shared financial allowances; individual calculators support separate quotations. The 3D view is a generic schematic, not a scan of a listed vehicle.

## Photography

Editorial images retain the archive’s Unsplash references for the hero, BMW and Mercedes-Benz. The archive’s incorrect Golf and Toyota images were replaced with attributed Wikimedia Commons photos. All are bundled locally for performance. They are not evidence of model, trim, condition or a vehicle offered for sale. See `docs/photography.md` for source URLs.
