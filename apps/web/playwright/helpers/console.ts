import type { Page } from "@playwright/test";

export interface ConsoleCapture {
  consoleErrors: string[];
  pageErrors: Error[];
  pageErrorMessages: string[];
}

export function captureConsole(page: Page): ConsoleCapture {
  const capture: ConsoleCapture = {
    consoleErrors: [],
    pageErrors: [],
    pageErrorMessages: [],
  };

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      capture.consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    capture.pageErrors.push(err);
    capture.pageErrorMessages.push(err.message);
  });

  return capture;
}

const KNOWN_WARNING_PATTERNS = [
  /favicon/i,
  /ERR_ABORTED/,
  /404.*\/_next/,
  /Failed to load resource.*the server responded with a status of 404/,
  /Failed to load resource.*401/i,
  /Failed to load resource.*Unauthorized/i,
  /\.map/,
  /\/_next\/static\/chunks/,
  /webpack/i,
  /posthog/i,
  /sentry/i,
  /ERR_BLOCKED_BY_CLIENT/,
  /net::ERR_FAILED.*chrome-extension/,
  /Failed to load.*extension/,
  /Third-party cookie.*chrome-extension/,
  /Missing token.*tamagui/i,
  /Warning.*missing token/i,
  /duplicated Tamagui/i,
  /unexpected tailwind/i,
  /Google Maps API.*warning/i,
  /This page.*includes a password or credit card/i,
  /Autofill.*disabled/i,
  /Access to fetch.*has been blocked by CORS policy.*status: 401/i,
  /Access to fetch.*has been blocked by CORS policy.*status: 403/i,
  /Access to fetch at 'http:\/\/localhost:3000\/auth\/refresh'/,
  /ERR_CERT_DATE_INVALID/,
  /Failed to fetch RSC payload/i,
  /Falling back to browser navigation/i,
  /Fetch API cannot load/i,
  /due to access control checks/i,
];

export function filterKnownWarnings(errors: string[]): string[] {
  return errors.filter((msg) => {
    const isKnown = KNOWN_WARNING_PATTERNS.some((p) => p.test(msg));
    return !isKnown;
  });
}

export function assertNoCriticalErrors(
  capture: ConsoleCapture,
  knownPatterns?: RegExp[],
): void {
  const customPatterns = knownPatterns ?? [];
  const allPatterns = [...KNOWN_WARNING_PATTERNS, ...customPatterns];

  const errors = capture.consoleErrors.filter(
    (msg) => !allPatterns.some((p) => p.test(msg)),
  );

  const pageErrors = capture.pageErrors.filter(
    (err) => !allPatterns.some((p) => p.test(err.message)),
  );

  if (errors.length > 0) {
    throw new Error(`Unexpected console errors:\n${errors.join("\n")}`);
  }

  if (pageErrors.length > 0) {
    throw new Error(`Unexpected page errors:\n${pageErrors.map((e) => e.message).join("\n")}`);
  }
}
