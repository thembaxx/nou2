import type { Prisma } from "./generated/prisma/client";
import { ApiError } from "./http";
export async function storePhotos(
  tx: Prisma.TransactionClient,
  listingId: string,
  images: string[],
) {
  const urls: string[] = [];
  for (const image of images) {
    if (image.startsWith("data:image/")) {
      const [, mimeType, base64] = image.match(/^data:(image\/(?:webp|jpeg|png));base64,(.+)$/)!;
      const content = Buffer.from(base64, "base64");
      const valid =
        mimeType === "image/webp"
          ? content.toString("ascii", 0, 4) === "RIFF" &&
            content.toString("ascii", 8, 12) === "WEBP"
          : mimeType === "image/jpeg"
            ? content[0] === 255 && content[1] === 216 && content[2] === 255
            : content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      if (!valid)
        throw new ApiError("The uploaded photo is not a valid JPEG, PNG or WebP file.", 400);
      const row = await tx.photo.create({ data: { listingId, mimeType, content } });
      urls.push(`/api/photos/${row.id}`);
    } else if (image.startsWith("/api/photos/")) {
      const id = image.slice("/api/photos/".length);
      if (!(await tx.photo.findFirst({ where: { id, listingId }, select: { id: true } })))
        throw new ApiError("Photo does not belong to this listing.", 400);
      urls.push(image);
    } else {
      urls.push(image);
    }
  }
  const retained = urls
    .filter((url) => url.startsWith("/api/photos/"))
    .map((url) => url.slice("/api/photos/".length));
  await tx.photo.deleteMany({ where: { listingId, id: { notIn: retained } } });
  return urls;
}
