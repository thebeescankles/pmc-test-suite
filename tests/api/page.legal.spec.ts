// tests/api/legal.contract.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';
import { getApiContext, baseParams } from '../../src/api/fixtures/request-factory';
import { isContractCompatible } from '../../src/api/contracts/version-policy';

test.describe('Legal delivery', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  for (const platform of ['ios', 'android', 'web'] as const) {
    test(`privacy_policy returns valid legal content [${platform}]`, async () => {
      const response = await apiContext.get('/api/content/v1/legal/privacy_policy', {
        params: { ...baseParams },
      });

      expect(response.status()).toBe(200);
      const envelope = await response.json();

      // Envelope integrity
      expect(envelope).toHaveProperty('contractVersion');
      expect(typeof envelope.contractVersion).toBe('string');
      expect(
        isContractCompatible(envelope.contractVersion, process.env.SUPPORTED_CONTRACT_VERSION),
        `contractVersion "${envelope.contractVersion}" must be compatible with ${process.env.SUPPORTED_CONTRACT_VERSION}`,
      ).toBe(true);

      expect(envelope.data).toBeDefined();

      expect(typeof envelope.data).toBe('object');
      expect(Object.keys(envelope.data).length).toBeGreaterThan(0);
       if (envelope.resolvedContext) {
        expect(envelope.resolvedContext.platform).toBe(platform);
        expect(envelope.resolvedContext.authenticationState).toBe(baseParams.audience);
      }
    });
  }

  test('privacy_policy with unknown key returns a documented error shape', async () => {
    // Safe 404
    const res = await apiContext.get('/api/content/v1/legal/this-key-does-not-exist', {
      params: { ...baseParams },
    });

    expect([404, 400]).toContain(res.status());

    const body = await res.json();
    expect(body.errors !== undefined || body.error !== undefined).toBe(true);
  });
});