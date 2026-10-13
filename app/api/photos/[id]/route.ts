import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const photo = await getDb().photo.findUnique({
      where: { id },
      include: { listing: { select: { userId: true, status: true } } },
    });
    if (!photo) return new Response(null, { status: 404 });
    if (photo.listing.status !== "PUBLISHED") {
      const session = await currentSession();
      if (!session || session.user.id !== photo.listing.userId)
        return new Response(null, { status: 404 });
    }
    const bytes = new Uint8Array(photo.content.length);
    bytes.set(photo.content);
    return new Response(bytes, {
      headers: {
        "Content-Type": photo.mimeType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
