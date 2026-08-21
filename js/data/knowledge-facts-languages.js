/**
 * Darya - curated factual entries (programming languages, individual).
 * Loaded before knowledge-base.js; registers a global part. Companion
 * comparison entries live in knowledge-facts-language-compare.js.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'typescript',
      keywords: [
        'تایپ اسکریپت',
        'تایپ‌اسکریپت',
        'typescript چیه',
        'زبان تایپ اسکریپت',
        'what is typescript',
        'typescript vs javascript'
      ],
      weak: ['تایپ اسکریپت', 'تایپ‌اسکریپت', 'typescript'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'فرق', 'language', 'what', 'typed'],
      fa: 'تایپ‌اسکریپت نسخه‌ی تایپ‌دار جاوااسکریپت است که مایکروسافت ساخت و خطاها را هنگام نوشتن کد پیدا می‌کند، نه موقع اجرا. با تعریف نوع داده‌ها، پروژه‌های بزرگ تمیزتر و قابل نگهداری‌تر می‌شوند و ویرایشگر تکمیل و بازآرایی بهتری می‌دهد. در نهایت به جاوااسکریپت کامپایل می‌شود، پس هر جا جاوااسکریپت اجرا شود، تایپ‌اسکریپت هم می‌شود. از میانه‌ی دهه‌ی ۲۰۲۰ به استاندارد تیم‌های بزرگ وب تبدیل شده است.',
      en: 'TypeScript is the typed version of JavaScript, built by Microsoft, that catches errors while you write instead of while the app runs. By declaring data types, large projects stay cleaner and more maintainable, and editors give better autocomplete and refactoring. It compiles to plain JavaScript, so it runs anywhere JavaScript does. By the mid-2020s it had become the standard for large web teams.'
    },
    {
      id: 'java_language',
      keywords: [
        'زبان جاوا',
        'جاوا چیه',
        'جاوا چیست',
        'زبان برنامه نویسی جاوا',
        'what is java',
        'java programming language'
      ],
      weak: ['جاوا', 'java', 'jvm'],
      weakSafe: true,
      hints: [
        'زبان',
        'چیه',
        'چیست',
        'برنامه نویسی',
        'language',
        'what',
        'programming'
      ],
      fa: 'جاوا زبانی شیءگرا و قدیمی اما بسیار مستحکم است که شعارش «یک بار بنویس، همه‌جا اجرا کن» بود. روی ماشین مجازی (JVM) اجرا می‌شود و هنوز ستون فقرات سیستم‌های بانکی، سازمانی و بخش بزرگی از اندروید است. کتابخانه‌ها و ابزارهایش بسیار بالغ‌اند و نیروی کار زیادی دارد، ولی کدش پرحرف‌تر از زبان‌های مدرن‌تر است. برای شغل‌های سازمانی پایدار انتخاب مطمئنی است.',
      en: 'Java is a long-lived, object-oriented language whose slogan was "write once, run anywhere." It runs on a virtual machine (the JVM) and still powers banks, enterprise systems, and much of Android. Its ecosystem is extremely mature with a huge workforce, though the code is more verbose than newer languages. It is a safe choice for stable enterprise jobs.'
    },
    {
      id: 'c_language',
      keywords: [
        'زبان سی',
        'زبان c',
        'سی چیه',
        'برنامه نویسی c',
        'what is the c language',
        'what is c programming'
      ],
      weak: ['زبان سی', 'c programming', 'زبان c'],
      weakSafe: true,
      hints: [
        'زبان',
        'چیه',
        'چیست',
        'برنامه نویسی',
        'language',
        'what',
        'low level'
      ],
      fa: 'سی زبانی سیستمی و پایه است که تقریباً همه‌ی سیستم‌عامل‌ها، هسته‌ها و ابزارهای سطح پایین با آن ساخته شده‌اند. نزدیک به سخت‌افزار است و مدیریت حافظه را خودت بر عهده می‌گیری، پس سریع است اما خطاهایش هم جدی‌ترند. یادگیری سی به تو می‌فهماند کامپیوتر زیرِ هود چطور کار می‌کند، حتی اگر هرگز روزانه با آن کد نزنی.',
      en: 'C is the foundational systems language that built most operating systems, kernels, and low-level tools. It sits close to the hardware and gives you manual memory control, so it is fast but its mistakes are more serious. Learning C teaches you how a computer works under the hood, even if you never write it daily.'
    },
    {
      id: 'cplusplus',
      keywords: [
        'سی پلاس پلاس',
        'سی‌پلاس‌پلاس',
        'زبان c++',
        'what is c++',
        'what is c plus plus',
        'c plus plus',
        'cpp language',
        'c++ programming'
      ],
      weak: ['سی پلاس پلاس', 'سی‌پلاس‌پلاس', 'c++', 'cpp', 'c plus plus'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'بازی', 'language', 'what', 'game'],
      fa: 'سی‌پلاس‌پلاس نسخه‌ی شیءگرای سی است که سرعت خام را با قابلیت‌های سطح بالا ترکیب می‌کند. استاندارد بازی‌های AAA، موتورهای بازی، مرورگرها و نرم‌افزارهای سنگین مثل پایگاه‌های داده است. قدرتش از کنترل کامل روی حافظه و اجرای نزدیک به سخت‌افزار می‌آید، اما همین کنترل، یادگیری و رفع خطایش را سخت می‌کند.',
      en: 'C++ is the object-oriented evolution of C that combines raw speed with high-level features. It is the standard for AAA games, game engines, browsers, and heavy software like databases. Its power comes from full memory control and close-to-the-metal execution, which also makes it harder to learn and debug.'
    },
    {
      id: 'csharp_language',
      keywords: [
        'سی شارپ',
        'زبان سی شارپ',
        'شارپ چیه',
        '#c چیست',
        'what is c sharp',
        'what is c#',
        'c sharp language',
        'csharp'
      ],
      weak: ['سی شارپ', 'سی‌شارپ', 'c sharp', 'csharp', 'c#'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'دات نت', 'language', 'what', 'net'],
      fa: 'سی‌شارپ زبان اصلی مایکروسافت است که با چارچوب .NET برای اپ‌های ویندوز، وب و بازی (با موتور یونیتی) استفاده می‌شود. تعادل خوبی بین عملکرد و بهره‌وری دارد و ابزارسازی آن در ویژوال استودیو عالی است. با .NET مدرن کراس‌پلتفرم هم هست و روی لینوکس و مک اجرا می‌شود.',
      en: 'C# is Microsoft’s primary language, used with the .NET framework for Windows apps, the web, and games through the Unity engine. It balances performance and productivity well, with excellent tooling in Visual Studio. Modern .NET is cross-platform, so it also runs on Linux and macOS.'
    },
    {
      id: 'go_language',
      keywords: [
        'زبان گو',
        'گو چیه',
        'برنامه نویسی go',
        'زبان golang',
        'what is golang',
        'what is the go language'
      ],
      weak: ['زبان گو', 'golang', 'go language'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'ابر', 'language', 'what', 'cloud'],
      fa: 'گو زبانی است که گوگل برای سادگی و هم‌روندی ساخته است. با goroutineها هزاران کار را همزمان انجام می‌دهد و برای میکروسرویس‌ها، ابزارهای زیرساخت و ابر عالی است. نحو ساده و کامپایل سریعش باعث شده تیم‌های ابری عاشقش شوند. برای بک‌اند پرفشار و ابزارهای خط فرمان انتخاب مدرن و تمیزی است.',
      en: 'Go is a language Google built for simplicity and concurrency. Its goroutines run thousands of tasks at once, which makes it excellent for microservices, infrastructure tooling, and the cloud. Its simple syntax and fast compilation made it a favorite of cloud teams. It is a clean, modern pick for high-traffic backends and command-line tools.'
    },
    {
      id: 'rust_language',
      keywords: [
        'زبان راست',
        'راست چیه',
        'برنامه نویسی rust',
        'زبان rust',
        'what is rust',
        'rust programming language'
      ],
      weak: ['زبان راست', 'زبان rust', 'rust'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'سیستم', 'language', 'what', 'systems'],
      fa: 'راست زبانی سیستمی مدرن است که امنیت حافظه را بدون جمع‌آوری زباله تضمین می‌کند: کامپایلر جلوی خطاهای رایج حافظه را می‌گیرد. سرعتش در حد سی و سی‌پلاس‌پلاس است اما ایمن‌تر. یادگیری‌اش سخت‌تر است، ولی برای سیستم‌های حیاتی، وب‌اسمبلی و ابزارهای زیرساخت آینده‌دار است و سال‌ها در نظرسنجی‌ها محبوب‌ترین زبان بوده است.',
      en: 'Rust is a modern systems language that guarantees memory safety without garbage collection: the compiler blocks common memory bugs. It is as fast as C and C++ but safer. It is harder to learn, but it is a strong bet for safety-critical systems, WebAssembly, and infrastructure tooling, and it has topped developer surveys for years.'
    },
    {
      id: 'kotlin_language',
      keywords: [
        'زبان کاتلین',
        'کاتلین چیه',
        'برنامه نویسی kotlin',
        'زبان kotlin',
        'what is kotlin',
        'kotlin language'
      ],
      weak: ['کاتلین', 'kotlin'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'اندروید', 'language', 'what', 'android'],
      fa: 'کاتلین زبان رسمی اندروید است که گوگل پشتیبانی می‌کند و با جاوا کاملاً سازگار است. کدش کوتاه‌تر و امن‌تر از جاواست و خطاهای null را کم می‌کند؛ در بک‌اند هم با Ktor یا Spring استفاده می‌شود. اگر هدف‌ت اپ اندروید است، کاتلین انتخاب اصلی است.',
      en: 'Kotlin is the official Android language, backed by Google and fully compatible with Java. Its code is shorter and safer than Java, reducing null errors, and it also runs on the backend with Ktor or Spring. If your goal is Android apps, Kotlin is the primary choice.'
    },
    {
      id: 'swift_language',
      keywords: [
        'زبان سویفت',
        'سویفت چیه',
        'برنامه نویسی swift',
        'زبان swift',
        'what is swift',
        'swift language'
      ],
      weak: ['سویفت', 'swift'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'اپل', 'language', 'what', 'apple'],
      fa: 'سویفت زبان اپل است که برای iOS، مک، واچ و تلویزیون اپل ساخته شد. از هدف-سی مدرن‌تر، امن‌تر و سریع‌تر است و با Xcode تجربه‌ی توسعه‌ی یکپارچه‌ای دارد. اگر می‌خواهی در اکوسیستم اپل اپ بسازی، سویفت زبان اصلی است و SwiftUI رابط‌سازی را ساده کرده است.',
      en: 'Swift is Apple’s language, built for iOS, macOS, watchOS, and tvOS. It is more modern, safer, and faster than Objective-C, with a unified developer experience in Xcode. If you want to build for the Apple ecosystem, Swift is the primary language, and SwiftUI has made interfaces simpler.'
    },
    {
      id: 'php_language',
      keywords: [
        'زبان پی اچ پی',
        'زبان php',
        'پی اچ پی چیه',
        'php چیست',
        'what is php',
        'php language'
      ],
      weak: ['پی اچ پی', 'php'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'وب', 'language', 'what', 'web'],
      fa: 'پی‌اچ‌پی زبان سمت سرور وب است که وردپرس، لاراول و بخش بزرگی از اینترنت را می‌گرداند. یادگیری‌اش آسان است و میزبانی‌اش ارزان و همه‌جا حاضر. با نسخه‌های مدرن و فریم‌ورک لاراول دوباره محبوب شده و برای سایت‌های محتوامحور و فروشگاهی هنوز انتخاب بسیار رایجی است.',
      en: 'PHP is the server-side web language behind WordPress, Laravel, and a large share of the internet. It is easy to learn and cheap to host everywhere. Modern versions and the Laravel framework revived it in recent years, and it remains a very common choice for content sites and online stores.'
    },
    {
      id: 'ruby_language',
      keywords: [
        'زبان روبی',
        'روبی چیه',
        'زبان ruby',
        'روبی آن ریلز',
        'what is ruby',
        'ruby language'
      ],
      weak: ['روبی', 'ruby', 'ریلز', 'rails'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'وب', 'language', 'what', 'web'],
      fa: 'روبی زبانی خوانا و مینیمال است که با فریم‌ورک Rails (روبی آن ریلز) موج استارتاپ‌های دهه‌ی ۲۰۰۰ را ساخت. فلسفه‌اش «شادی برنامه‌نویس» است و کدش به زبان طبیعی نزدیک است. هنوز برای استارتاپ‌ها و اپ‌های SaaS عالی است، ولی محبوبیتش نسبت به اوج خودش کمتر شده است.',
      en: 'Ruby is a readable, minimalist language whose Rails framework powered a wave of 2000s startups. Its philosophy is programmer happiness, with code that reads close to natural language. It is still excellent for startups and SaaS apps, though its popularity has softened from its peak.'
    },
    {
      id: 'dart_language',
      keywords: [
        'زبان دارت',
        'دارت چیه',
        'زبان dart',
        'دارت و فلاتر',
        'what is dart',
        'dart language'
      ],
      weak: ['دارت', 'dart', 'فلاتر', 'flutter'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'اپ', 'language', 'what', 'mobile'],
      fa: 'دارت زبان پشت فریم‌ورک فلاتر است که با یک کد واحد اپ اندروید، iOS، وب و دسکتاپ می‌سازد. گوگل آن را ساخت و برای رابط‌های کاربری سریع و یکدست عالی است. اگر می‌خواهی با یک زبان چند پلتفرم را پوشش بدهی، دارت و فلاتر یکی از بهترین گزینه‌ها هستند.',
      en: 'Dart is the language behind the Flutter framework, which builds Android, iOS, web, and desktop apps from a single codebase. Google created it, and it excels at fast, consistent user interfaces. If you want one language for many platforms, Dart and Flutter are among the best options.'
    },
    {
      id: 'sql_language',
      keywords: [
        'زبان اس کیو ال',
        'زبان sql',
        'اس کیو ال چیه',
        'sql چیست',
        'what is sql',
        'sql language'
      ],
      weak: ['اس کیو ال', 'sql', 'دیتابیس', 'database'],
      weakSafe: true,
      hints: ['زبان', 'چیه', 'چیست', 'داده', 'language', 'what', 'data'],
      fa: 'اس‌کیو‌ال زبان پرس‌وجو از پایگاه‌های داده است: با آن داده را می‌خوانی، می‌نویسی و جمع‌بندی می‌کنی. تقریباً هر برنامه‌ی واقعی به دیتابیس نیاز دارد و SQL چند دهه است که استاندارد آن مانده است. یادگیری SELECT، JOIN و GROUP BY مهارتی است که در هر حوزه‌ی برنامه‌نویسی به کار می‌آید.',
      en: 'SQL is the language for querying databases: you use it to read, write, and summarize data. Almost every real application needs a database, and SQL has been its standard for decades. Learning SELECT, JOIN, and GROUP BY is a skill that pays off in every programming field.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
