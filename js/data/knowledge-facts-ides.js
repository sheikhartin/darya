/**
 * Darya - curated factual entries (programming IDEs and editors).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'ide_overview',
      keywords: [
        'محیط توسعه',
        'آی دی ای چیه',
        'ادیتور کد',
        'تفاوت ide و ادیتور',
        'best ide',
        'what is an ide',
        'code editor vs ide',
        'which editor for programming'
      ],
      weak: ['محیط توسعه', 'آی دی ای', 'ادیتور', 'ide', 'editor'],
      weakSafe: true,
      hints: [
        'کد',
        'برنامه نویسی',
        'چیه',
        'code',
        'programming',
        'what',
        'best'
      ],
      fa: 'IDE (محیط توسعه یکپارچه) مجموعه‌ای کامل است که ادیتور کد، دیباگر، کامپایلر و مدیریت پروژه را یکجا دارد؛ ادیتور ساده‌تر است و فقط متن کد را با امکاناتی مثل تکمیل خودکار باز می‌کند. انتخاب به زبان و سلیقه بستگی دارد: برای جاوا و اندروید IntelliJ و Android Studio، برای پایتون PyCharm یا VS Code، برای اپل Xcode، و VS Code برای تقریباً هر چیزی محبوب‌ترین انتخاب عمومی است.',
      en: 'An IDE (integrated development environment) is a full suite with a code editor, debugging tools, a compiler, and project management in one place; a plain editor only opens code text with extras like autocomplete. The choice depends on language and taste: IntelliJ and Android Studio for Java and Android, PyCharm or VS Code for Python, Xcode for Apple, and VS Code as the most popular general-purpose option.'
    },
    {
      id: 'vs_code',
      keywords: [
        'وی اس کد',
        'وی‌اس کد',
        'ادیتور وی اس کد',
        'visual studio code',
        'vs code',
        'what is vs code'
      ],
      weak: ['وی اس کد', 'وی‌اس کد', 'vs code', 'vscode'],
      weakSafe: true,
      hints: ['ادیتور', 'چیه', 'کد', 'editor', 'what', 'code'],
      fa: 'وی‌اس کد ادیتور رایگان و متن‌باز مایکروسافت است که با اکوسیستم عظیم افزونه‌ها به محبوب‌ترین ادیتور جهان تبدیل شده است. برای تقریباً هر زبانی پشتیبانی دارد، سبک و سریع است و با افزونه‌های Git، لینت و اشکال‌زدایی به یک IDE کامل نزدیک می‌شود. برای شروع برنامه‌نویسی و کار روزانه انتخاب بسیار امنی است.',
      en: 'VS Code is Microsoft’s free, open-source editor that became the world’s most popular editor thanks to its huge extension ecosystem. It supports almost every language, stays light and fast, and with Git, linting, and debugging extensions it approaches a full IDE. It is a very safe choice for starting out and for daily work.'
    },
    {
      id: 'jetbrains_ides',
      keywords: [
        'جت برینز',
        'اینتلیجی',
        'پای چارم',
        'وب استورم',
        'jetbrains',
        'intellij idea',
        'pycharm',
        'webstorm'
      ],
      weak: [
        'جت برینز',
        'اینتلیجی',
        'پای چارم',
        'وب استورم',
        'jetbrains',
        'intellij',
        'pycharm',
        'webstorm'
      ],
      weakSafe: true,
      hints: ['آی دی ای', 'چیه', 'کد', 'ide', 'what', 'code'],
      fa: 'جت‌برینز مجموعه‌ای از IDEهای حرفه‌ای می‌سازد: اینتلیجی آیدیا برای جاوا و کاتلین، پای‌چارم برای پایتون، وب‌استورم برای جاوااسکریپت و فرانت‌اند، و دیتاگریپ برای پایگاه داده. ابزارهای بازآرایی و تحلیل کدشان جزو بهترین‌های دنیاست، اما نسخه‌ی کاملش پولی است و نسبت به VS Code سنگین‌تر. برای پروژه‌های بزرگ و سازمانی انتخاب رایج است.',
      en: 'JetBrains makes a family of professional IDEs: IntelliJ IDEA for Java and Kotlin, PyCharm for Python, WebStorm for JavaScript and the frontend, and DataGrip for databases. Their refactoring and code analysis are among the best in the world, but the full versions are paid and heavier than VS Code. They are a common choice for large, enterprise projects.'
    },
    {
      id: 'mobile_ides',
      keywords: [
        'اندروید استودیو',
        'ایکس کد',
        'محیط توسعه اندروید',
        'android studio',
        'xcode',
        'ide for mobile apps'
      ],
      weak: ['اندروید استودیو', 'ایکس کد', 'android studio', 'xcode'],
      weakSafe: true,
      hints: ['محیط', 'اپ', 'اندروید', 'آی او اس', 'ide', 'app', 'ios'],
      fa: 'برای اپ موبایل دو IDE اصلی وجود دارد: اندروید استودیو (بر پایه‌ی اینتلیجی، زبان کاتلین/جاوا، با شبیه‌ساز داخلی) و ایکس‌کد اپل (زبان سوئیفت، فقط روی مک، با شبیه‌ساز iOS). هر دو ابزار رسمی پلتفرم‌شان هستند و برای توسعه‌ی نیتیو انتخاب درست‌اند؛ برای کراس‌پلتفرم با فلاتر یا ری‌اکت نیتیو می‌توانی از VS Code هم استفاده کنی.',
      en: 'Two main IDEs exist for mobile apps: Android Studio (built on IntelliJ, Kotlin/Java, with an emulator) and Apple’s Xcode (Swift, macOS only, with an iOS simulator). Both are the official tools of their platform and the right choice for native development; for cross-platform work with Flutter or React Native you can also use VS Code.'
    },
    {
      id: 'terminal_editors',
      keywords: [
        'ویم',
        'نئوویم',
        'ادیتور ترمینال',
        'vim',
        'neovim',
        'emacs',
        'terminal editor'
      ],
      weak: ['ویم', 'نئوویم', 'vim', 'neovim', 'emacs'],
      weakSafe: true,
      hints: ['ادیتور', 'ترمینال', 'چیه', 'editor', 'terminal', 'what'],
      fa: 'ادیتورهای ترمینالی مثل ویم، نئوویم و ایمکس قدیمی‌ترین و سریع‌ترین ابزارهای کدنویسی‌اند و با صفحه‌کلید کامل کنترل می‌شوند. یادگیری‌شان شیب تندی دارد، اما بعد از تسلط خیلی سریع و قابل شخصی‌سازی‌اند و روی هر سروری بدون گرافیک کار می‌کنند. برای کار روی سرور راه دور و حرفه‌ای‌های قدیمی محبوب‌اند؛ برای تازه‌کارها VS Code راحت‌تر است.',
      en: 'Terminal editors like Vim, Neovim, and Emacs are the oldest and fastest coding tools, fully controlled from the keyboard. They have a steep learning curve, but once mastered they are extremely fast, customizable, and run on any server without graphics. They are popular for remote server work and among long-time professionals; for beginners, VS Code is easier.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
