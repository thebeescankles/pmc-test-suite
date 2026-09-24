import { request, APIRequestContext, APIResponse, expect } from '@playwright/test';

export const validPlatforms = ['ios', 'android'] as const;
export type CmsPlatform = (typeof validPlatforms)[number];

export const absoluteUrlPattern = /^https?:\/\/[-\w.]+\.[a-z]{2,}(\/.*)?$/i;
export const relativeMediaPathPattern = /^\/api\/media\/file\/[\w.-]+\.(?:webp|jpg|jpeg|png|gif)$/i;

let apiContext: APIRequestContext | null = null;
export async function getApiContext(): Promise<APIRequestContext> {
  if (!apiContext) {
    apiContext = await request.newContext({
      baseURL: process.env.CMS_BASE_URL,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });
  }
  return apiContext;
}

export async function disposeApiContext() {
  if (apiContext) {
    await apiContext.dispose();
    apiContext = null;
  }
}

export const baseParams = {
  platform: (process.env.CMS_PLATFORM ?? 'ios') as CmsPlatform,
  market: process.env.CMS_MARKET ?? 'MX',
  audience: process.env.CMS_AUDIENCE ?? 'guest',
  appVersion: process.env.CMS_APP_VERSION ?? '1.0.0',
};

export function buildRequestParams(overrides: Partial<typeof baseParams> = {}) {
  return {
    ...baseParams,
    ...overrides,
  };
}

export async function getCmsResponse(
  path: string,
  params: Record<string, string | number | boolean | undefined> = buildRequestParams(),
  context?: APIRequestContext,
): Promise<APIResponse> {
  const requestContext = context ?? (await getApiContext());
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;

  return requestContext.get(path, { params: cleanedParams });
}

export function expectEnvelopeStructure(payload: any, expectedPlatform?: string) {
  expect(payload).toHaveProperty('contractVersion');
  expect(payload).toHaveProperty('data');
  expect(typeof payload.data).toBe('object');

  if (payload.metadata !== undefined) {
    expect(typeof payload.metadata).toBe('object');
  }

  if (expectedPlatform && payload.resolvedContext) {
    expect(payload.resolvedContext.platform).toBe(expectedPlatform);
  }
}

export function expectSemanticVersion(version: string, label = 'appVersion') {
  expect(typeof version).toBe('string');
  expect(/^\d+\.\d+\.\d+$/.test(version)).toBe(true);
  expect(version, `${label} must be semantic versioning`).toMatch(/^\d+\.\d+\.\d+$/);
}

export function expectValidNextChangeAt(value: unknown, label = 'nextChangeAt') {
  expect(value, `${label} must be present when provided`).toBeTruthy();
  const date = new Date(String(value));
  expect(Number.isNaN(date.getTime()), `${label} must be a valid ISO timestamp`).toBe(false);
}

export function expectDocumentedErrorShape(payload: Record<string, any>) {
  expect(payload.errors !== undefined || payload.error !== undefined).toBe(true);
}

export const supportedBlockTypes = [
  'restaurantHero',
  'carousel',
  'cardGrid',
  'restaurantCTA',
  'promoRail',
  'textBlock',
  'imageBlock',
  'cta',
  'content',
  'mediaBlock',
  'archive',
  'formBlock',
] as const;