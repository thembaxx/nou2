import "server-only";
import { createHash } from "node:crypto";

export type EmailEnvironment = {
  [key: string]: string | undefined;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  BETTER_AUTH_URL?: string;
};

type EmailDependencies = { env?: EmailEnvironment; fetch?: typeof globalThis.fetch };
export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
};

type EmailErrorCode =
  | "EMAIL_NOT_CONFIGURED"
  | "EMAIL_REQUEST_INVALID"
  | "EMAIL_UNAVAILABLE"
  | "EMAIL_REJECTED"
  | "EMAIL_RESPONSE_INVALID";

export class TransactionalEmailError extends Error {
  readonly name = "TransactionalEmailError";
  readonly code: EmailErrorCode;
  readonly retryable: boolean;
  readonly status?: number;
  constructor(code: EmailErrorCode, message: string, retryable = false, status?: number) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

const hasControls = (value: string) =>
  Array.from(value).some(
    (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
  );
const mailbox =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

function validMailbox(value: string) {
  return value.length <= 254 && !hasControls(value) && mailbox.test(value);
}

function settings(env: EmailEnvironment) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  if (!apiKey || hasControls(apiKey) || !from || hasControls(from) || from.length > 380)
    return null;
  const named = /^[^<>]+<([^<>]+)>$/.exec(from);
  if (!validMailbox(named ? named[1].trim() : from)) return null;
  try {
    const base = new URL(env.BETTER_AUTH_URL || "");
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash
    )
      return null;
    return { apiKey, from, origin: base.origin };
  } catch {
    return null;
  }
}

/** Configuration readiness only; a successful send still requires a verified provider sender. */
export function transactionalEmailConfigured(env: EmailEnvironment = process.env) {
  return settings(env) !== null;
}

/** The returned ID confirms provider acceptance, not delivery to the inbox. */
export async function sendTransactionalEmail(
  email: TransactionalEmail,
  dependencies: EmailDependencies = {},
): Promise<{ id: string; status: "accepted" }> {
  const config = settings(dependencies.env ?? process.env);
  if (!config)
    throw new TransactionalEmailError(
      "EMAIL_NOT_CONFIGURED",
      "Account email is unavailable. Configure RESEND_API_KEY, EMAIL_FROM and a canonical HTTPS BETTER_AUTH_URL.",
    );
  if (
    !validMailbox(email.to) ||
    !email.subject.trim() ||
    email.subject.length > 200 ||
    hasControls(email.subject) ||
    !email.text.trim() ||
    email.text.length > 40_000 ||
    !/^[a-z0-9:/_.-]{1,256}$/i.test(email.idempotencyKey)
  ) {
    throw new TransactionalEmailError(
      "EMAIL_REQUEST_INVALID",
      "The account email request is invalid.",
    );
  }
  let response: Response;
  try {
    response = await (dependencies.fetch ?? globalThis.fetch)("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
      cache: "no-store",
    });
  } catch {
    throw new TransactionalEmailError(
      "EMAIL_UNAVAILABLE",
      "The email service could not be reached. Please try again.",
      true,
    );
  }
  if (!response.ok) {
    throw new TransactionalEmailError(
      "EMAIL_REJECTED",
      "The email service did not accept this message. Please try again later.",
      response.status === 429 || response.status >= 500,
      response.status,
    );
  }
  try {
    if (!response.headers.get("content-type")?.toLowerCase().includes("application/json"))
      throw new Error();
    const body = await response.text();
    if (body.length > 16_384) throw new Error();
    const result: unknown = JSON.parse(body);
    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.id)
    )
      throw new Error();
    return { id: result.id, status: "accepted" };
  } catch {
    throw new TransactionalEmailError(
      "EMAIL_RESPONSE_INVALID",
      "The email service response could not be verified. Retry the same request before assuming it was accepted.",
      true,
    );
  }
}

export async function sendAccountEmail(
  email: { to: string; url: string; token: string; type: "password-reset" | "email-verification" },
  dependencies: EmailDependencies = {},
) {
  const config = settings(dependencies.env ?? process.env);
  if (!config)
    throw new TransactionalEmailError(
      "EMAIL_NOT_CONFIGURED",
      "Account email is unavailable. Configure RESEND_API_KEY, EMAIL_FROM and a canonical HTTPS BETTER_AUTH_URL.",
    );
  let action: URL;
  try {
    if (!email.token || email.token.length > 4096 || hasControls(email.token)) throw new Error();
    action = new URL(email.url);
    const expectedPath =
      email.type === "password-reset"
        ? `/api/auth/reset-password/${encodeURIComponent(email.token)}`
        : "/api/auth/verify-email";
    if (
      action.origin !== config.origin ||
      action.username ||
      action.password ||
      action.hash ||
      action.pathname !== expectedPath ||
      (email.type === "email-verification" && action.searchParams.get("token") !== email.token)
    )
      throw new Error();
    const callback = action.searchParams.get("callbackURL");
    if (callback) {
      const destination = new URL(callback, config.origin);
      if (destination.origin !== config.origin || destination.username || destination.password)
        throw new Error();
    }
  } catch {
    throw new TransactionalEmailError(
      "EMAIL_REQUEST_INVALID",
      "The account action link is invalid.",
    );
  }
  const reset = email.type === "password-reset";
  const subject = reset ? "Reset your Carpur password" : "Verify your email for Carpur";
  const text = reset
    ? `Reset your Carpur password\n\nOpen this link to choose a new password:\n${action.href}\n\nThis link expires in one hour and can be used once. After resetting your password, sign in again on your devices.\n\nIf you did not request this reset, you can ignore this email. This request does not change your password unless you use the link.\n\nCarpur`
    : `Verify your email for Carpur\n\nOpen this link to verify your email address:\n${action.href}\n\nThis link expires in one hour. After verification, return to Carpur and sign in.\n\nIf you did not create this account, you can ignore this email.\n\nCarpur`;
  const digest = createHash("sha256")
    .update(`${email.type}\0${email.to.toLowerCase()}\0${action.href}\0${email.token}`)
    .digest("hex");
  return sendTransactionalEmail(
    { to: email.to, subject, text, idempotencyKey: `carpur-${email.type}-${digest}` },
    dependencies,
  );
}
