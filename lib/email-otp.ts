import "server-only";
import { createHash } from "node:crypto";
import { sendTransactionalEmail, transactionalEmailConfigured } from "./transactional-email";

export function emailOtpConfigured() {
  return process.env.CARPUR_EMAIL_OTP_ENABLED === "true" && transactionalEmailConfigured();
}

export async function sendCarpurSignInCode({email, otp, type}: {email: string; otp: string; type: string}) {
  if (!emailOtpConfigured()) throw new Error("Email code sign-in is unavailable.");
  if (type !== "sign-in" || !/^[0-9]{6}$/.test(otp)) throw new Error("Unsupported verification request.");
  const digest = createHash("sha256").update(`email-otp\\0${email.toLowerCase()}\\0${otp}`).digest("hex");
  await sendTransactionalEmail({
    to: email,
    subject: "Your Carpur sign-in code",
    text: `Your one-time Carpur sign-in code is ${otp}. It expires in five minutes. If you didn't request a sign-in, ignore this email. Never share your code.\\n\\nCarpur`,
    idempotencyKey: `carpur-email-otp-${digest}`,
  });
}
