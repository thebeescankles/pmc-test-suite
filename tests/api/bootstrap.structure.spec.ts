import { test, expect } from '@playwright/test';
import { baseParams } from '../../src/api/fixtures/request-factory';

for (const platform of ['ios', 'android'] as const) {
  test.describe(`bootstrap contract [${platform}]`, () => {

    test('data contains all required keys with structurally sound values', async ({ request }) => {
      const response = await request.get('/api/content/v1/bootstrap', {
        params: { ...baseParams, platform },
      });
      expect(response.status()).toBe(200);
      const { data, resolvedContext } = await response.json();

      for (const key of ['alerts', 'experience', 'featureFlags', 'navigation', 'operationalControls', 'promotions']) {
        expect(data, `data.${key} must exist`).toHaveProperty(key);
      }

      expect(Array.isArray(data.alerts)).toBe(true);
      expect(Array.isArray(data.promotions)).toBe(true);

      expect(['object', 'null']).toContain(
        data.experience === null ? 'null' : typeof data.experience
      );

      for (const alert of data.alerts as any[]) {
        for (const req of ['actions', 'dismissible', 'id', 'placement', 'priority', 'revision', 'title']) { //revise
          expect(alert, `alert must have ${req}`).toHaveProperty(req);
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
          const dest = item.destination;
          expect(dest).toHaveProperty('path');
          expect(Array.isArray(dest.supportedPlatforms)).toBe(true);
          expect(dest.supportedPlatforms).toContain(platform);
        }
      } else {
        // Optional state - Documented as acceptable
      }

      for (const [flag, value] of Object.entries(data.featureFlags ?? {})) {
        expect(typeof value, `flag ${flag}`).toBe('boolean');
      }
      
      expect(resolvedContext.platform).toBe(platform);
      expect(resolvedContext.authenticationState).toBe(baseParams.audience);
    });
  });
}