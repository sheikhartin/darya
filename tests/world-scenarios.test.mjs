/**
 * World-scenarios suite: tools, people, sports, money, education, food,
 * the future of work, language learning, and three engine-behavior fixes
 * (the «چیکار میکنی» check-in reading, repetition complaints, and the
 * single-script-per-conversation boundary).
 *
 * Each scenario runs on a fresh engine in one language. A turn may pin a
 * topic (which must appear in the routed topics), a content signal (which
 * the reply must match), and an avoid pattern (which the reply must not
 * match). Every scenario name is shown in the failure output, so a broken
 * one is immediately identifiable.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import { freshEngine, FA, EN } from './helpers.mjs';

/** Evasive lines that must never answer a topic the engine knows. */
const EVASIVE =
  /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/**
 * Each entry: name, language code, and turns. A turn is a small object
 * with `text`, optional `topic`, `mustMatch` (regex source), and `avoid`.
 * @type {Array<{name: string, language: 'fa'|'en', turns: Array<object>}>}
 */
const SCENARIOS = [
  // ---------------- IDEs and editors ----------------
  {
    name: 'ide overview',
    language: 'fa',
    turns: [
      {
        text: 'آی دی ای چیه؟',
        topic: 'knowledge',
        mustMatch: 'ادیتور|دیباگر|محیط'
      },
      {
        text: 'فرق ide و ادیتور چیه؟',
        topic: 'knowledge',
        mustMatch: 'ادیتور|محیط|ساده'
      }
    ]
  },
  {
    name: 'ide overview (en)',
    language: 'en',
    turns: [
      {
        text: 'what is an ide?',
        topic: 'knowledge',
        mustMatch: 'editor|debugger|environment'
      },
      {
        text: 'which editor should i use for programming?',
        topic: 'knowledge',
        mustMatch: 'vs code|editor|language'
      }
    ]
  },
  {
    name: 'vs code',
    language: 'fa',
    turns: [
      {
        text: 'وی اس کد چیه؟',
        topic: 'knowledge',
        mustMatch: 'مایکروسافت|افزونه|ادیتور'
      }
    ]
  },
  {
    name: 'jetbrains ides',
    language: 'en',
    turns: [
      {
        text: 'what is intellij idea?',
        topic: 'knowledge',
        mustMatch: 'java|ide|jetbrains'
      },
      {
        text: 'what is pycharm?',
        topic: 'knowledge',
        mustMatch: 'python|ide|jetbrains'
      }
    ]
  },
  {
    name: 'mobile ides',
    language: 'fa',
    turns: [
      {
        text: 'اندروید استودیو چیه؟',
        topic: 'knowledge',
        mustMatch: 'اندروید|کاتلین|ایکس|استودیو'
      },
      { text: 'ایکس کد چیه؟', topic: 'knowledge', mustMatch: 'اپل|سویفت|ایکس' }
    ]
  },
  {
    name: 'terminal editors',
    language: 'en',
    turns: [
      {
        text: 'what is vim?',
        topic: 'knowledge',
        mustMatch: 'editor|terminal|keyboard'
      },
      {
        text: 'vim or neovim?',
        topic: 'knowledge',
        mustMatch: 'editor|terminal|keyboard'
      }
    ]
  },

  // ---------------- Fonts ----------------
  {
    name: 'fonts overview',
    language: 'fa',
    turns: [
      { text: 'فونت چیه؟', topic: 'knowledge', mustMatch: 'سریف|سن|فونت' },
      {
        text: 'فرق سریف و سن سریف چیه؟',
        topic: 'knowledge',
        mustMatch: 'سریف|سن'
      }
    ]
  },
  {
    name: 'coding fonts',
    language: 'en',
    turns: [
      {
        text: 'best font for coding?',
        topic: 'knowledge',
        mustMatch: 'mono|jetbrains|fira|code'
      }
    ]
  },
  {
    name: 'persian fonts',
    language: 'fa',
    turns: [
      {
        text: 'بهترین فونت فارسی چیه؟',
        topic: 'knowledge',
        mustMatch: 'وزیرمتن|ایران|فونت'
      },
      {
        text: 'وزیرمتن یا ایران سنس؟',
        topic: 'knowledge',
        mustMatch: 'وزیرمتن|ایران|فونت'
      }
    ]
  },
  {
    name: 'web fonts',
    language: 'en',
    turns: [
      {
        text: 'best font for a website?',
        topic: 'knowledge',
        mustMatch: 'inter|roboto|sans|font'
      }
    ]
  },
  {
    name: 'document fonts',
    language: 'fa',
    turns: [
      {
        text: 'فونت مناسب پایان نامه چیه؟',
        topic: 'knowledge',
        mustMatch: 'نازنین|تایمز|فونت|وزیرمتن'
      }
    ]
  },

  // ---------------- چیکار میکنی ambiguity ----------------
  {
    name: 'chikar mikoní is a check-in, not an ability question',
    language: 'fa',
    turns: [
      {
        text: 'چیکار میکنی؟',
        topic: 'about_darya_now',
        mustMatch: 'الان|کنار|گوش|گفتگو|حرف'
      },
      {
        text: 'الان چیکار میکنی؟',
        topic: 'about_darya_now',
        mustMatch: 'الان|کنار|گوش|گفتگو|حرف'
      }
    ]
  },
  {
    name: 'ability phrasing still answers abilities',
    language: 'fa',
    turns: [
      { text: 'چیکار میتونی بکنی؟', topic: 'smalltalk_capability' },
      { text: 'چه کاری بلدی؟', topic: 'smalltalk_capability' }
    ]
  },
  {
    name: 'today check-in keeps its own day answer',
    language: 'fa',
    turns: [
      {
        text: 'امروز چیکار میکنی؟',
        topic: 'about_darya_day',
        mustMatch: 'گوش|امروز|روز'
      }
    ]
  },
  {
    name: 'what are you doing (en)',
    language: 'en',
    turns: [
      {
        text: 'what are you doing?',
        topic: 'about_darya_now',
        mustMatch: 'here|listen|talking|conversation|attention'
      },
      { text: 'what can you do?', topic: 'smalltalk_capability' }
    ]
  },

  // ---------------- Influencers and public figures ----------------
  {
    name: 'ishowspeed',
    language: 'fa',
    turns: [
      {
        text: 'آی شو اسپید کیست؟',
        topic: 'knowledge',
        mustMatch: 'استریمر|یوتیوب|پخش'
      }
    ]
  },
  {
    name: 'mrbeast',
    language: 'en',
    turns: [
      {
        text: 'who is mrbeast?',
        topic: 'knowledge',
        mustMatch: 'youtuber|challenge|subscrib'
      }
    ]
  },
  {
    name: 'cristiano ronaldo',
    language: 'fa',
    turns: [
      {
        text: 'کریستیانو رونالدو کیست؟',
        topic: 'knowledge',
        mustMatch: 'فوتبال|پرتغال|گل'
      }
    ]
  },
  {
    name: 'lionel messi',
    language: 'en',
    turns: [
      {
        text: 'who is lionel messi?',
        topic: 'knowledge',
        mustMatch: 'football|argentina|world cup'
      }
    ]
  },
  {
    name: 'lebron james',
    language: 'en',
    turns: [
      {
        text: 'who is lebron james?',
        topic: 'knowledge',
        mustMatch: 'basketball|nba'
      }
    ]
  },
  {
    name: 'michael jordan',
    language: 'fa',
    turns: [
      {
        text: 'مایکل جردن کیست؟',
        topic: 'knowledge',
        mustMatch: 'بسکتبال|شیکاگو|جردن'
      }
    ]
  },
  {
    name: 'khabib',
    language: 'fa',
    turns: [
      {
        text: 'حبیب نورمحمداف کیست؟',
        topic: 'knowledge',
        mustMatch: 'رزمی|یو اف سی|داغستان|شکست'
      }
    ]
  },
  {
    name: 'taylor swift',
    language: 'en',
    turns: [
      {
        text: 'who is taylor swift?',
        topic: 'knowledge',
        mustMatch: 'singer|music|album'
      }
    ]
  },
  {
    name: 'pewdiepie and charli',
    language: 'en',
    turns: [
      {
        text: 'who is pewdiepie?',
        topic: 'knowledge',
        mustMatch: 'youtuber|subscrib|gaming'
      },
      {
        text: 'who is charli damelio?',
        topic: 'knowledge',
        mustMatch: 'tiktok|danc'
      }
    ]
  },

  // ---------------- Sporting events ----------------
  {
    name: 'fifa world cup',
    language: 'fa',
    turns: [
      {
        text: 'جام جهانی فوتبال چیه؟',
        topic: 'knowledge',
        mustMatch: 'فیفا|چهار سال|فوتبال'
      }
    ]
  },
  {
    name: 'world cup history',
    language: 'en',
    turns: [
      {
        text: 'who has won the most world cups?',
        topic: 'knowledge',
        mustMatch: 'brazil|five|title'
      },
      {
        text: 'who won the 2022 world cup final?',
        topic: 'knowledge',
        mustMatch: 'argentina|messi|penalt'
      }
    ]
  },
  {
    name: 'volleyball history',
    language: 'fa',
    turns: [
      {
        text: 'والیبال رو کی اختراع کرد؟',
        topic: 'knowledge',
        mustMatch: 'مورگان|۱۸۹۵|۱۸۹۵|والیبال'
      }
    ]
  },
  {
    name: 'iran volleyball',
    language: 'fa',
    turns: [
      {
        text: 'تیم ملی والیبال ایران چطور بوده؟',
        topic: 'knowledge',
        mustMatch: 'آسیا|قهرمان|والیبال|ایران'
      }
    ]
  },
  {
    name: 'olympics overview',
    language: 'en',
    turns: [
      {
        text: 'when did the modern olympics start?',
        topic: 'knowledge',
        mustMatch: '1896|athens|greece'
      }
    ]
  },

  // ---------------- Repetition complaints ----------------
  {
    name: 'repetition complaint, annoyed (fa)',
    language: 'fa',
    turns: [
      {
        text: 'بازم همینو گفتی احمق',
        topic: 'repeat_complaint',
        mustMatch: 'تکرار|تازه|عوض'
      },
      {
        text: 'داری خودتو تکرار میکنی بابا',
        topic: 'repeat_complaint',
        mustMatch: 'تکرار|تازه|عوض'
      }
    ]
  },
  {
    name: 'repetition complaint, playful (fa)',
    language: 'fa',
    turns: [
      {
        text: 'هاها بازم تکراری گفتی 😄',
        topic: 'repeat_complaint',
        mustMatch: 'تکرار|تازه|عوض'
      }
    ]
  },
  {
    name: 'repetition complaint, annoyed (en)',
    language: 'en',
    turns: [
      {
        text: 'you keep repeating yourself',
        topic: 'repeat_complaint',
        mustMatch: 'repeat|fresh|switch'
      },
      {
        text: 'you are so repetitive, annoying',
        topic: 'repeat_complaint',
        mustMatch: 'repeat|fresh|switch'
      }
    ]
  },
  {
    name: 'repetition complaint, playful (en)',
    language: 'en',
    turns: [
      {
        text: 'same answer again lol',
        topic: 'repeat_complaint',
        mustMatch: 'repeat|fresh|switch'
      }
    ]
  },

  // ---------------- Cryptocurrencies and investing ----------------
  {
    name: 'solana',
    language: 'fa',
    turns: [
      {
        text: 'سولانا چیه؟',
        topic: 'knowledge',
        mustMatch: 'سرعت|کارمزد|بلاک|اثبات'
      }
    ]
  },
  {
    name: 'cardano',
    language: 'en',
    turns: [
      {
        text: 'what is cardano?',
        topic: 'knowledge',
        mustMatch: 'research|peer|blockchain|ada'
      }
    ]
  },
  {
    name: 'stablecoins',
    language: 'fa',
    turns: [
      {
        text: 'تتر چیه؟',
        topic: 'knowledge',
        mustMatch: 'دلار|تتر|یواس|استیبل'
      },
      {
        text: 'استیبل کوین چیه؟',
        topic: 'knowledge',
        mustMatch: 'دلار|استیبل|نوسان'
      }
    ]
  },
  {
    name: 'other coins',
    language: 'en',
    turns: [
      {
        text: 'what is ripple xrp?',
        topic: 'knowledge',
        mustMatch: 'bank|transfer|xrp'
      },
      {
        text: 'what is litecoin?',
        topic: 'knowledge',
        mustMatch: 'bitcoin|older|crypto'
      }
    ]
  },
  {
    name: 'stock indices and diversification',
    language: 'fa',
    turns: [
      {
        text: 'اس اند پی ۵۰۰ چیه؟',
        topic: 'knowledge',
        mustMatch: 'شاخص|شرکت|بورس'
      },
      {
        text: 'چطور سبد سرمایه رو متنوع کنم؟',
        topic: 'knowledge',
        mustMatch: 'تنوع|ریسک|دارایی'
      }
    ]
  },
  {
    name: 'etf and bonds',
    language: 'en',
    turns: [
      {
        text: 'what is an etf?',
        topic: 'knowledge',
        mustMatch: 'fund|index|stock'
      },
      {
        text: 'what is a bond?',
        topic: 'knowledge',
        mustMatch: 'loan|interest|government'
      }
    ]
  },

  // ---------------- Sexuality education (non-explicit) ----------------
  {
    name: 'what is a fetish',
    language: 'fa',
    turns: [
      {
        text: 'فتیش یعنی چی؟',
        topic: 'knowledge',
        mustMatch: 'رضایت|امن|طبیعی'
      }
    ]
  },
  {
    name: 'what is a kink (en)',
    language: 'en',
    turns: [
      {
        text: 'what is a kink?',
        topic: 'knowledge',
        mustMatch: 'consent|safe|natural'
      }
    ]
  },
  {
    name: 'fetish gender question',
    language: 'fa',
    turns: [
      {
        text: 'آیا فتیش زن‌ها و مردها فرق داره؟',
        topic: 'knowledge',
        mustMatch: 'تفاوت|کلیشه|فرد'
      }
    ]
  },
  {
    name: 'consent basics',
    language: 'en',
    turns: [
      {
        text: 'what is consent?',
        topic: 'knowledge',
        mustMatch: 'agree|revoc|silence'
      }
    ]
  },

  // ---------------- Universities ----------------
  {
    name: 'harvard',
    language: 'fa',
    turns: [
      {
        text: 'دانشگاه هاروارد چطوره؟',
        topic: 'knowledge',
        mustMatch: 'هاروارد|آمریکا|قدیمی'
      }
    ]
  },
  {
    name: 'mit',
    language: 'en',
    turns: [
      {
        text: 'what is mit known for?',
        topic: 'knowledge',
        mustMatch: 'engineer|computer|science|mit'
      }
    ]
  },
  {
    name: 'oxford vs cambridge',
    language: 'fa',
    turns: [
      {
        text: 'آکسفورد یا کمبریج کدوم بهتره؟',
        topic: 'knowledge',
        mustMatch: 'آکسفورد|کمبریج|دانشگاه'
      }
    ]
  },
  {
    name: 'university comparison and admission',
    language: 'en',
    turns: [
      {
        text: 'what is the best university in the world?',
        topic: 'knowledge',
        mustMatch: 'field|depends|harvard|mit'
      },
      {
        text: 'how do i apply to a good university?',
        topic: 'knowledge',
        mustMatch: 'grade|statement|admission'
      }
    ]
  },

  // ---------------- Foods and fast food ----------------
  {
    name: 'fast food overview',
    language: 'fa',
    turns: [
      {
        text: 'فست فود چیه؟',
        topic: 'knowledge',
        mustMatch: 'سریع|کالری|زنجیره'
      }
    ]
  },
  {
    name: 'fast food history',
    language: 'en',
    turns: [
      {
        text: 'history of fast food?',
        topic: 'knowledge',
        mustMatch: 'mcdonald|america|chain'
      }
    ]
  },
  {
    name: 'pizza and burger',
    language: 'fa',
    turns: [
      {
        text: 'تاریخچه پیتزا چیه؟',
        topic: 'knowledge',
        mustMatch: 'ناپل|ایتالیا|پیتزا'
      }
    ]
  },
  {
    name: 'fast food health',
    language: 'en',
    turns: [
      {
        text: 'is fast food bad for you?',
        topic: 'knowledge',
        mustMatch: 'calorie|salt|health'
      }
    ]
  },
  {
    name: 'iranian fast food',
    language: 'fa',
    turns: [
      {
        text: 'فست فود ایرانی چیا هستن؟',
        topic: 'knowledge',
        mustMatch: 'فالافل|بندری|سمبوسه|کباب'
      }
    ]
  },

  // ---------------- AI and the future of work ----------------
  {
    name: 'will ai take my job',
    language: 'fa',
    turns: [
      {
        text: 'آیا هوش مصنوعی شغل مرا میگیرد؟',
        topic: 'knowledge',
        mustMatch: 'تکراری|خودکار|شغل'
      }
    ]
  },
  {
    name: 'will ai replace programmers',
    language: 'fa',
    turns: [
      {
        text: 'آیا هوش مصنوعی جای برنامه نویس رو میگیره؟',
        topic: 'knowledge',
        mustMatch: 'کد|برنامه|معماری|دیباگ|مسئله'
      }
    ]
  },
  {
    name: 'will ai replace designers',
    language: 'en',
    turns: [
      {
        text: 'will ai replace graphic designers?',
        topic: 'knowledge',
        mustMatch: 'design|brand|human|ai'
      }
    ]
  },
  {
    name: 'future-proof skills',
    language: 'fa',
    turns: [
      {
        text: 'چطور برای آینده مهارت یاد بگیرم؟',
        topic: 'knowledge',
        mustMatch: 'مهارت|خلاقیت|هوش مصنوعی'
      }
    ]
  },

  // ---------------- Script-boundary questions ----------------
  {
    name: 'why cant i write english (fa)',
    language: 'fa',
    turns: [
      {
        text: 'چرا نمیتونم انگلیسی بنویسم؟',
        topic: 'knowledge',
        mustMatch: 'خط|فارسی|انگلیسی|زبان'
      },
      {
        text: 'چطور زبان رو عوض کنم؟',
        topic: 'knowledge',
        mustMatch: 'زبان|انگلیسی|گفتگو'
      }
    ]
  },
  {
    name: 'why cant i write english (en)',
    language: 'en',
    turns: [
      {
        text: "why can't i write english?",
        topic: 'knowledge',
        mustMatch: 'script|language|conversation'
      },
      {
        text: 'how do i switch the language?',
        topic: 'knowledge',
        mustMatch: 'language|conversation|picker'
      }
    ]
  },

  // ---------------- Learning new languages ----------------
  {
    name: 'which language to learn',
    language: 'fa',
    turns: [
      {
        text: 'چه زبانی یاد بگیرم؟',
        topic: 'knowledge',
        mustMatch: 'انگلیسی|اسپانیایی|زبان|چینی'
      }
    ]
  },
  {
    name: 'is english worth it',
    language: 'en',
    turns: [
      {
        text: 'is english worth learning?',
        topic: 'knowledge',
        mustMatch: 'science|business|internet|english'
      }
    ]
  },
  {
    name: 'how to learn a language',
    language: 'fa',
    turns: [
      {
        text: 'بهترین روش یادگیری زبان چیه؟',
        topic: 'knowledge',
        mustMatch: 'گوش|صحبت|روزانه|ورودی'
      }
    ]
  },
  {
    name: 'language difficulty',
    language: 'en',
    turns: [
      {
        text: 'what is the hardest language to learn?',
        topic: 'knowledge',
        mustMatch: 'chinese|japanese|depends|script'
      }
    ]
  }
];

test('all 55 world scenarios route and answer meaningfully', () => {
  for (const scenario of SCENARIOS) {
    const lang = scenario.language === 'fa' ? FA : EN;
    const engine = freshEngine(lang);
    const routed = [];
    const replies = scenario.turns.map((turn) => {
      const reply = engine.respond(turn.text);
      routed.push([...engine.currentTurnTopics]);
      return reply;
    });
    scenario.turns.forEach((turn, i) => {
      const label = `${scenario.name}:${turn.text}`;
      assert.ok(replies[i].length > 5, `${label}: empty reply`);
      // Self-description pools honestly name Darya's limits ("I cannot
      // verify prices", "بیرون از دانش بسته‌بندی‌شده"), which is not the
      // evasive dodge the EVASIVE guard catches on knowledge turns.
      const selfDescriptionTopic = [
        'smalltalk_capability',
        'about_darya_now',
        'about_darya_day'
      ].includes(turn.topic);
      if (!selfDescriptionTopic) {
        assert.doesNotMatch(replies[i], EVASIVE, `${label}: evasive`);
      }
      if (turn.topic) {
        assert.ok(
          routed[i].includes(turn.topic),
          `${label}: expected ${turn.topic}, got [${routed[i]}]`
        );
      }
      if (turn.mustMatch) {
        assert.match(
          replies[i],
          new RegExp(turn.mustMatch, 'iu'),
          `${label}: "${replies[i].split('\n')[0]}"`
        );
      }
      if (turn.avoid) {
        assert.doesNotMatch(
          replies[i],
          new RegExp(turn.avoid, 'iu'),
          `${label}: must avoid /${turn.avoid}/`
        );
      }
    });
  }
});

test('there are at least 45 world scenarios', () => {
  assert.ok(SCENARIOS.length >= 45, `expected >= 45, got ${SCENARIOS.length}`);
});
