# Automated Prisma 7 lockfile recovery

Temporary GitHub Actions workflow: .github/workflows/prisma7-lockfile-recovery.yml. The October 2026 Actions minutes are exhausted, and this runtime cannot access the npm registry.

The workflow can be dispatched manually when Actions credits return and is scheduled November 1–7 at 05:17 UTC. It runs only in thembaxx/nou2 against migration/prisma7-neon-coordinated-20261027, never main. It checks that Prisma CLI, Client and Neon adapter are all pinned to 7.10.1.

The first job regenerates the lockfile from real npm registry metadata, checks importer specifiers and a frozen installation, then commits the resulting lockfile ONLY to draft PR #25. A separate read-only job then performs frozen installation, Prisma Client generation, schema validation, formatting, lint, TypeScript checks, unit tests and a production build. A later code/test failure never merges or changes production; the already-resolved lockfile remains on the draft branch for troubleshooting. A regeneration or frozen-install failure does not commit a lockfile.

This does NOT auto-merge the migration. A staging Neon verification of authentication, sessions, listings, enquiries and photos is still required. Never treat quota failures as passing tests. Clean up the temporary workflow after the November window or successful migration.

Scheduled GitHub workflows run from the default branch, so the recovery workflow must be merged into main even though its checkout and commit operate on the isolated migration branch.