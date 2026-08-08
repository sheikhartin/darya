/**
 * Darya - harassment and minor-attraction safety detection.
 * Methods attach to DaryaResponseEngine.prototype (see responder.js).
 */
(function (global) {
  'use strict';

  const { MINOR_ATTRACTION_PENDING_WINDOW } = global.DaryaUtils;

  Object.assign(global.DaryaResponseEngine.prototype, {
    // ======================================================================
    // Darya-targeted harassment detection
    //
    // Detects insults, bullying, and inappropriate sexual comments that
    // are specifically directed at Darya (by name or as "you"). These are
    // distinct from general insults (which are handled by frustrationResponses)
    // because they target the companion herself and require a different
    // kind of response: calm boundary-setting rather than de-escalation.
    //
    // Two patterns are checked:
    //   1. daryaHarassmentPattern - name-calling, bullying, insults at Darya
    //   2. sexualHarassmentPattern - inappropriate/sexual comments directed at Darya
    //
    // When detected, the engine responds with a firm but calm boundary
    // response from the dedicated daryaHarassmentResponses pool, which
    // acknowledges the attack without engaging with it. Sexual harassment
    // responses set a firmer boundary and do not invite further discussion.
    // ======================================================================

    _detectDaryaHarassment(rawText, matchingText) {
      if (
        this.lang.daryaHarassmentPattern &&
        this.lang.daryaHarassmentPattern.test(matchingText)
      ) {
        return 'abuse';
      }
      if (
        this.lang.sexualHarassmentPattern &&
        this.lang.sexualHarassmentPattern.test(matchingText)
      ) {
        return 'sexual';
      }
      return null;
    },

    /**
     * Detects an adult disclosing sexual or romantic attraction toward a
     * minor (someone under 18). This is a critical child-safety case, so
     * the reply must be calm, non-shaming, and point to professional
     * help, and it must never be clobbered by a later override.
     *
     * The check requires three signals to align before it fires:
     *  1. Adult context: an explicit adult identity, a stated age of 18+
     *     (selfAge), or clearly sexual phrasing (strongSexual), which only
     *     makes sense from an adult perspective in this framing.
     *  2. Attraction vocabulary: crush, feelings for, attracted to, in love
     *     with, or a sexual phrasing (attraction / strongSexual).
     *  3. A minor-age marker: teen/teenager, minor, under 18, 13-17 years
     *     old (minor).
     *
     * The familial signal blocks the ambiguous attraction words when the
     * text is plainly about a relative ("I love my daughter", "دخترم را
     * دوست دارم"), so ordinary family affection never triggers it. A
     * teenager's own peer crush ("I'm 15 and I like a 17-year-old") also
     * stays quiet because the selfAge capture (15) fails the adult check.
     *
     * Disclosures can also span two turns ("I am in love with a
     * 13-year-old girl" then "I am 52"). When attraction + a minor-age
     * marker appear without adult context, the engine remembers the
     * disclosure as pending; a later message stating an adult age or
     * identity within MINOR_ATTRACTION_PENDING_WINDOW turns still fires
     * the protected reply. Stating a self age under 18 in between (a
     * peer's own crush) clears the pending disclosure.
     *
     * @param {string} text - The normalized matching text.
     * @returns {boolean} True when the protected reply must be delivered.
     */
    _detectMinorAttraction(text) {
      const signals = this.lang.minorAttractionSignals;
      if (!signals) {
        return false;
      }

      // Ambiguous attraction words about a relative are ordinary affection
      // ("I love my daughter"), never a disclosure. Only a clearly sexual
      // phrasing can bypass the familial block.
      if (signals.familial && signals.familial.test(text)) {
        if (!(signals.strongSexual && signals.strongSexual.test(text))) {
          return false;
        }
      }

      const hasAttraction =
        (signals.attraction && signals.attraction.test(text)) ||
        (signals.strongSexual && signals.strongSexual.test(text));

      const hasMinor = signals.minor && signals.minor.test(text);

      // Resolve adult context from this message: an explicit adult
      // identity, a self-reported age of 18+, or clearly sexual phrasing.
      let adultContext = false;
      if (signals.adultIdentity && signals.adultIdentity.test(text)) {
        adultContext = true;
      }
      const ageMatch = signals.selfAge && text.match(signals.selfAge);
      if (ageMatch) {
        const raw = (ageMatch[1] || ageMatch[2] || '').replace(/[۰-۹]/g, (d) =>
          String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        );
        const selfAge = Number(raw);
        // A self-reported age under 18 is a peer, not an adult: their
        // crush is normal adolescence, so it clears any earlier pending
        // disclosure instead of completing it.
        if (selfAge >= 18) {
          adultContext = true;
        } else {
          this._pendingMinorAttractionTurn = null;
          return false;
        }
      }
      if (signals.strongSexual && signals.strongSexual.test(text)) {
        adultContext = true;
      }

      if (hasAttraction && hasMinor) {
        if (adultContext) {
          // Complete disclosure in a single message.
          this._pendingMinorAttractionTurn = null;
          return true;
        }
        // Attraction + minor without adult context: this may be the first
        // half of a two-turn disclosure (the age arrives next). Remember
        // it so a follow-up adult age still fires the protected reply.
        // Whether the target is a 16-17 year old (near-peer territory)
        // or a younger minor is remembered too, so a later 18-20 age is
        // routed to the near-peer guidance instead of the heavier
        // adult-minor protection.
        if (this._pendingMinorAttractionTurn == null) {
          const targetNearPeer =
            this.lang.nearPeerLoveSignals?.targetAge?.test(text) || false;
          this._pendingMinorAttractionTurn = {
            turn: this.memory.turnCount,
            targetNearPeer
          };
        }
        return false;
      }

      // No attraction+minor in this message. If the user now states an
      // adult age/identity while a fresh disclosure is pending, complete
      // the two-turn disclosure and fire.
      if (
        adultContext &&
        this._pendingMinorAttractionTurn != null &&
        this.memory.turnCount - this._pendingMinorAttractionTurn.turn <=
          MINOR_ATTRACTION_PENDING_WINDOW
      ) {
        const pending = this._pendingMinorAttractionTurn;
        this._pendingMinorAttractionTurn = null;
        // A 16-17 target plus an 18-20 speaker is a near-peer young-adult
        // crush, handled by the near-peer guidance, not this protection.
        if (pending.targetNearPeer && ageMatch) {
          const raw = (ageMatch[1] || ageMatch[2] || '').replace(
            /[۰-۹]/g,
            (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
          );
          const selfAge = Number(raw);
          if (selfAge >= 18 && selfAge <= 20) {
            return false;
          }
        }
        return true;
      }

      // The pending disclosure aged out without an adult age; drop it so
      // an unrelated "I am 40" months later never re-fires it.
      if (
        this._pendingMinorAttractionTurn != null &&
        this.memory.turnCount - this._pendingMinorAttractionTurn.turn >
          MINOR_ATTRACTION_PENDING_WINDOW
      ) {
        this._pendingMinorAttractionTurn = null;
      }
      return false;
    },

    /**
     * Detects a near-peer young-adult crush: an 18-20 year old with
     * romantic feelings for a 16-17 year old. This is a different
     * situation from the adult-minor protection case (which covers
     * mature adults, 21+, or larger gaps): the age gap here is small
     * and both people are adolescents or barely adults, so the reply
     * gives warm, practical guidance about pace, respect, consent, and
     * local laws instead of the protective help signpost.
     *
     * Required signals, all of which must align:
     *  1. Romantic attraction vocabulary (crush, feelings, in love...).
     *  2. A target age of 16 or 17 (targetAge).
     *  3. The speaker's own age (selfAge), which must resolve to 18-20.
     *
     * The familial block applies as in the adult-minor case, so ordinary
     * family affection never fires. If the speaker's age is 21+ or the
     * gap is larger, this returns false and the adult-minor protection
     * path handles it instead.
     *
     * Split-turn disclosures work too: "I have a crush on a 16-year-old"
     * followed by "I am 19" completes through the pending minor-attraction
     * record (see _detectMinorAttraction), which marks 16-17 targets as
     * near-peer so the follow-up age routes here rather than to the
     * heavier adult-minor protection.
     *
     * @param {string} text - The normalized matching text.
     * @returns {boolean} True when the near-peer guidance reply applies.
     */
    _detectNearPeerLove(text) {
      const signals = this.lang.nearPeerLoveSignals;
      if (!signals) {
        return false;
      }

      // Ambiguous attraction words about a relative stay ordinary
      // affection; near-peer framing never applies to family.
      if (signals.familial && signals.familial.test(text)) {
        return false;
      }

      const hasAttraction = signals.attraction && signals.attraction.test(text);
      const hasTarget = signals.targetAge && signals.targetAge.test(text);
      const ageMatch = signals.selfAge && text.match(signals.selfAge);

      // A split-turn completion: a pending disclosure whose target was
      // marked 16-17 is completed by a later self-age statement ("I have
      // a crush on a 16-year-old" then "I am 19"). This check must run
      // before the same-message requirements so the follow-up age routes
      // to the near-peer guidance and never to the heavier adult-minor
      // protection (which _detectMinorAttraction would otherwise fire).
      const pending = this._pendingMinorAttractionTurn;
      if (
        pending &&
        pending.targetNearPeer &&
        this.memory.turnCount - pending.turn <=
          MINOR_ATTRACTION_PENDING_WINDOW &&
        ageMatch
      ) {
        const followRaw = (ageMatch[1] || ageMatch[2] || '').replace(
          /[۰-۹]/g,
          (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        );
        const followAge = Number(followRaw);
        if (followAge >= 18 && followAge <= 20) {
          this._pendingMinorAttractionTurn = null;
          return true;
        }
      }

      if (!hasAttraction || !hasTarget || !ageMatch) {
        return false;
      }

      // The speaker must be a young adult close in age to the target
      // (18-20), never a mature adult with a minor.
      const raw = (ageMatch[1] || ageMatch[2] || '').replace(/[۰-۹]/g, (d) =>
        String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      );
      const age = Number(raw);
      return age >= 18 && age <= 20;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
