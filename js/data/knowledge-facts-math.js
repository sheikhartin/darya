/**
 * Darya - curated factual entries (everyday math concepts). Loaded
 * before knowledge-base.js; registers a global part.
 *
 * The concept companion to the computational layer in
 * factual-math.js / factual-math-extras.js: the engine COMPUTES «۱۷
 * mod ۵» and «فاکتوریل ۵», while this shelf EXPLAINS what a prime,
 * factorial, GCD, average, percentage, or the number pi actually is.
 * Entries stay a few sentences long so answers read like conversation,
 * not a textbook page.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'math_pi',
      keywords: [
        'عدد پی چیه',
        'عدد پی چیست',
        'پی چند است',
        'عدد پی',
        'what is pi',
        'number pi',
        'value of pi'
      ],
      weak: ['پی', 'pi'],
      weakSafe: true,
      hints: ['عدد', 'ریاضی', 'دایره', 'number', 'math', 'circle'],
      fa: 'عدد پی (π) نسبت محیط دایره به قطر آن است: حدود ۳٫۱۴۱۵۹. جادویش این است که برای هر دایره‌ای، از یک سکه تا مدار زمین، همین عدد ثابت است. اعشارش هیچ‌وقت تمام نمی‌شود و الگویی هم ندارد (عدد گنگ است)؛ برای همین مسابقه‌ی حفظ‌کردن رقم‌هایش هم وجود دارد! در عمل همان ۳٫۱۴ برای بیشتر حساب‌ها کافی است.',
      en: "Pi (π) is the ratio of a circle's circumference to its diameter: about 3.14159. The magic is that it is the same for every circle, from a coin to Earth's orbit. Its decimals never end and never repeat (it is irrational), which is why digit-memorizing contests exist! In practice, plain 3.14 covers most everyday math."
    },
    {
      id: 'math_prime_concept',
      keywords: [
        'عدد اول چیه',
        'عدد اول چیست',
        'عدد اول یعنی چی',
        'اعداد اول چی هستن',
        'اعداد اول',
        'what is a prime number',
        'what are prime numbers',
        'prime numbers'
      ],
      weak: ['عدد اول', 'prime'],
      weakSafe: true,
      hints: ['ریاضی', 'بخش', 'عدد', 'math', 'number', 'divisible'],
      fa: 'عدد اول عددی بزرگ‌تر از ۱ است که فقط بر ۱ و خودش بخش‌پذیر است: ۲، ۳، ۵، ۷، ۱۱، ۱۳ و همین‌طور تا بی‌نهایت. ۲ تنها عدد اول زوج است. اعداد اول «آجرهای سازنده‌ی» بقیه‌ی عددها هستند، چون هر عددی را می‌شود به ضرب اعداد اول شکست. رمزنگاری اینترنت (همان قفل سبز مرورگرت) هم روی سختی شکستن اعداد اول خیلی بزرگ سوار است. اگر عددی داری، بپرس تا برایت چک کنم اول است یا نه!',
      en: "A prime is a number greater than 1 that only divides by 1 and itself: 2, 3, 5, 7, 11, 13 and on forever. Two is the only even prime. Primes are the building blocks of all other numbers, since every number breaks down into a product of primes, and internet encryption (that green lock in your browser) rides on how hard it is to crack huge primes. Got a number in mind? Ask me and I'll check if it's prime!"
    },
    {
      id: 'math_factorial_concept',
      keywords: [
        'فاکتوریل چیه',
        'فاکتوریل چیست',
        'فاکتوریل یعنی چی',
        'what is a factorial',
        'what does factorial mean',
        'factorial meaning'
      ],
      weak: ['فاکتوریل', 'factorial'],
      weakSafe: true,
      hints: ['ریاضی', 'ضرب', 'عدد', 'math', 'multiply', 'number'],
      fa: 'فاکتوریل یعنی ضرب یک عدد در همه‌ی عددهای صحیح کوچک‌تر از خودش تا ۱: فاکتوریل ۴ می‌شود ۴×۳×۲×۱ یعنی ۲۴ و علامتش «!» است. کاربرد اصلی‌اش شمردن حالت‌هاست: چند جور می‌شود ۴ کتاب را کنار هم چید؟ دقیقاً ۲۴ جور. این عددها وحشتناک سریع رشد می‌کنند؛ فاکتوریل ۲۰ از دو و نیم میلیارد میلیارد هم بیشتر است! یک عدد بگو تا فاکتوریلش را برایت حساب کنم.',
      en: "A factorial multiplies a number by every whole number below it down to 1: 4 factorial is 4×3×2×1 = 24, written with an exclamation mark (4!). Its main job is counting arrangements: how many ways can you line up 4 books? Exactly 24. These numbers grow terrifyingly fast; 20! is over two and a half billion billion! Give me a number and I'll compute its factorial."
    },
    {
      id: 'math_gcd_lcm_concept',
      keywords: [
        'ب.م.م چیه',
        'ب م م چیه',
        'ک.م.م چیه',
        'ک م م چیه',
        'بزرگترین مقسوم علیه مشترک چیه',
        'کوچکترین مضرب مشترک چیه',
        'what is gcd',
        'what is lcm',
        'greatest common divisor meaning'
      ],
      // No weak words on purpose: a question that carries actual numbers
      // («کوچکترین مضرب مشترک ۳ و ۵ چیه») must reach the calculator in
      // factual-math-extras.js, not this concept entry.
      weak: [],
      weakSafe: true,
      hints: ['ریاضی', 'عدد', 'کسر', 'math', 'number', 'fraction'],
      fa: 'ب.م.م (بزرگ‌ترین مقسوم‌علیه مشترک) بزرگ‌ترین عددی است که دو عدد را هم‌زمان عاد می‌کند؛ مثلاً ب.م.م ۱۲ و ۱۸ می‌شود ۶. ک.م.م (کوچک‌ترین مضرب مشترک) کوچک‌ترین عددی است که هر دو در آن جا می‌شوند؛ برای ۴ و ۶ می‌شود ۱۲. اولی برای ساده‌کردن کسرها به کار می‌آید و دومی برای هم‌مخرج‌کردن. دو عدد بده تا همین‌جا حساب کنم!',
      en: 'The GCD (greatest common divisor) is the biggest number that divides two numbers at once; for 12 and 18 it is 6. The LCM (least common multiple) is the smallest number both fit into; for 4 and 6 it is 12. The first simplifies fractions, the second finds common denominators. Give me two numbers and I will work them out right here!'
    },
    {
      id: 'math_average_concept',
      keywords: [
        'میانگین چیه',
        'میانگین چیست',
        'میانه چیه',
        'میانگین و میانه',
        'مد چیه ریاضی',
        'what is an average',
        'what is the mean',
        'mean median mode'
      ],
      weak: ['میانگین', 'میانه', 'average', 'median'],
      weakSafe: true,
      hints: ['ریاضی', 'عدد', 'آمار', 'math', 'numbers', 'statistics'],
      fa: 'میانگین یعنی جمع همه‌ی عددها تقسیم بر تعدادشان؛ میانگین ۳ و ۷ و ۸ می‌شود ۶. میانه عدد وسطی است وقتی مرتب‌شان کنی و مُد پرتکرارترین عدد است. فرقشان مهم است: اگر ۹ نفر حقوق معمولی بگیرند و یک میلیاردر وارد اتاق شود، «میانگین» درآمد اتاق منفجر می‌شود ولی «میانه» تقریباً همان می‌ماند؛ برای همین آمارها گاهی گمراه‌کننده‌اند. چند تا عدد بده تا میانگینشان را بگیرم.',
      en: "The average (mean) adds all the numbers and divides by how many there are; the average of 3, 7 and 8 is 6. The median is the middle value once sorted, and the mode is the most frequent one. The difference matters: if nine people earn normal salaries and a billionaire walks in, the room's average explodes while the median barely moves; that's how statistics can mislead. Give me some numbers and I'll average them."
    },
    {
      id: 'math_percentage_concept',
      keywords: [
        'درصد چیه',
        'درصد چیست',
        'درصد یعنی چی',
        'درصد چطور حساب میشه',
        'محاسبه درصد',
        'what is a percentage',
        'how do percentages work',
        'how to calculate percentage'
      ],
      weak: ['درصد', 'percentage'],
      weakSafe: true,
      hints: ['ریاضی', 'حساب', 'عدد', 'math', 'calculate', 'number'],
      fa: 'درصد یعنی «از هر صد تا»: ۲۰ درصد یعنی ۲۰ از هر ۱۰۰، یا همان ۰٫۲. برای حساب‌کردنش عدد را در درصد ضرب کن و بر ۱۰۰ تقسیم: ۲۰ درصدِ ۱۵۰ می‌شود ۳۰. یک ترفند قشنگ: «الف درصدِ ب» همیشه با «ب درصدِ الف» برابر است؛ ۸ درصد ۲۵ همان ۲۵ درصد ۸ است، یعنی ۲. تخفیف، سود بانکی و نمره همه با همین منطق کار می‌کنند؛ عدد بده تا برایت حساب کنم.',
      en: 'Percent means "out of every hundred": 20 percent is 20 out of 100, or 0.2. To compute it, multiply the number by the percent and divide by 100: 20 percent of 150 is 30. A lovely trick: A percent of B always equals B percent of A, so 8% of 25 is the same as 25% of 8, which is 2. Discounts, interest and grades all run on this one idea; give me numbers and I\'ll do the math.'
    },
    {
      id: 'math_fibonacci',
      keywords: [
        'فیبوناچی چیه',
        'دنباله فیبوناچی',
        'اعداد فیبوناچی',
        'what is fibonacci',
        'fibonacci sequence',
        'fibonacci numbers'
      ],
      weak: ['فیبوناچی', 'fibonacci'],
      weakSafe: true,
      hints: ['دنباله', 'ریاضی', 'عدد', 'sequence', 'math', 'number'],
      fa: 'دنباله‌ی فیبوناچی از ۰ و ۱ شروع می‌شود و هر عدد جمع دو عدد قبلی است: ۰، ۱، ۱، ۲، ۳، ۵، ۸، ۱۳، ۲۱... جذابیتش این است که در طبیعت هم پیدایش می‌کنی: چیدمان دانه‌های آفتابگردان، مارپیچ صدف‌ها و آرایش برگ‌ها. نسبت هر عدد به قبلی‌اش هم به «نسبت طلایی» (حدود ۱٫۶۱۸) میل می‌کند؛ همان نسبتی که در هنر و معماری به چشم‌نوازی معروف است.',
      en: 'The Fibonacci sequence starts with 0 and 1, and every number is the sum of the previous two: 0, 1, 1, 2, 3, 5, 8, 13, 21... The charm is that nature keeps using it: sunflower seed spirals, seashells, leaf arrangements. The ratio between consecutive numbers also drifts toward the golden ratio (about 1.618), the proportion famous for looking pleasing in art and architecture.'
    },
    {
      id: 'math_pythagoras',
      keywords: [
        'قضیه فیثاغورس',
        'فیثاغورس چیه',
        'رابطه فیثاغورس',
        'pythagorean theorem',
        'pythagoras theorem',
        'what is the pythagorean theorem'
      ],
      weak: ['فیثاغورس', 'pythagoras', 'pythagorean'],
      weakSafe: true,
      hints: ['مثلث', 'ریاضی', 'هندسه', 'triangle', 'math', 'geometry'],
      fa: 'قضیه‌ی فیثاغورس درباره‌ی مثلث‌های قائم‌الزاویه است: مربع وتر برابر است با جمع مربع دو ضلع دیگر (a² + b² = c²). یعنی اگر دو ضلع ۳ و ۴ باشند، وتر می‌شود ۵، چون ۹ + ۱۶ = ۲۵. بناها، نجارها و بازی‌سازها هر روز با همین رابطه فاصله و گوشه‌ی راست می‌سازند. البته این رابطه قرن‌ها قبل از فیثاغورس در بابل و هند هم شناخته شده بود؛ اسمش به او رسید چون مکتبش آن را اثبات و معروف کرد.',
      en: 'The Pythagorean theorem is about right triangles: the square of the hypotenuse equals the sum of the squares of the other two sides (a² + b² = c²). So with sides 3 and 4, the hypotenuse is 5, because 9 + 16 = 25. Builders, carpenters and game developers use it daily for distances and right angles. Babylon and India actually knew the relation centuries before Pythagoras; his school got the name by proving and popularizing it.'
    },
    {
      id: 'math_infinity',
      keywords: [
        'بی نهایت چیه',
        'بینهایت چیه',
        'مفهوم بی نهایت',
        'بی نهایت یعنی چی',
        'what is infinity',
        'concept of infinity',
        'is infinity a number'
      ],
      weak: ['بی نهایت', 'بینهایت', 'infinity'],
      weakSafe: true,
      hints: ['ریاضی', 'عدد', 'مفهوم', 'math', 'number', 'concept'],
      fa: 'بی‌نهایت (∞) یک عدد نیست؛ یک مفهوم است: «بدون پایان». نمی‌شود با آن مثل عدد حساب کرد؛ بی‌نهایت منهای بی‌نهایت جواب مشخصی ندارد. عجیب‌ترش اینکه بی‌نهایت‌ها اندازه‌های مختلف دارند: ریاضی‌دان‌ها ثابت کرده‌اند اعداد اعشاری بین ۰ و ۱ «بی‌نهایتِ بزرگ‌تری» از کل اعداد طبیعی‌اند! این کشف گئورگ کانتور در قرن نوزدهم بود که اولش کلی جنجال به پا کرد و حالا پایه‌ی ریاضیات مدرن است.',
      en: "Infinity (∞) isn't a number; it's a concept meaning \"without end\". You can't do ordinary arithmetic with it; infinity minus infinity has no fixed answer. Stranger still, infinities come in different sizes: mathematicians proved the decimals between 0 and 1 form a BIGGER infinity than all the counting numbers! That was Georg Cantor's 19th-century discovery, scandalous at first and foundational to modern math now."
    },
    {
      id: 'math_equation_basics',
      keywords: [
        'معادله چیه',
        'معادله چیست',
        'معادله یعنی چی',
        'جبر چیه',
        'حل معادله یاد بده',
        'what is an equation',
        'what is algebra',
        'how to solve an equation'
      ],
      weak: ['معادله', 'جبر', 'equation', 'algebra'],
      weakSafe: true,
      hints: ['ریاضی', 'مجهول', 'حل', 'math', 'solve', 'unknown'],
      fa: 'معادله یک ترازوی متعادل است: دو طرفِ علامت مساوی هم‌وزن‌اند و مجهول (معمولاً x) وزنه‌ی ناشناخته است. قانون طلایی حلش هم همین است: هر کاری با یک کفه کردی، با کفه‌ی دیگر هم بکن. مثلاً در «x + 3 = 10» از هر دو طرف ۳ کم کن تا بشود «x = 7». جبر همین بازی پیداکردن مجهول‌هاست و واژه‌اش هم از کتاب «الجبر» خوارزمی، ریاضی‌دان ایرانی، آمده. یک معادله‌ی ساده بگو تا با هم حلش کنیم.',
      en: 'An equation is a balanced scale: the two sides of the equals sign weigh the same, and the unknown (usually x) is the mystery weight. The golden rule of solving is exactly that: whatever you do to one side, do to the other. In "x + 3 = 10", subtract 3 from both sides to get "x = 7". Algebra is just this unknown-hunting game, and the word itself comes from "al-jabr", the book by the Iranian mathematician Khwarizmi. Give me a simple equation and let\'s solve it together.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
