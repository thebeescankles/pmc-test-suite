import { test, expect, APIRequestContext } from '@playwright/test';
import {
  absoluteUrlPattern,
  buildRequestParams,
  disposeApiContext,
  getApiContext,
  getCmsResponse,
  relativeMediaPathPattern,
} from '../../src/api/fixtures/request-factory';

test.describe('Media URL contract', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test.afterAll(async () => {
    await disposeApiContext();
  });

  test('media references use absolute URLs when provided', async () => {
    const response = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams(), apiContext);
    expect(response.status()).toBe(200);

    const { data } = await response.json();
    const image = data.alerts.find((alert: any) => alert.image?.url);

    expect(image).toBeTruthy();
    expect(image.image.url).toMatch(absoluteUrlPattern);

    const sizes = image.image.sizes ?? {};
    for (const [key, value] of Object.entries(sizes)) {
      if (typeof value === 'object' && (value as any).url) {
        expect((value as any).url, `${key} size URL`).toMatch(absoluteUrlPattern);
      }
    }
  });

  test('supports relative media paths from the public payload contract', async () => {
    const response = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams(), apiContext);
    const { data } = await response.json();
    const image = data.alerts.find((alert: any) => alert.image?.filename);

    expect(image).toBeTruthy();

    const relativePath = `/api/media/file/${image.image.filename}`;
    expect(relativePath).toMatch(relativeMediaPathPattern);

    const mediaResponse = await apiContext.get(`${process.env.CMS_BASE_URL}${relativePath}`);
    expect([200, 301, 302, 404]).toContain(mediaResponse.status());
  });

  test('keeps media values as non-empty strings', async () => {
    const response = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams({ platform: 'ios' }), apiContext);
    const { data } = await response.json();

    const mediaObjects = data.alerts
      .filter((alert: any) => alert.image)
      .map((alert: any) => alert.image);

    expect(mediaObjects.length).toBeGreaterThan(0);

    for (const media of mediaObjects) {
      expect(typeof media.url).toBe('string');
      expect(media.url).not.toBe('');

      if (media.thumbnailURL) {
        expect(typeof media.thumbnailURL).toBe('string');
        expect(media.thumbnailURL).not.toBe('');
      }

      if (media.sizes) {
        for (const [, size] of Object.entries(media.sizes)) {
          if (typeof size === 'object' && (size as any).url) {
            expect(typeof (size as any).url).toBe('string');
            expect((size as any).url).not.toBe('');
          }
        }
      }
    }
  });
});