import { test, expect } from '@playwright/test';
import {
  baseParams,
  buildRequestParams,
  getCmsResponse,
  validPlatforms,
} from '../../src/api/fixtures/request-factory';

for (const platform of validPlatforms) {
  test.describe(`bootstrap contract [${platform}]`, () => {
    test('contains required keys and valid platform-specific metadata', async () => {
      const response = await getCmsResponse('/api/content/v1/bootstrap', buildRequestParams({ platform }));

      expect(response.status()).toBe(200);

      const { data, resolvedContext } = await response.json();

      for (const key of ['alerts', 'experience', 'featureFlags', 'navigation', 'operationalControls', 'promotions']) {
        expect(data, `data.${key} must exist`).toHaveProperty(key);
      }

      expect(Array.isArray(data.alerts)).toBe(true);
      expect(Array.isArray(data.promotions)).toBe(true);
      expect(['object', 'null']).toContain(data.experience === null ? 'null' : typeof data.experience);

      for (const alert of data.alerts as any[]) {
        for (const requiredKey of ['actions', 'dismissible', 'id', 'placement', 'priority', 'revision', 'title']) {
          expect(alert, `alert must have ${requiredKey}`).toHaveProperty(requiredKey);
        }

        expect(Array.isArray(alert.actions)).toBe(true);
        for (const action of alert.actions as any[]) {
          expect(action).toHaveProperty('href');
          expect(action).toHaveProperty('label');
        }

        if (alert.frequency) expect(typeof alert.frequency).toBe('object');
        if (alert.trigger) expect(typeof alert.trigger).toBe('object');
      }

      if (data.navigation !== null) {
        expect(Array.isArray(data.navigation.items)).toBe(true);
        for (const item of data.navigation.items as any[]) {
          expect(item).toHaveProperty('label');
          const destination = item.destination;
          expect(destination).toHaveProperty('path');
          expect(Array.isArray(destination.supportedPlatforms)).toBe(true);
          expect(destination.supportedPlatforms).toContain(platform);
        }
      }

      for (const [flag, value] of Object.entries(data.featureFlags ?? {})) {
        expect(typeof value, `flag ${flag}`).toBe('boolean');
      }

      expect(resolvedContext.platform).toBe(platform);
      expect(resolvedContext.authenticationState).toBe(baseParams.audience);
    });
  });
}