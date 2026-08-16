# Changelog

All notable changes to Darya are documented here. Darya follows
[Semantic Versioning](https://semver.org/). The full feature and
pipeline details live in the [README](README.md) and the upgrade spec
(`darya-comprehensive-upgrade-spec.md`).

## [1.3.0] - 2026-08-16

### Added

- **CI on every push and pull request.** A new
  `.github/workflows/ci.yml` runs the full release gate (ESLint,
  Stylelint, the Prettier format check, and the complete test suite
  including the browser e2e suites) on every push to any branch and on
  every pull request, not only when a version tag is pushed. The
  Android build workflow still re-runs the same gate before any APK/AAB
  build, so a regression is caught at PR time, long before release.
- **Version-bump helper script.** `npm run version:bump 1.3.1` syncs
  the version across `package.json`, `package-lock.json`,
  `manifest.json`, and the Android local build defaults in one step. It
  validates the new version, refuses downgrades, derives versionCode
  exactly like CI does (1.3.0 -> 130), supports `--dry-run` previews,
  and is covered by its own test suite. The README now documents both
  the script and the manual steps in a "Changing the Version" section.

### Changed

- **Version bumped to 1.3.0** in `package.json`, `package-lock.json`,
  `manifest.json`, and the Android local build defaults (versionCode
  130 / versionName "1.3.0"). Bumping `package.json` also refreshes the
  service-worker precache name, so returning visitors fetch the new app
  shell on their next load.

### Validated

- 1076/1076 tests pass, including the browser e2e suites and the new
  version-bump script tests.
- ESLint (0 warnings), Stylelint, and Prettier are clean.

## [1.2.4] - 2026-08-14

### Fixed

- **Send button vertically centered in the composer.** The composer flex
  container aligned its children to the bottom edge, so the send button
  stayed pinned to the lower corner while the auto-growing textarea
  stretched upward on multi-line input. The button now stays centered
  against the input at any height.

## [1.2.3] - 2026-08-13

### Changed

- **Android release artifacts carry the version in their filename.**
  Release AAB and APK downloads are named `Darya-1.2.3-release.aab` and
  `Darya-1.2.3-release.apk` instead of the module-derived `app-release.*`,
  so a newer release never silently overwrites an older download on disk.
- **CI actions upgraded to current majors.** The Android build workflow
  now pins checkout@v7, setup-node@v7, setup-java@v5, and
  upload-artifact@v7. The previous v4 pins ran on the deprecated Node 20
  action runtime, whose support cutoff passed on June 2, 2026.

### Fixed

- The Android workflow's CI-gate comment named an 852-test suite; it now
  names the real 921-test suite.

### Validated

- 921/921 tests pass, including the browser e2e suites running in a real
  Chrome.
- Two verbose stress rounds of the engine suite pass 2/2.
- actionlint 1.7.12 reports zero issues on the Android build workflow.

## [1.2.2] - 2026-08-13

### Fixed

- **Real launcher icon on Android.** The Capacitor-generated default icon
  is replaced with the actual Darya launcher icon for the release APK and
  AAB.

## [1.2.1] - 2026-08-12

### Added

- **World knowledge shelf.** A new curated fact base covering finance and
  investing (bitcoin and blockchain, the stock market, dollar-cost
  averaging, gold, OPEC, the IMF, inflation), politics basics, and
  Persian cooking (fesenjan, jujeh kabab, tahdig, ash reshteh, mirza
  ghasemi), answered directly in both languages and guarded by an
  honest financial-risk disclaimer.
- **Short-story pools.** "Tell me a story" / «یه داستان بگو» now serves
  original mini-stories in three genres (general, horror, comedy), with
  genre selection from the request and a "another one" / «یکی دیگه»
  follow-up that continues the same kind.
- **Social comparison thread.** Comparing yourself to the highlight reel
  of friends, classmates, siblings, or social media (Instagram,
  TikTok, LinkedIn) gets its own warm pool instead of a generic line,
  in both languages.
- **Overwork-and-stuck thread.** Working two jobs or a salary that
  barely covers the month gets empathy that names the exhaustion, not
  a philosophy essay or an evasive fallback.
- **2033 career horizon.** Future-of-jobs questions ("what jobs will
  exist in 2033", «توی سال ۲۰۳۳ چه شغل‌هایی هست») route to the same
  curated career facts as the 2026-2030 decade.
- **Modern Persian openers.** Time-prefixed how-are-you greetings
  («امروز چطوری»), the formal «چطورید», and affectionate tails like
  «جیگرم», «زیبارو», and «خوشگله» are recognized as greetings.

### Changed

- The Persian knowledge gate now opens for «چرا» questions
  («چرا تورم بالاست») without firing from inside words like «چراغ»,
  and for cooking how-to framings («طرز تهیه»).
- World-economics questions that share keywords with the personal money
  rule («تورم», "inflation", «بورس», "stock market") reach the
  knowledge shelf instead of the financial-stress pool; personal
  disclosures («پول ندارم», «قرضم زیاده») stay empathetic.
- Entertainment replies (jokes, stories, fun facts) remember their kind
  for a few turns so a bare "another one" continues the same thread.
- Turkish-origin vulgar slang (سیکیر and its inflections) is treated as
  an insult with the calm boundary reply, in line with the transcript
  probe.

### Fixed

- English "feel guilty" now matches the self-esteem rule (a spacing bug
  in the pattern required two spaces and silently dropped the phrase).
- Persian «خانوادم» (colloquial possessive, missing the ه) is caught by
  the family rule, so family money pressure and comparisons stay on the
  family thread.
- Persian mood-recall questions («حالم چطوره») with no recorded data
  answer honestly instead of evasively.
- Bare "falling behind" no longer hijacks workaholic anxiety; it needs
  a comparison target ("falling behind everyone") to reach the social
  comparison thread.
- Subject-continuation regressions: the subject-preference guard now
  actually works (its window constant was never exported, making it dead
  code), keeps a fresh specific subject when a generic advice topic
  fires, and unions the subject topic with matched topics instead of
  replacing them.
- Continuation refreshes are capped, so a chatty unmatched user cannot
  keep one subject alive forever; an abandoned thread still ages out
  into the honest-unknown pool.
- A generic advice subject (friendship) no longer blocks a fresh
  "what should I do" turn from reaching the advice pool.
- The wild-daily comparison test asserted only a subset of the
  comparison pool's variants, making it flaky; its regex now covers the
  whole pool.
- The wild-passions and quick-replies e2e suites were written but never
  wired into `npm test` or the smoke runner; they now run in CI.
- Added a browser e2e test that proves the offline contract end to end:
  the service worker precaches every URL it declares, and the app still
  loads and answers requests after the server is fully shut down.

### Validated

- 921/921 tests pass, including the new knowledge-world,
  wild-conversation, wild-daily, and wild-passions routing coverage,
  plus the offline service-worker e2e.
- 291/291 smoke checks pass.
- Zero evasive fallbacks across the 60-phrase daily-life probe
  (financial anxiety, family pressure, social comparison) in both
  languages.
- ESLint (0 warnings), Stylelint, and Prettier are clean.
- Offline and PWA behavior verified in a real browser: the service
  worker precaches the new fact file, quick-reply chips render with
  44px touch targets, and knowledge answers work fully offline.

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
- **Persian normalization audit.** ئ to ی and Arabic look-alike (ي/ك/ة/ؤ)
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
