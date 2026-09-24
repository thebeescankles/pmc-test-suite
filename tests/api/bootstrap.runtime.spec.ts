import { test, expect, APIRequestContext } from '@playwright/test';
import {
  buildRequestParams,
  disposeApiContext,
  expectDocumentedErrorShape,
  expectEnvelopeStructure,
  getApiContext,
  getCmsResponse,
} from '../../src/api/fixtures/request-factory';
import { isContractCompatible } from '../../src/api/contracts/version-policy';

test.describe('CMS contract validation', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await getApiContext();
  });

  test.afterAll(async () => {
    await disposeApiContext();
  });

  test('returns a compatible contract version in bootstrap', async () => {
    const response = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams(), apiContext);

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expectEnvelopeStructure(body);
    expect(isContractCompatible(body.contractVersion, process.env.SUPPORTED_CONTRACT_VERSION)).toBe(true);
  });

  test('rejects invalid platform and appVersion inputs with the documented error contract', async () => {
    const invalidPlatformResponse = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams({ platform: 'desktop' as any }), apiContext);
    expect(invalidPlatformResponse.status()).toBe(400);

    const invalidPlatformBody = await invalidPlatformResponse.json();
    expectDocumentedErrorShape(invalidPlatformBody);
    expect(invalidPlatformBody.error).toMatch(/platform/i);

    const invalidVersionResponse = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams({ appVersion: 'bogus' }), apiContext);
    expect(invalidVersionResponse.status()).toBe(400);

    const invalidVersionBody = await invalidVersionResponse.json();
    expectDocumentedErrorShape(invalidVersionBody);
    expect(invalidVersionBody.error).toMatch(/appVersion/i);
  });
});