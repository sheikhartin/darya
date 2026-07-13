# دریا (Darya)

## Where this idea comes from

In 1966, MIT computer scientist Joseph Weizenbaum built a program called
**ELIZA**, one of the very first chatbots. ELIZA's most famous mode,
"DOCTOR," imitated a Rogerian psychotherapist: a style of therapy, developed
by Carl Rogers, built around reflective listening rather than advice-giving.
The trick was almost entirely mechanical. ELIZA looked for keywords in what
you typed, rearranged your own sentence back at you, and asked an
open-ended question: "I am sad" became "Why do you say you are sad?" No
understanding was involved, but the effect was startling: many people who
used it described feeling genuinely heard, even after being told exactly how
the trick worked. Weizenbaum himself was unsettled by this and spent much of
the rest of his career warning against overstating what such programs could
do.

Darya stands in that same tradition: a rule-based, keyword-driven
companion, not a large language model. There's no pretense that it
"understands" anything. What it does is apply a much larger, more careful
version of ELIZA's original trick, and it's honest about that limitation
throughout.

## What's been improved since the first version

**A wider, more coherent set of topics.** The original had a handful of
categories (family, work, sleep, mood). It now recognizes loneliness,
self-esteem, grief, motivation, relationships, physical health, gratitude,
school/exam stress, and financial stress, each with several response
variations rather than a single canned line.

**Real Persian-specific bug fixes.** Persian attaches suffixes directly to
words with no space (خوابم = "my sleep"), so a keyword search has to walk a
line between two failure modes: match too loosely and "پدر" (father)
wrongly fires inside "پدربزرگ" (grandfather); match too strictly and
"غمگین" (sad) fails to recognize "غمگینم" (I'm sad). The matching logic now
uses Unicode-aware word boundaries plus a curated list of the common
Persian suffixes that legitimately attach to a keyword, which fixes both
problems at once.

**Memory that's actually used in conversation.** Beyond just tracking the
current topic, Darya now keeps a short rolling memory of what you've
actually said and can quote it back later ("Earlier you mentioned..."),
the same reflective-listening technique ELIZA used, just applied across
turns instead of within a single reply. Trivial utterances ("hi", "ok")
are filtered out so it only ever echoes something substantive.

**A lightweight sentiment tracker.** Each message is scored against a small
positive/negative keyword lexicon. If several messages in a row read as
emotionally heavy, Darya offers one gentle, optional grounding exercise
(a paced-breathing technique) and a nudge toward real professional support,
separate from, and secondary to, the dedicated safety-keyword response,
which always takes priority for any language of self-harm.

**Session pacing.** Every so often in a longer conversation, Darya asks a
light check-in question ("We've touched on a few different things, which
feels most present right now?") rather than only ever reacting turn by
turn, closer to how an actual conversation naturally pauses to take stock.

**Pronoun-swap reflection, English only.** The classic ELIZA trick of
turning "I feel tired" into "So you feel tired..." is enabled for English,
where swapping a handful of pronouns keeps a sentence grammatical. It's
deliberately *not* enabled for Persian: Persian carries person and number
in the verb ending itself, not just in a separate pronoun, so the same
word-swap trick would frequently produce broken sentences. Rather than ship
a technique that works less reliably in one language, Persian instead gets
extra emphasis on the quoted-memory callback above, which carries no
grammatical risk in either language.

**Repetition avoidance.** Every reply, greetings, farewells, topic
responses, fallbacks, is chosen while actively avoiding lines used
recently, and if the same topic keeps coming up, Darya deliberately shifts
strategy instead of repeating itself.

**Bilingual, with no compromises either way.** Persian and English are
built from separate, equally detailed content packs sharing one engine, so
neither is a stripped-down version of the other. Language is chosen before
a conversation starts and locked for its duration, consistent with the
idea that switching languages mid-conversation isn't something a person
would do with the same listener, so it's treated as starting fresh instead.

## What this is not

It's not therapy, and it doesn't diagnose anything. It's not a language
model: there's no learning, no real semantic understanding, and no memory
beyond a single browser tab's conversation. What it is: a considerably
more careful, more capable version of a 60-year-old idea, built honestly
enough to say plainly where its limits are.
