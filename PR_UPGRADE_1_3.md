# Darya Intelligence & Context Upgrade (v1.3)

## Summary

This upgrade raises Darya's intelligence, response clarity, and
conversation memory in both English and Persian, guided by a real
audit of the engine's outputs. It fixes concrete bugs found by probing
the live engine, adds genuine context-window/memory capability, makes
reflective follow-ups clear and answerable in everyday language, and
ships 104 new tests (23 regression + 81 multi-turn scenarios) that pin the behavior.

The full CI gate passes: lint, stylelint, prettier, and a 1025-test
suite with zero failures (up from 921 tests before the upgrade).

## What changed

### 1. Fixed bugs found by probing the live engine

- **Short-topic knowledge questions now answer.** "what is rizz?",
  "explain cbt to me", "what is aura", «rizz یعنی چی», «cbt چیه» fell
  below the confidence floor and returned a generic reply because the
  floor was length-proportional. A flat `FRAMED_TOPIC_BONUS` in
  `js/data/knowledge-base.js` lets a clear framed question that names a
  short topic word resolve, gated on the existing question framing so it
  can never unlock a bare topic mention.
- **Square root with "of" now works.** "what is the square root of 144?"
  was unanswered because the parser accepted Persian «از» but not the
  English "of". Both connectors are now consumed.
- **New knowledge: Hafez of Shiraz and George Orwell / 1984.** Previously
  "tell me about the Persian poet Hafez" and "who wrote 1984" both fell
  to the unknown pool. Added bilingual entries in
  `js/data/knowledge-facts-entertainment.js`.
- **Astronomy fun-facts filter.** "tell me a fun fact about astronomy"
  and «درباره نجوم یه حقیقت بگو» drew from the whole pool (returning
  random sports/olympic facts). Added astronomy keywords to the space
  category in `js/engine/factual-fun-facts.js`.

### 2. Much broader emotional and lived-experience coverage

- **Despair phrases route to depression support** in both languages:
  "tired of life", "I am done with everything", "life feels pointless",
  «از زندگی خسته شدم», «زندگی بی معنی شده», «دیگه طاقت ندارم», and more.
- **The same-rule streak guard no longer degrades repeated heavy
  disclosures.** A third consecutive depression/grief/safety turn used to
  get an incoherent "let us return to the topic" reply. Heavy topics are
  now exempt so the empathy stays present every turn.
- **New `achievement` rule** celebrates promotions, raises, exam passes,
  graduations, new jobs, engagement, and purchases in both languages,
  instead of reading good news as work stress.
- **New `burnout` rule** distinguishes deep overwork exhaustion
  ("I work 80 hours a week", «سوختم») from ordinary stress.
- **New `lost_passion` rule** meets the fading of a hobby/creative spark
  as a real quiet grief instead of the unknown pool.
- **New `family_loss` rule** keeps "my mother passed away" on the grief
  thread instead of the family-conflict framing.
- **Persian crisis phrasing is matched broadly**: «دلم می‌خواد به خودم
  صدمه بزنم», «دیگه نمی‌خوام زنده باشم», «می‌خوام خودمو بکشم» all route
  to the 123 / 1480 safety reply.

### 3. Clearer, more answerable follow-ups (everyday language)

Reflective questions were often too cryptic to answer ("what is the
worry predicting will happen?", «وقتی نگرانی می‌آید، معمولاً چه
پیش‌بینی می‌کند؟»). They are now phrased plainly and concretely in both
languages, for example:

- EN: "When you get anxious, what does your mind usually predict will
  happen? Does it jump to the worst case?" / "Where do you notice the
  anxiety first in your body, like your chest, stomach, or somewhere
  else?"
- FA: «وقتی مضطرب می‌شوی، ذهنت معمولاً چه چیزی را پیش‌بینی می‌کند؟
  مثلاً می‌گوید بدترین اتفاق می‌افتد؟» / «اولین بار این اضطراب را کجای
  بدنت حس می‌کنی؟»

A warm `_default` continuation pool was added so subjects without their
own follow-up questions (caregiver, chronic illness, and friends) get a
caring "I am still here with you" instead of a dead-end "let us return
to the topic" line.

### 4. Context-window and memory improvements

- **Emotional-shift acknowledgment.** The emotion trajectory was recorded
  but never read. Darya now gently acknowledges when the user's mood
  visibly improves across turns ("You sound lighter than you did
  earlier. Has something eased?"), rate-limited and gated so it only
  fires on a genuine recovery from a heavy state, never on safety turns.
- **Name-capture fix.** «فقط من موندم» (I was the only one left) wrongly
  stored «موند» as the user's name. Added common first-person past-tense
  verb stems to the Persian name stopword list.

## Tests

Three new suites (registered in `package.json`):

- `tests/upgrade-fixes.test.mjs` - 23 targeted regression tests, one per
  fixed bug.
- `tests/upgrade-scenarios.test.mjs` - everyday persona scenarios
  (promotions, despair, grief, new parents, caregivers, burnout, crisis,
  loneliness, and more) in both languages.
- `tests/upgrade-scenarios-deep.test.mjs` - 37 deep multi-turn personas
  spanning passions, entertainment, breakups, loneliness, loss,
  jealousy, anger, sadness, poverty, depression, excitement, flirty
  users, rude users, and the emotional-shift memory touch.

All suites are flakiness-checked over repeated full runs.

## Files touched

Engine and data: `js/data/knowledge-base.js`,
`js/data/knowledge-facts-entertainment.js`,
`js/engine/factual-fun-facts.js`, `js/engine/factual-math.js`,
`js/engine/responder-emotion.js`, `js/engine/responder-overrides.js`,
`js/engine/responder-rules.js`, `js/engine/utils-constants.js`,
`js/engine/utils.js`.

Language packs (EN/FA): rules, response pools, question pools, identity
pools, and the Persian name stopword list.

Docs: `README.md` feature and testing sections.

## Verification

`npm run test:full` (lint + stylelint + prettier + tests) passes with
1025 tests, 0 failures, 8 skipped (browser e2e that need Chrome).
Repeated `npm test` rounds show zero flaky failures.
