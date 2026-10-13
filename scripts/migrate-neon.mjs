import { neon } from "@neondatabase/serverless";
import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is required; values must stay private.");
const sql = neon(process.env.DATABASE_URL);
await sql.query(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
 "id" VARCHAR(36) PRIMARY KEY, "checksum" VARCHAR(64) NOT NULL,
 "finished_at" TIMESTAMPTZ, "migration_name" VARCHAR(255) NOT NULL,
 "logs" TEXT, "rolled_back_at" TIMESTAMPTZ, "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "applied_steps_count" INTEGER NOT NULL DEFAULT 0
)`);
const folders = (
  await readdir(new URL("../prisma/migrations/", import.meta.url), { withFileTypes: true })
)
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();
for (const name of folders) {
  const script = await readFile(
    new URL(`../prisma/migrations/${name}/migration.sql`, import.meta.url),
    "utf8",
  );
  const checksum = createHash("sha256").update(script).digest("hex");
  const existing = await sql.query(
    'SELECT checksum,finished_at FROM "_prisma_migrations" WHERE migration_name = $1 AND rolled_back_at IS NULL',
    [name],
  );
  if (existing.length) {
    if (existing[0].checksum !== checksum || !existing[0].finished_at)
      throw new Error(`Migration ${name} differs or is incomplete. Review before continuing.`);
    console.log(`Already applied: ${name}`);
    continue;
  }
  const statements = script
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  await sql.transaction([
    sql.query("SELECT pg_advisory_xact_lock(hashtext('carpur-migrations'))"),
    ...statements.map((statement) => sql.query(statement)),
    sql.query(
      'INSERT INTO "_prisma_migrations" (id,checksum,migration_name,finished_at,applied_steps_count) VALUES ($1,$2,$3,now(),1)',
      [randomUUID(), checksum, name],
    ),
  ]);
  console.log(`Applied: ${name}`);
}
console.log("Schema migration completed. No demo inventory was inserted.");
