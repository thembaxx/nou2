import { getAuth, authConfigured } from "@/lib/auth";
export async function GET(request: Request) {
  if (!authConfigured())
    return Response.json({ error: "Accounts are temporarily unavailable" }, { status: 503 });
  return getAuth().handler(request);
}
export const POST = GET;
