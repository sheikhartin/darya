/**
 * Darya - curated factual entries (art history and design).
 * Loaded before knowledge-base.js; registers a global part.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'art_history_timeline',
      keywords: [
        'تاریخ هنر',
        'سبک های هنری',
        'سبک‌های نقاشی',
        'جنبش های هنری',
        'art history',
        'art movements',
        'history of art',
        'timeline of art'
      ],
      weak: ['تاریخ هنر', 'سبک هنری', 'art history', 'art movement'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'مرور', 'نقاشی', 'what', 'overview', 'painting'],
      fa: 'تاریخ هنر یک خط مستقیم نیست؛ دوره‌ها هم‌پوشانی دارند و هر سبک به سبک قبلی پاسخ می‌دهد. مسیر کلی: هنر پیشاتاریخی (نقاشی غارها) و هنر باستان، سپس هنر قرون وسطی، رنسانس (پرسپکتیو و انسان‌گرایی)، باروک (درام و نور)، نئوکلاسیسم و رمانتیسم، رئالیسم، امپرسیونیسم (نور و لحظه)، و در قرن بیستم کوبیسم، سوررئالیسم، اکسپرسیونیسم انتزاعی، پاپ آرت و مینیمالیسم، تا هنر مفهومی و دیجیتال امروز.',
      en: 'Art history is not a straight line; periods overlap and each style answers the one before. The broad path: prehistoric and ancient art, then medieval art, the Renaissance (perspective and humanism), Baroque (drama and light), Neoclassicism and Romanticism, Realism, Impressionism (light and the moment), and in the twentieth century Cubism, Surrealism, Abstract Expressionism, Pop Art, and Minimalism, up to today’s conceptual and digital art.'
    },
    {
      id: 'cave_art',
      keywords: [
        'هنر غار',
        'نقاشی غار',
        'غار لاسکو',
        'قدیمی ترین هنر',
        'cave art',
        'cave painting',
        'lascaux'
      ],
      weak: ['غار', 'لاسکو', 'cave', 'lascaux'],
      weakSafe: true,
      hints: ['نقاشی', 'هنر', 'قدیمی', 'painting', 'art', 'oldest'],
      fa: 'نقاشی غارها قدیمی‌ترین هنر شناخته‌شده‌ی بشر است؛ نمونه‌های معروف مثل لاسکو در فرانسه ده‌ها هزار سال قدمت دارند. انسان‌ها با رنگدانه‌های طبیعی روی دیوار غار حیوانات، دست‌ها و صحنه‌های شکار را می‌کشیدند، احتمالاً برای آیین، آموزش یا ثبت جهان اطراف. این تصویرها نشان می‌دهند میل به ساختن تصویر از ابتدا با انسان همراه بوده است.',
      en: 'Cave paintings are humanity’s oldest known art; famous examples like Lascaux in France are tens of thousands of years old. People used natural pigments on cave walls to draw animals, hands, and hunting scenes, likely for ritual, teaching, or recording the world. These images show that the urge to make pictures has been with humans from the beginning.'
    },
    {
      id: 'renaissance_art',
      keywords: [
        'هنر رنسانس',
        'نقاشی رنسانس',
        'لئوناردو داوینچی',
        'لیوناردو داوینچی',
        'میکل آنژ',
        'renaissance art',
        'renaissance painting',
        'leonardo da vinci'
      ],
      weak: ['رنسانس', 'داوینچی', 'میکل آنژ', 'renaissance', 'da vinci'],
      weakSafe: true,
      hints: ['هنر', 'نقاشی', 'مونا لیزا', 'art', 'painting', 'mona lisa'],
      fa: 'رنسانس (تقریباً سده‌های ۱۴ تا ۱۶) احیای ایده‌های یونان و روم بود: هنر از تمرکز صرف بر دین به انسان، طبیعت و دانش برگشت. هنرمندانی مثل لئوناردو داوینچی، میکل‌آنژ و رافائل پرسپکتیو خطی، آناتومی دقیق و نورپردازی واقع‌گرایانه را ابداع کردند. آثاری مثل مونالیزا و سقف کلیسای سیستین از همین دوره‌اند.',
      en: 'The Renaissance (roughly the 14th to 16th centuries) revived Greek and Roman ideas: art turned from religion alone back to people, nature, and knowledge. Artists like Leonardo da Vinci, Michelangelo, and Raphael invented linear perspective, precise anatomy, and realistic lighting. Works like the Mona Lisa and the Sistine Chapel ceiling come from this period.'
    },
    {
      id: 'impressionism',
      keywords: [
        'امپرسیونیسم',
        'نقاشی امپرسیونیسم',
        'مونه',
        'ون گوگ',
        'impressionism',
        'impressionist painting',
        'monet',
        'van gogh'
      ],
      weak: ['امپرسیونیسم', 'مونه', 'ون گوگ', 'impressionism', 'monet'],
      weakSafe: true,
      hints: ['نقاشی', 'هنر', 'نور', 'painting', 'art', 'light'],
      fa: 'امپرسیونیسم در دهه‌ی ۱۸۷۰ در پاریس شکل گرفت و به‌جای جزئیات دقیق، نور، رنگ و لحظه‌ی گذرا را ثبت کرد. نقاشانی مثل مونه و رنوآر با قلم‌موهای کوتاه و رنگ‌های روشن، صحنه‌های روزمره و تغییر نور را می‌کشیدند. در ابتدا مسخره شد اما بعداً نقطه‌ی شروع هنر مدرن شناخته شد. ون گوگ و سزان معمولاً پست‌امپرسیونیست خوانده می‌شوند.',
      en: 'Impressionism emerged in 1870s Paris and captured light, color, and the fleeting moment instead of fine detail. Painters like Monet and Renoir used short brushstrokes and bright color to depict everyday scenes and changing light. It was mocked at first but later became known as the starting point of modern art. Van Gogh and Cezanne are usually called Post-Impressionists.'
    },
    {
      id: 'cubism',
      keywords: [
        'کوبیسم',
        'نقاشی کوبیسم',
        'پیکاسو',
        'cubism',
        'cubist painting',
        'picasso'
      ],
      weak: ['کوبیسم', 'پیکاسو', 'cubism', 'picasso'],
      weakSafe: true,
      hints: ['نقاشی', 'هنر', 'painting', 'art', 'geometric'],
      fa: 'کوبیسم حدود ۱۹۰۷ با پیکاسو و براک شروع شد و اشیا را از چند زاویه همزمان نشان می‌داد، گویی سوژه را تکه‌تکه و دوباره روی سطح تخت چیده‌اند. به‌جای یک دید ثابت، فرم‌های هندسی و وجه‌های هم‌زمان می‌بینیم. این ایده‌ی «دیدن از چند زاویه» انقلابی بود و مسیر هنر انتزاعی قرن بیستم را باز کرد.',
      en: 'Cubism began around 1907 with Picasso and Braque, showing objects from several angles at once, as if the subject were broken into pieces and rearranged on a flat surface. Instead of one fixed view we see geometric forms and simultaneous faces. This idea of seeing from multiple angles was revolutionary and opened the path to twentieth-century abstraction.'
    },
    {
      id: 'surrealism',
      keywords: [
        'سورئالیسم',
        'سوریالیسم',
        'سوررئالیسم',
        'سورریالیسم',
        'نقاشی سورئال',
        'نقاشی سوریال',
        'سالوادور دالی',
        'surrealism',
        'surrealist art',
        'salvador dali'
      ],
      weak: ['سورئالیسم', 'سوررئالیسم', 'دالی', 'surrealism', 'dali'],
      weakSafe: true,
      hints: ['نقاشی', 'هنر', 'خواب', 'painting', 'art', 'dream'],
      fa: 'سوررئالیسم در دهه‌ی ۱۹۲۰ از دل دادائیسم بیرون آمد و دنیای خواب، ناخودآگاه و تصویرهای غیرمنطقی را کاوش کرد. هنرمندانی مثل سالوادور دالی و رنه ماگریت صحنه‌هایی می‌ساختند که واقع‌گرایانه اما ناممکن‌اند، مثل ساعت‌های آب‌شده‌ی دالی. هدفش آزاد کردن تخیل از منطق بود و روی سینما و تبلیغات هم اثر گذاشت.',
      en: 'Surrealism grew out of Dadaism in the 1920s and explored dreams, the unconscious, and irrational imagery. Artists like Salvador Dali and Rene Magritte made scenes that are realistic yet impossible, such as Dali’s melting clocks. Its goal was to free the imagination from logic, and it also influenced film and advertising.'
    },
    {
      id: 'abstract_expressionism',
      keywords: [
        'اکسپرسیونیسم انتزاعی',
        'هنر انتزاعی',
        'نقاشی انتزاعی',
        'جکسون پولاک',
        'abstract expressionism',
        'abstract art',
        'jackson pollock'
      ],
      weak: ['انتزاعی', 'پولاک', 'abstract', 'pollock'],
      weakSafe: true,
      hints: ['نقاشی', 'هنر', 'painting', 'art', 'expression'],
      fa: 'اکسپرسیونیسم انتزاعی در دهه‌ی ۱۹۴۰ در نیویورک پدید آمد و نخستین جنبش بزرگ هنری آمریکا بود. هنرمندانی مثل جکسون پولاک با چکیدن و پاشیدن رنگ روی بوم (نقاشی کنشی) احساس را مستقیم و بدون سوژه‌ی واقعی نشان می‌دادند. ایده این بود که خودِ حرکت و رنگ، محتوای اثر است، نه تصویر یک چیز.',
      en: 'Abstract Expressionism emerged in 1940s New York and was the first major American art movement. Artists like Jackson Pollock dripped and flung paint onto the canvas (action painting) to express feeling directly, with no real subject. The idea was that the movement and color themselves are the content, not a picture of a thing.'
    },
    {
      id: 'pop_art',
      keywords: [
        'پاپ آرت',
        'هنر پاپ',
        'اندی وارهول',
        'pop art',
        'andy warhol',
        'pop art movement'
      ],
      weak: ['پاپ آرت', 'وارهول', 'pop art', 'warhol'],
      weakSafe: true,
      hints: ['هنر', 'مصرف', 'کنسرو', 'art', 'consumer', 'soup'],
      fa: 'پاپ آرت در دهه‌های ۱۹۵۰ و ۱۹۶۰ تصویرهای فرهنگ مصرفی و رسانه‌ی توده‌ای را وارد هنر کرد: قوطی سوپ کمبل، چهره‌ی مرلین مونرو و کمیک. اندی وارهول با چاپ سیلک همین تصویرها را تکرار می‌کرد تا مرز بین هنر والا و کالای روزمره را بپرسد. پاپ آرت طعنه‌آمیز، رنگارنگ و درباره‌ی شهرت و مصرف بود.',
      en: 'Pop Art brought mass-media and consumer imagery into fine art in the 1950s and 1960s: Campbell’s soup cans, Marilyn Monroe’s face, and comic strips. Andy Warhol repeated these images with silkscreen printing to question the border between high art and everyday goods. Pop Art was ironic, colorful, and about fame and consumption.'
    },
    {
      id: 'minimalism_art',
      keywords: [
        'مینیمالیسم در هنر',
        'هنر مینیمال',
        'مینیمال آرت',
        'minimalism art',
        'minimal art',
        'what is minimalism art',
        'minimalism in art'
      ],
      weak: ['مینیمال', 'مینیمالیسم', 'minimalism', 'minimal art'],
      weakSafe: true,
      hints: ['هنر', 'ساده', 'art', 'simple', 'form'],
      fa: 'مینیمالیسم دهه‌ی ۱۹۶۰ می‌گفت اثر هنری نباید چیز دیگری را «نشان دهد»؛ خودِ شیء، شکل، فضا و ماده، اثر است. فرم‌های ساده‌ی هندسی، رنگ‌های یکدست و مواد صنعتی جای روایت و احساس‌گرایی را گرفتند. شعار معروفش «آنچه می‌بینی همان است که هست» بود، واکنشی به درام اکسپرسیونیسم انتزاعی.',
      en: 'Minimalism in the 1960s said a work of art should not depict anything else; the object, shape, space, and material are the work itself. Simple geometric forms, flat color, and industrial materials replaced storytelling and emotionalism. Its famous motto was "what you see is what you see," a reaction to Abstract Expressionism’s drama.'
    },
    {
      id: 'conceptual_art',
      keywords: [
        'هنر مفهومی',
        'کانسپچوال آرت',
        'conceptual art',
        'what is conceptual art'
      ],
      weak: ['مفهومی', 'کانسپچوال', 'conceptual art'],
      weakSafe: true,
      hints: ['هنر', 'ایده', 'art', 'idea', 'meaning'],
      fa: 'در هنر مفهومی، ایده یا مفهوم مهم‌تر از شیء ساخته‌شده است؛ حتی دستورالعمل نوشتاری می‌تواند اثر باشد. مارسل دوشان با «چشمه» (یک آبریزگاه امضاشده) پرسید چه چیزی هنر را هنر می‌کند. این رویکرد از دهه‌ی ۱۹۶۰ به بعد باعث شد هنرمندان بیش از زیبایی، به معنا، نهاد هنر و نقش تماشاگر فکر کنند.',
      en: 'In conceptual art the idea is more important than the made object; even a written instruction can be the work. Marcel Duchamp’s "Fountain" (a signed urinal) asked what makes art, art. From the 1960s onward this approach made artists think about meaning, the art institution, and the viewer’s role more than about beauty.'
    },
    {
      id: 'modern_weird_art',
      keywords: [
        'هنر مدرن عجیب',
        'هنر عجیب',
        'کوسه در فرمالدهید',
        'موز چسبانده شده',
        'یا یوی کوساما',
        'weird modern art',
        'shark in formaldehyde',
        'banana taped to wall',
        'yayoi kusama'
      ],
      weak: ['عجیب', 'فرمالدهید', 'کوساما', 'weird art', 'readymade'],
      weakSafe: true,
      hints: ['هنر', 'مدرن', 'چرا', 'art', 'modern', 'why'],
      fa: 'هنر معاصر گاهی عمداً عجیب به نظر می‌رسد تا سؤال بسازد، نه صرفاً زیبا باشد. دیمین هرست کوسه‌ای در فرمالدهید گذاشت تا درباره‌ی مرگ و نمایش بپرسد؛ مائوریتسیو کاتلان یک موز را با چسب به دیوار چسباند تا ارزش، شهرت و نهاد هنر را به سخره بگیرد؛ و نقطه‌های بی‌پایان یایویی کوساما وسواس و بی‌نهایت را نشان می‌دهند. این آثار را می‌توان نپسندید، اما کارشان تحریک گفتگو است.',
      en: 'Contemporary art sometimes looks deliberately weird because it is built to raise questions, not just to be pretty. Damien Hirst put a shark in formaldehyde to ask about death and display; Maurizio Cattelan taped a banana to a wall to mock value, fame, and the art institution; and Yayoi Kusama’s endless dots express obsession and infinity. You may dislike these works, but their job is to provoke conversation.'
    },
    {
      id: 'sculpture_art',
      keywords: [
        'هنر مجسمه',
        'مجسمه هنری',
        'میکل آنژ داوود',
        'میکل‌آنژ',
        'رودن متفکر',
        'sculpture art',
        'michelangelo david',
        'rodin thinker'
      ],
      weak: ['مجسمه', 'رودن', 'sculpture', 'michelangelo', 'rodin'],
      weakSafe: true,
      hints: ['هنر', 'سنگ', 'مرمر', 'art', 'stone', 'marble'],
      fa: 'مجسمه‌سازی قدیمی‌ترین شکل هنر سه‌بعدی است، از پیکره‌های مرمر یونان تا برنز و مواد امروزی. شاهکارهایی مثل «داوود» میکل‌آنژ (مرمر) و «متفکر» رودن (برنز) نشان می‌دهند سنگ و فلز چطور جان و حرکت می‌گیرند. مجسمه‌ساز باید وزن، تعادل، فضا و نور را در سه بعد کنترل کند، به همین دلیل دشوارتر از نقاشی دانسته می‌شود.',
      en: 'Sculpture is the oldest three-dimensional art form, from Greek marble figures to bronze and modern materials. Masterpieces like Michelangelo’s "David" (marble) and Rodin’s "Thinker" (bronze) show how stone and metal can take on life and movement. A sculptor must control weight, balance, space, and light in three dimensions, which is why it is considered harder than painting.'
    },
    {
      id: 'famous_statues',
      keywords: [
        'مجسمه های معروف',
        'مجسمه آزادی',
        'مسیح نجات دهنده',
        'famous statues',
        'statue of liberty',
        'christ the redeemer'
      ],
      weak: ['مجسمه آزادی', 'مسیح', 'statue of liberty', 'statue'],
      weakSafe: true,
      hints: ['معروف', 'دنیا', 'famous', 'world', 'landmark'],
      fa: 'چند مجسمه‌ی معروف دنیا: «مجسمه‌ی آزادی» در نیویورک هدیه‌ی فرانسه به آمریکا بود و نماد آزادی است؛ «مسیح نجات‌دهنده» در ریو با دست‌های باز بالای شهر ایستاده؛ «ابوالهول» مصر باستان یکی از قدیمی‌ترین مجسمه‌های بزرگ جهان است؛ و «داوود» میکل‌آنژ اوج مجسمه‌سازی رنسانس. این آثار معمولاً نماد شهر یا ملت‌شان شده‌اند.',
      en: 'A few famous statues: the Statue of Liberty in New York was a gift from France to America and symbolizes freedom; Christ the Redeemer in Rio stands with open arms above the city; the Great Sphinx of Egypt is among the oldest giant statues in the world; and Michelangelo’s "David" is the peak of Renaissance sculpture. These works usually became symbols of their city or nation.'
    },
    {
      id: 'art_design_principles',
      keywords: [
        'اصول طراحی',
        'اصول ترکیب بندی',
        'تئوری رنگ',
        'تیوری رنگ',
        'اصول هنر',
        'design principles',
        'color theory',
        'principles of design',
        'composition in art'
      ],
      weak: [
        'ترکیب بندی',
        'تئوری رنگ',
        'طراحی',
        'design principles',
        'color theory'
      ],
      weakSafe: true,
      hints: ['هنر', 'گرافیک', 'art', 'graphic', 'color', 'رنگ'],
      fa: 'چند اصل پایه‌ی طراحی که در نقاشی، گرافیک و رابط کاربری مشترک‌اند: تعادل (پخش وزن بصری)، کنتراست (تفاوت روشن/تیره یا بزرگ/کوچک برای جلب توجه)، سلسله‌مراتب (کدام عنصر اول دیده شود)، ریتم و تکرار، فضای خالی (نفس اثر) و هماهنگی رنگ‌ها. تئوری رنگ ساده: رنگ‌های مکمل (روبه‌رو در چرخه) کنتراست قوی می‌سازند و رنگ‌های هم‌خانواده آرامش می‌دهند.',
      en: 'A few basic design principles shared by painting, graphic design, and interfaces: balance (distributing visual weight), contrast (light/dark or big/small differences to draw attention), hierarchy (which element is seen first), rhythm and repetition, negative space (letting the work breathe), and color harmony. Simple color theory: complementary colors (opposite on the wheel) create strong contrast, while analogous colors feel calm.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
