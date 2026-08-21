/**
 * Darya - knowledge follow-ups and famous-figure play.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 *
 * Three conversational moves live here:
 *
 *   1. Record/stats questions («رکوردش چیه؟», "what is his record?")
 *      about the last answered fact or a fighter named in the message.
 *      Served from the fact's `record` field together with an honesty
 *      note: the offline snapshot ages, and an active fighter's record
 *      moves with every bout (`final: true` marks a settled career).
 *      No record data means an honest no-stats reply, never invented
 *      numbers.
 *   2. Tell-me-more turns after a knowledge answer. Facts with a `more`
 *      paragraph get the deep dive exactly once; after that (or when
 *      no deep dive exists) Darya says openly that the offline shelf
 *      ends here and points to real sources.
 *   3. Famous-figure claims («من مسی‌ام», "I'm the next Messi", also
 *      philosophers) answered with playful warmth instead of storing
 *      «مسی» as the user's name, plus the «مسی بهتره یا سیم مسی؟» /
 *      "Messi or messy?" pun, which deserves to land as the joke it is.
 */
(function (global) {
  'use strict';

  /** A follow-up only continues a fact answered this recently (turns). */
  const FOLLOWUP_WINDOW_TURNS = 3;
  /** Record/stats asks longer than this are full sentences, not follow-ups. */
  const MAX_RECORD_ASK_WORDS = 8;

  /**
   * Famous figures whose names appear in playful identity claims.
   * Aliases are written in normalized matching form (lowercase Latin,
   * ZWNJ-free Persian, ئ→ی). `factId` links to the knowledge shelf when
   * an entry exists, so «رکورد خبیب چیه؟» resolves without a preceding
   * question; display names fill the {figure} placeholder.
   */
  const FAMOUS_FIGURES = [
    {
      aliases: ['مسی', 'لیونل مسی', 'messi', 'lionel messi'],
      factId: 'lionel_messi',
      domain: 'football',
      fa: 'مسی',
      en: 'Messi'
    },
    {
      aliases: [
        'رونالدو',
        'کریستیانو رونالدو',
        'ronaldo',
        'cristiano ronaldo',
        'cristiano'
      ],
      factId: 'cristiano_ronaldo',
      domain: 'football',
      fa: 'رونالدو',
      en: 'Ronaldo'
    },
    {
      aliases: ['مارادونا', 'maradona'],
      factId: null,
      domain: 'football',
      fa: 'مارادونا',
      en: 'Maradona'
    },
    {
      aliases: ['پله', 'pele'],
      factId: null,
      domain: 'football',
      fa: 'پله',
      en: 'Pele'
    },
    {
      aliases: [
        'خبیب',
        'حبیب',
        'خبیب نورمحمداف',
        'حبیب نورمحمداف',
        'khabib',
        'khabib nurmagomedov'
      ],
      factId: 'khabib',
      domain: 'mma',
      fa: 'خبیب',
      en: 'Khabib'
    },
    {
      aliases: ['جان جونز', 'جون جونز', 'jon jones'],
      factId: 'jon_jones',
      domain: 'mma',
      fa: 'جان جونز',
      en: 'Jon Jones'
    },
    {
      aliases: [
        'مک گرگور',
        'مکگرگور',
        'کانر مک گرگور',
        'mcgregor',
        'conor mcgregor',
        'conor'
      ],
      factId: 'conor_mcgregor',
      domain: 'mma',
      fa: 'مک‌گرگور',
      en: 'McGregor'
    },
    {
      aliases: ['توپوریا', 'ایلیا توپوریا', 'topuria', 'ilia topuria'],
      factId: 'ilia_topuria',
      domain: 'mma',
      fa: 'توپوریا',
      en: 'Topuria'
    },
    {
      aliases: ['ماخاچف', 'اسلام ماخاچف', 'makhachev', 'islam makhachev'],
      factId: 'islam_makhachev',
      domain: 'mma',
      fa: 'ماخاچف',
      en: 'Makhachev'
    },
    {
      aliases: ['بروس لی', 'bruce lee'],
      factId: 'bruce_lee_fighter',
      domain: 'mma',
      fa: 'بروس لی',
      en: 'Bruce Lee'
    },
    {
      aliases: ['مایک تایسون', 'تایسون', 'mike tyson', 'tyson'],
      factId: 'mike_tyson_boxer',
      domain: 'boxing',
      fa: 'تایسون',
      en: 'Tyson'
    },
    {
      aliases: ['محمد علی کلی', 'muhammad ali'],
      factId: null,
      domain: 'boxing',
      fa: 'محمد علی',
      en: 'Muhammad Ali'
    },
    {
      aliases: ['سقراط', 'socrates'],
      factId: 'socrates_philosopher',
      domain: 'philosophy',
      fa: 'سقراط',
      en: 'Socrates'
    },
    {
      aliases: ['افلاطون', 'plato'],
      factId: 'plato_philosopher',
      domain: 'philosophy',
      fa: 'افلاطون',
      en: 'Plato'
    },
    {
      aliases: ['ارسطو', 'aristotle'],
      factId: 'aristotle_philosopher',
      domain: 'philosophy',
      fa: 'ارسطو',
      en: 'Aristotle'
    },
    {
      aliases: ['نیچه', 'nietzsche'],
      factId: null,
      domain: 'philosophy',
      fa: 'نیچه',
      en: 'Nietzsche'
    },
    {
      aliases: ['اینشتین', 'انیشتین', 'einstein', 'albert einstein'],
      factId: 'einstein_scientist',
      domain: 'science',
      fa: 'اینشتین',
      en: 'Einstein'
    },
    {
      aliases: ['نیوتن', 'newton'],
      factId: null,
      domain: 'science',
      fa: 'نیوتن',
      en: 'Newton'
    },
    {
      aliases: ['حافظ', 'hafez'],
      factId: 'hafez_poet',
      domain: 'poetry',
      fa: 'حافظ',
      en: 'Hafez'
    },
    {
      aliases: ['فردوسی', 'ferdowsi'],
      factId: 'ferdowsi_poet',
      domain: 'poetry',
      fa: 'فردوسی',
      en: 'Ferdowsi'
    },
    {
      aliases: ['مولانا', 'rumi'],
      factId: 'rumi_poet',
      domain: 'poetry',
      fa: 'مولانا',
      en: 'Rumi'
    },
    {
      aliases: ['تختی', 'غلامرضا تختی', 'takhti'],
      factId: null,
      domain: 'wrestling',
      fa: 'تختی',
      en: 'Takhti'
    },
    {
      aliases: ['علی دایی', 'ali daei'],
      factId: null,
      domain: 'football',
      fa: 'علی دایی',
      en: 'Ali Daei'
    }
  ];

  /**
   * Same-domain "who is better" comparisons resolve to the curated
   * greatest-of-all-time facts instead of a generic decision framework.
   */
  const GOAT_FACT_BY_DOMAIN = {
    football: 'football_goat',
    mma: 'mma_goat',
    boxing: 'boxing_goat'
  };

  /** Longest aliases first so «لیونل مسی» wins over «مسی». */
  const ALIAS_INDEX = FAMOUS_FIGURES.flatMap((figure) =>
    figure.aliases.map((alias) => ({ alias, figure }))
  ).sort((a, b) => b.alias.length - a.alias.length);

  const ALIAS_ALTERNATION = ALIAS_INDEX.map((entry) =>
    entry.alias.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  ).join('|');

  /** «من مسی‌ام», «منم مسی», «من خود مسی هستم» (normalized text). */
  const FA_CLAIM = new RegExp(
    `^(?:من|منم)\\s+(?:خود |خودِ |همون )?(${ALIAS_ALTERNATION})` +
      '(?:\\s*(?:ام|هستم|م))?\\s*[!.؟?…]*$',
    'u'
  );
  /** «من مسی بعدی‌ام», «من مسی ایرانم», «من جانشین سقراطم». */
  const FA_NEXT = new RegExp(
    `^من\\s+(?:قراره\\s+)?(?:جانشین\\s+(${ALIAS_ALTERNATION})|` +
      `(${ALIAS_ALTERNATION})\\s+(?:بعدی|اینده|آینده|جدید|دوم|ایران|زمانه|زمونه))` +
      '(?:\\s*(?:ام|هستم|م|میشم|می شم|بشم))?\\s*[!.؟?…]*$',
    'u'
  );
  /** "I'm Messi", "im literally socrates". */
  const EN_CLAIM = new RegExp(
    "^(?:i\\s*am|i'?m)\\s+(?:actually\\s+|basically\\s+|literally\\s+)?" +
      `(?:the\\s+)?(${ALIAS_ALTERNATION})\\s*[!.?…]*$`,
    'iu'
  );
  /** "I am the next Messi", "i'm the Messi of Iran". */
  const EN_NEXT = new RegExp(
    "^(?:i\\s*am|i'?m)\\s+(?:going to be\\s+|gonna be\\s+)?the\\s+" +
      `(?:(?:next|new|second)\\s+(${ALIAS_ALTERNATION})|` +
      `(${ALIAS_ALTERNATION})\\s+of\\s+[\\p{L} ]+)\\s*[!.?…]*$`,
    'iu'
  );
  /** «مسی بهتره یا سیم مسی؟» and "Messi or messy?". */
  const FA_PUN = /سیم مسی/u;
  const EN_PUN = /\bmessi\b[^.!?]*\bmessy\b|\bmessy\b[^.!?]*\bmessi\b/iu;
  /** «مسی بهتره یا رونالدو؟», "who is better, messi or ronaldo?". */
  const FA_COMPARE = new RegExp(
    `^(?:به نظرت |بنظرت )?(${ALIAS_ALTERNATION})\\s+بهتره یا\\s+` +
      `(${ALIAS_ALTERNATION})\\s*[!.؟?…]*$`,
    'u'
  );
  const EN_COMPARE = new RegExp(
    `^(?:who(?:'s| is) better[,:]?\\s+)?(${ALIAS_ALTERNATION})\\s+` +
      `(?:or|vs\\.?|versus)\\s+(${ALIAS_ALTERNATION})\\s*[!.?…]*$`,
    'iu'
  );

  /**
   * Finds the famous figure named by an alias captured in a claim.
   * Case-insensitive: the claim regexes match "Messi" and "messi" alike.
   * @param {string} alias - The alias text captured from the message
   * @returns {object|null}
   */
  function figureByAlias(alias) {
    const needle = String(alias || '')
      .trim()
      .toLowerCase();
    const hit = ALIAS_INDEX.find((entry) => entry.alias === needle);
    return hit ? hit.figure : null;
  }

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Handles playful famous-figure turns: identity claims («من
     * مسی‌ام»), aspirations ("I'm the next Messi"), and the copper-wire
     * pun. Returns a reply or null. Runs BEFORE profile capture so a
     * joke never becomes the stored user name.
     * @param {string} matchingText - Normalized user text
     * @returns {string|null}
     */
    _handleFamousClaimTurn(matchingText) {
      const text = String(matchingText || '').trim();
      if (!text) {
        return null;
      }
      const isFa = this.lang.code === 'fa';
      const pick = (pool) =>
        this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      if ((isFa ? FA_PUN : EN_PUN).test(text)) {
        // The pun mentions the football fact's keywords, so it must win
        // before the knowledge lookup lectures about the GOAT debate.
        if (this.lang.famousPunResponses) {
          return pick(this.lang.famousPunResponses);
        }
        return null;
      }
      // «مسی بهتره یا رونالدو؟» - a same-domain comparison of two famous
      // figures answers from the curated GOAT fact; a cross-domain one
      // («مسی بهتره یا سقراط؟») gets the playful apples-and-oranges pool.
      const compareMatch = text.match(isFa ? FA_COMPARE : EN_COMPARE);
      if (compareMatch) {
        const first = figureByAlias(compareMatch[1]);
        const second = figureByAlias(compareMatch[2]);
        if (first && second && first !== second) {
          const kb = global.DaryaKnowledge;
          const goatId =
            first.domain === second.domain
              ? GOAT_FACT_BY_DOMAIN[first.domain]
              : null;
          const goatFact = goatId && kb?.factById ? kb.factById(goatId) : null;
          if (goatFact) {
            this._lastKnowledgeTopic = goatFact.id;
            this._lastKnowledgeTurn = this.memory.turnCount;
            return isFa ? goatFact.fa : goatFact.en;
          }
          if (this.lang.famousCompareResponses) {
            return pick(this.lang.famousCompareResponses)
              .replace(/\{a\}/gu, isFa ? first.fa : first.en)
              .replace(/\{b\}/gu, isFa ? second.fa : second.en);
          }
        }
      }
      const nextMatch = text.match(isFa ? FA_NEXT : EN_NEXT);
      if (nextMatch && this.lang.famousNextResponses) {
        const figure = figureByAlias(nextMatch[1] || nextMatch[2]);
        if (figure) {
          return pick(this.lang.famousNextResponses).replace(
            /\{figure\}/gu,
            isFa ? figure.fa : figure.en
          );
        }
      }
      const claimMatch = text.match(isFa ? FA_CLAIM : EN_CLAIM);
      if (claimMatch && this.lang.famousClaimResponses) {
        const figure = figureByAlias(claimMatch[1]);
        if (figure) {
          return pick(this.lang.famousClaimResponses).replace(
            /\{figure\}/gu,
            isFa ? figure.fa : figure.en
          );
        }
      }
      return null;
    },

    /**
     * Handles record/stats questions and tell-me-more turns on the
     * knowledge thread. Returns a reply or null when the turn is not a
     * knowledge follow-up (the regular pipeline continues).
     * @param {string} matchingText - Normalized user text
     * @returns {string|null}
     */
    _handleKnowledgeFollowupTurn(matchingText) {
      const kb = global.DaryaKnowledge;
      if (!kb || !kb.factById) {
        return null;
      }
      const text = String(matchingText || '').trim();
      const isFa = this.lang.code === 'fa';
      const pick = (pool) =>
        this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });
      const threadFresh =
        this._lastKnowledgeTopic &&
        // Media threads own their own "more" flow (see the media
        // override); the knowledge follow-ups never touch them.
        !String(this._lastKnowledgeTopic).startsWith('media_') &&
        this.memory.turnCount - this._lastKnowledgeTurn <=
          FOLLOWUP_WINDOW_TURNS;

      // --- Record / stats -------------------------------------------------
      const words = text.split(/\s+/u).filter(Boolean);
      if (
        this.lang.recordQuestionPattern?.test(text) &&
        words.length <= MAX_RECORD_ASK_WORDS
      ) {
        // A fighter named in the message wins over the thread topic, so
        // «رکورد خبیب چیه؟» works even as an opening question.
        let fact = null;
        const aliasHit = ALIAS_INDEX.find(
          (entry) =>
            entry.figure.factId &&
            new RegExp(
              `(?<![\\p{L}])${entry.alias.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?![\\p{L}])`,
              'iu'
            ).test(text)
        );
        if (aliasHit) {
          fact = kb.factById(aliasHit.figure.factId);
        }
        if (!fact && threadFresh) {
          fact = kb.factById(this._lastKnowledgeTopic);
        }
        if (!fact) {
          return null;
        }
        this._lastKnowledgeTopic = fact.id;
        this._lastKnowledgeTurn = this.memory.turnCount;
        this.memory.currentSubject = {
          topic: 'knowledge',
          entityRefs: [fact.id],
          since: this.memory.turnCount
        };
        if (fact.record) {
          const note = pick(
            fact.record.final && this.lang.recordFinalNotes
              ? this.lang.recordFinalNotes
              : this.lang.recordStalenessNotes
          );
          const body = isFa ? fact.record.fa : fact.record.en;
          return note ? `${body} ${note}` : body;
        }
        return this.lang.recordUnknownResponses
          ? pick(this.lang.recordUnknownResponses)
          : null;
      }

      // --- Tell me more ----------------------------------------------------
      if (this.lang.moreFollowupPattern?.test(text) && threadFresh) {
        const fact = kb.factById(this._lastKnowledgeTopic);
        if (!fact) {
          return null;
        }
        this._lastKnowledgeTurn = this.memory.turnCount;
        this.memory.currentSubject = {
          topic: 'knowledge',
          entityRefs: [fact.id],
          since: this.memory.turnCount
        };
        if (fact.more && !this._servedKnowledgeMore.has(fact.id)) {
          this._servedKnowledgeMore.add(fact.id);
          return isFa ? fact.more.fa : fact.more.en;
        }
        return this.lang.knowledgeDepthLimitResponses
          ? pick(this.lang.knowledgeDepthLimitResponses)
          : null;
      }
      return null;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
