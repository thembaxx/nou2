import { paginatedInventory, parseInventoryQuery } from "@/lib/vehicles";

export async function GET(request: Request) {
  try {
    const result = await paginatedInventory(parseInventoryQuery(new URL(request.url).searchParams));
    return Response.json(result, {
      status: result.available ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof RangeError
            ? error.message
            : "Seller inventory is temporarily unavailable.",
      },
      { status: error instanceof RangeError ? 400 : 503 },
    );
  }
}
