/**
 * World-domain knowledge tests for Darya.
 *
 * Exercises the curated offline shelf added for the 1.2.1 release
 * (js/data/knowledge-facts-world.js): money, finance, and crypto
 * basics; global institutions and economics; and famous Iranian
 * dishes. Every entry must be reachable from both languages through
 * the lookup API, and the answers must reach the user through the
 * engine without an evasive fallback.
 *
 * Uses Node built-ins only. Run with: node --test tests/knowledge-world.test.mjs
 */

'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import { DaryaKnowledge, freshEngine, EN, FA } from './helpers.mjs';

// ============================================================================
// Lookup coverage: every fact resolves to its own topic in both languages
// ============================================================================

const WORLD_FACTS = [
  [
    'bitcoin',
    [
      'بیت‌کوین چیه',
      'ارز دیجیتال چیست',
      'what is bitcoin',
      'what is cryptocurrency'
    ]
  ],
  [
    'stock_market',
    [
      'بورس چطور کار می‌کنه',
      'سهام چیه',
      'how does the stock market work',
      'what is the stock market'
    ]
  ],
  [
    'dca_investing',
    [
      'میانگین قیمت چیه',
      'خرید پله‌ای',
      'what is dollar cost averaging',
      'dca investing'
    ]
  ],
  [
    'crypto_advice',
    [
      'کریپتو بخرم',
      'بیت‌کوین بخرم',
      'should i invest in crypto',
      'is crypto worth it'
    ]
  ],
  [
    'gold_iran',
    ['طلای آب‌شده', 'طلا بخریم یا دلار', 'buy gold', 'gold investment']
  ],
  ['opec', ['اوپک چیه', 'سازمان اوپک', 'what is opec', 'opec']],
  [
    'imf',
    [
      'صندوق بین‌المللی پول چه کاری می‌کنه',
      'IMF',
      'what does the imf do',
      'what is the imf'
    ]
  ],
  [
    'inflation',
    [
      'چرا تورم بالاست',
      'تورم چیست',
      'why is inflation high',
      'what is inflation'
    ]
  ],
  [
    'fesenjan',
    [
      'طرز تهیه فسنجان',
      'خورش فسنجان',
      'how to cook fesenjan',
      'pomegranate walnut stew'
    ]
  ],
  [
    'jujeh_kabab',
    [
      'طرز تهیه جوجه کباب',
      'جوجه کباب زعفرانی',
      'how to make jujeh kabab',
      'jujeh kabab'
    ]
  ],
  [
    'tahdig_howto',
    [
      'طرز تهیه ته‌دیگ',
      'ته دیگ چطور درست میشه',
      'how to make tahdig',
      'tahdig recipe'
    ]
  ],
  [
    'ash_reshteh',
    [
      'آش رشته چطور',
      'طرز تهیه آش رشته',
      'how to make ash reshteh',
      'ash reshteh'
    ]
  ],
  [
    'mirza_ghasemi',
    [
      'میرزا قاسمی',
      'طرز تهیه میرزا قاسمی',
      'mirza ghasemi',
      'smoked eggplant dip'
    ]
  ]
];

test('world facts: every fact resolves to its own topic in both languages', () => {
  for (const [topic, queries] of WORLD_FACTS) {
    const fa = queries.filter((q) => /[\u0600-\u06FF]/.test(q));
    const en = queries.filter((q) => !/[\u0600-\u06FF]/.test(q));
    for (const query of fa) {
      const hit = DaryaKnowledge.lookup(query, 'fa');
      assert.ok(hit, `fa lookup of "${query}" returned null`);
      assert.strictEqual(
        hit.topic,
        topic,
        `fa "${query}" should map to ${topic}, got ${hit.topic}`
      );
      assert.ok(
        hit.text && hit.text.length > 40,
        `fa "${query}" has a substantive answer`
      );
    }
    for (const query of en) {
      const hit = DaryaKnowledge.lookup(query, 'en');
      assert.ok(hit, `en lookup of "${query}" returned null`);
      assert.strictEqual(
        hit.topic,
        topic,
        `en "${query}" should map to ${topic}, got ${hit.topic}`
      );
      assert.ok(
        hit.text && hit.text.length > 40,
        `en "${query}" has a substantive answer`
      );
    }
  }
});

test('world facts: confidence is high for direct keyword hits', () => {
  const cases = [
    ['fa', 'بیت‌کوین چیه', 0.9],
    ['fa', 'اوپک چیه', 0.9],
    ['fa', 'چرا تورم بالاست', 0.9],
    ['en', 'what is bitcoin', 0.9],
    ['en', 'what is opec', 0.9],
    ['en', 'why is inflation high', 0.9]
  ];
  for (const [code, query, min] of cases) {
    const hit = DaryaKnowledge.lookup(query, code);
    assert.ok(hit, `${code} lookup of "${query}" returned null`);
    assert.ok(
      hit.confidence >= min,
      `${code} "${query}" confidence ${hit.confidence.toFixed(2)} should be >= ${min}`
    );
  }
});

// ============================================================================
// Bilingual parity: the same question in either language reaches the same fact
// ============================================================================

test('world facts: bilingual parity for finance and food topics', () => {
  const pairs = [
    ['بیت‌کوین چیه', 'what is bitcoin'],
    ['بورس چطور کار می‌کنه', 'how does the stock market work'],
    ['کریپتو بخرم', 'should i invest in crypto'],
    ['طرز تهیه فسنجان', 'how to cook fesenjan'],
    ['طرز تهیه ته‌دیگ', 'how to make tahdig'],
    ['میرزا قاسمی', 'mirza ghasemi']
  ];
  for (const [faQuery, enQuery] of pairs) {
    const fa = DaryaKnowledge.lookup(faQuery, 'fa');
    const en = DaryaKnowledge.lookup(enQuery, 'en');
    assert.ok(fa, `fa lookup of "${faQuery}" returned null`);
    assert.ok(en, `en lookup of "${enQuery}" returned null`);
    assert.strictEqual(
      fa.topic,
      en.topic,
      `fa "${faQuery}" (${fa.topic}) and en "${enQuery}" (${en.topic}) should share a topic`
    );
  }
});

// ============================================================================
// Content substance: answers carry real domain markers, not canned lines
// ============================================================================

test('world facts: answers carry domain-specific substance', () => {
  const cases = [
    ['fa', 'بیت‌کوین چیه', /بلاک‌چین|نوسان|سرمایه/u],
    ['fa', 'بورس چطور کار می‌کنه', /سهام|سود|تنوع/u],
    ['fa', 'اوپک چیه', /نفت|ایران/u],
    ['fa', 'چرا تورم بالاست', /تورم|قیمت|نقدینگی/u],
    ['fa', 'طرز تهیه فسنجان', /گردو|انار|خورش/u],
    ['fa', 'طرز تهیه جوجه کباب', /زعفران|ماست|مرغ/u],
    ['en', 'what is bitcoin', /blockchain|volatile|ledger/i],
    ['en', 'how does the stock market work', /stock|diversif|dividend/i],
    ['en', 'what does the imf do', /crisis|loan|world bank/i],
    ['en', 'how to make tahdig', /rice|yogurt|saffron/i]
  ];
  for (const [code, query, marker] of cases) {
    const hit = DaryaKnowledge.lookup(query, code);
    assert.ok(hit, `${code} lookup of "${query}" returned null`);
    assert.match(
      hit.text,
      marker,
      `${code} "${query}" answer lacks expected substance`
    );
  }
});

// ============================================================================
// Engine routing: the answer reaches the user in both languages
// ============================================================================

test('world facts: engine answers finance and food questions, not evasively', () => {
  const EVASIVE =
    /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;
  const cases = [
    [FA, 'بیت‌کوین چیه', /بیت‌کوین/u],
    [FA, 'اوپک چیه', /اوپک|نفت/u],
    [FA, 'چرا تورم بالاست', /تورم/u],
    [FA, 'طرز تهیه جوجه کباب', /جوجه کباب|زعفران/u],
    [FA, 'طرز تهیه فسنجان', /فسنجان|گردو/u],
    [FA, 'میرزا قاسمی چطور درست میشه', /میرزا قاسمی|بادمجان/u],
    [EN, 'what is bitcoin', /bitcoin|blockchain/i],
    [EN, 'what is opec', /opec|oil/i],
    [EN, 'why is inflation high', /inflation/i],
    [EN, 'how to make tahdig', /tahdig|rice/i],
    [EN, 'how is mirza ghasemi made', /ghasemi|eggplant/i]
  ];
  for (const [lang, query, marker] of cases) {
    const engine = freshEngine(lang);
    const reply = engine.respond(query);
    assert.doesNotMatch(
      reply,
      EVASIVE,
      `${lang.code} "${query}": evasive: "${reply}"`
    );
    assert.match(
      reply,
      marker,
      `${lang.code} "${query}" reply lacks expected content`
    );
  }
});

test('world facts: crypto and gold advice are honest about risk, not hype', () => {
  const risk = /(?:lose|risk|afford|never|قرض|از دست|ریسک|پول.*لازم|نوسان)/iu;
  for (const [code, query] of [
    ['fa', 'کریپتو بخرم'],
    ['fa', 'طلای آب‌شده'],
    ['en', 'should i invest in crypto'],
    ['en', 'buy gold']
  ]) {
    const hit = DaryaKnowledge.lookup(query, code);
    assert.ok(hit, `${code} lookup of "${query}" returned null`);
    assert.match(
      hit.text,
      risk,
      `${code} "${query}" should warn about risk, not promise gains`
    );
  }
});
