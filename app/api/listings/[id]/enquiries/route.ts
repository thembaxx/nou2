import { saveEnquiry } from "@/lib/enquiry-storage";
import { getDb } from "@/lib/db";
import { requireUser, readJson, rateLimit, apiFailure, ApiError } from "@/lib/http";
import { enquirySchema } from "@/lib/validation";
import { after } from "next/server";
import { sendEnquiryNotification } from "@/lib/enquiry-notification";
import { transactionalEmailConfigured } from "@/lib/transactional-email";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    await rateLimit(user.id, "enquiry", 5);
    const { id } = await context.params;
    const listing = await getDb().listing.findFirst({
      where: { id, status: "PUBLISHED" },
      select: {
        userId: true,
        user: { select: { emailVerified: true } },
      },
    });
    if (!listing) throw new ApiError("This vehicle is no longer available.", 404);
    if (listing.userId === user.id)
      throw new ApiError("You cannot enquire about your own vehicle.", 400);
    const parsed = enquirySchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(
        "Write at least 10 characters and agree to share your contact details.",
        400,
      );
    const enquiry = await saveEnquiry({
      listingId: id,
      buyerId: user.id,
      message: parsed.data.message,
    });
    let notification: "queued" | "unavailable" = "unavailable";
    if (transactionalEmailConfigured() && listing.user.emailVerified) {
      try {
        after(async () => {
          try {
            await sendEnquiryNotification(enquiry.id);
          } catch (error) {
            // Do not log buyer messages, contact details or provider credentials.
            console.error(
              "Carpur enquiry notification processing failed",
              error instanceof Error ? error.name : "UnknownError",
            );
          }
        });
        notification = "queued";
      } catch {
        // Scheduling failure must not invalidate the already-saved inbox message.
        notification = "unavailable";
      }
    }
    return Response.json({ delivered: true, notification }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
