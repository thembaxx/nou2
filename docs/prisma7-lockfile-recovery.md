# Prisma 7 production lockfile recovery

**User-directed force merge:** PR #25 merged into `main` at `eec6a583680ee557d7ad866b34242d01a5f67bb2`, despite an independently confirmed mismatch between Prisma 7 in `package.json` and Prisma 6 in `pnpm-lock.yaml`. An install using `--frozen-lockfile` is expected to fail until repaired. The merge does not indicate a successful production build or database validation.

The temporary Actions workflow `.github/workflows/prisma7-lockfile-recovery.yml` now checks out **main** rather than the superseded migration branch. It is scheduled November 1–7 at 05:17 UTC and can be manually dispatched. Only workflow-file edits trigger its one-time push event.

The job checks version pins, regenerates the lockfile from actual npm metadata, verifies the dependency guard and frozen installation, generates and validates Prisma Client, and runs formatting, lint, TypeScript, unit tests and a production build. A failed command does **not** update any branch. If the build succeeds and the lockfile changed, it pushes the repair to `repair/prisma7-lockfile-main` **for review**. It never pushes to main, merges a PR, connects to production Neon, or runs a database migration.

The recovery branch must be reviewed and merged after the checks actually pass. It does not replace staging Neon testing of session/authentication, listings, garage, enquiries or photos. The workflow needs available GitHub Actions minutes and npm registry connectivity. Remove this temporary workflow after lockfile repair or after November 7.
