import { test, expect, APIRequestContext } from '@playwright/test';
import { getApiContext, baseParams } from '../../src/api/fixtures/request-factory';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

test.describe('Targeting, scheduling, and cache boundaries', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test('platform targeting: blocks delivered for ios are valid for that platform only', async () => {
    const slugs = ['home', 'menu'] as const;
    const payloads: Record<string, Set<string>> = {};

    for (const platform of ['ios', 'android'] as const) {
      for (const slug of slugs) {
        const res = await apiContext.get(`${process.env.CMS_BASE_URL}/api/content/v1/pages/${slug}`, {
          params: { ...baseParams, platform },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();

        for (const block of body.data.layout) {
          expect(block).toHaveProperty('blockType');
          expect(block.contractVersion).toBe(process.env.SUPPORTED_CONTRACT_VERSION);

          if (Array.isArray(block.supportedPlatforms)) {
            expect(
              block.supportedPlatforms,
              `block "${block.blockType}" delivered to ${platform} must declare ${platform} support`,
            ).toContain(platform);
          }
        }
        payloads[`${slug}:${platform}`] = new Set(body.data.layout.map((b: any) => b.blockType));
      }
    }

    const identical =
      payloads['home:ios'].size === payloads['home:android'].size &&
      [...payloads['home:ios']].every((t) => payloads['home:android'].has(t));
    expect(identical).toBe(true);
  });

  test('navigation destinations honor platform targeting', async () => {
    const res = await apiContext.get(`${process.env.CMS_BASE_URL}/api/content/v1/bootstrap`, {
      params: { ...baseParams, platform: 'android' },
    });
    const { data } = await res.json();

    for (const item of data.navigation?.items ?? []) {
      const dest = item.destination;
      expect(dest, `nav item "${item.label}" must have a usable destination`).not.toBeNull();
      expect(Array.isArray(dest.supportedPlatforms)).toBe(true);
      expect(dest.supportedPlatforms).toContain('android');
    }
  });

  test('nextChangeAt, when present, is a valid RFC 3339 timestamp', async () => {
    const endpoints = [
      '/api/content/v1/bootstrap',
      '/api/content/v1/pages/home',
      '/api/content/v1/pages/menu',
      '/api/content/v1/legal/privacy_policy',
    ];

    for (const path of endpoints) {
      const res = await apiContext.get(`${process.env.CMS_BASE_URL}${path}`, {
        params: { ...baseParams },
      });
      const body = await res.json();

      if (body.nextChangeAt !== undefined) {
        expect(body.nextChangeAt, `${path} nextChangeAt format`).toMatch(ISO_DATE_PATTERN);

        const expiry = new Date(body.nextChangeAt);
        expect(Number.isNaN(expiry.getTime()), `${path} nextChangeAt must parse`).toBe(false);
        expect(
          expiry.getTime(),
          `${path} nextChangeAt should not be in the past on a fresh response`,
        ).toBeGreaterThan(Date.now());
      } else {
        return (`${path}: no nextChangeAt delivered`);
      }
    }
  });
});