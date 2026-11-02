# Prisma 7 + Neon migration: implementation and validation

## Current status (verified November 2, 2026)

Nou2 uses Prisma ORM **7.10.1** with `@prisma/client` and `@prisma/adapter-neon` at the same version. PR [#25](https://github.com/thembaxx/nou2/pull/25) was explicitly force-merged at `eec6a583680ee557d7ad866b34242d01a5f67bb2` before the original lockfile could be verified. That temporary mismatch was repaired in merged auth OTP PR [#30](https://github.com/thembaxx/nou2/pull/30) at `9bb58c6127334a830acb70a1988267dcc295a6df`.

The October 30 main CI run [41013882711](https://github.com/thembaxx/nou2/actions/runs/41013882711) verified dependency consistency, frozen install and Prisma Client generation but identified formatting drift. PR [#36](https://github.com/thembaxx/nou2/pull/36) repaired the formatting and the WebGL2 shader source issue; it was merged at `7a21e63187d8d75c5ca8674c71665f7da0b5492b`.

The [post-merge quality gates](https://github.com/thembaxx/nou2/actions/runs/41285126399) and the [November 1 lockfile recovery verification](https://github.com/thembaxx/nou2/actions/runs/41303774582) both succeeded. The latter ran dependency consistency, frozen installation, Prisma Client generation, schema validation, formatting, lint, TypeScript checks, unit tests and a production build. No lockfile repair branch was necessary. The temporary recovery workflow was removed after successful verification.

**These checks do not establish live database compatibility or a successful production deployment.** They do not authorize production database migrations.

## Implementation notes

- The generator uses Prisma 7 `prisma-client` and writes ignored TypeScript output to `lib/generated/prisma`. Generation is required before build and type checking.
- The datasource URL is configured in `prisma.config.ts`, with optional environment access for commands such as `prisma generate` that do not need a live connection.
- Runtime uses a shared `PrismaClient` with the `PrismaNeon` adapter and WebSocket support. Better Auth uses `getDb()`.
- Server-side Prisma type imports point to the generated client. The dependency consistency guard remains mandatory.

## Outstanding database and deployment verification

1. Provision or select a dedicated **non-production** Neon branch, with test-only credentials. Do not use production `DATABASE_URL` or `DIRECT_URL`.
2. Validate Better Auth email OTP and sessions, protected listings, garage, enquiries, and photo routes end-to-end against staging, including connection failures, WebSocket/TLS handling and timeouts.
3. Inspect schema differences and migration compatibility on staging only. Do not execute destructive migrations or production writes; require a backup and explicit approval before any production migration.
4. Independently confirm the Nou2 deployment and protected routes, if a Nou2-specific deployment integration is available. The connected Vercel `carpur` project is **not** a Nou2 deployment.
5. Keep CI, frozen installation and build checks mandatory for subsequent Prisma or Neon changes.

References: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 and https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference.
