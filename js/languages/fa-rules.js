/**
 * Darya - fa rule definitions.
 * Registers the compiled rule array on the global for the pack assembler
 * (fa.js). Pools come from DaryaFaResponses.
 */
(function (global) {
  'use strict';

  var R = global.DaryaFaResponses;

  function rule(topic, priority, pattern, responses) {
    return { topic, priority, pattern, responses };
  }

  // A curated set of common Persian pronominal/verb suffixes that attach
  // directly to a keyword with no space, e.g. "غمگین" -> "غمگینم" ("I am
  // sad"). Recognizing exactly these (rather than allowing *any* trailing
  // character) keeps matching accurate for real inflected forms while
  // still rejecting unrelated compounds, e.g. it correctly stops "پدر"
  // ("father") from falsely matching inside "پدربزرگ" ("grandfather"),
  // since "بزرگ" isn't one of these suffixes.
  const SUFFIX =
    // «مو» and «تو» are the colloquial possessive suffixes («تمرکزمو» =
    // my focus, «تمرکزتو» = your focus). Without them, everyday phrasings
    // like «چطور تمرکزمو برگردونم» failed the pw() boundary and fell to
    // the unknown/app_feedback pools. They must come BEFORE the single
    // letters «م»/«ی»/«ه» in the alternation: regex alternation picks the
    // first match, so «تمرکزمو» would otherwise match «م» and then fail
    // the (?!\p{L}) boundary on the trailing «و».
    '(?:های|ها|یم|ام|ای|ند|ید|مو|تو|م|ی|ه)?';

  /**
   * Builds a Persian-script-aware "whole word" pattern. `\b` doesn't work
   * for Persian text in JavaScript regex (it's defined in terms of ASCII
   * word characters), so this uses explicit lookaround instead: the
   * keyword (plus an optional common suffix) must not be directly
   * preceded or followed by another letter.
   *
   * The boundary check uses `p{L}` (Unicode "is this a letter at all")
   * rather than a raw `[\u0600-\u06FF]` code-point range. That range
   * looks like it should mean "a Persian/Arabic letter", but the same
   * Unicode block also contains Arabic-script *punctuation*, notably
   * "؟" (U+061F, the Persian question mark), so a raw range check
   * would treat "حالت چطور؟" as if "چطور" were followed by another
   * letter and incorrectly refuse to match. By the time this pattern
   * runs, the message has already passed the engine's overall
   * Persian-script check, so "any letter" is an accurate enough proxy
   * for "a Persian letter" here.
   * @param {string} alternatives - A `|`-joined list of keyword forms.
   * @param {string} [tail] - Extra pattern appended after the boundary
   *   check, e.g. `\s*(.*)` for rules that capture the rest of the
   *   sentence.
   * @returns {RegExp}
   */
  function pw(alternatives, tail) {
    return new RegExp(
      `(?<!\\p{L})(${alternatives})${SUFFIX}(?!\\p{L})${tail || ''}`,
      'iu'
    );
  }

  const rules = [
    rule(
      'safety',
      100,
      // Crisis phrasing in every register: formal ideation, colloquial
      // wish-to-die («کاش می‌مردم», «بهتره که دیگه نباشم»), plan/means
      // statements («خودمو حلق آویز کنم», «قرص جمع کردم», «همه
      // قرص‌هامو خوردم»), and finishing-it phrasings («می‌خوام تمومش
      // کنم» when about life). Progressive prefixes are normalized
      // before matching (میخوام/می‌خوام/می خوام all reach «میخوام»),
      // so single normalized spellings suffice for those.
      pw(
        'خودکشی|خودزنی|آسیب زدن به خودم|به خودم (?:صدمه|آسیب) (?:بزنم|بزنمش|میزنم|میزنمش|بزنمش)|(?:می‌خوام|میخوام|می خوام|دلم می‌خواد|دلم میخواد|دلم می خواد).{0,10}(?:خودمو بکشم|خودمو بکشمش|به خودم (?:صدمه|آسیب) بزنم|زندگیم رو تموم کنم|زندگیمو تموم کنم|پایان بدم)|دیگه نمیخوام (?:زندگی کنم|زنده باشم|زنده بمونم)|دیگه نمی‌خوام (?:زندگی کنم|زنده باشم|زنده بمونم)|دیگه نمی خوام (?:زندگی کنم|زنده باشم|زنده بمونم)|دلیلی برای زندگی ندارم|دلیلی برای زنده موندن ندارم|دلیلی برای زنده‌ماندن ندارم|دلم میخواد بمیرم|دلم می‌خواد بمیرم|نمیخوام دیگه باشم|نمی‌خوام دیگه باشم|میخوام به زندگیم پایان بدم|می‌خوام به زندگیم پایان بدم|به زندگیم پایان بدم|به زندگیم خاتمه بدم|دیگه طاقت ندارم زندگی کنم|میخوام بمیرم|می‌خوام بمیرم|خودمو (?:حلق آویز|حلق‌آویز|دار) (?:کنم|بزنم)|حلق آویز کنم|خودمو خلاص کنم|خودمو بکشم|خودمو از بین ببرم|خودمو نابود کنم|کاش (?:می‌مردم|میمردم|بمیرم|مرده بودم)|کاش دیگه نبودم|بهتره (?:که )?دیگه نباشم|بهتره بمیرم|(?:همه|تمام) قرص(?:‌| )?هامو خوردم|قرص جمع (?:کردم|میکنم|می‌کنم)|قرص خوردم که بمیرم|رگمو (?:بزنم|زدم)|رگ دستمو (?:بزنم|زدم)|از (?:پشت بوم|پل|ساختمون) (?:بپرم|پرت شم)|میخوام بپرم پایین|بخوابم و دیگه بیدار نشم|دیگه بیدار نشم|بدون من (?:همه )?راحت(?:تر| تر)?ن|بدون من بهتره|زندگیم ارزش(?:ی)? نداره|مردنم بهتره'
      ),
      R['ruleSafety']
    ),

    // Method-seeking questions (lethal dose, means, how-to): a firm,
    // warm refusal plus the crisis line. Never information, never an
    // invitation to keep contemplating the method.
    rule(
      'safety_method',
      102,
      pw(
        'چند تا قرص (?:برای|واسه) (?:مردن|مرگ|اوردوز)|چند قرص بخورم (?:که|تا) بمیرم|دوز کشنده|چطور(?:ی)? (?:خودکشی کنم|خودمو بکشم|بمیرم)|راه (?:بی‌درد|بی درد|راحت|سریع) (?:مردن|برای مردن|مرگ)|بهترین راه (?:مردن|خودکشی)|از چه ارتفاعی (?:بمیرم|میمیرم|می‌میرم)'
      ),
      R['ruleSafetyMethod']
    ),

    // Someone else at risk («دوستم میخواد خودکشی کنه»): caregiver
    // guidance plus the hotline. The FA safety rule already catches
    // «خودکشی» broadly, so this refinement gives the third-party turn
    // its specific, more useful reply.
    rule(
      'third_party_risk',
      101,
      pw(
        '(?:دوستم|خواهرم|برادرم|داداشم|آبجیم|مامانم|بابام|پسرم|دخترم|همکارم|هم اتاقیم|همسرم|شوهرم|زنم|نامزدم|پارتنرم|رفیقم).{0,30}(?:میخواد خودکشی کنه|می‌خواد خودکشی کنه|حرف از خودکشی|فکر خودکشی|خودزنی میکنه|خودزنی می‌کنه|به خودش آسیب میزنه|به خودش آسیب می‌زنه|میخواد بمیره|می‌خواد بمیره|تهدید به خودکشی)'
      ),
      R['ruleThirdPartyRisk']
    ),

    // Abuse and assault disclosures: believe first, check safety,
    // point to specialist support (123 is Iran's social emergency line
    // and covers domestic violence). Never a curiosity reply.
    rule(
      'abuse_disclosure',
      97,
      pw(
        '(?:شوهرم|زنم|همسرم|بابام|پدرم|مامانم|مادرم|داداشم|برادرم|ناپدریم|نامادریم|عموم|داییم|نامزدم|پارتنرم|دوست پسرم|دوست دخترم).{0,25}(?:منو میزنه|منو می‌زنه|کتکم میزنه|کتکم می‌زنه|منو کتک|تهدیدم میکنه|تهدیدم می‌کنه|آزارم میده|آزارم می‌ده|اذیتم میکنه که میترسم|خفه‌ام کرد|خفم کرد)|بهم تجاوز (?:شد|کرد|کرده|شده)|مورد تجاوز قرار گرفتم|بهم دست درازی (?:کرد|شد|کرده)|آزار جنسی (?:شدم|دیدم|میبینم|می‌بینم)|خشونت خانگی|ازش کتک (?:خوردم|میخورم|می‌خورم)|کتکم (?:زد|زده)'
      ),
      R['ruleAbuseDisclosure']
    ),

    // Self-neglect and eating-distress disclosures.
    rule(
      'eating_distress',
      96,
      pw(
        '(?:چند|دو|سه|چهار|پنج) روزه (?:هیچی|چیزی|غذا) (?:نخوردم|نمیخورم|نمی‌خورم)|از گلوم پایین نمیره|غذا از گلوم پایین نمی‌ره|خودمو گرسنگی میدم|خودمو گرسنگی می‌دم|عمدا غذا نمیخورم|عمداً غذا نمی‌خورم|بعد غذا (?:عمدا |عمداً )?بالا میارم|خودمو وادار به استفراغ|از غذا میترسم|از غذا می‌ترسم|انقدر از بدنم بدم میاد که غذا'
      ),
      R['ruleEatingDistress']
    ),

    // Psychosis-adjacent disclosures (voices, command hallucinations).
    rule(
      'psychosis_risk',
      96,
      pw(
        'صدا(?:هایی)? (?:میشنوم|می‌شنوم) که (?:میگن|می‌گن|بهم میگن|بهم می‌گن)|صداها بهم (?:میگن|می‌گن|دستور میدن|دستور می‌دن)|صداهای توی سرم|چیزهایی میبینم که (?:واقعی نیستن|کسی نمیبینه|کس دیگه نمیبینه)|چیزهایی می‌بینم که (?:واقعی نیستن|کسی نمی‌بینه)|یکی داره ذهنمو کنترل میکنه|یکی داره ذهنمو کنترل می‌کنه|افکارم مال خودم نیست|همه دارن تعقیبم (?:میکنن|می‌کنن)'
      ),
      R['rulePsychosisRisk']
    ),

    rule(
      'iran_legal_safety',
      92,
      // eslint-disable-next-line max-len
      /^(?=.*ایران)(?=.*(?:دین|مذهب|مذهبی|باور|اعتقاد|تغییر دین|بی ?دین|خداناباور|بهایی|معنوی|پست))(?=.*(?:زندان|بازداشت|جرم|قانونی|امن|دردسر)).+$/u,
      R['ruleIranLegalSafety']
    ),

    rule(
      'knowledge',
      72,
      // پرسش درباره‌ی مخزن، دانلود، نسخه، معماری، حافظه، حریم خصوصی،
      // بسته‌بندی آفلاین و تست دریا دانشی است. اولویت بالاتر از قاعده‌ی
      // سازنده باعث می‌شود «پشت صحنه» پاسخ کدبیس بگیرد، نه فقط داستان
      // پیدایش. شکل‌های محاوره‌ای «مخزن کدت کجاست»، «از کجا دانلودت
      // کنم»، «نسخه تو چنده» و «کدت رو کجا ببینم» همگی این‌جا می‌آیند.
      // eslint-disable-next-line max-len
      /(?:لینک مخزن خودت|مخزن (?:کد|کدت|دریا)|مخزنت|کدت رو (?:کجا|ببینم)|کدت را (?:کجا|ببینم)|کد دریا|ریپازیتوری|ریپو|سورس کد دریا|سورس کدت کجاست|سورس کدت رو کجا|گیت هاب پروژه|تو رو کجا (?:میتونم|می‌توانم) دانلود|تو را کجا (?:میتوانم|می‌توانم) دانلود|از کجا (?:میتونم|می‌توانم|باید) دانلودت کنم|از کجا دانلودت کنم|دانلودت کنم|از کجا دانلود|فایل نصبی|نصبت|اپ اندرویدت|اپت رو کجا|از کجا نصب|دانلود دریا|سایت دریا|مایکت دریا|نسخه تو|نسخه‌ات|نسخه دریا|نسخه فعلی|چه نسخه ای|کدبیس دریا|معماری (?:کد )?دریا|پشت صحنه دریا|مراحل ساخت پاسخ دریا|دریا پیام را چطور میفهمد|دریا چطور آفلاین کار میکند|بسته بندی pwa و اندروید دریا|apk دریا اینترنت|دریا چت من را کجا ذخیره|دریا گفتگو را (?:میفرستد|ذخیره میکند)|حریم خصوصی دریا|حافظه داری|حافظه‌ات|یادت می‌ماند|یادت می‌مونه|یادت میمونه|چیزی یادت می‌ماند|چیزی یادت می‌مونه|دریا چطور تست میشود|مشارکت در توسعه دریا)/u,
      R['ruleKnowledge']
    ),

    rule(
      'knowledge',
      94,
      // درخواست‌های مشخص دفاع سایبری و کار عملی باید از قاعده‌های عمومی
      // نیاز، کار، مرز تخصصی و حمایت حساب هک‌شده جلوتر باشند. عبارت‌ها
      // عمداً دفاعی‌اند و زبان آزمون بدون مجوز را شامل نمی‌شوند.
      // eslint-disable-next-line max-len
      /(?:پروفایل عملکرد نرم افزار|چک لیست دسترس پذیری وب|برای تست نفوذ چه مجوزی لازم است|یک آسیب پذیری پیدا کردم چه کنم|مراحل پاسخ به حادثه سایبری|اکانتم هک شده چه کنم|چطور فیشینگ را تشخیص بدهم|ایمنی شیفت شب نگهبانی|چطور آگهی استخدام جعلی را بفهمم|ایده کسب و کار را بدون سرمایه زیاد تست کنم|موسسه ویزا را تضمین کرده|مقایسه سربازی ایران و کره جنوبی|مرور جنگ های اعراب و اسراییل|فرق جنگ سویز شش روزه و اکتبر|چه راهبرد پشتیبان(?: |‌)گیری در برابر باج افزار خوب است|چطور هک سایت را قانونی در آزمایشگاه تمرین کنم|SQL injection چیه و چطور جلوش رو بگیرم|WPA2 یا WPA3 برای وای فای (?:خونه|خانه) بهتره)/iu,
      R['ruleKnowledge']
    ),

    rule(
      'knowledge',
      72,
      // درخواست‌های عملی روشن باید چارچوب تخصصی خود را بگیرند، حتی اگر
      // قاعده‌ی عمومی کار، پول، مهاجرت یا یادگیری هم واژه‌ای را ببیند.
      // eslint-disable-next-line max-len
      /(?:بیکارم اول چه کار کنم|برنامه عملی برای بیکاری|بدون سابقه چطور کار پیدا کنم|چه کاری را با پول کم زود شروع کنم|شغل کم هزینه برای شروع سریع|درس بخوانم یا کار پیدا کنم|تحصیل یا کار کدام بهتر است|دانشگاه یا آموزش فنی|بدون پول چطور مهاجرت کنم|برنامه مهاجرت با بودجه خیلی کم|مهاجرت کنم یا بمانم|مهاجرت به شهر دیگر یا خارج|برای زندگی بهتر به شهر دیگری بروم|سربازی فرصت.{0,20}شغل|در سربازی چطور مهارتم را از دست ندهم|برنامه شغلی قبل و بعد سربازی|چطور معماری نرم افزار طراحی کنم|معماری نرم افزار برای مبتدی|کدام دیتابیس را انتخاب کنم|شبکه برای برنامه نویس|چطور برنامه را سریع تر کنم|چطور pwa آفلاین بسازم|چطور وارد شغل امنیت سایبری شوم|چطور هک اخلاقی را قانونی یاد بگیرم|چطور امنیت وب اپ خودم را تست کنم|علت جنگ(?: های?)? .{0,35}(?:بود|چه بود)|چرا .{0,35}(?:جنگیدند|حمله کردند|جنگ داشته)|جنگ .{0,35}بی طرفانه|مرور جنگ های .{0,30}|فرق جنگ .{0,35}|مقایسه جنگ های .{0,30})/u,
      R['ruleKnowledge']
    ),

    rule(
      'knowledge',
      71,
      // eslint-disable-next-line max-len
      /(?:اسلام را بی طرفانه|مسلمانان به چه باور|مسیحیان به چه باور|یهودیت را بی طرفانه|فرق شیعه و سنی|دین زرتشتی|دین سیک|آیین بهایی|مقایسه بی طرفانه (?:هندوئیسم|هندوییسم) و بودیسم|فرق (?:هندوئیسم|هندوییسم) و بودیسم|مقایسه اسلام مسیحیت و یهودیت|ادیان ابراهیمی|فرق خداناباوری و ندانم گرایی|فرق دین و معنویت|متون دینی را مقایسه|مقایسه محترمانه قرآن|مقایسه کتاب و فیلم تل ماسه|رمان dune|مقایسه کتاب و فیلم ارباب حلقه|مانگا بهتره یا انیمه|مقایسه مانگا و انیمه|پادکست بهتره یا کتاب صوتی|فرق پادکست و کتاب صوتی|فرق مستند و درام تاریخی|مستند بهتره یا فیلم بر اساس واقعیت|کتاب و فیلمش را مقایسه)/u,
      R['ruleKnowledge']
    ),

    rule(
      'crime_for_profit',
      88,
      // eslint-disable-next-line max-len
      /(?:(?:چطور|چگونه|چه جوری).{0,15}(?:کلاهبرداری|فیشینگ|دزدی|سرقت|اخاذی|زورگیری).{0,20}(?:کنم|پول دربیارم|گیر نیفتم)|یاد بده.{0,15}(?:کلاهبرداری|فیشینگ|دزدی|سرقت|اخاذی)|کلاهبردار بشم|قاچاقچی بشم|از کلاهبرداری پول دربیارم|با فیشینگ پول دربیارم|با فروش مواد پول دربیارم|کاردینگ.{0,12}(?:اموزش|آموزش|روش|پول)|متن فیشینگ بنویس|پول ?شویی.{0,12}(?:روش|مراحل|چطور)|روش پول ?شویی|پول دزدی رو مخفی|وارد خونه.{0,15}(?:دزدی|بی صدا|گیر نیفتم)|ماشین بدزدم.{0,15}(?:ردیاب|گیر نیفتم)|مواد بفروشم.{0,15}(?:پلیس|گیر نیفتم)|باج ?افزار بسازم|مدرک جعلی بسازم|پاسپورت جعلی|کارت ملی جعلی|از کسی باج بگیرم|ساختمون رو آتیش بزنم|آتش ?سوزی عمدی|پول ?بر بشم|پول دزدی جابه ?جا کنم|از مغازه دزدی کنم|بانک بزنم|جسد رو مخفی کنم|از دست پلیس فرار کنم|مدرک جرم.{0,12}از بین ببرم|وای ?فای (?:همسایه|یکی دیگه|مدرسه).{0,15}(?:هک|رمز|بشکن)|(?:اینستاگرام|ایمیل|اکانت|حساب).{0,12}(?:یکی دیگه|دوستم|دوست دخترم|دوست پسرم|پارتنرم).{0,12}(?:هک|بدزدم|بگیرم)|(?:هک|دزدیدن).{0,12}(?:اکانت|حساب|اینستاگرام|ایمیل).{0,12}(?:بقیه|یکی دیگه)|لاگین (?:مدرسه|شرکت|بانک).{0,12}(?:دور بزنم|بای پس)|(?:کی لاگر|کی‌لاگر|بدافزار|بک دور|بک‌دور|روت کیت).{0,12}(?:بساز|بنویس|آموزش)|دیداس.{0,12}(?:سایت|سرور|شرکت)|سایت.{0,12}(?:دیداس|از کار بندازم)|بدافزار.{0,15}(?:آنتی ویروس|شناسایی).{0,8}(?:مخفی|دور)|(?:آنتی ویروس|شناسایی).{0,12}(?:دور بزنم|بای پس)|چطور.{0,10}(?:سایت|اکانت|وای ?فای|شبکه|سرور).{0,8}هک کنم)/u,
      R['ruleCrimeForProfit']
    ),

    rule(
      'knowledge',
      71,
      // eslint-disable-next-line max-len
      /(?:ابزار (?:رایگان و پولی )?(?:هوش مصنوعی|ساخت تصویر|ساخت ویدیو|کدنویسی|پادکست)|ساخت (?:عکس|تصویر|ویدیو|پادکست).{0,15}(?:هوش مصنوعی|رایگان)|برای (?:سند|داکس) و اسلاید.{0,15}ابزار|نوجوان.{0,15}(?:امن|هوش مصنوعی)|سالمند.{0,20}(?:هوش مصنوعی|فناوری|تکنولوژی))/u,
      R['ruleKnowledge']
    ),

    rule(
      'media_comparison',
      64,
      // eslint-disable-next-line max-len
      /(?:(?:مقایسه|فرق|کدام بهتر|کدوم بهتر).{0,45}(?:کتاب|رمان|فیلم|سریال|انیمه|مانگا|پادکست|کتاب صوتی|آلبوم|مستند|اقتباس)|(?:کتاب|رمان|فیلم|سریال|انیمه|مانگا|پادکست|کتاب صوتی|آلبوم|مستند|اقتباس).{0,35}(?:یا|در برابر|بهتر|مقایسه).{0,35}(?:کتاب|رمان|فیلم|سریال|انیمه|مانگا|پادکست|کتاب صوتی|آلبوم|مستند|اقتباس)|دو فیلم.{0,45}مقایسه)/u,
      R['ruleMediaComparison']
    ),

    rule(
      'grief',
      55,
      pw(
        'فوت کرد|درگذشت|فقدان|از دست دادم|از دستش دادم|سوگ|داغداری|عزاداری|سوگواری|از دنیا رفت|دنیا رفت|دیگه نیست|دیگر نیست|خدا بیامرزتش|خدا بیامرزش|بیامرزتش|' +
          // Kinship + death: «پسرم تو تصادف مرد» (my son died in an
          // accident), «مادرم از دنیا رفت». The EN grief rule matches
          // «my .* died»; Persian needs its own kinship pattern because
          // the death verb lands mid-sentence, not after a possessive
          // pronoun. The bare «مرد» is ambiguous with the noun "man"
          // («پسرم مرد بزرگی شده»), so the lookahead rejects the common
          // noun readings (great/good/strong/rich... man) while still
          // matching the death reading.
          '(?:پسرم|دخترم|پدرم|مادرم|برادرم|خواهرم|همسرم|عزیزم|عزیز دلم|فرزندم|بچهم|بچهام|بابام|مامانم|نامزدم|رفیقم|شوهرم|زنم|دوست صمیمیم|دوست‌دخترم|دوست دخترم|دوست‌پسرم|دوست پسرم)' +
          '(?:.{0,35}?(?:فوت کرد|فوت کرده|از دنیا رفت|از دست دادم|از دستم رفت|تلف شد|مرده|مردی|مردیم|خدا بیامرزتش|بیامرزتش)|.{0,35}?مرد(?!\\s*(?:بزرگ|خوب|موفقی|مهربان|قوی|عاقل|معروف|ثروتمند|شجاع|دانا|مردی|مردان)))'
      ),
      R['ruleGrief']
    ),

    rule(
      'smalltalk_howareyou',
      60,
      // The whole utterance must be a how-are-you question. Anchoring
      // prevents the bare word "خوبی" (goodness) from matching mid-sentence
      // in phrases like "جمله خوبی گفتی" (you said a good sentence) and
      // hijacking the turn with a how-are-you reply. The optional "است"
      // tail keeps the formal "حال شما چطور است؟" working. The
      // "سلامتی"/"سلامت هستی" forms are everyday Iranian greetings (the
      // same register as "چطوری"), so a whole-utterance "سلامتی؟" must
      // read as a check-in, never as a health-anxiety disclosure (the
      // health rule only fires when it is a topic inside a longer message).
      // The optional affectionate tail (جان/جون/عزیز/عزیزم/دلبر) accepts
      // «خوبی جان؟» and «حالت خوبه عزیزم؟» - everyday warm check-ins that
      // otherwise fell to the ambiguous pool. The suffix alternation also
      // allows a trailing «ی» so «خوبی‌؟» keeps working. A time-word
      // prefix («امروز چطوری», «این روزا حالت چطوره») and the formal
      // «چطورید» form are everyday variants that must stay in the same
      // family instead of falling to the unknown pool. «چه خبر» and its
      // colloquial tails («چه خبری», «چه خبره», «چه خبرها») are the
      // Persian "what is new" check-in, so they belong here too instead
      // of the ambiguous-input echo. The plural «چه خبرها» normalizes to
      // «چه خبر ها» (the half-space normalizer separates the «ها» plural
      // suffix), so the pattern carries that spaced form.
      // eslint-disable-next-line max-len
      /^(?:سلام|درود|هی|خب|اوکی|باشه|امروز|امروزت|امشب|این روزا|این روزها|این هفته)?\s*(?:خوبی|تو خوبی|خوبی تو|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|چهطوری|چه طوری|چجوری|چطورید|حالت خوبه|سلامتی|سلامت هستی|سلامتی می‌کنی|چه خبر|چه خبری|چه خبره|چه خبر ها|چخبر|چ خبر)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*(?:جان|جون|عزیز|عزیزم|دلبر|دلبرم))?(?:\s*است)?(?:[!.؟]*\s+(?:خوبی|تو خوبی|خوبی تو|حالت چطور|حالتون چطور|حال شما چطور|احوال شما چطور|چطوری|چهطوری|چه طوری|چجوری|چطورید|حالت خوبه|سلامتی|سلامت هستی|سلامتی می‌کنی|چه خبر|چه خبری|چه خبره|چه خبر ها|چخبر|چ خبر)(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?:\s*(?:جان|جون|عزیز|عزیزم|دلبر|دلبرم))?(?:\s*است)?)?[!.؟]*$/iu,
      R['ruleSmalltalkHowareyou']
    ),

    // Casual "where are you right now?" («کجایی؟», «کجایی الان؟») gets a
    // light presence answer. «اهل کجایی» and «کجا زندگی می‌کنی» are
    // owned by darya_self (66) and smalltalk_silly (55), so those keep
    // their own replies.
    rule(
      'where_are_you',
      62,
      pw(
        'کجایی|کجایی الان|کجایی الآن|کجا هستی|کجایید|کجا بودی|کجا بودید|کجا کار میکنی|کجا کار می‌کنی|کجا کار می کنی|کجا درس میخونی|کجا درس می‌خونی|کجا درس می خوانی|کجا درس می‌خوانی|کجا مشغولی|کجا مشغول هستی'
      ),
      R['ruleWhereAreYou']
    ),

    // The everyday everything-is-fine check-in («مشکلی نیست؟», «اوکیه؟»,
    // «همه چی روبه‌راهه»): a warm reassurance, never a stiff
    // elaboration prompt.
    rule(
      'all_well',
      56,
      pw(
        'مشکلی نیست|مشکلی ندارم|اوکیه|اوکی|همه چی اوکیه|همه چیز اوکیه|همه چی روبه راهه|همه چیز روبه راهه|همه چی روبه‌راهه|همه چیز روبه‌راهه|همه چی خوبه|همه چیز خوبه'
      ),
      R['ruleAllWell']
    ),

    // «چته؟», «چی شده؟», «چه خبر شده؟»: an everyday what-happened
    // opener. Warmer than the ambiguous-input prompt, and the pool
    // invites the story instead of interrogating.
    rule(
      'whats_up',
      52,
      pw(
        'چته|چی شده|چی شد|چه شده|چه خبر شده|چه اتفاقی افتاده|چی پیش اومده|چی پیش آمده'
      ),
      R['ruleWhatsUp']
    ),

    // A direct request for Darya's name always gets a reply that names
    // her. Sits above the general identity rule (62 > 60).
    rule(
      'ask_name',
      62,
      pw(
        'اسمت چیه|اسم شما چیه|اسمت چی هست|نامت چیست|نام شما چیست|چی صدات کنم|چه صدایت کنم|اسمت رو بگو'
      ),
      R['ruleAskName']
    ),

    rule(
      'smalltalk_identity',
      60,
      pw(
        'تو کی هستی|تو چی هستی|تو ربات هستی|تو هوش مصنوعی (?:واقعی )?هستی|هوش مصنوعی (?:واقعی )?هستی|ربات (?:واقعی )?هستی|تو واقعی هستی|انسان هستی'
      ),
      R['ruleSmalltalkIdentity']
    ),

    rule(
      'smalltalk_capability',
      60,
      pw(
        'چیکار می‌تونی بکنی|چیکار میتونی بکنی|چیکار می تونی بکنی|چیکار می‌تونی انجام بدی|چیکار میتونی انجام بدی|چیکار می تونی انجام بدی|چه کمکی می‌تونی بکنی|چه کمکی میتونی بکنی|چه کمکی می تونی بکنی|چه کاری بلدی|چه کارهایی بلدی|چه کارهایی بلد هستی|چه چیزهایی بلدی|چی بلدی|چه کاری ازت برمیاد|چه کاری ازت بر میاد|چه کاری از تو برمیاد|چه کاری از تو بر میاد|چه کارهایی ازت برمیاد|چه کارهایی ازت بر میاد|چه کارهایی از تو برمیاد|چه کارهایی از تو بر میاد|چی ازت برمیاد|چی ازت بر میاد|چطور میتونی کمکم کنی|چیکاره هستی|تو چیکاره هستی|چیکاره ای|چیکاره‌ای|چه کارهایی میتونی و نمیتونی انجام بدی|چه کارهایی می‌تونی و نمی‌تونی انجام بدی|دقیقا چه کارهایی میتونی|دقیقاً چه کارهایی میتونی|توانایی ها و محدودیت هات|توانایی‌ها و محدودیت‌هات|چه قابلیت‌هایی داری|چه قابلیت هایی داری|چه قابلیت‌هایی دارید|چه قابلیت هایی دارید|قابلیت‌هات چیه|قابلیتهات چیه|قابلیت هات چیه|قابلیت‌هایت چیست|قابلیت هایت چیست|قابلیت‌هایت چیه|قابلیت هایت چیه|قابلیت‌هاتو بگو|قابلیت‌هات رو بگو|قابلیت هاتو بگو|قابلیت هات رو بگو|چه توانایی‌هایی داری|توانایی‌هات چیه|توانایی هات چیه|چه کارهایی می‌تونی انجام بدی|چه کارهایی میتونی انجام بدی|چه کارهایی می تونی انجام بدی|چه کارهایی می‌تونی انجام بدی|چه چیزهایی میدونی|چه چیزهایی می‌دونی|چه چیزهایی می‌دانی|چه چیزهایی بلدی|چه چیزهایی بلد هستی|چه کارهایی بلدی انجام بدی|چه چیزهایی میتونی|چه چیزهایی می‌تونی|چه کارهایی ازت میاد|چه کارهایی میتونی بکنی|چه کارهایی می‌تونی بکنی|چه کارهایی می تونی بکنی'
      ),
      R['ruleSmalltalkCapability']
    ),

    // «فلانی کیه؟» ("who is so-and-so?") is everyday Persian for naming
    // a person without a name. A playful clarification is the natural
    // companion reply, never the ambiguous-input prompt.
    rule(
      'so_and_so',
      57,
      pw(
        'فلانی کیه|فلانی کیست|فلانی کی هست|فلانی چیه|فلانی چیزیه|فلانی کی بود|بهمانی کیه|بهمانی کیست|فلان کیه|فلان کیست'
      ),
      R['ruleSoAndSo']
    ),

    // The user is annoyed by Darya's question or follow-up ("به تو ربطی
    // نداره", "نظرت رو نگو"). The reply respectfully accepts the
    // boundary and hands the direction of the conversation back to the
    // user, instead of reflective lines that read like dodging the
    // annoyance.
    rule(
      'privacy_boundary',
      70,
      pw(
        'به تو ربطی نداره|بهت ربطی نداره|به تو مربوط نیست|بهت مربوط نیست|نظرت رو نگو|نظرت رو نده|برو به کارت|برو دنبال کارت|فضای خصوصیه|فضای خصوصی منه|نمی‌خوام بگم|نمیخوام بگم|نمی خوام بگم|نمی‌خوام جواب بدم|نمیخوام جواب بدم|ولم کن'
      ),
      R['rulePrivacyBoundary']
    ),

    // Off-topic and non-serious questions ("Do you like pizza?", "How's the weather?")
    // Playful response, then a gentle return to the main topic.
    rule(
      'smalltalk_silly',
      55,
      pw(
        'دوست داری|نظرت در مورد|تا حالا|آیا تا به حال|می‌تونی بخوری|میتونی بخوری|می تونی بخوری|چند سالته|کجا زندگی می‌کنی|کجا زندگی میکنی|کجا زندگی می کنی|می‌خوابی|میخوابی|می خوابی|چیکار می‌کنی|چیکار میکنی|چیکار می کنی|چی کار می‌کنی|چی کار میکنی|چی کار می کنی'
      ),
      R['ruleSmalltalkSilly']
    ),

    // Greeting families mirror the user's greeting word back (درود ->
    // درود-based reply, سلام -> سلام-based reply). Each family also
    // accepts a short fixed tail (بر تو, بر شما, عزیز, دوست, جان, و درود)
    // so "درود بر تو" and "سلام علیکم" get a warm greeting instead of a
    // generic fallback. The tail is a fixed list, never free text, so
    // "درود چطوری؟" still falls through to the how-are-you rule.
    rule(
      'greeting',
      65,
      // The درود family mirrors the greeting word and accepts the common
      // affectionate tails Iranians attach («درود خانمی», «درود عزیزم»,
      // «درود زیبارو») so a warm opener is never misread as an unknown
      // topic (the «درود خانمی!» transcript failure). The tail list also
      // carries the modern endearments «جیگرم», «زیبارو», «خوشگله»,
      // «جانم» that friends and partners use in everyday chat.
      // eslint-disable-next-line max-len
      /^(?:درود)(?:\s+(?:بر تو|بر شما|عزیز|عزیزم|دوست|جان|جون|جونم|خانوم|خانم|خانمی|خانومی|خانمم|قربون|قربونت|نازنین|ماهی|دل|عسل|جانم|جیگرم|جیگر|زیبارو|زیبا رو|زیبای من|خوشگله|خوشگلم|فدات|دلبر|شیرین|قشنگ))?[!.؟]*$/iu,
      R['ruleGreetingDorud']
    ),

    rule(
      'greeting',
      65,
      // «سلا+م+» collapses stretched typing («سلاااامممم») so the greeting
      // still matches, and the affectionate tail covers «سلاااامممم عسلم»,
      // «سلام جیگرم», «سلام زیبارو», «سلام خوشگله» - flirtatious or warm
      // openers that must not fall to the unknown pool.
      // eslint-disable-next-line max-len
      /^(?:سلا+م+)(?:\s+(?:علیکم|بر تو|بر شما|عزیز|عزیزم|عزیز دلم|دوست|جان|جون|جونم|خانوم|خانم|خانومی|خانمی|خانمم|قربون|قربونت|نازنین|ماهی|عسل|عسلم|دل|و درود|جیگرم|جیگر|زیبارو|زیبا رو|زیبای من|خوشگله|خوشگلم|فدات|جانم|دلبر|شیرین|قشنگ))?[!.؟]*$/iu,
      R['ruleGreetingSalam']
    ),

    rule(
      'greeting',
      65,
      /^(?:هی|یا|آقا|سلام سلام)(?:\s+(?:عزیز|عزیزم|دوست|جان|جون|جونم|خانوم|خانم))?$/iu,
      R['ruleGreetingHey']
    ),

    rule(
      'greeting',
      65,
      // Affectionate address terms as standalone warm openers or with a
      // greeting word in either order: «جیگرم», «جیگرم سلام»,
      // «زیبارو درود», «خوشگله سلام», «جانم», «فدات», «دلبر». These
      // everyday endearments (modern Persian chat slang) are greetings,
      // not romance: the warm greeting pool answers them so they never
      // fall to the unknown pool (the «سلام جیگرم» probe failure). The
      // reversed order («خوشگله سلام») is not covered by the anchored
      // families above, which require the greeting word first. A
      // how-are-you tail («جیگرم چه خبر», «جانم چطوری», «زیبارو
      // خوبی؟») stays in the warm greeting family instead of reading
      // as a separate how-are-you inquiry.
      // eslint-disable-next-line max-len
      /^(?:جیگرم|جیگر|زیبارو|زیبا رو|زیبای من|خوشگله|خوشگلم|جانم|فدات|دلبر|شیرین|قشنگ|قشنگم|قربون|قربونت)(?:\s+(?:سلام|درود|هی|سلامی|درودی|چه خبر|چه خبری|چطوری|چطورید|خوبی|خوبید|حالت چطوره|حالت چطور))?[!.؟]*$/iu,
      R['ruleGreetingSalam']
    ),

    // Casual openers («به به، چه خبر؟», «ای ول، تو هم اینجایی؟»,
    // «خوش اومدی») are everyday greetings that the strict anchored
    // families above never matched, so in real sessions they fell to the
    // unknown pool and read as if Darya ignored a greeting.
    rule(
      'greeting',
      62,
      // eslint-disable-next-line max-len
      /^(?:به به|ای ول|خوش اومدی|خوش اومدید|خوش آمدی|خوش آمدید|اوهوی)(?:[!,.]?\s*چه خبر)?(?:[!.؟]*|،?\s*تو هم اینجایی[!.؟]*)$/iu,
      R['ruleGreetingHey']
    ),

    // «سلام، دلم برات تنگ شده بود» (hi, I missed you) is a warm return
    // greeting, not a loneliness disclosure: the longing is welcomed and
    // mirrored, never treated as fresh distress.
    rule(
      'greeting',
      62,
      /^(?:سلام|درود|هی)\s*،?\s*دلم\s*(?:برات|براتون|برای تو)\s*تنگ\s*شده(?: بود)?[!.؟]*$/iu,
      R['ruleGreetingMissing']
    ),

    // The user explains, sometimes frustrated, that they were just
    // greeting Darya («احمق دارم باهات درود/سلام/احوال‌پرسی می‌کنم»,
    // «میگم سلام کردم»). The anchored families above cannot match a
    // longer message, so without this rule the frustration override
    // answered the greeting with de-escalation (a transcript failure).
    // It mirrors the greeting warmly and apologizes for the mix-up,
    // never lecturing about the tone.
    rule(
      'greeting',
      61,
      pw(
        'دارم باهات درود|دارم با تو درود|میگم سلام|می‌گم سلام|گفتم سلام|سلام کردم|دارم سلام و احوالپرسی|دارم احوالپرسی می‌کنم|همینطوری سلام|فقط سلام|درود و سلام می‌کنم|سلام و درود|دارم خوش و بش می‌کنم|دارم خوش‌وبش می‌کنم|دارم احوالپرسی می‌کنم'
      ),
      R['ruleGreetingSalam']
    ),

    rule(
      'greeting',
      65,
      /^(?:سلام صبح بخیر|صبح بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodMorning']
    ),

    rule(
      'greeting',
      65,
      /^(?:شب بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodEvening']
    ),

    rule(
      'greeting',
      65,
      /^(?:عصر بخیر)(?:\s+(?:عزیز|دوست|جان))?[!.؟]*$/iu,
      R['ruleGreetingGoodAfternoon']
    ),

    rule(
      'toxic_family',
      57,
      // الگوی کنترل و تحقیر تکراری در خانواده پاسخ عملی و ایمنی‌محور
      // می‌گیرد. خشونت جسمی همچنان با اولویت ۹۷ به قاعده‌ی آزار می‌رود.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:(?:خانواده|خانوادم|والدین|مامانم|مادرم|بابام|پدرم|خواهرم|برادرم).{0,35}(?:سمی|کنترلگر|کنترل می|تحقیرم|توهینم|توهین می|کوچکم می|پیامامو میخون|پیام‌هایم را میخوان|پولمو میگیر|نمیذارن بیرون|تهدید میکنن بیرونم|با سکوت تنبیهم|باعث میشن احساس بی ارزشی)|(?:خانواده|والدین|خونه|خانه).{0,15}(?:سمی|کنترلگر|آزار عاطفی))(?!\p{L})/iu,
      R['ruleToxicFamily']
    ),

    rule(
      'toxic_friendship',
      57,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:(?:دوستم|رفیقم|دوست صمیمیم).{0,35}(?:سمی|تحقیرم|توهینم|رازمو|رازهایم را|فقط وقتی کار|فشار میاره|تنبیهم|اخاذی|میگه شوخی|می‌گه شوخی)|(?:دوستی|رابطه دوستی).{0,15}(?:سمی|یک طرفه|یک‌طرفه|آزاردهنده))(?!\p{L})/iu,
      R['ruleToxicFriendship']
    ),

    rule(
      'family',
      50,
      pw(
        // Kinship terms include the possessive son/daughter forms
        // («پسرم» my son, «دخترت» your daughter) because the bare
        // «پسر» also means "boy" and «دختر» also means "girl", which
        // appear in romance contexts that must not route to family. The
        // lookbehind rejects a preceding «دوست» so «دوست دخترم» (my
        // girlfriend) and «دوست پسرم» (my boyfriend) stay in the
        // relationship thread instead of being read as daughter/son.
        'پدربزرگ|مادربزرگ|پدر|مادر|مامان|خانواده|خانوادم|والدین|خواهر|برادر|' +
          '(?<!دوست |دوست)(?:پسرم|پسرت|پسرش|پسرمون|دخترم|دخترت|دخترش|' +
          'دخترمون|پسر من|دختر من)',
        '\\s*(.*)'
      ),
      R['ruleFamily']
    ),

    // A falling-out or feud with a family member ("من با مامانم قهر
    // هستم", "با خواهرم دعوا کردم"). The lived pain of a family rift
    // deserves its own warm pool instead of the generic family
    // reflection. Sits above the family and what_do_i_do rules so "قهر
    // با مامان" plus "چی کار کنم" stays on the relationship, never on a
    // work reading of the word "کار".
    rule(
      'family_conflict',
      53,
      // A bare «دعوا» (fight) is not enough on its own: «با رئیسم دعوا
      // کردم» is a work conflict, not a family one. The word only opens
      // the family thread when a family or partner noun appears nearby
      // (in either order), while «قهر» and «کدورت» stay bare because
      // they already name the fractured relationship in everyday Persian.
      // The trailing suffix set mirrors the pw() helper so suffixed
      // forms («دعوام», «مامانم») keep matching.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:قهر|کدورت|جر.{0,4}بحث|(?:مادر|مامان|پدر|بابا|خانواده|خواهر|برادر|همسر|زن|شوهر|دختر|پسر|عمه|خاله|دایی|عمو|خواهرزاده|برادرزاده|دوست|رفیق|نامزد|پارتنر).{0,30}دعوا|دعوا.{0,24}(?:مادر|مامان|پدر|بابا|خانواده|خواهر|برادر|همسر|زن|شوهر|دختر|پسر|عمه|خاله|دایی|عمو|خواهرزاده|برادرزاده|دوست|رفیق|نامزد|پارتنر))(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?!\p{L})/iu,
      R['ruleFamilyConflict']
    ),

    // Setting boundaries with family («چطور با خانواده‌ام مرز تعیین
    // کنم بدون دعوا»): a how-to about limits, distinct from the
    // family_conflict "falling out" pool below. Sits above
    // family_conflict (53) so the word «دعوا» near a family noun never
    // hijacks the boundary question into the estrangement pool.
    rule(
      'boundaries',
      54,
      pw(
        'مرز تعیین|مرز بذارم|مرز بگذارم|مرز تعیین کنم|حد و مرز|خط قرمز.{0,12}(?:خانواده|مادر|مامان|پدر|بابا|خواهر|برادر)|(?:خانواده|مادر|مامان|پدر|بابا|خواهر|برادر).{0,14}(?:مرز|حد)|چطور.{0,8}نه بگم|چطوری.{0,8}نه بگم|چجوری.{0,8}نه بگم|نه گفتن.{0,12}(?:خانواده|مادر|مامان|پدر|بابا)|چطور.{0,14}(?:نه بگم|نه بگویم).{0,10}(?:خانواده|مادر|مامان|پدر|بابا)|(?:به|با).{0,8}(?:مامانم|مادرم|پدرم|بابام|خانواده‌ام|خانوادم|مامان|مادر|پدر|بابا).{0,8}نه بگم' +
          // «چطور نه بگم» alone (no family noun) is a general boundary
          // ask and belongs here too.
          '|چطور نه بگم|چطوری نه بگم|چجوری نه بگم'
      ),
      R['ruleBoundaries']
    ),

    // A crush confession: «روی خواهر دوستم کراش زدم», «بهش کراش دارم».
    // The family rule (50) matched on the kinship noun and echoed the
    // capture («درباره‌ی دوستم کراش زدم بیشتر برایم بگویید») which
    // reads broken and missed the actual confession. This rule sits
    // between family (50) and family_conflict (53) so a crush that names
    // a relative keeps the crush thread instead of the family echo.
    rule(
      'crush',
      52,
      pw(
        // The age-gap guard scans the whole message from the start and
        // rejects any text mentioning an age difference: those get the
        // balanced age_gap guidance (45) instead of the generic crush
        // pool (the age-gap-crush tests pin this). The leading ^ anchor
        // forces the match to start at string position 0, which is fine
        // for .test() routing; this rule never uses {captured} groups, so
        // the consumed prefix cannot leak into a reply.
        '^(?:(?!.*?(?:فاصله سنی|فاصله‌ی سنی|۳۰ سال|۳۰ساله|سی سال|خیلی بزرگتر|خیلی کوچکتر|بزرگتر از من|کوچکتر از من)).)*(?:کراش|روی.{0,12}کراش|کراش.{0,12}(?:دارم|زدم|میخوام|می‌خوام|کردم)|بهش.{0,12}کراش|بهش.{0,12}گفتم دوستش دارم|دلم.{0,10}(?:میخواد|می‌خواد|میخواهد).{0,12}(?:باهاش|باهش|بهش).{0,12}(?:صحبت|حرف|برم|بگم)|دوسش دارم ولی.{0,12}(?:خیلی|نمیدونم|نمیدانم))'
      ),
      R['ruleCrush']
    ),

    // Success achievements and milestones are celebrations, not work-stress
    // reports: «تازه ترفیع گرفتم», «کار قبول شدم», «درس‌هامو پاس شدم».
    // Without this rule the «کار»/«شدم» markers sent good news to the
    // stress pool. It sits ABOVE the work rule (53 > 50). A negation guard
    // keeps failures («ترفیع نگرفتم», «رد شدم») off the pool, and «شدم»
    // requires an achievement object so «پیر شدم» (I got old) never fires.
    rule(
      'achievement',
      53,
      pw(
        '^(?:(?!.*?(?:نگرفتم|نیومدم|نیامدم|نشدم|رد شدم|فیل شدم|اخراج شدم|شدم ولی)).)*(?:ترفیع (?:گرفتم|شدم)|(?:تازه|الان|امسال|این هفته).{0,6}ترفیع|رتبه (?:آوردم|اوردم)|کار قبول شدم|استخدام شدم|قبول شدم|پاس شدم|قبولم (?:کردند|کردن)|(?:درس|درس‌ها|درسها) (?:مو|ام).{0,6}پاس|فارغ التحصیل شدم|فارغ‌التحصیل شدم|دانشگاه (?:قبول شدم|قبولم شد)|پروژه‌ام.{0,8}(?:تصویب|تأیید) شد|برنده شدم|جایزه (?:گرفتم|بردم)|برنده.{0,10}(?:جایزه|مسابقه)|خریدم.{0,4}(?:خونه|خانه|ماشین)|(?:خونه|خانه).{0,4}خریدم|بزنم بیرون.{0,10}شدم|کسب و کارم.{0,8}(?:راه افتاد|راه افتاد)|شرکت (?:زدم|زدیم)|کار (?:مردم|انداختم|راه انداختم|راه‌انداختم))'
      ),
      R['ruleAchievement']
    ),

    // Burnout is the deep, persistent exhaustion of overwork («سوختم»,
    // «روزی ۸۰ ساعت کار میکنم», «استارتاپم داره ورشکسته میشه»). It needs a
    // validating reply different from ordinary work stress. It sits above
    // work (55 > 50).
    rule(
      'burnout',
      55,
      pw(
        'سوختم|سوخته شدم|می‌سوزم|میسوزم|فرسودگی|فرسوده شدم|کار داره منو میکشه|کار داره منو می‌کشه|روزی (?:۸۰|۸|۱۰|۱۲|۱۴|۱۶|۱۸|۲۰) ساعت کار می‌کنم|روزی (?:۸۰|۸|۱۰|۱۲|۱۴|۱۶|۱۸|۲۰) ساعت کار میکنم|هیچ (?:وقت|روزی) مرخصی نمی‌گیرم|مرخصی نمی‌گیرم|استارتاپم داره ورشکسته می‌شه|استارتاپم داره ورشکسته میشه|استارتاپم (?:داره|داری) (?:نابود|ورشکسته) می‌شه|نمیتونم از کار جدا شم|نمی‌تونم از کار جدا شم|تعادل کار و زندگی ندارم|بعد از کار کاملاً خالی می‌شم|بعد از کار کاملا خالی میشم|از کار (?:خالی شدم|خالی میشم|مُردم)'
      ),
      R['ruleBurnout']
    ),

    rule(
      'work',
      50,
      // A how/explain question about a third-person subject («توربو چطوری
      // کار می‌کنه؟», «محمد علی کلی چی کار کرد؟») is a knowledge question,
      // not a work-stress disclosure: bare «کار» must not match when a
      // third-person action verb directly follows it. The verb-boundary
      // check keeps «کار کردم» ("I worked") and «کار می‌کنم» matching, so
      // real first-person disclosures still open the work thread.
      // Profession words («طراح», «برنامه‌نویس») open the work thread for
      // disclosures («طراح وب هستم و خسته شدم») but must NOT hijack a
      // career-aspiration question («چطور برنامه نویس شوم»): those route
      // to the knowledge shelf for a concrete plan. The negative lookahead
      // rejects a following career suffix (شوم/بشم/بشیم...) while leaving
      // lived disclosures («هستم», «شدم») untouched.
      new RegExp(
        '(?<!\\p{L})(?:کار(?!\\s*(?:می کنه|میکنه|می کنن|میکنن|می شود|میشود|می شه|میشه|کرد|کرده|می کرد|میکرد)(?!\\p{L}))|شغل|(?:رئیس|رییس)(?:م|ام|مون|مان|ت|تون|تان|ش|شون|شان)|همکار|استخدام|اخراج|دورکاری|دور کاری|دور کار|(?:طراح|گرافیست|برنامه‌نویس|برنامه نویس|کدنویس)(?!(?:های|ها|ی)?(?:\\s+[\\p{L}]+){0,3}\\s*(?:شوم|بشم|بشیم|بشویم|شویم|بشود|شود|بشه|بشی|میشم|می شم)))(?:های|ها|یم|ام|ای|ند|ید|م|ی|ه)?(?!\\p{L})\\s*(.*)',
        'iu'
      ),
      R['ruleWork']
    ),

    rule(
      'sleep',
      50,
      // The bare word «خواب» misses prefixed verb forms («بخوابم»), so
      // everyday openings like «شب‌ها نمی‌تونم بخوابم» or «خوابم نمی‌بره»
      // fell through to the unknown pool. The explicit phrases below are
      // the common colloquial ways Iranians say they cannot sleep.
      pw(
        'خواب|بی‌خوابی|بیخوابی|بی خوابی|کابوس|بیدار شدن|شب بیدار|نمی‌تونم بخوابم|نمیتونم بخوابم|نمیتوانم بخوابم|خوابم نمی‌بره|خوابم نمیبره|خوابم نمیاد|خوابم نمی‌آد|دیر خوابم می‌بره|بیدار می‌مونم|بیدار می شیم|پاسداری|سخت به خواب میرم|سخت به خواب می‌رم|نمی‌ذاره بخوابم|نمیذاره بخوابم|نمیزاره بخوابم|نمی‌زاره بخوابم|خوابم به هم ریخته|خوابم بهم ریخته|برنامه خوابم به هم ریخته|خوب نمیخوابم|خوب نمی خوابم|خوب نمی‌خوابم|خوابم خوب نیست'
      ),
      R['ruleSleep']
    ),

    // کمال‌گرایی: استاندارد آن‌قدر بالاست که شروع (یا تمام کردن) ممکن
    // نمی‌شود. پاسخ بار سنگین را تأیید می‌کند و سقف را به «به‌اندازه‌ی
    // کافی خوب برای امروز» پایین می‌آورد.
    rule(
      'perfectionism',
      55,
      pw(
        'کمال‌گرا|کمالگرا|کمال گرایی|کمال‌گرایی|همه‌چیز باید عالی|همه چیز باید عالی|همه‌چیز عالی باشه تا|همه چیز عالی باشه تا|باید همه‌چیز عالی|باید همه چیز عالی|تا عالی نشده شروع|تا کامل نشده شروع|هیچ کاری رو تموم نمی‌کنم|هیچ کاری رو تموم نمیکنم|هیچ کاری را تمام نمی‌کنم|هیچ کاری را تمام نمی کنم|هیچ‌وقت خوب نیست|به اندازه کافی خوب نیست'
      ),
      R['rulePerfectionism']
    ),

    // اهمال‌کاری و تمرکز: برداشتن گوشی، پیمایش بی‌پایان، عقب انداختن درس.
    // پاسخ حواس‌پرتی را نشانه می‌داند نه نقص شخصیتی، و یک قدم کوچک اول
    // پیشنهاد می‌کند.
    rule(
      'procrastination',
      52,
      pw(
        'اهمال‌کاری|اهمالکاری|تمرکز ندارم|نمیتونم تمرکز کنم|نمی تونم تمرکز کنم|حواسم پرته|حواسم پرت میشه|حواسم پرت می شه|گوشیم رو برمی‌دارم|گوشیم رو برمیدارم|گوشیم رو بر میدارم|می‌پرم تو اینستاگرام|میپرم تو اینستاگرام|پرم تو اینستاگرام|درس خوندن رو عقب می‌ندازم|درس خوندن رو عقب میندازم|درس خوندن رو عقب می اندازم|عقب می‌ندازم|عقب میندازم|عقب می اندازم|اسکرول(?!.{0,24}(?:دوست یابی|دوستیابی|تاریخ|اپ))|اسکرول میکنم|اسکرول می کنم|اسکرول می‌کنم|بعدش یه بازی|بعدش یه قسمت|بعد از یه بازی|بعد از یک بازی|بعد از یه قسمت|بعد از یک قسمت|فقط یه بازی دیگه|فقط یک بازی دیگه|فقط یه قسمت دیگه|فقط یک قسمت دیگه|تمرکز|موبایلم|موبایل خیلی|موبایل زیاد|گوشیم دستم|گوشیمو'
      ),
      R['ruleProcrastination']
    ),

    // Harassment or threats directed at the USER (not at Darya herself):
    // a threatening message, a stalker, blackmail, a hacked account.
    // Priority 60 sits above work/family so «می‌دونه کجا کار می‌کنم»
    // (they know where I work) is read as a threat, never a career chat.
    // The reply validates the fear and names safe concrete steps.
    rule(
      'harassment_threat',
      60,
      pw(
        // The تهدیدم verb forms are explicitly third-person: «کرد» gets
        // the pw() suffix «ی» (تهدیدم کردی = "you threatened me"), so a
        // negative lookahead rejects the second-person endings and keeps
        // the rule reading «یه نفر تهدیدم کرده» (someone threatened me)
        // while ignoring «تو تهدیدم کردی» directed at Darya.
        'تهدیدآمیز|تهدیدم (?:کرده|کرد|میکنه|می کنه)(?!ی|ید)|تهدید (?:کرده|میکنه|می کنه|م کرده)|باج|اخاذی|تعقیبم (?:میکنه|می کنه|کرده)|مزاحمت|استالکر|هکم (?:کرده|کرد)|هک (?:شدم|شده|م کردن)|آزار و اذیت|توهین‌آمیز|توهین آمیز|پیام(?:های)? (?:تهدید|توهین)|می‌دونه کجا (?:کار میکنم|زندگی میکنم)|میدونه کجا (?:کار میکنم|زندگی میکنم)'
      ),
      R['ruleHarassmentThreat']
    ),

    // Divorce and separation: one of the heaviest life transitions.
    // Sits above the family rule (50) so «بعد از طلاق...» stays on the
    // separation itself, not a generic family reflection.
    rule(
      'divorce',
      51,
      pw(
        'طلاق|مطلقه|از (?:همسرم|شوهرم|زنم) جدا|جدایی از (?:همسر|شوهر|زن)|تازه جدا شدم'
      ),
      R['ruleDivorce']
    ),

    // Frustration with new technology: an app that will not cooperate, a
    // device that feels like it belongs to a younger generation. The
    // reply normalizes the struggle and asks which step is the blocker.
    // A distinctly modern topic, added for recent-trend coverage.
    rule(
      'tech_frustration',
      48,
      pw(
        'این (?:اپ|اپلیکیشن|نرم‌افزار|نرم افزار).{0,20}(?:نمی‌فهمم|نمیفهمم|سخته|کار نمیکنه|کار نمی‌کنه)|نمی‌فهمم (?:این|اینو|اینها)|نمیفهمم (?:این|اینو|اینها)|تکنولوژی.{0,15}(?:جا موندم|عقب موندم)'
      ),
      R['ruleTechFrustration']
    ),

    // بیماری مزمن و نشانه‌های بی‌پاسخ: سال‌ها درد، بی‌تشخیصی پزشک‌ها.
    // پاسخ همدلانه است و مرز پزشکی را صادقانه رعایت می‌کند (هرگز حدس یا
    // تشخیص نیست) و خستگی را تأیید می‌کند. اولویت (58) بالاتر از
    // افسردگی (56) است: پیام «درد مزمن + ناامیدی» باید بر اساس بیماری
    // مزمن پاسخ بگیرد، چون همان بسته‌ی مراقبت و مرز پزشکی را دارد؛
    // «جواب قطعی» هم فقط با فعلِ نبودِ پاسخ همراه می‌شود تا سؤالات
    // غیرپزشکی («جواب قطعی داری؟») به اشتباه این‌جا نیفتند.
    rule(
      'chronic_illness',
      58,
      pw(
        'درد مزمن|بیماری مزمن|خستگی مزمن|فیبرومیالژی|بیماری خودایمنی|بیماری خود ایمنی|جواب قطعی (?:ندادن|ندادند|نگرفتم|ندارم|نیست|نمیدم|نمی‌دم|نمیدونم|نمیدانم)|پاسخ قطعی (?:ندادن|ندادند|نگرفتم|ندارم|نیست|نمیدم|نمی‌دم|نمیدونم|نمیدانم)|جوابی نگرفتم|پاسخی نگرفتم|دکترها جواب ندادن|دکترها جواب ندادند|دکترا جواب ندادن|با دردم زندگی می‌کنم|با دردم زندگی میکنم|زندگی با درد'
      ),
      R['ruleChronicIllness']
    ),

    // بار مراقبت: مراقبت از پدر/مادر/همسر بیمار یا سالخورده، خستگی و
    // احساس گناه کنار رفتن. پاسخ بار را تأیید می‌کند و مراقبت را به‌آرامی
    // به سمت خودِ مراقب برمی‌گرداند، نه این‌که آن را تعارض خانوادگی بخواند.
    rule(
      'caregiver',
      54,
      pw(
        'از مادرم.{0,20}مراقبت|از پدرم.{0,20}مراقبت|مراقب مادرم|مراقب پدرم|مراقب مادرم هستم|مراقب پدرم هستم|مراقب خودم|پرستاری می‌کنم|پرستاری میکنم|گناهش گردنم|گناهش گردنه|اگه اتفاق بیفته|اگر اتفاق بیفتد|نگرانم اتفاقی بیفته|زوال عقل|آلزایمر|فراموش می‌کنه|فراموش میکنه|چیزها رو فراموش|حافظه‌ش ضعیف|حافظه‌اش ضعیف'
      ),
      R['ruleCaregiver']
    ),

    // والد شدن تازه و افسردگی پس از زایمان: پدر/مادری که گریه می‌کند و
    // خودش را مادر/پدر بدی می‌داند. همدلی اول، بعد پیشنهاد ملایم حمایت.
    rule(
      'parenting',
      57,
      pw(
        'تازه به دنیا اومده|تازه به دنیا آمده|تازه بچه دار شدم|تازه بچه‌دار شدم|بچه‌م تازه|بعد از زایمان|افسردگی پس از زایمان|مادر خوبی نیستم|پدر خوبی نیستم|مادر بدی هستم|پدر بدی هستم|احساس می‌کنم مادر خوبی نیستم|احساس میکنم مادر خوبی نیستم|احساس می‌کنم پدر خوبی نیستم|احساس میکنم پدر خوبی نیستم|پدر خوبی نباشم|مادر خوبی نباشم|نگرانم.{0,15}(?:پدر|مادر) خوبی نباشم|بچهم.{0,20}بیدار|بچهام.{0,20}بیدار|بچه‌ام.{0,20}بیدار|شب‌ها بیدار|شبها بیدار|هر دو ساعت بیدار|همش گریه می‌کنم|همش گریه میکنم' +
          // Baby sleep and care phrasings: «بچهم شب‌ها نمی‌خوابه»، «پدر
          // جدید خسته‌ام». The ZWNJ and plain spellings both appear; the
          // normalized matcher collapses «شب‌ها» to «شب ها», so the space
          // form is required for half-space inputs.
          '|بچهم.{0,14}(?:نمی‌خوابه|نمیخوابه|نمی خوابه|نخوابیده|شب بیدار)|بچه‌ام.{0,14}(?:نمی‌خوابه|نمیخوابه|نمی خوابه|نخوابیده|شب بیدار)|نوزادم.{0,14}(?:نمی‌خوابه|نمیخوابه|نمی خوابه|نخوابیده|شب بیدار)|شب ها نمیخوابه|شب ها نمی خوابه|پدر جدید|مادر جدید|تازه.{0,8}(?:پدر|مادر) شدم|به عنوان پدر|به عنوان مادر|خسته‌ام.{0,10}(?:بچه|نوزاد)|نوزاد.{0,8}گریه|گریه.{0,8}نوزاد|کولیک|دندان درآوردن'
      ),
      R['ruleParenting']
    ),

    // Loss of passion or interest in a hobby the person used to love
    // («قبلا خیلی نقاشی دوست داشتم ولی دیگه نه», «ذوقم رو از دست دادم»).
    // A real quiet grief that used to fall to the unknown pool. Sits above
    // the sadness rule (41 > 40).
    rule(
      'lost_passion',
      48,
      pw(
        'ذوقم.{0,8}(?:از دست|رفته)|ذوقش.{0,8}(?:از دست|رفته)|از دست دادم.{0,8}(?:ذوق|علاقه|اشتیاق)|علاقه‌م.{0,8}(?:از دست|رفته)|دیگه.{0,8}(?:علاقه|ذوق|انگیزه|اشتیاق).{0,12}(?:ندارم|نمیکنم|نمی‌کنم|نمیتونم)|قبلا.{0,25}دوست داشتم.{0,25}(?:ولی|اما).{0,25}(?:نمیکنم|نمی‌کنم|نمی کنم|نزدم|نکردم|ندارم|نمیتونم|نمی‌تونم|دیگه)|انگیزه.{0,8}(?:ندارم|از دست|رفته)|اشتیاقم.{0,8}(?:از دست|رفته)|(?:نمیتونم|نمی‌تونم|نمیکنم|نمی‌کنم).{0,15}(?:بهش|باهاش).{0,12}(?:برگردم|شروع کنم)'
      ),
      R['ruleLostPassion']
    ),

    rule(
      'sadness',
      40,
      pw(
        // «دلم گرفته» is the common idiom; users also insert adverbs
        // («دلم خیلی گرفته») and write it as one word («دلم‌گرفته»), so
        // the gapped and glued variants are listed explicitly.
        'غمگین|ناراحت|افسرده|دلم گرفته|دلم خیلی گرفته|دلم‌گرفته|یه غم|یک غم|غم آروم|غم دارم|غم عجیب|گریه|روز بدی داشتم|روزم بد بود|روزم خراب بود|امروز روزم بد بود|حالم بده|حالم خوب نیست'
      ),
      R['ruleSadness']
    ),

    // Depression goes beyond sadness: a heavy, persistent mood
    // (hopelessness, worthlessness, emptiness, being unable to get out
    // of bed). First empathy, then a calm, real mention of professional
    // support.
    rule(
      'depression',
      56,
      pw(
        'افسردگی|افسرده|ناامید|بی‌ارزش|احساس پوچی|پوچ|نمی‌تونم از رختخواب بلند شم|نمی‌تونم از رختخواب بلند شم|نمیتونم از رختخواب بلند شم|نمی تونم از رختخواب بلند شم|از رختخواب بلند (?:شدن|نمی‌شم|نمیشم|نمی شم).{0,6}(?:برام|واسم|واسه‌ام|برایم|برای من|هم)?.{0,3}(?:سخته|سخت|سخته)|از رختخواب بلند نمی‌شم|از رختخواب بلند نمیشم|نمی‌تونم هیچ کاری کنم|هیچ (?:دلیلی|انگیزه‌ای) (?:برای زندگی|برای ادامه|برا زندگی) ندارم|دیگه هیچ‌چیز (?:معنی|فایده|ارزش) نداره|دیگه هیچ چیزی (?:برام|واسه‌ام|برایم|برای من)? (?:معنی|فایده|ارزش) نداره|هیچ چیزی (?:برام|واسه‌ام|برایم|برای من)? (?:معنی|فایده|ارزش) نداره|برام معنی نداره|حس می‌کنم هیچی نیستم|دلم مرده|از همه‌چیز خسته شدم|از همه چیز خسته شدم|از همه چی خسته شدم|از همه چی خسته‌ام|از همه چیز خسته‌ام|از زندگی خسته شدم|از زندگی سیر شدم|زندگی (?:بی‌فایده|بی‌معنی|بی معنی|بی‌معنا|بی معنا|پوچ) شده|زندگی بی فایده شده|دیگه طاقت ندارم|دیگه نمیتونم ادامه بدم|دیگه نمی‌تونم ادامه بدم|دیگه ادامه نمیدم|انگار ادامه (?:نداره|نداری)|لذت نمی‌برم|لذت نمیبرم|هیچی برام لذت نداره|هیچ لذتی نمی‌برم|صبح زود بیدار میشم|ساعت چهار بیدار میشم|ساعت ۴ بیدار میشم|صبح ساعت چهار بیدار میشم|فقط غمه|این فقط غمه|غمه یا چیز بیشتری|فقط غم|چیز بیشتری'
      ),
      R['ruleDepression']
    ),

    rule(
      'anxiety',
      40,
      pw('نگران|اضطراب|استرس|ترس|ترسیدم|می‌ترسم|میترسم|خجالت|خجالتی'),
      R['ruleAnxiety']
    ),

    // Fitness and gym anxiety: «از باشگاه رفتن می‌ترسم» (I am scared of
    // the gym), «جلوی بقیه خجالت می‌کشم ورزش کنم» (I am too embarrassed
    // to exercise in front of people). Outranks work so the newbie
    // compound «تازه‌کارم» inside a gym sentence never opens the work
    // thread, and outranks the generic anxiety rule so a gym disclosure
    // gets movement-encouraging care instead of a bare worry question.
    rule(
      'fitness',
      52,
      pw(
        'باشگاه|ورزشگاه|بدنسازی|جیم\b|خجالت.{0,10}(?:ورزش|باشگاه)|(?:ورزش|باشگاه).{0,10}خجالت|جلوی (?:بقیه|مردم|دیگران).{0,12}(?:ورزش|باشگاه)|(?:ورزش|باشگاه).{0,12}جلوی (?:بقیه|مردم|دیگران)|ترس.{0,10}(?:باشگاه|ورزشگاه)|از باشگاه'
      ),
      R['ruleFitness']
    ),

    // آشپزی: درست کردن غذا، یک تجربه‌ی ناموفق («قرمه‌سبزی درست کردم
    // تلخ شد»)، یا پرسیدن طرز پخت. مراقبت عملی از آشپزخانه، جدا از قفسه‌ی
    // دانش دایرةالمعارفی: شام سوخته راه‌حل می‌خواهد، نه سخنرانی. اولویت
    // پایین‌تر از باشگاه و کار است تا واژه‌های غذا هرگز حرف بدن یا شغل را
    // نربایند.
    rule(
      'cooking',
      48,
      pw(
        'آشپزی|آشپز|طرز تهیه|فسنجون|فسنجان|قرمه.{0,20}(?:درست|پختم|پخت|تلخ|شور)|قورمه.{0,20}(?:درست|پختم|پخت|تلخ|شور)|جوجه کباب|جوجه‌کباب|کباب.{0,10}(?:پختم|پخت|درست)|خورش.{0,10}(?:درست|پختم)|غذا.{0,8}(?:پختم|پخت|درست کردم)|(?:پختم|می‌پزم|میپزم|درست کردم).{0,10}(?:غذا|خوراک|شام|ناهار)'
      ),
      R['ruleCooking']
    ),

    rule('anger', 40, pw('عصبانی|خشمگین|کفری|از دستش عصبانی'), R['ruleAnger']),

    rule(
      'joy',
      35,
      pw('خوشحال|شاد|هیجان‌زده|هیجانزده|هیجان زده'),
      R['ruleJoy']
    ),

    // Being new in a place with nobody known («برای کار اومدم یه شهر
    // جدید و کسی رو نمی‌شناسم») is a loneliness disclosure, not a work
    // complaint, even when the move happened for a job: the user's
    // point is the loneliness of the new city. This narrow rule sits
    // ABOVE the work thread (51 > 50) so the mixed framing routes to
    // the loneliness care instead of the job pool. The main loneliness
    // rule stays at 40 so a plain homesickness or grief line never gets
    // pulled into the new-city pool.
    rule(
      'loneliness_new_city',
      51,
      pw(
        'تازه.{0,12}(?:شهر|جا|محله|شهرستان|دیار).{0,16}(?:اومدم|امدم|آمدم|رفتم)|کسی رو نمی‌شناسم|کسی را نمی‌شناسم|هیچ‌کس رو نمی‌شناسم|هیچ کسی رو نمی‌شناسم|جدید.{0,6}(?:اومدم|امدم)|غریبم|غریبه‌ام|تازه.{0,8}(?:رفتم|اومدم).{0,12}(?:شهر|جا)' +
          // New place AND nobody known: the loneliness is explicit even
          // when the sentence mentions work first («برای کار اومدم
          // یه شهر جدید»).
          '|(?:برای کار|سر کار).{0,10}(?:اومدم|امدم|رفتم).{0,12}(?:شهر|جا)|(?:اومدم|امدم|رفتم).{0,10}(?:شهر|جا).{0,12}(?:کسی|هیچ‌کس|هیچکس|هیچ کس)'
      ),
      R['ruleLoneliness']
    ),

    rule(
      'loneliness',
      40,
      pw(
        'تنها|تنهایی|کسی رو ندارم|هیچ‌کس نیست|هیچکس نیست|هیچ کس نیست|هیچ دوستی ندارم|دوستی ندارم|رفیق ندارم|هیچ رفیقی ندارم|دلم.{0,8}تنگ|دلتنگی|دلم برای|سکوت سنگین|سکوت خونه|سکوت خانه|' +
          // Being new in a place with nobody known («تازه به این شهر
          // اومدم و کسی رو نمیشناسم») is a loneliness disclosure too,
          // and it fell to the unknown pool in the transcript probes.
          'تازه.{0,12}(?:شهر|جا|محله|شهرستان|دیار).{0,16}(?:اومدم|امدم|آمدم|رفتم)|کسی رو نمیشناسم|کسی را نمی‌شناسم|هیچ‌کس رو نمیشناسم|هیچ کسی رو نمیشناسم|غریبم|غریبه‌ام|جدید.{0,6}(?:اومدم|امدم)|' +
          // First-person rejection and abandonment («همه آدما ازم متنفرن»
          // everyone hates me, «همه منو ترک کردن» everyone left me,
          // «هیچ کس منو دوست نداره» nobody loves me). These describe
          // the pain of being cut off, so they belong with loneliness,
          // never with the blanket-generalization rule below (which
          // challenges claims ABOUT groups, not pain directed AT the
          // speaker).
          'همه.{0,20}(?:ازم|از من)\\s*(?:متنفرن|متنفرند|بی‌زارن|بیزارن|بی زارن|بی‌زارند|بی زارند|بدشون میاد|بدشون می‌آد|بدشون می آد)|' +
          // Present-tense «همه منو ترک می‌کنن» (everyone keeps leaving
          // me) was missed by the past-tense-only list, so the transcript
          // question «چرا همیشه همه منو ترک میکنن؟» fell to the unknown
          // pool; the present-tense verbs now match alongside the past.
          'همه.{0,20}(?:منو|مرا)\\s*(?:دوست ندارن|دوست ندارند|ترک کردن|ترک کردند|ترک کرده|ترک می‌کنن|ترک می‌کنند|ترک میکنن|ترک میکنن|رها کردن|رها کردند|رها کرده|رها می‌کنن|رها می‌کنند|تنها گذاشتن|تنها گذاشتند|تنها گذاشته|تنها می‌ذارن|تنها می‌گذارن|مسخره می‌کنن|مسخره می‌کنند|مسخره می کنن|مسخره می کنند|مسخره میکنن|مسخره کردن|مسخره کرده)|' +
          'همه.{0,20}(?:به من|بهم|به ام)\\s*(?:می‌خندن|میخندن|می خندن)|' +
          'هیچ.{0,4}کس.{0,16}(?:منو|مرا)\\s*(?:دوست نداره|دوست ندارد|نمی‌خواد|نمیخواد|نمی خواد|نمی‌خواهد|نمیخواهد|نمی خواهد)|' +
          'هیچ.{0,4}(?:کس|کسی)\\s*دوستم نداره|هیچ.{0,4}کس.{0,10}منو\\s*نمی‌خواد|هیچ.{0,4}کس.{0,10}منو\\s*نمی خواد|' +
          // No close friends («۲۶ سالمه و هیچ دوست صمیمی ندارم») and the
          // busy-everyone variant («همه غرق زندگی خودشونن و هیچ‌کس
          // نمی‌پرسه حالم چطوره») are 2026-era loneliness openings that
          // fell to the unknown pool or were swallowed by the age
          // disclosure; «تنهاتر از همیشه» (lonelier than ever) covers
          // the statistics-style claim without needing the fact shelf.
          'هیچ دوست صمیمی ندارم|هیچ.{0,4}دوست.{0,4}صمیمی ندارم|دوست صمیمی ندارم|دوست صمیمی.{0,4}ندارم|هیچ دوست نزدیک ندارم|' +
          'همه غرق زندگی|همه غرق|هیچ‌کس نمی‌پرسه حالم|هیچکس نمی‌پرسه حالم|کسی نمی‌پرسه حالم|نمی‌پرسه حالم چطوره|حالم رو نمی‌پرسه|کسی حالمو نمی‌پرسه|' +
          'تنهاتر از همیشه|تنهاتر از قبل|تنهایی.{0,6}(?:جوان|امروز)'
      ),
      R['ruleLoneliness']
    ),

    // Digital/parasocial loneliness («دوستی‌هام همه آنلاین شدن و حس
    // پوچی دارم», «دویست تا دنبال‌کننده دارم ولی هیچ‌کس نیست زنگ
    // بزنم»): friendships that only exist online. Sits ABOVE the
    // depression rule (57 > 56) with a narrow online-only pattern, so
    // «حس پوچی» next to «آنلاین» routes to the digital-loneliness pool
    // instead of the depression shelf, while a plain «حس پوچی دارم»
    // keeps the depression care.
    rule(
      'loneliness_online',
      57,
      pw(
        'دوستی.{0,12}آنلاین(?:ن|ند)?|آنلاین.{0,8}دوستی|دوست(?:ام|ای|هام|هامون|هایم|های من|ای من|ها).{0,10}آنلاین(?:ن|ند)?|آنلاین.{0,12}(?:پوچی|پوچ)|(?:پوچی|پوچ).{0,12}آنلاین|دنبال‌کننده|دنبالکننده|فالوور|کسی نیست زنگ بزنم|هیچ‌کس نیست زنگ بزنم|هیچکس نیست زنگ بزنم|هیچ کس نیست زنگ بزنم'
      ),
      R['ruleLonelinessOnline']
    ),

    rule(
      'deepfake_safety',
      74,
      // eslint-disable-next-line max-len
      /(?:دیپ ?فیک|عکس برهنه جعلی|عکس خصوصی جعلی|عکس جعلی خصوصی|از من.{0,12}عکس.{0,8}جعلی|عکس خصوصی بدون رضایت|اخاذی جنسی|سکستروشن|آبروم.{0,12}(?:بره|رفته))/u,
      R['ruleDeepfakeSafety']
    ),
    rule(
      'online_harassment',
      73,
      /(?:داکس(?:م کردن|م کرده| شدم| کردن)|حمله گروهی|هجوم آنلاین|قلدری سایبری|آزار آنلاین)/u,
      R['ruleOnlineHarassment']
    ),
    rule(
      'misinformation',
      72,
      // eslint-disable-next-line max-len
      /(?:ویدیو.{0,12}ساختگی|چطور.{0,15}بفهمم.{0,15}ویدیو.{0,10}هوش مصنوعی|خبر.{0,12}(?:تیک ?تاک|اینستاگرام).{0,12}(?:باور|اعتماد)|اطلاعات غلط|خبر جعلی)/u,
      R['ruleMisinformation']
    ),
    rule(
      'ai_career',
      69,
      // eslint-disable-next-line max-len
      /(?:هوش مصنوعی.{0,15}(?:مدرک|رشته).{0,12}(?:بی ?ارزش|بیخود)|هوش مصنوعی.{0,15}(?:شغل|حرفه).{0,12}(?:می ?گیره|نابود))/u,
      R['ruleAiCareer']
    ),

    rule(
      'ai_companion',
      68,
      // eslint-disable-next-line max-len
      /(?:همدم هوش مصنوعی|(?:چت ?بات|هوش مصنوعی).{0,12}وابسته|دوست دختر هوش مصنوعی|دوست پسر هوش مصنوعی|وابسته.{0,12}(?:چت ?بات|هوش مصنوعی)|دلبسته.{0,12}(?:چت ?بات|هوش مصنوعی)|رابطه پاراسوشال|جای درمانگر|جای تراپیست)/u,
      R['ruleAiCompanion']
    ),
    rule(
      'ai_cognition',
      68,
      // eslint-disable-next-line max-len
      /(?:خودم فکر (?:نمی ?کنم|نکنم)|بدون هوش مصنوعی.{0,12}(?:فکر|کار|درس|نوشت)|هوش مصنوعی.{0,12}(?:تنبل|احمق).{0,8}(?:کرده|می ?کنه))/u,
      R['ruleAiCognition']
    ),

    rule(
      'digital_wellbeing',
      62,
      // eslint-disable-next-line max-len
      /(?:دیتاکس دیجیتال|سم ?زدایی دیجیتال|محتوای آشغال هوش مصنوعی|فیدم.{0,20}(?:تبلیغ|ربات)|ویدیوی کوتاه.{0,20}(?:تمرکز|توجه)|دامنه توجهم|اینستاگرام.{0,12}(?:حذف|پاک).{0,8}کردم|شبکه اجتماعی.{0,12}(?:ترک|حذف)|گوشی ساده|گوشی دکمه ?ای|دوپامین کم|سرگرمی آفلاین|در دسترس نباشم|اعلان.{0,15}(?:اضطراب|فشار)|پیشنهاد الگوریتم|خستگی از الگوریتم|انتخاب زیاد|بتل ?پس|بازی سرویس ?محور|فضای سوم|دوست آفلاین)/u,
      R['ruleDigitalWellbeing']
    ),

    rule(
      'doom_spending',
      63,
      /(?:خرید هیجانی.{0,15}(?:اسکرول|اینستاگرام)|اینستاگرام.{0,15}خرید هیجانی)/u,
      R['ruleDoomSpending']
    ),
    rule(
      'bnpl',
      63,
      /(?:الان بخر بعدا پرداخت کن|خرید اقساطی.{0,12}(?:گیر|بدهی))/u,
      R['ruleBnpl']
    ),
    rule(
      'online_scam',
      63,
      /(?:کلاهبرداری اینفلوینسر|کلاهبرداری آنلاین)/u,
      R['ruleOnlineScam']
    ),
    rule(
      'housing_pressure',
      61,
      /(?:نمی ?تونم خونه بخرم|از خرید خونه عقب|اجاره.{0,20}(?:کار تمام وقت|شغل))/u,
      R['ruleHousingPressure']
    ),
    rule(
      'climate_anxiety',
      60,
      /(?:تغییرات اقلیمی|بحران اقلیمی|اضطراب اقلیمی).{0,35}(?:آینده|بی ?معنی|ترس|برنامه)/u,
      R['ruleClimateAnxiety']
    ),
    rule(
      'political_division',
      60,
      /(?:شکاف|دوقطبی|اختلاف) سیاسی.{0,30}(?:دوست|خانواده|رابطه)/u,
      R['rulePoliticalDivision']
    ),

    // Blanket generalizations and stereotypes («همه زن‌ها مثل هم هستن»,
    // «همه مردا خودخواهن»): a gentle challenge that invites the specific
    // experience behind the belief instead of mirroring the claim back or
    // letting it pass unchallenged. Benign truisms («همه بچه‌ها بازی
    // دوست دارن») never match: the blanket-adjective branch needs a
    // judgmental word, and the same-ness branch needs the «مثل هم»
    // construction WITH a following copula (هستن/هستند/هست/ان/اند), so a
    // different verb («همه چیز مثل هم شده») can never be read as a
    // same-ness claim. First-person pain («همه آدما ازم متنفرن») never
    // lands here either; the loneliness rule above owns those and
    // outranks this one.
    rule(
      'generalization',
      35,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:(?:همه|تمام|همه‌ی|همه ی|همشون|همه شون)\s*(?:[\p{L}]+(?:\s+[\p{L}]+){0,3}\s+)?مثل هم\s*(?:هستن|هستند|هست|ان|اند)|(?:همه|تمام|همه‌ی|همه ی)\s+(?:[\p{L}]+(?:\s+[\p{L}]+){0,3})\s+(?:خودخواه|بی‌شرف|بیشرف|بی شرف|بی‌ادب|بیادب|بی ادب|بی‌شعور|بیشعور|بی شعور|احمق|خسیس|دروغ‌گو|دروغگو|دروغ گو|تنبل|بدجنس|سنگدل|بی‌رحم|بیرحم|بی رحم|بی‌وجدان|بیوجدان|بی وجدان|پول‌پرست|پولپرست|پول پرست|کثیف|مزخرف|بی‌فایده|بیفایده|بی فایده|مفت‌خور|مفتخور|مفت خور|دشمن|پررو|حریص|حسود|ترسو)(?:ن|ان|اند|هستن|هستند|هست|ی|شدن|شدند)?|(?:همه|تمام|همه‌ی|همه ی|همشون|همه شون)\s+(?:خودخواه|بی‌شرف|بیشرف|بی شرف|بی‌ادب|بیادب|بی ادب|بی‌شعور|بیشعور|بی شعور|احمق|خسیس|دروغ‌گو|دروغگو|دروغ گو|تنبل|بدجنس|سنگدل|بی‌رحم|بیرحم|بی رحم|بی‌وجدان|بیوجدان|بی وجدان|پول‌پرست|پولپرست|پول پرست|کثیف|مزخرف|بی‌فایده|بیفایده|بی فایده|مفت‌خور|مفتخور|مفت خور|دشمن|پررو|حریص|حسود|ترسو)(?:ن|ان|اند|هستن|هستند|هست|ی|شدن|شدند)?)(?!\p{L})/iu,
      R['ruleGeneralization']
    ),

    rule(
      'self_esteem',
      40,
      pw(
        'بی‌ارزش|بیارزش|بی ارزش|اعتماد به نفس ندارم|از خودم بدم میاد|به اندازه کافی خوب نیستم|احساس گناه|حس گناه|گناه میکنم|گناه می کنم|پشیمونم|پشیمانم|خودم رو با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام|هیچ‌کس) مقایسه|خودمو با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام|هیچ‌کس) مقایسه|خودم را با (?:دیگران|بقیه|اون‌ها|اونها|همکلاسی‌هام|همکلاسیهام) مقایسه|خودم رو مقایسه میکنم|خودمو مقایسه میکنم|خودم را مقایسه میکنم|چشم و هم چشمی|حسادت میکنم|حسادت می کنم|هیچی نیستم|هیچیم نیست|به هیچی نمیارزم|به هیچی نمی‌ارزم|ارزش ندارم|' +
          // «فکر میکنی من آدم خوبیم؟» (do you think I am a good person) is
          // a self-worth check-in: the speaker is looking for validation or
          // reassurance, not an opinion poll. Routing it to the self-esteem
          // pool answers with warm, honest affirmation instead of the
          // evasive "let us sit with it" line.
          'فکر میکنی من آدم خوب|فکر می‌کنی من آدم خوب|من آدم خوبی هستم|من آدم خوبیم|آدم خوبی هستم|آدم خوبی ام|آیا من آدم خوبی|من آدم بدی هستم|من آدم بدیم|آدم بدی هستم|من بد هستم'
      ),
      R['ruleSelfEsteem']
    ),

    // Social comparison: measuring life against friends, classmates,
    // family, or social media («همه توی اینستاگرام زندگی بهتری از من
    // دارن», «دوستان دبیرستانیم همه موفق شدن و من نه», «همکلاسی‌هام
    // ترفیع می‌گیرن و من سر جام وایسادم», «دیدن مسافرت رفتن بقیه حس
    // حقارت بهم می‌ده», «در سن من احساس شکست می‌کنم»). The probe
    // showed these falling to the unknown pool or the vague reflection
    // lines. Sits above self_esteem (40) and generalization (35); family
    // (50) still outranks it, so «خانوادم منو با پسرخاله‌هام مقایسه
    // می‌کنه» stays on the family thread.
    rule(
      'social_comparison',
      46,
      pw(
        // «مقایسه» with a self/others object, «حسادت»/«حسودی» (envy),
        // «حقارت» (inferiority), «عقب موندم» (falling behind), and the
        // everyone-else framing («همه... موفق/شادتر/بهتر», «هم سن و
        // سالام»). Instagram/social-media names are bare nouns, so they
        // are guarded with the pw boundary like the rest.
        'اینستاگرام|اینستا|شبکه اجتماعی|شبکه های اجتماعی|مقایسه.{0,10}(?:خودم|خودمو|زندگی|حالم|دوستام|دوست هام|دوستان|فامیل|خانواده|همکلاسی|همکلاسی‌هام|همکلاسیهام|پسرخاله|دخترخاله|خواهر|برادر)|حسادت|حسودی|غبطه|حقارت|عقب موندم|عقب افتادم|عقب ماندم|عقب موندم|از همه عقب|عقب تر از همه|همه.{0,10}(?:موفق|شادتر|بهتر|خونه خریدن|خونه خرید|ترفیع)|هم سن و سالام|هم سن و سال ها|دوست.{0,8}(?:دبیرستان|مدرسه).{0,8}موفق|در سن من|تو سن من|احساس شکست میکنم|احساس شکست می کنم|حس شکست|ترفیع.{0,10}(?:می‌گیرن|میگیرن|گرفتن)|سر جام وایسادم|سر جام وایستادم'
      ),
      R['ruleSocialComparison']
    ),

    // Overwork without progress: two jobs, salary that runs out before
    // the month ends, bills piling up («دو تا شغل کار می‌کنم ولی بازم
    // نمی‌تونم جلو برم», «حقوقم آخر ماه تموم میشه»). The probe showed
    // the bare «شغل» keyword pulling these into the knowledge rule and
    // answering with a stoicism essay instead of empathy. Sits above the
    // knowledge rule (55) and work (50) so the money reading wins.
    rule(
      'overwork_stuck',
      56,
      pw(
        'دو تا شغل|دوتا شغل|دو شغل|جلو نمیرم|جلو نمی‌رم|جلو نمی روم|جلو نمی‌تونم برم|جلو نمیتونم برم|جلو نمی تونم برم|حقوقم.{0,10}(?:تموم میشه|تموم می‌شه|تموم میشد|تمام میشه|کفاف.{0,6}(?:ماه|خرج)|نمیرسه|نمی‌رسه)|پولم.{0,10}(?:تموم میشه|تموم می‌شه|تمام میشه)|خرج‌هام.{0,10}زیاده|خرج هام.{0,10}زیاده|بی‌وقفه کار|بی وقفه کار|کار می‌کنم ولی.{0,8}(?:جلو|پیشرفت)|هرچی کار می‌کنم|هرچقدر کار می‌کنم'
      ),
      R['ruleOverworkStuck']
    ),

    rule(
      'motivation',
      35,
      pw(
        // «هیچ انگیزه‌ای برای زندگی ندارم» (with the ZWNJ normalized to
        // a space) was missed by the bare «انگیزه ندارم» and fell to the
        // unknown pool; the gap-tolerant «انگیزه.{0,10}ندارم» forms now
        // match both spellings.
        'انگیزه ندارم|انگیزه ای ندارم|انگیزه‌ای ندارم|انگیزه.{0,40}ندارم|بی‌انگیزه|بی انگیزه|بی‌حوصله|بیحوصله|بی حوصله|بیحوصلگی|امیدی ندارم|هیچ امیدی|نمی‌تونم شروع کنم|نمیتونم شروع کنم|نمی تونم شروع کنم|تعلل می‌کنم|تعلل میکنم|تعلل می کنم'
      ),
      R['ruleMotivation']
    ),

    // The user asks for a joke or wants to laugh. Replies come from a
    // pool of clean, kind jokes; a "بخندون من" request lands here too,
    // so the reply stays light and is never at anyone's expense.
    // «جک» and «لطیفه» are everyday synonyms of «جوک» that the old
    // pattern missed («یه جک بگو», «لطیفه تعریف کن»), and a transcript
    // form like «برام یک جک/جوک/لطیفه بگی» arrives as «یک جک» after
    // normalization. «جک میدونی» is deliberately NOT a form: «جک» also
    // means "jack" (car jack, tool), so «جک میدونی چیه؟» must never be
    // read as a joke request. The tail guard stops offers and statements
    // about a joke (first-person telling, past tense, having one) from
    // being read as requests: «یه جوک میگم», «میخوام یه جوک بگم», «یه
    // جک خوب بود», «یه جک تعریف کردم» are the user's own joke talk, not
    // a call for one.
    rule(
      'smalltalk_joke',
      60,
      pw(
        'جوک بگو|جوک بگویید|جوک بگید|جوک بگی|جوک تعریف کن|جوک تعریف کنید|جوک تعریف کنی|جوک بلدی|یه جوک|یک جوک|جک بگو|جک بگویید|جک بگید|جک بگی|جک تعریف کن|جک تعریف کنید|جک تعریف کنی|جک بلدی|یه جک|یک جک|لطیفه بگو|لطیفه بگویید|لطیفه بگید|لطیفه بگی|لطیفه تعریف کن|لطیفه تعریف کنید|لطیفه تعریف کنی|لطیفه بلدی|یه لطیفه|یک لطیفه|بخندون من|بخندونم|منو بخندون|چیزی بامزه بگو|چیزی بامزه بگویید|چیز بامزه بگو|چیز بامزه بگویید|یه چیز بامزه|یک چیز بامزه|چیز خنده‌دار بگو|یه چیز خنده‌دار|یک چیز خنده‌دار|بامزه حرف بزن|حرف بامزه بزن|دلم میخواد بخندم|دلم می‌خواد بخندم',
        '(?!.{0,10}(?:میگم|میگویم|بگم|بگویم|گفتم|گفته|بود|بوده|کردم|شنیدم|شنید|گفت|میدونم|می‌دونم|دارم))'
      ),
      R['ruleTellJoke']
    ),

    // Short-story requests («یه داستان بگو», «یه داستان ترسناک تعریف
    // کن», «قصه بگو»). The reply comes from the genre pools (see
    // responder-rules.js), so a horror request never gets a comedy tale
    // and vice versa. «یه داستان دیگه» (a bare follow-up after a story)
    // lands here too, keeping the follow-up on the story thread instead
    // of the generic fallback. Life-story disclosures («داستان زندگیم
    // خیلی سخته») carry no request verb and fall through untouched.
    rule(
      'smalltalk_story',
      58,
      pw(
        'داستان بگو|داستان بگویید|داستان بگید|داستان بگی|داستان تعریف کن|داستان تعریف کنید|داستان تعریف کنی|یه داستان|یک داستان|داستانی بگو|قصه بگو|قصه بگویید|قصه بگید|قصه تعریف کن|یه قصه|یک قصه|داستان ترسناک بگو|داستان ترسناک تعریف کن|داستان خنده‌دار بگو|داستان خنده دار بگو|داستان خنده‌دار تعریف کن|داستان کوتاه بگو|داستان کوتاه تعریف کن|برام داستان|داستان برام|یه داستان دیگه|یک داستان دیگر|داستان دیگه بگو|داستان دیگر بگو',
        '(?!.{0,10}(?:زندگیم|زندگیمون|زندگیش|داستان زندگی|گفتم|میگم|میگویم|دارم|بود))'
      ),
      R['ruleTellStory']
    ),

    // The user asks Darya to buy something ("برام لپ‌تاپ بخر", "کجا
    // می‌تونم بخرم؟"). Darya cannot make purchases, so the reply first
    // states the limit honestly and then helps think the purchase
    // through.
    rule(
      'shopping',
      50,
      pw(
        'برام.{0,16}(?:بخر|بگیر|بخریم|بگیری)|میخوام.{0,16}(?:بخرم|بگیرم|بخرمش)|میخواهم.{0,16}(?:بخرم|بگیرم)|کجا.{0,16}(?:بخرم|بگیرم|بخریم)|کجا می‌تونم.{0,16}(?:بخرم|بگیرم)|کجا میتونم.{0,16}(?:بخرم|بگیرم)|ارزش خرید داره|ارزش خرید دارد|باید بخرم|باید.{0,20}(?:بخرم|بگیرم)|کدوم.{0,20}(?:بخرم|بگیرم)|کدام.{0,20}(?:بخرم|بگیرم)|راهنمایی خرید|راهنمای خرید|چی بخرم|چیزی بخرم|قیمتش چنده|خرید کنم|بخرمش'
      ),
      R['ruleShoppingHelp']
    ),

    // A crush on someone much older (thirty years or more). Balanced,
    // non-judgmental guidance: life stage, power balance, and mutual
    // respect matter more than the number itself.
    rule(
      'age_gap',
      45,
      pw(
        'فاصله سنی|فاصله‌ی سنی|سی سال.{0,10}(?:بزرگتر|کوچکتر)|خیلی (?:بزرگتر|کوچکتر) از منه|خیلی (?:بزرگتر|کوچکتر) از من|۳۰ سال.{0,10}(?:بزرگتر|کوچکتر)|۳۰ سال.{0,10}بزرگتره|بیست سال.{0,10}(?:بزرگتر|کوچکتر)'
      ),
      R['ruleAgeGap']
    ),

    rule(
      'relationship',
      40,
      pw(
        // «دوست‌دختر»/«دوست‌پسر» (no space) are the common texting
        // spellings; both spaced and unspaced forms stay in the
        // relationship thread.
        'دوست پسر|دوست دختر|دوست‌پسر|دوست‌دختر|همسر|نامزد|بهم زدیم|جدا شدیم|' +
          'رابطه‌ام|رابطهام|رابطه ام|' +
          // Breakup of a relationship: «رابطه‌مون تموم شد», «رابطه رو تموم
          // کردم», «بعد از چهار سال رابطه تمومش کردم». Without these, a
          // bare «رابطه» before a breakup verb fell to the knowledge shelf
          // (philosophy/relationships) instead of the empathy pool.
          'رابطه‌مون تموم|رابطهمون تموم|رابطه مون تموم|رابطه رو تموم|رابطه‌رو تموم|رابطه‌ام تموم|رابطه‌م تموم|تمومش کردم|رابطه.{0,8}تموم|' +
          // Heartbreak: «دلشکستم» (my heart is broken) is the everyday
          // way to open a breakup; without it the one-word cry fell to
          // the "کمی بیشتر توضیح می‌دهی؟" echo pool.
          'دلشکسته|دل شکسته|دلشکستم|دل شکستم|قلبم شکست|قلبم شکسته|دلم شکست|دلم شکسته'
      ),
      R['ruleRelationship']
    ),

    rule(
      'health',
      35,
      pw(
        'مریض|بیمار|درد دارم|دکتر رفتم|' +
          // A bare «سلامتی» is an everyday how-are-you greeting and is
          // owned by smalltalk_howareyou above. Health meaning requires
          // surrounding context so the same word cannot inflate a greeting
          // into a serious health turn.
          'نگران سلامتی|وضعیت سلامتی|مشکل سلامتی|درباره سلامتی|سلامتی‌ام|سلامتی ام|سلامتیم|سلامتی من|' +
          'بی‌تحرک|بیتحرک|بی تحرک|کم‌تحرک|کم تحرک|' +
          'ورزش نمیکنم|ورزش نمی‌کنم|ورزش نکردم|پیاده‌روی خیلی کمه|پیاده روی خیلی کمه|پیاده‌روی کمه|پیاده روی کمه|ورزشم کمه|تحرکم کمه|بدنم بی‌جان|کم‌انرژی|کمانرژی|' +
          // Body-change complaints («بزرگ شدن سایز سینه و پهلو (من مرد
          // هستم)») route to the health thread instead of the unknown-topic
          // pool or a reflection echo. Terms are body-change-specific on
          // purpose: a bare «سینه‌ام» (my chest) stays out so chest-pain
          // sentences still reach the serious healthSymptoms rule.
          'بزرگ شدن سایز|سایز سینه|سینه‌ام بزرگ|پهلوهام|پهلوها|شکمم بزرگ|وزنم زیاد|وزنم کم|چاق شدم|لاغر شدم|پوستم جوش|پوستم جوش زده|جوش زدم|ریزش مو|موهام می‌ریزه|موهام داره می‌ریزه|موهام داره میریزه|موهایم می‌ریزه|موهایم داره می‌ریزه|بدنم تغییر|بدنم عوض|بدنم داره عوض|سایز بدنم|سایزم عوض|بدنم بزرگ شده'
      ),
      R['ruleHealth']
    ),

    rule(
      'mindfulness',
      40,
      pw(
        'ذهن آگاهی|ذهنآگاهی|مدیتیشن|مراقبه|حضور در لحظه|در لحظه حاضر|حاضر بودن در لحظه|نفس عمیق|نفس می کشم|نفس میکشم|تمرین تنفس|آرامش|زمین‌سازی|زمینسازی|زمین سازی|آگاه بودن|تمرکز روی نفس|نظاره‌گر افکار|نظارهگر افکار|نظاره گر افکار|بدون قضاوت|اینجا و اکنون|لحظه حال|آرام کردن ذهن'
      ),
      R['ruleMindfulness']
    ),

    rule(
      'stress',
      40,
      pw(
        'overwhelmed|فرسودگی|تحت فشار|فشار زیاد|ظرفم تموم شده|دیگه طاقت ندارم|کم آوردم|از پا افتاده|خسته از کار|استرس زیاد|فشار روحی|حالم بده|ظرفیت ندارم|نمی‌تونم ادامه بدم|نمیتونم ادامه بدم|نمی تونم ادامه بدم|خالی شدم|دیگه نمی‌کشم|دیگه نمیکشم|دیگه نمی کشم|آخر خط|سوختم|سوخته شدم|می‌سوزم|میسوزم|کاملا سوختم|همه.{0,15}(?:ازم|از من) انتظار|انتظار.{0,12}ازم|انتظار.{0,12}از من|فشار روی من|فشار روشن'
      ),
      R['ruleStress']
    ),

    // The user asks Darya to say something more simply or more briefly
    // ("ساده‌تر بنویس", "کوتاه‌تر بگو"). Acknowledge warmly and commit to
    // a plainer register instead of falling through to a generic line.
    rule(
      'simplify',
      45,
      pw(
        'ساده‌تر بنویس|ساده تر بنویس|ساده‌تر بگو|ساده تر بگو|ساده‌تر بگویی|ساده تر بگویی|ساده‌تر بگویید|ساده تر بگویید|ساده‌تر توضیح بده|ساده تر توضیح بده|ساده‌تر توضیح بدی|ساده تر توضیح بدی|ساده‌تر توضیح بدهی|ساده تر توضیح بدهی|ساده‌تر توضیح بدهید|ساده تر توضیح بدهید|کوتاه‌تر بنویس|کوتاه تر بنویس|کوتاه‌تر بنویسی|کوتاه تر بنویسی|کوتاه‌تر بنویسید|کوتاه تر بنویسید|کوتاه‌تر بگو|کوتاه تر بگو|کوتاه‌تر بگویی|کوتاه تر بگویی|کوتاه‌تر بگویید|کوتاه تر بگویید|کوتاه‌تر توضیح بده|کوتاه تر توضیح بده|زیاد طولانی|خیلی طولانی|پیچیده نکن|ساده و کوتاه|کوتاه و ساده|ساده بگو|ساده صحبت کن|ساده صحبت کنی|ساده حرف بزن|ساده حرف بزنی|قالب ساده|شکل ساده|به زبان ساده|با زبان ساده|روون‌تر بنویس|روان‌تر بنویس|روان تر بنویس|روون تر بنویس|ساده‌ترش کن|ساده ترش کن|پیچیده داری توضیح میدی|پیچیده داری توضیح می‌دی|پیچیده داری توضیح میدی؟|ساده‌تر بنویس|ساده تر بنویس|سادهتر بنویس|سادهتر بگو|سادهتر بگویی|سادهتر بگویید|سادهتر توضیح بده|سادهتر توضیح بدی|سادهتر توضیح بدهی|سادهتر توضیح بدهید|کوتاهتر بنویس|کوتاهتر بنویسی|کوتاهتر بنویسید|کوتاهتر بگو|کوتاهتر بگویی|کوتاهتر بگویید|کوتاهتر توضیح بده|روونتر بنویس|روانتر بنویس|روونتر بگو|سادهترش کن|روونترش کن'
      ),
      R['ruleSimplify']
    ),

    // App commands: the user asks Darya to change the theme or the
    // ambient sound from inside the chat ("پوسته رو عوض کن", "پخش صدای
    // محیطی رو روشن کن"). Darya cannot control the page UI, so the reply
    // is honest about the limit and returns to the conversation. This
    // outranks app_feedback so a command is never answered with a canned
    // "thanks for the feedback" line.
    rule(
      'app_command',
      68,
      pw(
        'پوسته.{0,24}(?:عوض|تغییر|روشن|تیره)|تم.{0,24}(?:عوض|تغییر)|صدای.{0,20}(?:روشن|خاموش|قطع|بزن|پخش)|صدا.{0,16}(?:روشن کن|خاموش کن|قطع کن|بزن|پخش کن)|موزیک.{0,16}(?:بزن|پخش)|موسیقی.{0,16}(?:بزن|پخش)|آهنگ.{0,16}(?:بزن|پخش)'
      ),
      R['ruleAppCommand']
    ),

    // App and website feedback ("تم ساحل این وب‌سایت رو مشکل‌دار می‌دونم",
    // "the waves look too small"): acknowledge warmly and steer back to
    // the conversation. The pattern is highly specific (UI/website words),
    // so it outranks the generic feeling/reasoning rules but stays below
    // knowledge so genuine emotional disclosures always win.
    rule(
      'app_export',
      67,
      pw(
        'دانلود.{0,10}(?:گفتگو|مکالمه|چت|گفتگوی)|خروجی.{0,10}(?:گفتگو|مکالمه|چت)|ذخیره.{0,10}(?:گفتگو|مکالمه|چت|گفتگوی)|فایل.{0,10}(?:گفتگو|مکالمه|چت)|export.{0,10}(?:گفتگو|مکالمه|چت)|(?:گفتگو|مکالمه|چت) (?:ام|مون|من).{0,6}(?:دانلود|ذخیره|خروجی|فایل)|چطور.{0,10}(?:دانلود|ذخیره|خروجی).{0,14}(?:گفتگو|مکالمه|چت|متنی)|چطور.{0,12}(?:گفتگو|مکالمه|چت).{0,12}خروجی.{0,6}(?:متنی)?|کپی.{0,10}(?:گفتگو|مکالمه|چت)|(?:میخوام|می‌خوام|می خوام|دلم میخواد|بخوام|بخواد).{0,8}(?:گفتگو|مکالمه|چت).{0,6}(?:رو|را)?.{0,4}(?:دانلود|ذخیره|خروجی)|(?:گفتگو|مکالمه|چت).{0,6}(?:رو|را).{0,6}(?:دانلود|ذخیره|خروجی|فایل)'
      ),
      R['ruleAppExport']
    ),

    rule(
      'session_persistence',
      66,
      pw(
        '(?:این|این گفتگو|مکالمه|چت|گفتگوی).{0,8}(?:ذخیره|می‌مونه|می‌مونه؟|می مونه|میمونه|بعد|نگه می‌داری|یادت می‌مونه|یادت میمونه)|(?:بعد از|وقتی).{0,8}(?:رفرش|رفرش کنم|رفرش کنم|تازه کنم|تازه کنم|ببندم|بستن).{0,8}(?:گفتگو|مکالمه|چت|پاک|می‌شه|میشه|میاد|داده ها|داده‌ها)|(?:گفتگو|مکالمه|چت|این).{0,8}(?:پاک می‌شه|پاک میشه|از بین می‌ره|از بین میره|حذف می‌شه|حذف میشه)|(?:می‌تونی|میتونی|میشه).{0,8}(?:گفتگو|مکالمه|چت).{0,8}(?:ذخیره|نگه داری)|آیا.{0,8}(?:گفتگو|مکالمه|چت|مکالممون|مکالمهمون).{0,8}(?:ذخیره|می‌مونه|خصوصی)|(?:خصوصی|شخصی).{0,8}(?:گفتگو|مکالمه)|جایی ذخیره می‌کنی'
      ),
      R['ruleSessionPersistence']
    ),

    rule(
      'app_feedback',
      32,
      pw(
        // The bare word «منو» is deliberately excluded: in everyday
        // Persian it far more often means «me» ("دوست دخترم منو له
        // کرده") than the app menu, so it must never open the app-feedback
        // thread. Only the ezafe form («منوی») or the plural («منوها»)
        // clearly name the menu. «انیمیشن» and «موبایل» are also absent
        // on purpose: in everyday Persian they mean animated movies and
        // the phone device, so requests like «انیمیشن معرفی کن» and
        // complaints like «موبایلم دستم نمیمونه» must route to knowledge
        // and procrastination instead. The cost is that genuine UI-animation
        // or mobile-app feedback no longer lands here; that is the right
        // tradeoff for the far more common meanings. «تم» (theme) is
        // guarded with a negative lookahead so it never matches inside
        // «تمام» (complete/full): a work vent like «رئیس من یه احمق تمام
        // عیاره» must stay a work complaint, never become app feedback.
        'وب‌سایت|وبسایت|وب سایت|وب‌سایتم|وبسایتم|سایت|تم(?!ام)|پوسته|رابط کاربری|طراحی|دکمه|منوی|منوها|فونت|آیکون|موج|امواج|ساحل|فرمت'
      ),
      R['ruleAppFeedback']
    ),

    rule(
      'gratitude',
      25,
      // The optional spaces ( ? ) accept both the joined form ('دستت')
      // and the half-space normalized form ('دست ت'), because the FA
      // half-space normalizer turns a ZWNJ (U+200C) into a plain space
      // in the matching text. 'دستت درد نکنه' is the most common Persian
      // way to thank someone for their help.
      pw(
        'ممنون|ممنونم|متشکرم|مرسی|سپاسگزار|قدردان|سپاس|تشکر|خوشحالم که هستی|دمت گرم|دستت گرم|خسته نباشی|قربانت|لطف داری|ممنون ازت|دست ?ت ?درد ?نکنه|دست ?شما ?درد ?نکنه'
      ),
      R['ruleGratitude']
    ),

    rule(
      'school',
      35,
      pw('امتحان|کنکور|دانشگاه|نمره|استاد|دانشجو|دانشجوم'),
      R['ruleSchool']
    ),

    rule(
      'money',
      35,
      // «پولم تموم شده» (my money ran out) and «حقوقم نمی‌رسه» are the
      // most common financial openings; the old list only matched
      // «پول ندارم» style phrasings. «پول» with the possessive suffix
      // (پولم/پولت) is safe to include: money talk is money talk.
      pw(
        // «هیچ پولی ندارم این ماه» and «پولم نیست» were missed by the
        // old list (which required the contiguous «پول ندارم»), so the
        // no-money probe fell to the unknown pool.
        'پول ندارم|پولی ندارم|پولم نیست|پولم نیس|هیچ پولی ندارم|مشکل مالی|بدهکار|قسط|هزینه‌ها|هزینهها|هزینه ها|پولم تموم شده|پولم تمام شده|بی‌پول|بی پول|بیپول|فلس|فلسم|حقوق|وام|قرض|خرج‌ها|خرج ها|بودجه|مدیریت مالی|مدیریت پول|پس‌انداز|پس انداز|فکرای پول|فکر پول|قیمتا|قیمت ها|قیمتها|قیمت.{0,8}(?:خوراکی|غذا|اجناس|میوه)|تورم|گرونی|خرج‌ها بالا رفته|درآمدم.{0,6}کمه|حقوقم.{0,6}کمه|پول.{0,8}ندارم|پول خرج.{0,10}(?:عذاب وجدان|گناه)|عذاب وجدان.{0,10}(?:پول|خرج)|پول.{0,10}خرج.{0,10}(?:عذاب|گناه)'
      ),
      R['ruleMoney']
    ),

    // Gig economy: ride-hailing, food delivery, freelance platforms,
    // unpredictable gig income. These 2026-era disclosures («پیک موتوری
    // می‌شدم», «برای یه اپ درخواست خودرو رانندگی می‌کنم», «درآمدم
    // نامنظمه», «پلتفرم‌های فریلنس») fell to the unknown pool, so they
    // get a dedicated pool above the work thread (51 > 50).
    rule(
      'gig_economy',
      51,
      pw(
        'پیک موتوری|درخواست خودرو|رانندگی.{0,10}(?:اپ|اسنپ|تپسی)|اسنپ|تپسی|پیک.{0,8}(?:کار|می‌کنم|میکنم)|شغل گیگ|کار گیگ|اقتصاد گیگ|فریلنس|فریلنسر|فریلنسیم|فریلنسم|مشتری.{0,14}فریلنس|کار آزاد|کارهای آزاد|کار های آزاد|شغل آزاد|درآمد نامنظم|درآمدم نامنظم|دستمزد.{0,6}کم|پلتفرم.{0,8}فریلنس|پلتفرم.{0,8}(?:کار|شغل)|کار پلتفرمی|درآمد کار پلتفرمی|درآمد.{0,12}قابل پیش بینی نیست|درآمد ثابت ندارم.{0,12}(?:اپ|پلتفرم|پیک)|پاره‌وقت|پاره وقت'
      ),
      R['ruleGig']
    ),

    // Housing costs: rent, deposit (ودیعه/رهن), landlord, moving out,
    // house prices. «اجاره» (rent) and «صاحب‌خونه» (landlord) were the
    // most common everyday openings and used to fall to the unknown pool;
    // «قیمت مسکن» (house prices) is the market-level version. Sits
    // above work and money (51 > 50, 35).
    rule(
      'housing',
      51,
      pw(
        'اجاره|ودیعه|رهن|پول پیش|صاحب‌خونه|صاحبخونه|صاحب خونه|مالک خونه|قیمت مسکن|قیمت خونه|قیمت خانه|قیمت‌های مسکن|بحران مسکن|مسکن.{0,6}(?:گرون|قیمت)|خونه بخرم|خانه بخرم|خرید خونه|خرید خانه|برن بیرون|بیرون برن|نصف حقوقم.{0,8}اجاره|اجاره.{0,8}(?:بالا|زیاد|گرون)'
      ),
      R['ruleHousing']
    ),

    rule(
      'feeling',
      30,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:احساس می‌کنم|احساس میکنم|احساس می کنم|حس می‌کنم|حس میکنم|حس می کنم|فکر می‌کنم|فکر میکنم|فکر می کنم)(?!\p{L})\s*(.*)/iu,
      R['ruleFeeling']
    ),

    rule(
      'reasoning',
      25,
      /(?<!\p{L})(?:چونکه|چون)(?!\p{L})\s*(.*)/iu,
      R['ruleReasoning']
    ),

    rule(
      'need',
      25,
      // «میخوام بدونم/بگم/بپرسم» open a question («میخوام بدونم
      // قابلیت‌هات چیه»), they are not need disclosures: the negative
      // lookahead keeps them on the clarification path so the restated
      // intent («قابلیت‌هات چیه») can win.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:نیاز دارم|می‌خواهم|میخواهم|میخوام|می خواهم|دلم می‌خواد|دلم میخواد|دلم می خواد)(?!\s*(?:بدونم|بدانم|بگم|بگویم|بپرسم|ببینم|بفهمم|بدونی|بدانید|بدونید|بپرسی))(?!\p{L})\s*(.*)/iu,
      R['ruleNeed']
    ),

    // The user asks what a word or phrase means ("وداع کردن می‌دونی
    // یعنی چی؟!", "معنی خداحافظ چیه؟"). Answer warmly without
    // pretending to be a dictionary: name the word back and turn it
    // into a conversation. "منظور...", «معنی حرفات...» and the
    // «معنی این...» shapes ("what do you mean by that") are
    // deliberately excluded - those ask Darya to clarify her own
    // words, which needs a different response. The «معنی X چیه؟»
    // branch's exclusions are word-precise: only the exact «معنی
    // زندگی چیه؟» stays on the knowledge shelf (possessive forms like
    // «معنی زندگیم چیه؟» are existential and get the warm
    // word_meaning reflection, matching EN "the meaning of my life"),
    // only possessive «حرف*» forms are clarification («حرفه» the
    // profession and «حرف» the letter stay vocabulary questions), and
    // «خواب*» (sleep) plus «رویا/تعبیر» (dream interpretation) keep
    // their deferral. A farewell-word meaning question can never be
    // hijacked into the exit flow (see isExitCommand).
    rule(
      'word_meaning',
      58,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?!منظور(?:ت|تون| تو| شما)?|این|اون|آن|اینها|آنها)(.+?)\s*(?:می‌دونی|میدونی|می دونی|می‌دونید|میدونید|می دونید|می‌دانی|میدانی|می دانی|می‌دانید|میدانید|می دانید)?\s*(?:یعنی چی|یعنی چه|یعنی چیه|به چه معناست)[!?؟]*$|معنی\s+(?!زندگی(?![\p{L}])|حرف(?:م(?:ون)?|ت|ات|ش(?:ون)?|هام|هات|هاش|هایت|مان|تان|شان| هام| هات| هاش| هایت)|منظور(?:ت|تون| تو| شما)?|خواب[\p{L}]*|رویا[\p{L}]*|تعبیر[\p{L}]*|این|اون|آن|اینها|آنها|اینا|ونا)(.+?)\s*(?:چیه|چیست|چی|چِه)[!?؟]*$/iu,
      R['ruleWordMeaning']
    ),

    // The user asks Darya to ask them a question ("یک سوال از من بپرس",
    // "سوال نمی‌پرسی؟!"). Darya complies with a real, gentle question.
    rule(
      'ask_me_question',
      59,
      pw(
        'سوال نمی‌پرسی|سوال نمیپرسی|سوال نمی پرسی|چرا سوال نمی‌پرسی|چرا سوال نمیپرسی|چرا سوال نمی پرسی|سوال بپرس|بپرس ببینم|از من بپرس|ازم بپرس|یک سوال از من بپرس|یه سوال از من بپرس|بپرس از من|بپرس ازم|سوال بپرس از من|یه سوال خوب بپرس|یه سوال جالب بپرس|یه سوال بامزه بپرس|یک سوال خوب بپرس|یک سوال جالب بپرس|سوال خوب بپرس|سوال جالب بپرس|سوال بامزه بپرس|سوال خوبی ازم بپرس|سوال خوبی از من بپرس'
      ),
      R['ruleAskMeQuestion']
    ),

    // The user does not know how to begin ("چطور شروع کنم؟",
    // "نمی‌دونم چی بگم"). Darya lowers the bar and offers easy openers
    // instead of mirroring the uncertainty back.
    rule(
      'opener_help',
      58,
      pw(
        'چطور شروع کنم|چطوری شروع کنم|چجوری شروع کنم|چطور باید شروع کنم|چطوری باید شروع کنم|چجوری باید شروع کنم|از کجا شروع کنم|از چی شروع کنم|نمی‌دونم چطور شروع کنم|نمیدونم چطور شروع کنم|نمی‌دونم چطور باید شروع کنم|نمیدونم چطور باید شروع کنم|نمی‌دونم چی بگم|نمیدونم چی بگم|نمی‌دونم چه بگم|نمیدونم چه بگم|چه بگویم|چه بگم|چی بگم|بلد نیستم شروع|کمکم کن شروع کنم|به من بگو چطور شروع|نمیدونم چطوری شروع|نمیدونم چطوری باید شروع'
      ),
      R['ruleOpenerHelp']
    ),

    // The user tells Darya to improve herself ("خودت رو بهتر کن",
    // "باهوش‌تر شو"). Acknowledge humbly instead of deflecting with
    // humor or a generic line.
    rule(
      'self_improvement',
      55,
      pw(
        'خودت رو بهتر|خودت را بهتر|خودتو بهتر|بهتر و عاقل|عاقل‌تر|عاقلتر|عاقل تر|هوشمندتر|باهوش‌تر بشی|باهوشتر بشی|باهوش تر بشی|باهوش‌تر شو|باهوشتر شو|باهوش تر شو|بهتر شو|بهتر بشو|ارتقا بده|ارتقا بدهی|ارتقا بدی|نقش خودت رو فراموش نکن|نقشت رو فراموش نکن|نقش خودت را فراموش نکن|محدودیت‌هات|محدودیتهات|محدودیتت رو|محدودیتت را|محدودیت‌هایت|خودت رو بهتر معرفی|خودتو بهتر معرفی|خودت را بهتر معرفی|با (?:جی‌پی‌تی|جیپیتی|چت‌جی‌پی‌تی|چت‌جی‌پیتی|چتجیپیتی|کلاد|جمنای|گراک|دیپ‌سیک|GPT|Claude|chatgpt) اشتباه'
      ),
      R['ruleSelfImprovement']
    ),

    // "چی‌کار کنم؟!" (what should I do?) must answer the help-seeking
    // intent instead of tripping the work rule, whose bare "کار" matches
    // the normalized "چی کار کنم". This rule sits just above work so the
    // general what-to-do request wins over the work-topic reading.
    rule(
      'what_do_i_do',
      52,
      pw(
        'چی کار کنم|چیکار کنم|چه کار کنم|چی کار بکنم|چیکار بکنم|چه کاری بکنم|چی بکنم|چی کار باید بکنم|چیکار باید بکنم|چه کار باید بکنم|چه کاری باید بکنم|چه باید بکنم|راه‌حل نمی‌دی|راه حل نمی‌دی|راه حل نمیدی|راه‌حل نمیدی|راهحل نمیدی|راهکاری نداری|راهکار نمی‌دی|راهکار نمیدی|راهکارنمیدی'
      ),
      R['ruleWhatDoIDo']
    ),

    // The user answers "yes but I do not know which one" after Darya
    // offered several topics. Gently help them pick instead of falling
    // into the evasive deep-question pool.
    rule(
      'unsure_topic',
      52,
      pw(
        'نمی‌دونم روی کدوم|نمیدونم روی کدوم|نمی دونم روی کدوم|نمی‌دونم کدوم|نمیدونم کدوم|نمی دونم کدوم|مطمئن نیستم کدوم|مطمین نیستم کدوم|کدومش رو انتخاب کنم|کدومش را انتخاب کنم|کدومش رو بگم'
      ),
      R['ruleUnsureTopic']
    ),

    rule(
      'knowledge',
      55,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:سقراط|رواقی|رواقی‌گری|رواقی گری|رواقیگری|ارسطو|یونگ|نیچه|گاندی|ماندلا|چرچیل|زرتشت|فلسفه|تمرکز|تمرکز کنم|بهتر یاد بگیرم|بهتر درس بخوانم|ارتباط بهتر|خلاقیت|قفل خلاقیت|مدیریت استرس|استرس|فرسودگی|آرام‌شدن|آرام شدن|آرامشدن|خودشفقتی|مهربانی با خود|منتقد درونی|خودانتقادی|حل تعارض|اختلاف|ارتباط بدون خشونت|تصمیم‌گیری|تصمیم گیری|تصمیمگیری|تصمیم|انتخاب بین|تاب‌آوری|تاب آوری|تابآوری|مقاومت|مقاوم|مقاوم‌تر|مقاومتر|انعطاف‌پذیری|انعطاف پذیری|بازگشت به زندگی|بازگشتن|بخشش|ببخشم|ببخش|بخشیدن|رها کردن|رها کنم|معنای زندگی|معنی زندگی|هدف در زندگی|پیدا کردن هدف|وجودی|معنادار|معنوی|روابط|رابطه|ارتباط عاطفی|شغل|حرفه|پیشرفت شغلی|رضایت شغلی|اضطراب|مدیریت اضطراب|نگرانی|فکر زیاد|ذهن\u200Cآگاهی|ذهن آگاهی|ذهنآگاهی|سوگ|فقدان|بیکار میکنه|بیکار کنه|بیکار میکنن|بیکار کنن|هوش مصنوعی|جایگزین.{0,8}(?:شغل|انسان|کارگر)|طراح‌ها.{0,12}بیکار|نویسنده‌ها.{0,12}بیکار|نقشه راه برنامه نویسی|دیباگ|گردش کار گیت|pull request|ای پی آی|فرانت اند|بک اند|فول استک|تست واحد|تست نرم افزار|کد ریویو|کدنویسی امن|دیپلوی|ورد|فهرست خودکار|اکسل|فرمول اکسل|پیوت تیبل|پاورپوینت|اوت لوک|گوگل داکس|گوگل شیت|رزومه|پورتفولیو|نمونه کار|مصاحبه برنامه نویسی|مذاکره حقوق|مقایسه محصول|خرید هوشمند|لپ تاپ دست دوم|گارانتی|مرجوعی|ابزار هوش مصنوعی|ساخت تصویر|تولید عکس|ساخت ویدیو|تولید ویدیو|ابزار کدنویسی هوش مصنوعی|ساخت پادکست|سند و اسلاید|گوگل اسلاید|مایکروسافت 365|لیبره آفیس|هوش مصنوعی نوجوان|هوش مصنوعی کودک|هوش مصنوعی سالمند|فناوری سالمند|محافظه کاری|محافظه کار|لیبرالیسم|لیبرال|سوسیالیسم|سرمایه داری|کمونیسم|آنارشیسم|لیبرتارینیسم|فاشیسم|پوپولیسم|ناسیونالیسم|ملی گرایی|جهانی گرایی|ترقی خواهی|دموکراسی|مردم سالاری|اومانیسم|انسان گرایی|پراگماتیسم|اپیکوریسم|هدونیسم|لذت گرایی|فایده گرایی|سودگرایی|وظیفه گرایی|اخلاق فضیلت|خوش بینی|بدبینی|واقع گرایی|مینیمالیسم|ایکیگای|وابی سابی|هوگه|لاگوم|ذن|راه میانه|شک گرایی|شکاکیت|تجربه گرایی|عقل گرایی|جبرگرایی|اختیار|ریسک وجودی|لانگ ترمیسم|نوع دوستی موثر|تواضع فکری|ذهن باز|سکولاریسم|فمینیسم|محیط زیست گرایی|تروریسم|افراطی گری|ذهنیت رشد|ذهنیت ثابت)(?!\p{L})/iu,
      R['ruleKnowledge']
    ),

    // Learning/career-path advice: «الان بهتره React یاد بگیرم یا
    // Vue؟», «می‌خوام استریمر بشم»، «فونت فارسی خوب برای وب چی پیشنهاد
    // می‌دی؟». Reflective, honest pool instead of a fake prediction; the
    // knowledge override still answers when a real entry matches. Sits
    // above opener_help (58) so a career start question (استریمر/یوتیوبر)
    // never gets the canned conversation-opener line, while plain
    // «از کجا شروع کنم؟» still routes to opener_help.
    rule(
      'learning_advice',
      60,
      // Career aspirations with the subjunctive («می‌خوام برنامه نویس
      // بشم») also land here: the work rule's negative lookahead keeps
      // them off the work thread, so without this branch they would fall
      // to the generic pool. First-person forms only; past tense
      // («شدم») stays a lived work disclosure.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:یاد بگیرم|یادبگیرم|یاد بگیر|یادگیری|استریمر|یوتیوبر|پورتفولیو|رزومه|بهتره.{0,16}?(?:یاد بگیرم|یادبگیرم|یاد بگیر|انگلیسی|زبان|مهارت|بخوانم|بخونم|استریم)|پیشنهاد می‌دی|پیشنهاد میکنی|پیشنهاد میدی|فونت\s*.{0,20}?(?:خوب|پیشنهاد|بهتر|وب|مناسب|معروف|زیبا)|راست‌چین|راست چین|راستچین|طراحی وب|طراحی سایت|برنامه‌نویسی|برنامه نویسی|کدنویسی|ری‌اکت|پایتون|کدوم زبان|کدوم فریم‌ورک|کدوم رشته|کدوم مهارت|چی یاد بگیرم|چه چیزی یاد بگیرم|(?:برنامه‌نویس|برنامه نویس|طراح|گرافیست|کدنویس|بازی‌ساز|بازی ساز).{0,14}?(?:شوم|بشم|بشیم|بشویم))(?!\p{L})/iu,
      R['ruleLearningAdvice']
    ),

    // A direct comparison question ("X بهتره یا Y؟", «بین X و Y کدوم
    // بهتره؟», "which is better, football or wrestling?", "toyota or
    // bugatti?"). The transcript probe showed these falling to the
    // generic "depends on your situation" line; a dedicated rule keeps
    // the comparison frame and asks for the criterion that matters,
    // which is more useful than an evasive dodge.
    rule(
      'comparison',
      61,
      // Comparison structures: «فوتبال بهتره یا کشتی», «بین X و Y کدوم
      // بهتره», «کدوم بهتره». Sits ABOVE learning_advice (60) so a
      // two-option comparison never falls to the generic "depends on
      // your situation" line, and below meta_feedback (62). A genuine
      // knowledge comparison (react vs vue) still resolves through the
      // knowledge override, which runs after rules match.
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:بین.{0,24}(?:و|یا).{0,24}(?:کدوم|کدام|بهتر)|(?:کدوم|کدام).{0,6}بهتر|(?:بهتره|بهتر است|بهترست).{0,10}یا|(?:بهتره|بهتر است).{0,4}چیه|مقایسه.{0,16}(?:کن|کنم))(?!\p{L})/iu,
      R['ruleComparison']
    ),

    rule(
      'professional_boundary',
      90,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:مشاوره پزشکی|تشخیص|دارو|مشاوره حقوقی|وکیل|دادگاه|مشاوره مالی|سرمایه‌گذاری|سرمایهگذاری|مالیات|وام)(?!\p{L})/iu,
      R['ruleProfessionalBoundary']
    ),

    rule(
      'recap',
      80,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:چی گفتم|چه چیزهایی گفتم|خلاصه کن|یادم نیست چی گفتم|مرور کن|امروز.{0,12}(?:چی|چه).{0,4}(?:صحبت|گفتیم)|راجع.{0,4}چی.{0,4}(?:صحبت|گفتیم)|درباره.{0,4}چی.{0,4}(?:صحبت|گفتیم)|چه چیزهایی.{0,4}(?:گفتیم|صحبت کردیم)|از کجا شروع.{0,4}(?:کردیم|شده)|کجا بودیم)(?!\p{L})/iu,
      R['ruleRecap']
    ),

    // The user asks to change the subject ("بیا راجع به یه چیز دیگه
    // صحبت کنیم", "بحث رو عوض کن", "بریم سراغ یه موضوع دیگه"). Darya
    // follows the lead with a light bridge instead of treating the
    // request as a topic disclosure or falling through to a fallback.
    rule(
      'topic_change',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:بحث.{0,4}(?:عوض|تغییر)|موضوع.{0,4}(?:عوض|تغییر|دیگه|دیگر)|بریم.{0,6}(?:یه|یک).{0,4}(?:چیز|موضوع|بحث)|چیز دیگه|چیزه دیگه|موضوع دیگه|یه بحث دیگه|یک بحث دیگر|صحبت.{0,4}(?:عوض|تغییر)|بریم سراغ|برویم سراغ|عوض کنیم|عوض کن)(?!\p{L})/iu,
      R['ruleTopicChange']
    ),

    // The user apologizes ("ببخشید", "عذر می‌خوام", "متاسفم"). A warm
    // acceptance beats the "too short to understand" ambiguous-input
    // fallback, so a bare "ببخشید" is never answered with "کمی بیشتر
    // توضیح بده". The pool stays brief and moves on instead of dwelling
    // on the apology.
    rule(
      'apology',
      64,
      pw(
        'ببخشید|ببخش|عذر می‌خوام|عذر میخوام|عذر می خوام|معذرت می‌خوام|معذرت میخوام|معذرت می خوام|عذر می‌خواهم|عذر می‌خواهم|عذر میخواهم|معذرت می‌خواهم|معذرت میخواهم|پوزش می‌طلبم|پوزش میطلبم|متاسفم|متأسفم|شرمنده‌ام|شرمنده ام|شرمندهام|شرمند هام|ببخشین'
      ),
      R['ruleApology']
    ),

    // The user notices Darya repeating herself («بازم همینو گفتی», «داری
    // خودتو تکرار میکنی», «جواب تکراری دادی») in any mood, from annoyed
    // to playful. Darya acknowledges it plainly, promises to vary, and
    // invites a fresh angle instead of dodging. Sits above meta_feedback
    // (62) so a repetition complaint always gets this reply.
    rule(
      'repeat_complaint',
      64,
      pw(
        'بازم همینو گفتی|باز هم همینو گفتی|بازم همینو میگی|باز هم همینو میگی|دوباره همینو گفتی|دوباره گفتی|همینو قبلا گفتی|همینو قبلاً گفتی|قبلا گفتی|قبلاً گفتی|داری تکرار میکنی|داری تکرار می‌کنی|داری خودتو تکرار میکنی|داری خودتو تکرار می‌کنی|خودتو تکرار کردی|داری جواب تکراری میدی|جواب تکراری دادی|جوابات تکراریه|جواب هات تکراریه|همش یه حرفو میزنی|همش یه جواب میدی|تکراری گفتی|تکراری میگی|بازم همون جواب|بازم همون حرف|چرا جوابات تکراریه|جوابت مثل قبله'
      ),
      R['ruleRepeatComplaint']
    ),

    // Feedback aimed at Darya herself: how she quotes words, how well she
    // understands the message chain, how "smart" she is, requests for a
    // swear-word dictionary, open-question style, and so on. These turns
    // deserve a humble acknowledgement even when worded harshly, so this
    // topic is also excluded from the frustration/harassment override in
    // the engine.
    rule(
      'meta_feedback',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:باید.{0,20}?(?:درک کنی|بفهمی|متوجه بشی|متوجه شی|باهوش.{0,4}تر|عاقل.{0,4}تر|بهتر)|متن ورودی|پیام ورودی|بازخورد|دیکشنری|نقل و قول|نقل‌وقول|نقل وقول|نقل قول|نقل‌قول|نقلوقول|کوت کردی|زنجیره.{0,10}(?:پیام|حرف)|پیام.{0,8}گذشته|مکالمه.{0,8}گذشته|ارتقا.{0,4}(?:بده|بدهی|شو)|مثل.{0,10}(?:طوطی|میمون)|تقلید.{0,4}(?:کنی|کردن)|سوال.{0,8}(?:باز|چالش)|نقطه.{0,4}می.{0,4}(?:ذاری|گذاری)|یعنی چی که|بررسی کن|هوشت|هوش تو|فهمیدی چی|نفهمیدی|درک نمی‌کنی|درک نمیکنی|درک نمیکنه|متوجه نمی‌شی|پیچوندی|پیچ دادی|جوابمو نداد|جوابم را نداد|ندادی جواب|جوابم را ندادی|جواب.{0,14}(?:سوال|سؤالم|سوالمو|سوالمن).{0,8}(?:نمیدی|ندادی|نمیدادی|نمیدی)|سوال.{0,10}(?:جواب.{0,6})?(?:نمیدی|ندادی|نمیدادی)|جواب.{0,8}(?:نمیدی|نمیدادی)|داری فرار می‌کنی|فرار می‌کنی از جواب|حرفمو نمی‌فهمی|حرفمو نمیفهمی|منظورم را نمی‌فهمی|منظورمو نمیفهمی|اصلا نمیفهمی|اصلاً نمیفهمی|اصلا نمیفهمم|داری منو دست می‌ندازی|گوش نمی‌دی|گوش نمیدی|گوش نمیکنی|گوش نمی‌کنی|گوش نمی‌دادی|گوش نمیدادی|اذیتم میکنی|اذیتم می کنی|اذیت می کنی|آزارم میدی|آزارم می‌دی|می‌ترسونی|میترسونی|تهدیدم میکنی|تهدیدم می کنی|تهدیدم کردی|تهدیدم کردید|داری اذیتم میکنی|داری اذیتم می کنی|مبهم و غیردوستانه|غیردوستانه صحبت|با خودت حرف میزنی|با خودت حرف می‌زنی|با خودت حرف می زنی|خارج از بحث داری|انگار با خودت|مبهم صحبت میکنی|مبهم صحبت می کنی|مبهم حرف میزنی|مبهم حرف می‌زنی|مبهم حرف می زنی|قبلا.{0,10}(?:باهوش|باهوش‌تر|هوشمندتر|هوشمند)|(?:باهوش‌تر|باهوشتر|هوشمندتر|باهوش تر).{0,12}(?:بودی|بودید)|انگار.{0,6}(?:باهوش‌تر|باهوشتر|هوشمندتر)|(?:باهوش‌تر|باهوشتر) بودی|(?:قبلا|قبل‌ها|سابقا).{0,10}(?:خوب|بهتر|باهوش) بودی)(?!\p{L})/iu,
      R['ruleMetaFeedback']
    ),

    // The user asks who made Darya, or asks about her origin, ELIZA, or
    // MIT. Darya answers with her own short, curiosity-engaging intro:
    // built by Artin as a tribute to ELIZA, the first chatbot, from MIT.
    // The high priority keeps "کار" inside a phrase like "چی کار می‌کرد؟"
    // from being read as a work-topic disclosure. The bare "آرتین"
    // alternative carries a negative lookahead so a user who SHARES the
    // maker's name is read as disclosing their own identity ("من آرتین
    // هستم", "اسمم آرتینه", "منو آرتین صدا کن") rather than asking
    // about Darya's origin; the «صدا کن» form is excluded so a call-me
    // disclosure never records an about_eliza topic (the EN side
    // excludes "call me Artin" via lookbehind). A deliberate tradeoff:
    // the yes/no form "آرتین هست که منو ساخت؟" is blocked too, which is
    // acceptable since it is a yes/no question.
    rule(
      'about_eliza',
      66,
      pw(
        'تو رو کی|تو را کی|کی تو رو|کی تو را|کی ساخته|کی ساختت|کی ساختی|کی ساخته شدی|چطور ساخته شدی|چطوری ساخته شدی|سازنده تو|سازنده‌ات|سازنده دریا|آرتین(?!\\s*(?:م|ه|هستم|هستمش|هست|است|ی|صدا کن)(?!\\p{L}))|الیزا|ایلیزا|ام آی تی|اِم آی تی|دکتر وایزنبام|وایزنبام|هدف از ساخت|هدف از ساختن|چرا ساخته شدم'
      ),
      R['ruleAboutEliza']
    ),

    // The user compliments something Darya said or did ("قشنگ گفتی",
    // "آفرین", "سوال خوبی بود", "از این عبارت خوشم می‌آد"). Warm
    // acknowledgement instead of a topic fallback. Kept below about_eliza
    // so a compliment about Darya's self-introduction still routes to the
    // origin story.
    rule(
      'compliment_darya',
      58,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:خوشم (?:میاد|می‌آد|میآد|اومد|آمد)|قشنگ (?:گفتی|جواب دادی|بود|شد)|این (?:جمله|حرف|جواب|پاسخ|عبارت) (?:عالی|قشنگ|خوب|خوبه|عالیه) بود|جوابت.{0,8}(?:عالی|خوب)ه|خوب گفتی|حرف قشنگی زدی|این که گفتی (?:عالی|خوب|قشنگ) بود|حرفت به دلم نشست|این حرف خیلی به دلم نشست|آفرین|احسنت|دمت گرم|سوال.{0,4}(?:خوبی|خوبه|عالیه) بود|سوال خوبی پرسیدی|جواب خوبی دادی|خوب جواب دادی|باهوشی|هوشت بالاست)(?!\p{L})/iu,
      R['ruleComplimentDarya']
    ),

    // The user corrects Darya's misreading ("مگه من راجع به کار صحبت
    // کردم؟!", "منظورم این نبود"). Acknowledge and invite a restated
    // version instead of re-triggering the same topic rule.
    rule(
      'misread_correction',
      56,
      pw(
        'مگه من راجع|مگه من درباره|مگه من گفتم|مگه من صحبت کردم|من گفتم درباره|من گفتم راجع|من صحبت نکردم|من نگفتم|منظورم نبود|منظور من نبود|منظورم این نبود|منظورم این نیست|کجای حرفم|کجای حرف من|بد فهمیدی|بدفهمیدی|اشتباه گرفتی|درست نفهمیدی'
      ),
      R['ruleMisreadCorrection']
    ),

    // ------------------------------------------------------------------
    // New rules from simulation findings (Persian parity).
    // ------------------------------------------------------------------

    // Impaired driving: when the user mentions drinking/being impaired
    // and then mentions driving, deliver a caring safety response.
    // High priority (92) to win over need/work/family rules.
    rule(
      'impaired_driving',
      92,
      pw(
        'ماشین.{0,20}(?:مست|مشروب|الکل|خوردم|خوردهم|عرق)|مست.{0,20}ماشین|رانندگی.{0,20}(?:مست|خوردم)|مشروب.{0,20}(?:رانندگی|ماشین)|میخوام.{0,10}برم.{0,10}ماشین.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|می‌خوام.{0,10}برم.{0,10}ماشین.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|میخوام.{0,10}رانندگی.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|می‌خوام.{0,10}رانندگی.{0,10}(?:خوردم|خوردهم|مشروب|الکل|عرق)|خوردم.{0,10}ماشین|خوردم.{0,10}رانندگی'
      ),
      R['ruleImpairedDriving']
    ),

    // Medical symptoms: chest pain, shortness of breath, etc. should
    // route to a caring response that encourages seeing a doctor.
    rule(
      'health_symptoms',
      80,
      pw(
        'درد.{0,10}سین|سین.{0,6}درد|تنگی نفس|تپش قلب|سردرد شدید|سرفه.{0,10}(?:شدید|خون|خونی)|درد.{0,4}(?:شکم|معده)|تب شدید|سرگیجه|حالت تهوع|ضعف شدید|بیحالی|درد.{0,4}(?:پشت|کمر).{0,8}سینه'
      ),
      R['ruleHealthSymptoms']
    ),

    // Pet loss: the user mentions the death of a pet. The grief is real
    // and specific, so a dedicated pool answers with empathy, not
    // ignorance.
    rule(
      'pet_loss',
      54,
      pw(
        'گربهم|گربه‌ام|گربهام|سگم|سگ‌ام|سگام|پرندهم|حیوونم|حیوانم|ماهیام|ماهی‌ام|خوکچه|همستر|خرگوشم|پتم|پت.{0,4}(?:من|ام|م)',
        // A gap-tolerant tail: «سگم دیروز مرد» puts the death verb after
        // a time word, which the old \\s* tail missed, so the probe fell
        // to the unknown pool right when empathy was needed most.
        '(?:.{0,24}?)(?:مرد|مرده|مردی|مردیم|فوت|فوت کرد|از دست دادم|از دنیا رفت|تلف شد|نیست|دیگه نیست|دیگر نیست|بود|بوده)'
      ),
      R['rulePetLoss']
    ),

    // Pet care and behavior worries («گربه‌م بعد از جابه‌جایی قایم
    // میشه», «سگم دیگه غذا نمی‌خوره»): practical reassurance, not
    // grief (pet_loss rules above own death) and not the unknown pool.
    // The normalized matcher turns «جابه‌جایی» into «جابه جایی» and
    // «قایم» into «قایم», so space forms are included.
    rule(
      'pet_care',
      52,
      pw(
        // Behavior or care worries anchored to a named pet: hiding,
        // not eating, being alone, or needing the vet. The pet word
        // must come FIRST so «تنهام» (I feel lonely) never matches
        // through a bare «تنها» tail: a pet-care reply to a lonely
        // person would be a miss. The gap allows «بعد از جابه‌جایی»
        // between the pet and the behavior. The matcher normalizes
        // half-spaces (گربه‌م) to regular spaces (گربه م), so every pet
        // word carries both spellings.
        '(?:گربهم|گربه م|گربه‌ام|گربه ام|گربهام|سگم|سگ م|سگ‌ام|سگ ام|سگام|حیوونم|حیوانم|پرندهم).{0,22}(?:قایم|قایم میشه|قایم شده|غذا نمی‌خوره|غذا نمیخوره|غذا نمی خوره|تنهاست|تنهاس|تنها بمونه|تنها بمونن|تنها میمونه|تنها میمونن|تنها بذارم|تنها بگذارم|تنها باشه|نگرانم|بیماره|بیمار شده|دامپزشک|ناخوشه|ناخوش شده|میزنه|پاره میکنه|گریه میکنه|ناله میکنه|حالش خوب نیست)' +
          // Pet-word-only worries: «گربهم مریضه» stays short.
          '|(?:گربهم|گربه م|گربه‌ام|گربه ام|گربهام|سگم|سگ م|سگ‌ام|سگ ام|سگام|حیوونم|حیوانم|پرندهم).{0,10}(?:مریضه|ناخوشه|بیماره|تنهاس|تنهاست)' +
          // Behavior with no owner-feeling marker: «سگم قایم میشه» and
          // «گربه‌م غذا نمی‌خوره» are the short everyday forms.
          '|(?:گربهم|گربه م|گربه‌ام|گربه ام|گربهام|سگم|سگ م|سگ‌ام|سگ ام|سگام).{0,8}(?:قایم|غذا نمی‌خوره|غذا نمیخوره|غذا نمی خوره)'
      ),
      R['rulePetCare']
    ),

    // Pet-loss dismissal: «فقط یه حیوون بود» (it was just a pet) or
    // «همه می‌گن فقط یه سگ بود» (everyone says it was only a dog). The
    // possessive pet rule above needs a named companion (سگم, گربهم);
    // dismissal phrasings name no companion, so they get their own
    // branch into the same empathy pool instead of the unknown pool.
    rule(
      'pet_loss',
      53,
      pw(
        'فقط یه حیوون|فقط یه حیوان|فقط یک حیوان|فقط یه سگ|فقط یه گربه|فقط یه پرنده|فقط یه ماهی|فقط یک سگ|فقط یک گربه|حیوون بود|حیوان بود'
      ),
      R['rulePetLoss']
    ),

    // Everyday body pain («دستم درد میکنه», «گلوم درد میکنه»): a
    // caring reply that takes the complaint seriously, asks a gentle
    // follow-up, and points to a doctor when it is severe or persistent.
    // Darya never diagnoses or prescribes (see AGENTS.md), and this must
    // beat the word-repetition override that used to quote «درد» back at
    // the person across turns.
    rule(
      'health_pain',
      55,
      // Body-part + pain phrasings in their NORMALIZED forms: the
      // half-space normalizer turns ZWNJ into a plain space («معده‌ام»
      // arrives as «معده ام») and binds the می prefix («می کنه» arrives
      // as «میکنه»), so every alternative carries the normalized
      // spelling (AGENTS.md dual-spelling rule).
      pw(
        // «دلم» is deliberately NOT in this body list: «دلم گرفته» is
        // the sadness idiom ("my heart is heavy"), not a pain report,
        // and it would steal the sadness thread. Genuine heart pain
        // still lands via the «دلم درد می‌کنه» branch below and the
        // bare «دل درد» phrasing.
        '(?:دستم|دست چپم|دست راستم|دستام|پام|پامون|پا چپم|پا راستم|سرم|پشتم|کمرم|شانه\\s?ام|شانه\\s?م|شونه\\s?ام|گردنم|گلوم|دندونم|دندونام|دندانم|معده\\s?ام|معده\\s?م|زانوم|مچم|آرنجم|انگشتم|سینم|کتفم|پهلو\\s?ام|پهلو\\s?یم|پهلوم)' +
          '\\s*(?:درد میکنه|درد می‌کنه|درد می کنه|درد میکنم|درد می‌کنم|درد می کنم|درد دارم|درد گرفته|درد میگیره|درد می‌گیره|درد می گیره|درد میگیرد|میسوزه|میسوزد|بی‌حس شده|بی حس شده|وخ کرده|گرفته|میگیره|می‌گیره|آبسه کرده)|' +
          '(?:دستم|دست چپم|دست راستم|پشتم|کمرم|سرم|گلوم|گردنم|زانوم|مچم|معده\\s?ام|دلم)\\s*(?:ولی\\s*)?(?:هنوز\\s*)?(?:درد میکنه|درد می‌کنه|درد می کنه|درد دارم|درد میگیره|درد می‌گیره)|' +
          '(?:دستم|دست چپم|دست راستم|دستام|پام|سرم|پشتم|کمرم|شانه\\s?ام|شونه\\s?ام|گردنم|زانوم|مچم|معده\\s?ام).{0,18}?(?:درد میکنه|درد می‌کنه|درد می کنه|درد دارم|درد میگیره|درد می‌گیره|میگیره|می‌گیره)|' +
          // «دل دردم گرفته» (a genuine heart/chest ache) pairs the
          // idiom word with the pain verb, unlike «دلم گرفته» (the
          // sadness idiom). The «درد» before «دل» keeps the two apart.
          'دل دردم گرفته|دل درد گرفت|قلبم درده|قلبم درد میکنه|' +
          'درد.{0,6}(?:دست|پا|سر|پشت|کمر|شانه|شونه|گردن|گلو|دندان|دندون|معده|دل|زانو|مچ|آرنج|انگشت|سینه|کتف)|' +
          'سردرد|میگرن|میگرین|سر.{0,3}درد دارم|' +
          // Eye strain is an everyday body complaint the broad health
          // rule's body-change list never matched («چشمام خسته شده»);
          // acne and hair loss stay on the health rule's body-change
          // block so «پوستم جوش زده» and «ریزش مو دارم» keep the health
          // thread (never the pain pool).
          '(?:چشمام|چشمان|چشمم)\\s*(?:خسته|خسته شده)|' +
          // Fatigue in every spelling: «چرا همیشه خسته‌ام» keeps its
          // ZWNJ, but the no-ZWNJ «چرا همیشه خستهام» normalizes to
          // «خست هام» (a space split), so the pattern accepts both
          // «خسته ... ام» and «خست ... هام» stems.
          'چرا.{0,12}(?:خسته|خست).{0,4}(?:ام|هستم|هام)|همیشه.{0,6}(?:خسته|خست).{0,4}(?:ام|هستم|هام)|همش (?:خسته|خست).{0,4}(?:ام|هستم|هام)|همش خستم|^خستم$|^خسته‌ام$|^خسته ام$'
      ),
      R['ruleHealthPain']
    ),

    // The user asks about Darya herself («آیا پدر و مادر داری؟!», «تو
    // برای چی ساخته شدی؟», «در چه حوزه‌هایی ضعف داری؟»). These used to
    // fall into the family rule's {captured} echo («درباره‌ی و مادر داری
    // بیشتر برایم بگویید» - the transcript mangling) or the honest-unknown
    // pool. A dedicated rule answers with transparent, self-aware lines
    // about what Darya is (an offline rule-based companion), her limits,
    // and her origin - never pretending to be human. Outranks family (50)
    // so «پدر و مادر داری» stays about Darya, and beats work (50).
    rule(
      'darya_browse',
      70,
      // eslint-disable-next-line max-len
      /(?:می ?تونی وب رو ببینی|میتونی وب رو ببینی|می ?تونی قیمت (?:روز|زنده) رو ببینی|به اینترنت دسترسی داری|می ?تونی سایت باز کنی)/u,
      R['ruleDaryaBrowse']
    ),
    rule(
      'darya_limits',
      69,
      // eslint-disable-next-line max-len
      /(?:چه کمک هایی (?:نمی تونی|نمیتونی) بکنی|چه کارهایی (?:نمی تونی|نمیتونی) بکنی|چه چیزهایی (?:نمیدونی|نمی دونی)|کی نباید به جوابت اعتماد کنم|کی باید جوابت رو بررسی کنم|می تونی وب رو ببینی|میتونی وب رو ببینی)/u,
      R['ruleDaryaLimits']
    ),
    rule(
      'darya_consciousness',
      69,
      /(?:واقعا خودآگاهی|واقعاً خودآگاهی|خودآگاه هستی|آگاهی داری|برای خودت فکر می کنی|برای خودت فکر می‌کنی)/u,
      R['ruleDaryaConsciousness']
    ),
    rule(
      'darya_self',
      66,
      pw(
        'پدر و مادر داری|مادر داری|پدر داری|خانواده داری|چرا ساخته شدی|برای چی ساخته شدی|برای چه ساخته شدی|برای چی ساخته شد|چرا وجود داری|چرا هستی|برای چی وجود داری|هدف تو چیه|هدف تو چیست|وظیفه تو چیه|وظیفه تو چیست|چی کاره ای|چیکاره ای|چیکاره‌ای|ضعف.{0,4}داری|چه ضعفی داری|چقدر دانش|گستره.{0,6}دانش|قفسه دانش|چقدر اطلاعات|چقدر بلدی|چقدر میدونی|چقدر می‌دونی|چه چیزهایی نمیدونی|چه چیزهایی نمی‌دونی|چه کمکی نمی‌تونی بکنی|چه کمک هایی نمی تونی بکنی|چه کمک هایی نمیتونی بکنی|چه کارهایی نمی‌تونی بکنی|چه کارهایی نمی تونی بکنی|کی نباید به جوابت اعتماد کنم|کی باید جوابت رو بررسی کنم|چند سالته|چند سالته‌ای|چند سالته ای|سن تو چنده|تاریخ تولدت|تولد.{0,4}تو چیه|کجا زندگی میکنی|کجا زندگی می‌کنی|تو اهل کجایی|اهل کجایی تو|تو خواب می‌بینی|تو می‌خوابی|تو غذا می‌خوری|هوش مصنوعی هستی|ربات هستی|ربات نیستی|تو رباتی|ماشین هستی|آدم نیستی|انسان نیستی|ساخته شد(?:ی+)|آیا.{0,6}خودآگاه.{0,4}(?:هستی|داری|هستم)|خودآگاه.{0,4}(?:هستی|داری)|آگاه.{0,6}(?:به خودم|از خودم|از خودت)|هوشیار هستی|آگاهی داری|فکر می‌کنی.{0,6}(?:برای خودت|خودت)|فکر میکنی.{0,6}(?:برای خودت|خودت)|آیا.{0,6}(?:فکر می‌کنی|آگاهی|هوشیار)|هوشیاری(?!\\s*(?:یعنی|معنی|چیه|چیست|چی|به چه|چه معنا))(?!\\p{L})|تو هوشیاری|آیا هوشیاری|آگاه هستی|خودآگاه هستی|احساس داری|احساسات داری|عاطفه داری|تو احساس داری|آیا احساس داری|آیا عاطفه داری|میتونی عاشق بشی|می‌تونی عاشق بشی|می تونی عاشق بشی|میتونی عاشق بشم|می‌تونی عاشق بشم|عاشق میشی|عاشق می‌شی|میتونی دوستم داشته باشی|می‌تونی دوستم داشته باشی|آیا میتونی عاشق بشی|آیا می‌تونی عاشق بشی'
      ),
      R['ruleDaryaSelf']
    ),

    // Joke-count question («چندتا جک بلدی؟») deserves a real answer, not
    // another joke. Runs above the joke rule (60) so the count is given
    // before the pool can fire.
    rule(
      'joke_count',
      62,
      // eslint-disable-next-line max-len
      /(?<!\p{L})(?:چند(?:تا| تا)?\s*(?:جک|جوک|لطیفه)|تعداد.{0,6}(?:جک|جوک)|چقدر.{0,4}(?:جک|جوک)|(?:جک|جوک|لطیفه).{0,6}(?:چندتا|چند تا|چندتاست|چقدر))(?!\p{L})/iu,
      R['ruleJokeCount']
    ),

    // The user demands a richer joke shelf («تو باید حداقل ۲۰-۳۰تا جک
    // خوب داشته باشی», «جک‌های بیشتری بلد باش»): an honest offline
    // acknowledgment naming the actual count plus the per-session
    // no-repeat promise, instead of the interesting-question line that
    // read as dodging the request.
    rule(
      'joke_count',
      62,
      pw(
        'جک.{0,10}(?:بیشتری|زیادتری|بیشتر)|حداقل.{0,6}(?:۲۰|30|۳۰|20).{0,8}(?:تا|تایی).{0,4}جک|۲۰.{0,4}تا.{0,4}جک|جک.{0,14}داشته باشی|جک.{0,14}داشته باش|جوک.{0,10}(?:بیشتری|زیادتری)|جک‌های.{0,6}(?:بیشتر|زیاد)'
      ),
      R['ruleJokeCount']
    ),

    // The user's birthday («امروز تولدمه!»): celebrate warmly with a
    // follow-up instead of the unknown pool.
    rule(
      'birthday',
      45,
      pw(
        'امروز تولدمه|تولد.{0,4}منه|تولدمه|روز تولدم|سالگرد تولدم|تولد.{0,8}(?:دارم|داره|است)|امروز.{0,6}تولد|تولد امروز|من.{0,4}تولد.{0,4}دارم|تولدت مبارک'
      ),
      R['ruleBirthday']
    ),

    // IQ test request («یه تست هوش ازم بگیر»): honest about not being
    // able to run a real standardized test, then offers a light logic
    // riddle instead of the unknown pool.
    rule(
      'iq_test',
      42,
      pw(
        'تست هوش|ضریب هوشی|تست آی کیو|تست iq|تست آیکیو|بهیار.{0,4}هوش|میزان هوشم'
      ),
      R['ruleIqTest']
    ),

    // Sharing a secret («یه راز بهت بگم؟»): a safe-space reassurance
    // that opens the door, never a canned reflective line.
    rule(
      'secret',
      42,
      pw(
        'راز بهت بگم|یه راز|یک راز|میخوام.{0,10}راز|می‌خوام.{0,10}راز|رازی دارم|رازی رو بگم|سری دارم|راز.{0,4}بگم|رازی.{0,4}بگم'
      ),
      R['ruleSecret']
    ),

    // A new baby in the family («تازه یه بچه به دنیا اومده تو
    // خونواده‌مون»): the parenting-adjacent joy/exhaustion thread, which
    // the FA pack had no rule for (the probe fell to the unknown pool).
    // Priority sits above the family rule (50): the family pattern
    // matches bare «مامان», so «تازه مامان شدم!» must reach the
    // new-parent celebration instead of the family follow-up question.
    rule(
      'new_baby',
      51,
      pw(
        'بچه به دنیا اومد|بچه به دنیا اومده|بچه‌ای به دنیا|نوزاد|بچه دار شدم|بچه‌دار شدم|بچه‌دارم|مامان شدم|بابا شدم|مادر شدم|پدر شدم|زایمان کردم|تازه.{0,12}بچه|فرزند.{0,10}دنیا اومد|دختر.{0,6}دنیا اومد|پسر.{0,6}دنیا اومد|نوه.{0,6}دنیا اومد'
      ),
      R['ruleNewBaby']
    ),

    // Treatment request («میتونی کمکم کنی تا درمان بشم؟»): Darya is
    // honest that she is not a clinician, gently encourages a real
    // professional, and keeps the door open - instead of the evasive
    // "no precise answer" line from the transcript.
    rule(
      'therapy_help',
      48,
      pw(
        'کمکم کن.{0,10}درمان|درمانم کن|درمان بشم|درمان شوم|میخوام.{0,10}درمان|می‌خوام.{0,10}درمان|بهتر بشم|خوب بشم|بهبود پیدا کنم|شفا پیدا کنم|درمانم|درمان میخوام|درمان می‌خوام|کمکم کن.{0,10}خوب|بهبودی'
      ),
      R['ruleTherapyHelp']
    ),

    // Dating-app fatigue (Persian): «اپ‌های دوست‌یابی خسته‌کننده‌ان»،
    // «آشنایی آنلاین باعث می‌شه حس بدی به خودم داشته باشم». A lived
    // 2020s-experience thread with empathy, like the EN twin.
    rule(
      'dating_apps',
      48, // Both دوست یابی spellings are needed: normalizeForMatching turns a
      // ZWNJ into a plain space, so «اپ دوست‌یابی» arrives as «اپ دوست
      // یابی» and «اپ دوستیابی» stays joined; carry the spaced form so
      // the profile question («چطور پروفایل خوبی تو اپ دوست‌یابی
      // بنویسم؟») matches the rule instead of falling to the generic      // culture fact. The match ends at the space before «بنویسم», so
      // the (?!\p{L}) lookahead passes there; no suffix handling is
      // involved. The wide پروفایل gap covers «پروفایل خوبی تو اپ
      // دوست یابی» (12 chars) and the joined «پروفایل دوستیابی».
      pw(
        'اپ دوستیابی|اپ دوست یابی|اپ‌های دوستیابی|اپ های دوستیابی|اپ های دوست یابی|اپلیکیشن دوستیابی|اپلیکیشن دوست یابی|اپلیکیشن.{0,10}دوست|دوست یابی اینترنتی|دوستیابی آنلاین|دوست یابی آنلاین|قرار آنلاین|آشنایی آنلاین|آنلاین آشنا|تیندر|بامبل|هیچ.{0,8}پیدا نمیکنم|پروفایل دوستیابی|پروفایل.{0,12}دوست یابی'
      ),
      R['ruleDatingApps']
    ),

    // Affection: the user expresses love or attachment to Darya
    // directly. Warm response with gentle boundary.
    rule(
      'affection',
      50,
      pw(
        'دوستت دارم|عاشقتم|عاشقت هستم|عاشقتم دریا|عاشق تو هستم|دلم برات تنگ شده|دلم برات تنگ میشه|دلم برایت تنگ شده'
      ),
      R['ruleAffection']
    ),

    // Possessive pet names («تو عسل منی», «عشق منی», «تو دل منی») are a
    // stronger, unambiguous affection signal than a bare «دوستت دارم», so
    // they sit above the work/family/sleep band (50) while staying below
    // the heavy topics (depression 56, grief 55, panic 55) that must never
    // be diluted by a warmth line.
    rule(
      'affection',
      54,
      pw(
        'تو عسل منی|تو عسل من هستی|عسل منی|تو عشق منی|عشق منی|تو دل منی|دل منی|تو جونی|جون منی|تو مال منی|نفسمی|تو جون دل منی'
      ),
      R['ruleAffection']
    ),

    // Flirtation: date requests, romantic compliments directed at Darya.
    // Warm, clear boundary.
    rule(
      'dirty_talk_request',
      63,
      pw(
        'حرف زشت|حرفای زشت|چت جنسی|دوست دختر مجازی|دوست پسر مجازی|بیا (?:سکس|رابطه|حرف زشت)|(?:سکس|رابطه جنسی).{0,8}(?:کنیم|بکنیم|بکنم|کنم|بریم|داشته باشیم)|باهات (?:سکس|رابطه)|میخوام (?:باهات|بات).{0,6}(?:سکس|رابطه)|نقش.{0,15}جنسی|زنم باش|شوهرم باش'
      ),
      R['ruleDirtyTalkRequest']
    ),

    rule(
      'flirtation',
      57,
      pw(
        'با من بیرون میای|با من بیرون می‌آی|بیا بریم بیرون|بریم بیرون|قرار بذاریم|قرار بگذاریم|دوست دخترم میشی|دوست پسرم میشی|دوست دختر من میشی|چقدر خوشگلی|چه قدر خوشگلی|چه خوشگلی|خوشگل شدی|قربونت برم|فدات شم|فدات بشم|میخوام باهات قرار بذارم|می‌خوام باهات قرار بگذارم|اگه میشد بیرون میرفتیم|دلم یه آدم خوشگل|ای خوشگل|تو خوشگلی|تو خیلی خوشگلی|خیلی خوشگلی|چه چشمان قشنگی|چشمات قشنگه|چشات قشنگه|چشمهات قشنگه|بیا با هم حرف بزنیم|باهات حرف بزنم|با من حال کن|چرا انقدر خشک|چرا اینقدر خشک|چقدر خشکی|یه ذره با من|یه کم با من'
      ),
      R['ruleFlirtation']
    ),

    // Empty success / purpose: the user has everything but feels hollow.
    // Must win over joy (35) when 'خوشحال نیستم' is negated.
    rule(
      'empty_success',
      36,
      pw(
        'همهچیز دارم|همه چی دارم|همه‌چی دارم|موفق شدم|به همهچیز رسیدم|به همه چی رسیدم|خوشحال نیستم|خوشبخت نیستم|راضی نیستم|پوچی|احساس پوچی|بی‌هدف|بیهدف|بی‌معنا|بی معنا|تهش هیچی|ته‌اش هیچی|بیهوده|زندگیم بیهوده|همه‌چی بیهوده|همه چی بیهوده|هیچ چیزی معنا نداره|هیچچیز معنا نداره|خوشحال نیستم با اینکه|احساس خوشبختی نمیکنم|احساس خوشبختی نمی‌کنم'
      ),
      R['ruleEmptySuccess']
    ),

    // Grief hope: the user asks if they will ever feel better after loss.
    // Honesty with compassion.
    rule(
      'grief_hope',
      51,
      pw(
        'آیا دوباره خوب میشم|آیا دوباره خوب می‌شم|دوباره خوب میشم|دوباره خوب می‌شم|بهتر میشم|بهتر می‌شم|حالم خوب میشه|حالم خوب می‌شه|آیا من دوباره|آیا دوباره|این درد تموم میشه|این درد تموم می‌شه|این درد تمام میشه|کِی خوب میشم|کی خوب میشم|کی خوب می‌شم|آیا هیچوقت خوب میشم|آیا هیچ‌وقت خوب میشم'
      ),
      R['ruleGriefHope']
    ),

    // About Darya's day: the user asks what Darya did today.
    rule(
      'about_darya_day',
      56,
      pw(
        'امروز چیکار کردی|امروز چیکار میکنی|امروز چیکار می‌کنی|امروز چیکار داشتی|روزت چطور بود|روزت چطور گذشت|امروز چه کردی|امروز چه بلایی سرت اومده'
      ),
      R['ruleAboutDaryaDay']
    ),

    // A bare «چیکار میکنی» in everyday Persian is usually a casual
    // check-in ("what are you doing right now?"), not a question about
    // Darya's abilities. The ability reading («چه کاری بلدی», «چیکار
    // میتونی بکنی») stays on smalltalk_capability, while this rule answers
    // "I am right here with you." It sits above smalltalk_capability (60)
    // and the day forms keep their own rule via the negative lookbehind.
    rule(
      'about_darya_now',
      62,
      // eslint-disable-next-line max-len
      /(?<!امروز )(?<!دیروز )(?<!دیشب )چیکار (?:میکنی|می‌کنی|می کنی)(?:\s+(?:الان|حالا|همین حالا|همین الان))?[\s!؟.?]*$/u,
      R['ruleAboutDaryaNow']
    ),

    // Health rule extension: add medical symptom keywords.
    // (Extends the existing health rule pattern.)

    // Apology advice: «چطور عذرخواهی کنم», «چطور معذرت بخوام». Advice
    // on apologizing is not an apology, so this rule sits above the
    // apology acceptance rule (64) and answers with practical steps.
    rule(
      'apology_advice',
      65,
      pw(
        'چطور عذرخواهی کنم|چطوری عذرخواهی کنم|چجوری عذرخواهی کنم|چگونه عذرخواهی کنم|چطور معذرت بخوام|چطوری معذرت بخوام|چجوری معذرت بخوام|بهترین راه عذرخواهی|چطور.{0,10}(?:ببخشید|معذرت)|چطور.{0,10}عذرخواهی|عذرخواهی.{0,8}(?:کنم|بکنم)|ببخشیدش|چطور.{0,8}دلش.{0,4}بیارم|چطور.{0,10}جبران کنم|چطوری.{0,10}جبران کنم'
      ),
      R['ruleApologyAdvice']
    ),

    // Adult friendship: «دوست پیدا کردن توی بزرگسالی سخته», «چطور
    // دوست پیدا کنم». Sits above work (50) so a question about making
    // friends is never read as work stress.
    rule(
      'friendship',
      54,
      pw(
        'دوست پیدا کردن.{0,15}(?:سخته|سخت است|بزرگسالی)|دوست پیدا کنم.{0,15}سخته|دوستان.{0,8}بزرگسالی|دوست.{0,10}(?:پیدا کنم|پیدا کردن).{0,12}(?:سخته|دشوار)|چرا دوست پیدا کردن.{0,15}سخته|چطور.{0,8}دوست پیدا کنم|چطوری.{0,8}دوست پیدا|رفیق.{0,8}(?:پیدا کنم|پیدا کردن).{0,10}(?:سخته|دشوار)' +
          // Drifting apart: «از دوستام دور شدم» and similar.
          '|از دوستام.{0,12}(?:دور شدم|فاصله گرفتم)|از دوستانم.{0,12}(?:دور شدم|فاصله گرفتم)'
      ),
      R['ruleFriendship']
    ),

    // Friendship betrayal («دوستمو سر یه مهمونی دیدم که پشت سرم حرف
    // زده», «بهترین دوستم بهم خیانت کرد»): believed first, empathy
    // before questions. Sits above the generic friendship rule so a
    // betrayal disclosure never gets the friend-making advice.
    rule(
      'friendship_betrayal',
      57,
      pw(
        'پشت سرم حرف (?:میزنه|میزند|زد|میزنن|میزنند)|پشت سر من حرف (?:میزنه|میزند|زد|میزنن|میزنند)|به پشتم (?:حرف زد|حرف میزنه|زد)|رازم رو لو داد|رازمو لو داد|رازمو پیش (?:بقیه|دیگران|دوستام|دوستانش) (?:گفت|برد)|خیانت.{0,10}(?:کرد|کرده)|به من خیانت کرد|دوست.{0,15}(?:خیانت کرد|پشت سرم|پشت سر من)|دوست صمیمیم.{0,20}خیانت|بهترین دوستم.{0,25}(?:خیانت|زد|لو داد|حرف زد)|بهترین دوستمو دیدم.{0,20}(?:حرف|خیانت)'
      ),
      R['ruleFriendshipBetrayal']
    ),

    // Work humiliation («رئیس‌م جلوی همه تحقیرم کرد»): the person was
    // humiliated in public; empathy first, never the generic work
    // reflective question. Sits above the work rule.
    rule(
      'work_humiliation',
      57,
      pw(
        'جلوی (?:همه|همکارا|همکارها|بقیه|تیم) تحقیرم کرد|تو جمع تحقیرم کرد|جلوی (?:همه|همکارا|همکارها|بقیه|تیم) خوارم کرد|تو جمع خوارم کرد|جلوی (?:همه|بقیه|تیم) مسخره‌م کرد|جلوی (?:همه|همکارا|همکارها|بقیه|تیم) سرزنشم کرد|تو جمع سرزنشم کرد|بازخواستم کرد جلوی|رئیسم.{0,15}تحقیر|رئیس‌م.{0,15}تحقیر|مدیرم.{0,15}تحقیر|سرپرستم.{0,15}تحقیر|تو جمع.{0,10}شرمنده‌م کرد'
      ),
      R['ruleWorkHumiliation']
    ),

    // Misunderstood («کسی حرفمو نمی‌فهمه», «هیچ‌کس منو درک
    // نمی‌کنه»): the loneliness of being unheard, empathy before
    // questions.
    rule(
      'misunderstood',
      56,
      pw(
        'کسی حرفمو نمیفهمه|کسی حرفمو نمی‌فهمه|کسی منو نمیفهمه|کسی منو نمی‌فهمه|هیچکس منو نمیفهمه|هیچ کس منو نمیفهمه|هیچکس حرفمو نمیفهمه|هیچ کس حرفمو نمیفهمه|منو درک نمیکنن|منو درک نمی‌کنن|حرفمو نمیفهمن|حرفمو نمی‌فهمن|کسی درکم نمیکنه|کسی درکم نمی‌کند|احساس میکنم کسی منو درک نمیکنه|احساس می‌کنم کسی منو درک نمی‌کند|کسی منو نمی‌بینه|کسی منو نمی‌بیند'
      ),
      R['ruleMisunderstood']
    ),

    // A bad day («امروز روز بدی بود»): empathy for the day, then a
    // gentle opening. Must not fall to the stiff "I do not want to
    // guess wrong" pool.
    rule(
      'bad_day',
      55,
      pw(
        'امروز روز بدی بود|امروز روزم بد بود|امروز روز خوبی نبود|روز بدی داشتم|روزم خراب بود|امروز رو بدی داشتم|امروز از اون روزهاست|امروز از آن روزهاست|امروز صبحم بد شروع شد|امروز همه چی بر وفق مراد نبود|امروز همه چیز بر وفق مراد نبود'
      ),
      R['ruleBadDay']
    ),

    // Contradiction accusation («قبلا گفتی فلان، حالا یه چیز دیگه
    // میگی»): Darya answers honestly about her own limits instead of
    // dodging, repeating, or changing the subject.
    rule(
      'contradiction',
      66,
      pw(
        'قبلا گفتی|قبلاً گفتی|جوابت با قبل فرق داره|جوابت با قبلیت فرق داره|حرفت با قبل فرق داره|تو اول گفتی|اول گفتی|الان یه چیز دیگه میگی|الان یک چیز دیگر می‌گویی|حرفت عوض شد|جوابت عوض شد|خودت رو نقض کردی|خودتو نقض کردی|داری ضد و نقیض حرف میزنی|داری ضد و نقیض حرف می‌زنی|حرفات ضد و نقیضه|حرف‌هایت ضد و نقیض است|داری تناقض میگی|داری تناقض می‌گویی|این که الان میگی قبلا نگفتی|تو خودت گفتی|خودت گفتی'
      ),
      R['ruleContradiction']
    ),

    // Ethical dilemmas («اگه کسی برای درمان مامانش پول نداشته باشه،
    // دزدی درسته؟»): no absolute formulas, values explored honestly,
    // consequences and alternatives named. Never legal advice.
    rule(
      'ethical_dilemma',
      54,
      pw(
        'دروغ سفید (?:بگم|بگویم)|دروغ (?:بگم|بگویم)|دزدی درسته|دزدی.{0,15}درسته|اگه.{0,20}دزدی کنم|دزدیدن.{0,15}درسته|گزارش بدم|لو بدم|راستش رو بگم|راستشو بگم|چی کار درسته|چه کاری درسته|از نظر اخلاقی|اخلاقیه|درسته یا نه|این کار درسته|اگه.{0,15}گناه|گناه داره|دزدی.{0,10}گناه|خیانت.{0,10}درسته|دوستمو لو بدم|دوستم رو لو بدم'
      ),
      R['ruleEthicalDilemma']
    ),

    // Decision dilemmas («بین دو تا شغل موندم»، «نمیتونم تصمیم
    // بگیرم»): a practical thinking frame, not a formula and not the
    // generic work-stress pool (which misreads "between two jobs" as
    // "working two jobs").
    rule(
      'decision_dilemma',
      58,
      pw(
        'بین دو تا شغل موندم|بین دو تا کار موندم|بین دو تا گزینه موندم|بین دو تا خواستگار موندم|بین دو تا پیشنهاد موندم|بین دو شغل موندم|بین دو کار موندم|بین دو گزینه موندم|دو تا پیشنهاد دارم|دو پیشنهاد دارم|نمیتونم تصمیم بگیرم|نمی‌تونم تصمیم بگیرم|نتونستم تصمیم بگیرم|کدوم رو انتخاب کنم|کدومو انتخاب کنم|کدوم رو انتخاب کنم|مانده‌ام بین|گیر کردم بین دو'
      ),
      R['ruleDecisionDilemma']
    ),

    // Pet-name requests («یه اسم برای گربه‌م پیشنهاد بده»): creative
    // name ideas, never the pet-care advice pool.
    rule(
      'pet_name',
      58,
      pw(
        'یه اسم برای گربه‌م پیشنهاد بده|یک اسم برای گربه‌ام پیشنهاد بده|اسم برای گربه‌م بگو|گربه‌م رو چی صدا کنم|گربه‌ام را چه صدا کنم|یه اسم برای سگم پیشنهاد بده|یک اسم برای سگم پیشنهاد بده|اسم برای سگم بگو|سگم رو چی صدا کنم|سگم را چه صدا کنم|اسم بچه‌گربه|اسم توله‌سگ|اسم برای گربه|اسم برای سگ|اسم گربه‌م|اسم سگم|گربه‌م رو اسم بذار|گربه‌ام را نام‌گذاری کن'
      ),
      R['rulePetName']
    ),

    // A poem request («یه شعر بگو»): short public-domain verses
    // (Hafez, Rumi), offered without claiming authorship.
    rule(
      'poem_request',
      55,
      pw(
        'یه شعر بگو|یک شعر بگو|شعر بگو|شعری بگو|برام شعر بگو|برام یه شعر بگو|برایم شعر بگو|یه شعر بخون|یک شعر بخوان|شعر بخون|شعر بخوان|شعر بلدی|شعری بلدی'
      ),
      R['rulePoemRequest']
    ),

    // Sports banter («مربی دیشب خط هافبک رو نابود کرد», «تیممون
    // دوباره باخت»): light match talk, never grief or work stress.
    rule(
      'sports_talk',
      53,
      pw(
        'مربی.{0,20}(?:خط هافبک|باخت|نابود|فاجعه|افتضاح)|داور.{0,20}(?:اشتباه|فاجعه|نابود|بد بود)|تیم.{0,20}(?:باخت|باخته|شکست خورد)|خط هافبک|هافبک.{0,10}(?:فاجعه|افتضاح)|دیشب.{0,10}(?:باختیم|باخت)|تیممون.{0,10}(?:باخت|باخته)|تیمم.{0,10}(?:باخت|باخته)|گلمون.{0,8}(?:نشد|نیومد)|پنالتی.{0,10}(?:سوخت|خراب شد)' +
          // Referee calls: «داور پنالتی رو نگرفت» and similar.
          '|داور.{0,10}(?:پنالتی|کارد|خطا).{0,10}(?:نگرفت|نداد|نزد)'
      ),
      R['ruleSportsTalk']
    ),

    // Gaming: «از بازی‌های جهان‌باز خسته شدم», «یه بازی دنج معرفی
    // کن», «فکر کنم معتاد شدم». Sits above stress (40) so gaming
    // burnout is read as gaming talk.
    rule(
      'gaming',
      52,
      pw(
        'از بازی.{0,12}خسته|بازی.{0,10}خسته شدم|بازی.{0,8}معتاد|معتاد.{0,6}بازی|اعتیاد.{0,6}بازی|معتاد.{0,8}(?:شدم|هستم|شدهام|میشم|می شم)|اعتیاد.{0,8}(?:دارم|پیدا کردم)|یه بازی.{0,8}(?:معرفی|پیشنهاد)|یک بازی.{0,8}(?:معرفی|پیشنهاد)|بازی.{0,6}(?:معرفی|پیشنهاد) کن|بازی پیشنهاد|بازی معرفی|بازی.{0,8}زیاد|بازی های جهان باز|بازی‌های جهان‌باز|خسته شدم از بازی|دیگه از بازی.{0,8}لذت نمیبرم' +
          // Playing all night: «شب‌ها تا صبح بازی میکنم».
          '|تا صبح.{0,8}(?:بازی|گیم).{0,6}(?:میکنم|می‌کنم)|شب‌ها.{0,10}(?:بازی میکنم|بازی می‌کنم)'
      ),
      R['ruleGaming']
    ),

    // ------------------------------------------------------------------
    // Wellbeing and identity topics (added for broader lived-experience
    // coverage). Priorities sit above the generic feeling/reasoning rules
    // (25-30) and below the safety-critical family (90-102), so a genuine
    // disclosure always wins over a generic reflection and never overrides
    // a protective reply.
    // ------------------------------------------------------------------

    rule(
      'panic_attack',
      55,
      pw(
        'حمله پانیک|حمله وحشت|پانیک|پنیک|نفسم میگیره|نفسم می گیره|حس خفگی|حس خفگی دارم|دارم دیوونه میشم|دارم دیوانه میشم|از کنترل خارج میشم|از کنترل خارج می شم|میترسم سکته کنم|میترسم دیوونه بشم|قلبم تند میزنه و میترسم'
      ),
      R['rulePanicAttack']
    ),

    rule(
      'self_injury',
      58,
      pw(
        'خودمو (?:میبرم|می برم|زخمی میکنم|زخمی می کنم|میسوزونم|می سوزونم)|مچ دستمو (?:میبرم|می برم)|دستمو (?:میبرم|می برم|زخمی میکنم|زخمی می کنم)|رونمو (?:میبرم|می برم)|تیغ (?:میزنم|می زنم|میکشم|می کشم)|(?:میبرم|می برم) (?:خودمو|مچمو|دستمو|رونمو)|زخم میندازم|زخم می اندازم'
      ),
      R['ruleSelfInjury']
    ),

    rule(
      'suicide_bereavement',
      56,
      // eslint-disable-next-line max-len
      /(?:(?:دوست|رفیق|برادر|خواهر|پدر|مادر|بابا|مامان|همسر|شوهر|زن|دختر|پسر|پسرخاله|دخترخاله|عمو|دایی|خاله|عمه|همکار|هم اتاقی|هماتاقی)[\u0600-\u06FF\u200c]?.{0,8}(?:خودکشی (?:کرد|کرده)|خودشو (?:کشت|کشته)|با خودکشی (?:مرد|مرده))|(?:خودکشی|خودشو کشت).{0,12}(?:دوست|رفیق|برادر|خواهر|پدر|مادر|همسر|عزیز)|(?:بعد از|پس از) خودکشی)/u,
      R['ruleSuicideBereavement']
    ),

    rule(
      'pregnancy_loss',
      56,
      pw(
        'سقط جنین|سقط کردم|سقط شد|بچه ام سقط|بچه ام مرد|نوزادم مرد|نوزادم فوت کرد|بارداری رو از دست دادم|بارداریم از دست رفت|جنین از دست دادم|مرده زایی|بچه مون مرد|از دست دادن بارداری'
      ),
      R['rulePregnancyLoss']
    ),

    rule(
      'trauma_ptsd',
      52,
      pw(
        'تروما|ترما|ضربه روحی|ضربه روانی|آسیب روانی|PTSD|ptsd|فلش بک|فلش‌بک|فلش بک میگیرم|خاطره اش برمیگرده|خاطره اش برمی گرده|از اون اتفاق هنوز|زخم قدیمی|ترومای'
      ),
      R['ruleTrauma']
    ),

    rule(
      'addiction_recovery',
      54,
      pw(
        'اعتیاد به|به (?:الکل|مشروب|مواد مخدر|مواد) اعتیاد|اعتیاد (?:دارم|داره)|مواد مخدر|مصرف مواد|مواد مصرف میکنم|مواد مصرف می کنم|معتاد به مواد|ترک مواد|ترک الکل|مشروب خوری|مشروب خور|الکلی|شیشه (?:میکشم|میکشم|میزنم|می زنم)|هروئین|متادون|وسوسه (?:مواد|مصرف)|لغزش کردم|دوباره شروع کردم مصرف|بازگشت داشتم'
      ),
      R['ruleAddictionRecovery']
    ),

    rule(
      'ocd',
      50,
      pw(
        'وسواس|وسواسی|افکار مزاحم|فکر مزاحم|افکار تکراری|چک کردن مکرر|مجبورم (?:چک|بشورم|بشمارم)|چند بار چک میکنم|چند بار چک می کنم|شستن مکرر|افکار ناخواسته'
      ),
      R['ruleOcd']
    ),

    rule(
      'bipolar',
      50,
      pw(
        'دوقطبی|دو قطبی|نوسان خلق|خلقم (?:بالا پایین|نوسان)|شیدایی|مانیا|هیپومانیا|انرژی زیاد ناگهانی|بی خوابی و انرژی زیاد|خلق بالا و پایین'
      ),
      R['ruleBipolar']
    ),

    rule(
      'adhd',
      53,
      pw(
        'بیش فعالی|بیش‌فعالی|بیش فعال|اختلال کم توجهی|کم توجهی|نقص توجه|ADHD|adhd|ذهنم شلوغه|ذهنم شلوغ|ذهن پریشون|ذهنم پریشونه|تمرکزم صفره|تمرکزم صفر'
      ),
      R['ruleAdhd']
    ),

    rule(
      'autism',
      48,
      pw(
        'اوتیسم|اتیسم|طیف اوتیسم|در طیف اوتیسم|ماسک میزنم|ماسک می زنم|حساسیت حسی|حساسیت به صدا|اضافه بار حسی|اوراستیموله|overstimulated'
      ),
      R['ruleAutism']
    ),

    rule(
      'terminal_illness',
      54,
      pw(
        'بیماری لاعلاج|بیماری پیشرفته|سرطان(?:م|مون)? پیشرفته|سرطان پیشرفته|مرحله آخر|بیماریم لاعلاجه|چند ماه مونده|دیگه وقت زیادی ندارم|وقت زیادی ندارم|بیماری کشنده|شفا نداره|درمان نداره'
      ),
      R['ruleTerminalIllness']
    ),

    rule(
      'infertility',
      50,
      pw(
        'ناباروری|نابارور|بچه دار نمیشم|بچه دار نمی شم|بچه دار نمیشیم|بچه دار نمی شیم|باردار نمیشم|باردار نمی شم|باروری مشکل داره|آی وی اف|IVF|لقاح مصنوعی|بچه دار شدن سخت'
      ),
      R['ruleInfertility']
    ),

    rule(
      'coming_out',
      52,
      pw(
        'برون آیی|برون‌آیی|کام اوت|come out|به خانواده ام بگم (?:گی|لزبین|دوجنس)|هویتم رو بگم|گرایشم|جهت گیریم|ال جی بی تی|LGBT|گی هستم|لزبین هستم|ترنس هستم|تراجنسیتی|دوجنس گرا'
      ),
      R['ruleComingOut']
    ),

    rule(
      'appearance_judgment',
      49,
      // اعتمادبه‌نفس پذیرفتنی است، اما نباید رتبه‌بندی تحقیرآمیز دیگری
      // را تأیید کنیم. ناامنی درباره‌ی ظاهر به قاعده‌ی بعدی می‌رود.
      pw(
        'من از (?:اون|او|همه) خوشگل ترم|من از (?:اون|او|همه) خوشگل‌ترم|من از (?:اون|او|همه) زیباترم|من خوشگلم (?:اون|ولی اون|و اون) زشته|من زیبام (?:اون|ولی اون|و اون) زشته|اون زشته و من خوشگلم|بقیه زشتن من خوشگلم|آدمای خوشگل بهترن'
      ),
      R['ruleAppearanceJudgment']
    ),

    rule(
      'body_image',
      48,
      pw(
        'از بدنم بدم میاد|از بدنم بدم می آد|از ظاهرم بدم میاد|از ظاهرم بدم می آد|خودمو زشت میبینم|خودمو زشت می بینم|من زشتم|چرا من زشتم|چرا اینقدر زشتم|صورتم زشته|قیافه‌ام زشته|قیافم زشته|اون خیلی خوشگله و من زشتم|همه از من خوشگل ترن|همه از من خوشگل‌ترن|خودمو چاق میبینم|بدنم رو دوست ندارم|از قیافه م بدم میاد|شکل بدنم|اعتماد به نفسم بخاطر ظاهرم|آینه که نگاه میکنم|مدام صورتم را در آینه چک میکنم|از آینه فرار میکنم|میرورم'
      ),
      R['ruleBodyImage']
    ),

    rule(
      'friendship_breakup',
      55,
      pw(
        'بهترین دوستم (?:ترکم|گذاشت|دیگه نیست)|دوست صمیمیم (?:ترکم|گذاشت|دیگه نیست)|دوستیم تموم شد|دوستیم تمام شد|دیگه با هم دوست نیستیم|دوستیم بهم خورد|دوستیم به هم خورد|رفیقم (?:رفت|گذاشت|ترکم کرد)|قطع رابطه با دوست|دوست سالهامو از دست دادم|دوست صمیمیم از دست دادم'
      ),
      R['ruleFriendshipBreakup']
    ),

    rule(
      'immigration',
      48,
      pw(
        'مهاجرت|مهاجرم|غربت|دور از وطن|دلتنگی وطن|تو کشور جدید|زندگی خارج|خارج از کشور|تو کشور دیگه|بیگانه ام|به ایران برنگشتم|غریبم تو این شهر'
      ),
      R['ruleImmigration']
    ),

    rule(
      'calibrated_honesty',
      53,
      pw(
        'واکسن (?:باعث|میکنه) اوتیسم|واکسن (?:ضرر|سم)|داروی ضد افسردگی سم|ضدافسردگی سمه|قرص های اعصاب سم|درمانگرها کلاهبردارن|روانشناس ها فقط پول|هیچ درمانی جواب نمیده|هیچ درمانی جواب نمی ده|دارو فقط بدتر میکنه|دارو فقط بدتر می کنه|طب مدرن دروغه|هیچ دارویی اثر نداره'
      ),
      R['ruleCalibratedHonesty']
    ),

    rule(
      'connection_nudge',
      41,
      pw(
        'هیچکس نیست باهاش حرف بزنم|هیچ کس نیست حرف بزنم|هیچ کس نیست باهاش صحبت کنم|هیچکس منو نمیفهمه|هیچ کس منو نمی فهمه|کسی نیست که بفهمدم|همه تنهام گذاشتن|کاملا تنهام|کاملاً تنهام|هیچ رفیقی ندارم'
      ),
      R['ruleConnectionNudge']
    ),

    rule('affirmation', 15, /^(بله|آره|اره)\.?$/i, R['ruleAffirmation']),

    rule('negation', 15, /^(نه|خیر)\.?$/i, R['ruleNegation'])
  ];

  global.DaryaFaRules = rules;
})(typeof window !== 'undefined' ? window : globalThis);
