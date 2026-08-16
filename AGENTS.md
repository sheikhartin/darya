# AGENTS.md: Software Development Standards

> Project-agnostic conventions for JavaScript, TypeScript, and Python
> projects. Build maintainable, testable, accessible, performant
> software. Prefer simple solutions over clever ones, and reliable,
> well-adopted tools over trendy ones.

## 1. Architecture and Stack

- Prefer built-in APIs over libraries. Add a dependency only when it
  saves real time or prevents bugs, and only if it is maintained,
  stable, secure, lightweight, and permissively licensed. Never add a
  dependency for trivial functionality.
- Organize code by domain, not by layer. Keep files focused and
  reasonably sized. Compose over inherit; favor explicit data flow and
  visible dependencies. Match the existing style of the codebase.
- Keep source files under 600 lines. When a file approaches the limit,
  split it into part files (see the Darya engine's `responder-*.js`,
  `app-*.js`, and `*-responses-*.js` pattern) rather than growing it.
  Data and response-pool files are part of the source tree too.
- No magic numbers or magic strings: every literal beyond 0, 1, or
  empty string becomes a named constant, ideally grouped in a
  dedicated constants file (see `js/engine/utils-constants.js`) or a
  shared object on the module. This applies to timing values,
  thresholds, probabilities, and message limits alike.
- Fail fast at boundaries: validate inputs, throw early, catch late,
  never swallow errors.
- New projects default to TypeScript strict mode. Plain JavaScript is
  acceptable for small static pages, legacy code, or prototypes.
- Frontend: React, Vue, or Svelte with strict TypeScript, built with
  Vite. Backend: Node.js with Express, Fastify, or Hono. Python +
  FastAPI when heavy data processing or a Python-native ecosystem
  matters.
- No data collection by default. No analytics or telemetry unless the
  user opts in. Local-first when possible. Offline-first apps allow at
  most one optional, silent-failing network call per session, fired at
  startup, never carrying user data.
- Example names in comments, tests, and docs use Iranian-origin names
  (کوروش, داریوش, آریا, آرتین, سپنتا, باران, آناهیتا) rather than
  Arabic-origin given names like علی or محمد. Fixed Arabic phrases
  (سلام علیکم) are not names and stay as they are.
- The Persian normalizer maps ئ to ی (so «مطمئن» arrives as «مطمین» and
  «رئیس» as «رییس»). Every rule pattern, keyword list, stopword, and
  lexicon that contains ئ must also carry the normalized ی form; the
  same dual-spelling rule applies to Arabic look-alikes (ي/ك/ة/ؤ) that
  the normalizer converts. Display prose keeps the standard spelling
  (جزئیات, سؤال) because output is never normalized.

## 2. Testing

- Testing is not optional. Every feature needs tests; every bug fix
  needs a regression test that would have caught it.
- Structure tests as Arrange-Act-Assert. Name them
  `function_scenario_expected`.
- Isolate tests: no shared mutable state. Mock only external
  boundaries (HTTP, file system, time). Prefer stubs over mocks.
- Aim for meaningful coverage of business logic and edge cases, not
  100%. A PR with complex logic but no tests is not done.

## 3. Code Quality

- Single responsibility: one clear job per function, module, class.
- YAGNI: build what is needed now, but structure it so extension later
  does not require a rewrite.
- No magic numbers: every literal beyond 0, 1, or empty string becomes
  a named constant.
- Review your own diff as if you were the reviewer. Look for dead code,
  debug logs, inconsistent naming, missing edge cases. Keep the whole
  test suite green before finishing.
- Debug systematically: reproduce first, check logs, isolate with
  binary search, write a minimal reproduction, then a regression test,
  and document the root cause.

## 4. UI, Animation, and i18n

- CSS custom properties for theming. Logical properties
  (`inset-inline`, `padding-inline`, `margin-block`) over physical ones
  for automatic RTL/LTR support.
- Mobile-first responsive design, tested at 360, 480, 768, 1024, and
  1440px. No horizontal overflow or cut-off content at any width.
- Transition over animation. Keep transitions between 200ms and 400ms
  with natural easing. Reserve keyframes for continuous effects.
- Animate only `opacity` and `transform` (GPU-composited). Never
  animate width, height, top, left, margin, or padding.
- Every animation needs a `@media (prefers-reduced-motion: reduce)`
  fallback that disables it. Pause animations on hidden or off-screen
  elements to save GPU work.
- Aim for a handcrafted, professional feel: intentional typographic
  hierarchy, meaningful whitespace, balanced palettes, subtle
  micro-interactions, consistent rhythm.
- Accessibility: WCAG 2.2 AA baseline. Semantic HTML, accessible names
  on every interactive element, full keyboard operability, visible
  focus rings, touch targets of at least 44px, contrast of 4.5:1 for
  normal text.
- Use `Intl` APIs for dates, numbers, relative time, and plurals.
  Never format them manually. Keep each locale as one module with all
  translatable strings, including `dir` and `code` fields.

## 5. Security

- OWASP Top 10 as the baseline threat model. Validate input at every
  boundary. Never trust client input.
- Auth tokens: HttpOnly, Secure, SameSite cookies. Never localStorage
  for sensitive tokens.
- Strict CSP, parameterized queries, rate limiting on public endpoints,
  secrets only in environment variables. Pin exact dependency versions.

## 6. AI Ethics

- Be transparent about AI involvement. Never imply emotions, genuine
  understanding, or professional qualifications.
- Use inclusive language. Default to singular "they" when gender is
  unknown. No dark patterns: no hidden opt-outs, forced onboarding,
  urgency, or scarcity tactics. Make undo, delete, and leaving easy.
- Privacy by default: store minimal data, keep it local, make deletion
  straightforward.
- Respond to distress with empathy and encourage professional help.
  When the assistant is insulted, set calm boundaries; never mirror
  hostility. Flag requests for hate speech, deception, or malicious
  code.
- Requests for sexual roleplay or dirty talk directed at the assistant
  (dirty talk, sexting, "be my virtual girlfriend") get a warm,
  non-shaming boundary: acknowledge that desire is natural, state that
  the assistant is a companion for support and reflection rather than an
  explicit roleplay partner, and offer to talk about the feelings
  underneath. Never shame the person, and never engage in explicit
  roleplay. A genuine intimacy or sex-education question ("how do I talk
  about sex with my partner") stays a normal knowledge topic and must not
  be misread as a roleplay request.

## 7. Performance

- Avoid N+1 queries and unnecessary re-renders. Lazy-load heavy assets.
- Use passive event listeners for scroll and touch. Batch DOM reads
  before writes.
- Use `requestAnimationFrame` for visual updates, `setTimeout` for
  delays. Animate only composited properties. Test on low-end devices
  and throttled networks.

## 8. Autonomy

- Requires approval: config files, new dependencies, deleting files,
  production or infrastructure changes, lock files.
- Autonomous: editing source files in scope, running tests and
  formatters, reading docs, minor behavior-preserving refactors.

## 9. Communication

- Present findings as Summary, Details, Options, Recommendation. Start
  with the conclusion. Be direct but respectful. No excessive flattery
  or hedging.
- No em-dashes (U+2014), en-dashes (U+2013), or double-hyphen dashes in
  written communication, documentation, code comments, or responses.
  Use single hyphens, commas, or restructure the sentence.
- No emojis or decorative Unicode in prose, docs, or comments. When
  decorative icons are needed in UI markup, use inline SVG and mark
  them `aria-hidden`.
- Comments explain why, not what. Keep them up to date. Delete
  commented-out code. Write comments in English; Farsi/Persian may
  appear inside a comment only as a short quoted phrase or example
  (e.g. the Persian pool line being explained). Farsi must never be
  the main language of a comment, even in `js/languages/fa-*.js`.
  No other languages, including Chinese, are allowed in comments or
  docs. Darya's codebase is English and Farsi only.
- Keep each language pure in its own replies: an English response uses
  English words and a Persian response uses Persian words. Do not
  code-switch for ordinary vocabulary in either direction. The only
  exceptions are proper-noun titles (movie, game, anime, book names),
  brand/platform names, and quoted foreign sources, which are kept as-is
  in whichever language the reply is written in.
- When a reply is a numbered or bulleted list (movie or game
  recommendations, a fact list), put a blank line after the list and then
  write Darya's own closing sentence or follow-up question on its own
  paragraph, so the list and the closing line stay visually separated and
  easy to read.

## 10. Commits and Docs

- Use Conventional Commits: `type(scope): description` with types like
  `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`,
  `ci`. One PR, one concern. Keep PRs small and well described.
- Keep README for humans: overview, setup, usage. Keep AGENTS.md for
  agents: constraints and conventions not discoverable from code.
  Avoid mentioning project structure or specific code in user-facing
  docs; explain actual pipelines and behavior instead.

## 11. Definition of Done

A task is complete when all of the following hold:

1. Full test suite passes with no regressions.
2. No debug artifacts: no bare console calls, debugger, TODO, FIXME,
   or commented-out code.
3. Self-review completed. Edge cases handled (empty, error, boundary,
   unexpected input).
4. Docs updated if behavior changed. No new vulnerabilities or
   injection risks.
5. Regression test written for bug fixes.
6. A brief summary provided: what changed, why, what alternatives were
   considered.

_This document is a living standard. Update it as tools and practices
evolve. Capture collective wisdom, not rigid rules._
