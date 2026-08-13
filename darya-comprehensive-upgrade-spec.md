# Darya Comprehensive Upgrade Specification

## Executive Summary

This document outlines a comprehensive upgrade plan for Darya, a bilingual (Persian/English) offline-first companion chatbot. The upgrade aims to make Darya significantly more intelligent, therapeutically effective, and engaging while maintaining its privacy-first, offline-capable architecture.

---

## 1. Current State Assessment

### 1.1 Existing Capabilities
- **Bilingual support**: Persian and English with cultural awareness
- **Offline-first PWA**: Works without internet after first load
- **Rogerian conversation**: Empathetic, non-judgmental responses
- **Topic recognition**: 66 topics across emotional, social, and practical domains
- **Session memory**: Within-session context and recall
- **Mood awareness**: Basic emotional tone detection
- **Privacy-first**: No data collection, no accounts, no tracking

### 1.2 Identified Gaps
- Pattern-matching responses can feel repetitive
- Limited structured therapeutic exercises
- No persistent memory across sessions
- Basic emotional intelligence
- Limited personalization
- No mood tracking or progress visualization
- Limited knowledge depth in specialized topics

---

## 2. Upgrade Goals (User-Selected)

### 2.1 Primary Goals
- [x] **Better responses** - More natural, context-aware, emotionally intelligent
- [x] **Structured exercises** - CBT, mindfulness, therapeutic modules
- [x] **UI polish** - Animations, transitions, micro-interactions
- [x] **Content depth** - More knowledge, facts, expert-level responses
- [x] **Memory system** - Better conversation context and recall

### 2.2 Secondary Goals
- [x] Periodic mood check-ins
- [x] User-controlled topic focus
- [x] Light entertainment features
- [x] Age selection for content adaptation
- [x] Adaptive responses based on effectiveness
- [x] Headspace-style guided exercises

---

## 3. Feature Specifications

### 3.1 Enhanced Response Engine

#### 3.1.1 Context-Aware Responses
**Objective**: Move beyond simple pattern matching to understand conversation context.

**Implementation**:
- Track conversation flow and topic transitions
- Maintain emotional state across turns
- Reference previous statements naturally
- Build on user's expressed values and concerns
- Recognize and respond to conversational patterns (repetition, avoidance, depth-seeking)

**Technical Details**:
- Extend `ConversationMemory` with conversation flow tracking
- Add `EmotionalStateTracker` for multi-turn emotional awareness
- Implement `ContextWindow` that maintains recent conversation summary
- Add `ResponseQualityScorer` to evaluate response appropriateness

#### 3.1.2 Emotional Intelligence
**Objective**: Better understand and respond to user emotions.

**Implementation**:
- Multi-dimensional emotion detection (valence, arousal, dominance)
- Emotion trajectory tracking across conversation
- Appropriate emotional validation and mirroring
- Gentle emotional regulation suggestions when appropriate
- Recognize emotional shifts and respond appropriately

**Technical Details**:
- Create `EmotionAnalyzer` with expanded emotion vocabulary
- Implement `EmotionTrajectory` to track emotional changes
- Add `EmotionalResponseGenerator` for context-appropriate empathetic responses
- Integrate with existing safety systems for crisis detection

#### 3.1.3 Personality Consistency
**Objective**: Maintain Darya's warm, supportive personality while adapting to context.

**Implementation**:
- Context-aware tone adjustment (calm to animated based on topic)
- Consistent values and boundaries across all interactions
- Natural conversation rhythm with appropriate pacing
- Humor when appropriate, seriousness when needed

**Technical Details**:
- Create `PersonalityEngine` that maintains core traits
- Add `ToneAdjuster` that modulates based on context
- Implement `ConversationPacing` for natural rhythm
- Document personality guidelines for consistency

### 3.2 Structured Therapeutic Exercises

#### 3.2.1 CBT (Cognitive Behavioral Therapy) Module
**Objective**: Provide structured CBT exercises for common cognitive distortions.

**Implementation**:
- Thought record exercise (identify situation, thought, emotion, evidence, alternative)
- Cognitive distortion identification (all-or-nothing, catastrophizing, mind-reading, etc.)
- Behavioral activation suggestions
- Exposure hierarchy planning (gentle, non-clinical)
- Evidence examination exercises

**Technical Details**:
- Create `CBTModule` with exercise templates
- Implement `ThoughtRecord` data structure
- Add `CognitiveDistortionDetector` for pattern recognition
- Design `ExerciseFlow` for guided, step-by-step exercises
- Include example exercises for common scenarios

#### 3.2.2 Mindfulness Module
**Objective**: Provide guided mindfulness exercises adapted from Headspace-style approaches.

**Implementation**:
- Breathing exercises (4-7-8, box breathing, alternate nostril)
- Body scan meditations (simplified, text-based)
- Grounding techniques (5-4-3-2-1, sensory awareness)
- Mindful moments (present-moment awareness prompts)
- Walking meditation suggestions

**Technical Details**:
- Create `MindfulnessModule` with exercise library
- Implement `GuidedExercise` with step-by-step prompts
- Add `TimerIntegration` for timed exercises
- Design `ExerciseProgression` from beginner to advanced

#### 3.2.3 Mood Tracking System
**Objective**: Allow users to track their mood with periodic check-ins.

**Implementation**:
- Session-start mood check-in
- Periodic mood prompts during conversation (user-controlled frequency)
- Simple mood scale (1-10 or emoji-based)
- Mood reflection prompts
- Optional mood journaling

**Technical Details**:
- Create `MoodTracker` with local storage persistence
- Implement `MoodCheckIn` UI component
- Add `MoodAnalytics` for pattern recognition
- Design `MoodHistory` for user review

#### 3.2.4 Exercise Triggering
**Objective**: Intelligent suggestion of exercises based on conversation content.

**Implementation**:
- Auto-suggest exercises when patterns detected (anxiety spirals, negative self-talk)
- User control over suggestion frequency
- Gentle, non-intrusive suggestions
- Easy dismissal without pressure
- Context-appropriate exercise selection

**Technical Details**:
- Create `ExerciseRecommender` that analyzes conversation
- Implement `SuggestionEngine` with user preferences
- Add `SuggestionUI` that's non-intrusive
- Design `SuggestionHistory` to avoid repetition

### 3.3 Memory and Personalization

#### 3.3.1 Enhanced Session Memory
**Objective**: Better within-session context and recall.

**Implementation**:
- Conversation summary generation
- Topic threading across turns
- User preference tracking within session
- Reference to earlier statements naturally
- Remember user's stated values and concerns

**Technical Details**:
- Extend `ConversationMemory` with `SummaryGenerator`
- Add `TopicThread` to track topic evolution
- Implement `PreferenceTracker` for in-session preferences
- Create `ReferenceEngine` for natural callbacks

#### 3.3.2 User Profile System
**Objective**: Better understand and adapt to individual users.

**Implementation**:
- Age selection for content adaptation
- Communication style preferences
- Topic interests and avoidances
- Response style preferences (detailed vs. brief)
- Learning style awareness

**Technical Details**:
- Create `UserProfile` with preference storage
- Implement `AdaptationEngine` that adjusts responses
- Add `PreferenceUI` for user settings
- Design `ProfilePersistence` (session-only per current spec)

#### 3.3.3 Adaptive Responses
**Objective**: Learn which responses work best for different situations.

**Implementation**:
- Track response effectiveness (user engagement, continuation)
- Adapt response style based on what works
- Remember user's preferred response patterns
- Gradually personalize conversation approach

**Technical Details**:
- Create `ResponseEffectivenessTracker`
- Implement `AdaptationAlgorithm` that adjusts based on feedback
- Add `PersonalizationEngine` for individual optimization
- Design `AdaptationHistory` for learning

### 3.4 Content and Knowledge Expansion

#### 3.4.1 Deeper Mental Health Knowledge
**Objective**: More nuanced, expert-level responses for core topics.

**Implementation**:
- Expand anxiety, depression, grief, relationship knowledge
- Add trauma-informed responses (gentle, non-triggering)
- Include cultural sensitivity for Persian-speaking users
- Add age-appropriate content variations

**Technical Details**:
- Expand `knowledge-facts-*.js` files with expert content
- Add `CulturalSensitivity` layer for Persian context
- Create `AgeAdaptation` for content modification
- Implement `ContentQualityReview` process

#### 3.4.2 Broader Topic Coverage
**Objective**: Expand to cover career, parenting, health, relationships, hobbies, etc.

**Implementation**:
- Career advice and professional development
- Parenting guidance and family dynamics
- Health and wellness information (non-medical)
- Relationship skills and communication
- Hobby and interest exploration
- Financial stress and money concerns

**Technical Details**:
- Create new `knowledge-facts-*.js` files for each domain
- Add corresponding rules and response pools
- Implement `TopicExpertise` system for depth
- Design `CrossTopicConnections` for related insights

#### 3.4.3 Fun Facts and Entertainment
**Objective**: Add lighthearted content when appropriate.

**Implementation**:
- Expanded joke pool with cultural sensitivity
- Interesting facts across domains
- Creative writing prompts
- Philosophical discussion starters
- Historical and scientific curiosities

**Technical Details**:
- Expand `knowledge-fun-facts.js` with diverse content
- Add `EntertainmentEngine` for context-appropriate fun
- Create `CreativePrompts` for engagement
- Implement `TopicTransition` for natural shifts

### 3.5 UI/UX Improvements

#### 3.5.1 Micro-Interactions
**Objective**: Add subtle animations and transitions for polish.

**Implementation**:
- Typing indicators with personality
- Message appearance animations
- Hover states and button feedback
- Smooth theme transitions
- Subtle background animations

**Technical Details**:
- Extend CSS with animation utilities
- Add `AnimationController` for coordinated effects
- Implement `TransitionManager` for smooth changes
- Create `MicroInteraction` component library

#### 3.5.2 Exercise UI Components
**Objective**: Beautiful, intuitive interfaces for therapeutic exercises.

**Implementation**:
- Exercise cards with clear steps
- Progress indicators for multi-step exercises
- Completion celebrations
- Exercise history and favorites
- Easy exercise dismissal

**Technical Details**:
- Create `ExerciseCard` component
- Implement `ExerciseProgress` indicator
- Add `ExerciseCompletion` animation
- Design `ExerciseLibrary` UI

#### 3.5.3 Mood Tracking UI
**Objective**: Simple, engaging mood logging interface.

**Implementation**:
- Mood selection with visual scale
- Quick mood logging without interrupting flow
- Mood history view (simple)
- Mood reflection prompts
- Optional mood notes

**Technical Details**:
- Create `MoodSelector` component
- Implement `MoodLog` quick-entry
- Add `MoodHistory` simple view
- Design `MoodReflection` prompts

### 3.6 Safety and Privacy

#### 3.6.1 Enhanced Crisis Resources
**Objective**: More explicit crisis resources for specific regions.

**Implementation**:
- Persian mental health hotlines
- English-speaking crisis resources
- Regional resource detection (if possible)
- Clear, accessible crisis information
- Non-intrusive resource presentation

**Technical Details**:
- Create `CrisisResources` database by region
- Implement `ResourcePresenter` for appropriate display
- Add `CrisisDetector` with enhanced sensitivity
- Design `ResourceUI` that's helpful but not alarming

#### 3.6.2 Age-Appropriate Content
**Objective**: Adapt content based on user's age group.

**Implementation**:
- Age selection at start (optional)
- Content filtering based on age
- Language complexity adjustment
- Topic appropriateness checks
- Safety considerations for younger users

**Technical Details**:
- Create `AgeAdapter` for content modification
- Implement `ContentFilter` for age-appropriate material
- Add `LanguageComplexity` adjuster
- Design `AgeSelection` UI (optional, non-intrusive)

#### 3.6.3 Privacy Maintenance
**Objective**: Keep current privacy-first approach with minor enhancements.

**Implementation**:
- Session-only data (no changes needed)
- Clear data handling transparency
- Optional local export (future consideration)
- No external data transmission
- User control over all data

**Technical Details**:
- Maintain current architecture
- Add `PrivacyTransparency` documentation
- Ensure no accidental data leakage
- Regular privacy audits

---

## 4. Technical Architecture

### 4.1 Engine Enhancements

#### 4.1.1 New Engine Modules
```javascript
// New files to create:
js/engine/emotion-analyzer.js      // Multi-dimensional emotion detection
js/engine/emotion-tracker.js       // Emotional trajectory across turns
js/engine/context-window.js        // Recent conversation summary
js/engine/personality-engine.js    // Personality consistency
js/engine/tone-adjuster.js         // Context-aware tone modulation
js/engine/conversation-pacing.js   // Natural rhythm management
js/engine/response-scorer.js       // Response quality evaluation
js/engine/exercise-recommender.js  // Exercise suggestion logic
js/engine/mood-tracker.js          // Mood tracking system
js/engine/adaptation-engine.js     // Response adaptation
js/engine/preference-tracker.js    // User preference tracking
js/engine/crisis-detector.js       // Enhanced crisis detection
js/engine/crisis-resources.js      // Regional crisis resources
js/engine/age-adapter.js           // Age-appropriate content
js/engine/topic-expertise.js       // Domain expertise system
```

#### 4.1.2 Module Integration
```javascript
// Enhanced responder.js integration:
- Emotion analysis before response generation
- Context window maintenance
- Personality consistency checks
- Exercise recommendation triggers
- Mood tracking prompts
- Age-appropriate filtering
- Crisis resource presentation
```

### 4.2 Language Pack Extensions

#### 4.2.1 New Response Pools
```javascript
// Additional response pools:
js/languages/fa-responses-extras.js  // Extended FA responses
js/languages/en-responses-extras.js  // Extended EN responses

// New specialized pools:
- CBT exercise prompts
- Mindfulness exercise scripts
- Mood check-in responses
- Age-adapted responses
- Crisis resource responses
- Entertainment and fun responses
```

#### 4.2.2 Knowledge Base Expansion
```javascript
// New knowledge files:
js/data/knowledge-cbt.js           // CBT principles and exercises
js/data/knowledge-mindfulness.js   // Mindfulness techniques
js/data/knowledge-career.js        // Career advice
js/data/knowledge-parenting.js     // Parenting guidance
js/data/knowledge-health.js        // Health information (non-medical)
js/data/knowledge-relationships.js // Relationship skills
js/data/knowledge-finance.js       // Financial wellness
```

### 4.3 UI Component Extensions

#### 4.3.1 New Components
```javascript
// Exercise components:
js/ui/exercise-card.js             // Exercise display card
js/ui/exercise-progress.js         // Progress indicator
js/ui/exercise-library.js          // Exercise browser
js/ui/exercise-completion.js       // Completion celebration

// Mood components:
js/ui/mood-selector.js             // Mood selection UI
js/ui/mood-log.js                  // Quick mood entry
js/ui/mood-history.js              // Mood history view

// Shared components:
js/ui/animation-controller.js      // Animation management
js/ui/transition-manager.js        // Smooth transitions
js/ui/micro-interactions.js        // Subtle feedback
```

### 4.4 Testing Strategy

#### 4.4.1 New Test Files
```javascript
// Engine tests:
tests/emotion-analyzer.test.mjs
tests/context-window.test.mjs
tests/exercise-recommender.test.mjs
tests/mood-tracker.test.mjs
tests/adaptation-engine.test.mjs

// Integration tests:
tests/therapeutic-exercises.test.mjs
tests/mood-tracking.test.mjs
tests/personality-consistency.test.mjs
tests/crisis-resources.test.mjs

// Quality tests:
tests/response-quality.test.mjs
tests/age-adaptation.test.mjs
tests/privacy-audit.test.mjs
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. **Response Engine Enhancement**
   - Implement `EmotionAnalyzer` and `EmotionTracker`
   - Add `ContextWindow` for conversation summary
   - Create `PersonalityEngine` for consistency
   - Add `ResponseQualityScorer`

2. **Content Expansion**
   - Expand existing knowledge bases
   - Add expert-level mental health content
   - Create cultural sensitivity layer
   - Add age-appropriate content variations

### Phase 2: Therapeutic Features (Weeks 3-4)
1. **CBT Module**
   - Create exercise templates
   - Implement thought record system
   - Add cognitive distortion detection
   - Design guided exercise flow

2. **Mindfulness Module**
   - Create breathing exercise library
   - Implement body scan scripts
   - Add grounding techniques
   - Design mindful moment prompts

### Phase 3: Tracking and Adaptation (Weeks 5-6)
1. **Mood Tracking**
   - Implement mood tracker
   - Create mood check-in UI
   - Add mood history view
   - Design mood reflection prompts

2. **Adaptation System**
   - Create adaptation engine
   - Implement preference tracking
   - Add response effectiveness tracking
   - Design personalization algorithms

### Phase 4: UI Polish (Weeks 7-8)
1. **Micro-Interactions**
   - Add typing indicators
   - Implement message animations
   - Create hover states and feedback
   - Add smooth theme transitions

2. **Exercise UI**
   - Create exercise card components
   - Implement progress indicators
   - Add completion celebrations
   - Design exercise library interface

### Phase 5: Safety and Polish (Weeks 9-10)
1. **Safety Enhancements**
   - Add regional crisis resources
   - Implement age-appropriate filtering
   - Enhance crisis detection
   - Add privacy transparency

2. **Final Polish**
   - Performance optimization
   - Accessibility audit
   - Documentation updates
   - Final testing and QA

---

## 6. Success Metrics

### 6.1 Response Quality
- [ ] 30% reduction in repetitive responses
- [ ] Improved emotional accuracy (user feedback)
- [ ] Better contextual relevance (expert review)
- [ ] More natural conversation flow

### 6.2 Therapeutic Effectiveness
- [ ] 50% of users complete at least one exercise
- [ ] Mood tracking adoption rate > 30%
- [ ] User-reported helpfulness score > 4/5
- [ ] Reduced crisis escalation through better detection

### 6.3 User Engagement
- [ ] 20% increase in session duration
- [ ] 15% increase in return visits
- [ ] Improved user satisfaction scores
- [ ] Reduced bounce rate

### 6.4 Technical Performance
- [ ] < 3 second initial load time
- [ ] 60fps animations on target devices
- [ ] < 50ms response generation time
- [ ] 100% offline functionality maintained

---

## 7. Constraints and Considerations

### 7.1 Privacy
- All data remains session-only (no persistent memory)
- No external data transmission
- No analytics or tracking
- User control over all data

### 7.2 Performance
- Maintain offline-first capability
- Keep bundle size reasonable
- Optimize for low-end devices
- Ensure smooth animations

### 7.3 Accessibility
- WCAG 2.2 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### 7.4 Cultural Sensitivity
- Persian cultural awareness
- Age-appropriate content
- Gender-neutral language options
- Regional sensitivity

### 7.5 Safety
- Clear professional referral pathways
- Crisis resource presentation
- Age-appropriate content filtering
- Trauma-informed approaches

---

## 8. Out of Scope

### 8.1 Explicitly Excluded
- Voice input/output (user declined)
- Social/community features (user declined)
- External integrations (user declined)
- Persistent memory across sessions (user declined)
- Gamification (user declined full gamification)
- Data export features (user declined)
- Visualizations (user declined)
- Additional languages (focus on current two)

### 8.2 Future Considerations
- Voice features (version 3.0)
- Optional persistent memory (with user control)
- Professional integration features
- Advanced analytics (privacy-preserving)

---

## 9. Appendices

### A. Technical Dependencies
No new external dependencies required. All features implemented using:
- Native JavaScript (ES2022+)
- Web APIs (localStorage, IntersectionObserver, etc.)
- Existing project structure and patterns

### B. Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Android Chrome)

### C. Performance Budget
- Initial bundle: < 150KB gzipped
- Total assets: < 500KB gzipped
- First contentful paint: < 1.5s
- Time to interactive: < 3s

### D. Testing Requirements
- 100% test coverage for new engine modules
- Integration tests for all therapeutic features
- Accessibility testing with screen readers
- Performance testing on low-end devices
- Cross-browser testing

---

## 10. Implementation Status (v1.2.3)

All scoped phases for v1.2.0 and the v1.2.1 hardening round are complete
and validated. The
implementation deliberately kept the zero-dependency, offline-first
architecture: every feature below runs in the browser with no network
calls.

### 10.1 Delivered in v1.2.0 through v1.2.3

| Area | Delivered | Where |
| --- | --- | --- |
| Profile memory | Name/age disclosure stored per session; recall answered from memory; young-user (13 and under) pool points to a trusted adult | js/engine/responder-profile.js, both language packs |
| Promise memory | User-deferred topics are remembered and circled back to, with deterministic release on «ولش کن» | js/engine/responder-promise.js, both language packs |
| Guided exercises | Turn-based state machine: breathing, grounding, body scan, thought record; yes/no chips per step; graceful stop/decline | js/engine/responder-exercises.js, both language packs |
| Mood tracker | Request, 1..10 scale chips, band reflection, later read-back of the recorded arc and direction | js/engine/responder-mood.js, both language packs |
| Quick-reply chips | Tappable chips under Darya replies (exercise steps, mood scale); rendered by UI, keyboard/pointer accessible, RTL-aware | js/ui/core.js, js/app/composer.js, css/style.css |
| Context window | Summarized conversation context maintained across turns for reference | js/engine/context-window.js |
| Emotion analyzer | Structured emotion scoring feeding tone calibration | js/engine/emotion-analyzer.js |
| Personality engine | Consistency guardrails for Darya's calm companion voice | js/engine/personality-engine.js |
| Response scorer | Reply quality/appropriateness evaluation used by overrides | js/engine/response-scorer.js |
| Crisis resources | Verified hotlines in safety replies: 123 + 1480 (Iran), 988 (US/CA), 116 123 (Europe); every safety line carries a concrete next step | both language packs' ruleSafety pools |
| Joke pool | Clean humor pool for «یه جک بگو» / "tell me a joke", with first-person offer guard | both language packs' ruleTellJoke pools |
| Persian normalization audit | ئ to ی and Arabic look-alike variants added across rules, keywords, stopwords, and lexicons | js/engine/responder-detect.js, fa-rules.js, fa-vocabulary.js, fa.js, knowledge files |
| Echo-answer hardening | Echo fires only on short fragments, never overrides higher-intent rules | js/engine/responder-entity.js |
| Question recall | «یادته آخرین سوالی که ازت پرسیدم چی بود؟» / "do you remember the last question I asked?" quotes the user's own last question back from memory, or says honestly when nothing was asked | js/engine/responder-recall.js, both language packs |
| Knowledge-expansion requests | Honest offline acknowledgment for rich-dataset requests («تو باید دیتاست خیلی غنی‌ای داشته باشی») instead of the work-rule hijack | js/engine/responder-recall.js, both language packs |
| App-command honesty | Theme/sound requests are answered by pointing to the real UI control, never fake compliance | js/engine/responder-overrides.js, both language packs' ruleAppCommand pools |
| Persona conversations | 26 persona-based scenario fixtures across both languages (new parent, night-shift worker, divorce, harassment threat, tech frustration, self-worth, and more), each asserting dialogue act and topic per turn | tests/scenarios/persona-*.json and fa-persona-*.json |
| Daily-life topic routing | Gym anxiety, dating-app fatigue, remote-work isolation, postpartum, and pet-loss each route to their own empathetic pools in both languages; EN/FA topic parity is enforced by tests | js/languages/en-rules.js, fa-rules.js, en-responses-rules.js, fa-responses-rules.js |
| Hostile-transcript routing | The real Persian transcript failures are fixed: «چندتا فیلم/بازی/کتاب بهم معرفی کن» open the knowledge shelves, «الان چه سالیه» answers the calendar, «جیگرم/عسلم» stay greetings, «گاوی مگه» de-escalates instead of the boredom line, and «باهوش‌تر بودی» opens meta_feedback | js/data/knowledge-base.js, knowledge-facts-*.js, fa-vocabulary.js, fa-rules.js, both response packs |
| Comparison and crush rules | «تویوتا بهتره یا بوگاتی» gets the criterion question (never the shopping dodge), crush confessions keep the crush thread above family, and age-gap crushes (30+ years) still get the balanced age_gap guidance | js/languages/en-rules.js, fa-rules.js, en-responses-contexts.js, fa-responses-rules.js |
| Emotion calibration fixes | The FA grieving keyword «فوت» no longer matches inside «فوتبال» (a football comparison never gets a "من اینجا با تو هستم" prefix); warmth prefixes no longer stack onto comparison, crush, procrastination, dating-apps, or pet-loss pools | js/engine/responder-emotion.js, responder-overrides.js, responder-phase.js |
| Focus and phone coverage | «چطور تمرکزمو برگردونم» and phone-addiction complaints route to procrastination instead of app_feedback; «موبایل»/«انیمیشن» were dropped from the app-feedback UI-word list | js/languages/fa-rules.js |
| Knowledge lookup guards | FA duration/preference statements («چند وقته فوتبال بازی نکردم», «چقدر چای دوست دارم») no longer unlock weak-word answers; the general movie shelf no longer outranks genre facts; EN best/top/favorite framing reaches the shelf | js/data/knowledge-base.js, knowledge-facts-entertainment.js, knowledge-facts-project.js |
| 2026 daily-life wild suite | 24 regression tests (80+ assertions) covering the hostile transcript, AI-job anxiety, gig economy, housing, young-adult loneliness, dating-app burnout, and sequential context (jokes vary, topic switches stay fresh) | tests/wild-daily-2026.test.mjs |
| Learning support | "How can I learn English?" and its Persian equivalent get a structured practical method, not a hand-off | both language packs' ruleLearningAdvice pools |
| Docs | README rewritten with pipeline, memory, exercises, mood, safety sections; AGENTS.md gained the normalization and Iranian-name conventions; spec reflects delivered scope | README.md, AGENTS.md, this file |
| Real launcher icon (1.2.2) | The Capacitor-generated default icon is replaced with the actual Darya launcher icon for release APK/AAB builds | android/app/src/main/res/ |
| CI artifact naming (1.2.2) | Release AAB/APK downloads are version-tagged in their filenames (Darya-1.2.3-release.aab/.apk) so a newer release never silently overwrites an older download | .github/workflows/build-android.yml |
| CI action hardening (1.2.3) | Workflow actions moved to current majors (checkout@v7, setup-node@v7, setup-java@v5, upload-artifact@v7); the previous v4 pins ran on the deprecated Node 20 action runtime | .github/workflows/build-android.yml |

### 10.2 Validation

- 921/921 tests pass across the engine, language, quality, time-utils,
  foundation, knowledge-world, wild-conversations, wild-daily-2026,
  wild-passions-2026, ambient-sound, and browser e2e suites.
- 4 browser e2e suites pass, including the WAI-ARIA keyboard contract
  in a real browser, sound attention, quick-reply chips (mood +
  exercise chips), and the offline service-worker contract (the worker
  precaches the full shell and static assets, and the app loads with
  the network fully gone).
- 126 dialogue scenario fixtures pass in both languages, covering the
  26 persona conversations, 10 daily-life threads (gym anxiety, dating
  apps, remote work, postpartum, pet loss), cross-turn profile and
  question-recall memory, crisis and safety cascades, and the topic and
  knowledge domains.
- Smoke test passes 291/291 checks (structure, JS syntax, HTTP asset
  serving).
- 20/20 repeated stress rounds of the engine suite pass with no flaky
  failures; the new wild-daily-2026 suite is stable across 8 consecutive
  runs (randomized pool selection never trips a false assertion).
- ESLint (0 warnings), Stylelint, and Prettier checks are clean.
- Re-validated for v1.2.3 with the full dev dependencies installed: the
  browser e2e suites now run against a real Chrome (nothing is skipped),
  two verbose stress rounds of the engine suite pass 2/2, and actionlint
  1.7.12 reports zero issues on the Android build workflow.

### 10.3 Not in v1.2.0 through v1.2.3 (per user decisions)

- Persistent memory across sessions (session-only by design).
- Voice input/output, social features, external integrations,
  gamification, data export beyond the existing plain-text chat export.
- Additional languages beyond Persian and English.

---

*Document Version: 1.2.3*
*Last Updated: August 13, 2026*
*Author: Buffy (AI Assistant)*
