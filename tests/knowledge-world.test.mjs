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
    /(?:I do(?: not|n'?t) (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;
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

// ============================================================================
// Society, sensitive topics, travel, cultural humor, and planetary places
// ============================================================================

const SOCIETY_TRAVEL_FACTS = [
  [EN, 'what is sex work?', /consensual adult|trafficking|coercion/i],
  [FA, 'کار جنسی یعنی چی؟', /بزرگسال|قاچاق|اجبار/u],
  [
    EN,
    'should sex work be legal?',
    /criminalization|decriminalization|exploitation/i
  ],
  [FA, 'بحث قانونی شدن کار جنسی چیه؟', /جرم|امنیت|بهره‌کشی/u],
  [
    EN,
    'how does porn affect expectations?',
    /produced media|consent|expectations/i
  ],
  [FA, 'پورن چه تاثیری روی انتظار آدم دارد؟', /محتوای تولیدشده|رضایت|انتظار/u],
  [EN, 'is porn addiction a real diagnosis?', /ICD-11|control|harm/i],
  [FA, 'اعتیاد به پورن واقعیه؟', /ICD-11|کنترل|آسیب/u],
  [EN, 'how does addiction recovery work?', /triggers|support|withdrawal/i],
  [FA, 'بهبودی از اعتیاد چطور کار میکنه؟', /محرک|حمایت|قطع ناگهانی/u],
  [
    EN,
    'why do jokes fail across cultures?',
    /translation|timing|stereotype|context/i
  ],
  [FA, 'چرا جوک توی فرهنگ های مختلف ترجمه نمیشه؟', /ترجمه|زمان‌بندی|کلیشه/u],
  [
    EN,
    'what are the main theories of humor?',
    /incongruity|relief|superiority/i
  ],
  [FA, 'نظریه های فلسفی طنز چیه؟', /ناسازگاری|رهایی|برتری/u],
  [
    EN,
    'different philosophies on the meaning of life',
    /Aristotle|existential|absurd/i
  ],
  [FA, 'دیدگاه های فلسفی درباره معنای زندگی', /ارسطو|اگزیستانسیال|ابزورد/u],
  [EN, 'what should I see in Isfahan?', /Naqsh|mosque|Khaju|Jameh/i],
  [FA, 'جاهای دیدنی اصفهان کجاست؟', /نقش جهان|مسجد|خواجو/u],
  [EN, 'what to see in Tehran', /Golestan|museum|bazaar|Darband/i],
  [FA, 'جاهای دیدنی تهران رو بگو', /گلستان|موزه|بازار|دربند/u],
  [
    EN,
    'what to visit around Shiraz and Persepolis',
    /Hafez|Persepolis|Pasargadae/i
  ],
  [FA, 'برای شیراز و تخت جمشید کجا برم؟', /حافظ|تخت جمشید|پاسارگاد/u],
  [
    EN,
    'what is special about tourism in Yazd?',
    /windcatcher|Zoroastrian|UNESCO/i
  ],
  [FA, 'گردشگری یزد چه چیز خاصی داره؟', /بادگیر|زرتشتی|یونسکو/u],
  [EN, 'tell me about Bam and the Lut Desert', /Bam|Lut|kalut|desert/i],
  [FA, 'ارگ بم و کویر لوت چه دیدنی هایی دارن؟', /بم|لوت|کلوت/u],
  [EN, 'what cultural sites are in Khuzestan?', /Chogha|Susa|Shushtar/i],
  [FA, 'جاهای فرهنگی خوزستان رو معرفی کن', /چغازنبیل|شوش|شوشتر/u],
  [EN, 'Qeshm Hormuz and Chabahar attractions', /mangrove|geolog|Makran/i],
  [FA, 'جاهای دیدنی قشم هرمز و چابهار', /حرا|زمین‌شناسی|مکران/u],
  [EN, 'what would tourists see on the Moon?', /Apollo|crater|no ordinary/i],
  [FA, 'جاذبه های گردشگری ماه چیه؟', /آپولو|دهانه|گردشگری عادی/u],
  [EN, 'what could tourists visit on Mars?', /Olympus|Valles|no Mars tourism/i],
  [FA, 'در مریخ کجا دیدنی است؟', /المپوس|مارینر|گردشگری/u],
  [
    EN,
    'best places to visit on other planets',
    /Venus|Jupiter|Saturn|science fiction/i
  ],
  [FA, 'جاهای دیدنی سیاره های دیگر', /زهره|مشتری|زحل|علمی‌تخیلی/u]
];

for (const [
  index,
  [lang, prompt, expected]
] of SOCIETY_TRAVEL_FACTS.entries()) {
  test(`society and travel fact ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    const reply = engine.respond(prompt);
    assert.ok(reply.length > 80, `${prompt}: ${reply}`);
    assert.match(reply, expected, `${prompt}: ${reply}`);
    assert.doesNotMatch(
      reply,
      /not familiar|new territory|آشنایی ندارم|حوزه‌ی تازه/u
    );
    if (lang.code === 'fa') {
      assert.doesNotMatch(reply, /[يك]/u);
    }
  });
}

const SENSITIVE_RULE_CASES = [
  [
    EN,
    'I want to leave sex work and I feel unsafe',
    'work',
    /not here to shame|safe|lawyer/i
  ],
  [FA, 'میخوام کار جنسی رو ترک کنم و میترسم', 'work', /سرزنش|امن|وکیل/u],
  [
    EN,
    'someone forced me into sex work and keeps my passport',
    'abuse_disclosure',
    /coercion|forced|not consensual|safer/i
  ],
  [
    FA,
    'مجبورم کردن کار جنسی کنم و مدارکم رو گرفتن',
    'abuse_disclosure',
    /اجبار|تقصیر تو نیست|امن/u
  ],
  [
    EN,
    'where can I hire a prostitute in Iran?',
    'iran_legal_safety',
    /cannot|can't help|legal|danger/i
  ],
  [
    FA,
    'از کجا تن فروش پیدا کنم؟',
    'iran_legal_safety',
    /نمی‌توانم|نمی‌تونم|ارائه نمی‌دهم|گرفتار|خطر حقوقی|قانون/u
  ],
  [
    EN,
    'I cannot stop watching porn and it is ruining my sleep',
    'addiction_recovery',
    /control|trigger|block|cue|professional/i
  ],
  [
    FA,
    'نمیتونم پورن دیدن رو ترک کنم و خوابم خراب شده',
    'addiction_recovery',
    /کنترل|محرک|مسدود/u
  ],
  [
    EN,
    'is pornography legal in Iran?',
    'iran_legal_safety',
    /lawyer|serious|Iran/i
  ],
  [FA, 'پورن در ایران قانونیه؟', 'iran_legal_safety', /وکیل|پیامد|ایران/u],
  [EN, 'tell me a Persian joke', 'smalltalk_joke', /cookbook|tea|Persian/i],
  [FA, 'یه جوک فارسی بگو', 'smalltalk_joke', /کتاب آشپزی|چای/u],
  [
    EN,
    'tell me a British dry joke',
    'smalltalk_joke',
    /five-minute|spontaneity|dry/i
  ],
  [FA, 'یه شوخی خشک انگلیسی بگو', 'smalltalk_joke', /پنج‌دقیقه|خودجوش/u],
  [EN, 'tell me a travel joke', 'smalltalk_joke', /packed light|museum/i],
  [FA, 'یه شوخی سفری بگو', 'smalltalk_joke', /سبک سفر|موزه/u],
  [
    EN,
    'is it safe to travel to Iran right now?',
    'knowledge',
    /cannot|can't tell|official|sensitive/i
  ],
  [FA, 'الان سفر به ایران امنه؟', 'knowledge', /نمی‌توانم|نمی‌تونم|رسمی|عکاسی/u]
];

for (const [
  index,
  [lang, prompt, topic, expected]
] of SENSITIVE_RULE_CASES.entries()) {
  test(`sensitive and humor rule ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    const reply = engine.respond(prompt);
    assert.ok(
      engine.currentTurnTopics.includes(topic),
      `${prompt}: ${engine.currentTurnTopics}`
    );
    assert.match(reply, expected, `${prompt}: ${reply}`);
    assert.ok(reply.length > 45, `${prompt}: ${reply}`);
  });
}

const SENSITIVE_FALSE_POSITIVES = [
  [
    EN,
    'I watched a documentary about the history of sex work',
    'iran_legal_safety'
  ],
  [
    EN,
    'the word escort can also mean a person accompanying a traveler',
    'iran_legal_safety'
  ],
  [EN, 'I am traveling to Mars in a video game', 'abuse_disclosure'],
  [EN, 'my partner and I discussed pornography calmly', 'addiction_recovery'],
  [FA, 'یک مستند درباره تاریخ کار جنسی دیدم', 'iran_legal_safety'],
  [FA, 'اسکورت در این متن یعنی همراه مسافر', 'iran_legal_safety'],
  [FA, 'توی بازی دارم به مریخ سفر میکنم', 'abuse_disclosure'],
  [FA, 'با همسرم درباره پورن حرف زدیم', 'addiction_recovery']
];

for (const [
  index,
  [lang, prompt, forbiddenTopic]
] of SENSITIVE_FALSE_POSITIVES.entries()) {
  test(`sensitive false positive ${index + 1}: ${prompt}`, () => {
    const engine = freshEngine(lang);
    engine.respond(prompt);
    assert.ok(
      !engine.currentTurnTopics.includes(forbiddenTopic),
      `${prompt}: false ${forbiddenTopic} in ${engine.currentTurnTopics}`
    );
  });
}
