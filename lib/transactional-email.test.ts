import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { sendAccountEmail, sendTransactionalEmail } from "./transactional-email";
const env = {
  RESEND_API_KEY: "mock-only",
  EMAIL_FROM: "Carpur <test@example.com>",
  BETTER_AUTH_URL: "https://carpur.example.com",
};
const id = "623e4567-e89b-42d3-a456-426614174000";
const email = {
  to: "member@example.com",
  url: "https://carpur.example.com/api/auth/reset-password/token?callbackURL=%2Freset-password",
  token: "token",
  type: "password-reset" as const,
};
describe("account email transport", () => {
  it("fails closed before fetching without canonical configuration or with forged links", async () => {
    const fetch = vi.fn();
    await expect(sendAccountEmail(email, { env: {}, fetch })).rejects.toMatchObject({
      code: "EMAIL_NOT_CONFIGURED",
    });
    for (const url of [
      "https://untrusted.example/api/auth/reset-password/token",
      "https://carpur.example.com/api/auth/reset-password/other",
      "https://carpur.example.com/api/auth/reset-password/token?callbackURL=https://untrusted.example/",
    ])
      await expect(sendAccountEmail({ ...email, url }, { env, fetch })).rejects.toMatchObject({
        code: "EMAIL_REQUEST_INVALID",
      });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses a stable key and reports provider acceptance separately from delivery", async () => {
    const fetch = vi.fn(async () => Response.json({ id }));
    expect(await sendAccountEmail(email, { env, fetch })).toEqual({ id, status: "accepted" });
    await sendAccountEmail(email, { env, fetch });
    const [url, options] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.redirect).toBe("error");
    expect((options.headers as Record<string, string>)["Idempotency-Key"]).toBe(
      (
        (fetch.mock.calls[1] as unknown as [string, RequestInit])[1].headers as Record<
          string,
          string
        >
      )["Idempotency-Key"],
    );
    expect(JSON.parse(String(options.body)).to).toEqual(["member@example.com"]);
  });
  it("distinguishes rejection and malformed acceptance without sending a real message", async () => {
    const message = {
      to: "member@example.com",
      subject: "Hello",
      text: "Test only",
      idempotencyKey: "test-key",
    };
    await expect(
      sendTransactionalEmail(message, {
        env,
        fetch: vi.fn(async () => Response.json({}, { status: 429 })),
      }),
    ).rejects.toMatchObject({ code: "EMAIL_REJECTED", retryable: true });
    await expect(
      sendTransactionalEmail(message, {
        env,
        fetch: vi.fn(async () => Response.json({ id: "bad" })),
      }),
    ).rejects.toMatchObject({ code: "EMAIL_RESPONSE_INVALID" });
  });
});
