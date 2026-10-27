# Dependency upgrade safety

The `pnpm deps:check` command runs without network, database credentials, or third-party scripts. It rejects mismatched Prisma CLI/client versions, prerelease Prisma builds and any changed Prisma, Next or Better Auth direct version that does not agree with the lockfile importer.

Routine dependency updates can be merged with capacity-limited GitHub Actions only after a file-level review. This command detects configuration drift but **does not substitute for** frozen installation, Prisma Client generation, database-backed auth/listing tests, or a production build.

For Prisma ORM 7, upgrade `prisma` and `@prisma/client` together, add the matching Neon driver adapter, migrate the Prisma schema/configuration and generated imports, and regenerate `pnpm-lock.yaml` using `pnpm@10.18.0`. Production deployments must never use an unreviewed Prisma major upgrade. Database URL values belong only in environment variables. The original schema and production database remain on Prisma 6 until the full migration validates.

Official guide: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7.
