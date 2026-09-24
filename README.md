Hello Melvin. This is a substantial Senior QA Engineer assessment that demands architectural thinking, not just scriptwriting. It tests your ability to build a production-grade automation framework across three distinct layers (API, Component, E2E) while respecting the constraints of a shared, read-only CMS environment.

Since we are adhering to a Socratic approach where I guide your logic without providing solutions or code, let's break this down into logical phases. I'll ask you questions to help you structure your strategy before you write a single line of code.

Phase 1: Strategic Architecture & Risk Modeling
The prompt explicitly states: "Before adding tests, define a concise risk model in the README." This is your foundation. If you skip this, you risk building tests that don't address the actual business risks.

Logic Check: The challenge asks you to map specific risks (e.g., "Versioned content-contract compatibility," "Offline fallback") to specific automation layers (API vs. Component vs. E2E).
Question: How do you determine which layer is the "sweet spot" for a specific risk? For instance, why would you test a malformed JSON response at the API layer rather than waiting for the mobile app to crash in an E2E test?
Question: The prompt warns against "forcing every assertion through end-to-end automation." Can you outline a mental model for when an E2E test is necessary versus when a unit/component test is sufficient?
Phase 2: Repository Structure & Separation of Concerns
You are required to maintain two distinct repositories:

Mobile Repo: Extending the existing payload-mobile-consumer.
Automation Repo: A detached repo for API tests and Web Playwright tests.
Logic Check: The prompt encourages sharing "CMS contracts or mock data" but forbids duplicating the mobile application.
Question: How will you architect the sharing of data schemas (like the OpenAPI contract) between these two repos without creating tight coupling? Will you use a shared private NPM package, a git submodule, or a CI artifact? What are the trade-offs of each for a 3-4 day timeline?
Question: Since the CMS is read-only and shared, how will your logic ensure your tests don't interfere with other candidates or the live environment? Specifically regarding the POST /api/form-submissions endpoint mentioned as "do not submit spam."
Phase 3: The API & Contract Layer (Part 2)
This is likely the most critical technical differentiator. You aren't just checking status codes; you are validating a versioned contract.

Logic Check: The prompt requires detecting an "incompatible contract without rejecting harmless additive fields."
Question: How will your logic distinguish between a "breaking change" (missing required field) and a "non-breaking change" (new optional field)? Does your validation strategy rely on strict equality, or do you need a schema validator that enforces "required" vs "optional"?
Question: The prompt mentions a "known-failure handling policy." If the API deviates from the OpenAPI contract, your tests should fail, but you also need to document this. How do you structure your test runner logic to allow a specific test to fail intentionally while still reporting it as a "defect" rather than a "test bug"?
Phase 4: React Native Component & Integration (Part 3)
You must use React Native Testing Library and Jest. The focus here is on asynchronous behavior and forward compatibility.

Logic Check: You need to test "unknown block types" or "missing optional fields" without crashing.
Question: How will you simulate the arrival of bad data from the CMS in a component test? Will you mock the API hook directly, or inject a mock prop? What is the boundary between mocking the network and testing the component's reaction?
Question: The prompt explicitly bans "fixed sleeps." How will you logically handle asynchronous state updates (e.g., loading spinners turning into content) in your test flow to ensure determinism?
Phase 5: Mobile & Web E2E (Parts 4 & 5)
Here you are orchestrating full user journeys. The constraint is stability.

Logic Check: You need to select a framework (Maestro, Detox, or Appium) for mobile and Playwright for web.
Question: For the mobile E2E, how will you identify elements reliably? The prompt suggests "accessibility identifiers" or "intentional test IDs." How do you decide which elements get these IDs? Do you modify the production code (allowed only for test infra), or do you rely on accessibility labels?
Question: The prompt asks for a "deterministic failure scenario" (e.g., offline launch). How will you logically inject this failure? Are you relying on the tool's ability to throttle the network, or will you mock the CMS response at the proxy level?
Phase 6: Accessibility & Defect Reporting
Logic Check: You need to prove two accessibility behaviors.
Question: Automation has limits. How will you articulate the difference between what your script can verify (e.g., "has an accessible name") versus what requires human judgment (e.g., "is the name semantically correct")?
Defect Logic: If you find no bugs, you must report a "quality risk."
Question: How do you formulate a "risk" that isn't just a vague concern? It needs to be tied to a specific user impact and a potential regression path.
Immediate Next Steps for Your Logic
Before opening your IDE, I suggest you draft the Risk Model (Part 1) first.

List the top 5 risks identified in the prompt.
Draw a mapping: Risk 
→
 Automation Layer 
→
 Justification.
Define your "Contract Validation Strategy": How will you parse the JSON envelope and validate the contractVersion?
Once you have that logic mapped out, we can dive deeper into how you might structure the test data fixtures or the specific assertions for the "Bootstrap" endpoint.

---------------------------------------------
Identify the highest risks across:
➔ Versioned content-contract compatibility
    - Breaking changes at the call level in subsequent versions
➔ Platform-specific delivery context
    - Platform updates, major dependency updates, platform specific configurations
➔ React Native component composition and asynchronous behavior
➔ CMS-driven navigation, actions, and destination resolution
➔ Dynamic, optional, malformed, or future content
➔ Network failures, cache validity, offline fallback, and nextChangeAt
    - Duplicated entries in call methods,
➔ Accessibility, large text, and touch interaction
    - Platforms not handling resoution changes effectively
    - 
➔ iOS and Android behavioral differences
    -
➔ Mobile end-to-end reliability and diagnostics