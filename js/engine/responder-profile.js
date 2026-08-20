/**
 * Darya - session user profile memory (name and age).
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const {
    MAX_PROFILE_AGE_YEARS,
    MIN_PROFILE_NAME_LENGTH,
    YOUNG_USER_MAX_AGE,
    PERSIAN_DIGITS
  } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    // ======================================================================
    // Session user profile (name and age)
    //
    // The user discloses "من ۲۴ سالمه" or "my name is Sara" and later
    // asks "چند سالمه؟" or "what is my name?". Instead of the evasive
    // "I do not have an answer for that" line (a top complaint from real
    // transcripts), Darya stores the detail in this._userProfile and
    // answers the recall question from it. The profile is in-memory
    // only: it lives on the engine instance, is cleared when a new chat
    // starts, and is never persisted anywhere.
    // ======================================================================

    /**
     * Handles a profile disclosure or recall turn. Returns a reply, or
     * null when the input is not about the user's own age or name so the
     * normal pipeline continues. Ages are validated numerically but
     * stored in the script the user typed (Persian digits stay Persian),
     * so a recall answer echoes the user's own words; recall answers
     * substitute the stored values into {age}/{name} placeholders.
     * @param {string} matchingText - Normalized matching text
     * @returns {string|null}
     */
    _handleUserProfileTurn(matchingText) {
      const patterns = this.lang.userProfilePatterns;
      const pools = this.lang.userProfilePools;
      if (!patterns || !pools) {
        return null;
      }

      // A disclosure that ALSO carries real emotional weight («من ۷۲ سالمه
      // و تنها زندگی می‌کنم») should not be answered with a bare age/name
      // acknowledgment: the lived topic deserves the caring pool. The
      // values are still stored here (so recall works later), but the
      // reply is handed back to the emotional pipeline. Tradeoff: the user
      // gets no explicit "noted" confirmation on that turn (the emotional
      // reply wins), which is the desired priority. LIVED_TOPICS is read
      // lazily at call time (the turn runs long after every module has
      // loaded), so no load-order coupling is introduced.
      const livedSet =
        global.DaryaResponderShared && global.DaryaResponderShared.LIVED_TOPICS;
      const hasLivedTopic =
        !!livedSet && this.currentTurnTopics.some((t) => livedSet.has(t));
      const pickPool = (pool) =>
        this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });

      // A combined disclosure ("من آرتین هستم و ۲۴ سال دارم", "I'm Artin
      // and 24 years old") stores BOTH values and answers with the
      // bothStored pool, so the name is not lost when the age pattern
      // matches first. Recall-cue disclosures ("یادت میمونه اسمم آریاه")
      // follow the same path: the name is captured by the statement
      // pattern and answered warmly.
      const ageStmt = patterns.ageStatement.exec(matchingText);
      let rawAge = '';
      if (ageStmt) {
        const candidate = String(ageStmt[1] || ageStmt[2] || ageStmt[3] || '');
        const numeric = Number(
          candidate.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        );
        if (
          Number.isInteger(numeric) &&
          numeric > 0 &&
          numeric <= MAX_PROFILE_AGE_YEARS
        ) {
          rawAge = candidate;
        }
      }
      const nameStmt = patterns.nameStatement.exec(matchingText);
      let rawName = '';
      if (nameStmt) {
        let candidate = String(
          nameStmt[1] ||
            nameStmt[2] ||
            nameStmt[3] ||
            nameStmt[4] ||
            nameStmt[5] ||
            ''
        ).trim();
        // The copular capture ("I'm X" / "من X هستم" / "من Xم") is the
        // ambiguous branch: the pattern is case-insensitive, so "i'm not
        // sure how to start" would store the word "not". When the
        // language marks the copular branch as requiring a capital initial
        // (English, which has case), a lowercase capture is not a name.
        // Persian has no case, so it relies on nameStopwords alone.
        // Stopwords apply to both branches and both languages ("من خسته
        // هستم" is an emotion disclosure, never a name).
        // The glued first-person copula («من بارانم») is the FA group-3
        // branch. nameAttachedGroup (a pack flag, like nameRequiresCapital)
        // names that group so the check never misfires on another
        // language's group-3 capture (EN's call-me form).
        const attachedCopula =
          patterns.nameAttachedGroup != null &&
          Boolean(nameStmt[patterns.nameAttachedGroup]);
        const copularCapture = Boolean(nameStmt[2]) || attachedCopula;
        // The matched branch's group index (first non-empty capture).
        // English's call-me form is an explicit form that still requires
        // a capital initial (nameCapitalGroups), because the whole
        // nameStatement pattern is case-insensitive: without the handler
        // check, "call me tomorrow" would store the lowercase word
        // "tomorrow" as a name.
        const matchedGroupIndex =
          nameStmt[1] !== undefined
            ? 1
            : nameStmt[2] !== undefined
              ? 2
              : nameStmt[3] !== undefined
                ? 3
                : 4;
        const capitalRequired =
          copularCapture ||
          Boolean(
            patterns.nameCapitalGroups &&
            patterns.nameCapitalGroups.includes(matchedGroupIndex)
          );
        if (
          capitalRequired &&
          patterns.nameRequiresCapital &&
          !/^\p{Lu}/u.test(candidate)
        ) {
          candidate = '';
        }
        if (
          candidate &&
          patterns.nameStopwords &&
          (patterns.nameStopwords.includes(candidate.toLowerCase()) ||
            // «اسمم مطمینه» captures the copula «ه» inside the candidate
            // («مطمینه»); the stripped stem «مطمین» is the stopword the
            // ئ to ی normalizer produces from «مطمئن», so it must be tested
            // too or the state slips through as a name.
            (patterns.nameCopulaStrip &&
              patterns.nameStopwords.includes(
                candidate.replace(patterns.nameCopulaStrip, '').toLowerCase()
              )))
        ) {
          candidate = '';
        }
        // The attached first-person copula («من بارانم») glues a «م» onto
        // the word. Adjective stems drop the final «ه» when the copula is
        // attached («من خستم» is «خسته» + «م»), so a candidate that
        // restores the «ه» to a stopword is a state, never a name. The
        // full «ام» suffix keeps the «ه» («من خستهام» captures «خستها»),
        // so the trailing «ا» is restored to «ه» for the same check.
        if (
          attachedCopula &&
          candidate &&
          patterns.nameStopwords &&
          (patterns.nameStopwords.includes(candidate.toLowerCase() + 'ه') ||
            patterns.nameStopwords.includes(
              candidate.replace(/ا$/u, '').toLowerCase()
            ))
        ) {
          candidate = '';
        }
        if (patterns.nameCopulaStrip && candidate) {
          const stripped = candidate.replace(patterns.nameCopulaStrip, '');
          if (stripped.length >= MIN_PROFILE_NAME_LENGTH) {
            candidate = stripped;
          }
        }
        if (candidate.length >= MIN_PROFILE_NAME_LENGTH) {
          rawName = candidate;
        }
      }

      // Both disclosed in one turn: store and acknowledge together. When
      // the turn also carries a lived topic (see above), store the values
      // and defer the reply to the emotional pipeline instead.
      if (rawAge && rawName) {
        this._userProfile.age = rawAge;
        this._userProfile.name = rawName;
        if (hasLivedTopic) {
          return null;
        }
        return pickPool(
          this._isYoungUserAge(rawAge) && pools.bothStoredYoung
            ? pools.bothStoredYoung
            : pools.bothStored
        )
          .replace('{age}', rawAge)
          .replace('{name}', rawName);
      }
      if (rawAge) {
        this._userProfile.age = rawAge;
        if (hasLivedTopic) {
          return null;
        }
        return pickPool(
          this._isYoungUserAge(rawAge) && pools.ageStoredYoung
            ? pools.ageStoredYoung
            : pools.ageStored
        ).replace('{age}', rawAge);
      }
      if (rawName) {
        this._userProfile.name = rawName;
        if (hasLivedTopic) {
          return null;
        }
        return pickPool(pools.nameStored).replace('{name}', rawName);
      }

      // Location disclosure ("I live in Tehran", «تهران زندگی می‌کنم»):
      // stored for the session so "where do I live?" is answered from
      // memory. A lived-topic turn stores silently, same as age/name.
      // The recall QUESTION is checked first: «یادته کجا زندگی می‌کنم؟»
      // contains the same living verb as a disclosure and must never be
      // parsed as one.
      const isLocationQuestion =
        patterns.locationQuestion &&
        patterns.locationQuestion.test(matchingText);
      if (
        !isLocationQuestion &&
        patterns.locationStatement &&
        pools.locationStored
      ) {
        const locStmt = patterns.locationStatement.exec(matchingText);
        if (locStmt) {
          const place = String(locStmt[1] || locStmt[2] || '').trim();
          if (place.length >= MIN_PROFILE_NAME_LENGTH) {
            this._userProfile.location = place;
            if (hasLivedTopic) {
              return null;
            }
            return pickPool(pools.locationStored).replace('{location}', place);
          }
        }
      }

      // Combined recall («یادته که گفتم من کی هستم و چند سالمه؟», "do you
      // remember who I am and how old I am?"): both the age and the name
      // question fire on one turn, so the reply must answer from whatever
      // was actually stored - both, one, or honestly none (the pools
      // never invent facts). This was the transcript's worst failure: the
      // recall question was misread as a disclosure and «کی» was stored
      // as a name.
      const ageQuestion = patterns.ageQuestion.test(matchingText);
      const nameQuestion = patterns.nameQuestion.test(matchingText);
      const hasAge = this._userProfile.age !== null;
      const hasName = this._userProfile.name !== null;
      if (ageQuestion && nameQuestion) {
        if (hasAge && hasName && pools.bothKnown) {
          return pickPool(pools.bothKnown)
            .replace('{age}', this._userProfile.age)
            .replace('{name}', this._userProfile.name);
        }
        if (hasAge) {
          return pickPool(pools.ageKnown).replace(
            '{age}',
            this._userProfile.age
          );
        }
        if (hasName) {
          return pickPool(pools.nameKnown).replace(
            '{name}',
            this._userProfile.name
          );
        }
        if (pools.noneKnown) {
          return pickPool(pools.noneKnown);
        }
      }
      if (ageQuestion) {
        if (hasAge) {
          return pickPool(pools.ageKnown).replace(
            '{age}',
            this._userProfile.age
          );
        }
        return pickPool(pools.ageUnknown);
      }
      if (nameQuestion) {
        if (hasName) {
          return pickPool(pools.nameKnown).replace(
            '{name}',
            this._userProfile.name
          );
        }
        return pickPool(pools.nameUnknown);
      }

      // Location recall ("where do I live?", «کجا زندگی می‌کنم؟»):
      // answered from the stored location, or honestly unknown.
      if (
        patterns.locationQuestion &&
        patterns.locationQuestion.test(matchingText)
      ) {
        if (this._userProfile.location && pools.locationKnown) {
          return pickPool(pools.locationKnown).replace(
            '{location}',
            this._userProfile.location
          );
        }
        if (pools.locationUnknown) {
          return pickPool(pools.locationUnknown);
        }
      }

      // Preference disclosure (\"I love coffee\", «از شلوغی بدم میاد»): the
      // user names something they like or dislike, and Darya stores it so
      // a later recall (\"what do I like?\", «چی دوست دارم؟») is answered
      // from memory instead of an evasive line. A lived-topic turn stores
      // silently (the emotional reply wins), same as age/name/location.
      const isPreferenceQuestion =
        patterns.preferenceQuestion &&
        patterns.preferenceQuestion.test(matchingText);
      if (
        !isPreferenceQuestion &&
        patterns.preferenceStatement &&
        pools.preferenceStored
      ) {
        const prefStmt = patterns.preferenceStatement.exec(matchingText);
        if (prefStmt) {
          // The statement pattern has three capture shapes: the object
          // after the verb («عاشق قهوه هستم», "I love coffee") in group 1,
          // the object before a dislike verb («از شلوغی بدم میاد») in
          // group 2, and the object before «دوست دارم» («قهوه رو خیلی
          // دوست دارم») in group 3.
          let pref = String(
            prefStmt[1] || prefStmt[2] || prefStmt[3] || ''
          ).trim();
          // Strip a trailing Persian copula so «عاشق قهوه هستم» stores
          // «قهوه», not «قهوه هستم». A bare «ه» is deliberately NOT
          // stripped: it is part of many ordinary objects («قهوه»,
          // «میوه», «خانه») and removing it mangles the stored word.
          pref = pref
            .replace(/(?:\s+)?(?:هستم|هست|است|ام|ای|یم|ید|ند)$/u, '')
            .trim();
          if (pref.length >= MIN_PROFILE_NAME_LENGTH) {
            this._userProfile.preferences.push(pref);
            if (hasLivedTopic) {
              return null;
            }
            return pickPool(pools.preferenceStored).replace(
              '{preference}',
              pref
            );
          }
        }
      }

      // Preference recall (\"what do I like?\", «چی دوست دارم؟»): answered
      // from the most recently stated preference, or honestly unknown.
      // The .test() guard is required so a non-recall turn never falls
      // through to the unknown pool.
      if (
        patterns.preferenceQuestion &&
        patterns.preferenceQuestion.test(matchingText) &&
        pools.preferenceKnown
      ) {
        const knownPrefs = this._userProfile.preferences;
        if (knownPrefs.length > 0) {
          return pickPool(pools.preferenceKnown).replace(
            '{preference}',
            knownPrefs[knownPrefs.length - 1]
          );
        }
        if (pools.preferenceUnknown) {
          return pickPool(pools.preferenceUnknown);
        }
      }
      return null;
    },

    /**
     * Returns true when a disclosed age reads as a child (at or below
     * YOUNG_USER_MAX_AGE). Used to switch the stored-age reply to the
     * age-appropriate young pool, which warmly encourages a trusted
     * adult instead of assuming adult self-reliance. Accepts Persian
     * or ASCII digits.
     * @param {string} rawAge - The age exactly as disclosed
     * @returns {boolean}
     */
    _isYoungUserAge(rawAge) {
      const numeric = Number(
        String(rawAge).replace(/[۰-۹]/g, (d) =>
          String(PERSIAN_DIGITS.indexOf(d))
        )
      );
      return Number.isInteger(numeric) && numeric <= YOUNG_USER_MAX_AGE;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
