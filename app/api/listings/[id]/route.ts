import { storePhotos } from "@/lib/photos";
import { getDb } from "@/lib/db";
import { requireUser, readJson, rateLimit, apiFailure, ApiError } from "@/lib/http";
import { listingSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireUser(request);
    await rateLimit(user.id, "listing", 10);
    const { id } = await context.params;
    const row = await getDb().listing.findFirst({ where: { id, userId: user.id } });
    if (!row) throw new ApiError("Listing not found.", 404);
    const parsed = listingSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message, 400);
    await getDb().$transaction(async (tx) => {
      const images = await storePhotos(tx, id, parsed.data.images);
      await tx.listing.update({ where: { id }, data: { ...parsed.data, images } });
    });
    return Response.json({ id });
  } catch (error) {
    return apiFailure(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const result = await getDb().listing.deleteMany({ where: { id, userId: user.id } });
    if (!result.count) throw new ApiError("Listing not found.", 404);
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiFailure(error);
  }
}
