import { test, expect } from "@playwright/test";
const stamp = Date.now();
const password = "Carpur-test-only-long-password!";
const sellerEmail = `seller-${stamp}@carpur.example`;
const buyerEmail = `buyer-${stamp}@carpur.example`;
test("buyer discovery, filtering, cost tools and persistent browser garage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Find Your Next Car/i })).toBeVisible();
  await page.goto("/marketplace?inventory=examples");
  await expect(page.locator("article")).toHaveCount(4);
  await page.getByLabel("Maximum price").selectOption("400000");
  await expect(page.locator("article")).toHaveCount(2);
  await page.getByLabel("Search", { exact: true }).fill("golf");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: /Save to garage/i }).click();
  await page.goto("/garage");
  await expect(page.getByRole("heading", { name: /Volkswagen Golf GTI/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Volkswagen Golf GTI/i })).toBeVisible();
  await page.goto("/vehicles/example-bmw");
  await expect(
    page.getByText("This example is not for sale and cannot receive enquiries."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Enquire with seller/i })).toHaveCount(0);
  await page.getByLabel("Balloon / residual payment (R)").fill("20000");
  await page.getByRole("button", { name: /5 years/i, exact: true }).click();
  await expect(page.getByText("5-year net ownership cost")).toBeVisible();
  await page.goto("/compare");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Vehicle 1", { exact: true }).selectOption("example-bmw");
  await page.getByLabel("Vehicle 2", { exact: true }).selectOption("example-bmw");
  await expect(page.getByText("Choose two different vehicles.")).toBeVisible();
});
test("private and dealership listing lifecycle, ownership controls and inbox delivery", async ({
  browser,
}) => {
  const seller = await browser.newContext();
  const sp = await seller.newPage();
  let listingId = "";
  try {
    await sp.goto("/sign-in");
    await sp.getByRole("button", { name: /New to Carpur\? Create an account/i }).click();
    await sp.getByLabel("Your name").fill("Carpur QA Seller");
    await sp.getByLabel("Email", { exact: true }).fill(sellerEmail);
    await sp.getByLabel("Password", { exact: true }).fill(password);
    await sp.getByRole("button", { name: /Create account/i, exact: true }).click();
    await expect(sp).toHaveURL(/dashboard/);
    await sp.goto("/sell");
    await sp.getByLabel("Make, model & trim").fill("Carpur QA TEST — NOT FOR SALE");
    await sp.getByLabel("Make", { exact: true }).fill("QA");
    await sp.getByLabel("Asking price (R)").fill("1000");
    await sp.getByLabel("Mileage (km)").fill("5000");
    await sp.getByLabel("City / suburb").fill("QA Test");
    await sp.getByLabel("Seller or dealership name").fill("Carpur QA Seller");
    await sp
      .getByLabel("Describe condition, service history and features")
      .fill(
        "Internal verification fixture. This is not a vehicle offered for sale. This listing will be removed immediately after testing.",
      );
    await sp.getByLabel("Upload photos").setInputFiles("public/images/bmw.webp");
    await expect(sp.getByRole("button", { name: /Remove photo 1/i })).toBeVisible();
    await sp.getByRole("button", { name: /Save as draft/i, exact: true }).click();
    await expect(sp).toHaveURL(/dashboard/);
    const editHref = await sp
      .getByRole("link", { name: /Edit/i, exact: true })
      .first()
      .getAttribute("href");
    listingId = new URL(editHref!, "http://localhost").searchParams.get("id")!;
    await sp.goto(`/vehicles/${listingId}`);
    await expect(sp.getByRole("heading", { name: /A Different/i })).toBeVisible();
    await sp.goto(`/sell?id=${listingId}`);
    await sp.getByLabel("Seller category").selectOption("DEALER");
    await sp.getByRole("button", { name: /Save & publish/i, exact: true }).click();
    await expect(sp).toHaveURL(/dashboard/);
    const buyer = await browser.newContext();
    const bp = await buyer.newPage();
    try {
      await bp.goto("/sign-in");
      await bp.getByRole("button", { name: /New to Carpur\? Create an account/i }).click();
      await bp.getByLabel("Your name").fill("Carpur QA Buyer");
      await bp.getByLabel("Email", { exact: true }).fill(buyerEmail);
      await bp.getByLabel("Password", { exact: true }).fill(password);
      await bp.getByRole("button", { name: /Create account/i, exact: true }).click();
      await expect(bp).toHaveURL(/dashboard/);
      const blocked = await bp.request.patch(`/api/listings/${listingId}`, {
        headers: { origin: process.env.BASE_URL || "http://localhost:3000" },
        data: { status: "SOLD" },
      });
      expect(blocked.status()).toBe(404);
      await bp.goto(`/vehicles/${listingId}`);
      await expect(bp.getByText("Dealership listing")).toBeVisible();
      await bp.getByRole("button", { name: /Save to garage/i }).click();
      await expect(bp.getByRole("button", { name: /Remove from garage/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await bp.goto("/garage");
      await expect(
        bp.getByRole("heading", { name: /Carpur QA TEST — NOT FOR SALE/i }),
      ).toBeVisible();
      await bp.goto(`/vehicles/${listingId}`);
      await bp.getByRole("button", { name: /Enquire with seller/i }).click();
      await bp
        .getByLabel("Your message")
        .fill("This is an internal QA enquiry verifying inbox delivery, not a purchase request.");
      await bp.getByRole("checkbox").check();
      await bp.getByRole("button", { name: /Send enquiry/i, exact: true }).click();
      await expect(bp.getByText("Your enquiry is now in the seller’s Carpur inbox.")).toBeVisible();
      await sp.goto("/dashboard");
      await expect(
        sp.getByText(
          "This is an internal QA enquiry verifying inbox delivery, not a purchase request.",
        ),
      ).toBeVisible();
      await sp
        .getByRole("button", { name: /Mark sold/i, exact: true })
        .first()
        .click();
      await expect(sp.getByText(/R\s*1\s*000.*sold/)).toBeVisible();
      const soldResponse = await bp.request.get(`/vehicles/${listingId}`);
      expect(await soldResponse.text()).toContain("A Different");
      await bp.goto(`/vehicles/${listingId}`);
      await expect(bp.getByRole("heading", { name: /A Different/i })).toBeVisible();
    } finally {
      await buyer.close();
    }
  } finally {
    if (listingId) {
      const response = await sp.request.delete(`/api/listings/${listingId}`, {
        headers: { origin: process.env.BASE_URL || "http://localhost:3000" },
      });
      expect([204, 404]).toContain(response.status());
    }
    await seller.close();
  }
});
test("mobile navigation and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: /Open navigation/i }).click();
  await page
    .getByRole("navigation", { name: /Mobile navigation/i })
    .getByRole("link", { name: /New Cars/i, exact: true })
    .click();
  await expect(page).toHaveURL(/marketplace/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("installable manifest and safe offline fallback", async ({ page, context }) => {
  await page.goto("/");
  const manifest = await page.request.get("/manifest.webmanifest");
  const data = await manifest.json();
  expect(data.display).toBe("standalone");
  expect(data.icons.some((icon: { sizes: string }) => icon.sizes === "512x512")).toBe(true);
  await page.waitForFunction(
    async () => (await navigator.serviceWorker.getRegistrations()).length > 0,
  );
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const entries = await Promise.all(
      names.map(async (name) =>
        (await (await caches.open(name)).keys()).map((request) => new URL(request.url).pathname),
      ),
    );
    return entries.flat();
  });
  expect(cached).not.toContain("/dashboard");
  expect(cached).not.toContain("/sign-in");
  await context.setOffline(true);
  try {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /You’re offline\./i })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
