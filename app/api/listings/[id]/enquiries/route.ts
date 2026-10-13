import { getDb } from "@/lib/db";
import { requireUser, readJson, rateLimit, apiFailure, ApiError } from "@/lib/http";
import { enquirySchema } from "@/lib/validation";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    await rateLimit(user.id, "enquiry", 5);
    const { id } = await context.params;
    const listing = await getDb().listing.findFirst({ where: { id, status: "PUBLISHED" } });
    if (!listing) throw new ApiError("This vehicle is no longer available.", 404);
    if (listing.userId === user.id)
      throw new ApiError("You cannot enquire about your own vehicle.", 400);
    const parsed = enquirySchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(
        "Write at least 10 characters and agree to share your contact details.",
        400,
      );
    await getDb().enquiry.create({
      data: { listingId: id, buyerId: user.id, message: parsed.data.message },
    });
    return Response.json({ delivered: true }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
