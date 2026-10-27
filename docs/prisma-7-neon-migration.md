# Prisma ORM 7 and Neon migration (draft, **NOT ready for production**)

## What this branch prepares

- Coordinates `prisma` **7.10.1** and `@prisma/client` **7.10.1**, never one at a time.
- Installs a matching `@prisma/adapter-neon` for the existing Neon PostgreSQL database; retains the existing `@neondatabase/serverless` direct dependency and Better Auth's Prisma adapter.
- Switches to the ESM `prisma-client` generator and a `generated/prisma` directory, excluded from Git. Updates `lib/db.ts` to use that generated import and a Neon adapter.
- Moves datasource connection configuration into `prisma.config.ts` with `DIRECT_DATABASE_URL` preferred for migrations.
- Keeps CLI generation possible when no database secret is available in CI, but migrations must be run with a real direct DB URL.
- Changes **no existing model fields, schema migrations, production environment variables, deployed database records, authentication rules, or public endpoints**.

## Blocking release checklist

1. Generate a **real `pnpm-lock.yaml`**, using `pnpm@10.18.0`: `pnpm install --lockfile-only`, then `pnpm install --frozen-lockfile`. The lockfile in this draft branch still targets Prisma 6 and does not contain the Neon adapter or dotenv. **Do not merge this branch while that remains true.**
2. `pnpm deps:check`, `pnpm db:generate`, `pnpm db:validate`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. CI currently lacks runnable GitHub Actions credits; no claim that these have passed.
3. Run non-destructive tests against a **staging** Neon database: account signup/signin/session recovery, password reset, saved vehicles, listings, enquiries, transactional email errors, and photos; confirm connection pool and SSL handling. No production migrations or live DB writes as part of the dependency upgrade.
4. Review `prisma migrate status` on staging before deploying anything. No migrations required solely for an unchanged model schema.
5. Confirm runtime uses a normal `postgres://` or `postgresql://` Neon URL, not Prisma Accelerate. Set `DIRECT_DATABASE_URL` for CLI migration if different from the pooled runtime URL.
6. Verify an isolated preview deployment's server-side auth/listing routes and a planned rollback to Prisma 6.

The older independent PRs #8 and #9 each upgrade only one half of Prisma, and the stale bulk PR #12 includes Prisma 8 **RC**. Do **not** merge them into this branch.

Official guide: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
Driver: https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql
