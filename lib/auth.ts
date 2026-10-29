import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { cache } from "react";
import { headers } from "next/headers";
import { getDb, databaseConfigured } from "./db";
import { sendAccountEmail, transactionalEmailConfigured } from "./transactional-email";
import { emailOtpConfigured, sendCarpurSignInCode } from "./email-otp";
export function authConfigured() {
  return databaseConfigured() && Boolean(process.env.BETTER_AUTH_SECRET);
}
function createAuth() {
  const emailReady = transactionalEmailConfigured();
  return betterAuth({
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: emailReady,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 3600,
      sendResetPassword: async ({ user, url, token }) => {
        await sendAccountEmail({ to: user.email, url, token, type: "password-reset" });
      },
    },
    emailVerification: {
      sendOnSignUp: emailReady,
      autoSignInAfterVerification: false,
      expiresIn: 3600,
      sendVerificationEmail: async ({ user, url, token }) => {
        await sendAccountEmail({ to: user.email, url, token, type: "email-verification" });
      },
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (
          (context.path === "/request-password-reset" ||
            context.path === "/send-verification-email") &&
          !transactionalEmailConfigured()
        ) {
          throw new APIError("SERVICE_UNAVAILABLE", {
            code: "EMAIL_NOT_CONFIGURED",
            message: "Account email is not configured. Please try again later.",
          });
        }
      }),
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/request-password-reset": { window: 3600, max: 3 },
        "/send-verification-email": { window: 3600, max: 3 },
        "/email-otp/send-verification-otp": { window: 3600, max: 5 },
        "/sign-in/email-otp": { window: 60, max: 5 },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7 },
    plugins: [
      ...(emailOtpConfigured() ? [emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        disableSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          await sendCarpurSignInCode({email, otp, type});
        },
      })] : []),
      nextCookies(),
    ],
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
