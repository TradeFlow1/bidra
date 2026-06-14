import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.MARKETPLACE_BASE_URL || "http://127.0.0.1:3100";

async function expectNoNextError(page: Page) {
  await expect(page.locator("text=Application error")).toHaveCount(0);
  await expect(page.locator("text=Something went wrong")).toHaveCount(0);
  await expect(page.locator("text=PrismaClientKnownRequestError")).toHaveCount(0);
  await expect(page.locator("text=does not exist in the current database")).toHaveCount(0);
}

test.describe("Bidra marketplace launch smoke", () => {
  test("public marketplace routes load", async ({ page }) => {
    for (const route of ["/", "/listings", "/auth/login"]) {
      const response = await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(500);
      await expectNoNextError(page);
    }
  });

  test("protected routes redirect logged-out visitors", async ({ page }) => {
    for (const route of ["/account", "/messages", "/orders", "/watchlist", "/admin"]) {
      const response = await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(500);
      expect(page.url(), route).toContain("/auth/login");
      await expectNoNextError(page);
    }
  });

  test("at least one active listing detail page opens", async ({ page }) => {
    const response = await page.goto(baseUrl + "/listings", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);
    await expectNoNextError(page);

    const links = await page.locator('a[href^="/listings/"]').evaluateAll((nodes) =>
      nodes
        .map((node) => node.getAttribute("href") || "")
        .filter((href) => href && !href.startsWith("/listings/c/") && href !== "/listings")
    );

    expect(links.length, "Expected at least one listing detail link on /listings").toBeGreaterThan(0);

    const detailUrl = links[0];
    const detailResponse = await page.goto(baseUrl + detailUrl, { waitUntil: "domcontentloaded" });
    expect(detailResponse?.status(), detailUrl).toBeLessThan(500);
    await expectNoNextError(page);
  });
});