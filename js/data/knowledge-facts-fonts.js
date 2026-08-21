/**
 * Darya - curated factual entries (fonts and typography).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'fonts_overview',
      keywords: [
        'فونت چیه',
        'تایپوگرافی',
        'انواع فونت',
        'سریف و سن سریف',
        'فرق سریف و سن سریف',
        'what is a font',
        'typography basics',
        'font vs typeface',
        'serif vs sans serif'
      ],
      weak: [
        'فونت',
        'تایپوگرافی',
        'سریف',
        'سن سریف',
        'font',
        'typography',
        'serif',
        'sans serif'
      ],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'سری', 'سریف', 'what', 'serif', 'sans'],
      fa: 'فونت‌ها دو خانواده‌ی اصلی دارند: سریف (پایه‌دار، مثل Times؛ حس رسمی و سنتی، مناسب چاپ و متن طولانی) و سن‌سریف (بدون پایه، مثل Arial؛ تمیز و مدرن، مناسب صفحه‌نمایش و رابط کاربری). فونت‌های مونواسپیس (هر حرف عرض یکسان، مثل JetBrains Mono) مخصوص کد هستند. انتخاب فونت یعنی انتخاب لحن بصری متن؛ خوانایی همیشه اول است.',
      en: 'Fonts have two main families: serif (with feet, like Times; formal and traditional, good for print and long text) and sans-serif (no feet, like Arial; clean and modern, good for screens and interfaces). Monospace fonts (every letter the same width, like JetBrains Mono) are made for code. Choosing a font is choosing the visual tone of your text; readability always comes first.'
    },
    {
      id: 'coding_fonts',
      keywords: [
        'فونت کد',
        'فونت برنامه نویسی',
        'فونت مونواسپیس',
        'best coding font',
        'best font for coding',
        'font for coding',
        'monospace font',
        'jetbrains mono'
      ],
      weak: [
        'فونت کد',
        'مونواسپیس',
        'coding font',
        'font for coding',
        'monospace'
      ],
      weakSafe: true,
      hints: ['کد', 'برنامه نویسی', 'بهترین', 'code', 'best', 'programming'],
      fa: 'فونت‌های خوب برای کد: JetBrains Mono (خوانا با اعداد و نمادهای واضح)، Fira Code (با لیگاتورهایی مثل => که به یک فلش تبدیل می‌شود)، Cascadia Code (فونت رسمی ویندوز ترمینال)، و Source Code Pro (ادوبی، ساده و تمیز). ملاک اصلی این است که صفر و O و حروف مشابه از هم تشخیص داده شوند تا خطای چشمی ندهند.',
      en: 'Good fonts for code: JetBrains Mono (readable with clear numbers and symbols), Fira Code (with ligatures like => rendering as an arrow), Cascadia Code (the official Windows Terminal font), and Source Code Pro (Adobe, simple and clean). The key criterion is that zero, O, and similar letters stay visually distinct so they never cause eye mistakes.'
    },
    {
      id: 'persian_fonts',
      keywords: [
        'فونت فارسی',
        'فونت وزیرمتن',
        'ایران سنس',
        'persian font',
        'vazirmatn',
        'iransans'
      ],
      weak: [
        'فونت فارسی',
        'وزیرمتن',
        'ایران سنس',
        'persian font',
        'vazirmatn',
        'iransans'
      ],
      weakSafe: true,
      hints: ['فونت', 'فارسی', 'وب', 'font', 'web', 'farsi'],
      fa: 'فونت‌های فارسی پرکاربرد: وزیرمتن (متن‌باز، همه‌کاره و رایج‌ترین انتخاب وب فارسی)، ایران‌سنس (استاندارد خیلی از سرویس‌های ایرانی)، شبنم و صمیم (متن‌باز با حس صمیمی) و یکان (مخصوص رابط کاربری ویندوز). نکته‌ی مهم در وب فارسی، پشتیبانی از نیم‌فاصله و اعداد فارسی است؛ وزیرمتن معمولاً امن‌ترین انتخاب است.',
      en: 'Popular Persian fonts: Vazirmatn (open-source, all-purpose, the most common Persian web choice), IRANSans (standard in many Iranian services), Shabnam and Samim (open-source with a friendly feel), and Yekan (built for the Windows UI). The key need in Persian web text is support for the half-space and Persian digits; Vazirmatn is usually the safest pick.'
    },
    {
      id: 'web_fonts',
      keywords: [
        'فونت وب',
        'فونت گوگل',
        'بهترین فونت سایت',
        'web fonts',
        'google fonts',
        'best font for website',
        'best font for a website',
        'font for website',
        'website font'
      ],
      weak: ['فونت وب', 'فونت گوگل', 'web font', 'google font', 'website font'],
      weakSafe: true,
      hints: ['سایت', 'وب', 'بهترین', 'website', 'best', 'web'],
      fa: 'برای وب، سن‌سریف‌های خوانا بهترین‌اند: Inter (پیش‌فرض محبوب اپ‌های مدرن)، Roboto (اندروید)، Open Sans و Lato (کلاسیک و بی‌طرف). برای عنوان‌ها می‌توانی یک فونت شخصیت‌دار مثل Montserrat یا Playfair Display (سریف ظریف) بگذاری. قاعده: حداکثر دو فونت (یکی متن، یکی عنوان) و سایز بدنه‌ی حداقل ۱۶ پیکسل.',
      en: 'For the web, readable sans-serifs are best: Inter (the popular default of modern apps), Roboto (Android), Open Sans, and Lato (classic and neutral). For headings you can add a characterful font like Montserrat or Playfair Display (an elegant serif). The rule: at most two fonts (one for body, one for headings) and a body size of at least 16 pixels.'
    },
    {
      id: 'document_fonts',
      keywords: [
        'فونت مقاله',
        'فونت سند',
        'فونت پایان نامه',
        'فونت مناسب پایان نامه',
        'فونت مناسب مقاله',
        'فونت مناسب سند',
        'فونت برای پایان نامه',
        'best font for documents',
        'font for resume',
        'font for a document',
        'document typography'
      ],
      weak: [
        'فونت مقاله',
        'فونت سند',
        'فونت پایان نامه',
        'فونت مناسب',
        'پایان نامه',
        'پایان‌نامه',
        'document font',
        'resume font',
        'font for document'
      ],
      weakSafe: true,
      hints: ['مقاله', 'سند', 'رزومه', 'document', 'resume', 'formal'],
      fa: 'برای سند رسمی، مقاله یا پایان‌نامه، فونت‌های سریف خوانا استانداردند: Times New Roman، Georgia یا Garamond برای متن لاتین. برای رزومه می‌توانی از سن‌سریف تمیز مثل Calibri، Arial یا Helvetica استفاده کنی. در اسناد فارسی، B Nazanin و وزیرمتن رایج‌اند. اصل مهم، یکدستی و اندازه‌ی مناسب (۱۱ تا ۱۲ پوینت برای متن) است.',
      en: 'For formal documents, papers, or theses, readable serif fonts are the standard: Times New Roman, Georgia, or Garamond for Latin text. For resumes you can use a clean sans-serif like Calibri, Arial, or Helvetica. In Persian documents, B Nazanin and Vazirmatn are common. The main principle is consistency and an appropriate size (11 to 12 points for body text).'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
