/**
 * Darya - life-facts memory.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 *
 * Complements the profile memory (name, age, location, preferences) with
 * a store for arbitrary facts the user states about their life, so a later
 * recall question is answered from memory instead of an evasive line:
 *
 *   - profession:  "my sister is a nurse" -> "what does my sister do?"
 *   - name:        "my dog is named Rex"  -> "what is my dog called?"
 *   - count:       "I have two kids"      -> "how many kids do I have?"
 *   - relationship: "I am married"        -> "am I married?"
 *
 * Facts are stored by kind + normalized subject. A statement turn stores
 * the fact; when the turn also carries a lived topic (a family or work
 * disclosure), the fact is stored silently and the topic reply wins,
 * mirroring the profile handler. Otherwise the turn gets a brief
 * acknowledgment so the user feels heard rather than dropped into the
 * unknown pool. Recall always answers from the store, or honestly unknown.
 * Everything is session-only and cleared with the engine, never persisted.
 *
 * Capture layout (group indices) per kind, so the handler and the
 * language-pack patterns agree:
 *
 *   statements: profession  m[1]=subject  m[2]=value
 *               name        m[1]=subject  m[2]=value
 *               count       m[1]=value    m[2]=subject
 *               relationship m[1]=value    (subject is fixed)
 *   recalls:    profession  m[1]=subject
 *               name        m[1]=subject
 *               count       m[1]=subject
 *               relationship m[1]=(ignored; the stored status is answered)
 */
(function (global) {
  'use strict';

  // Name is checked before profession: «اسم همسرم ندا هست» (my wife's name
  // is Neda) would otherwise match the profession statement on the bare
  // «همسرم» and store «ندا» as a job. The «اسم» prefix makes the name
  // statement the more specific one, so it wins. Recall order is
  // unaffected because the recall patterns are mutually distinct.
  const FACT_KINDS = ['name', 'profession', 'count', 'relationship'];

  // Reads the subject/value capture for a statement match, following the
  // documented per-kind layout above.
  function readStatement(kind, match) {
    if (kind === 'count') {
      return { subject: match[2], value: match[1] };
    }
    if (kind === 'relationship') {
      return { subject: 'relationship', value: match[1] };
    }
    return { subject: match[1], value: match[2] };
  }

  // Reads the subject for a recall match (relationship has none).
  function readRecallSubject(kind, match) {
    if (kind === 'relationship') {
      return 'relationship';
    }
    return match[1];
  }

  Object.assign(global.DaryaResponseEngine.prototype, {
    /**
     * Handles a life-fact disclosure or recall turn. Returns a reply, or
     * null when the input is not about a storable fact so the normal
     * pipeline continues.
     * @param {string} matchingText - Normalized matching text.
     * @returns {string|null}
     */
    _handleLifeFactsTurn(matchingText) {
      const cfg = this.lang.lifeFacts;
      const pools = this.lang.lifeFactPools;
      if (!cfg || !pools) {
        return null;
      }

      const pickPool = (pool) =>
        this._pickVaried(pool, {
          ignoreQuestionBudget: true,
          trackQuestions: false
        });

      // A disclosure that also carries real emotional weight ("my mother
      // is sick and I am so worried") should not be answered with a bare
      // fact acknowledgment: the lived topic deserves the caring pool.
      const livedSet =
        global.DaryaResponderShared && global.DaryaResponderShared.LIVED_TOPICS;
      const hasLivedTopic =
        !!livedSet && this.currentTurnTopics.some((t) => livedSet.has(t));

      const normalizeSubject = (value) =>
        String(value || '')
          .trim()
          .toLocaleLowerCase();

      // ------------------------------------------------------------------
      // 1. Recall first: a question about a stored fact is answered from
      //    memory, never re-captured as a new statement.
      // ------------------------------------------------------------------
      for (const kind of FACT_KINDS) {
        const recall = cfg.recalls && cfg.recalls[kind];
        if (!recall) {
          continue;
        }
        const match = recall.exec(matchingText);
        if (!match) {
          continue;
        }
        const subject = readRecallSubject(kind, match);
        const key = `${kind}:${normalizeSubject(subject)}`;
        const fact = this._lifeFacts.get(key);
        const knownPool = pools[`${kind}Known`];
        const unknownPool = pools[`${kind}Unknown`];
        if (fact && knownPool && knownPool.length) {
          return pickPool(knownPool)
            .replace('{value}', fact.value)
            .replace('{subject}', fact.subject);
        }
        if (unknownPool && unknownPool.length) {
          return pickPool(unknownPool).replace(
            '{subject}',
            fact ? fact.subject : subject
          );
        }
      }

      // ------------------------------------------------------------------
      // 2. Statement capture: store the fact. A lived-topic turn stores
      //    silently (the emotional reply wins); otherwise acknowledge.
      // ------------------------------------------------------------------
      for (const kind of FACT_KINDS) {
        const statement = cfg.statements && cfg.statements[kind];
        if (!statement) {
          continue;
        }
        const match = statement.exec(matchingText);
        if (!match) {
          continue;
        }
        const { subject, value } = readStatement(kind, match);
        if (!subject || !value) {
          continue;
        }
        const cleanSubject = String(subject).trim();
        // Strip a trailing Persian copula «ه» glued to a noun («پرستاره» ->
        // «پرستار», «مهندسه» -> «مهندس»). English words never carry it, so
        // this is a no-op there. Only applied to profession and name
        // values, where the copula is the common glued form; count and
        // relationship values are words of their own.
        let cleanValue = String(value).trim();
        if (kind === 'profession' || kind === 'name') {
          cleanValue = cleanValue.replace(/\u0647$/u, '').trim();
        }
        if (!cleanSubject || !cleanValue) {
          continue;
        }
        const key = `${kind}:${normalizeSubject(cleanSubject)}`;
        // A new statement replaces an older one for the same subject, so
        // the store never holds two contradictory values.
        this._lifeFacts.set(key, {
          subject: cleanSubject,
          value: cleanValue,
          kind
        });
        const storedPool = pools[`${kind}Stored`];
        if (hasLivedTopic) {
          return null;
        }
        if (storedPool && storedPool.length) {
          return pickPool(storedPool)
            .replace('{value}', cleanValue)
            .replace('{subject}', cleanSubject);
        }
      }

      return null;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
