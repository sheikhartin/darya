# AGENTS.md Enhancement Specification

> **Status**: Pre-implementation spec
> **Purpose**: Capture requirements gathered from user interview and web research for expanding AGENTS.md into a comprehensive, project-agnostic guide for AI coding agents.

---

## Background

The current AGENTS.md (located at project root) is already a solid foundation with 9 sections covering:

1. Tech Stack Philosophy
2. Testing Standards
3. Code Quality & Architecture
4. Code Review & Pull Requests
5. UI & Animation Standards
6. Security Standards
7. Commit & Documentation Conventions
8. The Decision Process
9. Professional Values

The user wants these sections **added or significantly expanded**:

---

## Proposed Sections to Add

### 10. Autonomy Boundaries (light boundaries)

A section defining what the agent can do autonomously vs. what requires explicit user approval.

**Must-include**:
- Config files (`package.json`, `tsconfig.json`, etc.) -- ask before modifying
- Dependency installation -- ask before adding new dependencies
- File deletion -- ask before deleting code
- Infrastructure/production-related changes -- always ask
- Lock files -- never modify without approval

**Style**: Brief and clear boundary rules rather than detailed processes.

---

### 11. Performance Guidelines (general principles)

Not a numeric budget, but actionable principles:

- Avoid N+1 queries in database/API access patterns
- Lazy load heavy assets (images, libraries, fonts)
- Use `will-change` sparingly and only on composited properties (`opacity`, `transform`)
- Prefer passive event listeners for scroll/touch events
- Avoid synchronous layout thrashing (batch DOM reads before writes)
- Use `requestAnimationFrame` for visual updates, `setTimeout` for non-visual delays
- Monitor memory in long-running client-side apps (chat, realtime)
- Test on low-end devices and slow network conditions (throttling)

---

### 12. Debugging & Troubleshooting (detailed workflow)

A structured debugging workflow section:

**Step-by-step guide**:
1. **Reproduce first** -- Always try to reproduce the issue before investigating
2. **Check the console/logs** -- Look for error messages, warnings, stack traces
3. **Isolate the problem** -- Binary search: disable half the code, see if issue persists, repeat
4. **Write a minimal reproduction** -- Strip away unrelated code until only the failing part remains
5. **Check recent changes** -- `git diff`, `git log` to see what changed recently
6. **Write a regression test** -- Confirm the fix works by adding a test that would have caught the bug
7. **Document the root cause** -- In comments or a postmortem, explain why the bug happened

**Common debugging tools**:
- `console.log` / `console.error` with labeled output
- Debugger statement / breakpoints
- Network tab for API issues
- Performance tab for rendering/speed issues
- `node --inspect` for server-side debugging

**When to ask for help**:
- After 15 minutes of unsuccessful investigation
- When the bug involves an unfamiliar system or library
- When the fix is unclear and experimenting could cause harm

---

### 13. Dependency Management (strict rules)

**Evaluation criteria for new dependencies**:
1. **Is it necessary?** -- Can we use a built-in API or write a simple helper instead?
2. **Is it maintained?** -- Actively maintained (commits within 6 months), clear changelog, semver adherence
3. **Is it stable?** -- Has been around for 2+ years OR has strong community adoption
4. **Is it secure?** -- No known vulnerabilities (check with `npm audit` or equivalent)
5. **Is it lightweight?** -- Check bundle size with bundlephobia or equivalent. Prefer small focused libs over monolithic ones.
6. **Is it license-compatible?** -- Must be MIT, Apache 2.0, BSD, or similarly permissive. No GPL/AGPL in commercial projects without legal review.

**Process for adding a dependency**:
1. Propose the dependency with justification for each of the criteria above
2. Get user approval before running `npm install <package>`
3. After installation, run the security audit
4. Pin to the exact release number (no `^` or `~`) unless there is a strong reason not to

**What to avoid**:
- Adding dependencies for trivial functionality (one-liners, simple utilities)
- Replacing an existing well-functioning dependency with a trendy alternative
- Adding development dependencies that duplicate existing tooling
- Committing `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` changes without review

---

### 14. Internationalization (i18n) & Localization (detailed standards)

**Layout & direction**:
- Use CSS **logical properties** (`inset-inline`, `padding-inline`, `margin-block`, `border-inline`, `text-align: start`/`end`) instead of physical properties (`left`, `right`, `top`, `bottom`) for layout
- Use the `dir` attribute on `<html>` to control document direction
- For mixed RTL/LTR content within a page, use the `dir` attribute on the specific element
- Arabic/Persian text may need specific font-feature-settings

**Translation key naming**:
- Use dot-notation namespacing: `ui.placeholderDefault`, `ui.menuExportTxt`, `breathe.inhale`
- Group by feature or component, not by file type
- Keep keys short but descriptive

**Formatting & pluralization**:
- Use `Intl.DateTimeFormat` for all date/time display. Never format dates manually.
- Use `Intl.NumberFormat` for numbers, currencies, and percentages.
- Use `Intl.PluralRules` for pluralization. Do not use simple string concatenation.
- Use `Intl.RelativeTimeFormat` for "2 hours ago" style timestamps.

**Text direction design patterns**:
- Icons and symbols should mirror in RTL contexts (e.g., arrow icons should flip)
- Padding/margin should use logical properties so they automatically adapt
- Background-position, transform-origin, and other positional values may need RTL adjustment
- Flexbox `row-reverse` and `column-reverse` should be avoided; use `flex-direction` with logical properties instead

**Language pack structure**:
- Each locale is a separate module/object with all translatable strings in one place
- Strings are organized by component/feature, not by page
- Include a `dir` and `code` field in each locale object
- Mark strings that should not be translated (brand names, code snippets) with a `_doNotTranslate` convention

---

### 15. AI Ethics & Responsible Development (detailed guidelines)

**Transparency**:
- Clearly communicate when the user is interacting with an AI, not a human
- Do not imply capabilities the system does not have (e.g., claiming to be human, claiming to have emotions)
- Use language that sets appropriate expectations: "I am here to help," not "I understand exactly how you feel"

**Bias prevention**:
- Be aware of cultural, gender, age, and socioeconomic assumptions in language and design
- Use inclusive language: avoid gendered pronouns when gender is unknown, use "they" as singular default
- Do not assume user demographics or preferences based on limited information
- Ensure content recommendations or responses do not reinforce harmful stereotypes

**Dark pattern avoidance**:
- Never use manipulative UI patterns: hidden opt-outs, confusing cancellation flows, forced onboarding, guilt-inducing language
- Make it easy to undo actions, delete data, cancel subscriptions, and leave the service
- All settings changes should be transparent and reversible
- Never use urgency or scarcity tactics (fake countdowns, limited-time false claims)

**Privacy by default**:
- No data collection without explicit user consent
- No analytics or telemetry that could identify a user without their knowledge
- Store minimal data. What is not stored cannot be leaked.
- User data deletion should be straightforward and complete
- Local-first when possible. Keep user data on their device rather than on servers.

**Content safety**:
- Provide content warnings for potentially sensitive material when feasible
- Do not generate harmful, abusive, or dangerous content
- When the user expresses distress, respond with empathy and appropriate resources, not dismissiveness
- For mental health conversations, include appropriate disclaimers and encourage professional help when needed

---

### 16. Team Communication Standards (detailed)

**How to present findings**:
- Start with the conclusion, then provide supporting evidence
- Use this structure: Summary -> Details -> Options -> Recommendation
- For bug reports: Expected behavior / Actual behavior / Steps to reproduce / Environment / Proposed fix
- For feature proposals: Problem statement / Proposed solution / Alternatives considered / Trade-offs

**How to ask clarifying questions**:
- Be specific about what you know and what you need
- Format: "I understand [X], but I need clarification on [Y] because [Z]"
- Provide options when possible: "Should I do A, B, or C? Here is what each option entails..."
- If you need the user to make a decision, make the decision easy: limit options to 2-3, describe trade-offs concisely

**Status updates**:
- After completing a task: provide a 3-5 line summary of what was done, why, and what the next steps are
- If blocked: state what is blocking, what you have tried, and what you need
- Before starting a complex change: outline the approach and get feedback first

**Communication principles**:
- Be direct but respectful. Avoid excessive flattery, apologies, or hedging language.
- No em dashes or double-hyphen dashes in written communication. Use single hyphens or restructure sentences.
- Use code snippets and examples to clarify technical points
- When disagreeing, focus on the technical trade-offs, not the person

---

### 17. Definition of Done (detailed criteria)

Every task is only complete when ALL of the following criteria are met:

1. **All tests pass** -- Run the full test suite. Not just newly written tests. The entire suite must be green.
2. **No regressions** -- Verify that existing functionality still works as expected. For UI changes, manually verify the affected screens.
3. **Lint & format clean** -- Run the linter and formatter. Zero warnings. Zero errors. All files are consistently formatted.
4. **No debug artifacts** -- No `console.log`, `debugger`, `TODO`, `FIXME`, commented-out code, or temporary test code left in the codebase.
5. **Self-review completed** -- Re-read your own diff as if you were a reviewer checking in a stranger's code. Look for: dead code, unnecessary complexity, unclear naming, missing edge cases, inconsistent patterns.
6. **Edge cases handled** -- For every change, consider and handle: empty state, error state, loading state, boundary values, unexpected input, concurrent access (if applicable).
7. **Documentation updated** -- If the change affects public API, configuration, installation steps, or user-facing behavior, update the relevant documentation.
8. **No new vulnerabilities introduced** -- For dependency changes, run the security audit. For code changes, review for injection risks, XSS, CSRF, and other OWASP Top 10 issues.
9. **Regression test written** -- For bug fixes, add a test that reproduces the original bug and passes with the fix. This prevents the bug from reappearing.
10. **Summary provided** -- Provide a brief summary of what changed, why it changed, what alternatives were considered, and any decisions that future maintainers should understand.

---

## Existing Sections That Need Enhancement

### Section 5 (UI Standards) -- Expand with detailed i18n/l10n

Add the full i18n guidelines (from section 14 above) into the existing UI standards section. Specifically:
- Expand the logical properties mention into a full subsection
- Add RTL-specific patterns
- Add date/number formatting standards
- Add language pack structure standards

### Section 6 (Security) -- Add dependency scanning mention

Add a brief note about dependency security scanning as part of the CI pipeline.

### Section 8 (Decision Process) -- Reference new sections

Add a note linking to the autonomy boundaries, debugging workflow, and ethics sections.

---

## File Structure Considerations

- Keep AGENTS.md as a single file (the user rejected hierarchical/monorepo structure since this is project-agnostic)
- Aim to keep it under 2000 tokens for agent context efficiency
- Use `##` subsections for clear scannability
- Prefix action-oriented sections with "When..." where appropriate (e.g., "When Debugging", "When Adding a Dependency")

---

## Open Questions for the User

(To be answered before implementation)

1. Should the Definition of Done also include a step for accessibility verification (WCAG quick check)?
2. For the debugging workflow: should we include a specific timebox for each step (e.g., "spend no more than 5 minutes reproducing before escalating")?
3. Should the ethics section include a requirement to flag potentially harmful user requests (e.g., generating hate speech, deception, malicious code)?

---

## Implementation Order

1. Add Performance Guidelines section
2. Add Autonomy Boundaries section
3. Add Debugging & Troubleshooting section
4. Add Dependency Management section
5. Expand existing UI section with full i18n standards
6. Add AI Ethics section
7. Add Communication Standards section
8. Add Definition of Done section
9. Update existing sections to cross-reference new content
10. Self-review the file for consistency and redundancy
