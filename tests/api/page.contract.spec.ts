// tests/api/pages.contract.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';
import { getApiContext, baseParams, supportedBlockTypes } from '../../src/api/fixtures/request-factory';

test.describe('Dynamic page delivery', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  for (const slug of ['home', 'menu'] as const) {
    test(`${slug} page returns coherent metadata and renderable layout`, async ({}) => {
      const response = await apiContext.get(`/api/content/v1/pages/${slug}`, {
        params: { ...baseParams },
      });

      expect(response.status()).toBe(200);
      const envelope = await response.json();
      const page = envelope.data;

      // Metadata coherence
      expect(page).toHaveProperty('slug');
      expect(page.slug).toBe(slug);
      expect(page).toHaveProperty('title');
      expect(typeof page.title).toBe('string');
      expect(page.title).not.toBe('');
      expect(page).toHaveProperty('updatedAt');
      expect(typeof page.indexable).toBe('boolean');

      // Layout 
      expect(page.layout).toBeDefined();
      expect(Array.isArray(page.layout)).toBe(true);

      if (page.layout.length === 0) {
        console.warn(`Warning: ${slug} page has no layout blocks`);
      } else {
        for (let i = 0; i < page.layout.length; i++) {
          const block = page.layout[i];
          
          expect(block, `layout[${i}]`).toHaveProperty('blockType');
          expect(supportedBlockTypes).toContain(block.blockType);
          
          expect(block.contractVersion).toBe(process.env.SUPPORTED_CONTRACT_VERSION);

          // Platform targeting
          if (block.supportedPlatforms) {
            expect(block.supportedPlatforms).toContain( process.env.CMS_PLATFORM );
          }
        }
      }
      expect(envelope.resolvedContext.platform).toBe(process.env.CMS_PLATFORM );
    });
  }
});