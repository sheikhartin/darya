/**
 * Darya - curated factual entries (universities and higher education).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'harvard',
      keywords: [
        'دانشگاه هاروارد',
        'هاروارد چیه',
        'harvard university',
        'what is harvard'
      ],
      weak: ['هاروارد', 'harvard'],
      weakSafe: true,
      hints: ['دانشگاه', 'چیه', 'آمریکا', 'university', 'what', 'usa'],
      fa: 'هاروارد قدیمی‌ترین دانشگاه آمریکاست که در ۱۶۳۶ در ماساچوست تأسیس شد و از معتبرترین دانشگاه‌های جهان به شمار می‌رود. در حقوق، پزشکی، اقتصاد و مدیریت شهرت ویژه دارد و کتابخانه و سرمایه‌ی وقفی‌اش از بزرگ‌ترین‌های دنیاست. پذیرشش بسیار رقابتی است و بسیاری از رهبران سیاسی و علمی جهان از آن فارغ‌التحصیل شده‌اند.',
      en: 'Harvard is America’s oldest university, founded in 1636 in Massachusetts, and ranks among the most prestigious in the world. It is especially known for law, medicine, economics, and business, with one of the world’s largest libraries and endowments. Admission is highly competitive, and many world political and scientific leaders are alumni.'
    },
    {
      id: 'mit',
      keywords: [
        'دانشگاه ام آی تی',
        'ام آی تی چیه',
        'mit university',
        'what is mit'
      ],
      weak: ['ام آی تی', 'ام‌آی‌تی', 'mit'],
      weakSafe: true,
      hints: ['دانشگاه', 'چیه', 'مهندسی', 'university', 'what', 'engineering'],
      fa: 'مؤسسه‌ی فناوری ماساچوست (MIT) دانشگاهی در آمریکاست که در مهندسی، علوم کامپیوتر، فیزیک و ریاضی در صدر رتبه‌های جهانی است. به فرهنگ نوآوری و ارتباطش با صنعت و استارتاپ‌ها معروف است و تعداد زیادی از برندگان نوبل از آن بیرون آمده‌اند. پذیرشش به‌شدت رقابتی و بر پایه‌ی توان علمی و خلاقیت است.',
      en: 'The Massachusetts Institute of Technology (MIT) is an American university that tops global rankings in engineering, computer science, physics, and mathematics. It is known for an innovation culture and close industry and startup ties, with many Nobel laureates among its ranks. Admission is extremely competitive and based on scientific ability and creativity.'
    },
    {
      id: 'stanford',
      keywords: [
        'دانشگاه استنفورد',
        'استنفورد چیه',
        'stanford university',
        'what is stanford'
      ],
      weak: ['استنفورد', 'stanford'],
      weakSafe: true,
      hints: [
        'دانشگاه',
        'چیه',
        'سیلیکون ولی',
        'university',
        'what',
        'silicon valley'
      ],
      fa: 'استنفورد در قلب کالیفرنیا و کنار سیلیکون‌ولی قرار دارد و به‌خاطر پیوندش با دنیای فناوری و کارآفرینی معروف است. شرکت‌هایی مثل گوگل از دل همین فضا بیرون آمده‌اند و فرهنگ استارتاپی‌اش بی‌نظیر است. در مهندسی، علوم کامپیوتر و کسب‌وکار از بهترین‌های جهان است.',
      en: 'Stanford sits in California beside Silicon Valley and is famous for its ties to technology and entrepreneurship. Companies like Google grew out of this environment, and its startup culture is unmatched. It is among the world’s best in engineering, computer science, and business.'
    },
    {
      id: 'oxford_cambridge',
      keywords: [
        'دانشگاه آکسفورد',
        'دانشگاه کمبریج',
        'آکسفورد یا کمبریج',
        'oxford university',
        'cambridge university',
        'oxford vs cambridge'
      ],
      weak: ['آکسفورد', 'کمبریج', 'oxford', 'cambridge'],
      weakSafe: true,
      hints: ['دانشگاه', 'چیه', 'انگلستان', 'university', 'what', 'uk'],
      fa: 'آکسفورد و کمبریج دو دانشگاه کهن و رقیب انگلستان‌اند که هر دو با سیستم کالجی و سنت آموزشی عمیق شناخته می‌شوند. آکسفورد قدیمی‌تر است و در علوم انسانی و سیاست شهرت دارد؛ کمبریج در علوم طبیعی و ریاضی (نیوتن، هاوکینگ) درخشان است. هر دو از معتبرترین دانشگاه‌های جهان‌اند و تفاوتشان بیشتر سلیقه‌ای است.',
      en: 'Oxford and Cambridge are England’s two ancient rival universities, both known for their college system and deep academic tradition. Oxford is older and famed for the humanities and politics; Cambridge shines in the natural sciences and mathematics (Newton, Hawking). Both are among the world’s most prestigious, and the difference is largely a matter of taste.'
    },
    {
      id: 'university_comparison',
      keywords: [
        'بهترین دانشگاه دنیا',
        'هاروارد یا ام آی تی',
        'رتبه دانشگاه ها',
        'best university in the world',
        'harvard vs mit',
        'university rankings'
      ],
      weak: [
        'بهترین دانشگاه',
        'رتبه دانشگاه',
        'best university',
        'university ranking'
      ],
      weakSafe: true,
      hints: ['دنیا', 'مقایسه', 'کدوم', 'world', 'comparison', 'vs'],
      fa: '«بهترین دانشگاه» بستگی به رشته دارد: MIT در مهندسی و فناوری، هاروارد در حقوق و مدیریت، استنفورد در کارآفرینی، و آکسفورد/کمبریج در سنت علمی و علوم انسانی سرآمدند. رتبه‌بندی‌ها (QS، تایمز، شانگهای) هر سال تغییر می‌کنند و معیارهایشان متفاوت است. انتخاب درست دانشگاه، هماهنگی رشته، هزینه، موقعیت و هدف شغلی توست، نه فقط یک عدد رتبه.',
      en: 'The best university depends on your field: MIT leads in engineering and technology, Harvard in law and business, Stanford in entrepreneurship, and Oxford/Cambridge in scholarly tradition and the humanities. Rankings (QS, Times, Shanghai) change yearly and use different criteria. The right choice balances field, cost, location, and career goal, not just a ranking number.'
    },
    {
      id: 'university_admission',
      keywords: [
        'پذیرش دانشگاه',
        'اپلای دانشگاه',
        'چطور اپلای کنم',
        'university admission',
        'how to apply to university',
        'how do i apply to university',
        'how do i apply to a university',
        'apply to university',
        'how to apply to college',
        'college application tips'
      ],
      weak: ['اپلای', 'پذیرش', 'admission', 'application', 'apply'],
      weakSafe: true,
      hints: ['دانشگاه', 'چطور', 'رزومه', 'university', 'how', 'apply'],
      fa: 'پذیرش دانشگاه‌های معتبر ترکیبی از چند چیز است: نمره‌ها و آزمون‌ها، انگیزه‌نامه و توصیه‌نامه، و فعالیت‌های خارج از درس. برای اپلای خارجی، زبان (آیلتس/تافل) و مدارک را زودتر آماده کن و با هزینه و بورس واقع‌بین باش. هیچ راه میان‌بری وجود ندارد؛ ثبات و هدف روشن مهم‌تر از یک دستاورد نمایشی است.',
      en: 'Admission to strong universities combines several things: grades and tests, a personal statement and recommendations, and activities beyond the classroom. For applications abroad, prepare language certificates (IELTS/TOEFL) and documents early and be realistic about costs and funding. There is no shortcut; consistency and a clear goal matter more than one showy achievement.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
