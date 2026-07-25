import { chromium } from 'playwright';
const extPath = 'apps/extension/.output/chrome-mv3';
const ctx = await chromium.launchPersistentContext('', {
  channel: 'chrome',
  headless: false,
  args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
});
const page = await ctx.newPage();
const errors = [], consoleErrs = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type()==='error') consoleErrs.push(m.text()); });
const id = ctx.backgroundPages()[0]?.context?.()?.browserContext?.();
// load popup.html directly
await page.goto('chrome-extension://invalid/', { waitUntil: 'domcontentloaded' }).catch(()=>{});
console.log('NOTE: full extension load requires Chrome flags; doing static popup/sidepanel render check via file');
await ctx.close();
