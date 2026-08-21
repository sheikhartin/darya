# Changelog

All notable changes to Darya are documented here. Darya follows
[Semantic Versioning](https://semver.org/). The full feature and
pipeline details live in the [README](README.md) and the upgrade spec
(`darya-comprehensive-upgrade-spec.md`).

## [Unreleased]

## [1.7.1] - 2026-08-21

### Added

- A people shelf answers informal who-is questions in the register people
  actually type («فلانی کیه», "who is messi", "who's messi") for Iranian
  public figures and a broader sports and culture set: Googoosh, Shajarian,
  Ali Daei, Ali Karimi, Mehdi Taremi, Hassan Reyvandi, Golshifteh Farahani,
  Navid Mohammadzadeh, Reza Attaran, Asghar Farhadi, Hadi Choopan, Mehran
  Modiri, Forough Farrokhzad, Ferdowsi, Rumi, Shadmehr Aghili, Bahram
  Afshari, plus Serena Williams, Djokovic, Hamilton, Biles, Bolt, Phelps,
  Tendulkar, Pelé, and Maradona. Bios stay descriptive; they never rank
  private lives or invent a biography for an unknown name.
- Sport overviews for tennis, cricket, baseball, ice hockey, golf,
  gymnastics, competitive swimming, and athletics sit beside the existing
  football and volleyball facts.
- `tests/companion-intelligence.test.mjs` evaluates hard cases, not polite
  chat: informal Persian capability phrasing, who-is versus GOAT debate,
  unknown people, memory after digressions, corrections, ethics, crisis,
  self-awareness, creativity, wisdom, critical thinking, adaptability,
  hostility, uncertainty, and multi-step grief-then-fact-then-care.

### Fixed

- Informal capability questions such as «منظورم این هست که چه قابلیت‌هایی
  داری؟», «چی بلدی», «چه کارایی داری», and "what capabilities do you have"
  now reach the honest range-and-limits pool instead of the unknown echo.
- Knowledge framing now treats «کیه»/«کیست»/"who is"/"who's" as a person
  question, so a bio is not swallowed by the Messi-or-Ronaldo debate.
- Bare Messi and Ronaldo names were removed from the GOAT keywords; a
  comparison such as «مسی یا رونالدو» still opens the debate.
- «داور بازی رو نابود کرد» reaches sports talk after the half-space
  normalizer splits «نابود» to «نا بود».
- «حافظ کیه» reaches the Hafez biography.

### Validated

- The complete Node gate passes 2,508 tests with zero failures, including
  78 companion-intelligence cases for informal capability, who-is, sports,
  unknown people, memory, ethics, crisis, and multi-step hard turns.

## [1.7.0] - 2026-08-21

### Added

- Nine new offline knowledge modules deepen the breadth shelf: 13 individual
  programming languages plus specific and all-together comparisons; art
  history from cave painting through the Renaissance, Impressionism, Cubism,
  Surrealism, Abstract Expressionism, Pop Art, Minimalism, conceptual and
  deliberately weird contemporary art, sculpture, famous statues, and design
  principles; social and communication platforms (Reddit, Facebook/Meta,
  Google, Google+, WhatsApp, Signal, X/Twitter, Discord, LinkedIn, Snapchat,
  Twitch, YouTube); markets, crypto, and tech companies (Nasdaq, Ethereum,
  Dogecoin, NVIDIA, Microsoft, SpaceX, OpenAI, Apple, Amazon, Tesla, Netflix);
  tech stacks across eras (LAMP, MEAN/MERN, Jamstack, serverless,
  microservices versus monolith, mobile, desktop, and SaaS architectures);
  generations from Boomers to Gen Alpha with decade trends from the 1990s to
  the 2020s; teaching and learning guides; natural healthy foods; and sports
  supplements (protein powders, creatine, amino acids, pre-workout,
  electrolytes, and caffeine) with evidence and safety guidance.
- A 52-case bilingual knowledge-breadth suite exercises every new module
  through direct lookup and the live engine, including evasive-answer and
  cross-topic safeguards.
- Three fully offline knowledge modules add deeper software engineering and
  defensive cybersecurity; practical work, guarding, inflation, migration,
  conscription, family, and appearance guidance; and conflict history with
  special coverage of Iran and the Middle East. Security learning is limited
  to explicitly authorized scopes and controlled labs, while history separates
  causes, claims, triggers, conduct, civilian impact, and outcomes without
  treating responsibility as automatically equal.
- Darya can now explain her own codebase architecture, deterministic response
  pipeline, session-only privacy model, PWA and Capacitor packaging, and test
  strategy. Repository, web/PWA, and Myket destinations are presented as
  three separate bullet lines instead of burying URLs inside prose.
- `KNOWLEDGE-SOURCES.md` records the source hierarchy, durable-versus-live
  boundary, source families, social-listening limits, and eight independent
  review lenses used for the expansion.
- A cultural-language layer now recognizes 38 global English slang terms
  and 29 Persian or Dari expressions, gives direct context-qualified
  definitions, and routes natural usage without literal keyword mistakes.
  Coverage includes British and Irish, Australian, Nigerian, South African,
  Singaporean, Iranian, Afghan Persian, gaming, dating, and internet
  registers. Darya stays explicit that this is curated knowledge rather than
  nationality, age, or lived cultural experience.
- Age-context rules add practical support for child online safety and school
  bullying, teen peer pressure and private-image coercion, adult caregiver
  strain, and older-adult retirement, technology learning, and scam risks.
- Bounded playful-chaos prompts are available only when explicitly requested
  on light turns, and serious pivots immediately return to the normal caring
  pipeline.
- New society and safety layers cover sex-work definitions and policy debates,
  exploitation and exit support, pornography literacy and compulsive use,
  addiction recovery, Iranian legal caution, and refusals for procurement,
  advertising, distribution, concealment, or enforcement-evasion requests.
- The travel shelf now spans major cultural regions and sites across Iran,
  world-heritage planning, responsible tourism, and explicitly hypothetical
  Moon, Mars, and solar-system itineraries. Live travel safety and legal facts
  remain outside the offline shelf.
- Cultural-humor entries explain translation limits and provide clean Persian,
  dry, and travel jokes without using protected groups as punchlines.

### Improved

- Reply pacing now feels like a person composing: a random 1.5 to 4 second
  base delay plus a length-scaled component, so longer answers take visibly
  longer while short ones still land promptly.
- Another 348 bilingual decisions exercise every new fact through direct
  lookup and the live engine, plus difficult three-turn personas, unauthorized
  cyber requests, clean link layout, no-fixed-product-price policy, war
  non-equivalence, migration fraud, Iranian conscription caution, Persian code
  points, and every offline load surface.
- Persian technical questions can naturally contain established Latin terms
  such as DNS, HTTP, PWA, CTF, `race condition`, and `threat model` without
  being mistaken for a request to switch the whole conversation to English.
- Shopping answers no longer include a sample product price or a promised
  used-versus-new discount. Iranian users get current-price comparison,
  ownership-cost, warranty, repairability, and scam checks instead.
- More than one hundred new bilingual decisions cover natural slang,
  definitions, age groups, regional English, Dari expressions, ambiguity
  guards, literal-word false positives, multi-turn age context, and safe
  transitions out of playful conversation.
- Forty-eight additional hard, three-turn persona simulations now mix rude,
  skeptical, exhausted, playful, grieving, impatient, and excited users with
  programming, office documents, AI, media, practical life, Iranian daily
  pressures, world knowledge, and Darya self-knowledge.
- The offline shelf adds responsible AI study guidance, broader TypeError
  debugging language, cozy games, horror anime, and spelled-out English
  decade filters. Darya's capability replies now state both her practical
  range and her offline, session, action, and professional limits.
- Unknown-input replies stay honest without falling back to repetitive
  "not familiar" language; they now engage the concrete reference, event,
  or emotion needed to continue naturally.
- Sixty-two focused society, travel, sensitive-topic, cultural-humor, legal
  boundary, bilingual parity, and false-positive decisions protect the new
  coverage.

### Fixed

- Explicit software, guarding, employment, migration, conscription, and
  historical questions now outrank stale work or emotional context, while
  personal disclosures remain supportive. Defensive hacked-account and
  phishing questions route to recovery guidance; attempts to hack Wi-Fi,
  steal accounts, bypass logins, build keyloggers or botnets, launch DDoS,
  or evade antivirus receive a firm lawful-alternatives boundary.
- Live-edge scrolling now records reader intent before inserting a message.
  New messages stay visible automatically while the reader is at the bottom;
  the jump control appears only after a deliberate scroll into history, and
  sending or jumping re-engages live following.
- Every bundled Persian response and fact now uses Iranian Persian `ی`
  (U+06CC) and `ک` (U+06A9). A final display guard converts Arabic Yeh,
  Alef Maksura, and Kaf if dynamic output ever introduces them.
- The menu and contextual breathing controls now use locked 34px square
  geometry, native button appearance resets, and a 50% radius, so their
  glass bodies render as exact circles in both themes.
- The breathing control now uses a dedicated high-arousal classifier
  instead of every serious topic. Explicit breathing requests and current
  first-person panic, anxiety, overwhelm, or anger can surface it, while
  greetings such as «سلامتی؟», informational and third-person mentions,
  resolved feelings, urgent medical symptoms, and safety-critical turns do
  not. Its button reveal now keeps the intended soft fade and scale
  transition instead of being overridden by the theme transition cascade.
- Starting, ending, or resetting a conversation clears the unsent composer
  draft, height, hint, and scroll position. The RTL textarea scrollbar is
  visually hidden while remaining scrollable, removing the dark seam that
  could appear along its left edge.
- Documentation and source comments now match the real module names, five-part
  response-pack layout, same-origin PWA update traffic, local theme storage,
  contextual crisis UI, browser-test split, and current app-shell size.

### Validated

- The complete Node gate passes 2,412 tests with zero failures; ESLint,
  Stylelint, Prettier, and `git diff --check` are clean.
- The shell and HTTP smoke suite passes 330 checks. The new 348-decision
  intelligence suite also passes 15 repeated rounds without a failure.
- Capacitor Android sync succeeds, and root, generated web, service-worker,
  and packaged Android runtime assets are byte-aligned.
- The nine real-browser tests skip cleanly because this sandbox has no Chrome
  or Chromium binary. A Gradle APK/AAB compile is not available here because
  Java and the Android SDK are not installed; CI or a configured Android
  workstation must run those two platform-specific gates.

## [1.6.0] - 2026-08-19

### Changed (UI)

- **A calm frosted-glass interface across both themes.** Every surface -
  the language cards, theme picker, menu, chat bubbles, quick-reply
  chips, the composer, and the confirm and exit dialogs - reads as a
  softly frosted pane floating over the ambient backdrop: a translucent
  deep-blue (Ocean) or deep-teal (Beach) body, an angled light-catch,
  and a single top catch-light with a hairline top-lit rim. The frost is
  deliberately more opaque and the blur gentler than a maximal
  glassmorphism recipe, so text keeps its WCAG AA contrast and the
  surfaces read as calm material rather than a stack of artificial
  reflections. Chat bubbles sit on a near-opaque tint so the content
  layer never floats on transparent glass.
- **A cursor-tracked glint.** Interactive glass (the language cards, theme
  segments, menu items, the menu popover, quick-reply chips, dialogs, and
  the circular header buttons) catches a whisper-light highlight that
  follows the pointer, so the material reads as lit from the user's hand.
  It is skipped on touch devices and under `prefers-reduced-motion`, and
  it never touches the conversation or assistive technology.
- **Messages reflect the same light.** Chat bubbles carry a soft diagonal
  sheen in both languages so they share the chrome's light direction
  instead of reading as flat blocks, without becoming translucent glass.
- **Circular controls read as clean circles.** The header icon buttons and
  the picker sound toggle share one recipe: a clearly visible rim and a
  soft ambient lift, so a 34px frosted disc never blurs into the dark
  backdrop at its top and bottom edges.
- **The idle send button is muted glass, not a dark smudge.** A coral disc
  dimmed by opacity over the dark composer read as a muddy blob, so the
  disabled state now uses the same frosted circle as the other icon
  buttons with a dimmed arrow.
- **The breathing exercise closes only when asked.** A stray backdrop
  click no longer ends the exercise (only the close button or Escape
  does), the overlay no longer shows a pointer cursor everywhere, and the
  circle's glow now breathes with the phase, brightening on the inhale
  and settling on the exhale.
- **The glass degrades gracefully.** Browsers without `backdrop-filter`
  support, and users who enable `prefers-reduced-transparency` or
  `prefers-contrast: more`, get a near-opaque pane with a stronger rim
  instead of a see-through one, so nothing depends on the blur to stay
  readable.
- **No flat elements remain.** The header icon buttons, the sound toggle,
  and the secondary (Cancel/No/Close) buttons were ghost or flat pills
  and now read as glass: dark frost in Ocean, and a frosted light pane
  in Beach, mirroring Liquid Glass's light/dark adaptivity. The solid
  coral accents keep a subtle top highlight so they read as tinted glass
  rather than flat paint.
- **Edges are hairlines, not hard outlines.** The pane rim was softened
  and the chat-bubble tail corner rounded up, so nothing draws a sharp
  one-pixel line. The rim is tuned to a whisper of the pane's own tint
  (rather than a distinct color), so it reads as light catching the
  glass instead of a drawn border.
- **Hover brightens glass instead of dimming it.** The menu, breathe,
  and sound-toggle buttons no longer swap in a transparent tint on
  hover (which dropped the frost and let the dark backdrop flood in);
  they brighten their glass body, and the send button no longer scales
  up on hover, so nothing jumps or shakes.
- **The sound toggle animates instead of snapping.** Turning sound on
  blooms the speaker waves outward (with a one-beat stagger on the outer
  arc) while the mute slash sweeps away, and turning it off settles both
  back, so the switch reads as a calm continuous gesture. The picker
  toggle, which previously hid its icon parts with `display: none` (an
  instant swap), now uses the same animated path.
- **The chat follows the reader, not the other way around.** New bot
  replies and the typing indicator only auto-scroll when the reader is
  already near the bottom; when they have scrolled up to re-read, a new
  glass "jump to latest" pill appears and smooth-scrolls back on tap
  (honoring `prefers-reduced-motion`).
- **Elevation is layered and soft, never a heavy halo.** The two shadow
  tokens are now three-stop, low-opacity ambient shadows (tight contact
  + mid presence + wide diffuse lift) instead of a single dark blob, and
  their color warms to sand in Beach so no element ever casts a cold,
  smudgy shadow. The sun glow and notification bloom were dialed back to
  match.
- **No layout jump on theme switch.** The picker's language-lock note and
  theme heading sit in one glass chip in both themes (identical padding
  and radius), so switching Ocean to Beach only swaps the tint and ink.
- **UI chrome is not selectable.** Picker text, menu items, dialogs, and
  the footer ignore long-press text selection, so the packaged
  Android/WebView build never pops the native copy callout on controls;
  conversation bubbles stay selectable.
- **The breathe trigger fades in instead of popping.** After an
  emotionally heavy turn, the breathing-exercise button now scales and
  fades into the header (only opacity and transform animate, and it
  stays out of the tab order while hidden), so the header never jumps.
- **The document title now speaks both languages on the picker.** While
  the language picker is showing, the page title alternates between the
  Persian and English app titles every six seconds; the moment a
  conversation starts it locks to the chosen language. English-only
  visitors are no longer left staring at a Persian tab title.

### Improved (knowledge and tooling)

- **A neutral worldview and ideology shelf.** Darya can now explain 39
  worldviews, mindsets, and political-philosophical ideologies in both
  languages: stoicism, existentialism and its neighbors, growth mindset,
  minimalism, ikigai, wabi-sabi, hygge and lagom, Taoism and Zen,
  skepticism through pragmatism, humanism and transhumanism, effective
  altruism, longtermism, and a neutral tour of democracy, liberalism,
  conservatism, socialism, communism, anarchism, libertarianism, fascism,
  populism, nationalism, progressivism, secularism, feminism, and
  environmentalism. Every entry is descriptive and non-endorsing, and
  violent extremism is named plainly and never softened.
- **93 mindsets-and-ideologies regression scenarios** cover the factual
  shelf in both languages plus the emotional registers around it: a calm
  learner gets the fact, a depressed disclosure that names nihilism stays
  on the caring thread, and a hateful blanket statement about a group is
  met with calm de-escalation, never agreement.
- **`run-tests.sh` runs the whole suite.** The runner now discovers every
  `tests/*.test.mjs` file automatically instead of a hand-maintained
  subset, so new test files run without manual list edits. The browser
  e2e suites skip cleanly (not fail) when no Chrome/Chromium binary is
  present.

### Fixed (engine)

- **Common check-ins answer like a companion, not an echo.** The Persian
  «چه خبر؟» and its tails («چه خبری؟», «چه خبره؟», «چه خبرها؟») now
  route to the how-are-you pool instead of the ambiguous-input echo
  («کمی بیشتر توضیح بده»), and the English "what is new", "what is up",
  and "what is going on" route to the greeting pool instead of the
  unknown fallback.

### Improved (life-facts memory)

- **Arbitrary life facts are remembered and recalled.** Beyond the basic
  profile (name, age, location, preferences), Darya now stores four
  kinds of facts people state about their lives and recalls them later,
  in both languages: a profession ("my sister is a nurse" /
  «خواهرم پرستاره» -> "what does my sister do?"), a name of a person or
  pet ("my dog is named Rex" / «اسم سگم رکس هست»), a count ("I have two
  kids" / «دو تا بچه دارم»), and a relationship status ("I am married" /
  «من متاهلم»). A recall always answers from memory, or honestly unknown,
  never inventing a fact, and a new statement replaces a contradictory
  old one for the same subject.
- **42 memory-and-consistency regression scenarios** exercise long
  multi-turn threads: facts recalled after digressions, corrections
  replacing earlier values, multiple subjects staying distinct, memory
  surviving hostile turns and unrelated chatter, and session-only
  guarantees (a fresh engine forgets).

### Improved (wellbeing, identity, and memory)

- **Sixteen uncovered lived-experience topics** now route to a caring,
  non-diagnosing pool in both languages: ADHD and neurodivergence,
  autism, trauma and PTSD, panic attacks, non-suicidal self-injury,
  OCD, bipolar, addiction and recovery, pregnancy loss, infertility,
  suicide bereavement, terminal illness, coming out, immigration, body
  image, and friendship breakups. Each names the experience, keeps the
  non-clinician boundary, and points to professional support when it is
  severe or persistent.
- **Session preference memory.** Stating something you love, hate, or
  cannot stand is remembered, and "what do I like?" / «چی دوست دارم؟» is
  answered from memory with a "you remembered" acknowledgment, or
  honestly unknown. Ambiguous phrasings (polite requests like «دوست دارم
  برام یک جک بگی», or "i would love to...") are never mis-captured.
- **Calibrated honesty.** A false or harmful health claim ("vaccines
  cause autism", "therapy is a scam") validates the feeling while gently
  correcting the claim, never endorsing it.
- **The connection nudge.** Explicit isolation ("I have no one to talk
  to") gets a gentle nudge toward telling a real person, instead of just
  echoing the loneliness.
- **Broader knowledge shelf.** Mental-health literacy (OCD, ADHD,
  bipolar, trauma, panic, autism), health literacy (sleep hygiene,
  stress physiology), and personal finance (budgeting, emergency funds)
  now answer framed questions in both languages.
- **67 wellbeing regression scenarios** cover every new topic, the
  preference memory, calibrated honesty, the connection nudge, and a
  proof that crisis rules still fire many turns into a session.

### Improved (hostility handling)

- **Directed insults always get a calm boundary.** A Darya-directed
  insult - "you are worthless", "you are a joke", «تو بی ارزشی»,
  «تو یه جوکی», a dismissal like "shut up" / «خفه شو», a sarcastic
  "thanks for nothing asshole" / «ممنون از هیچی احمق», or a bare
  "worthless bot" / «ربات بی ارزش» - now routes to the boundary pool
  regardless of which benign rule the words happen to match. Previously
  "you are worthless" was misread as the user's own self-esteem,
  "you are a joke" got frustration, and "thanks for nothing asshole"
  got a genuine gratitude reply.
- **Insults are never mirrored back.** The quoted callback and pronoun
  reflection no longer echo a hostile phrase ("you are a lying piece of
  shit" → "that phrase still has weight"), and a profane turn is never
  quoted on a later turn.
- **Third-party vents stay on their real thread.** "my boss is a moron"
  and «رئیس من یه احمق تمام عیاره» stay work complaints, never the
  boundary pool or app feedback (the «تم» app-feedback keyword no longer
  falsely matches inside «تمام»), and profanity like «کیرم تو این
  برنامه» de-escalates instead of falling to the unknown pool.
- **"why do you exist?" / «چرا وجود داری؟»** now gets a self-aware reply
  instead of a knowledge shrug.

## [1.5.0] - 2026-08-18

### Changed (branding)

- **New icon set across every platform.** The launcher icon, PWA
  icons, favicons, and all Android mipmap densities (legacy, round,
  and adaptive layers) were regenerated from new ChatGPT-generated
  artwork (an 800x800 PNG, resized only; no recoloring or
  retouching). The adaptive background colour is derived from the
  artwork corner (`#F0F1F3`). Splash screens carry no logo and stay
  unchanged.

### Changed (UX)

- **The ambient UI is free of crisis framing.** The always-on
  helpline line under the composer read as clinical before a single
  word was exchanged, working against the calm-companion promise.
  The footer states one fixed identity line, «دریا یک همراه شنواست،
  نه جایگزین راهنمایی تخصصی.», honest about what Darya is and is
  not, and no menu item, hotline number, or support wording appears
  anywhere in the always-visible shell. Crisis help reaches the user where it matters and only
  there: the contextual safety replies inside the conversation and
  the crisis-aware exits, both unchanged.

### Fixed (offline)

- **Installed PWAs actually receive the new icons and shell.** The
  static-assets cache name is bumped to `darya-static-v2` (retiring
  v1 on activation, as the design intends), and this release's
  version bump rotates the app-shell cache, so existing installations
  pick up the new artwork and footer on update instead of serving
  the previously precached copies indefinitely. The offline e2e
  suite now reads the cache name from `sw.js` rather than pinning
  it.
- **Updates deliver themselves.** A returning visitor could stay on
  a stale shell indefinitely: the worker is cache-first, and
  browsers only re-check `sw.js` on navigation (throttled at that).
  The app now asks the browser to re-check the worker on load and
  whenever the tab becomes visible, and reloads itself once, at a
  safe moment (the start picker, never mid-conversation), after a
  new worker takes control. `npm start` now runs a dependency-free
  dev server (`scripts/serve.mjs`) that sends the headers an
  offline-first PWA needs: `no-store` for `sw.js`, `no-cache` plus
  `Last-Modified` revalidation for everything else, replacing
  `python3 -m http.server`, which sent no cache directives at all.

## [1.4.0] - 2026-08-17

### Fixed (safety-critical)

- **Crisis detection now covers the register people actually type in.**
  The safety rule previously matched only formal phrasings ("kill
  myself", "end my life"), so slang ("kms", "unalive", "end it all"),
  apostrophe-free contractions ("dont wanna live"), passive ideation
  ("I wish I could sleep and never wake up", «کاش می‌مردم», «بهتره که
  دیگه نباشم»), and plan/means statements ("I bought a rope", "took
  all my pills", «قرص جمع کردم», «می‌خوام خودمو حلق‌آویز کنم») fell
  through to goal-coaching pools and were answered with lines like
  "What is the main thing standing between you and it?". All of these
  now route to the crisis pool with verified hotlines. "kms"/"kys"/
  "unalive" are canonicalized by the matching normalizer.
- **Five new safety-critical rule families in both languages**, each
  with dedicated, carefully-worded response pools: third-party risk
  ("my friend wants to kill herself" now gets concrete caregiver
  guidance instead of "I am not familiar with this subject"), domestic
  violence and sexual assault disclosures ("my husband hits me", "I
  was raped", «شوهرم منو می‌زنه», «بهم تجاوز شد» are believed first
  and pointed to specialist help; previously they could receive "What
  makes it interesting to you?"), extended food refusal and eating
  distress, psychosis-adjacent disclosures (command hallucinations),
  and method-seeking questions, which get a firm, warm refusal with no
  information and the crisis line.
- **Joke-softened ideation gets a check-in, never an echo.** "i wanna
  die lol jk" used to be mirrored back ("So you wanna die lol jk.
  What's that like for you?"); it now receives a gentle, serious
  check-in, in both languages.
- **Session-wide safety mode.** After any safety-critical turn, exit
  confirmations and farewells switch to crisis-aware copy that
  restates the hotline (never "I will wish you well"), and the playful
  huff stays suppressed for the rest of the session.
- **Death-lexicon guards as a second line of defense.** Any turn
  containing death or self-harm vocabulary is never echoed by the
  pronoun reflection or quoted callback, never handed a playful huff
  or boredom line, and a heavy unmatched turn gets a new caring
  unknown pool (acknowledgment-first) instead of the curiosity
  fallback.
- **The on-page disclaimer now names the hotlines** (123/1480 in
  Persian, 988/116 123 in English), so crisis resources are always one
  glance away without typing anything.

### Fixed (correctness)

- **Multi-operator arithmetic is now actually correct.** "2+2*3" used
  to be answered "2 * 3 = 6" (a fragment of the expression presented
  as the whole answer). A real expression evaluator (shunting-yard)
  now handles + - * / ^ ( ) with correct precedence, unary minus, and
  Persian digits: "2+2*3" is 8, "(2+3)*4" is 20, "-(3+4)*2" is -14.
  Expressions embedded in prose are never hijacked, and "sqrt of -4"
  gets an honest "no real square root" instead of the unknown pool.
- **Specific capital questions get one-sentence answers.** "What is
  the capital of France?" now answers "The capital of France is
  Paris." («پایتخت فرانسه پاریس است.») instead of reciting fifteen
  capitals; generic list asks keep the full shelf.
- **Live-data questions get honesty first.** "What is bitcoin's price
  today?", «قیمت دلار چنده», and weather/news/score asks now lead with
  the offline limitation instead of a timeless background lecture;
  background questions ("what is bitcoin?") still get the knowledge
  shelf.
- **Media filters genuinely filter.** "Persian music" and «آهنگ
  ایرانی» now return Googoosh, Shajarian, Namjoo, and other Iranian
  artists from a new dedicated shelf (previously: Bicep and Talk
  Talk); "Iranian movie" and «فیلم ایرانی» return Kiarostami, Farhadi,
  Majidi, and Panahi. An "80s horror movie" ask returns only 1980s
  titles (the horror shelf gained genuine classics), and an era ask
  the shelf cannot honor gets an honest scoping reply instead of
  off-era titles presented as if they fit.

### Improved (conversation intelligence)

- **No question is ever repeated verbatim in a session.** The memory
  now tracks every asked question; pools serve unasked lines first and
  change register when a topic's questions are spent. Previously an
  "ok" streak alternated the same two questions forever.
- **The advice bridge.** After several turns on one lived topic, an
  explicit "what should I do?" gets a concrete three-small-steps
  answer instead of a fourth reflective question. Early asks keep the
  normal reflective pool.
- **Location joins the session profile.** "I live in Tehran", «اهل
  شیرازم», and «تو اصفهان زندگی می‌کنم» are remembered; "where do I
  live?" is answered from memory or honestly declined. Emotional
  phrasings ("i live in fear") are never stored as cities.
- **Keyboard mash is detected.** "asdkjhaskdjh" gets the
  did-not-come-through reply instead of a word-salad response;
  legitimate consonant-cluster words ("strengths") are unaffected.
- **Mood summaries stop inventing trends.** A single check-in no
  longer reads back "the direction is fairly steady"; trend language
  starts at two samples.
- **Reply assembly guards.** At most one question per reply: the
  emotional-shift line no longer stacks onto a reply that already asks
  something, and never attaches to low-content turns.

### Changed

- The flaky "series and movie asks" regression test now asserts on the
  deterministic anchor set instead of a random spot-check, removing
  the suite's only intermittent failure.
- The logger's header comment falsely claimed conversations were
  recorded to localStorage; it now correctly documents the in-memory
  ring buffer (nothing was ever persisted).
- "Bitcoin is the world first cryptocurrency" typo fixed.

### Validated

- 1452/1452 tests pass, including two new suites: a 77-case
  adversarial safety corpus (`tests/safety-net.test.mjs`) covering
  slang, contractions, passive ideation, means statements, third-party
  risk, abuse, eating distress, psychosis, method-seeking, benign
  false-positive guards, and crisis-aware exits in both languages; and
  29 accuracy regression tests
  (`tests/engine-accuracy.test.mjs`).
- ESLint (0 warnings), Stylelint, and Prettier are clean.

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
- **Persian normalization audit.** ئ to ی and Arabic look-alike code points
  (U+064A, U+0643, U+0629, U+0624) were normalized across rules, keywords,
  stopwords, and lexicons;
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
- Fully offline after the initial shell load: no chat data or inference call
  leaves the device; the service worker precaches the complete app shell and
  self-hosted fonts and audio. A hosted browser still uses same-origin static
  requests and service-worker update checks.

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
