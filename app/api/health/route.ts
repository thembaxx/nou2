import { getDb, databaseConfigured } from "@/lib/db";
import { authConfigured } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!databaseConfigured())
    return Response.json({ status: "degraded", database: false, accounts: false }, { status: 503 });
  try {
    await getDb().listing.count();
    return Response.json(
      { status: authConfigured() ? "ok" : "degraded", database: true, accounts: authConfigured() },
      { status: authConfigured() ? 200 : 503 },
    );
  } catch {
    return Response.json({ status: "degraded", database: false, accounts: false }, { status: 503 });
  }
}
