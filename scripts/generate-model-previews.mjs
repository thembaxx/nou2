// Offline-friendly views rendered from the very same licensed GLBs as the interactive studio.
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1800, height: 1500 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { get: () => 16 });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 16 });
  });
  await page.goto(process.env.BASE_URL || "http://localhost:3000");
  await page.addStyleTag({
    content:
      ".shopping-hero-inner{display:block}.shopping-hero-copy{display:none}.shopping-hero-studio,.explorer{width:1602px}.explorer-stage{height:1000px}",
  });
  const stage = page.locator(".explorer-stage");
  for (const id of ["bmw-m3-e30", "ferrari-458"]) {
    await page.getByLabel("3D car model", { exact: true }).selectOption(id);
    await stage.waitFor({ state: "visible" });
    await page.waitForFunction(
      () => document.querySelector(".explorer-stage")?.dataset.sceneReady === "true",
      null,
      { timeout: 60000 },
    );
    for (let index = 0; index < 8; index++) {
      const angle = -Math.PI + ((index + 0.5) / 8) * Math.PI * 2;
      await page.getByLabel("Rotate model", { exact: true }).fill(angle.toFixed(2));
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const bounds = await stage.boundingBox();
      if (!bounds) throw new Error("The real-car stage is unavailable");
      const buffer = await page.screenshot({ clip: bounds, timeout: 60000 });
      for (const width of [800, 1600]) {
        await sharp(buffer)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: width === 1600 ? 90 : 85, effort: 5 })
          .toFile(`public/models/${id}-view-${index}${width === 1600 ? "-1600" : ""}.webp`);
      }
      console.log(`${id}: view ${index + 1}/8`);
    }
    console.log(`${id}: rendered 8 actual-model views at 800px and 1600px`);
  }
} finally {
  await browser.close();
}
