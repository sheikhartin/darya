# Changelog

All notable changes to Darya are documented here. Darya follows
[Semantic Versioning](https://semver.org/). The full feature and
pipeline details live in the [README](README.md) and the upgrade spec
(`darya-comprehensive-upgrade-spec.md`).

## [1.2.0] - 2026-08-11

### Added

- **Session memory of who you are.** Name and age disclosures are stored
  in memory for the session; "what is my name?" / «چند سالمه؟» are
  answered from what you said, honestly. Children (13 and under) get an
  age-appropriate reply pointing to a trusted adult.
- **Question recall.** «یادته آخرین سوالی که ازت پرسیدم چی بود؟» /
  "do you remember the last question I asked?" quotes your last question
  back from memory, or says honestly when nothing was asked yet.
- **Deferred-topic promise memory.** "I'll tell you later" / «بعداً
  می‌گم» is remembered and circled back to a few turns later; "never
  mind" / «ولش کن» releases it gracefully, and stale promises expire.
- **Guided exercises.** Turn-based state machine for breathing,
  grounding, body scan, and thought record, with tappable yes/no chips
  per step and graceful stop/decline.
- **Session mood tracker.** 1..10 scale chips, band reflection, and a
  later read-back of the recorded mood arc and its direction.
- **Context window, emotion analyzer, personality engine, and response
  scorer.** New engine modules for conversational continuity, structured
  emotion scoring, tone consistency, and reply-quality gating.
- **Verified crisis resources.** Safety replies name concrete hotlines:
  123 and 1480 (Iran), 988 (US/Canada), 116 123 (Europe), always with a
  concrete next step.
- **App-command honesty.** Theme and sound requests are answered by
  pointing to the real UI control, never fake compliance.
- **The story of ELIZA.** Origin questions are answered with substance.
- **Learning support.** A structured method for "how can I learn
  English?" and its Persian equivalent.
- **Daily-life topic expansion.** Dedicated threads for gym anxiety,
  dating-app fatigue, remote-work isolation, postpartum, and pet-loss
  grief, in both languages.
- **Persona conversation coverage.** 26 persona-based scenario fixtures
  across both languages (new parent, night-shift worker, divorce,
  harassment threat, tech frustration, self-worth, and more).
- **Knowledge shelf growth.** New curated facts across science,
  technology, culture, education, entertainment, daily life, and career
  domains, plus expanded fun facts and topic lists.
- **A joke pool** for «یه جک بگو» / "tell me a joke".

### Changed

- **Ambient sound is never persisted.** Every visit starts silent; sound
  plays only after tapping the toggle. The legacy `darya_sound` cookie
  is expired on load.
- **Font loading.** All font weights are preloaded and use
  `font-display: block` to avoid a visible system-to-custom font swap.
- **Notifications redesigned.** The toast card is now a centered glow
  badge with per-severity icons, keeping WCAG AA contrast in both
  themes.
- **Persian normalization audit.** ئ→ی and Arabic look-alike (ي/ك/ة/ؤ)
  variants were added across rules, keywords, stopwords, and lexicons;
  every ئ in a matching structure carries its normalized twin.
- **Question-echo hardening.** Echo answers fire only on short
  fragments and never override higher-intent rules.
- **Offline data exports** and chat export unchanged: everything stays
  in the browser tab.

### Fixed

- Persian «کار» inside «این کار رو» no longer misroutes to the work
  thread (knowledge-expansion and family-conflict overrides).
- «خجالت» apology variants and the ZWNJ spelling of «دوست‌یابی» now
  route correctly in Persian.
- Gym-anxiety phrasing in English now has a dedicated fitness topic
  (EN/FA parity enforced by tests).
- The "acknowledgement dead zone" where a plain "ok" / «آره» got a
  robotic fallback is closed.

### Validated

- 822/822 tests pass, including 126 dialogue scenario fixtures.
- 291/291 smoke checks pass.
- 20/20 repeated stress rounds of the engine suite pass with no flaky
  failures.
- Browser e2e suites pass: WAI-ARIA keyboard contract, sound attention,
  and quick-reply chips.
- ESLint (0 warnings), Stylelint, and Prettier are clean.
- Fully offline: no network calls anywhere; the service worker precaches
  the complete app shell and self-hosted fonts and audio.

## [1.1.0] - 2026-08-08

### Added

- Bilingual support: Persian and English from the start.
- Two visual themes (Ocean, Beach) with remembered preference.
- Calm ambient soundscapes (muted by default at that time).
- Topic recognition across family, work, sleep, anxiety, joy, grief,
  and more.
- Quick facts, math, time and calendar answers (Jalali and Gregorian).
- Conversation export as plain text.
- Professional handling of hostility and verified shopping honesty.

### Changed

- Engine split into focused modules; language packs split into rules,
  data, lookups, and response pools.
- Accessibility pass: keyboard operability, focus rings, contrast, and
  reduced-motion support.

### Fixed

- Repetitive fallback responses in long conversations.
- Persian ZWNJ half-space handling in matching.
