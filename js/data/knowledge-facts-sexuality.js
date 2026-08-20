/**
 * Darya - curated factual entries (intimacy and sexual-preference
 * education). Kept deliberately non-explicit, non-judgmental, and
 * consent-focused; a genuine education question is a normal knowledge
 * topic and is never treated as a roleplay request.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'what_is_fetish',
      keywords: [
        'فتیش چیه',
        'فتیش یعنی چی',
        'کینک چیه',
        'علاقه جنسی غیرمعمول',
        'what is a fetish',
        'what is a kink',
        'fetish meaning'
      ],
      weak: ['فتیش', 'کینک', 'fetish', 'kink'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'یعنی', 'what', 'meaning', 'normal'],
      fa: 'فتیش یا کینک یعنی نوعی علاقه یا تمایل خاص که برای بعضی افراد بخشی از زندگی جنسی یا تخیل‌شان است. تا وقتی بین بزرگسالانِ راضی، امن و بدون آسیب باشد، یک تنوع طبیعی است و «غیرعادی بودن» به‌معنای بیمار بودن نیست. ملاک سالم بودن سه چیز است: رضایت آگاهانه، امنیت، و اینکه به خودت یا دیگری آسیب نزند. اگر یک تمایل باعث ناراحتی، شرم یا اختلال در زندگی‌ات شده، گفتگو با یک متخصص کمک می‌کند.',
      en: 'A fetish or kink is a specific interest or preference that is part of some people’s sexuality or fantasy life. Between consenting, safe, unharmed adults it is a natural variation, and being uncommon does not mean being disordered. The healthy baseline is three things: informed consent, safety, and no harm to yourself or others. If a preference causes distress, shame, or disrupts your life, talking to a professional helps.'
    },
    {
      id: 'fetish_gender_question',
      keywords: [
        'فتیش مردها',
        'فتیش زنها',
        'تفاوت فتیش زن و مرد',
        'آیا مردها و زنها فتیش متفاوت دارند',
        'do men and women have different fetishes',
        'fetishes by gender'
      ],
      weak: ['فتیش زن', 'فتیش مرد', 'fetish gender', 'fetishes by gender'],
      weakSafe: true,
      hints: ['تفاوت', 'زن', 'مرد', 'difference', 'men', 'women'],
      fa: 'پژوهش‌ها نشان می‌دهند تنوع علاقه‌ها بین افراد بسیار بیشتر از تفاوت میان «زن و مرد» است؛ یعنی نمی‌شود گفت همه‌ی مردها یا همه‌ی زن‌ها یک نوع تمایل دارند. دسته‌بندی‌های کلیشه‌ای اغلب گمراه‌کننده‌اند و هر فرد ترکیب خاص خودش را دارد. به‌جای تعمیم جنسیتی، گفتگوی باز با شریک زندگی و احترام به مرزهای هر دو طرف مهم‌تر است.',
      en: 'Research suggests variation in preferences between individuals is far larger than any difference between men and women; you cannot say all men or all women share one tendency. Stereotyped categories are often misleading, and each person has their own mix. Instead of gendered generalization, open communication with a partner and respect for both people’s boundaries matter more.'
    },
    {
      id: 'consent_basics',
      keywords: [
        'رضایت جنسی',
        'رضایت یعنی چی',
        'مرز در رابطه',
        'consent',
        'what is consent',
        'enthusiastic consent'
      ],
      weak: ['رضایت', 'مرز', 'consent', 'boundary'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'رابطه', 'what', 'relationship', 'yes'],
      fa: 'رضایت یعنی توافق آگاهانه، آزادانه و قابل‌پس‌گرفتن برای هر کاری؛ سکوت یا «نگفتن نه» رضایت نیست و رضایت در هر لحظه قابل پس‌گرفتن است. رضایت باید مشتاقانه و برای هر فعالیت به‌طور جداگانه داده شود. در هر رابطه‌ای، صحبت کردن درباره‌ی مرزها و چک کردن حال طرف مقابل، نشانه‌ی احترام است، نه سردی.',
      en: 'Consent means an informed, freely given, and revocable agreement to an activity; silence or not saying no is not consent, and consent can be withdrawn at any moment. It should be enthusiastic and given separately for each activity. In any relationship, talking about boundaries and checking in with your partner is a sign of respect, not coldness.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
