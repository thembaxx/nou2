"use client";
import { useState } from "react";
export function NotificationRetry({ id, status }: { id: string; status: string }) {
  const [message, setMessage] = useState(
    status === "ACCEPTED"
      ? "Email accepted by provider; delivery is not confirmed."
      : "The enquiry is saved here. Email notification is not confirmed.",
  );
  const [pending, setPending] = useState(false);
  return (
    <div className="mt-3 text-xs text-slate-400">
      <p role="status">{message}</p>
      {status !== "ACCEPTED" && (
        <button
          className="mt-2 underline"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              const response = await fetch(
                `/api/enquiries/${encodeURIComponent(id)}/notification`,
                { method: "POST" },
              );
              const result = await response.json();
              if (!response.ok) throw Error();
              setMessage(
                result.status === "ACCEPTED"
                  ? "Email accepted by provider; delivery is not confirmed."
                  : result.status === "EXHAUSTED"
                    ? "Email retries have reached their limit. The enquiry remains in your inbox."
                    : result.status === "BUSY"
                      ? "A notification attempt is in progress. Check again later."
                      : "Email is unavailable. Verify your account email and contact support if this continues. The enquiry remains saved.",
              );
            } catch {
              setMessage(
                "The notification status could not be checked. Your saved enquiry remains here.",
              );
            } finally {
              setPending(false);
            }
          }}
        >
          {" "}
          {pending ? "Checking…" : "Retry email notification"}
        </button>
      )}
    </div>
  );
}
