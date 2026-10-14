# Verification — 14 October 2026

Repository: https://github.com/thembaxx/nou2
Production: https://nou2.vercel.app

## This revision

Sharper responsive photography, full-screen photo inspection, richer finite motion and feedback, and smoother real-car 3D interaction. Buying-first discovery, dated manufacturer references, source labels, themes and explicit ownership uncertainty are retained.

## Local evidence

- Pinned pnpm 10.18.0; TypeScript, Oxlint with warnings denied, Oxfmt check and the production build pass.
- 40 Vitest tests pass: financial calculations (including balloon maturity, electric energy and separate PHEV charging), validation boundaries and generation/body matching for 3D assets.
- All three Prisma migrations applied to an isolated PostgreSQL 17 database, including the new/used condition column and inventory index. No demo data is seeded by migrations.
- 15 Playwright journeys are verified against `next start`. Fourteen pass in the full run; the expanded native 3D journey passes separately with a longer software-WebGL allowance. Coverage includes buyer filtering/garage/costs/comparison; account → draft → dealer publish → uploaded-photo navigation → buyer save → enquiry → inbox → sold → delete; mobile navigation; PWA/offline privacy; responsive sizes; constrained-device behavior; enhanced charts; reduced motion/unsupported WebGL; catalogue provenance/buying links/themes; lightweight model rotation/zoom/presets; native drag/presets/opt-in motion/pause/offscreen suspension; custom electric price/unit consistency; photo sharpness/optimisation; full-screen pinch/pan/keyboard reset; and reduced-motion photo inspection at 320px.
- Layout checks cover 320, 360, 390, 768, 1024, 1440 and 2560 px across home, marketplace, affordability, comparison and vehicle detail, with no horizontal overflow or browser JavaScript errors.
- Constrained-device verification uses 2 GB/2-core/data-saver signals and a 6× CPU throttle. Hardware signals are emulated, not a claim of physical-device benchmark results.
- Ferrari 458-family and BMW M3 E30 assets rendered through React Three Fiber/Three.js. Eight 800/1600px rotation previews were generated from each actual asset and inspected. Software-renderer detection disables expensive shadows and bounds interactive DPR; hardware graphics retain the enhanced path. The expanded software-WebGL journey takes about two minutes and is functional verification, not a physical-device frame-rate benchmark. The Ferrari source remains labelled as an open-roof artist model and is not attached to an Italia coupe listing.
- All 30 distinct manufacturer desktop image URLs were fetched successfully. A real Starlet source at 255,710 bytes was delivered through local Next.js optimisation as a 960px WebP at 40,678 bytes, with its alpha channel retained. Catalogue photos no longer become 100px thumbnails on modest hardware. Direct-source fallback remains available if optimisation fails; private uploads bypass it. Editorial derivatives use original source resolution, up to 3200px, without upscaling; Golf stops at 2400px.
- Local image-optimiser verification uses a temporary, host-only HTTPS proxy adapter because this environment requires proxied outbound requests. That adapter and the isolated database environment file are excluded from the implementation and deployment.
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
