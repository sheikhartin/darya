# Darya (دریا)

Darya is a bilingual (Persian/English) conversation companion in the
tradition of **ELIZA**, the 1966 program by Joseph Weizenbaum that first
showed how a purely keyword-driven, rule-based script could imitate a
Rogerian therapist's reflective listening well enough to feel genuinely
heard, even once people knew exactly how the trick worked. Darya is a
considerably more capable version of that same idea, not a language model:
it recognizes a broad set of topics and common small-talk questions, keeps
a short working memory it can quote back to you, tracks emotional tone
across a conversation to occasionally offer a grounding exercise, and
varies its own phrasing so conversations don't feel mechanical, all
through pattern matching rather than genuine understanding.

Persian and English are built as separate, equally detailed language packs
sharing one engine, chosen once at the start of a conversation and locked
for its duration. A few techniques are deliberately language-specific
rather than force-fit into both: English gets classic ELIZA-style
pronoun-swap reflection, which Persian skips because its grammar carries
person and number in the verb itself, where a naive word-swap would often
break. Two visual themes (ocean and beach) are available and remembered
between visits.

This is not therapy and does not diagnose anything. There's no learning
and no memory beyond a single browser tab's conversation, and the site is
explicit about that limitation rather than overstating what it can do.

## How the conversation engine is built

The engine is a small, fixed conversation pipeline (see
`js/darya-engine.js` for the full code and the rationale behind each
stage):

1. **Input normalization** — language-specific cleanup (Persian
   half-spaces via the vendored @persian-tools halfSpace module,
   Arabic-letter unification, smart-quote folding, etc.)
2. **Language / script check** — the active pack rejects foreign text
3. **Intent detection** — greets, farewells, and bare acknowledgments
   ("ok", "yeah", "باشه") are routed to dedicated handlers rather than
   falling through to a topic-rule match
4. **Rule matching** — priority-sorted topic rules (safety, family,
   work, sleep, sadness, anxiety, anger, joy, loneliness, etc.)
5. **Memory** — recent user utterances, topics, sentiment history,
   Darya's own recent replies, and a light entity-tracking layer for
   resolving references like "it" or "that"
6. **Response strategy selection** — scores several candidate pools
   (topic callback, session check-in, direct-question branch, quoted
   callback, pronoun swap, strategy shift, generic fallback) by weight
   and randomness
7. **Template selection** — chosen from the rule's own response pool
   (or a fallback pool), with non-question templates preferred on
   certain turns to break the perpetual question rhythm
8. **Variation selection** — avoids the last several replies, so a
   long conversation never reads as mechanical
9. **Safety check** — the safety rule is the highest-priority rule and
   is never overridden; the sentiment-based distress nudge (offering
   paced breathing after three consecutive negative-leaning messages)
   is layered on top of non-safety replies only
10. **Final response rendering** — single string handed back to the UI

The engine deliberately never defaults to "How are you?" — the brief
calls that out specifically — and never asks a question just to sound
active. The new greeting system exposes three pools (`open`,
`inviting`, `returning`) so the engine can pick the shape that fits
the moment rather than a single fixed reply.

## Beach theme

The beach scene is built from layered, parallax SVG wave layers (a
far, mid, and near layer, each moving at its own speed) plus a sun, a
scalloped foam line, a sand band with randomly-faded wet-sand patches,
and a soft "shimmer" overlay for sun-on-wet-sand. All animations use
`transform` and `opacity` (GPU-accelerated, mobile-friendly), and
`prefers-reduced-motion` shuts them all off cleanly.

## Persian half-space (ZWNJ) normalization

Persian users frequently skip the half-space (نیم‌فاصله, U+200C) when
chatting: they write "میخواهم" instead of "می‌خواهم", "کتابها" instead
of "کتاب‌ها", "بیخبر" instead of "بی‌خبر". Darya silently normalizes
all of these (and the spaced equivalents) to the canonical ZWNJ form
on every input, so rule matching downstream works on a consistent
representation.

The ZWNJ correction itself is delegated to a vendored copy of the
`halfSpace` function from the
[**@persian-tools/persian-tools**](https://github.com/persian-tools/persian-tools)
library (MIT, see `licenses/MIT-persian-tools.txt`). That library
provides a tokenization-based pipeline that handles the comprehensive
set of spaced cases (verb prefixes, privative, negation, plurals,
comparatives, known compounds) using a curated dictionary rather than
hand-rolled regex guesswork. We add a small "joined-case" layer on
top to also handle inputs written with no space at all
("میخواهم" → "می‌خواهم", "کتابهایم" → "کتاب‌های‌م"), with a
deliberately conservative list of stem shapes and an explicit
allow-list of words that must NOT be rewritten (میز, میدان, میهن,
خوشبخت, متر, بیمه, بیبی, etc.).

The vendored copy is self-contained (`js/languages/halfspace.js`,
~10 KB) and is the single source of truth for ZWNJ behavior: rule
patterns in the engine don't try to anticipate ZWNJ variations
because they know the normalizer has already collapsed them.

## Going offline

See `OFFLINE.md` for the full story (PWA setup, Android APK via
Capacitor, service worker behavior). In short: self-hosted fonts +
service worker precache + web manifest = fully offline-capable after
the first successful load.
