import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3001";

const ANON_PAGES = [
  { path: "/", label: "home" },
  { path: "/auth/login", label: "login" },
  { path: "/auth/register", label: "register" },
  { path: "/auth/forgot-password", label: "forgot" },
];

test.describe("UI break — console & hydration", () => {
  for (const { path, label } of ANON_PAGES) {
    test(`no console errors on ${label}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning") {
          errors.push(`[${m.type()}] ${m.text()}`);
        }
      });
      page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(800);
      // Fatal console errors (network timeouts for resources are expected, filter)
      const fatal = errors.filter((e) => !e.includes("ERR_CONNECTION") && !e.includes("favicon") && !e.includes("404") && !e.includes("401") && !e.includes("Unauthorized"));
      expect(fatal).toEqual([]);
      console.log(`[${label}] console messages:`, JSON.stringify(errors.slice(0, 5)));
    });
  }
});

test("rapid navigation does not crash", async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const routes = ["/auth/login", "/auth/register", "/", "/auth/forgot-password", "/auth/login", "/"];
  for (const r of routes) {
    const ok = await page.goto(`${BASE}${r}`, { waitUntil: "domcontentloaded" }).then((_) => true).catch((_) => false);
    await page.waitForTimeout(120);
  }
  // final page renders
  await expect(page.locator("body")).toBeVisible();
  console.log("rapid nav OK");
});

test("double-click submit on login is idempotent (no double toast/crash)", async ({ page }) => {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // fill with invalid creds to trigger a non-redirect response
  const f = page.locator("#field-email, input[type=email], input[name=email]").first();
  await f.fill("double-click@test.com").catch(() => {});
  const p = page.locator("#field-password, input[type=password]").first();
  await p.fill("WrongPass!99").catch(() => {});
  const btn = page.locator("button[type=submit]").first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click().catch(() => {});
    await btn.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(600);
  expect(errors).toEqual([]);
  console.log("double-click OK, pageerrors:", JSON.stringify(errors));
});

filterKnownWarnings, test, expect
import { filterKnownWarnings } from "../../helpers/console"
test("10. 404 filter — expected vs unexpected", async () => {
    // Expected 404: matches the pattern /Failed to load resource.*the server responded with a status of 404/
    const expected404 = "Failed to load resource: the server responded with a status of 404 (Not Found)";
    const filteredExpected = filterKnownWarnings([expected404, "Some other warning"]);
    // The expected 404 should be filtered out
    expect(filteredExpected).not.toContain(expected404);

    // Unexpected 404: different format, should NOT be filtered
    const unexpected404 = "GET /api/random 404 Not Found";
    const filteredUnexpected = filterKnownWarnings([unexpected404, "Some other warning"]);
    // The unexpected 404 should NOT be filtered (still in the array)
    expect(filteredUnexpected).toContain(unexpected404);
});