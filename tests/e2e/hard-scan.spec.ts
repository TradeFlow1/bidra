import { test, expect, request } from '@playwright/test';

const requiredPublicRoutes = [
  '/',
  '/about',
  '/categories',
  '/contact',
  '/feedback',
  '/forgot-password',
  '/help',
  '/how-it-works',
  '/legal',
  '/legal/fees',
  '/legal/privacy',
  '/legal/prohibited-items',
  '/legal/terms',
  '/listings',
  '/listings?type=BUY_NOW',
  '/login',
  '/pricing',
  '/prohibited-items',
  '/register',
  '/reset-password',
  '/support',
  '/terms',
  '/watchlist',
];

const forbiddenProductionText = [
  'lorem ipsum',
  'todo:',
  'fixme',
  'localhost:3000',
  '127.0.0.1',
  'staging',
  'vercel.app',
];

function isSkippableHref(href: string) {
  const trimmed = href.trim();
  return trimmed === '' ||
    trimmed === '#' ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('sms:') ||
    trimmed.startsWith('javascript:');
}

function normalizeUrl(baseUrl: string, href: string) {
  try {
    return new URL(href, baseUrl);
  } catch {
    return null;
  }
}

function isInternalUrl(baseUrl: string, url: URL) {
  return url.origin === new URL(baseUrl).origin;
}

function shouldSkipInternalPath(pathname: string) {
  return pathname.startsWith('/api/') ||
    pathname === '/logout' ||
    pathname.startsWith('/_next/');
}

async function collectPageSignals(page: any, route: string) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', function (msg: any) {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', function (error: Error) {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', function (request: any) {
    const failure = request.failure();
    const url = request.url();
    const errorText = failure ? failure.errorText : 'unknown';
    const isCancelledRscPayload = url.indexOf('_rsc=') !== -1 && errorText.indexOf('ERR_ABORTED') !== -1;
    if (!url.includes('favicon.ico') && !url.includes('chrome-extension://') && !isCancelledRscPayload) {
      failedRequests.push(url + ' :: ' + errorText);
    }
  });

  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response, 'Expected a response for ' + route).not.toBeNull();
  expect(response!.status(), 'Route returned HTTP failure: ' + route).toBeLessThan(400);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(function () { return undefined; });

  const title = await page.title();
  expect(title.trim().length, 'Missing page title: ' + route).toBeGreaterThan(0);

  const metaDescription = await page.locator('meta[name="description"]').first().getAttribute('content').catch(function () { return null; });
  expect((metaDescription || '').trim().length, 'Missing meta description: ' + route).toBeGreaterThan(0);

  const hasHorizontalOverflow = await page.evaluate(function () {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalOverflow, 'Horizontal overflow on ' + route).toBe(false);

  const brokenImages = await page.evaluate(function () {
    return Array.from(document.images)
      .filter(function (img) { return img.currentSrc && (!img.complete || img.naturalWidth === 0); })
      .map(function (img) { return img.currentSrc || img.src; });
  });
  expect(brokenImages, 'Broken images on ' + route).toEqual([]);

  const bodyText = await page.locator('body').innerText().catch(function () { return ''; });
  const lowerBody = bodyText.toLowerCase();
  const leakedText = forbiddenProductionText.filter(function (needle) { return lowerBody.includes(needle); });
  expect(leakedText, 'Forbidden placeholder/dev text on ' + route).toEqual([]);

  expect(consoleErrors, 'Console errors on ' + route).toEqual([]);
  expect(pageErrors, 'Page errors on ' + route).toEqual([]);
  expect(failedRequests, 'Failed requests on ' + route).toEqual([]);
}

test.describe('Bidra hard live QA baseline', function () {
  test('required public routes are production-ready', async function ({ page }) {
    for (const route of requiredPublicRoutes) {
      await collectPageSignals(page, route);
    }
  });

  test('site has no broken or unsafe links from required public routes', async function ({ page, baseURL }) {
    expect(baseURL, 'baseURL is required').toBeTruthy();
    const discovered = new Map<string, string>();

    for (const route of requiredPublicRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.locator('a[href]').evaluateAll(function (anchors: HTMLAnchorElement[]) {
        return anchors.map(function (a) { return a.getAttribute('href') || ''; });
      });

      for (const href of hrefs) {
        if (isSkippableHref(href)) { continue; }
        const normalized = normalizeUrl(baseURL!, href);
        expect(normalized, 'Malformed href on ' + route + ': ' + href).not.toBeNull();
        if (!normalized) { continue; }

        const cleanUrl = normalized.origin + normalized.pathname + normalized.search;
        discovered.set(cleanUrl, route);

        const lowerHref = cleanUrl.toLowerCase();
        expect(lowerHref.includes('localhost'), 'Localhost link leaked on ' + route + ': ' + cleanUrl).toBe(false);
        expect(lowerHref.includes('127.0.0.1'), 'Loopback link leaked on ' + route + ': ' + cleanUrl).toBe(false);
      }
    }

    const api = await request.newContext({ ignoreHTTPSErrors: true });
    const failures: string[] = [];
    const urls = Array.from(discovered.keys()).sort();

    for (const url of urls) {
      const parsed = new URL(url);
      if (isInternalUrl(baseURL!, parsed) && shouldSkipInternalPath(parsed.pathname)) { continue; }

      try {
        const response = await api.get(url, { timeout: 20000, maxRedirects: 5 });
        const status = response.status();
        if (status >= 400 && status !== 401 && status !== 403 && status !== 405) {
          failures.push(status + ' ' + url + ' found on ' + discovered.get(url));
        }
      } catch (error: any) {
        failures.push('REQUEST_FAILED ' + url + ' found on ' + discovered.get(url) + ' :: ' + error.message);
      }
    }

    expect(failures).toEqual([]);
  });
});
