# Verification — 13 October 2026

Application implementation: `da20a6fb7add7f961f3ba52a8b1af7c1c975c354`.
GitHub: https://github.com/thembaxx/nou2
Production: https://nou2.vercel.app

## Local evidence

- pnpm 10.18.0 installed dependencies successfully.
- TypeScript, Oxlint with warnings denied, Oxfmt check and production build passed.
- 32 Vitest tests passed: amortisation, zero interest, cash purchase, balloons, loan maturity, running costs, resale, budget headroom and invalid-input boundaries.
- Both Prisma migrations applied to an isolated PostgreSQL 17 database.
- Four Playwright journeys passed against `next start`: search/filter/garage/calculators/comparison; account → uploaded photo → draft → dealer publish → buyer save → enquiry → seller inbox → sold → delete; mobile navigation/reduced motion; manifest/service worker/offline fallback.
- Cross-account listing mutation returned 404; drafts and sold vehicles were inaccessible publicly. The uploaded photo remained available to its owner while drafting and publicly after publishing.
- Desktop/mobile visual checks found no browser JavaScript errors and no mobile horizontal overflow.

## Production evidence

Vercel project `nou2` is linked to `thembaxx/nou2` with production branch `main`.
The application deployment reached READY and assigned `nou2.vercel.app`.
Three public Playwright journeys passed on the HTTPS production origin: buyer discovery/calculators/comparison/garage, mobile navigation and installable PWA/offline fallback.
Public route checks returned 200 for the home page, marketplace, affordability, compare, illustrative vehicle detail, sign-in, manifest, robots, sitemap and llms.txt. Sitemap uses the canonical production origin.
No error/fatal runtime logs were returned in the checked ten-minute window. This is a deployment check, not ongoing monitoring.

## Outstanding production dependency

At verification time, neither the earlier `carpur` setup project nor the Git-connected `nou2` project had `DATABASE_URL`. `/api/health` correctly returned 503 with database/accounts false. Account creation, seller publishing and enquiry delivery were therefore **not verified on production** and remain unavailable there. The user is connecting a new Neon database; no existing unrelated database was reused and no fictitious live inventory was seeded.

After connecting Neon to `nou2`, apply the checked migrations, redeploy and run the hosted account/listing/enquiry journey against an isolated verification branch. Keep production and preview databases separate. The included HTTP migration script supports executors whose outbound access is HTTPS-only.

Email notifications, email verification/recovery, seller verification, external inventory/finance/insurance/credit-bureau feeds, payments, moderation tooling and dealership team seats remain unimplemented. See README and `/sources` for modelling and operational limits.
