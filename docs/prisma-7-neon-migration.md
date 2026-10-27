# Prisma 7 + Neon migration candidate (not production-ready until verified)

This branch migrates Nou2 from Prisma ORM 6.19.3 to **7.10.1** using its existing Neon serverless runtime driver, the matching `@prisma/adapter-neon` package, `ws`, and the new generated `prisma-client` TypeScript output.

This is deliberately a **draft** migration PR. The execution environment cannot reach the npm registry and GitHub Actions capacity has been exhausted. `pnpm-lock.yaml` remains **unchanged**, and `pnpm deps:check` intentionally rejects the mismatch. Do not merge this branch or deploy it until a genuine lockfile refresh and build has passed.

## Complete the migration

1. Run with Node >=22.12 and pnpm 10.18.0: `pnpm install --lockfile-only --ignore-scripts --no-frozen-lockfile`. Commit the resulting `pnpm-lock.yaml` as part of this PR, never a hand-edited or transplanted lockfile.
2. Run `pnpm install --frozen-lockfile`, `pnpm deps:check`, `pnpm db:generate`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` without production database credentials.
3. Test DB-backed account sessions and email sign-in, enquiry persistence, listings, garage, and photo routes against a dedicated **non-production** Neon branch. Verify TLS/WebSocket connection handling and timeouts. In production, `DATABASE_URL` should use a pooled connection; the optional `DIRECT_URL` is for Prisma migrations.
4. Verify `pnpm db:migrate` against the isolated Neon branch and confirm `prisma migrate diff` reports no unintended destructive schema changes. **Do not run migrations against production** until database backup and approval.
5. Inspect Vercel deployment logs and confirm protected endpoints, auth callbacks and model generation on Node 24. If any check fails, retain Prisma 6 on `main`.

## Code details

- Schema generator now uses `prisma-client` and `lib/generated/prisma`. The generated output is gitignored. Generation runs before the production build and in CI before type checking.
- The Prisma datasource URL has moved from `schema.prisma` to `prisma.config.ts`. This uses an optional environment read because `prisma generate` does not need a live connection.
- Runtime reuses one `PrismaNeon` and `PrismaClient` instance across requests, with explicit WebSocket support. Existing Better Auth's Prisma adapter continues to use `getDb()`.
- All server-side Prisma type imports in the enquiry storage and tests now reference the generated client path.
- The frozen-lockfile guard merged in #23 is intentionally retained; mismatches **must not be waived** as an Actions quota issue.

References: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 and https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference.
