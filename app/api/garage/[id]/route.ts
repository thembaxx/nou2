import { getDb } from "@/lib/db";
import { requireUser, apiFailure, ApiError } from "@/lib/http";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    if (!(await getDb().listing.findFirst({ where: { id, status: "PUBLISHED" } })))
      throw new ApiError("Vehicle is unavailable.", 404);
    await getDb().savedVehicle.upsert({
      where: { userId_listingId: { userId: user.id, listingId: id } },
      create: { userId: user.id, listingId: id },
      update: {},
    });
    return Response.json({ saved: true });
  } catch (error) {
    return apiFailure(error);
  }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    await getDb().savedVehicle.deleteMany({ where: { userId: user.id, listingId: id } });
    return Response.json({ saved: false });
  } catch (error) {
    return apiFailure(error);
  }
}
