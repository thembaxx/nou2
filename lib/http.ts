import { authConfigured, currentSession } from "./auth";
import { getDb } from "./db";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function requireUser(request: Request) {
  if (!authConfigured())
    throw new ApiError("Accounts and publishing are temporarily unavailable.", 503);
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw new ApiError("Request origin is not allowed.", 403);
  const session = await currentSession();
  if (!session) throw new ApiError("Please sign in to continue.", 401);
  return session.user;
}
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError("JSON request required.", 415);
  if (Number(request.headers.get("content-length")) > 1200000)
    throw new ApiError("Photos are too large.", 413);
  const body = await request.text();
  if (body.length > 1200000) throw new ApiError("Photos are too large.", 413);
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ApiError("Invalid JSON.", 400);
  }
}
export async function rateLimit(userId: string, action: string, max: number) {
  const bucket = Math.floor(Date.now() / 60000);
  const row = await getDb().rateLimit.upsert({
    where: { key: `${action}:${userId}:${bucket}` },
    create: { key: `${action}:${userId}:${bucket}`, count: 1, lastRequest: BigInt(Date.now()) },
    update: { count: { increment: 1 }, lastRequest: BigInt(Date.now()) },
  });
  if (row.count > max) throw new ApiError("Too many requests. Try again in a minute.", 429);
}
export function apiFailure(error: unknown) {
  if (error instanceof ApiError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error("Carpur request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json(
    { error: "The service is temporarily unavailable. Please try again." },
    { status: 503 },
  );
}
