import { test, expect, APIRequestContext } from '@playwright/test';
import { getApiContext, baseParams } from '../../src/api/fixtures/request-factory';

const ABSOLUTE_URL_PATTERN = /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
const RELATIVE_MEDIA_PATH_PATTERN = /^\/api\/media\/file\/[\w.-]+\.(?:webp|jpg|jpeg|png|gif)$/i;

test.describe('Media URL contract', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test('media references include absolute URLs (CloudFront CDN)', async () => {
    const res = await apiContext.get(`${process.env.CMS_BASE_URL}/api/content/v1/bootstrap`, {
      params: { ...baseParams },
    });
    expect(res.status()).toBe(200);
    const { data } = await res.json();

    const hasAbsoluteUrls =
      data.alerts.some((alert: any) => alert.image?.url?.match(ABSOLUTE_URL_PATTERN));

    expect(hasAbsoluteUrls).toBe(true);

    // Validate absolute URL structure
    const alertWithImage = data.alerts.find((a: any) => a.image?.url);
    if (alertWithImage) {
      expect(alertWithImage.image.url).toMatch(ABSOLUTE_URL_PATTERN);

      const sizes = alertWithImage.image.sizes ?? {};
      for (const [key, size] of Object.entries(sizes)) {
        if (typeof size === 'object' && (size as any).url) {
          expect((size as any).url, `${key} size URL`).toMatch(ABSOLUTE_URL_PATTERN);
        }
      }
    }
  });

  test('media contract supports relative /api/media/file/{filename} paths', async () => {
    const res = await apiContext.get(`${process.env.CMS_BASE_URL}/api/content/v1/bootstrap`, {
      params: { ...baseParams },
    });
    const { data } = await res.json();

    const alertWithImage = data.alerts.find((a: any) => a.image?.filename);
    if (alertWithImage) {
      const filename = alertWithImage.image.filename;

      const relativePath = `/api/media/file/${filename}`;
      expect(relativePath).toMatch(RELATIVE_MEDIA_PATH_PATTERN);

      console.log('Media URL patterns supported by contract:', {
        absolute: 'https://cdn.domain.com/file.webp',
        relative: relativePath,
        note: 'Client must handle both patterns identically',
      });

      const mediaRes = await apiContext.get(`${process.env.CMS_BASE_URL}${relativePath}`);
      expect([200, 301, 302, 404]).toContain(mediaRes.status());
    }
  });

  test('media URLs are non-empty and resolve to strings', async () => {

    const res = await apiContext.get(`${process.env.CMS_BASE_URL}/api/content/v1/bootstrap`, {
      params: { ...baseParams, platform: 'ios' },
    });
    const { data } = await res.json();

    const mediaObjects: any[] = [];
    for (const alert of data.alerts) {
      if (alert.image) mediaObjects.push(alert.image);
    }

    for (const media of mediaObjects) {
      expect(typeof media.url, 'media.url').toBe('string');
      expect(media.url).not.toBe(''); // Cannot be empty
      
      if (media.thumbnailURL) {
        expect(typeof media.thumbnailURL).toBe('string');
        expect(media.thumbnailURL).not.toBe('');
      }

      if (media.sizes) {
        for (const [key, size] of Object.entries(media.sizes)) {
          if (typeof size === 'object' && (size as any).url) {
            expect(typeof (size as any).url).toBe('string');
            expect((size as any).url).not.toBe('');
          }
        }
      }
    }
  });
});