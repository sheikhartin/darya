/**
 * Darya - curated factual entries (programming language comparisons).
 * Loaded before knowledge-base.js; registers a global part. Individual
 * language entries live in knowledge-facts-languages.js.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'python_vs_javascript',
      keywords: [
        'پایتون یا جاوااسکریپت',
        'پایتون و جاوااسکریپت',
        'فرق پایتون و جاوااسکریپت',
        'مقایسه پایتون و جاوااسکریپت',
        'python or javascript',
        'python vs javascript',
        'javascript or python',
        'difference between python and javascript'
      ],
      weak: ['پایتون', 'جاوااسکریپت', 'python', 'javascript'],
      weakSafe: false,
      hints: ['فرق', 'مقایسه', 'کدوم', 'better', 'vs', 'or', 'difference'],
      fa: 'پایتون و جاوااسکریپت دو پرکاربردترین زبان شروع‌اند، اما هدف‌شان فرق دارد. پایتون برای هوش مصنوعی، علم داده، خودکارسازی و بک‌اند ساده است؛ جاوااسکریپت برای هر چیزی که در مرورگر می‌بینی و با Node.js برای بک‌اند. اگر می‌خواهی وب تعاملی بسازی، جاوااسکریپت را شروع کن؛ اگر سمت داده و هوش مصنوعی می‌خواهی، پایتون. هر دو انتخاب خوبی‌اند و خیلی‌ها هر دو را یاد می‌گیرند.',
      en: 'Python and JavaScript are the two most common starter languages, but their goals differ. Python is for AI, data science, automation, and simple backends; JavaScript is for everything you see in the browser, and with Node.js for the backend too. If you want to build interactive web pages, start with JavaScript; if you want data and AI, start with Python. Both are good choices, and many people learn both.'
    },
    {
      id: 'java_vs_kotlin',
      keywords: [
        'جاوا یا کاتلین',
        'کاتلین یا جاوا',
        'فرق جاوا و کاتلین',
        'مقایسه جاوا و کاتلین',
        'java vs kotlin',
        'kotlin vs java',
        'java or kotlin',
        'kotlin or java',
        'difference between java and kotlin'
      ],
      weak: ['جاوا', 'کاتلین', 'java', 'kotlin'],
      weakSafe: false,
      hints: [
        'فرق',
        'مقایسه',
        'کدوم',
        'اندروید',
        'vs',
        'or',
        'android',
        'difference'
      ],
      fa: 'جاوا و کاتلین هر دو روی ماشین مجازی اجرا می‌شوند و برای اندروید استفاده می‌شوند، اما کاتلین زبان رسمی و مدرن‌تر است. کاتلین کد کوتاه‌تر و امن‌تری دارد و خطاهای null را کمتر می‌کند؛ جاوا سابقه‌ی بیشتر، مستندات فراوان و نقش‌های سازمانی بیشتری دارد. برای پروژه‌ی جدید اندروید معمولاً کاتلین پیشنهاد می‌شود، ولی دانستن جاوا هنوز ارزشمند است.',
      en: 'Java and Kotlin both run on the Java Virtual Machine and both build Android apps, but Kotlin is the official, more modern language. Kotlin is shorter and safer with fewer null errors, while Java has more history, abundant documentation, and more enterprise roles. For a new Android project Kotlin is usually recommended, but knowing Java still has value.'
    },
    {
      id: 'go_vs_rust',
      keywords: [
        'گو یا راست',
        'راست یا گو',
        'فرق گو و راست',
        'مقایسه گو و راست',
        'go vs rust',
        'rust vs go',
        'go or rust',
        'rust or go',
        'difference between go and rust'
      ],
      weak: ['گو', 'راست', 'golang', 'go', 'rust'],
      weakSafe: false,
      hints: [
        'فرق',
        'مقایسه',
        'کدوم',
        'زبان',
        'vs',
        'or',
        'difference',
        'language'
      ],
      fa: 'گو و راست هر دو برای کارهای سیستمی و زیرساخت ساخته شده‌اند اما فلسفه‌ی متفاوتی دارند. گو سادگی و بهره‌وری را اولویت می‌دهد: یادگیری سریع، کامپایل سریع و هم‌روندی آسان. راست ایمنی و کنترل را اولویت می‌دهد: امنیت حافظه در زمان کامپایل و اجرای نزدیک به سخت‌افزار، به قیمت منحنی یادگیری سخت‌تر. برای سرویس‌های ابری و تیم‌ها گو راحت‌تر است؛ برای سیستم‌های حیاتی که خطای حافظه فاجعه است، راست.',
      en: 'Go and Rust are both built for systems and infrastructure work but with different philosophies. Go prioritizes simplicity and productivity: fast to learn, fast to compile, and easy concurrency. Rust prioritizes safety and control: compile-time memory safety and close-to-the-metal execution, at the cost of a steeper learning curve. For cloud services and teams, Go is easier; for safety-critical systems where a memory bug is a disaster, Rust.'
    },
    {
      id: 'c_vs_cpp',
      keywords: [
        'سی یا سی پلاس پلاس',
        'فرق سی و سی پلاس پلاس',
        'مقایسه c و c++',
        'c or c++',
        'c vs c++',
        'c or c plus plus',
        'c vs c plus plus',
        'difference between c and c++',
        'difference between c and c plus plus'
      ],
      weak: ['سی', 'c', 'c++', 'سی پلاس پلاس', 'c plus plus'],
      weakSafe: false,
      hints: [
        'فرق',
        'مقایسه',
        'کدوم',
        'زبان',
        'vs',
        'or',
        'difference',
        'language'
      ],
      fa: 'سی و سی‌پلاس‌پلاس به هم نزدیک‌اند اما مدل ذهنی‌شان فرق دارد. سی زبانی رویه‌ای و ساده است که کنترل کامل و کمترین لایه‌ی انتزاع را می‌دهد؛ سی‌پلاس‌پلاس همان قدرت را با کلاس‌ها، الگوها و کتابخانه‌ی استاندارد بزرگ‌تر گسترش می‌دهد. برای هسته و ابزارهای بسیار سطح پایین، سی تمیزتر است؛ برای بازی، موتور و نرم‌افزار پیچیده، سی‌پلاس‌پلاس ابزارهای بیشتری دارد.',
      en: 'C and C++ are close relatives with different mental models. C is a simple, procedural language giving full control with the least abstraction; C++ extends that power with classes, templates, and a much larger standard library. For kernels and the lowest-level tools, C is cleaner; for games, engines, and complex software, C++ gives you more tools.'
    },
    {
      id: 'native_vs_crossplatform',
      keywords: [
        'نیتیو یا کراس پلتفرم',
        'فرق نیتیو و کراس پلتفرم',
        'نیتیو یا فلاتر',
        'برنامه نیتیو یا هیبریدی',
        'native or cross platform',
        'native vs flutter',
        'native vs react native',
        'flutter or native',
        'difference between native and cross platform'
      ],
      weak: [
        'نیتیو',
        'کراس پلتفرم',
        'فلاتر',
        'ری‌اکت نیتیو',
        'native',
        'cross platform',
        'flutter'
      ],
      weakSafe: false,
      hints: ['اپ', 'موبایل', 'کدوم', 'app', 'mobile', 'vs', 'or', 'better'],
      fa: 'اپ نیتیو با زبان رسمی هر پلتفرم ساخته می‌شود (کاتلین برای اندروید، سویفت برای iOS) و بهترین کارایی و دسترسی کامل به امکانات دستگاه را دارد، ولی باید دو کد جدا بنویسی. کراس‌پلتفرم (فلاتر یا ری‌اکت نیتیو) با یک کد دو پلتفرم را می‌گیرد و سریع‌تر و ارزان‌تر است، ولی در کارهای خیلی سنگین یا حس‌وحال کاملاً بومی کمی عقب‌تر است. برای MVP و تیم کوچک کراس‌پلتفرم عالی است؛ برای اپ حرفه‌ای با کارایی حداکثری، نیتیو.',
      en: 'A native app is built with each platform’s official language (Kotlin for Android, Swift for iOS) and gets the best performance and full access to device features, but you write two separate codebases. Cross-platform (Flutter or React Native) reaches both platforms with one codebase, faster and cheaper, though it can lag slightly on very heavy or fully-native-feeling work. For an MVP or a small team, cross-platform is great; for a top-performance professional app, native.'
    },
    {
      id: 'compare_all_languages',
      keywords: [
        'همه زبان های برنامه نویسی',
        'مقایسه همه زبان ها',
        'همه زبان های برنامه‌نویسی',
        'زبان ها رو مقایسه کن',
        'زبان‌ها را مقایسه کن',
        'مقایسه زبان های برنامه نویسی',
        'compare all programming languages',
        'comparison of programming languages',
        'overview of programming languages'
      ],
      weak: [
        'زبان های برنامه نویسی',
        'زبان‌های برنامه‌نویسی',
        'programming languages'
      ],
      weakSafe: true,
      hints: [
        'همه',
        'مقایسه',
        'مرور',
        'فرق',
        'compare',
        'overview',
        'all',
        'list'
      ],
      fa: 'یک نقشه‌ی کلی: پایتون برای هوش مصنوعی و داده، جاوااسکریپت و تایپ‌اسکریپت برای وب، جاوا و سی‌شارپ برای سازمان و سیستم‌های بزرگ، سی و سی‌پلاس‌پلاس برای هسته و بازی، گو و راست برای زیرساخت و ابر، کاتلین و سویفت برای موبایل نیتیو، دارت برای فلاتر و کراس‌پلتفرم، پی‌اچ‌پی و روبی برای وب سمت سرور، و SQL برای داده. هیچ‌کدام «بهترین» نیست؛ بهترین آن است که با چیزی که می‌خواهی بسازی هم‌راستا باشد.',
      en: 'A quick map: Python for AI and data, JavaScript and TypeScript for the web, Java and C# for enterprise and large systems, C and C++ for kernels and games, Go and Rust for infrastructure and the cloud, Kotlin and Swift for native mobile, Dart for Flutter and cross-platform, PHP and Ruby for server-side web, and SQL for data. None is the best; the best is whichever matches what you want to build.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
