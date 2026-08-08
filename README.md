# Darya

_A calm conversation companion._

Darya is a thoughtful, bilingual (Persian/English) conversation companion that listens and responds with care. Pick a language, choose your theme, and start a conversation. No sign-up, no data collection, and no network requests: everything runs locally in your browser.

Think of Darya as a quiet, attentive friend who remembers what you have said during your conversation, notices how you are feeling, and asks gentle follow-up questions. It is not a substitute for professional support. It is a calm space to think out loud.

## Features

- **Bilingual from the start.** Choose Persian or English. The language stays with you for the whole conversation.
- **Two visual themes.** Ocean (deep, calm blues) or Beach (bright sand and surf). Your preference is remembered between visits.
- **Calm ambient soundscapes.** Optional theme-matched background audio (beach or ocean sound loops). Muted by default, cross-faded smoothly when you switch themes, and remembered between visits.
- **Real conversation flow.** Darya recognizes a wide range of topics (family, work, sleep, anxiety, joy, grief, and more), asks thoughtful questions, and keeps track of what matters to you.
- **Emotional awareness.** When the conversation feels heavy, Darya may offer a gentle breathing exercise or a grounding pause.
- **Time and calendar answers.** Ask for the current time or date and Darya replies in your language and calendar, with both Jalali and Gregorian dates for Persian.
- **Quick facts and math.** Darya answers arithmetic, percentages, square roots, random numbers, primality checks, and even coin flips ("flip a coin", "شیر یا خط") in your language.
- **Professional handling of hostility.** Insults, bullying, and inappropriate comments aimed at Darya are met with calm, boundary-setting responses, never with an argument.
- **A joke when you need one.** Ask for a joke or a laugh ("tell me a joke", "بخندون من") and Darya shares clean, kind humor in your language.
- **Help starting the conversation.** Not sure how to begin? Say "how do I start?" or "نمیدونم چی بگم" and Darya offers easy, low-pressure openers. If you stay silent after the greeting, she gently breaks the ice herself with a light question.
- **Honest shopping guidance.** Darya cannot make purchases, and says so plainly, then helps you think the purchase through: needs, budget, and how to compare options.
- **Support for heavier feelings.** Prolonged low mood is met with empathy and a gentle nudge toward professional support, never a diagnosis. An adult disclosing attraction toward a minor always receives a calm, non-shaming reply that is clear about the harm and points to confidential specialist help.
- **Offline and private.** Everything runs in your browser. No network requests are made at any time. Conversation data is kept only in your browser tab.
- **Conversation export.** Download your chat as plain text whenever you like.

## Quick Start

1. Open the page.
2. Choose Persian or English.
3. Pick your preferred theme (Ocean or Beach).
4. Darya will greet you. Just start typing like any chat app.

That is all. No accounts, no setup, no configuration.

## How the Engine Works (Behind the Scenes)

Darya's conversation engine runs entirely in your browser. Every response
is generated locally. No conversation is recorded outside your tab, and
nothing is persisted after you close it. No network requests are made
at any time.

### The Response Pipeline

Each turn follows a deterministic pipeline:

1. **Input validation**: Empty input, wrong script (e.g. Arabic text in
   English mode), and mixed-language input are caught early with
   appropriate redirection.

2. **Normalization**: The raw text goes through two parallel paths:
   - One version applies Unicode normalization, quote unification, and
     whitespace cleanup. This version is stored in conversation memory
     so Darya can quote the user back naturally.
   - A second version additionally strips punctuation, removes zero-width
     characters, expands common chat abbreviations (e.g. "btw" to
     "by the way", "idk" to "i do not know"), and for Persian unifies
     progressive prefix spelling variants ("می شود", "می‌شود", "میشود"
     all collapse to one canonical form). This expanded form is used
     only for pattern matching and is never stored in memory. Darya never
     quotes "i do not know" back at someone who typed "idk".

3. **Rule matching**: Darya maintains a priority-sorted list of topics
   (stress, family, grief, joy, gratitude, safety, and many more). Each
   topic has a regex pattern and a pool of varied responses. The highest-
   priority matching rule selects the response pool.

4. **Dialogue act classification**: Each turn is classified as one of:
   greeting, question, statement, emotional statement, acknowledgement,
   correction, gratitude, affirmation, negation, test input, or safety.

5. **Response strategy selection**: Based on the matched rule, topic
   blend, and reference context, the engine picks a strategy:
   topic-question, topic-reflection, context-reference, topic-blend,
   contextual-fallback, and others.

6. **Smart overrides**: Several detectors can override the normal
   response path when specific signals are present:
   - **Frustration/insult detection**: Triple exclamation marks,
     repeated question marks, and expanded insult patterns trigger calm
     de-escalation responses.
   - **Teasing/mocking detection**: Sarcastic praise, dismissive signals,
     condescending phrases, and mock agreement are detected with a
     signal-threshold system.
   - **Harassment handling**: Insults, bullying, and inappropriate
     sexual comments directed at Darya are detected before the general
     insult check and answered from dedicated boundary-setting pools.
   - **Word repetition**: If a word appears 4+ times across recent
     turns, Darya gently points it out.
   - **Wellbeing checks**: After a few heavy turns, asking "how are
     you?" triggers a thoughtful check-in.
   - **Boredom detection**: After a streak of very brief replies,
     Darya may invite the user to share more.
   - **Depression support**: Prolonged low mood, hopelessness, and
     emptiness are acknowledged with empathy and a gentle, real nudge
     toward professional support, never a diagnosis.
   - **Child-safety protection**: An adult disclosing sexual or romantic
     attraction toward a minor always receives a calm, non-shaming
     reply that is clear about the legal and real harm, separates
     thoughts from actions, and points to confidential specialist help
     (Stop It Now and mental health professionals). The detection
     requires adult context, attraction phrasing, and a minor-age
     marker together, so a teenager's own peer crush or ordinary family
     affection never triggers it, and no later override can replace it.

7. **Emotional calibration**: The engine detects primary emotions (sad,
   anxious, angry, grieving, overwhelmed, excited, etc.) through keyword
   patterns and adjusts the tone of the response with an appropriate
   emotional prefix.

8. **Human touch**: Darya may add a gentle follow-up line, a pronoun
   reflection ("I feel" to "you feel"), or a quote of something the
   user said earlier, giving the conversation a natural, attentive feel.

9. **Memory recording**: All relevant metadata (topic, sentiment,
   entities, dialogue act, strategy) is recorded in conversation memory
   for contextual continuity in future turns.

### Bilingual Architecture

The engine itself is entirely language-agnostic. All rules, patterns,
and configuration live in language packs with identical structure. Each
pack provides:

- A normalization function for memory storage
- A progressive-prefix binding function (Persian only) that unifies
  "می شود", "می‌شود", and "میشود" for rule matching
- A priority-sorted rules list with regex patterns and response pools
- Topic seriousness values that control question-asking behavior
- Insult, teasing, and frustration detection patterns
- Greeting, farewell, and other UI pools
- A sentiment lexicon for lightweight positive/negative scoring
- Entity callback templates for recalling named entities

### Knowledge Shelf and Factual Layer

Darya carries two offline knowledge layers, both fully offline with no
network calls.

**Reflective shelf (18 domains):** philosophy, thinkers, focus, learning,
communication, creativity, mindfulness, stress, self-compassion, conflict,
decision-making, grief, resilience, forgiveness, purpose, relationship,
career, and anxiety. Each domain has 4 entries in both English and Persian
(thinkers has 10 curated entries, one per historical figure). When the
user asks for guidance on these emotional and growth topics, Darya draws
from this shelf rather than fabricating advice.

**Factual layer (world knowledge, 2020s culture, careers):** a keyword-
scored fact base that answers concrete questions directly: science (the
Sun and every planet from Mercury to Neptune, Jupiter, quantum physics,
black holes, the solar system), technology (2026 tech stacks, AI, how to
start programming, backend vs frontend, the Internet of Things),
careers and money (freelancing, remote work, portfolios, the Iranian job
market), education (choosing a college major, preparing for the Iranian
konkur, career paths for teenagers), professions (carpentry, mechanical
engineering, sculpture, music and singing, acting, mathematics degrees,
diving, firefighting), culture and entertainment (a curated list of
non-mainstream movies and series from Iranian and world cinema, plus
per-genre lists for horror, romantic, comedy, dark comedy, fantasy,
thriller, sci-fi, documentary, animation, short series, and stories
based on true events), life decisions
(marriage and children, respectful guidance on religion), modern
culture (Gen-Z slang like rizz and brain rot, TikTok and the internet,
ghosting and dating culture, quiet quitting), Persian language
(half-space rules, ezafe, tanvin, common insults), relationships (crush
confessions, breakup healing), practical advice (sleep, study
techniques, quick stress relief, imposter syndrome), video games
(classic consoles from the PlayStation 1 era, modern consoles, mobile
picks, and per-genre lists), concrete career plans for common paths
(software development, data science, design, teaching, marketing,
entrepreneurship), psychology and health basics (CBT, neuroplasticity,
sleep needs), sports (football rules, the Olympics, the marathon),
history (the Achaemenid Empire and Cyrus the Great, the Egyptian
pyramids, the Berlin Wall), cooking and food (Persian cuisine, saffron,
tea culture), relationships (healthy relationship plans and respectful,
shame-free sex education covering consent and boundaries), and the
project itself (Darya can point to its own open-source repository).
Knowledge talk is sequential: after any
factual answer, a short follow-up naming a topic refines the
conversation in place ("in horror genre please" after movie
suggestions, "and Saturn?" after Jupiter, "بیزینس" after career
advice, "and consent?" after relationship talk); ambiguous fragments
such as "مشتری جذب کنم" are never
hijacked. The lookup
scores keywords against the normalized input, requires question framing
for ambiguous terms (so "مشتری" as a customer never triggers the Jupiter
entry), and only fires on confident matches. Factual questions are
answered directly in both languages; emotional disclosures are never
hijacked by the factual layer. A separate curated fun-fact pool (89 verified facts per language across
13 categories: science, space, animals, history, the human body, food,
technology, life skills, social connection, relationships, sports, art
and music, and money and finance) answers "tell me 3 facts", "give me
just one shocking fact", "حداقل سه تا حقیقت بگو", and topic-filtered
requests like "facts about space". When a question falls outside the
offline
knowledge base, Darya says so honestly and can point to reliable sources
(Wikipedia, reputable educational channels, qualified experts) instead
of fabricating an answer. Crisis language (suicidal thoughts,
hopelessness, self-harm) always routes to a supportive safety response
with professional help resources.

### Entity Memory

Darya tracks named entities (people, places, topics the user mentions)
with activation scores that decay over time. Corrections ("I meant my
manager, not my mother") are handled gracefully: the old entity is
removed and the corrected one is promoted. Entities with high enough
activation may trigger a gentle callback ("That mother thread is still
with us...") when the topic is relevant.

### Conversation Examples

#### English Example 1: Emotional support

**User:** "I am so stressed about this deadline"

**Step by step (behind the scenes):**

1. The raw input is received.
2. The memory version stores the text as typed: "I am so stressed
   about this deadline". This is kept for potential quoted callbacks.
3. The matching version produces the same text (no abbreviations or
   punctuation to strip).
4. The rule matcher iterates the priority-sorted rule list. The anxiety
   rule (which matches "stressed") fires first.
5. Dialogue act classification returns "statement".
6. Response strategy selection picks "topic-question": anxiety has high
   seriousness, and the question budget allows one follow-up question.
7. A topic-specific question for anxiety is selected, e.g. "Does the
   worry feel constant or does it come in waves?"
8. Emotional calibration checks for a primary emotion keyword. "stressed"
   does not appear in any emotion pattern, so no prefix is added.
9. The reply is returned to the UI for display.

#### English Example 2: Abbreviation expansion + frustration detection

**User:** "wtf are you talking about"

**Step by step (behind the scenes):**

1. The raw input is received.
2. The memory version stores: "wtf are you talking about". The original
   abbreviation is preserved for natural quoted callbacks.
3. The matching version applies abbreviation replacements. The pattern
   matches "wtf", producing: "what the fuck are you talking about".
4. Rule matching runs against the expanded text. No standard topic rule
   matches (this is not a greeting, emotional statement, etc.).
5. After normal routing completes with a fallback reply, the frustration
   override check fires.
6. The insult pattern tests the matching text. It contains "fuck", so
   the insult flag is set.
7. Since the input is not a safety turn, the frustration override fires.
8. The reply is replaced with a calm de-escalation response.
9. Memory is unaffected: the stored utterance remains "wtf are you
   talking about". The expanded form is never persisted.

#### English Example 3: Entity memory and callback

**User (turn 1):** "I am really worried about my mother"

**Step by step (behind the scenes):**

1. Sentiment analysis: "worried" is in the negative lexicon, so entity
   extraction is enabled this turn (neutral turns skip extraction).
2. The entity extractor finds the person "mother" (confidence 0.94,
   family vocabulary) and stores it with activation 0.94 and context
   topic "family".
3. The family rule matches (topic seriousness 0.7). Darya responds with
   a family question and does not mention mother (the first-mention
   guard prevents a callback on the same turn).

**User (turn 2):** "She has been unwell for a while"

1. Turn 2 begins: entity activation decays by 18% per turn. Mother
   becomes 0.94 x (1 - 0.18) = 0.77, still above the 0.6 callback
   threshold.
2. The input is classified, and the health/family context keeps mother
   relevant.
3. The entity callback check runs: mother (activation 0.77 > 0.6) is
   eligible, and the 55% probability passes.
4. A callback template is selected, replacing the placeholder with
   "mother": "That mother thread is still with us. Its place in your
   day seems worth noticing."

#### Persian Example 1: Half-space processing + gratitude routing

**کاربر:** "دست‌ت درد نکنه خیلی کمک کردی"

**Step by step (behind the scenes):**

1. The half-space normalizer runs: Arabic character substitution, digit
   conversion, diacritic stripping, and progressive prefix correction.
   The ZWNJ in "دست‌ت" is already correct.
2. Stored in memory: "دست‌ت درد نکنه خیلی کمک کردی" (with ZWNJ intact).
3. The matching version converts ZWNJ into a plain space, so "دست‌ت"
   becomes the two tokens "دست ت" in the matching text.
4. The rule matcher runs. The gratitude rule matches the idiom: its
   pattern accepts both the joined form and the space-normalized form.
5. Teasing detection finds no sarcasm signals.
6. The gratitude response pool is used. One response is selected.
7. Emotional calibration is skipped because the dialogue act is
   "gratitude" (a light topic), so the word "درد" inside the idiom does
   not trigger a hurt prefix.

#### Persian Example 2: Insult detection and de-escalation

**کاربر:** "تو خیلی احمق هستی"

**Step by step (behind the scenes):**

1. The half-space normalizer runs. No changes needed.
2. Stored in memory: "تو خیلی احمق هستی".
3. The matching version strips zero-width characters. No changes.
4. Normal routing runs. No standard topic rule matches this insult.
5. Frustration override check:
6. The insult pattern tests the matching text. It uses Unicode-aware
   word boundaries. The word "احمق" is surrounded by spaces, so both
   boundaries match. The insult flag is set.
7. The turn is not a safety turn, so the frustration override fires.
8. The reply is selected from the frustration response pool.
9. Darya responds with calm de-escalation. It does not argue, does not
   get defensive, and does not repeat the insult back to the user.

#### Persian Example 3: Knowledge domain query

**کاربر:** "به من درباره تمرکز توضیح بده"

**Step by step (behind the scenes):**

1. The half-space normalizer processes the input. No changes needed.
2. The matching version keeps the explicit request wording: "به من
   درباره تمرکز توضیح بده".
3. Rule matching: the knowledge rule pattern matches because the input
   is an explicit request ("درباره" + "توضیح بده" are knowledge
   keywords). Personal disclosures that merely mention a topic are
   intentionally routed to the lived-experience rule instead.
4. Since the matched topic is "knowledge", all smart overrides check
   whether the topic is knowledge and are suppressed. The response
   stays informative rather than emotional.
5. The offline knowledge shelf queries the focus domain. It returns 4
   curated Persian entries on focus techniques.
6. One entry is selected from the shelf.
7. The reply contains practical wisdom on concentration, never fabricated
   advice.

## What Darya Can Talk About

Darya recognizes a broad set of everyday topics:

- Family: parents, siblings, relationships
- Work and school: career, study, exams, stress
- Emotions: sadness, anxiety, anger, joy, loneliness
- Sleep and health: rest, well-being, physical concerns
- Grief and loss: mourning, remembering, healing
- Self-esteem and motivation: confidence, purpose, growth
- Finances: money worries, planning
- Relationships and careers: connection, growth, and big decisions
- Wisdom topics: philosophy, creativity, decision-making, and mindfulness

Darya will never diagnose, prescribe, or give professional advice. For
medical, legal, or financial decisions, please consult a qualified human
professional.

## Privacy

Darya has no accounts, no analytics, no tracking, and no server-side processing. Your conversation exists only in your browser tab. When you close the tab, the conversation is gone.

The only persistent data is your theme preference (Ocean or Beach) and ambient sound toggle state, each stored as a simple cookie so they are remembered on your next visit.

Darya makes no network requests at any time. No data is sent to any server, no analytics are collected, and no external APIs are called while the app is running. The app works fully offline from the first visit onward, with no telemetry, no tracking, and no background network activity of any kind.

## Offline Use

After the first visit, Darya works fully offline. You can install it on your phone or desktop as a Progressive Web App. See the OFFLINE.md file for details.

## Testing and Development

The project ships with dependency-free test suites:

- **`npm start`** serves the app locally on port 8080.
- **`npm test`** runs the Node.js engine test suite using only
  Node's built-in test runner.
- **`npm run test:smoke`** runs a shell check that verifies the file
  structure, JS syntax, and that every asset serves correctly over a
  throwaway local server.
- **`npm run test:full`** runs lint, CSS lint, formatting check, and
  the full test suite together, matching the CI gate.
- **`bash run-tests.sh -n 50`** stress-runs the engine tests 50 times
  and reports a pass/fail summary per round, useful for shaking out
  flaky assertions.
- **`npm run lint`**, **`npm run lint:css`**, and **`npm run format:check`** verify Google-style
  ESLint, Stylelint, and Prettier compliance without modifying files.

## License

Copyright (c) 2026 Artin Mohammadi. Licensed under the PolyForm Noncommercial License 1.0.0. See [LICENSE.md](LICENSE.md) for the full terms. This license allows personal and noncommercial use only. Commercial use requires a separate agreement.
