# PMC Test Suite

This repository contains the API contract and browser automation layer for the public Payload CMS and Casa Maíz website. It is intentionally focused on read-only public checks and keeps the automation independent from CMS mutations.

## Risk model

The highest-value risks for this delivery are:

- Versioned contract compatibility: a breaking payload envelope or unexpected contract version can break app behavior before users do.
- Platform-specific delivery context: ios and android requests must resolve the correct content and feature flags.
- CMS-driven navigation and actions: destination paths and platform targeting must be accurate across all routes.
- Dynamic and optional content: missing optional fields, empty arrays, and future block types should degrade safely instead of crashing the client.
- Network and stale content boundaries: caching, nextChangeAt, and offline fallback must be handled explicitly.
- Accessibility and user-visible behavior: navigation, notices, and legal content must remain usable and understandable to real users.

These risks map to the appropriate automation layers:

- API contract tests: contractVersion, resolvedContext, page shapes, targeting, media URLs, and validation behavior.
- Browser tests: public navigation, notice dismissal, menu rendering, and graceful degradation under failed requests.

## Repository boundary

This repository covers the public CMS API and the web target only. The mobile app and native automation are intentionally separate from this repo and are not duplicated here.

## Local setup

1. Install dependencies with the lockfile:
   npm ci
2. Configure environment values in .env if needed.
3. Run the checks:
   npm run check
   npm run test:api
   npm run test:web

## Test architecture

- `src/api/fixtures/request-factory.ts` centralizes request context creation and shared request parameters.
- API tests stay close to user-visible contract behavior and avoid brittle text assertions.
- Browser tests use stable selectors based on roles and visible links rather than implementation details.
- The suite is designed to be deterministic and read-only; it never mutates the shared CMS.

## AI tooling used

This workflow used GitHub Copilot as a coding assistant to help with test design, refactoring, and validation. The primary value was faster iteration on selectors, fixtures, and cleanup while keeping the assertions aligned with the public behavior under test.

## Important notes

- The repo does not include secrets or credentials.
- The suite uses the public CMS and public web target only.
- The Playwright reporter outputs a machine-readable JUnit file and HTML report.
