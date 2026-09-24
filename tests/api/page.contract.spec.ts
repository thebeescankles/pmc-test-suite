import { test, expect, APIRequestContext } from '@playwright/test';
import {
  buildRequestParams,
  disposeApiContext,
  expectValidNextChangeAt,
  getApiContext,
  getCmsResponse,
  supportedBlockTypes,
} from '../../src/api/fixtures/request-factory';

test.describe('Page delivery contract', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test.afterAll(async () => {
    await disposeApiContext();
  });

  for (const slug of ['home', 'menu'] as const) {
    test(`${slug} returns coherent metadata and renderable blocks`, async () => {
      const response = await getCmsResponse(`/api/content/v1/pages/${slug}`, buildRequestParams(), apiContext);

      expect(response.status()).toBe(200);

      const envelope = await response.json();
      const page = envelope.data;

      expect(page).toHaveProperty('slug', slug);
      expect(page).toHaveProperty('title');
      expect(typeof page.title).toBe('string');
      expect(page.title).not.toBe('');
      expect(page).toHaveProperty('updatedAt');
      expect(typeof page.indexable).toBe('boolean');
      expect(Array.isArray(page.layout)).toBe(true);

      for (let i = 0; i < page.layout.length; i++) {
        const block = page.layout[i];
        expect(block, `layout[${i}]`).toHaveProperty('blockType');
        expect(supportedBlockTypes).toContain(block.blockType);
        expect(block.contractVersion).toBe(process.env.SUPPORTED_CONTRACT_VERSION);

        if (block.supportedPlatforms) {
          expect(block.supportedPlatforms).toContain(process.env.CMS_PLATFORM ?? 'ios');
        }
      }

      expect(envelope.resolvedContext.platform).toBe(process.env.CMS_PLATFORM ?? 'ios');
    });
  }

  test('home page exposes a valid nextChangeAt boundary when present', async () => {
    const response = await getCmsResponse('/api/content/v1/pages/home', buildRequestParams(), apiContext);
    const envelope = await response.json();

    if (envelope.nextChangeAt) {
      expectValidNextChangeAt(envelope.nextChangeAt);
    }
  });
});