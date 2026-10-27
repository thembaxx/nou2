import "dotenv/config";
import { defineConfig } from "prisma/config";

// The generate command must work without a DB URL in untrusted PR preview builds.
// Migrations use the direct Neon URL when supplied; no secrets are committed.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
  },
});
