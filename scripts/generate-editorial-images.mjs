// Rebuild licensed editorial derivatives from the original photographs, never upscale.
// Source attributions and licences: docs/photography.md.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const sources = {
  bmw: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&w=3200&q=95",
  mercedes: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&w=3200&q=95",
  golf: "https://upload.wikimedia.org/wikipedia/commons/0/0f/VW_Golf_GTI_TCR_1X7A6182.jpg",
  toyota:
    "https://upload.wikimedia.org/wikipedia/commons/4/43/2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl%2C_front_left.jpg",
};
const directory = await mkdtemp(join(tmpdir(), "carpur-editorial-"));
try {
  for (const [name, url] of Object.entries(sources)) {
    const original = join(directory, name);
    execFileSync("curl", [
      "--fail",
      "--location",
      "--retry",
      "2",
      "--max-time",
      "60",
      "--silent",
      "--show-error",
      url,
      "--output",
      original,
    ]);
    const meta = await sharp(original).metadata();
    for (const width of [320, 640, 960, 1600, 2400, 3200]) {
      if (meta.width < width) continue;
      await sharp(original)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({
          quality: width <= 640 ? 80 : width <= 960 ? 85 : 90,
          effort: 5,
        })
        .toFile(`public/images/${name}-${width}.webp`);
    }
    console.log(
      `${name}: generated responsive derivatives up to ${Math.min(3200, meta.width)}px from original source`,
    );
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
