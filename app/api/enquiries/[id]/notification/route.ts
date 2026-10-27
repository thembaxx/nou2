import { requireUser, rateLimit, ApiError, apiFailure } from "@/lib/http";
import { getDb } from "@/lib/db";
import { sendEnquiryNotification } from "@/lib/enquiry-notification";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    await rateLimit(user.id, "notification-retry", 5);
    const { id } = await context.params;
    const row = await getDb().enquiry.findFirst({
      where: { id, listing: { userId: user.id } },
      select: { id: true },
    });
    if (!row) throw new ApiError("Enquiry not found.", 404);
    const result = await sendEnquiryNotification(row.id);
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
