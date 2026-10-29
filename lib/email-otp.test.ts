import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("./transactional-email", () => ({
  transactionalEmailConfigured: vi.fn(() => true),
  sendTransactionalEmail: vi.fn(async () => ({ id: "mock-id", status: "accepted" })),
}));
import { emailOtpConfigured, sendCarpurSignInCode } from "./email-otp";
import { sendTransactionalEmail } from "./transactional-email";
const before = process.env.CARPUR_EMAIL_OTP_ENABLED;
beforeEach(() => {
  process.env.CARPUR_EMAIL_OTP_ENABLED = "true";
  vi.clearAllMocks();
});
afterEach(() => {
  if (before === undefined) delete process.env.CARPUR_EMAIL_OTP_ENABLED;
  else process.env.CARPUR_EMAIL_OTP_ENABLED = before;
});

describe("optional email OTP", () => {
  it("requires explicit activation", async () => {
    delete process.env.CARPUR_EMAIL_OTP_ENABLED;
    expect(emailOtpConfigured()).toBe(false);
    await expect(
      sendCarpurSignInCode({ email: "buyer@example.com", otp: "123456", type: "sign-in" }),
    ).rejects.toThrow("unavailable");
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });
  it("sends a six-digit single-use sign-in code via existing provider", async () => {
    await sendCarpurSignInCode({ email: "buyer@example.com", otp: "123456", type: "sign-in" });
    expect(sendTransactionalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "buyer@example.com",
        subject: "Your Carpur sign-in code",
        text: expect.stringContaining("123456"),
        idempotencyKey: expect.stringMatching(/^carpur-email-otp-[0-9a-f]{64}$/),
      }),
    );
  });
  it("rejects unsupported operations and malformed codes", async () => {
    await expect(
      sendCarpurSignInCode({ email: "buyer@example.com", otp: "12345", type: "sign-in" }),
    ).rejects.toThrow("Unsupported");
    await expect(
      sendCarpurSignInCode({ email: "buyer@example.com", otp: "123456", type: "forget-password" }),
    ).rejects.toThrow("Unsupported");
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });
});
