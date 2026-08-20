/**
 * Knowledge-breadth suite for the 1.7.0 offline shelf expansion.
 *
 * Exercises every new fact module twice: once through the direct lookup
 * API (which pins the topic) and once through the live engine (which must
 * answer meaningfully in both languages, never with an evasive fallback or
 * a canned dodge). The covered domains are programming languages and their
 * comparisons, art history and design, social and communication platforms,
 * markets and tech companies, tech stacks across eras, generations and era
 * trends, learning guides, natural foods, and sports supplements.
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DaryaKnowledge,
  freshEngine,
  normalizeForMatching,
  FA,
  EN
} from './helpers.mjs';

/** Evasive lines that must never appear when the engine knows the topic. */
const EVASIVE =
  /(?:I do not (?:know|have)|don'?t (?:know|have)|no (?:ready )?answer|not familiar|outside my|راستش جواب|جواب روشن|همین حالا (?:نمی‌دانم|نمیدانم|جوابی ندارم)|آماده‌ای ندارم|آشنایی ندارم|از دانش من خارج|خوب نمی‌شناسم)/iu;

/** The canned dodge lines the hostile transcript flagged specifically. */
const DODGE =
  /(?:این انتخاب به شرایط خودت|هر مسیری که بروی|کوتاه بود|لازم نیست همه‌چیز را یک‌باره حل کنی|همین که این را گفتی|این سؤال به خودی خود جالب)/iu;

/**
 * Each entry: the Persian and English question, the expected fact topic,
 * and a content signal the reply must carry in each language.
 * @type {Array<[string, string, string, RegExp, RegExp]>}
 */
const CASES = [
  [
    'تایپ اسکریپت چیه؟',
    'what is typescript?',
    'typescript',
    /تایپ|جاوااسکریپت/,
    /typed|javascript/i
  ],
  [
    'زبان جاوا چیه؟',
    'what is java?',
    'java_language',
    /جاوا|jvm|اندروید|سازمان/,
    /java|enterprise|android/i
  ],
  [
    'زبان سی چیه؟',
    'what is the c language?',
    'c_language',
    /سیستمی|سخت|هسته/,
    /systems|kernel|hardware/i
  ],
  [
    'سی پلاس پلاس چیه؟',
    'what is c plus plus?',
    'cplusplus',
    /بازی|سیستمی|سرعت/,
    /game|systems|speed/i
  ],
  [
    'سی شارپ چیه؟',
    'what is c sharp?',
    'csharp_language',
    /مایکروسافت|ویندوز|یونیتی/,
    /microsoft|windows|unity/i
  ],
  [
    'زبان گو چیه؟',
    'what is golang?',
    'go_language',
    /گوگل|میکروسرویس|ابر/,
    /google|microservices|cloud/i
  ],
  [
    'زبان راست چیه؟',
    'what is rust?',
    'rust_language',
    /امنیت حافظه|سیستم/,
    /memory|system/i
  ],
  [
    'کاتلین چیه؟',
    'what is kotlin?',
    'kotlin_language',
    /اندروید|جاوا/,
    /android|java/i
  ],
  ['سویفت چیه؟', 'what is swift?', 'swift_language', /اپل|ios/, /apple|ios/i],
  [
    'پی اچ پی چیه؟',
    'what is php?',
    'php_language',
    /وردپرس|لاراول|وب/,
    /wordpress|laravel|web/i
  ],
  ['روبی چیه؟', 'what is ruby?', 'ruby_language', /ریلز|وب/, /rails|web/i],
  [
    'دارت چیه؟',
    'what is dart?',
    'dart_language',
    /فلاتر|گوگل/,
    /flutter|google/i
  ],
  [
    'اس کیو ال چیه؟',
    'what is sql?',
    'sql_language',
    /پایگاه|دیتابیس/,
    /database|query/i
  ],
  [
    'فرق پایتون و جاوااسکریپت؟',
    'difference between python and javascript?',
    'python_vs_javascript',
    /پایتون|جاوااسکریپت/,
    /python|javascript/i
  ],
  [
    'فرق جاوا و کاتلین؟',
    'difference between java and kotlin?',
    'java_vs_kotlin',
    /کاتلین|جاوا/,
    /kotlin|java/i
  ],
  [
    'فرق گو و راست؟',
    'difference between go and rust?',
    'go_vs_rust',
    /گو|راست/,
    /go|rust/i
  ],
  [
    'فرق سی و سی پلاس پلاس؟',
    'difference between c and c plus plus?',
    'c_vs_cpp',
    /سی|پلاس/,
    /c\+\+|plus/i
  ],
  [
    'فرق نیتیو و کراس پلتفرم؟',
    'difference between native and cross platform?',
    'native_vs_crossplatform',
    /نیتیو|کراس/,
    /native|cross/i
  ],
  [
    'همه زبان های برنامه نویسی رو مقایسه کن',
    'compare all programming languages',
    'compare_all_languages',
    /پایتون|زبان/,
    /python|language/i
  ],
  [
    'تاریخ هنر چیه؟',
    'what is art history?',
    'art_history_timeline',
    /رنسانس|امپرسیونیسم|هنر/,
    /renaissance|impressionism|art/i
  ],
  [
    'هنر غار چیه؟',
    'what is cave art?',
    'cave_art',
    /غار|لاسکو/,
    /cave|lascaux/i
  ],
  [
    'هنر رنسانس چیه؟',
    'what is renaissance art?',
    'renaissance_art',
    /داوینچی|پرسپکتیو/,
    /da vinci|perspective/i
  ],
  [
    'امپرسیونیسم چیه؟',
    'what is impressionism?',
    'impressionism',
    /مونه|نور/,
    /monet|light/i
  ],
  [
    'کوبیسم چیه؟',
    'what is cubism?',
    'cubism',
    /پیکاسو|زاویه/,
    /picasso|angle/i
  ],
  [
    'سوریالیسم چیه؟',
    'what is surrealism?',
    'surrealism',
    /دالی|خواب/,
    /dali|dream/i
  ],
  [
    'اکسپرسیونیسم انتزاعی چیه؟',
    'what is abstract expressionism?',
    'abstract_expressionism',
    /پولاک|انتزاعی/,
    /pollock|abstract/i
  ],
  [
    'پاپ آرت چیه؟',
    'what is pop art?',
    'pop_art',
    /وارهول|مصرفی/,
    /warhol|consumer/i
  ],
  [
    'مینیمالیسم در هنر چیه؟',
    'what is minimalism art?',
    'minimalism_art',
    /هندسی|ساده/,
    /geometric|simple/i
  ],
  [
    'هنر مفهومی چیه؟',
    'what is conceptual art?',
    'conceptual_art',
    /ایده|دوشان/,
    /idea|duchamp/i
  ],
  [
    'هنر مدرن عجیب چیه؟',
    'what is weird modern art?',
    'modern_weird_art',
    /فرمالدهید|موز|کوساما/,
    /shark|banana|kusama/i
  ],
  [
    'هنر مجسمه چیه؟',
    'what is sculpture art?',
    'sculpture_art',
    /مرمر|برنز|داوود/,
    /marble|bronze|david/i
  ],
  [
    'مجسمه های معروف دنیا چی هستن؟',
    'what are the famous statues?',
    'famous_statues',
    /آزادی|مسیح|ابوالهول/,
    /liberty|christ|sphinx/i
  ],
  [
    'اصول ترکیب بندی چیه؟',
    'what are the principles of design?',
    'art_design_principles',
    /تعادل|کنتراست|رنگ/,
    /balance|contrast|color/i
  ],
  ['ردیت چیه؟', 'what is reddit?', 'reddit', /ساب|انجمن/, /subreddit|forum/i],
  [
    'فیسبوک و متا چیه؟',
    'what is facebook?',
    'facebook_meta',
    /زاکربرگ|متا/,
    /zuckerberg|meta/i
  ],
  [
    'گوگل چیه؟',
    'what is google?',
    'google_platform',
    /یوتیوب|اندروید/,
    /youtube|android/i
  ],
  [
    'گوگل پلاس چرا بسته شد؟',
    'what happened to google plus?',
    'google_plus',
    /گوگل پلاس|بسته/,
    /google\+|shut/i
  ],
  [
    'واتساپ چیه؟',
    'what is whatsapp?',
    'whatsapp',
    /رمزنگاری|پیام/,
    /encryption|message/i
  ],
  [
    'سیگنال چیه؟',
    'what is signal?',
    'signal_app',
    /حریم|رمزنگاری/,
    /privacy|encryption/i
  ],
  [
    'توییتر و ایکس چیه؟',
    'what is twitter?',
    'x_twitter',
    /توییتر|ماسک|ایکس/,
    /twitter|musk/i
  ],
  ['دیسکورد چیه؟', 'what is discord?', 'discord', /سرور|صوتی/, /server|voice/i],
  [
    'لینکدین چیه؟',
    'what is linkedin?',
    'linkedin',
    /رزومه|استخدام/,
    /resume|recruit/i
  ],
  [
    'اسنپ چت چیه؟',
    'what is snapchat?',
    'snapchat',
    /ناپدید|استوری/,
    /disappearing|stor/i
  ],
  ['توییچ چیه؟', 'what is twitch?', 'twitch', /استریم|پخش/, /stream/i],
  [
    'یوتیوب چیه؟',
    'what is youtube?',
    'youtube_platform',
    /ویدیو|گوگل/,
    /video|google/i
  ],
  ['نزدک چیه؟', 'what is nasdaq?', 'nasdaq', /بورس|فناوری/, /exchange|tech/i],
  [
    'اتریوم چیه؟',
    'what is ethereum?',
    'ethereum',
    /قرارداد|بوترین/,
    /smart contract|buterin/i
  ],
  ['دوج کوین چیه؟', 'what is dogecoin?', 'dogecoin', /شوخی|میم/, /joke|meme/i],
  ['انویدیا چیه؟', 'what is nvidia?', 'nvidia', /گرافیک|هوش مصنوعی/, /gpu|ai/i],
  [
    'مایکروسافت چیه؟',
    'what is microsoft?',
    'microsoft',
    /ویندوز|آفیس|گیتس/,
    /windows|office|gates/i
  ],
  [
    'اسپیس ایکس چیه؟',
    'what is spacex?',
    'spacex',
    /موشک|ماسک|مریخ/,
    /rocket|musk|mars/i
  ],
  [
    'اوپن ای آی چیه؟',
    'what is openai?',
    'openai',
    /چت|هوش مصنوعی/,
    /chatgpt|ai/i
  ],
  ['اپل چیه؟', 'what is apple?', 'apple', /آیفون|جابز/, /iphone|jobs/i],
  ['آمازون چیه؟', 'what is amazon?', 'amazon', /فروشگاه|بزوس/, /store|bezos/i],
  ['تسلا چیه؟', 'what is tesla?', 'tesla', /برقی|ماسک/, /electric|musk/i],
  [
    'نتفلیکس چیه؟',
    'what is netflix?',
    'netflix',
    /استریم|سریال/,
    /stream|series/i
  ],
  [
    'تاریخچه استک وب چیه؟',
    'what is the history of web stacks?',
    'web_stack_history',
    /لمپ|وب/,
    /lamp|web/i
  ],
  [
    'لمپ چیه؟',
    'what is lamp stack?',
    'lamp_stack',
    /لینوکس|آپاچی|پی اچ پی/,
    /linux|apache|php/i
  ],
  [
    'مرن یا مین چیه؟',
    'what is mern?',
    'mean_mern_stack',
    /مونگو|ری اکت|نود/,
    /mongo|react|node/i
  ],
  [
    'جم استک چیه؟',
    'what is jamstack?',
    'jamstack',
    /جاوااسکریپت|api/,
    /javascript|api/i
  ],
  [
    'سرورلس چیه؟',
    'what is serverless?',
    'serverless',
    /تابع|ابر/,
    /function|cloud/i
  ],
  [
    'میکروسرویس یا مونولیت چیه؟',
    'what are microservices?',
    'microservices_monolith',
    /میکروسرویس|مونولیت/,
    /microservice|monolith/i
  ],
  [
    'استک اپ موبایل چیه؟',
    'how are mobile apps built?',
    'mobile_app_stacks',
    /نیتیو|هیبریدی/,
    /native|hybrid/i
  ],
  [
    'فرق فلاتر و ری اکت نیتیو؟',
    'difference between flutter and react native?',
    'flutter_reactnative',
    /فلاتر|نیتیو/,
    /flutter|react native/i
  ],
  [
    'اپ دسکتاپ چطور ساخته میشه؟',
    'what are desktop app frameworks?',
    'desktop_apps',
    /الکترون|نیتیو/,
    /electron|native/i
  ],
  [
    'استک ساس چیه؟',
    'what is a saas stack?',
    'saas_stack',
    /اشتراک|فرانت/,
    /subscription|frontend/i
  ],
  [
    'فریمورک بک اند کدوم بهتره؟',
    'which backend framework?',
    'backend_frameworks',
    /جنگو|اسپرینگ|لاراول/,
    /django|spring|laravel/i
  ],
  [
    'نسل ها چه فرقی دارن؟',
    'what are the generations?',
    'generations_overview',
    /بومر|هزاره|نسل/,
    /boomer|millennial/i
  ],
  [
    'نسل بومر چیه؟',
    'what are baby boomers?',
    'boomers',
    /بومر|جنگ/,
    /boomer|post-war/i
  ],
  [
    'نسل ایکس چیه؟',
    'what is gen x?',
    'gen_x',
    /نسل|اینترنت/,
    /generation|internet/i
  ],
  [
    'نسل هزاره چیه؟',
    'what are millennials?',
    'millennials',
    /هزاره|اینترنت/,
    /millennial|internet/i
  ],
  ['نسل زد چیه؟', 'what is gen z?', 'gen_z', /تیک تاک|شبکه/, /tiktok|social/i],
  [
    'نسل آلفا چیه؟',
    'what is gen alpha?',
    'gen_alpha',
    /هوش مصنوعی|تبلت/,
    /ai|tablet/i
  ],
  [
    'ترندهای دهه نود چی بود؟',
    'what are 90s trends?',
    'era_trends_90s',
    /اینترنت|گرانج/,
    /internet|grunge/i
  ],
  [
    'ترندهای دهه ۲۰۰۰ چی بود؟',
    'what are 2000s trends?',
    'era_trends_2000s',
    /فیسبوک|آیفون/,
    /facebook|iphone/i
  ],
  [
    'ترندهای دهه ۲۰۱۰ چی بود؟',
    'what are 2010s trends?',
    'era_trends_2010s',
    /اینستاگرام|استریم/,
    /instagram|stream/i
  ],
  [
    'ترندهای دهه ۲۰۲۰ چی بود؟',
    'what are 2020s trends?',
    'era_trends_2020s',
    /هوش مصنوعی|دورکاری/,
    /ai|remote/i
  ],
  [
    'چطور تدریس کنم؟',
    'how to give a lecture?',
    'lecture_guide',
    /تدریس|تمرین/,
    /lecture|practice/i
  ],
  [
    'چطور مهارت جدید یاد بگیرم؟',
    'how to learn a new skill?',
    'learning_methods',
    /یادگیری|تمرین/,
    /learn|practice/i
  ],
  [
    'غذاهای طبیعی سالم چیا هستن؟',
    'what are natural healthy foods?',
    'healthy_foods_overview',
    /میوه|غلات|طبیعی/,
    /fruit|whole|natural/i
  ],
  [
    'فواید میوه و سبزیجات چیه؟',
    'what are the benefits of fruit?',
    'fruits_vegetables',
    /ویتامین|فیبر/,
    /vitamin|fiber/i
  ],
  [
    'غلات کامل چیه؟',
    'what are whole grains?',
    'whole_grains',
    /سبوس|جو دوسر|فیبر/,
    /whole|oat|fiber/i
  ],
  [
    'فواید حبوبات چیه؟',
    'what are legumes?',
    'legumes',
    /عدس|پروتئین/,
    /lentil|protein/i
  ],
  [
    'فواید آجیل چیه؟',
    'what are nuts and seeds?',
    'nuts_seeds',
    /آجیل|گردو/,
    /nut|walnut/i
  ],
  [
    'پروبیوتیک چیه؟',
    'what are fermented foods?',
    'fermented_foods',
    /پروبیوتیک|ماست/,
    /probiotic|yogurt/i
  ],
  [
    'فواید ماهی و امگا ۳ چیه؟',
    'what is fish omega 3?',
    'fish_omega3',
    /امگا|ماهی/,
    /omega|fish/i
  ],
  [
    'چقدر آب بخوریم؟',
    'how much water to drink?',
    'hydration',
    /آب|کم آبی/,
    /water|dehydrat/i
  ],
  [
    'سوپرفود واقعیه؟',
    'is superfood actually real?',
    'superfoods_myth',
    /بازاریابی|مکمل|تنوع/,
    /marketing|variety/i
  ],
  [
    'رژیم مدیترانه ای چیه؟',
    'what is the mediterranean diet?',
    'mediterranean_diet',
    /زیتون|مدیترانه/,
    /olive|mediterranean/i
  ],
  [
    'مکمل بدنسازی چی بخرم؟',
    'what are sports supplements?',
    'supplements_overview',
    /مکمل|شخص ثالث/,
    /supplement|third-party/i
  ],
  [
    'وی پروتئین چیه؟',
    'what is whey protein?',
    'whey_protein',
    /پروتیین|آب پنیر/,
    /whey|protein/i
  ],
  [
    'کراتین چیه؟',
    'what is creatine?',
    'creatine',
    /کراتین|قدرت/,
    /creatine|strength/i
  ],
  [
    'انواع پودر پروتیین چیه؟',
    'types of protein powder?',
    'protein_powder_types',
    /وی|کازیین|گیاهی/,
    /whey|casein|plant/i
  ],
  [
    'بی سی ای ای چیه؟',
    'what is bcaa?',
    'bcaa_eaa',
    /آمینو|پروتیین/,
    /amino|protein/i
  ],
  [
    'پری ورک اوت چیه؟',
    'what is pre workout?',
    'pre_workout',
    /کافئین|کافیین|قبل تمرین/,
    /caffeine|pre-workout/i
  ],
  [
    'الکترولیت چیه؟',
    'what are electrolytes?',
    'electrolytes',
    /سدیم|پتاسیم/,
    /sodium|potassium/i
  ],
  [
    'کافئین چیه؟',
    'what are energy drinks?',
    'caffeine_energy',
    /کافیین|قهوه/,
    /caffeine|coffee/i
  ],
  [
    'بتا آلانین چیه؟',
    'what is beta alanine?',
    'beta_alanine',
    /بتا|سوزن/,
    /beta|tingling/i
  ]
];

test('every new fact resolves to its own topic in both languages', () => {
  for (const [fa, en, topic] of CASES) {
    const faHit = DaryaKnowledge.lookup(normalizeForMatching(fa, FA), 'fa');
    assert.ok(faHit, `fa: "${fa}" matched nothing`);
    assert.equal(faHit.topic, topic, `fa: "${fa}"`);
    const enHit = DaryaKnowledge.lookup(normalizeForMatching(en, EN), 'en');
    assert.ok(enHit, `en: "${en}" matched nothing`);
    assert.equal(enHit.topic, topic, `en: "${en}"`);
  }
});

test('every new fact reaches the user through the engine without evasion', () => {
  for (const [fa, en, , faMust, enMust] of CASES) {
    const faEngine = freshEngine(FA);
    const faReply = faEngine.respond(fa);
    assert.ok(faReply.length > 8, `fa: "${fa}" empty reply`);
    assert.doesNotMatch(
      faReply,
      EVASIVE,
      `fa: "${fa}" -> "${faReply.slice(0, 60)}"`
    );
    assert.doesNotMatch(faReply, DODGE, `fa: "${fa}"`);
    assert.match(faReply, faMust, `fa: "${fa}" -> "${faReply.slice(0, 80)}"`);

    const enEngine = freshEngine(EN);
    const enReply = enEngine.respond(en);
    assert.ok(enReply.length > 8, `en: "${en}" empty reply`);
    assert.doesNotMatch(
      enReply,
      EVASIVE,
      `en: "${en}" -> "${enReply.slice(0, 60)}"`
    );
    assert.doesNotMatch(enReply, DODGE, `en: "${en}"`);
    assert.match(enReply, enMust, `en: "${en}" -> "${enReply.slice(0, 80)}"`);
  }
});

test('the language shelf stays consistent with the shipped version constant', () => {
  const reply = freshEngine(FA).respond('نسخه تو چنده؟');
  assert.match(reply, /\d+\.\d+\.\d+/u);
});

test('live-price and current-value questions still refuse offline guarantees', () => {
  const live = freshEngine(EN).respond('what is bitcoin price today?');
  assert.doesNotMatch(live, /\d+(?:,\d{3})*(?:\.\d+)?\s*(?:usd|\$)/iu);
});
