// Produces a candidate snapshot for review. Never silently overwrites published data.
import { writeFile } from "node:fs/promises";
const slugs = [
  "starlet",
  "corolla-cross",
  "fortuner",
  "rav4",
  "corolla",
  "urban-cruiser",
  "land-cruiser-prado",
  "gr86",
  "hiace",
  "rumion",
];
const rows = [];
for (const slug of slugs) {
  const sourceUrl = `https://www.toyota.co.za/ranges/${slug}`;
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Source failed: ${sourceUrl} (${response.status})`);
  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
  if (!match) throw new Error(`Source structure changed: ${sourceUrl}`);
  const found = new Map();
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if ("fuelcon" in value && "price" in value && "id" in value) found.set(value.id, value);
    for (const child of Object.values(value)) walk(child);
  }
  walk(JSON.parse(match[1]));
  if (!found.size) throw new Error(`No models found: ${sourceUrl}`);
  for (const item of found.values()) {
    if (!/^\d+$/.test(item.price) || Number(item.price) < 1000)
      throw new Error(`Invalid price: ${item.id}`);
    const row = Object.fromEntries(
      [
        "id",
        "name",
        "rangeName",
        "price",
        "fuelcon",
        "fuelType",
        "transmission",
        "bodyType",
        "seats",
        "engine",
        "driveSystem",
      ].map((key) => [key, item[key]]),
    );
    const image = item.colourSelectors?.find((colour) => colour.colourImage)?.colourImage || {};
    rows.push({ ...row, sourceUrl, image });
  }
}
const date = new Date().toISOString().slice(0, 10);
const path = `/tmp/carpur-toyota-candidate-${date}.json`;
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(
  `${rows.length} model records saved to ${path}. Review prices, trim associations and source terms before replacing the dated snapshot.`,
);
