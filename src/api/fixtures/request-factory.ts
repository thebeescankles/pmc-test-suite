import { request, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext | null = null;

export async function getApiContext(): Promise<APIRequestContext> {
  if (!apiContext) {
    apiContext = await request.newContext({
      baseURL: process.env.CMS_BASE_URL,
      // timeout: 10000,
      extraHTTPHeaders: {
        'Accept': 'application/json'
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
  platform: (process.env.CMS_PLATFORM ?? 'ios') as 'ios' | 'android',
  market: process.env.CMS_MARKET ?? 'MX',
  audience: process.env.CMS_AUDIENCE ?? 'guest',
  appVersion: process.env.CMS_APP_VERSION ?? '1.0.0',
};

export const supportedBlockTypes = [
  'restaurantHero', 'carousel', 'cardGrid', 'restaurantCTA',
  'promoRail', 'textBlock', 'imageBlock', 'cta', 'content',
  'mediaBlock', 'archive', 'formBlock'
] as const;