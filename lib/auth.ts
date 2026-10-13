import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { cache } from "react";
import { headers } from "next/headers";
import { getDb, databaseConfigured } from "./db";
export function authConfigured() {
  return databaseConfigured() && Boolean(process.env.BETTER_AUTH_SECRET);
}
function createAuth() {
  return betterAuth({
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
    session: { expiresIn: 60 * 60 * 24 * 7 },
    plugins: [nextCookies()],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!authConfigured()) throw new Error("Accounts are not configured");
  if (!instance) instance = createAuth();
  return instance;
}
export const currentSession = cache(async () => {
  if (!authConfigured()) return null;
  return getAuth().api.getSession({ headers: await headers() });
});
