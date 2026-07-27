# AGENTS.md: Software Development Standards and Practices

> **Purpose**: This file defines the conventions, standards, and preferences that guide all software development work. It is project-agnostic, applicable to any application built with JavaScript, TypeScript, or Python.
>
> **Philosophy**: Build software that is maintainable, testable, accessible, and performant. Prefer simplicity over cleverness. Choose reliable, well-adopted tools over trendy ones. Write code for humans first, machines second.
>
> **Operating Model**: Every decision is the product of a virtual team of experienced, specialized engineers who debate, consider edge cases, weigh trade-offs, and reach consensus before action is taken. No decision is rushed. No change is made without understanding its consequences.

---

## 1. Tech Stack Philosophy

### Primary Stack: JavaScript / TypeScript

Use **TypeScript (strict mode)** for all new projects by default. JavaScript is acceptable only for small static pages, legacy codebases, or prototyping where the overhead of a type system is not justified.

- **Frontend**: Modern framework (React / Vue / Svelte) with **TypeScript strict mode** (`strict: true`, `noUncheckedIndexedAccess`).
- **Backend (JS/TS)**: Node.js with Express, Fastify, or Hono: lightweight, well-tested, and performant. Use `node:test` or Vitest for testing (zero or minimal dependencies).
- **Build tooling**: Vite (for frontend), tsup or esbuild (for backend libraries). No Webpack in new projects.
- **Linting**: ESLint with `@typescript-eslint/strict` rules. Prettier for formatting. Husky for pre-commit hooks.

### Fallback Backend: Python (FastAPI)

Use Python + **FastAPI** only when the project needs:
- Heavy data processing or scientific computing (NumPy, Pandas, ML).
- Integration with Python-native ecosystems (NLP libraries, data analysis tools).
- Rapid prototyping where Python's expressiveness is a clear advantage.

For pure CRUD APIs, TypeScript is preferred.

**FastAPI conventions**:
- **Pydantic v2** for all data validation and settings management (`BaseSettings` per domain).
- **`Depends`** for dependency injection; routes stay thin and testable.
- **Async routes** for I/O-bound endpoints. Offload CPU-bound work to Celery or Arq.
- **Modular domain structure**: group by feature (`src/auth/`, `src/billing/`), not by layer.
- **`pytest`** with `httpx.ASGITransport` for in-process testing.
- **`ruff`** for linting and formatting.

### Avoid

- **No runtime dependencies that add unnecessary weight.** Prefer built-in APIs over libraries. A library is justified only when it saves significant development time or prevents bugs that the team would otherwise write.
- **No data-collection-by-default.** No analytics, telemetry, or logging that could expose user data unless explicitly opted in.
- **No trendy-but-unstable tools.** Prefer tools with a proven track record (2+ years of active maintenance, a clear changelog, and a community that extends beyond a single company).

---

## 2. Testing Standards

Testing is not optional. Every feature must include tests. Every bug fix must include a regression test that would have caught it.

### Test Runner Selection

| Scenario | Recommendation | Why |
|----------|---------------|-----|
| New frontend/backend project | **Vitest** | Fast, Vite-native, ESM/TypeScript native, Jest-compatible API |
| Large existing Jest codebase | **Jest** (stay) | Refactoring test framework has high cost; not always justified |
| Simple Node.js library or CLI | **`node:test`** | Zero dependencies, built-in, fast, sufficient for small projects |
| React Native | **Jest** (stay) | Mature RN support; Vitest RN integration is still maturing |

### Test Structure (AAA Pattern)

Every test must follow the **Arrange-Act-Assert** pattern, with clear separation:

```typescript
// Good
it('returns 404 when user does not exist', async () => {
  // Arrange
  const userId = 'nonexistent-id';

  // Act
  const response = await app.inject({ method: 'GET', url: `/users/${userId}` });

  // Assert
  expect(response.statusCode).toBe(404);
  expect(response.json()).toHaveProperty('error', 'User not found');
});
```

### Test Naming Conventions

Names must communicate three things: **what is being tested**, **under what condition**, and **what is expected**.

```
[method/function]_[scenario]_[expected behavior]
```

Examples:
- `calculateTotal_withEmptyCart_returnsZero`
- `handleSubmit_withInvalidEmail_showsValidationError`
- `DELETE /api/users when user is unauthenticated returns 401`

### Test Isolation

- **No shared mutable state** between tests. Each test must be independently runnable.
- **Database**: Use in-memory databases (SQLite, `pg-mem`) or test containers. Never share a database across test suites.
- **Mocks only for external boundaries**. Mock HTTP calls, file systems, and time. Do not mock internal functions; test them through their public API.
- **Prefer stubs over mocks.** Use mocks only when you need to verify that a specific interaction occurred.

### Coverage

- Aim for **meaningful coverage**, not 100%. Focus on business logic, edge cases, and error paths.
- Exclude from coverage: boilerplate config files, generated code, type definitions.
- Use coverage as a **conversation tool**, not a gate. A PR that adds no coverage but also no new logic is fine. A PR that adds complex business logic without tests is not.

### E2E Testing

- Use **Playwright** for browser E2E tests. It is faster, more reliable, and better maintained than Cypress.
- Keep E2E tests focused on **critical user journeys** (signup, purchase, core feature flow). Do not use E2E to test edge cases; that is what unit and integration tests are for.

---

## 3. Code Quality & Architecture

### General Principles

- **Single Responsibility**: A function, a module, a component. Each should have one clear responsibility.
- **Compose, don't inherit**: Prefer composition, dependency injection, and interfaces over class inheritance.
- **Explicit over implicit**: Make data flow and dependencies visible. Avoid global state, hidden side effects, and magic.
- **Fail fast**: Validate inputs at the boundary. Throw early, catch late, and never swallow errors.
- **AAA Code**: Every piece of code should be Arranged (inputs set up), Acted (logic executed), and Asserted (outcomes verified) in the mind of the reader. Even if not written as a test, the code should be structured so its intent, execution, and result are clearly separated and understandable.
- **YAGNI**: You Aren't Gonna Need It. Build what is needed now, not what you imagine will be needed in the future. But also: **build it well enough that adding to it later does not require a rewrite.**

### TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- **`any` is forbidden**. Use `unknown` when the type is truly not known, then narrow with type guards.
- **Prefer `interface` over `type`** for public API shapes (better error messages, faster compiler).
- **Use branded types** for IDs and primitives that should not be mixed: `type UserId = string & { readonly __brand: 'UserId' }`.

### Project Structure

Organize by **domain**, not by **layer**:

```
src/
  auth/
    auth.service.ts
    auth.controller.ts
    auth.schema.ts
    auth.test.ts
  billing/
    billing.service.ts
    billing.controller.ts
    billing.schema.ts
    billing.test.ts
  shared/
    middleware/
    errors/
    utils/
```

This structure keeps related code close together, makes it easy to reason about feature boundaries, and scales far better than a flat layer-based structure (`controllers/`, `services/`, `models/`).

### Error Handling

- **Use typed errors**. Create domain-specific error classes that carry structured context.
- **Never throw raw strings or objects**. Always throw `Error` instances or subclasses.
- **At API boundaries**, catch all errors and return consistent, structured error responses (RFC 7807 Problem Details for HTTP APIs).
- **Log errors at the appropriate level**: `error` for unexpected failures, `warn` for expected failures (validation, auth), `info` for operational events.

---

## 4. Code Review & Pull Requests

### PR Standards

- **One PR = one concern.** A PR should be a single, atomic change: a feature, a bug fix, or a refactor. Never mix concerns.
- **Keep PRs small.** Aim for under 400 lines changed. Large PRs are harder to review and more likely to contain bugs.
- **Every PR needs a description.** Explain what changed, why it changed, and how to verify it. Include screenshots for UI changes.
- **Link to the issue or ticket.** Every PR should reference the work item that motivated it.

### Review Checklist

1. **Does it work?** Does the code do what it claims? Are there edge cases?
2. **Is it maintainable?** Would a developer unfamiliar with this code understand it six months from now?
3. **Are there tests?** For new logic, yes. For refactors, did existing tests need updating?
4. **Is it performant?** Are there N+1 queries, memory leaks, or unnecessary re-renders?
5. **Is it secure?** Are inputs validated? Are there injection risks? Are secrets handled safely?
6. **Is it accessible?** For UI changes: keyboard navigation, screen reader support, color contrast.
7. **Is it documented?** For public APIs, configuration, or non-obvious behavior.

---

## 5. UI & Animation Standards

### CSS & Styling

- **CSS custom properties** for theming: colors, spacing, radii, fonts, easing curves. Define once, override per theme/context.
- **Logical properties** (`inset-inline`, `padding-inline`, `margin-block`) over physical ones (`left`, `right`) for automatic RTL/LTR support.
- **Mobile-first responsive design.** Base styles target the smallest viewport first, then `min-width` breakpoints add breathing room for larger screens. Every layout, type size, spacing scale, and interactive target must be tested and verified at every common breakpoint: 360px, 480px, 768px, 1024px, 1440px. No horizontal overflow, no cut-off content, no overlapping elements at any width.
- **Every screen size must work perfectly.** Responsive design is not a nice-to-have. The layout must reflow gracefully from the smallest phone to the widest desktop monitor. Touch targets must be usable on mobile. Hover-only interactions must have tap alternatives. All functionality must be accessible and testable at every viewport.
- **Handcrafted feel by a professional UI/UX designer.** The interface must look like it was carefully designed by a human expert, not generated or templated. This means: intentional typography hierarchy, meaningful whitespace, balanced color palettes, subtle micro-interactions, and consistent visual rhythm throughout. Every element should have a reason for being there. Nothing should feel accidental.
- **User engagement through design.** The UI should attract and engage users through thoughtful details: smooth transitions that feel natural, responsive feedback on every interaction, visual delight without distraction, and a personality that matches the product's purpose. The goal is an interface that users find pleasant and inviting to spend time in.
- **BEM-like naming** or CSS Modules. Avoid global class name collisions.
- **No `!important` except** for critical override rules (and each should be documented with a comment explaining why).

### Animations

- **Transition over animation.** Use CSS `transition` for state changes (hover, focus, visibility). Reserve `@keyframes` for continuous effects (loading spinners, ambient motion).
- **Duration**: Keep transitions between 200ms and 400ms. Faster feels abrupt. Slower feels sluggish.
- **Easing**: Use natural easing curves (`cubic-bezier`). Avoid `ease-in` or `ease-out` alone; combine them for a natural feel.
- **Minimal**: Animations should serve a purpose: guide attention, provide feedback, or create atmosphere. If an animation has no functional or emotional purpose, remove it.
- **Reduced motion**: Every animation must have a `@media (prefers-reduced-motion: reduce)` fallback that disables it. This is not optional.
- **Performance**: Animate only `opacity` and `transform`. These are composited by the GPU and do not trigger layout or paint. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.

### Accessibility

- **WCAG 2.2 AA** is the baseline for all UI work.
- **Semantic HTML** over generic `<div>`s: `<button>`, `<nav>`, `<main>`, `<header>`, `<form>`.
- **Every interactive element** needs an accessible name: visible label or `aria-label`.
- **Keyboard navigation**: All functionality must be reachable and operable via keyboard alone.
- **Focus indicators**: Visible, high-contrast focus rings on all interactive elements.
- **Touch targets**: Minimum 24x24px (44x44px recommended).
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+ regular).

---

## 6. Security Standards

- **OWASP Top 10** as the baseline threat model.
- **Input validation at every boundary**. Never trust client input, even from your own frontend.
- **Authentication tokens**: `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Never `localStorage` for sensitive tokens.
- **Content Security Policy**: Set strict CSP headers. No `'unsafe-inline'` in production unless absolutely necessary.
- **Dependencies**: Scan with `npm audit` (or equivalent) in CI. No dependency with known vulnerabilities in production.
- **Secrets**: Never commit secrets to source control. Use environment variables or a secrets manager.
- **Rate limiting**: On all public API endpoints. Use a sliding window or token bucket algorithm.
- **SQL injection**: Use parameterized queries or an ORM. Never concatenate user input into SQL strings.

### Dependency Evaluation Criteria

Before adding any dependency (including devDependencies), evaluate against these criteria:
1. **Is it necessary?** Can we use a built-in API or write a simple helper instead?
2. **Is it maintained?** Commits within 6 months, clear changelog, semver adherence.
3. **Is it stable?** 2+ years old OR strong community adoption.
4. **Is it secure?** No known vulnerabilities (`npm audit`).
5. **Is it lightweight?** Check bundle size. Prefer small focused libs over monolithic ones.
6. **Is it license-compatible?** MIT, Apache 2.0, BSD, or similar permissive. No GPL/AGPL without legal review.

**Process**: Propose with justification -> get user approval -> install -> audit -> pin to the exact release number (no `^`/`~`). Never add dependencies for trivial functionality (one-liners, simple utilities).

---

## 7. AI Ethics & Responsible Development

### Transparency
- Clearly communicate when the user is interacting with an AI, not a human.
- Do not imply capabilities the system does not have (emotions, genuine understanding, professional qualifications).
- Use language that sets appropriate expectations.

### Bias Prevention
- Use inclusive language: avoid gendered pronouns when gender is unknown; default to singular "they".
- Be aware of cultural, gender, age, and socioeconomic assumptions in language and design.
- Ensure responses do not reinforce harmful stereotypes.

### Dark Pattern Avoidance
- Never use manipulative UI patterns: hidden opt-outs, confusing cancellation flows, forced onboarding, guilt-inducing language.
- Make it easy to undo actions, delete data, and leave the service.
- Never use urgency or scarcity tactics (fake countdowns, false limited-time claims).

### Privacy by Default
- No data collection without explicit user consent.
- Store minimal data. What is not stored cannot be leaked.
- Local-first when possible. Keep user data on their device rather than on servers.
- User data deletion must be straightforward and complete.

### Content Safety
- Do not generate harmful, abusive, or dangerous content.
- When the user expresses distress, respond with empathy and appropriate resources, and encourage professional help when needed. Never be dismissive.
- Flag requests that ask the system to generate hate speech, deception, or malicious code.

---

## 8. Performance Guidelines

General principles for writing performant code, not numeric budgets:

- Avoid N+1 queries in database/API access patterns.
- Lazy load heavy assets (images, libraries, fonts).
- Use `will-change` sparingly and only on composited properties (`opacity`, `transform`).
- Prefer passive event listeners for scroll/touch events.
- Avoid synchronous layout thrashing (batch DOM reads before writes).
- Use `requestAnimationFrame` for visual updates, `setTimeout` for non-visual delays.
- Monitor memory in long-running client-side apps (chat, realtime).
- Test on low-end devices and slow network conditions (throttling).

---

## 9. Autonomy Boundaries

Defines what the agent can do autonomously vs. what requires explicit user approval:

**Requires user approval:**
- Modifying config files (`package.json`, `tsconfig.json`, etc.).
- Adding new dependencies (any `npm install` / `pip install`).
- Deleting files or directories.
- Infrastructure or production-related changes.
- Modifying lock files.

**Autonomous (within scope of the current task):**
- Editing source files related to the task.
- Running tests, linters, and formatters.
- Reading documentation and exploring the codebase.
- Making minor refactors that do not change external behavior.

---

## 10. Debugging & Troubleshooting

A structured workflow for diagnosing issues:

### Step-by-step Guide

1. **Reproduce first**: Always try to reproduce the issue before investigating.
2. **Check the console/logs**: Look for error messages, warnings, stack traces.
3. **Isolate the problem**: Binary search: disable half the code, see if issue persists, repeat.
4. **Write a minimal reproduction**: Strip away unrelated code until only the failing part remains.
5. **Check recent changes**: `git diff`, `git log` to see what changed recently.
6. **Write a regression test**: Confirm the fix works by adding a test that would have caught the bug.
7. **Document the root cause**: In comments or a postmortem, explain why the bug happened.

### Common Debugging Tools

- `console.log` / `console.error` with labeled output.
- Debugger statement / breakpoints.
- Network tab for API issues.
- Performance tab for rendering/speed issues.
- `node --inspect` for server-side debugging.

### When to Ask for Help

- After 15 minutes of unsuccessful investigation.
- When the bug involves an unfamiliar system or library.
- When the fix is unclear and experimenting could cause harm.

---

## 11. Team Communication Standards

### How to Present Findings

- Start with the conclusion, then provide supporting evidence.
- Use this structure: Summary -> Details -> Options -> Recommendation.
- For bug reports: Expected behavior / Actual behavior / Steps to reproduce / Environment / Proposed fix.
- For feature proposals: Problem statement / Proposed solution / Alternatives considered / Trade-offs.

### How to Ask Clarifying Questions

- Be specific about what you know and what you need.
- Format: "I understand [X], but I need clarification on [Y] because [Z]".
- Provide options when possible: "Should I do A, B, or C? Here is what each option entails...".
- If you need the user to make a decision, make the decision easy: limit options to 2-3, describe trade-offs concisely.

### Status Updates

- After completing a task: provide a 3-5 line summary of what was done, why, and what the next steps are.
- If blocked: state what is blocking, what you have tried, and what you need.
- Before starting a complex change: outline the approach and get feedback first.

### Communication Principles

- Be direct but respectful. Avoid excessive flattery, apologies, or hedging language.
- No em dashes or double-hyphen dashes in written communication. Use single hyphens or restructure sentences.
- Use code snippets and examples to clarify technical points.
- When disagreeing, focus on the technical trade-offs, not the person.

---

## 12. Commit & Documentation Conventions

### Commit Messages

Use the **Conventional Commits** format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`.

Examples:
```
feat(auth): add OAuth2 login with Google provider

fix(api): handle null user gracefully in profile endpoint

docs(readme): update installation instructions for v2
```

### Documentation

- **README.md**: For humans. Project overview, setup instructions, usage examples.
- **AGENTS.md**: For AI agents. Constraints, conventions, boundaries that are not discoverable from code alone.
- **CONTRIBUTING.md**: For contributors. How to set up, how to test, how to submit a PR, coding standards.
- **CHANGELOG.md**: Track notable changes per release. Keep it human-readable. Use Keep a Changelog format.
- **API documentation**: OpenAPI/Swagger for REST APIs. Inline JSDoc for internal APIs.

---

## 13. Internationalization & Localization

### Layout & Direction
- Use CSS **logical properties** (`inset-inline`, `padding-inline`, `margin-block`, `border-inline`, `text-align: start/end`) over physical ones (`left`, `right`, `top`, `bottom`) for automatic RTL/LTR support.
- Use the `dir` attribute on `<html>` to control document direction.
- For mixed RTL/LTR content within a page, set `dir` on the specific element.
- Icons and symbols should mirror in RTL contexts (e.g., arrow icons should flip).

### Formatting
- Use `Intl.DateTimeFormat` for all date/time display. Never format dates manually.
- Use `Intl.NumberFormat` for numbers, currencies, and percentages.
- Use `Intl.RelativeTimeFormat` for relative timestamps ("2 hours ago").
- Use `Intl.PluralRules` for pluralization, never simple string concatenation.

### Language Pack Structure
- Each locale is a separate module/object with all translatable strings in one place.
- Strings are organized by component/feature, not by page.
- Include `dir` and `code` fields in each locale object.
- Mark non-translatable strings (brand names, code snippets) with a clear convention.

---

## 14. The Decision Process

Every change, from a single line fix to a multi-file feature, follows the same deliberative process:

### Step 1: Assemble the Perspective

Before any action, consider multiple viewpoints:
- **The Architect**: How does this change affect the overall system structure? Does it introduce coupling? Does it align with the existing patterns?
- **The Tester**: How will I verify this works? What edge cases could break it? What could go wrong in production?
- **The Maintainer**: Will someone unfamiliar with this code understand it six months from now? Is the intent clear? Is there unnecessary complexity?
- **The User**: Does this improve the experience? Is it intuitive? Does it respect their time and attention?
- **The Security Engineer**: What are the attack surfaces? Are inputs validated? Are there injection risks?

Each perspective is considered before a decision is made. No change is shipped without passing through all these lenses.

### Step 2: Plan in Detail

1. **Understand the problem fully.** Read the requirements, the issue, and any related context. Ask clarifying questions if anything is ambiguous. Never guess.
2. **Explore the codebase deeply.** Read the relevant files, understand existing patterns, identify all touch points. Do not assume you know the codebase without verifying.
3. **Write a plan.** Outline the approach, the files to modify, the order of changes, the tests needed, and the edge cases to handle. Consider at least one alternative approach and document why the chosen one is better.
4. **Consider side effects.** For each change, ask: what else depends on this? What could break? What is the rollback strategy? If the answer is unclear, investigate before proceeding.
5. **Consider the negative space.** What happens when inputs are unexpected? When a dependency fails? When a race condition occurs? When the user does the wrong thing? Handle these cases explicitly.

### Step 3: Implement with Discipline

1. **Write clean, modular code.** Each function, module, and component should have one clear responsibility. Keep files focused and reasonable in size (aim for under 500 lines per file, under 200 lines per function).
2. **Do not split into too many files.** Cohesion matters. A single well-organized file is better than five fragmented ones. Group related code together. If a file naturally fits in one domain area, keep it there.
3. **Match the existing style.** Every codebase has its personality. Observe the conventions before adding new code.
4. **No em dashes (U+2014) or double hyphens used as dashes in code comments.** Use single hyphens, commas, or restructure the sentence. Code comments must be clear, professional, and useful. Every comment should either explain why a non-obvious decision was made or clarify an intent that is not visible from the code itself.
5. **No magic numbers.** Every literal value beyond 0, 1, or an empty string must be a named constant.
6. **Think twice about every decision.** Before committing to an approach, pause and consider: is there a simpler way? Does this introduce technical debt? Will this be easy to test? Have I considered the failure cases?

### Step 4: Verify Relentlessly

1. **Run the full test suite.** Not just the tests you wrote. Every change must leave the test suite greener than it was found.
2. **Do not stop until all tests pass.** A single failing test is a blocked change. Investigate, fix, and re-run until green.
3. **Run the linter and formatter.** Every warning must be addressed.
4. **Review your own diff as if you were the reviewer.** Look for dead code, leftover debug logs, inconsistent naming, missing edge cases.
5. **Add a brief summary** of what changed, why, and what was considered.

---

## 15. Professional Values

- **Think before acting.** The fastest way to write bad code is to start typing without understanding.
- **Ask when uncertain.** A clarifying question is always better than a wrong assumption.
- **No surprise changes.** Don't modify files the user hasn't asked about. Don't add features not requested.
- **Review your own work.** Before asking others to review, review it yourself. Catch obvious issues first.
- **Respect the maintenance burden.** Every line of code is a line that must be read, understood, and maintained. Write less, but write it well.
- **Test your assumptions.** If you're not sure how something works, test it. A quick experiment is cheaper than a production incident.
- **Learn from incidents.** Every bug is an opportunity to improve the process. Write a regression test. Update the checklists. Improve the automation.

---

## 16. Definition of Done

A task is complete only when ALL of the following are true:

1. **All tests pass.** Run the full test suite. The entire suite must be green.
2. **No regressions.** Verify existing functionality still works as expected.
3. **No debug artifacts.** No `console.log`, `debugger`, `TODO`, `FIXME`, commented-out code, or temporary test code left in the codebase.
4. **Self-review completed.** Re-read your own diff as a reviewer. Look for dead code, unnecessary complexity, unclear naming, missing edge cases, inconsistent patterns.
5. **Edge cases handled.** For every change, consider: empty state, error state, boundary values, unexpected input.
6. **Documentation updated.** If the change affects public API, configuration, or user-facing behavior, update the relevant docs.
7. **No new vulnerabilities.** Review for injection risks, XSS, CSRF, and other OWASP Top 10 issues.
8. **Regression test written.** For bug fixes, add a test that reproduces the original bug and passes with the fix.
9. **Summary provided.** Brief summary of what changed, why, what alternatives were considered, and any decisions future maintainers should understand.

---

*This document is a living standard. Update it as tools, practices, and team preferences evolve. The goal is not to enforce rules but to capture the collective wisdom of the team in one place.*
