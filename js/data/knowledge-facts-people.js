/**
 * Darya - curated factual entries (notable people across eras and
 * cultures). Loaded before knowledge-base.js; registers a global part.
 *
 * The companion breadth shelf: Persian poets and writers, Iranian
 * filmmakers and musicians, scientists and mathematicians (Iranian and
 * world), philosophers, historical leaders, world writers, artists and
 * musicians, women figures, and sports legends. Every entry carries
 * well-established facts only; the fa/en texts are deliberately kept to
 * a few sentences so answers stay readable in a conversation.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'ferdowsi_poet',
      keywords: [
        'فردوسی کیه',
        'فردوسی کیست',
        'شاهنامه',
        'حکیم فردوسی',
        'ferdowsi',
        'who is ferdowsi',
        'ferdowsi poet'
      ],
      weak: ['فردوسی', 'شاهنامه', 'ferdowsi'],
      weakSafe: true,
      hints: ['شاعر', 'شاهنامه', 'poet', 'shahnameh'],
      fa: 'حکیم ابوالقاسم فردوسی، شاعر ایرانی سده‌ی چهارم و پنجم هجری، خالق شاهنامه است؛ کتابی که اسطوره‌ها و تاریخ اساطیری ایران را در حدود پنجاه هزار بیت به نظم کشید. شاهنامه را بزرگ‌ترین اثر حماسی زبان فارسی می‌دانند و فردوسی نزدیک به سی سال برایش زمان گذاشت. او زبان فارسی را در قرن‌های پس از حمله‌ی اعراب زنده نگه داشت.',
      en: 'Hakim Abolqasem Ferdowsi, the 10th-11th century Persian poet, created the Shahnameh, the Book of Kings, which put the myths and legendary history of Iran into about fifty thousand verses. It is considered the greatest epic of the Persian language, and Ferdowsi spent nearly thirty years on it, keeping Persian alive for centuries after the Arab conquest.'
    },
    {
      id: 'hafez_poet',
      keywords: [
        'حافظ کیه',
        'حافظ کیست',
        'شمس الدین محمد حافظ',
        'خواجه حافظ',
        'hafez',
        'who is hafez',
        'hafez poet'
      ],
      weak: ['حافظ', 'hafez'],
      weakSafe: true,
      hints: ['شاعر', 'غزل', 'شیراز', 'poet', 'ghazal', 'shiraz'],
      fa: 'خواجه شمس‌الدین محمد حافظ، شاعر غزل‌سرای ایرانی قرن هشتم هجری از شیراز است. غزل‌های او در عین زیبایی، لایه‌های عارفانه و اجتماعی دارند و دیوانش در خانه‌های ایرانی تقریباً همیشه حاضر است؛ ایرانی‌ها برای فال و تفأل به دیوان حافظ نگاه می‌کنند. گوته، شاعر آلمانی، از او تأثیر گرفته بود.',
      en: 'Khajeh Shams al-Din Mohammad Hafez was a 14th-century Persian ghazal poet from Shiraz. His poems carry layers of mysticism and social insight, and his Divan is present in almost every Iranian home, often used for fortune-telling (fale Hafez). The German poet Goethe was influenced by him.'
    },
    {
      id: 'saadi_poet',
      keywords: [
        'سعدی کیه',
        'سعدی کیست',
        'سعدی شیرازی',
        'گلستان سعدی',
        'بوستان',
        'saadi',
        'who is saadi'
      ],
      weak: ['سعدی', 'گلستان', 'بوستان', 'saadi'],
      weakSafe: true,
      hints: ['شاعر', 'شیراز', 'نثر', 'poet', 'shiraz', 'prose'],
      fa: 'سعدی شیرازی، شاعر و نویسنده‌ی ایرانی قرن هفتم هجری، دو کتاب گلستان (نثر آمیخته به نظم) و بوستان (منظوم) را نوشت که از شاهکارهای ادب فارسی‌اند. سفرهای طولانی‌اش در جهان اسلام به آثارش دیدی واقع‌بینانه و انسانی داد. شعر معروفش «بنی‌آدم اعضای یکدیگرند» به انسانیت جهانی شهرت دارد.',
      en: 'Saadi of Shiraz, the 13th-century Persian poet and writer, authored the Golestan (prose mixed with verse) and the Bustan (poetry), both masterpieces of Persian literature. His long travels across the Islamic world gave his work a realistic, humane outlook. His famous line "the children of Adam are limbs of one body" is known worldwide.'
    },
    {
      id: 'rumi_poet',
      keywords: [
        'مولانا کیه',
        'مولوی کیه',
        'رومی کیه',
        'جلال الدین محمد بلخی',
        'rumi',
        'who is rumi',
        'rumi poet',
        'jalal ad din'
      ],
      weak: ['مولانا', 'مولوی', 'رومی', 'rumi', 'مثنوی'],
      weakSafe: true,
      hints: ['شاعر', 'عارف', 'تصوف', 'poet', 'mystic', 'sufi'],
      fa: 'جلال‌الدین محمد بلخی، معروف به مولانا و رومی، شاعر و عارف ایرانی‌تبار قرن هفتم هجری است که در بلخ زاده شد و در قونیه درگذشت. مثنوی معنوی و دیوان شمس از بزرگ‌ترین آثار عرفانی جهان‌اند. او بنیان‌گذار طریقت مولویه و سماع (رقص عارفانه) است و امروز پرفروش‌ترین شاعر فارسی در جهان است.',
      en: 'Jalal ad-Din Mohammad Balkhi, known as Rumi, was a 13th-century Persian poet and mystic born in Balkh who lived and died in Konya. The Masnavi and the Divan-e Shams are among the greatest mystical works in the world. He founded the Mevlevi order and the whirling sama, and today he is the best-selling Persian poet worldwide.'
    },
    {
      id: 'khayyam_poet',
      keywords: [
        'خیام کیه',
        'خیام کیست',
        'عمر خیام',
        'رباعیات خیام',
        'khayyam',
        'who is khayyam',
        'omar khayyam'
      ],
      weak: ['خیام', 'رباعیات', 'khayyam'],
      weakSafe: true,
      hints: ['شاعر', 'ریاضی', 'نیشابور', 'poet', 'math', 'neishabur'],
      fa: 'عمر خیام نیشابوری، دانشمند و شاعر ایرانی قرن پنجم و ششم هجری است: در ریاضیات و نجوم چنان بود که تقویم جلالی را اصلاح کرد و در جبر رساله نوشت. اما شهرت جهانی‌اش بیشتر از رباعیات است، که به زبان‌های زیادی ترجمه شده (معروف‌ترین‌اش به انگلیسی توسط ادوارد فیتزجرالد). رباعی‌های او درباره‌ی زندگی، مرگ و لذت لحظه‌اند.',
      en: 'Omar Khayyam of Neyshabur was an 11th-12th century Persian scientist and poet: a mathematician and astronomer who helped reform the Jalali calendar and wrote on algebra. His worldwide fame, however, comes from the Rubaiyat, translated into many languages (most famously into English by Edward FitzGerald). His quatrains reflect on life, death, and seizing the moment.'
    },
    {
      id: 'nima_poet',
      keywords: [
        'نیما یوشیج کیه',
        'پدر شعر نو',
        'nima yushij',
        'who is nima yushij'
      ],
      weak: ['نیما', 'یوشیج', 'شعر نو', 'nima'],
      weakSafe: true,
      hints: ['شاعر', 'مازندران', 'poet', 'modern'],
      fa: 'نیما یوشیج (علی اسفندیاری) شاعر ایرانی اهل یوش مازندران است که در اوایل قرن بیستم شعر نو فارسی را بنیان گذاشت. او قالب‌های کهن را شکست و با «افسانه» و «ققنوس» وزن و قافیه را آزاد کرد. تقریباً همه‌ی شاعران مدرن فارسی بعد از او (از شاملو تا فروغ) وام‌دار تحول او هستند.',
      en: 'Nima Yushij (Ali Esfandiari), born in Yush, Mazandaran, founded modern Persian poetry in the early 20th century. He broke the classical forms and freed meter and rhyme with works like Afsaneh and Qoqnoos. Nearly every modern Persian poet after him, from Shamlou to Forough, builds on his revolution.'
    },
    {
      id: 'forough_poet',
      keywords: [
        'فروغ فرخزاد کیه',
        'فروغ کیه',
        'forough farrokhzad',
        'who is forough farrokhzad'
      ],
      weak: ['فروغ', 'فرخزاد', 'forough'],
      weakSafe: true,
      hints: ['شاعر', 'زن', 'poet', 'woman'],
      fa: 'فروغ فرخزاد شاعر و فیلمساز ایرانی (۱۳۱۳-۱۳۴۵) است که با صداقت بی‌پرده درباره‌ی عشق، تنهایی و آزادی زن نوشت. «تولدی دیگر» و «ایمان بیاوریم به آغاز فصل سرد» از مهم‌ترین کتاب‌های شعر معاصر فارسی‌اند. او مستند «خانه سیاه است» را هم درباره‌ی جذامیان ساخت و در سی و دو سالگی در تصادف درگذشت.',
      en: 'Forough Farrokhzad (1935-1967) was an Iranian poet and filmmaker who wrote with unflinching honesty about love, solitude, and women freedom. "Another Birth" and "Let Us Believe in the Beginning of the Cold Season" are among the most important modern Persian poetry books. She also made the documentary "The House Is Black" and died in a car crash at thirty-two.'
    },
    {
      id: 'sepehri_poet',
      keywords: [
        'سهراب سپهری کیه',
        'سهراب کیه',
        'sohrab sepehri',
        'who is sohrab sepehri'
      ],
      weak: ['سهراب', 'سپهری', 'sepehri'],
      weakSafe: true,
      hints: ['شاعر', 'نقاش', 'poet', 'painter'],
      fa: 'سهراب سپهری (۱۳۰۷-۱۳۵۹) شاعر و نقاش ایرانی از کاشان است. شعرهایش از «هشت کتاب» به‌ویژه «صدای پای آب» و «مسافر»، نگاهی لطیف و عارفانه به طبیعت و زندگی دارند. جمله‌ی معروفش «به سراغ من اگر می‌آیید، نرم و آهسته بیایید» در فرهنگ ایرانی ماندگار شده. نقاشی‌هایش هم در نمایشگاه‌های داخلی و خارجی شناخته‌شده‌اند.',
      en: 'Sohrab Sepehri (1928-1980) was an Iranian poet and painter from Kashan. His collection "The Eight Books", especially "The Sound of Water Footsteps" and "The Traveler", holds a gentle, mystic view of nature and life. His famous line "if you come to see me, come softly and slowly" is part of Iranian culture. His paintings are shown in galleries at home and abroad.'
    },
    {
      id: 'shamloo_poet',
      keywords: [
        'شاملو کیه',
        'احمد شاملو',
        'شعر سپید',
        'ahmad shamloo',
        'who is ahmad shamloo'
      ],
      weak: ['شاملو', 'شعر سپید', 'shamloo'],
      weakSafe: true,
      hints: ['شاعر', 'poet', 'free verse'],
      fa: 'احمد شاملو (۱۳۰۴-۱۳۷۹) شاعر، مترجم و روزنامه‌نگار ایرانی و از چهره‌های اصلی شعر سپید فارسی است. شعر «پریا» و مجموعه‌های «هوای تازه» و «آیدا در آینه» از آثار ماندگار اوست. او کتاب «کوچه» را هم درباره‌ی فرهنگ عامه نوشت و در برابر محدودیت‌های زمانه‌اش ایستادگی کرد.',
      en: 'Ahmad Shamlou (1925-2000) was an Iranian poet, translator, and journalist, a leading figure of free verse (sher-e sepid) in Persian. His poem "Pariya" and collections like "Fresh Air" and "Aida in the Mirror" are enduring works. He also wrote about folklore in "Kucheh" and stood against the restrictions of his time.'
    },
    {
      id: 'parvin_poet',
      keywords: [
        'پروین اعتصامی کیه',
        'پروین کیه',
        'parvin etesami',
        'who is parvin etesami'
      ],
      weak: ['پروین', 'اعتصامی', 'parvin'],
      weakSafe: true,
      hints: ['شاعر', 'زن', 'poet', 'woman'],
      fa: 'پروین اعتصامی (۱۲۸۵-۱۳۲۰) شاعر ایرانی و از بزرگ‌ترین شاعران زن ادب فارسی است. دیوان او پر از مناظره‌های اخلاقی و اجتماعی است؛ شعرهایی که در قالب قطعه، مفاهیمی مثل عدالت، ساده‌زیستی و نقد بی‌عدالتی را روایت می‌کنند. او در سی و چهار سالگی درگذشت اما شعرش در مدارس ایران می‌ماند.',
      en: 'Parvin Etesami (1906-1941) was an Iranian poet and one of the greatest women poets of Persian literature. Her Divan is full of moral and social dialogues, verses in the qetah form about justice, simple living, and the critique of injustice. She died at thirty-four, but her poetry remains in Iranian schoolbooks.'
    },
    {
      id: 'hedayat_writer',
      keywords: [
        'صادق هدایت کیه',
        'بوف کور',
        'sadegh hedayat',
        'who is sadegh hedayat',
        'the blind owl'
      ],
      weak: ['هدایت', 'بوف کور', 'hedayat'],
      weakSafe: true,
      hints: ['نویسنده', 'داستان', 'writer', 'story'],
      fa: 'صادق هدایت (۱۲۸۱-۱۳۳۰) نویسنده‌ی ایرانی و از بنیان‌های داستان مدرن فارسی است. «بوف کور» مشهورترین اثر اوست که به زبان‌های زیادی ترجمه شده و فضایی کابوس‌وار و فلسفی دارد. «سه قطره خون»، «سگ ولگرد» و پژوهش‌هایی درباره‌ی فرهنگ عامه هم از کارهای اوست. او در پاریس خودکشی کرد.',
      en: 'Sadegh Hedayat (1903-1951) was an Iranian writer and a founder of the modern Persian short story. "The Blind Owl" is his most famous work, translated into many languages, with a nightmarish, philosophical atmosphere. "Three Drops of Blood", "The Stray Dog", and folklore research are also his. He died by suicide in Paris.'
    },
    {
      id: 'kiarostami_filmmaker',
      keywords: [
        'کیارستمی کیه',
        'عباس کیارستمی',
        'kiarostami',
        'who is kiarostami',
        'abbas kiarostami'
      ],
      weak: ['کیارستمی', 'kiarostami'],
      weakSafe: true,
      hints: ['فیلم', 'کارگردان', 'film', 'director'],
      fa: 'عباس کیارستمی (۱۳۱۹-۱۳۹۴) کارگردان ایرانی و از شناخته‌شده‌ترین فیلم‌سازان جهان است. فیلم‌هایی مثل «خانه دوست کجاست؟»، «زندگی و دیگر هیچ» و «طعم گیلاس» (برنده‌ی نخل طلای کن ۱۹۹۷) سینمای ایران را جهانی کردند. سبک او با نماهای بلند، طبیعت و مرز میان مستند و داستان شناخته می‌شود.',
      en: 'Abbas Kiarostami (1940-2016) was an Iranian director and one of the most celebrated filmmakers in the world. Films like "Where Is the Friend Home?", "Life, and Nothing More", and "Taste of Cherry" (Palme d Or at Cannes 1997) put Iranian cinema on the world map. His style is known for long takes, nature, and the line between documentary and fiction.'
    },
    {
      id: 'shajarian_singer',
      keywords: [
        'شجریان کیه',
        'محمدرضا شجریان',
        'شجریان',
        'shajarian',
        'who is shajarian',
        'mohammad reza shajarian'
      ],
      weak: ['شجریان', 'shajarian'],
      weakSafe: true,
      hints: ['آواز', 'موسیقی', 'خواننده', 'singer', 'music'],
      fa: 'محمدرضا شجریان (۱۳۱۹-۱۳۹۹) خواننده‌ی آواز سنتی ایرانی و از بزرگ‌ترین صدای‌های موسیقی ایران بود. او با استادانی مثل محمدرضا لطفی و حسین علیزاده آثاری مثل «چشم‌نوش» و «شب، سکوت، کویر» ساخت و به «خسرو آواز ایران» شهرت داشت. شجریان در سال‌های آخر عمر با بیماری درگیر بود و درگذشتش برای ایران یک سوگ ملی بود.',
      en: 'Mohammad Reza Shajarian (1940-2020) was the master of classical Persian singing and one of the greatest voices of Iranian music. With masters like Mohammad Reza Lotfi and Hossein Alizadeh he made works such as "Cheshm-e Noosh" and "Shab, Sokout, Kavir", earning the title "Khosrow of Persian song". His death was a national mourning in Iran.'
    },
    {
      id: 'farhadi_filmmaker',
      keywords: [
        'فرهادی کیه',
        'اصغر فرهادی',
        'asghar farhadi',
        'who is asghar farhadi'
      ],
      weak: ['فرهادی', 'farhadi'],
      weakSafe: true,
      hints: ['فیلم', 'کارگردان', 'اسکار', 'film', 'director', 'oscar'],
      fa: 'اصغر فرهادی کارگردان و فیلم‌نامه‌نویس ایرانی است که با «جدایی نادر از سیمین» در ۲۰۱۱ اسکار بهترین فیلم خارجی را گرفت و با «فروشنده» در ۲۰۱۶ دوباره برنده شد. فیلم‌هایش اخلاق پیچیده‌ی آدم‌های عادی در جامعه‌ی امروز ایران را با روایت‌های لایه‌لایه نشان می‌دهند. «درباره‌ی الی» و «قهرمان» از دیگر کارهای معروف اوست.',
      en: 'Asghar Farhadi is an Iranian director and screenwriter who won the Oscar for Best Foreign Language Film with "A Separation" (2011) and again with "The Salesman" (2016). His films portray the complex ethics of ordinary people in contemporary Iranian society through layered storytelling. "About Elly" and "A Hero" are among his other famous works.'
    },
    {
      id: 'panahi_filmmaker',
      keywords: [
        'پناهی کیه',
        'جعفر پناهی',
        'jafar panahi',
        'who is jafar panahi'
      ],
      weak: ['پناهی', 'panahi'],
      weakSafe: true,
      hints: ['فیلم', 'کارگردان', 'film', 'director'],
      fa: 'جعفر پناهی کارگردان ایرانی است که با «بادکنک سفید» (دوربین طلای کن ۱۹۹۵) و «دایره» (شیر طلای ونیز ۲۰۰۰) شناخته شد. او سال‌ها از فیلم‌سازی منع شد و در حبس خانگی بود، اما با دوربین‌های کوچک و فیلم‌های کم‌خرج مثل «آفساید» و «سه‌رخ» به کارش ادامه داد و جوایز جهانی گرفت.',
      en: 'Jafar Panahi is an Iranian director known for "The White Balloon" (Cannes Golden Camera 1995) and "The Circle" (Venice Golden Lion 2000). Banned from filmmaking and held under house arrest for years, he continued with small cameras and low-budget films like "Offside" and "Three Faces", winning international awards.'
    },
    {
      id: 'majidi_filmmaker',
      keywords: [
        'مجیدی کیه',
        'مجید مجیدی',
        'بچه های آسمان',
        'majid majidi',
        'who is majid majidi',
        'children of heaven'
      ],
      weak: ['مجیدی', 'majidi'],
      weakSafe: true,
      hints: ['فیلم', 'کارگردان', 'film', 'director'],
      fa: 'مجید مجیدی کارگردان ایرانی است که «بچه‌های آسمان» او در ۱۹۹۷ نامزد اسکار بهترین فیلم خارجی شد؛ داستان دو خواهر و برادر که با یک جفت کفش زندگی می‌کنند. «رنگ خدا» و «آواز گنجشک‌ها» هم از کارهای معروف اوست. فیلم‌هایش بیشتر درباره‌ی کودکان، ایمان و آدم‌های ساده‌اند.',
      en: 'Majid Majidi is an Iranian director whose "Children of Heaven" (1997) was nominated for the Oscar for Best Foreign Language Film; it tells the story of a brother and sister sharing one pair of shoes. "The Color of Paradise" and "The Song of Sparrows" are also his. His films often center on children, faith, and ordinary people.'
    },
    {
      id: 'googoosh_singer',
      keywords: ['گوگوش کیه', 'گوگوش', 'googoosh', 'who is googoosh'],
      weak: ['گوگوش', 'googoosh'],
      weakSafe: true,
      hints: ['خواننده', 'زن', 'singer', 'pop'],
      fa: 'گوگوش (فائقه آتشین) خواننده و بازیگر ایرانی است که از کودکی در دهه‌ی ۱۳۳۰ شروع کرد و در دهه‌ی ۱۳۴۰ و ۱۳۵۰ به محبوب‌ترین خواننده‌ی پاپ ایران تبدیل شد. بعد از انقلاب ۱۳۵۷ سال‌ها از اجرا منع شد و در ۱۳۷۹ با کنسرت‌های خارج از کشور برگشت. او برای چند نسل از ایرانیان نماد خاطره و موسیقی است.',
      en: 'Googoosh (Faegheh Atashin) is an Iranian singer and actress who started as a child in the 1950s and became the most popular pop singer of Iran in the 1960s-70s. After the 1979 revolution she was barred from performing for years, returning with concerts abroad in 2000. For generations of Iranians she is a symbol of memory and music.'
    },
    {
      id: 'avicenna_scientist',
      keywords: [
        'ابن سینا کیه',
        'ابوعلی سینا',
        'بوعلی سینا',
        'avicenna',
        'who is avicenna',
        'ibn sina'
      ],
      weak: [
        'ابن سینا',
        'ابوعلی سینا',
        'بوعلی',
        'سینا',
        'avicenna',
        'ibn sina'
      ],
      weakSafe: true,
      hints: ['پزشک', 'فلسفه', 'دانشمند', 'doctor', 'philosophy', 'scientist'],
      fa: 'ابوعلی سینا (۹۸۰-۱۰۳۷ میلادی) پزشک و فیلسوف ایرانی از بخارا بود که در اروپا به «آوی‌سنا» معروف است. کتاب «قانون» او قرن‌ها کتاب درسی پزشکی اروپا بود و «شفا» دایرةالمعارفی در فلسفه و علوم است. او را «رئیس» و «شیخ‌الرئیس» می‌خواندند و تأثیرش بر پزشکی و فلسفه شرق و غرب بی‌مانند است.',
      en: 'Avicenna (Ibn Sina, 980-1037) was a Persian physician and philosopher from Bukhara, known in Europe as Avicenna. His "Canon of Medicine" was a European medical textbook for centuries, and "The Book of Healing" is an encyclopedia of philosophy and science. Called "the Chief", his influence on medicine and philosophy in East and West is unmatched.'
    },
    {
      id: 'khwarizmi_scientist',
      keywords: [
        'خوارزمی کیه',
        'الگوریتم',
        'al khwarizmi',
        'who is al khwarizmi',
        'algorithm'
      ],
      weak: ['خوارزمی', 'khwarizmi', 'algorithm'],
      weakSafe: true,
      hints: ['ریاضی', 'جبر', 'math', 'algebra'],
      fa: 'محمد بن موسی خوارزمی، ریاضی‌دان ایرانی قرن نهم میلادی در بغداد بود. کتاب «الجبر و المقابله» او نام علم جبر را گذاشت و روش‌های محاسباتی‌اش آن‌قدر مهم شد که از لاتینی‌شدن نامش (Algoritmi) واژه‌ی «الگوریتم» ساخته شد. او همچنین اعداد هندی را با شرحش به جهان اسلام و بعد اروپا معرفی کرد.',
      en: 'Muhammad ibn Musa al-Khwarizmi was a 9th-century Persian mathematician working in Baghdad. His book "Al-Jabr wa-l-Muqabala" gave algebra its name, and his computational methods were so influential that the Latinized form of his name, Algoritmi, became the word "algorithm". He also introduced Indian numerals to the Islamic world and later Europe.'
    },
    {
      id: 'razi_scientist',
      keywords: [
        'رازی کیه',
        'زکریای رازی',
        'محمد زکریا',
        'al razi',
        'who is al razi',
        'rhazes'
      ],
      weak: ['رازی', 'زکریا', 'razi', 'rhazes'],
      weakSafe: true,
      hints: ['پزشک', 'دانشمند', 'doctor', 'scientist', 'chemistry'],
      fa: 'محمد زکریای رازی (۸۶۵-۹۲۵ میلادی) پزشک و شیمیدان ایرانی از ری بود که در اروپا «رازس» نامیده می‌شد. او نخستین بار آبله و سرخک را از هم تشخیص داد و کتاب‌هایی مثل «الحاوی» (کتاب جامع پزشکی) نوشت. در شیمی هم با تقطیر و اسیدها کار کرد و بیمارستان‌ها را با دیدی علمی اداره می‌کرد.',
      en: 'Muhammad ibn Zakariya al-Razi (865-925), known in Europe as Rhazes, was a Persian physician and chemist from Ray. He was the first to distinguish smallpox from measles and wrote comprehensive medical works like "Al-Hawi". In chemistry he worked with distillation and acids, and ran hospitals with a scientific approach.'
    },
    {
      id: 'biruni_scientist',
      keywords: [
        'بیرونی کیه',
        'ابوریحان بیرونی',
        'al biruni',
        'who is al biruni'
      ],
      weak: ['بیرونی', 'ابوریحان', 'biruni'],
      weakSafe: true,
      hints: ['دانشمند', 'نجوم', 'scientist', 'astronomy'],
      fa: 'ابوریحان بیرونی (۹۷۳-۱۰۴۸ میلادی) دانشمند ایرانی از خوارزم بود؛ ریاضی‌دان، ستاره‌شناس، جغرافی‌دان و تاریخ‌نگار. شعاع زمین را با روشی هوشمندانه اندازه گرفت و درباره‌ی هند («تحقیق ماللهند») کتابی نوشت که از دقیق‌ترین مطالعات بی‌طرفانه‌ی جهان باستان درباره‌ی یک فرهنگ دیگر است. او به چند زبان می‌نوشت و روش تجربی را جدی می‌گرفت.',
      en: 'Abu Rayhan al-Biruni (973-1048) was a Persian polymath from Khwarazm: mathematician, astronomer, geographer, and historian. He measured the radius of the Earth with a clever method and wrote "Tahqiq ma li-l-Hind" (India), one of the most objective ancient studies of another culture. He wrote in several languages and took the empirical method seriously.'
    },
    {
      id: 'mirzakhani_mathematician',
      keywords: [
        'مریم میرزاخانی کیه',
        'میرزاخانی',
        'maryam mirzakhani',
        'who is maryam mirzakhani'
      ],
      weak: ['میرزاخانی', 'mirzakhani'],
      weakSafe: true,
      hints: ['ریاضی', 'مدال فیلدز', 'math', 'fields medal'],
      fa: 'مریم میرزاخانی (۱۳۵۶-۱۳۹۶) ریاضی‌دان ایرانی و نخستین زنی بود که مدال فیلدز (مهم‌ترین جایزه‌ی ریاضیات جهان) را گرفت؛ در ۲۰۱۴ برای کارهایش در هندسه‌ی فضاهای هذلولوی. او دانش‌آموخته‌ی المپیاد ریاضی ایران و استاد دانشگاه استنفورد بود و در ۴۰ سالگی بر اثر سرطان درگذشت. نامش الهام‌بخش دختران علاقه‌مند به ریاضی در ایران و جهان است.',
      en: 'Maryam Mirzakhani (1977-2017) was an Iranian mathematician and the first woman to win the Fields Medal, mathematics most prestigious prize, in 2014 for her work on the geometry of hyperbolic spaces. An Iranian math Olympiad alumna and Stanford professor, she died of cancer at forty. Her name inspires girls interested in mathematics in Iran and worldwide.'
    },
    {
      id: 'einstein_scientist',
      keywords: [
        'اینشتین کیه',
        'انیشتین',
        'آلبرت اینشتین',
        'einstein',
        'who is einstein',
        'albert einstein'
      ],
      weak: ['اینشتین', 'انیشتین', 'einstein'],
      weakSafe: true,
      hints: ['فیزیک', 'نسبیت', 'physics', 'relativity'],
      fa: 'آلبرت اینشتین (۱۸۷۹-۱۹۵۵) فیزیک‌دان آلمانی‌تبار و خالق نظریه‌ی نسبیت است. معادله‌ی معروف E=mc² رابطه‌ی جرم و انرژی را نشان داد و کارهایش در ۱۹۰۵ (سال معجزه‌آسا) و نظریه‌ی نسبیت عام ۱۹۱۵ درک ما از فضا، زمان و گرانش را دگرگون کرد. در ۱۹۲۱ جایزه‌ی نوبل فیزیک را گرفت و بعدها به دلیل یهودی‌بودن از آلمان نازی به آمریکا رفت.',
      en: 'Albert Einstein (1879-1955) was a German-born physicist and the creator of the theory of relativity. His famous equation E=mc² relates mass and energy, and his miraculous year of 1905 plus general relativity (1915) transformed our understanding of space, time, and gravity. He won the 1921 Nobel Prize in Physics and later left Nazi Germany for the United States.'
    },
    {
      id: 'newton_scientist',
      keywords: [
        'نیوتن کیه',
        'اسحاق نیوتن',
        'newton',
        'who is newton',
        'isaac newton'
      ],
      weak: ['نیوتن', 'newton'],
      weakSafe: true,
      hints: ['فیزیک', 'گرانش', 'physics', 'gravity'],
      fa: 'اسحاق نیوتن (۱۶۴۳-۱۷۲۷) فیزیک‌دان و ریاضی‌دان انگلیسی بود که قوانین حرکت و گرانش جهانی را در «اصول ریاضی فلسفه‌ی طبیعی» (۱۶۸۷) منتشر کرد. حساب دیفرانسیل و انتگرال را هم (همزمان با لایب‌نیتس) توسعه داد. داستان سیب و گرانش نمادین است اما کار واقعی او پایه‌ی فیزیک کلاسیک شد.',
      en: 'Isaac Newton (1643-1727) was an English physicist and mathematician who published the laws of motion and universal gravitation in the "Principia" (1687). He also developed calculus (alongside Leibniz). The apple story is symbolic, but his real work became the foundation of classical physics.'
    },
    {
      id: 'darwin_scientist',
      keywords: [
        'داروین کیه',
        'چارلز داروین',
        'تکامل',
        'darwin',
        'who is darwin',
        'charles darwin'
      ],
      weak: ['داروین', 'تکامل', 'darwin', 'evolution'],
      weakSafe: true,
      hints: ['زیست', 'انقلاب', 'biology', 'origin of species'],
      fa: 'چارلز داروین (۱۸۰۹-۱۸۸۲) طبیعت‌شناس انگلیسی و نویسنده‌ی «خاستگاه گونه‌ها» (۱۸۵۹) است. او با سفر به گالاپاگوس و مشاهداتش، نظریه‌ی تکامل از طریق انتخاب طبیعی را پیشنهاد کرد: موجودات زنده با تغییرات کوچک و بقای سازگارترین‌ها در نسل‌ها تغییر می‌کنند. این نظریه پایه‌ی زیست‌شناسی مدرن شد و هنوز بحث‌هایی درباره‌ی آن هست.',
      en: 'Charles Darwin (1809-1882) was an English naturalist and the author of "On the Origin of Species" (1859). From his voyage to the Galapagos and his observations, he proposed evolution by natural selection: living things change over generations through small variations and the survival of the fittest. The theory became the foundation of modern biology.'
    },
    {
      id: 'curie_scientist',
      keywords: ['ماری کوری کیه', 'کوری', 'marie curie', 'who is marie curie'],
      weak: ['کوری', 'curie'],
      weakSafe: true,
      hints: ['فیزیک', 'رادیواکتیو', 'physics', 'radioactivity', 'nobel'],
      fa: 'ماری کوری (۱۸۶۷-۱۹۳۴) فیزیک‌دان و شیمی‌دان لهستانی‌تبار در فرانسه بود؛ نخستین کسی که دو جایزه‌ی نوبل گرفت (فیزیک ۱۹۰۳ و شیمی ۱۹۱۱). او عناصر پولونیوم و رادیوم را کشف کرد و واژه‌ی «رادیواکتیویته» را رواج داد. کارهایش پزشکی (پرتودرمانی) را متحول کرد، هرچند سال‌ها در آزمایشگاه‌های ساده و بی‌امکانات کار کرد.',
      en: 'Marie Curie (1867-1934) was a Polish-born physicist and chemist working in France, the first person to win two Nobel Prizes (Physics 1903 and Chemistry 1911). She discovered polonium and radium and popularized the term radioactivity. Her work transformed medicine (radiotherapy), even though she worked for years in simple, poorly equipped labs.'
    },
    {
      id: 'tesla_inventor',
      keywords: [
        'تسلا کیه',
        'نیکولا تسلا',
        'nikola tesla',
        'who is nikola tesla'
      ],
      weak: ['نیکولا تسلا', 'tesla'],
      weakSafe: true,
      hints: ['مخترع', 'الکتریسیته', 'inventor', 'electricity'],
      fa: 'نیکولا تسلا (۱۸۵۶-۱۹۴۳) مخترع و مهندس برق صرب‌تبار بود که در آمریکا کار کرد. موتور جریان متناوب (AC) و سیستم انتقال برق متناوب را توسعه داد که پایه‌ی شبکه‌های برق مدرن شد. با ادیسون بر سر جریان مستقیم در برابر متناوب رقابت کرد و سال‌های آخر عمرش را فقیر و کم‌توجه گذراند؛ امروز نامش روی شرکت خودروهای برقی تسلا هم هست.',
      en: 'Nikola Tesla (1856-1943) was a Serbian-born inventor and electrical engineer who worked in America. He developed the alternating current (AC) motor and AC power transmission, the basis of modern power grids. He competed with Edison over DC versus AC and spent his last years poor and forgotten; today his name also lives on the electric car company Tesla.'
    },
    {
      id: 'edison_inventor',
      keywords: [
        'ادیسون کیه',
        'توماس ادیسون',
        'thomas edison',
        'who is thomas edison'
      ],
      weak: ['ادیسون', 'edison'],
      weakSafe: true,
      hints: ['مخترع', 'لامپ', 'inventor', 'light bulb'],
      fa: 'توماس ادیسون (۱۸۴۷-۱۹۳۱) مخترع آمریکایی با بیش از هزار اختراع ثبت‌شده بود. او لامپ رشتگی تجاری، گرامافون و دوربین فیلم‌برداری را توسعه داد و آزمایشگاه صنعتی مدرن را پایه گذاشت. جمله‌ی معروفش درباره‌ی «یک درصد الهام و نود و نه درصد عرق» به فرهنگ عمومی راه یافته.',
      en: 'Thomas Edison (1847-1931) was an American inventor with over a thousand patents. He developed the commercial incandescent light bulb, the phonograph, and the movie camera, and founded the modern industrial laboratory. His famous line about "one percent inspiration and ninety-nine percent perspiration" entered popular culture.'
    },
    {
      id: 'galileo_scientist',
      keywords: ['گالیله کیه', 'galileo', 'who is galileo', 'galileo galilei'],
      weak: ['گالیله', 'galileo'],
      weakSafe: true,
      hints: ['ستاره‌شناس', 'تلسکوپ', 'astronomer', 'telescope'],
      fa: 'گالیله گالیله (۱۵۶۴-۱۶۴۲) دانشمند ایتالیایی و پدر علم مدرن است. با تلسکوپِ ساخته‌ی خودش، قمرهای مشتری و کوه‌های ماه را دید و از نظریه‌ی خورشیدمرکزی کوپرنیک پشتیبانی کرد؛ همین او را درگیر دادگاه تفتیش عقاید کرد و به حبس خانگی محکوم شد. روش او (آزمایش و مشاهده) مسیر علم جدید را باز کرد.',
      en: 'Galileo Galilei (1564-1642) was an Italian scientist often called the father of modern science. With his own telescope he observed Jupiter moons and lunar mountains and supported the Copernican heliocentric theory, which brought him before the Inquisition and house arrest. His method of experiment and observation opened the path of modern science.'
    },
    {
      id: 'turing_scientist',
      keywords: [
        'تورینگ کیه',
        'آلن تورینگ',
        'alan turing',
        'who is alan turing'
      ],
      weak: ['تورینگ', 'turing'],
      weakSafe: true,
      hints: ['رایانه', 'هوش مصنوعی', 'computer', 'ai'],
      fa: 'آلن تورینگ (۱۹۱۲-۱۹۵۴) ریاضی‌دان و دانشمند رایانه‌ی انگلیسی است. در جنگ جهانی دوم ماشین‌های رمز آلمانی (انیگما) را شکست و پس از جنگ «ماشین تورینگ» و «آزمون تورینگ» را برای سنجش هوش ماشین معرفی کرد. به خاطر همجنس‌گرایی‌اش تحت تعقیب و درمان اجباری قرار گرفت و در ۴۱ سالگی درگذشت؛ امروز او را پدر علوم رایانه می‌دانند.',
      en: 'Alan Turing (1912-1954) was an English mathematician and computer scientist. During World War II he broke the German Enigma codes, and after the war he introduced the Turing machine and the Turing test for machine intelligence. Persecuted and forcibly treated for being gay, he died at forty-one; today he is considered the father of computer science.'
    },
    {
      id: 'hawking_scientist',
      keywords: [
        'هاوکینگ کیه',
        'استیون هاوکینگ',
        'stephen hawking',
        'who is stephen hawking'
      ],
      weak: ['هاوکینگ', 'hawking'],
      weakSafe: true,
      hints: ['فیزیک', 'کیهان', 'physics', 'cosmos'],
      fa: 'استیون هاوکینگ (۱۹۴۲-۲۰۱۸) فیزیک‌دان نظری انگلیسی بود که روی سیاه‌چاله‌ها و کیهان‌شناسی کار کرد؛ نظریه‌ی «تابش هاوکینگ» او نشان می‌داد سیاه‌چاله‌ها هم انرژی از دست می‌دهند. کتاب پرفروش «تاریخچه‌ی مختصر زمان» علم را برای عموم باز کرد. با وجود بیماری‌ای که بدنش را فلج کرده بود، با دستگاه‌های کمکی به گفتگو و پژوهش ادامه داد.',
      en: 'Stephen Hawking (1942-2018) was an English theoretical physicist who worked on black holes and cosmology; his Hawking radiation theory showed black holes can lose energy. His bestseller "A Brief History of Time" opened science to the public. Despite a disease that paralyzed his body, he kept researching and communicating with assistive devices.'
    },
    {
      id: 'pasteur_scientist',
      keywords: [
        'پاستور کیه',
        'لویی پاستور',
        'louis pasteur',
        'who is louis pasteur'
      ],
      weak: ['پاستور', 'pasteur'],
      weakSafe: true,
      hints: ['پزشک', 'واکسن', 'doctor', 'vaccine', 'microbe'],
      fa: 'لویی پاستور (۱۸۲۲-۱۸۹۵) دانشمند فرانسوی و بنیان‌گذار میکروب‌شناسی است. او ثابت کرد میکروب‌ها عامل بیماری‌اند، روش پاستوریزاسیون (جوشاندن ملایم برای از بین بردن میکروب‌ها) را ساخت و واکسن هاری را توسعه داد. انستیتو پاستور که در ایران هم شعبه دارد به نام اوست.',
      en: 'Louis Pasteur (1822-1895) was a French scientist and the founder of microbiology. He proved that microbes cause disease, developed pasteurization (gentle heating to kill microbes), and created the rabies vaccine. The Pasteur Institute, which also has branches in Iran, bears his name.'
    },
    {
      id: 'lovelace_programmer',
      keywords: [
        'آدا لاولیس کیه',
        'آدا لاولیس',
        'ada lovelace',
        'who is ada lovelace'
      ],
      weak: ['لاولیس', 'lovelace'],
      weakSafe: true,
      hints: ['رایانه', 'برنامه‌نویسی', 'computer', 'programming'],
      fa: 'آدا لاولیس (۱۸۱۵-۱۸۵۲) ریاضی‌دان انگلیسی و دختر لرد بایرون است. برای ماشین تحلیلی چارلز ببیج، الگوریتمی نوشت که آن را نخستین برنامه‌ی رایانه‌ای تاریخ می‌دانند. او فهمید ماشین می‌تواند فقط عدد حساب نکند، بلکه نمادها را هم پردازش کند؛ به همین دلیل او را نخستین برنامه‌نویس جهان می‌خوانند.',
      en: 'Ada Lovelace (1815-1852) was an English mathematician and the daughter of Lord Byron. For Charles Babbage analytical engine she wrote an algorithm considered the first computer program in history. She understood machines could process symbols, not just numbers, which is why she is called the world first programmer.'
    },
    {
      id: 'armstrong_astronaut',
      keywords: [
        'نیل آرمسترانگ کیه',
        'آرمسترانگ',
        'neil armstrong',
        'who is neil armstrong'
      ],
      weak: ['آرمسترانگ', 'armstrong'],
      weakSafe: true,
      hints: ['فضا', 'ماه', 'space', 'moon', 'astronaut'],
      fa: 'نیل آرمسترانگ (۱۹۳۰-۲۰۱۲) فضانورد آمریکایی و نخستین انسانی است که روی ماه قدم گذاشت؛ در ۲۰ ژوئیه‌ی ۱۹۶۹ در مأموریت آپولو ۱۱. جمله‌ی او «قدمی کوچک برای انسان، جهشی بزرگ برای بشریت» از معروف‌ترین جمله‌های قرن بیستم است. او پس از بازگشت زندگی آرامی داشت و کمتر در انظار ظاهر شد.',
      en: 'Neil Armstrong (1930-2012) was an American astronaut and the first human to walk on the Moon, on July 20, 1969, during Apollo 11. His words "one small step for man, one giant leap for mankind" are among the most famous of the 20th century. After returning he lived a quiet life out of the spotlight.'
    },
    {
      id: 'socrates_philosopher',
      keywords: ['سقراط کیه', 'socrates', 'who is socrates'],
      weak: ['سقراط', 'socrates'],
      weakSafe: true,
      hints: ['فلسفه', 'یونان', 'philosophy', 'greece'],
      fa: 'سقراط (۴۷۰-۳۹۹ پیش از میلاد) فیلسوف یونانی و معلم افلاطون است؛ او را پدر فلسفه‌ی غرب می‌دانند. چیزی ننوشت و با پرسش‌های پیوسته (روش سقراطی) مردم را به اندیشیدن وامی‌داشت. به اتهام ترویج اندیشه‌های نو و فاسدکردن جوانان به مرگ محکوم شد و جام شوکران را نوشید. «می‌دانم که نمی‌دانم» از او نقل می‌شود.',
      en: 'Socrates (470-399 BC) was a Greek philosopher and the teacher of Plato, often called the father of Western philosophy. He wrote nothing and instead pushed people to think through relentless questioning (the Socratic method). Condemned to death for corrupting the youth, he drank hemlock. "I know that I know nothing" is attributed to him.'
    },
    {
      id: 'plato_philosopher',
      keywords: ['افلاطون کیه', 'plato', 'who is plato'],
      weak: ['افلاطون', 'plato'],
      weakSafe: true,
      hints: ['فلسفه', 'یونان', 'philosophy', 'greece'],
      fa: 'افلاطون (۴۲۸-۳۴۸ پیش از میلاد) فیلسوف یونانی و شاگرد سقراط است که «جمهور» را درباره‌ی جامعه‌ی آرمانی نوشت و آکادمی را در آتن بنیان گذاشت. نظریه‌ی «مثل» او می‌گوید دنیای محسوس سایه‌ای از جهانی کامل‌تر است. گفتگوهای او (از جمله تمثیل غار) پایه‌ی فلسفه‌ی غرب شد.',
      en: 'Plato (428-348 BC) was a Greek philosopher, a student of Socrates, who wrote "The Republic" about the ideal society and founded the Academy in Athens. His theory of Forms holds that the visible world is a shadow of a more perfect one. His dialogues, including the Allegory of the Cave, became the foundation of Western philosophy.'
    },
    {
      id: 'aristotle_philosopher',
      keywords: ['ارسطو کیه', 'aristotle', 'who is aristotle'],
      weak: ['ارسطو', 'aristotle'],
      weakSafe: true,
      hints: ['فلسفه', 'یونان', 'philosophy', 'greece'],
      fa: 'ارسطو (۳۸۴-۳۲۲ پیش از میلاد) فیلسوف یونانی و شاگرد افلاطون و معلم اسکندر بود. در منطق، زیست‌شناسی، سیاست و اخلاق کتاب نوشت و «منطق ارسطویی» قرن‌ها مرجع بود. «اخلاق نیکوماخوس» او درباره‌ی زندگی خوب و فضیلت است. تأثیر او بر فلسفه و علم اسلامی و اروپایی تا قرن‌ها ادامه داشت.',
      en: 'Aristotle (384-322 BC) was a Greek philosopher, a student of Plato and the teacher of Alexander. He wrote on logic, biology, politics, and ethics, and Aristotelian logic was the reference for centuries. His "Nicomachean Ethics" is about the good life and virtue. His influence on Islamic and European thought lasted for centuries.'
    },
    {
      id: 'confucius_philosopher',
      keywords: ['کنفوسیوس کیه', 'confucius', 'who is confucius'],
      weak: ['کنفوسیوس', 'confucius'],
      weakSafe: true,
      hints: ['فلسفه', 'چین', 'philosophy', 'china'],
      fa: 'کنفوسیوس (۵۵۱-۴۷۹ پیش از میلاد) فیلسوف چینی بود که اندیشه‌اش بیش از دو هزار سال فرهنگ چین و شرق آسیا را شکل داد. آموزه‌هایش درباره‌ی اخلاق، احترام به بزرگ‌تر، آموزش و درست‌کاری در «گفتارها» (لون یو) جمع شده. او خودش را معلم می‌دانست نه پیامبر و تأکیدش بر خانواده و نظم اجتماعی بود.',
      en: 'Confucius (551-479 BC) was a Chinese philosopher whose thought shaped Chinese and East Asian culture for over two thousand years. His teachings on ethics, respect for elders, education, and integrity are collected in the "Analects". He saw himself as a teacher rather than a prophet, emphasizing family and social order.'
    },
    {
      id: 'nietzsche_philosopher',
      keywords: [
        'نیچه کیه',
        'nietzsche',
        'who is nietzsche',
        'friedrich nietzsche'
      ],
      weak: ['نیچه', 'nietzsche'],
      weakSafe: true,
      hints: ['فلسفه', 'آلمان', 'philosophy', 'germany'],
      fa: 'فریدریش نیچه (۱۸۴۴-۱۹۰۰) فیلسوف آلمانی است که با «چنین گفت زرتشت» و مفهوم «ابرانسان» شناخته می‌شود. او نقد شدیدی به اخلاق سنتی و دین داشت و جمله‌ی معروف «خدا مرده است» را درباره‌ی فروپاشی باورهای اروپای مدرن نوشت. تفسیرهای بعدی از او گاهی نادرست و خطرناک شد؛ کارش پیچیده‌تر از شعارهای منسوب به اوست.',
      en: 'Friedrich Nietzsche (1844-1900) was a German philosopher known for "Thus Spoke Zarathustra" and the concept of the overman. He sharply criticized traditional morality and religion, and his famous "God is dead" refers to the collapse of modern European belief. Later interpretations of him were sometimes distorted and dangerous; his work is more complex than the slogans attributed to him.'
    },
    {
      id: 'kant_philosopher',
      keywords: [
        'کانت کیه',
        'ایمانوئل کانت',
        'immanuel kant',
        'who is immanuel kant'
      ],
      weak: ['کانت', 'kant'],
      weakSafe: true,
      hints: ['فلسفه', 'آلمان', 'philosophy', 'germany'],
      fa: 'ایمانوئل کانت (۱۷۲۴-۱۸۰۴) فیلسوف آلمانی و یکی از مهم‌ترین اندیشمندان عصر روشنگری است. «نقد عقل محض» او پرسید دانش ما چگونه ممکن است و «امر مطلق» (قاعده‌ی اخلاقی جهان‌شمول) را در اخلاق مطرح کرد. تقریباً هیچ فیلسوفی بعد از او نمی‌تواند از پاسخ به کانت فرار کند.',
      en: 'Immanuel Kant (1724-1804) was a German philosopher and one of the most important thinkers of the Enlightenment. His "Critique of Pure Reason" asked how our knowledge is possible, and in ethics he proposed the categorical imperative, a universal moral rule. Hardly any philosopher after him can avoid responding to Kant.'
    },
    {
      id: 'descartes_philosopher',
      keywords: [
        'دکارت کیه',
        'descartes',
        'who is descartes',
        'rene descartes'
      ],
      weak: ['دکارت', 'descartes'],
      weakSafe: true,
      hints: ['فلسفه', 'فرانسه', 'philosophy', 'france'],
      fa: 'رنه دکارت (۱۵۹۶-۱۶۵۰) فیلسوف و ریاضی‌دان فرانسوی، پدر فلسفه‌ی مدرن است. جمله‌ی «می‌اندیشم پس هستم» (کوژیتو) او نقطه‌ی شروع یقین را از شک کردن ساخت. در ریاضیات، دستگاه مختصات دکارتی و هندسه‌ی تحلیلی را پایه گذاشت. او روح و جسم را دو جوهر جدا دانست؛ مسئله‌ای که هنوز بحث‌برانگیز است.',
      en: 'Rene Descartes (1596-1650) was a French philosopher and mathematician, the father of modern philosophy. His "I think, therefore I am" (cogito) built certainty from doubt. In mathematics he founded analytic geometry and the Cartesian coordinate system. He saw mind and body as two separate substances, an issue still debated.'
    },
    {
      id: 'suhrawardi_philosopher',
      keywords: ['سهروردی کیه', 'شیخ اشراق', 'suhrawardi', 'who is suhrawardi'],
      weak: ['سهروردی', 'اشراق', 'suhrawardi'],
      weakSafe: true,
      hints: ['فلسفه', 'ایران', 'philosophy', 'iran'],
      fa: 'شهاب‌الدین سهروردی (۱۱۵۴-۱۱۹۱ میلادی) فیلسوف ایرانی و بنیان‌گذار «حکمت اشراق» است؛ فلسفه‌ای که استدلال عقلی را با شهود و نور پیوند می‌زند. او در ۳۶ سالگی به دستور صلاح‌الدین ایوبی اعدام شد و به «شیخ مقتول» معروف شد. آثارش مانند «حکمةالاشراق» پل میان فلسفه‌ی ایران باستان و فلسفه‌ی اسلامی است.',
      en: 'Shahab al-Din Suhrawardi (1154-1191) was an Iranian philosopher and founder of the "Illuminationist" school (Hikmat al-Ishraq), which joins rational argument with intuition and light. Executed at thirty-six by order of Saladin, he became known as "the martyred sheikh". His works bridge ancient Persian thought and Islamic philosophy.'
    },
    {
      id: 'alexander_leader',
      keywords: [
        'اسکندر کیه',
        'اسکندر مقدونی',
        'alexander the great',
        'who is alexander the great'
      ],
      weak: ['اسکندر', 'alexander'],
      weakSafe: true,
      hints: ['پادشاه', 'یونان', 'king', 'greece', 'conqueror'],
      fa: 'اسکندر مقدونی (۳۵۶-۳۲۳ پیش از میلاد) پادشاه مقدونیه و از بزرگ‌ترین فاتحان تاریخ بود. در ۳۳۴ پیش از میلاد به امپراتوری هخامنشی حمله کرد، ایران را فتح کرد و تا هند پیش رفت. با ترویج ازدواج و فرهنگ‌های آمیخته، دوره‌ی هلنیسم را آغاز کرد. در ۳۲ سالگی در بابل درگذشت و امپراتوری‌اش بین سردارانش تقسیم شد.',
      en: 'Alexander the Great (356-323 BC) was king of Macedon and one of the greatest conquerors in history. In 334 BC he invaded the Achaemenid Empire, conquered Persia, and advanced as far as India. By mixing cultures and promoting intermarriage he started the Hellenistic era. He died in Babylon at thirty-two, and his empire split among his generals.'
    },
    {
      id: 'caesar_leader',
      keywords: [
        'سزار کیه',
        'ژولیوس سزار',
        'julius caesar',
        'who is julius caesar'
      ],
      weak: ['سزار', 'caesar'],
      weakSafe: true,
      hints: ['روم', 'امپراتور', 'rome', 'emperor', 'general'],
      fa: 'ژولیوس سزار (۱۰۰-۴۴ پیش از میلاد) سردار و سیاستمدار رومی بود که گال را فتح کرد و با عبور از روبیکون قدرت را در رم به دست گرفت. اصلاحاتش و لقب «دیکتاتور مادام‌العمر» او را محبوب و خطرناک کرد؛ سناتورها به رهبری بروتوس او را در ۱۵ مارس (اید مارس) ترور کردند. نامش بعدها لقب امپراتورها شد (قیصر).',
      en: 'Julius Caesar (100-44 BC) was a Roman general and statesman who conquered Gaul and, by crossing the Rubicon, seized power in Rome. His reforms and title of dictator for life made him loved and feared; senators led by Brutus assassinated him on the Ides of March. His name later became the title of emperors (Caesar).'
    },
    {
      id: 'cleopatra_queen',
      keywords: ['کلئوپاترا کیه', 'cleopatra', 'who is cleopatra'],
      weak: ['کلئوپاترا', 'کلیوپاترا', 'cleopatra'],
      weakSafe: true,
      hints: ['مصر', 'ملکه', 'egypt', 'queen'],
      fa: 'کلئوپاترا (۶۹-۳۰ پیش از میلاد) آخرین فرمانروای مؤثر مصر باستان از دودمان بطلمیوس بود. او با ژولیوس سزار و بعد مارک آنتونی اتحاد سیاسی و عاشقانه داشت و در جنگ با اکتاویوس شکست خورد؛ طبق روایت، پس از مرگ آنتونی خودکشی کرد. او چند زبان می‌دانست و سیاستمداری باهوش بود؛ تصویرش در سینما و ادبیات همیشه جذاب مانده.',
      en: 'Cleopatra (69-30 BC) was the last effective ruler of ancient Egypt from the Ptolemaic dynasty. She formed political and romantic alliances with Julius Caesar and later Mark Antony, lost the war against Octavian, and, according to tradition, took her own life after Antony death. She knew several languages and was a shrewd politician; her image remains fascinating in film and literature.'
    },
    {
      id: 'napoleon_leader',
      keywords: [
        'ناپلئون کیه',
        'napoleon',
        'who is napoleon',
        'napoleon bonaparte'
      ],
      weak: ['ناپلئون', 'napoleon'],
      weakSafe: true,
      hints: ['فرانسه', 'امپراتور', 'france', 'emperor'],
      fa: 'ناپلئون بناپارت (۱۷۶۹-۱۸۲۱) سردار و امپراتور فرانسه بود که پس از انقلاب فرانسه به قدرت رسید و بخش بزرگی از اروپا را فتح کرد. قانون مدنی ناپلئون (کد ناپلئون) هنوز پایه‌ی حقوق خیلی از کشورهاست. حمله به روسیه در ۱۸۱۲ شکست بزرگی بود؛ در واترلو (۱۸۱۵) شکست خورد و به جزیره‌ی سنت هلن تبعید شد و همان‌جا درگذشت.',
      en: 'Napoleon Bonaparte (1769-1821) was a French general and emperor who rose after the French Revolution and conquered much of Europe. The Napoleonic Code still underpins the law of many countries. The 1812 invasion of Russia was a disaster; he was defeated at Waterloo (1815), exiled to Saint Helena, and died there.'
    },
    {
      id: 'genghis_khan_leader',
      keywords: [
        'چنگیز کیه',
        'چنگیزخان',
        'genghis khan',
        'who is genghis khan'
      ],
      weak: ['چنگیز', 'genghis'],
      weakSafe: true,
      hints: ['مغول', 'فاتح', 'mongol', 'conqueror'],
      fa: 'چنگیزخان (حدود ۱۱۶۲-۱۲۲۷ میلادی) بنیان‌گذار امپراتوری مغول و از بزرگ‌ترین فاتحان تاریخ است. قبایل مغول را یکپارچه کرد و امپراتوری‌ای ساخت که از چین تا اروپای شرقی کشیده شد. لشکرکشی‌هایش ویرانی‌های بسیار داشت، اما راه ابریشم را هم یکپارچه و امن کرد و ارتباط شرق و غرب را گسترش داد. حمله‌ی او به ایران برای خوارزمشاهیان فاجعه‌بار بود.',
      en: 'Genghis Khan (c. 1162-1227) founded the Mongol Empire and was one of the greatest conquerors in history. He united the Mongol tribes and built an empire stretching from China to Eastern Europe. His campaigns brought immense destruction, but they also unified and secured the Silk Road, connecting East and West. His invasion of Iran was catastrophic for the Khwarazmian dynasty.'
    },
    {
      id: 'gandhi_leader',
      keywords: [
        'گاندی کیه',
        'مهاتما گاندی',
        'gandhi',
        'who is gandhi',
        'mahatma gandhi'
      ],
      weak: ['گاندی', 'gandhi'],
      weakSafe: true,
      hints: ['هند', 'مقاومت', 'india', 'nonviolence'],
      fa: 'مهاتما گاندی (۱۸۶۹-۱۹۴۸) رهبر جنبش استقلال هند بود که با فلسفه‌ی «ساتیاگراها» (مقاومت بدون خشونت) و نافرمانی مدنی مبارزه کرد؛ مثل راهپیمایی معروف نمک در ۱۹۳۰. او با فقر زندگی کرد و برای گفتگوی مسلمانان و هندوها کوشید. در ۱۹۴۸ توسط یک تندرو هندو ترور شد. تصویر او نماد صلح در جهان است.',
      en: 'Mahatma Gandhi (1869-1948) led India independence movement with the philosophy of satyagraha (nonviolent resistance) and civil disobedience, such as the famous Salt March of 1930. He lived in poverty by choice and worked for Hindu-Muslim dialogue. He was assassinated by a Hindu extremist in 1948. His image is a global symbol of peace.'
    },
    {
      id: 'mandela_leader',
      keywords: [
        'ماندلا کیه',
        'نلسون ماندلا',
        'nelson mandela',
        'who is nelson mandela'
      ],
      weak: ['ماندلا', 'mandela'],
      weakSafe: true,
      hints: ['آفریقای جنوبی', 'حقوق', 'south africa', 'rights'],
      fa: 'نلسون ماندلا (۱۹۱۸-۲۰۱۳) رهبر مبارزه با آپارتاید در آفریقای جنوبی بود. بیست و هفت سال در زندان ماند و پس از آزادی، بدون انتقام‌جویی، مذاکره برای پایان آپارتاید را رهبری کرد و نخستین رئیس‌جمهور سیاه‌پوست کشورش شد. در ۱۹۹۳ جایزه‌ی نوبل صلح گرفت. زندگی او نماد بخشش و آشتی است.',
      en: 'Nelson Mandela (1918-2013) led the struggle against apartheid in South Africa. He spent twenty-seven years in prison and, after release, led the negotiation to end apartheid without vengeance, becoming the country first Black president. He won the 1993 Nobel Peace Prize. His life is a symbol of forgiveness and reconciliation.'
    },
    {
      id: 'mlk_leader',
      keywords: [
        'مارتین لوتر کینگ کیه',
        'لوتر کینگ',
        'martin luther king',
        'who is martin luther king'
      ],
      weak: ['لوتر کینگ', 'mlk', 'martin luther king'],
      weakSafe: true,
      hints: ['آمریکا', 'حقوق مدنی', 'america', 'civil rights'],
      fa: 'مارتین لوتر کینگ جونیور (۱۹۲۹-۱۹۶۸) رهبر جنبش حقوق مدنی آمریکا و کشیش باپتیست بود. با مقاومت بدون خشونت و راهپیمایی‌ها (از جمله راهپیمایی ۱۹۶۳ واشنگتن) برای برابری سیاه‌پوستان مبارزه کرد و سخنرانی معروف «من یک رؤیا دارم» را ایراد کرد. در ۱۹۶۴ نوبل صلح گرفت و در ۱۹۶۸ ترور شد.',
      en: 'Martin Luther King Jr. (1929-1968) was a Baptist minister and the leader of the American civil rights movement. Through nonviolent resistance and marches, including the 1963 March on Washington where he delivered his famous "I Have a Dream" speech, he fought for Black equality. He won the 1964 Nobel Peace Prize and was assassinated in 1968.'
    },
    {
      id: 'lincoln_leader',
      keywords: [
        'لینکلن کیه',
        'آبراهام لینکلن',
        'abraham lincoln',
        'who is abraham lincoln'
      ],
      weak: ['لینکلن', 'lincoln'],
      weakSafe: true,
      hints: ['آمریکا', 'رئیس‌جمهور', 'america', 'president'],
      fa: 'آبراهام لینکلن (۱۸۰۹-۱۸۶۵) شانزدهمین رئیس‌جمهور آمریکا بود که کشورش را در جنگ داخلی رهبری کرد و برده‌داری را با اعلامیه‌ی آزادی (۱۸۶۳) و متمم سیزدهم پایان داد. سخنرانی کوتاه «گتیسبرگ» او از مهم‌ترین متن‌های تاریخ آمریکاست. در پایان جنگ، در تئاتر ترور شد. او از فقیرترین خانواده‌ها به بالاترین مقام کشور رسید.',
      en: 'Abraham Lincoln (1809-1865) was the 16th US president who led the country through the Civil War and ended slavery with the Emancipation Proclamation (1863) and the 13th Amendment. His short Gettysburg Address is among the most important texts in American history. He was assassinated in a theater as the war ended, having risen from poverty to the highest office.'
    },
    {
      id: 'ataturk_leader',
      keywords: [
        'آتاتورک کیه',
        'مصطفی کمال',
        'ataturk',
        'who is ataturk',
        'mustafa kemal'
      ],
      weak: ['آتاتورک', 'ataturk', 'مصطفی کمال'],
      weakSafe: true,
      hints: ['ترکیه', 'رئیس‌جمهور', 'turkey', 'president'],
      fa: 'مصطفی کمال آتاتورک (۱۸۸۱-۱۹۳۸) بنیان‌گذار جمهوری ترکیه و نخستین رئیس‌جمهور آن بود. در جنگ جهانی اول در گالیپولی درخشید و پس از فروپاشی امپراتوری عثمانی، جنگ استقلال ترکیه را رهبری کرد. اصلاحاتش شامل جدایی دین از دولت، الفبای لاتین و حقوق زنان بود. او برای ترک‌ها چهره‌ای بنیان‌گذار و برای منتقدانش بحث‌برانگیز است.',
      en: 'Mustafa Kemal Ataturk (1881-1938) founded the Republic of Turkey and was its first president. He distinguished himself at Gallipoli in World War I and led Turkey war of independence after the Ottoman collapse. His reforms included secularism, the Latin alphabet, and women rights. He is a founding figure for Turks and a debated one for his critics.'
    },
    {
      id: 'shakespeare_writer',
      keywords: [
        'شکسپیر کیه',
        'shakespeare',
        'who is shakespeare',
        'william shakespeare'
      ],
      weak: ['شکسپیر', 'shakespeare'],
      weakSafe: true,
      hints: ['نمایشنامه', 'انگلیس', 'playwright', 'england'],
      fa: 'ویلیام شکسپیر (۱۵۶۴-۱۶۱۶) نمایشنامه‌نویس و شاعر انگلیسی و مشهورترین نویسنده‌ی زبان انگلیسی است. «هملت»، «رومئو و ژولیت»، «مکبث» و «شاه لیر» از آثار اوست و عبارت‌هایش در زبان انگلیسی روزمره نفوذ کرده. حدود ۳۸ نمایشنامه و ۱۵۴ غزل از او مانده و هنوز در سراسر جهان اجرا می‌شود.',
      en: 'William Shakespeare (1564-1616) was an English playwright and poet, the most famous writer in the English language. "Hamlet", "Romeo and Juliet", "Macbeth", and "King Lear" are his, and his phrases permeate everyday English. About 38 plays and 154 sonnets survive, still performed worldwide.'
    },
    {
      id: 'tolstoy_writer',
      keywords: [
        'تولستوی کیه',
        'لئو تولستوی',
        'leo tolstoy',
        'who is leo tolstoy'
      ],
      weak: ['تولستوی', 'tolstoy'],
      weakSafe: true,
      hints: ['نویسنده', 'روسیه', 'writer', 'russia'],
      fa: 'لئو تولستوی (۱۸۲۸-۱۹۱۰) نویسنده‌ی روسی و خالق «جنگ و صلح» و «آنا کارنینا» است؛ دو رمان از بزرگ‌ترین رمان‌های تاریخ. در سال‌های آخر عمر به ساده‌زیستی و صلح‌طلبی مذهبی گرایید و از اموالش دست کشید. در ۸۲ سالگی در ایستگاه راه‌آهن درگذشت. گاندی از اندیشه‌ی او تأثیر گرفته بود.',
      en: 'Leo Tolstoy (1828-1910) was a Russian writer and the author of "War and Peace" and "Anna Karenina", two of the greatest novels ever written. In his later years he turned to simplicity and religious pacifism, renouncing his property. He died at eighty-two at a railway station. Gandhi was influenced by his thought.'
    },
    {
      id: 'dostoevsky_writer',
      keywords: [
        'داستایفسکی کیه',
        'داستایوسکی',
        'dostoevsky',
        'who is dostoevsky',
        'fyodor dostoevsky'
      ],
      weak: ['داستایفسکی', 'داستایوسکی', 'dostoevsky'],
      weakSafe: true,
      hints: ['نویسنده', 'روسیه', 'writer', 'russia'],
      fa: 'فیودور داستایفسکی (۱۸۲۱-۱۸۸۱) نویسنده‌ی روسی و از عمیق‌ترین کاشفان روان انسان است. «جنایت و مکافات»، «برادران کارامازوف» و «ابله» آثار اوست. خودش یک بار به اعدام محکوم شد و در آخرین لحظه عفو شد؛ تجربه‌ای که در نوشته‌هایش بازتاب دارد. رمان‌هایش درباره‌ی گناه، آزادی، ایمان و رنج‌اند.',
      en: 'Fyodor Dostoevsky (1821-1881) was a Russian writer and one of the deepest explorers of the human psyche. "Crime and Punishment", "The Brothers Karamazov", and "The Idiot" are his works. He was once sentenced to death and pardoned at the last moment, an experience echoed in his writing. His novels are about guilt, freedom, faith, and suffering.'
    },
    {
      id: 'kafka_writer',
      keywords: ['کافکا کیه', 'franz kafka', 'who is kafka'],
      weak: ['کافکا', 'kafka'],
      weakSafe: true,
      hints: ['نویسنده', 'داستان', 'writer', 'story'],
      fa: 'فرانتس کافکا (۱۸۸۳-۱۹۲۴) نویسنده‌ی آلمانی‌زبان اهل پراگ است. «مسخ» (داستان مردی که سوسک می‌شود)، «محاکمه» و «قصر» آثار اوست که دنیایی از بیگانگی، بوروکراسی و اضطراب را تصویر می‌کنند. بیشتر آثارش پس از مرگش منتشر شد و واژه‌ی «کافکایی» برای موقعیت‌های پوچ و سردرگم‌کننده وارد زبان‌ها شده.',
      en: 'Franz Kafka (1883-1924) was a German-speaking writer from Prague. "The Metamorphosis" (a man who becomes an insect), "The Trial", and "The Castle" portray a world of alienation, bureaucracy, and anxiety. Much of his work was published after his death, and the word "Kafkaesque" entered languages for absurd, disorienting situations.'
    },
    {
      id: 'hemingway_writer',
      keywords: [
        'همینگوی کیه',
        'ارنست همینگوی',
        'ernest hemingway',
        'who is ernest hemingway'
      ],
      weak: ['همینگوی', 'hemingway'],
      weakSafe: true,
      hints: ['نویسنده', 'آمریکا', 'writer', 'america', 'nobel'],
      fa: 'ارنست همینگوی (۱۸۹۹-۱۹۶۱) نویسنده‌ی آمریکایی و برنده‌ی نوبل ادبیات ۱۹۵۴ است. «پیرمرد و دریا»، «وداع با اسلحه» و «زنگ‌ها برای که به صدا درمی‌آیند» از آثار اوست. سبک کوتاه و بی‌آرایش او (نظریه‌ی کوه یخ) نسل‌ها از نویسندگان را تحت تأثیر گذاشت. او در ۶۱ سالگی خودکشی کرد.',
      en: 'Ernest Hemingway (1899-1961) was an American writer and the 1954 Nobel laureate in literature. "The Old Man and the Sea", "A Farewell to Arms", and "For Whom the Bell Tolls" are his. His spare, unadorned style (the iceberg theory) influenced generations of writers. He died by suicide at sixty-one.'
    },
    {
      id: 'orwell_writer',
      keywords: [
        'اورول کیه',
        'جورج اورول',
        'george orwell',
        'who is george orwell'
      ],
      weak: ['اورول', 'orwell'],
      weakSafe: true,
      hints: ['نویسنده', 'انگلیس', 'writer', 'england'],
      fa: 'جورج اورول (۱۹۰۳-۱۹۵۰) نویسنده‌ی انگلیسی و خالق «۱۹۸۴» و «مزرعه‌ی حیوانات» است؛ دو کتاب که نقد قدرت، توتالیتاریسم و تبلیغات شدند. واژه‌های «برادر بزرگ» و «افکار عمومی» از او در فرهنگ جهانی ماندگار شده. او روزنامه‌نگار هم بود و درباره‌ی جنگ داخلی اسپانیا نوشت.',
      en: 'George Orwell (1903-1950) was an English writer and the author of "1984" and "Animal Farm", both sharp critiques of power, totalitarianism, and propaganda. Terms like "Big Brother" from his work are part of global culture. He was also a journalist who covered the Spanish Civil War.'
    },
    {
      id: 'austen_writer',
      keywords: ['جین آستن کیه', 'آستن', 'jane austen', 'who is jane austen'],
      weak: ['آستن', 'austen'],
      weakSafe: true,
      hints: ['نویسنده', 'انگلیس', 'writer', 'england', 'novel'],
      fa: 'جین آستن (۱۷۷۵-۱۸۱۷) رمان‌نویس انگلیسی و نویسنده‌ی «غرور و تعصب»، «عقل و احساس» و «اما» است. با طنزی ظریف، زندگی، ازدواج و محدودیت‌های زنان در جامعه‌ی طبقاتی قرن نوزدهم را تصویر کرد. آثارش هنوز پرفروش و بارها اقتباس سینمایی‌اند و او را یکی از بزرگ‌ترین رمان‌نویسان انگلیسی می‌دانند.',
      en: 'Jane Austen (1775-1817) was an English novelist, the author of "Pride and Prejudice", "Sense and Sensibility", and "Emma". With subtle wit she portrayed life, marriage, and the limits of women in 19th-century class society. Her books remain bestsellers with many film adaptations, and she is considered one of the greatest English novelists.'
    },
    {
      id: 'vangogh_artist',
      keywords: [
        'ون گوگ کیه',
        'وینسنت ون گوگ',
        'van gogh',
        'who is van gogh',
        'vincent van gogh'
      ],
      weak: ['ون گوگ', 'وان گوگ', 'van gogh'],
      weakSafe: true,
      hints: ['نقاش', 'هنر', 'painter', 'art'],
      fa: 'وینسنت ون گوگ (۱۸۵۳-۱۸۹۰) نقاش هلندی و از بزرگ‌ترین هنرمندان تاریخ است. «شب پرستاره»، «گل‌های آفتابگردان» و خودنگاره‌هایش با رنگ‌های درخشان و ضربه‌قلم‌های پرفشار شناخته می‌شوند. در زمان حیاتش تقریباً هیچ‌کس آثارش را نمی‌خرید و در ۳۷ سالگی خودکشی کرد؛ امروز نقاشی‌هایش از گران‌ترین‌های جهان‌اند.',
      en: 'Vincent van Gogh (1853-1890) was a Dutch painter and one of the greatest artists in history. "The Starry Night", the sunflowers, and his self-portraits are known for vivid colors and bold brushwork. Almost no one bought his work in his lifetime, and he died by suicide at thirty-seven; today his paintings are among the most expensive in the world.'
    },
    {
      id: 'picasso_artist',
      keywords: ['پیکاسو کیه', 'pablo picasso', 'who is picasso'],
      weak: ['پیکاسو', 'picasso'],
      weakSafe: true,
      hints: ['نقاش', 'هنر', 'painter', 'art'],
      fa: 'پابلو پیکاسو (۱۸۸۱-۱۹۷۳) نقاش اسپانیایی و یکی از تأثیرگذارترین هنرمندان قرن بیستم است. او به‌همراه ژرژ براک کوبیسم را پایه گذاشت و «دوشیزگان آوینیون» و «گرنیکا» (واکنش به بمباران شهر گرنیکا در جنگ داخلی اسپانیا) را خلق کرد. در دوره‌های مختلف (آبی، صورتی، کوبیسم، سوررئالیسم) کار کرد و حجم عظیمی از آثار از خودش گذاشت.',
      en: 'Pablo Picasso (1881-1973) was a Spanish painter and one of the most influential artists of the 20th century. With Georges Braque he founded Cubism and created "Les Demoiselles d Avignon" and "Guernica" (a response to the bombing of Guernica in the Spanish Civil War). He worked through many periods, from Blue and Rose to Cubism and Surrealism, leaving a vast body of work.'
    },
    {
      id: 'davinci_artist',
      keywords: [
        'داوینچی کیه',
        'لئوناردو داوینچی',
        'da vinci',
        'who is da vinci',
        'leonardo da vinci'
      ],
      weak: ['داوینچی', 'da vinci', 'leonardo'],
      weakSafe: true,
      hints: ['نقاش', 'مخترع', 'painter', 'inventor'],
      fa: 'لئوناردو داوینچی (۱۴۵۲-۱۵۱۹) هنرمند و دانشمند ایتالیایی دوره‌ی رنسانس و نماد «انسان جامع» است. «مونالیزا» و «شام آخر» مشهورترین نقاشی‌های اوست و دفترچه‌هایش پر از طرح‌های آناتومی، ماشین‌های پرواز و مهندسی است. فقط چند نقاشی از او مانده اما همین‌ها او را جاودانه کرده‌اند.',
      en: 'Leonardo da Vinci (1452-1519) was an Italian Renaissance artist and scientist, the symbol of the "universal man". "Mona Lisa" and "The Last Supper" are his most famous paintings, and his notebooks are full of anatomy, flying machines, and engineering designs. Only a few of his paintings survive, yet they made him immortal.'
    },
    {
      id: 'kahlo_artist',
      keywords: ['فریدا کالو کیه', 'frida kahlo', 'who is frida kahlo'],
      weak: ['فریدا', 'کالو', 'kahlo'],
      weakSafe: true,
      hints: ['نقاش', 'مکزیک', 'painter', 'mexico'],
      fa: 'فریدا کالو (۱۹۰۷-۱۹۵۴) نقاش مکزیکی است که با خودنگاره‌های پرشور و بی‌پرده‌اش شناخته می‌شود. در کودکی فلج اطفال و در نوجوانی تصادف سنگینی او را با درد مادام‌العمر روبه‌رو کرد؛ درد و هویت در نقاشی‌هایش مرکزی‌اند. او با دیگو ریورا ازدواج کرد و بعدها نماد فمینیسم و فرهنگ مکزیک شد.',
      en: 'Frida Kahlo (1907-1954) was a Mexican painter known for her passionate, unflinching self-portraits. Polio in childhood and a severe bus accident in her teens left her in lifelong pain, and pain and identity are central to her art. She married Diego Rivera and later became an icon of feminism and Mexican culture.'
    },
    {
      id: 'beethoven_musician',
      keywords: [
        'بتهوون کیه',
        'لودویگ ون بتهوون',
        'beethoven',
        'who is beethoven',
        'ludwig van beethoven'
      ],
      weak: ['بتهوون', 'beethoven'],
      weakSafe: true,
      hints: ['موسیقی', 'آهنگساز', 'music', 'composer'],
      fa: 'لودویگ ون بتهوون (۱۷۷۰-۱۸۲۷) آهنگساز آلمانی و یکی از بزرگ‌ترین موسیقی‌دانان تاریخ است. نُه سمفونی او (به‌ویژه سمفونی پنجم و نهم با «سرود شادی») پل میان کلاسیک و رمانتیک‌اند. در حالی که کم‌کم ناشنوا می‌شد، مهم‌ترین آثارش را ساخت؛ ناشنوایی‌اش مانع خلاقیتش نشد.',
      en: 'Ludwig van Beethoven (1770-1827) was a German composer and one of the greatest musicians in history. His nine symphonies, especially the Fifth and the Ninth with its "Ode to Joy", bridge classicism and romanticism. He wrote his most important works while gradually going deaf; deafness did not stop his creativity.'
    },
    {
      id: 'mozart_musician',
      keywords: [
        'موتسارت کیه',
        'ولفگانگ آمادئوس موتسارت',
        'mozart',
        'who is mozart'
      ],
      weak: ['موتسارت', 'mozart'],
      weakSafe: true,
      hints: ['موسیقی', 'آهنگساز', 'music', 'composer'],
      fa: 'ولفگانگ آمادئوس موتسارت (۱۷۵۶-۱۷۹۱) آهنگساز اتریشی و کودک نابغه‌ای بود که از پنج سالگی آهنگ می‌ساخت. اپراهای «ازدواج فیگارو»، «دون ژوان» و «فلوت سحرآمیز» و سمفونی‌هایش (از جمله چهلم) از شاهکارهای موسیقی‌اند. در ۳۵ سالگی در فقر درگذشت اما بیش از ۶۰۰ اثر از خودش گذاشت.',
      en: 'Wolfgang Amadeus Mozart (1756-1791) was an Austrian composer and a child prodigy who composed from age five. The operas "The Marriage of Figaro", "Don Giovanni", and "The Magic Flute" and his symphonies, including the Fortieth, are masterpieces. He died in poverty at thirty-five, leaving over 600 works.'
    },
    {
      id: 'bach_musician',
      keywords: [
        'باخ کیه',
        'یوهان سباستیان باخ',
        'johann sebastian bach',
        'who is bach'
      ],
      weak: ['باخ', 'bach'],
      weakSafe: true,
      hints: ['موسیقی', 'آهنگساز', 'music', 'composer'],
      fa: 'یوهان سباستیان باخ (۱۶۸۵-۱۷۵۰) آهنگساز آلمانی و از ارکان موسیقی کلاسیک است. «کنسرتوهای براندنبورگ»، «گلدبرگ واریاسیون‌ها» و آثار ارگش سرشار از نظم و ژرفای عاطفی‌اند. در زمان حیاتش بیشتر به‌عنوان ارگ‌نواز معروف بود؛ موتسارت، بتهوون و همه‌ی موسیقی بعدی از او تغذیه کردند.',
      en: 'Johann Sebastian Bach (1685-1750) was a German composer and a cornerstone of classical music. The Brandenburg Concertos, the Goldberg Variations, and his organ works are full of order and emotional depth. In his lifetime he was known mainly as an organist; Mozart, Beethoven, and all later music drew from him.'
    },
    {
      id: 'michaeljackson_singer',
      keywords: [
        'مایکل جکسون کیه',
        'michael jackson',
        'who is michael jackson'
      ],
      weak: ['مایکل جکسون', 'michael jackson', 'jackson'],
      weakSafe: true,
      hints: ['موسیقی', 'خواننده', 'music', 'singer', 'pop'],
      fa: 'مایکل جکسون (۱۹۵۸-۲۰۰۹) خواننده و رقصنده‌ی آمریکایی و «پادشاه پاپ» بود. آلبوم «تریلر» (۱۹۸۲) پرفروش‌ترین آلبوم تاریخ است و موزیک‌ویدئوی آن استاندارد صنعت را عوض کرد. رقص «مون‌واک» او جهانی شد. زندگی‌اش در سال‌های آخر پر از جنجال و اتهام بود؛ درباره‌ی اتهام‌ها هنوز بحث‌ها ادامه دارد.',
      en: 'Michael Jackson (1958-2009) was an American singer and dancer, the "King of Pop". "Thriller" (1982) is the best-selling album in history, and its music video changed the industry. His moonwalk became world-famous. His later life was full of controversy and accusations that are still debated.'
    },
    {
      id: 'beatles_band',
      keywords: ['بیتلز کیه', 'the beatles', 'who are the beatles'],
      weak: ['بیتلز', 'beatles'],
      weakSafe: true,
      hints: ['موسیقی', 'گروه', 'music', 'band'],
      fa: 'بیتلز (The Beatles) گروه راک انگلیسی از لیورپول بود با چهار عضو: جان لنون، پل مک‌کارتنی، جورج هریسون و رینگو استار. از اوایل دهه‌ی ۱۹۶۰ با آهنگ‌هایی مثل «دیروز» و «هی جود» و آلبوم‌های «ابِی رود» و «اسجی‌تی‌پی‌جی‌اس» موسیقی عامه‌پسند را متحول کردند و «بیتل‌مانیا» ساختند. در ۱۹۷۰ از هم جدا شدند اما تأثیرشان ماندگار است.',
      en: 'The Beatles were an English rock band from Liverpool with four members: John Lennon, Paul McCartney, George Harrison, and Ringo Starr. From the early 1960s, with songs like "Yesterday" and "Hey Jude" and albums like "Abbey Road" and "Sgt. Pepper", they transformed popular music and created Beatlemania. They split in 1970, but their influence endures.'
    },
    {
      id: 'rosa_parks_activist',
      keywords: ['رزا پارکس کیه', 'rosa parks', 'who is rosa parks'],
      weak: ['رزا پارکس', 'rosa parks'],
      weakSafe: true,
      hints: ['حقوق مدنی', 'آمریکا', 'civil rights', 'america'],
      fa: 'رزا پارکس (۱۹۱۳-۲۰۰۵) فعال حقوق مدنی آمریکا بود. در ۱۹۵۵ در مونتگومری آلاباما از واگذارکردن صندلی اتوبوس به مسافر سفیدپوست خودداری کرد و دستگیر شد؛ این جرقه‌ی تحریم اتوبوس‌های مونتگومری شد که یک سال طول کشید و جنبش حقوق مدنی را به حرکت درآورد. کنگره‌ی آمریکا بعدها او را «مادر جنبش حقوق مدنی» خواند.',
      en: 'Rosa Parks (1913-2005) was an American civil rights activist. In 1955 in Montgomery, Alabama, she refused to give her bus seat to a white passenger and was arrested; this sparked the year-long Montgomery bus boycott that energized the civil rights movement. The US Congress later called her "the mother of the civil rights movement".'
    },
    {
      id: 'malala_activist',
      keywords: [
        'ملاله کیه',
        'ملاله یوسف زی',
        'malala',
        'who is malala',
        'malala yousafzai'
      ],
      weak: ['ملاله', 'malala'],
      weakSafe: true,
      hints: ['حقوق', 'آموزش', 'rights', 'education', 'nobel'],
      fa: 'ملاله یوسف‌زی (زاده‌ی ۱۹۹۷) فعال پاکستانی حقوق آموزش دختران و جوان‌ترین برنده‌ی نوبل صلح (۲۰۱۴) است. در ۲۰۱۲ طالبان به او شلیک کردند چون برای مدرسه‌رفتن دختران مبارزه می‌کرد؛ او جان سالم به در برد و در بریتانیا ادامه‌ی تحصیل داد. کتاب «من ملاله هستم» را نوشت و سخنران جهانی آموزش شد.',
      en: 'Malala Yousafzai (born 1997) is a Pakistani activist for girls education and the youngest Nobel Peace Prize laureate (2014). In 2012 the Taliban shot her for campaigning for girls schooling; she survived, continued her education in Britain, wrote "I Am Malala", and became a global voice for education.'
    },
    {
      id: 'woolf_writer',
      keywords: [
        'ویرجینیا وولف کیه',
        'وولف',
        'virginia woolf',
        'who is virginia woolf'
      ],
      weak: ['وولف', 'woolf'],
      weakSafe: true,
      hints: ['نویسنده', 'انگلیس', 'writer', 'england'],
      fa: 'ویرجینیا وولف (۱۸۸۲-۱۹۴۱) نویسنده‌ی انگلیسی و از پیشگامان جریان سیال ذهن در رمان است. «خانم دالووی»، «به سوی فانوس دریایی» و «اتاقی از آن خود» (در باب حق زنان برای نوشتن) از آثار اوست. او با بیماری روانی دست‌به‌گریبان بود و در ۵۹ سالگی خودکشی کرد. آثارش بر ادبیات و فمینیسم اثر عمیق گذاشت.',
      en: 'Virginia Woolf (1882-1941) was an English writer and a pioneer of stream of consciousness in the novel. "Mrs Dalloway", "To the Lighthouse", and "A Room of One Own" (about women right to write) are her works. She struggled with mental illness and died by suicide at fifty-nine. Her work deeply influenced literature and feminism.'
    },
    {
      id: 'goodall_scientist',
      keywords: ['جین گودال کیه', 'jane goodall', 'who is jane goodall'],
      weak: ['گودال', 'goodall'],
      weakSafe: true,
      hints: ['طبیعت', 'شامپانزه', 'nature', 'chimpanzee'],
      fa: 'جین گودال (زاده‌ی ۱۹۳۴) رفتارشناس بریتانیایی است که از ۱۹۶۰ در تانزانیا زندگی شامپانزه‌ها را در طبیعت مطالعه کرد. او کشف کرد شامپانزه‌ها ابزار می‌سازند و به‌کار می‌برند؛ کشفی که تصویر ما از انسان را تغییر داد. امروز سفیر صلح سازمان ملل و فعال جهانی حفاظت از طبیعت است.',
      en: 'Jane Goodall (born 1934) is a British primatologist who has studied chimpanzees in the wild in Tanzania since 1960. She discovered that chimpanzees make and use tools, a finding that changed our image of humanity. Today she is a UN Messenger of Peace and a global advocate for conservation.'
    },
    {
      id: 'pele_footballer',
      keywords: ['پله کیه', 'پله', 'pele', 'who is pele'],
      weak: ['پله', 'pele'],
      weakSafe: true,
      hints: ['فوتبال', 'برزیل', 'football', 'brazil'],
      fa: 'پله (ادسون آرانتس دوناسیمنتو، ۱۹۴۰-۲۰۲۲) فوتبالیست برزیلی و یکی از بزرگ‌ترین بازیکنان تاریخ است. با برزیل سه بار قهرمان جام جهانی شد (۱۹۵۸، ۱۹۶۲، ۱۹۷۰) و بیش از هزار گل رسمی زد. به او لقب «پادشاه فوتبال» دادند. در جام جهانی ۱۹۵۸ در ۱۷ سالگی ستاره شد.',
      en: 'Pele (Edson Arantes do Nascimento, 1940-2022) was a Brazilian footballer and one of the greatest players in history. He won the World Cup three times with Brazil (1958, 1962, 1970) and scored more than a thousand official goals. Called "the King of Football", he became a star at seventeen in the 1958 World Cup.'
    },
    {
      id: 'maradona_footballer',
      keywords: ['مارادونا کیه', 'diego maradona', 'who is maradona'],
      weak: ['مارادونا', 'maradona'],
      weakSafe: true,
      hints: ['فوتبال', 'آرژانتین', 'football', 'argentina'],
      fa: 'دیگو مارادونا (۱۹۶۰-۲۰۲۰) فوتبالیست آرژانتینی و یکی از بزرگ‌ترین‌های تاریخ است. در جام جهانی ۱۹۸۶ با «دست خدا» و «گل قرن» (فردا از نیمه‌ی زمین) آرژانتین را قهرمان کرد. زندگی‌اش پر از فراز و نشیب و اعتیاد بود؛ برای ناپولی و بارسلونا بازی کرد و بعدها مربی شد. در آرژانتین او را نیمه‌خدا می‌دانند.',
      en: 'Diego Maradona (1960-2020) was an Argentine footballer and one of the greatest in history. In the 1986 World Cup, with the "Hand of God" and the "Goal of the Century", he carried Argentina to the title. His life was full of highs, lows, and addiction; he played for Napoli and Barcelona and later coached. In Argentina he is revered like a demigod.'
    },
    {
      id: 'ali_boxer',
      keywords: [
        'محمد علی کیه',
        'محمدعلی کلی',
        'muhammad ali',
        'who is muhammad ali'
      ],
      weak: ['محمد علی', 'محمدعلی', 'کلی', 'muhammad ali', 'ali'],
      weakSafe: true,
      hints: ['بوکس', 'قهرمان', 'boxing', 'champion'],
      fa: 'محمدعلی کلی (کاسیوس کلی، ۱۹۴۲-۲۰۱۶) بوکسور آمریکایی و از بزرگ‌ترین ورزشکاران قرن بیستم بود. سه بار قهرمان سنگین‌وزن جهان شد و با «وزوز مثل پروانه، نیش مثل زنبور» معروف بود. به خاطر اعتقاداتش از جنگ ویتنام سر باز زد و عنوانش گرفته شد؛ بعدها نماد ایستادگی و عدالت شد. بیماری پارکینسون آخر عمرش را گرفت.',
      en: 'Muhammad Ali (Cassius Clay, 1942-2016) was an American boxer and one of the greatest athletes of the 20th century. He became heavyweight champion three times and was famous for "float like a butterfly, sting like a bee". He refused the Vietnam War draft on principle, lost his title, and later became a symbol of resistance and justice. Parkinson disease marked his final years.'
    },
    {
      id: 'serena_tennis',
      keywords: [
        'سرنا ویلیامز کیه',
        'سرنا',
        'serena williams',
        'who is serena williams'
      ],
      weak: ['سرنا', 'ویلیامز', 'serena williams'],
      weakSafe: true,
      hints: ['تنیس', 'قهرمان', 'tennis', 'champion'],
      fa: 'سرنا ویلیامز (زاده‌ی ۱۹۸۱) تنیس‌باز آمریکایی و از بزرگ‌ترین‌های تاریخ این ورزش است. او ۲۳ گرنداسلم تکنفره برد (رکورد دوران حرفه‌ای) و با خواهرش ونوس سال‌ها تنیس زنان را رهبری کرد. با قدرت و جنگندگی‌اش موانع نژادی و جنسیتی را هم شکست و به چهره‌ای فراتر از ورزش تبدیل شد.',
      en: 'Serena Williams (born 1981) is an American tennis player and one of the greatest in the sport. She won 23 Grand Slam singles titles (a record for the Open era) and, with her sister Venus, dominated women tennis for years. With her power and fight she also broke racial and gender barriers, becoming an icon beyond sport.'
    },
    {
      id: 'federer_tennis',
      keywords: [
        'فدرر کیه',
        'راجر فدرر',
        'roger federer',
        'who is roger federer'
      ],
      weak: ['فدرر', 'federer'],
      weakSafe: true,
      hints: ['تنیس', 'قهرمان', 'tennis', 'champion'],
      fa: 'راجر فدرر (زاده‌ی ۱۹۸۱) تنیس‌باز سوئیسی و یکی از بزرگ‌ترین‌های تاریخ است. ۲۰ گرنداسلم برد و با سبک روان و ظریفش هواداران جهانی دارد. رقابت‌هایش با نادال و جوکوویچ دوران طلایی تنیس مردان را ساخت. در ۲۰۲۲ بازنشسته شد.',
      en: 'Roger Federer (born 1981) is a Swiss tennis player and one of the greatest in history. He won 20 Grand Slams and gained fans worldwide with his smooth, elegant style. His rivalries with Nadal and Djokovic created the golden era of men tennis. He retired in 2022.'
    },
    {
      id: 'bolt_athlete',
      keywords: ['بولت کیه', 'یوسین بولت', 'usain bolt', 'who is usain bolt'],
      weak: ['بولت', 'usain bolt'],
      weakSafe: true,
      hints: ['دو', 'دوی', 'running', 'sprint'],
      fa: 'یوسین بولت (زاده‌ی ۱۹۸۶) دونده‌ی جامائیکایی و سریع‌ترین انسان تاریخ است. رکوردهای جهانی ۱۰۰ متر (۹.۵۸ ثانیه) و ۲۰۰ متر (۱۹.۱۹ ثانیه) را دارد و در سه المپیک پیاپی (۲۰۰۸، ۲۰۱۲، ۲۰۱۶) در هر دو ماده طلا گرفت. جشن‌های معروفش (حرکت کمان و توییت‌هایش) او را محبوب جهان کرد.',
      en: 'Usain Bolt (born 1986) is a Jamaican sprinter and the fastest human in history. He holds the world records in the 100 m (9.58 s) and 200 m (19.19 s) and won gold in both events at three consecutive Olympics (2008, 2012, 2016). His signature celebrations made him a global fan favorite.'
    },
    {
      id: 'phelps_swimmer',
      keywords: [
        'فلپس کیه',
        'مایکل فلپس',
        'michael phelps',
        'who is michael phelps'
      ],
      weak: ['فلپس', 'phelps'],
      weakSafe: true,
      hints: ['شنا', 'المپیک', 'swimming', 'olympic'],
      fa: 'مایکل فلپس (زاده‌ی ۱۹۸۵) شناگر آمریکایی و پرافتخارترین ورزشکار تاریخ المپیک است: ۲۳ مدال طلا و ۲۸ مدال مجموع. در المپیک ۲۰۰۸ پکن ۸ طلا گرفت و رکورد مارک اسپیتز را شکست. قد و دست‌های بلندش برای شنا ایده‌آل بود و بعد از بازنشستگی درباره‌ی سلامت روانش هم صحبت کرد.',
      en: 'Michael Phelps (born 1985) is an American swimmer and the most decorated Olympian in history: 23 gold medals and 28 total. At the 2008 Beijing Olympics he won 8 golds, breaking Mark Spitz record. His height and long arms were ideal for swimming, and after retiring he spoke openly about mental health.'
    },
    {
      id: 'daei_footballer',
      keywords: ['علی دایی کیه', 'دایی', 'ali daei', 'who is ali daei'],
      weak: ['علی دایی', 'دایی', 'ali daei'],
      weakSafe: true,
      hints: ['فوتبال', 'ایران', 'football', 'iran'],
      fa: 'علی دایی (زاده‌ی ۱۹۶۹) فوتبالیست ایرانی و یکی از بهترین گلزنان تاریخ فوتبال است. سال‌ها با ۱۰۹ گل ملی رکورددار گل‌های ملی جهان بود (تا اینکه رونالدو از او گذشت). در تیم‌های پرسپولیس، السد، بایرن مونیخ و هرتابرلین بازی کرد و کاپیتان تیم ملی ایران بود. بعدها مربی شد و در ایران او را «شاه‌گلزن» می‌نامند.',
      en: 'Ali Daei (born 1969) is an Iranian footballer and one of the greatest goal scorers in football history. For years his 109 international goals were the world record until Ronaldo passed him. He played for Persepolis, Al-Sadd, Bayern Munich, and Hertha Berlin and captained the Iranian national team. He later coached, and in Iran he is known as "the King of Goals".'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
