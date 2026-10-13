# Verification — 13 October 2026

Repository: https://github.com/thembaxx/nou2
Production: https://nou2.vercel.app

## This revision

Buying-first discovery with new cars before second hand stock, a dated official Toyota catalogue, squircle controls, title case, light/dark/device themes, adaptive visuals, real-car 3D and explicit ownership uncertainty.

## Local evidence

- Pinned pnpm 10.18.0; TypeScript, Oxlint with warnings denied, Oxfmt check and the production build pass.
- 40 Vitest tests pass: financial calculations (including balloon maturity, electric energy and separate PHEV charging), validation boundaries and generation/body matching for 3D assets.
- All three Prisma migrations applied to an isolated PostgreSQL 17 database, including the new/used condition column and inventory index. No demo data is seeded by migrations.
- All 12 Playwright journeys pass against `next start`: buyer filtering/garage/costs/comparison; account → draft → dealer publish → buyer save → enquiry → inbox → sold → delete; mobile navigation; PWA/offline privacy; responsive sizes; constrained-device behavior; enhanced charts; reduced motion/unsupported WebGL; real catalogue provenance/buying links/themes; lightweight real-model rotation previews; native 3D drag/offscreen suspension; custom electric price/unit consistency.
- Layout checks cover 320, 360, 390, 768, 1024, 1440 and 2560 px across home, marketplace, affordability, comparison and vehicle detail, with no horizontal overflow or browser JavaScript errors.
- Constrained-device verification uses 2 GB/2-core/data-saver signals and a 6× CPU throttle. Hardware signals are emulated, not a claim of physical-device benchmark results.
- Ferrari 458-family and BMW M3 E30 assets rendered through React Three Fiber/Three.js in software WebGL with no runtime errors. Eight rotation previews were generated from each actual asset. Visual inspection confirmed recognisable real-car geometry. The Ferrari source is labelled broadly as an open-roof artist model: it is not attached to an Italia coupe listing.
- Toyota Corolla Cross model metadata and CC BY licence were verified, but its embedded viewer failed. It is an external source link and attributed preview; no working embedded integration is claimed.
- Licensed vendor decoder files are unmodified and excluded from lint/format. Source code remains checked. Attribution is in `public/models/CREDITS.md`.

## Data provenance

44 Toyota variants across ten official South African model pages were observed on 13 October 2026. The snapshot retains exact source records; the app supplies source links, observation dates and reference-price labels. Model year and stock are not invented. Missing Hiace consumption is disclosed. Charge-dependent PHEV lab figures are not treated as complete running costs. See `docs/catalogue.md`.

## Production dependency and verification

Before this update, Vercel `nou2` was linked to `thembaxx/nou2` on `main`, with the public canonical origin above. The project environment metadata still contained no `DATABASE_URL`; `/api/health` returned 503 with database/accounts false. Hosted accounts, publishing and enquiries remain unavailable until Neon is connected to **nou2**, the migrations are applied and the hosted lifecycle is verified.

The final delivery records the pushed SHA, deployment state and post-deployment public checks. Local seller tests use only the isolated database. No QA inventory is inserted in production.

## Remaining limitations

Catalogue coverage is currently Toyota; all makes are accepted in seller workflows, but there is no complete-market or verified live-stock feed. Native 3D coverage is two artist assets, not every vehicle or exact factory trim. Unmatched cars use photographs. Manufacturer photography depends on its external CDN. Loan rates, energy prices, insurance, maintenance and depreciation remain editable planning assumptions, not live quotes. Stress scenarios are examples of uncertainty, not probabilities.

Automated email, account recovery/verification emails, seller verification, lender/insurer/credit-bureau feeds, vehicle history, payments, moderation tooling and dealership team seats remain unimplemented. Inventory is capped at 200 published rows; pagination and production object storage are pending. See README and `/sources`.
