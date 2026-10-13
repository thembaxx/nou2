import { storePhotos } from "@/lib/photos";
import { getDb } from "@/lib/db";
import { requireUser, readJson, rateLimit, apiFailure, ApiError } from "@/lib/http";
import { listingSchema } from "@/lib/validation";
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    await rateLimit(user.id, "listing", 10);
    const parsed = listingSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message, 400);
    if ((await getDb().listing.count({ where: { userId: user.id } })) >= 100)
      throw new ApiError("Listing limit reached. Archive or remove an existing listing.", 409);
    const row = await getDb().$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: { ...parsed.data, images: [], userId: user.id },
      });
      const images = await storePhotos(tx, created.id, parsed.data.images);
      await tx.listing.update({ where: { id: created.id }, data: { images } });
      return created;
    });
    return Response.json({ id: row.id }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
