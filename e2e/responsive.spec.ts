import { test, expect } from "@playwright/test";
async function mockHardware(
  page: import("@playwright/test").Page,
  memory: number,
  cores: number,
  saveData = false,
) {
  await page.addInitScript(
    ({ memory, cores, saveData }) => {
      Object.defineProperty(navigator, "deviceMemory", { configurable: true, get: () => memory });
      Object.defineProperty(navigator, "hardwareConcurrency", {
        configurable: true,
        get: () => cores,
      });
      const connection = new EventTarget();
      Object.assign(connection, { saveData, effectiveType: saveData ? "3g" : "4g" });
      Object.defineProperty(navigator, "connection", { configurable: true, get: () => connection });
    },
    { memory, cores, saveData },
  );
}
test("layouts fit phones, tablets and wide desktops", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockHardware(page, 4, 4);
  for (const width of [320, 360, 390, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/marketplace?inventory=examples",
      "/affordability",
      "/compare",
      "/vehicles/example-bmw",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      expect(widths.document, `${path} overflows at ${width}px`).toBeLessThanOrEqual(
        widths.viewport,
      );
    }
  }
  expect(errors).toEqual([]);
});
test("constrained phones keep forecasts usable with lightweight visuals", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockHardware(page, 2, 2, true);
  await page.setExtraHTTPHeaders({ "Save-Data": "on" });
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-visual-tier", "reduced");
  await expect(page.getByLabel("Visual quality")).toBeEnabled({ timeout: 15000 });
  await expect(page.locator(".real-model-poster")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto("/affordability");
  await expect(page.locator("[data-chart-kind=basic]")).toBeVisible();
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0);
  await expect(page.getByLabel("Net monthly income (R)")).toHaveCSS("font-size", "16px");
  await page.getByLabel("Net monthly income (R)").fill("0");
  await expect(page.getByText("Your estimated outgoings exceed your net income.")).toBeVisible();
  await page.getByLabel("Visual quality").selectOption("reduced");
  await page.reload();
  await expect(page.getByLabel("Visual quality")).toHaveValue("reduced");
  await page.goto("/marketplace?inventory=examples");
  await page.getByLabel("Search", { exact: true }).fill("golf");
  await expect(page.locator("article")).toHaveCount(1);
  const save = await page.getByRole("button", { name: /Save to garage/i }).boundingBox();
  expect(save?.height).toBeGreaterThanOrEqual(44);
  expect(save?.width).toBeGreaterThanOrEqual(44);
});
test("capable devices enhance visible charts and retain a battery-saving override", async ({
  page,
}) => {
  await mockHardware(page, 16, 16);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/affordability");
  await expect(page.locator("html")).toHaveAttribute("data-visual-tier", "enhanced");
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0);
  await page.locator("[data-chart-kind]").scrollIntoViewIfNeeded();
  await expect(page.locator(".recharts-wrapper")).toBeVisible();
  await page.getByLabel("Visual quality").selectOption("reduced");
  await expect(page.locator("html")).toHaveAttribute("data-visual-tier", "reduced");
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0);
  await expect(page.locator("[data-chart-kind=basic]")).toBeVisible();
});
test("reduced motion and unsupported WebGL preserve the complete vehicle page", async ({
  page,
}) => {
  await mockHardware(page, 16, 16);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    Object.defineProperty(window, "WebGL2RenderingContext", {
      configurable: true,
      value: undefined,
    }),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");

  await expect(
    page.getByText(
      "3D is unavailable in this browser. The actual-model preview and all shopping tools remain available.",
    ),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto("/vehicles/example-bmw");
  await expect(page.getByText(/A verified matching 3D asset is not available/)).toBeVisible();
  await expect(page.getByLabel("Vehicle price (R)")).toBeVisible();
});

test("real catalogue models expose provenance, buying options and persistent themes", async ({
  page,
}) => {
  await mockHardware(page, 2, 2, true);
  await page.goto("/marketplace");
  await expect(page.locator("article")).toHaveCount(44);
  await page.getByLabel("Search", { exact: true }).fill("Starlet");
  await expect(page.locator("article")).toHaveCount(5);
  await page.getByRole("link", { name: "Model & Buying Options" }).first().click();
  const quote = page.getByRole("link", { name: /Request A Dealer Quote/i });
  await expect(quote).toHaveAttribute("href", "https://www.toyota.co.za/ranges/starlet");
  await expect(page.getByRole("button", { name: /Enquire with seller/i })).toHaveCount(0);
  await page.getByLabel("Appearance", { exact: true }).selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /Switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /Save to garage/i }).click();
  await page.goto("/garage");
  await expect(page.locator("article")).toHaveCount(1);
});
test("lightweight real-model previews rotate without loading WebGL", async ({ page }) => {
  await mockHardware(page, 2, 2, true);
  await page.goto("/");
  await page.getByLabel("3D car model", { exact: true }).selectOption("bmw-m3-e30");
  const preview = page.locator(".real-model-poster img");
  await expect(preview).toHaveAttribute("src", /bmw-m3-e30-view-/);
  const before = await preview.getAttribute("src");
  await page.getByLabel("Rotate model", { exact: true }).fill("1.5");
  await expect(preview).not.toHaveAttribute("src", before!);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "View Interior" })).toBeDisabled();
});
test("enhanced 3D renders, responds to drag and suspends while offscreen", async ({ page }) => {
  await mockHardware(page, 16, 16);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  const stage = page.locator(".explorer-stage");
  await expect(stage).toHaveAttribute("data-scene-ready", "true", { timeout: 30000 });
  await expect(stage.locator("canvas")).toBeVisible();
  const slider = page.getByLabel("Rotate model", { exact: true });
  const before = await slider.inputValue();
  const box = await stage.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 70, box!.y + box!.height / 2, { steps: 5 });
  await page.mouse.up();
  expect(await slider.inputValue()).not.toBe(before);
  await page.getByRole("button", { name: "View Interior" }).click();
  await expect(page.getByRole("button", { name: "Exterior View" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByLabel("3D car model", { exact: true }).selectOption("bmw-m3-e30");
  await expect(stage).toHaveAttribute("data-scene-ready", "true", { timeout: 30000 });
  await page.getByLabel("Appearance", { exact: true }).scrollIntoViewIfNeeded();
  await expect(stage.locator("canvas")).toHaveCount(0);
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-scene-ready", "true", { timeout: 30000 });
  await page.getByLabel("Visual quality").selectOption("reduced");
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("custom electric forecasts retain their units when the purchase price changes", async ({
  page,
}) => {
  await mockHardware(page, 2, 2, true);
  await page.goto("/affordability");
  await page.getByRole("combobox", { name: "Vehicle", exact: true }).selectOption("custom");
  await page.getByLabel("Custom powertrain", { exact: true }).selectOption("Electric");
  await page.getByLabel("Vehicle price (R)", { exact: true }).fill("450000");
  await expect(page.getByLabel("Consumption (kWh / 100 km)")).toHaveValue("18");
  await expect(page.getByLabel("Fuel / Energy Price (R/kWh)")).toHaveValue("4");
});
