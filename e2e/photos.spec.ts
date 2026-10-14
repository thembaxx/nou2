import { test, expect } from "@playwright/test";
test.use({ deviceScaleFactor: 2, hasTouch: true });

test("modest devices receive sharp manufacturer images and keep buying options visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  await page.goto("/marketplace?q=Starlet");
  await page.getByRole("link", { name: "Model & Buying Options" }).first().click();
  const photo = page.locator(".gallery-photo");
  await expect(photo).toBeVisible();
  await expect
    .poll(
      () =>
        photo.evaluate(async (image: HTMLImageElement) => {
          if (!image.currentSrc || !image.complete || !image.naturalWidth) return 0;
          const original = new Image();
          original.src = image.currentSrc;
          try {
            await original.decode();
            return original.naturalWidth;
          } catch {
            return 0;
          }
        }),
      { timeout: 15000 },
    )
    .toBeGreaterThanOrEqual(640);
  const source = await photo.evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(decodeURIComponent(source)).toContain(".desktop.png");
  expect(source).not.toContain("thumbnail");
  expect(source).toContain("q=85");
  const response = await page.request.get(source, { headers: { Accept: "image/webp" } });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");
  await expect(page.getByRole("link", { name: /Request A Dealer Quote/ })).toBeVisible();
  await page.getByRole("button", { name: "Open full-screen photos" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(
      () =>
        page.locator(".inspection-photo").evaluate((image: HTMLImageElement) => image.currentSrc),
      { timeout: 15000 },
    )
    .toContain("q=90");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open full-screen photos" })).toBeFocused();
});

test("full-screen editorial photos support zoom, panning, touch pinch and keyboard reset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/vehicles/example-bmw");
  await page.getByRole("button", { name: "Open full-screen photos" }).click();
  const stage = page.getByLabel("Photo inspection area");
  await expect
    .poll(() =>
      page.locator(".inspection-photo").evaluate((image: HTMLImageElement) => image.currentSrc),
    )
    .toMatch(/-(2400|3200)\.webp$/);
  await page.getByRole("button", { name: "Zoom photo in" }).click();
  await expect(stage).toHaveAttribute("data-zoom", "1.50");
  const box = (await stage.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50, { steps: 4 });
  await page.mouse.up();
  await expect(page.locator(".photo-pan")).not.toHaveCSS(
    "transform",
    "matrix(1.5, 0, 0, 1.5, 0, 0)",
  );
  await page.keyboard.press("0");
  await expect(stage).toHaveAttribute("data-zoom", "1.00");
  const session = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 50, y, id: 1 },
      { x: x + 50, y, id: 2 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 100, y, id: 1 },
      { x: x + 100, y, id: 2 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => Number(await stage.getAttribute("data-zoom"))).toBeGreaterThan(1.5);
  await page.getByRole("button", { name: "Reset photo zoom" }).click();
  await expect(stage).toHaveAttribute("data-zoom", "1.00");
  await expect(page.getByRole("button", { name: "Next photo", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("photo inspection fits small screens and honours reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/vehicles/example-golf");
  await page.getByRole("button", { name: "Open full-screen photos" }).click();
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const duration = await page
    .locator(".inspection-photo")
    .evaluate((image) => parseFloat(getComputedStyle(image).animationDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
  await page.getByRole("button", { name: "Zoom photo in" }).click();
  await expect(page.getByLabel("Photo inspection area")).toHaveAttribute("data-zoom", "1.50");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("button", { name: "Open full-screen photos" })).toBeFocused();
});
