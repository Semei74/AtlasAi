import type { Page } from "@playwright/test";

export interface Credentials {
  email: string;
  password: string;
  displayName: string;
}

export function generateCredentials(): Credentials {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    email: `qa-${suffix}@test.local`,
    password: "AtlasPassQ7x9!v2",
    displayName: `QA User ${suffix.slice(0, 6)}`,
  };
}

export async function registerUserViaApi(page: Page, creds: Credentials): Promise<void> {
  const response = await page.request.post("http://localhost:3000/auth/register", {
    data: {
      email: creds.email,
      password: creds.password,
      displayName: creds.displayName,
    },
  });
  const body = await response.json();
  if (!response.ok()) {
    throw new Error(`Registration failed (${response.status()}): ${JSON.stringify(body)}`);
  }
}

export async function login(page: Page, creds: { email: string; password: string }): Promise<void> {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const emailField = page.locator("#field-email");
  const passwordField = page.locator("#field-password");
  const submitButton = page.locator('button[type="submit"]');

  await emailField.waitFor({ state: "visible", timeout: 10_000 });
  await emailField.fill(creds.email);
  await passwordField.fill(creds.password);

  await submitButton.click();

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}
