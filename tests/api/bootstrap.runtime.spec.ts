// tests/api/bootstrap.contract.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';
import { getApiContext, disposeApiContext } from '../../src/api/fixtures/request-factory';
import { isContractCompatible } from '../../src/api/contracts/version-policy';

test.describe('CMS Contract Validation', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test.afterAll(async () => {
    await disposeApiContext();
  });

  test('returns valid contract version 1.1 in bootstrap response', async () => {
    const response = await apiContext.get('/api/content/v1/bootstrap', {
      params: {
        platform: process.env.CMS_PLATFORM!,
        market: process.env.CMS_MARKET!,
        audience: process.env.CMS_AUDIENCE!,
        appVersion: process.env.CMS_APP_VERSION!,
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body).toHaveProperty('contractVersion');
    expect(isContractCompatible(body.contractVersion, process.env.SUPPORTED_CONTRACT_VERSION)).toBe(true)

    expect(body).toHaveProperty('data');
    expect(typeof body.data).toBe('object');
    if (body.metadata) {
      expect(typeof body.metadata).toBe('object');
    }
  });
});