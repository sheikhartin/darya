# Darya (دریا)

Darya is a bilingual (Persian/English) conversation companion in the
tradition of **ELIZA**, the 1966 program by Joseph Weizenbaum that first
showed how a purely keyword-driven, rule-based script could imitate a
reflective listening well enough to feel genuinely heard, even once people knew exactly how the trick worked. Darya is a richer form of that same idea:
it recognizes a broad set of topics and common small-talk questions, keeps
a short working memory it can quote back to you, tracks emotional tone
across a conversation to occasionally offer a grounding exercise, and
varies its own phrasing so conversations don't feel mechanical, all
through pattern matching rather than genuine understanding. It also keeps
weighted topic continuity, recognizes common topic blends, asks a limited
number of concrete topic-specific questions, and uses a strict seriousness
gate before any gentle humor can appear.

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

Darya remains a small, deterministic browser engine. Each turn is normalized,
checked for language, scored for emotional weight, matched against topic rules,
and added to a short in-memory subject record. Recent topics can form blends
such as sleep plus anxiety, while named entities decay and cannot be called
back on their first mention. Question budgeting keeps the conversation from
becoming an interview: when Darya asks, the question is selected from the
active topic's concrete question pool.

Warmth is also gated. Serious topics receive quiet, specific reflections;
light conversation may receive a brief, situational smile only after the
conversation has some history. Medical, legal, and financial decisions are
redirected to qualified human professionals rather than answered as advice.
The recap command summarizes only topics and details actually present in the
current tab. Nothing is sent to a server or retained after the tab closes.

The design draws structural inspiration from reflective inquiry and
cooperative dialogue principles, while keeping the implementation local and
rule-based:

- https://arxiv.org/html/2312.06024v4
- https://web.stanford.edu/~jurafsky/slp3/old_jan25/15.pdf

## Offline knowledge shelf

Darya has a small bilingual knowledge shelf for philosophy, focus, learning,
communication, and creativity. It is deliberately curated and offline. It
provides useful starting points without pretending to know current events or
claiming professional authority. Knowledge answers are still passed through
the same language, seriousness, and response selection rules as ordinary
conversation.
