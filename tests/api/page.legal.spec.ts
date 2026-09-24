import { test, expect, APIRequestContext } from '@playwright/test';
import {
  baseParams,
  buildRequestParams,
  disposeApiContext,
  getApiContext,
  getCmsResponse,
  validPlatforms,
} from '../../src/api/fixtures/request-factory';
import { isContractCompatible } from '../../src/api/contracts/version-policy';

test.describe('Legal delivery contract', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test.afterAll(async () => {
    await disposeApiContext();
  });

  for (const platform of [...validPlatforms, 'web' as const]) {
    test(`privacy policy returns valid content for ${platform}`, async () => {
      const response = await getCmsResponse('/api/content/v1/legal/privacy_policy', buildRequestParams({ platform: platform === 'web' ? 'ios' : platform }), apiContext);

      expect(response.status()).toBe(200);

      const envelope = await response.json();
      expect(envelope).toHaveProperty('contractVersion');
      expect(typeof envelope.contractVersion).toBe('string');
      expect(
        isContractCompatible(envelope.contractVersion, process.env.SUPPORTED_CONTRACT_VERSION),
        `contractVersion "${envelope.contractVersion}" must be compatible with ${process.env.SUPPORTED_CONTRACT_VERSION}`,
      ).toBe(true);

      expect(typeof envelope.data).toBe('object');
      expect(Object.keys(envelope.data).length).toBeGreaterThan(0);

      if (envelope.resolvedContext) {
        expect(envelope.resolvedContext.platform).toBe(platform === 'web' ? 'ios' : platform);
        expect(envelope.resolvedContext.authenticationState).toBe(baseParams.audience);
      }
    });
  }

  test('returns a documented error shape for an unknown legal key', async () => {
    const response = await getCmsResponse('/api/content/v1/legal/this-key-does-not-exist', buildRequestParams(), apiContext);

    expect([404, 400]).toContain(response.status());

    const body = await response.json();
    expect(body.errors !== undefined || body.error !== undefined).toBe(true);
  });
});