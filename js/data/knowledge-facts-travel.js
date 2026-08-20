/**
 * Darya - stable travel, tourism, cultural-site, and planetary-place facts.
 * Live safety, visa, opening-hour, transport, and weather details always
 * require current official sources; this offline shelf never invents them.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'iran_travel_safety',
      keywords: [
        'travel safely in iran',
        'iran tourism laws',
        'what should tourists know in iran',
        'photography rules iran travel',
        'نکات قانونی سفر در ایران',
        'گردشگر در ایران چه چیزهایی بداند',
        'عکاسی در سفر ایران',
        'امنیت سفر در ایران'
      ],
      weak: [
        'iran travel safety',
        'iran tourism rules',
        'قانون گردشگری ایران',
        'امنیت سفر ایران'
      ],
      weakSafe: true,
      hints: ['law', 'photo', 'safe', 'قانون', 'عکس', 'امن'],
      en: 'For travel in Iran, separate timeless cultural planning from live security advice. Respect current dress and site rules, ask before photographing people, and do not photograph military, security, government, energy, transport, protest, or other sensitive facilities; they may not be clearly marked. Avoid demonstrations and restricted areas. Visas, regional security, internet access, transport, and opening hours can change quickly, so check current Iranian official information and the traveler’s own government advisory before acting. Darya is offline and cannot certify that a trip is currently safe or legal.',
      fa: 'برای سفر در ایران باید دانش فرهنگیِ پایدار را از وضعیت زنده‌ی امنیتی جدا کرد. قانون پوشش و مقررات هر مکان را رعایت کن، پیش از عکاسی از مردم اجازه بگیر و از مراکز نظامی، امنیتی، دولتی، انرژی، حمل‌ونقل، تجمع‌ها و مکان‌های حساس عکس نگیر؛ بعضی از این مکان‌ها علامت روشنی ندارند. از تجمع اعتراضی و منطقه‌ی محدود دور بمان. ویزا، امنیت منطقه، اینترنت، حمل‌ونقل و ساعت بازدید ممکن است سریع تغییر کند؛ پیش از اقدام، منبع رسمی روز ایران و توصیه‌ی دولت مربوط را بررسی کن. دریا آفلاین است و نمی‌تواند امن یا قانونی‌بودن سفر امروز را تضمین کند.'
    },
    {
      id: 'tehran_sites',
      keywords: [
        'Tehran attractions',
        'what to see in Tehran',
        'Tehran cultural sites',
        'جاهای دیدنی تهران',
        'گردشگری تهران',
        'موزه های تهران'
      ],
      weak: ['Tehran tourism', 'تهران دیدنی'],
      weakSafe: true,
      hints: ['museum', 'palace', 'bazaar', 'موزه', 'کاخ', 'بازار'],
      en: 'Tehran mixes Qajar history, modern art, mountain geography, and everyday urban life. Major cultural stops include Golestan Palace, the Grand Bazaar, the National Museum of Iran, the Treasury of National Jewels, the former US Embassy museum complex, the Museum of Contemporary Art, Saadabad and Niavaran palace complexes, and the Tajrish bazaar. Darband and the Alborz foothills show the city’s mountain edge. Check current access and photography rules before visiting any politically sensitive or government-linked location.',
      fa: 'تهران تاریخ قاجار، هنر مدرن، جغرافیای کوهستانی و زندگی شهری روزمره را کنار هم دارد. کاخ گلستان، بازار بزرگ، موزه‌ی ملی ایران، خزانه‌ی جواهرات ملی، موزه‌ی هنرهای معاصر، مجموعه‌های سعدآباد و نیاوران و بازار تجریش از مکان‌های مهم فرهنگی‌اند. دربند و دامنه‌های البرز لبه‌ی کوهستانی شهر را نشان می‌دهند. برای مکان‌های دولتی یا از نظر سیاسی حساس، پیش از بازدید وضعیت ورود و عکاسی را از منبع روز بررسی کن.'
    },
    {
      id: 'isfahan_sites',
      keywords: [
        'Isfahan attractions',
        'what to see in Isfahan',
        'what should I see in Isfahan',
        'Isfahan architecture',
        'جاهای دیدنی اصفهان',
        'گردشگری اصفهان',
        'معماری اصفهان'
      ],
      weak: ['Isfahan tourism', 'اصفهان دیدنی'],
      weakSafe: true,
      hints: ['square', 'mosque', 'bridge', 'میدان', 'مسجد', 'پل'],
      en: 'Isfahan’s core is Naqsh-e Jahan Square, framed by the Shah Mosque, Sheikh Lotfollah Mosque, Ali Qapu Palace, and the bazaar entrance. Chehel Sotoun adds Safavid palace painting, while the Jameh Mosque shows many centuries of Iranian architecture in one complex. Si-o-se-pol and Khaju Bridge are social spaces as well as engineering landmarks, although river flow varies. The Armenian quarter of New Julfa and Vank Cathedral add another layer to the city’s history.',
      fa: 'هسته‌ی تاریخی اصفهان میدان نقش جهان است که مسجد امام، مسجد شیخ لطف‌الله، کاخ عالی‌قاپو و ورودی بازار آن را قاب گرفته‌اند. چهل‌ستون نقاشی کاخی صفوی را نشان می‌دهد و مسجد جامع چندین سده معماری ایران را در یک مجموعه جمع کرده است. سی‌وسه‌پل و پل خواجو هم سازه‌ی مهندسی‌اند و هم فضای اجتماعی، هرچند جریان زاینده‌رود ثابت نیست. محله‌ی جلفای نو و کلیسای وانک لایه‌ی دیگری از تاریخ شهر را نشان می‌دهند.'
    },
    {
      id: 'shiraz_persepolis',
      keywords: [
        'Shiraz attractions',
        'what to visit around Shiraz and Persepolis',
        'Persepolis visit',
        'Pasargadae tourism',
        'جاهای دیدنی شیراز',
        'تخت جمشید گردشگری',
        'برای شیراز و تخت جمشید کجا برم',
        'پاسارگاد دیدنی'
      ],
      weak: ['Shiraz tourism', 'Persepolis', 'شیراز دیدنی', 'تخت جمشید'],
      weakSafe: true,
      hints: ['Hafez', 'Achaemenid', 'garden', 'حافظ', 'هخامنشی', 'باغ'],
      en: 'Shiraz combines poetry, gardens, religious architecture, and access to Achaemenid sites. Inside the city, Hafez’s tomb, Saadi’s tomb, Eram Garden, Vakil Bazaar and Mosque, Nasir ol-Molk Mosque, and the citadel of Karim Khan are major stops. Outside the city, Persepolis preserves ceremonial Achaemenid reliefs, Naqsh-e Rostam holds royal rock tombs, and Pasargadae includes the tomb traditionally identified as Cyrus the Great’s. Heat and site exposure make water, sun protection, and current opening times important.',
      fa: 'شیراز شعر، باغ، معماری مذهبی و دسترسی به محوطه‌های هخامنشی را کنار هم دارد. آرامگاه حافظ، سعدیه، باغ ارم، بازار و مسجد وکیل، مسجد نصیرالملک و ارگ کریم‌خان از دیدنی‌های اصلی شهرند. بیرون شهر، تخت جمشید نقش‌برجسته‌های آیینی هخامنشی را نگه داشته، نقش رستم آرامگاه‌های شاهیِ صخره‌ای دارد و پاسارگاد آرامگاهی را در خود دارد که به کوروش بزرگ نسبت داده می‌شود. گرما و فضای باز محوطه‌ها، آب، محافظت در برابر آفتاب و بررسی ساعت بازدید روز را مهم می‌کند.'
    },
    {
      id: 'yazd_sites',
      keywords: [
        'Yazd attractions',
        'what is special about tourism in Yazd',
        'Yazd windcatchers',
        'Zoroastrian sites Yazd',
        'جاهای دیدنی یزد',
        'گردشگری یزد چه چیز خاصی داره',
        'بادگیرهای یزد',
        'آتشکده یزد'
      ],
      weak: ['Yazd tourism', 'یزد دیدنی'],
      weakSafe: true,
      hints: [
        'desert',
        'windcatcher',
        'Zoroastrian',
        'کویر',
        'بادگیر',
        'زرتشتی'
      ],
      en: 'Yazd is known for earthen lanes, qanats, windcatchers, and architecture adapted to desert heat. Its historic city is UNESCO-listed. The Jameh Mosque, Amir Chakhmaq complex, Dowlat Abad Garden and its tall windcatcher, the Zoroastrian Fire Temple, and the Towers of Silence explain different parts of the city’s story. Religious places deserve quiet behavior, appropriate dress, and respect for areas where photography is limited.',
      fa: 'یزد با کوچه‌های خشتی، قنات‌ها، بادگیرها و معماری سازگار با گرمای کویر شناخته می‌شود و بافت تاریخی آن در فهرست یونسکو است. مسجد جامع، مجموعه‌ی امیرچخماق، باغ دولت‌آباد و بادگیر بلندش، آتشکده‌ی زرتشتیان و دخمه‌ها بخش‌های متفاوت تاریخ شهر را نشان می‌دهند. در مکان‌های مذهبی باید سکوت، پوشش مناسب و محدودیت احتمالی عکاسی را رعایت کرد.'
    },
    {
      id: 'kerman_lut_bam',
      keywords: [
        'Kerman attractions',
        'Bam citadel',
        'Lut Desert tourism',
        'جاهای دیدنی کرمان',
        'ارگ بم',
        'کویر لوت گردشگری'
      ],
      weak: ['Kerman tourism', 'Bam', 'Lut Desert', 'کرمان دیدنی', 'بم', 'لوت'],
      weakSafe: true,
      hints: ['desert', 'citadel', 'kaluts', 'کویر', 'ارگ', 'کلوت'],
      en: 'Kerman province connects bazaar architecture, desert landscapes, and ancient settlements. Kerman’s Ganjali Khan complex anchors the old city. The reconstructed Arg-e Bam remains one of the world’s largest adobe complexes. The Lut Desert is UNESCO-listed and famous for kaluts shaped by erosion, but extreme heat, distance, navigation, and communications make a licensed local guide and season-specific planning essential. Current regional and road conditions must be checked before departure.',
      fa: 'استان کرمان معماری بازار، چشم‌انداز کویر و سکونتگاه‌های کهن را به هم وصل می‌کند. مجموعه‌ی گنجعلی‌خان هسته‌ی تاریخی شهر کرمان است. ارگ بازسازی‌شده‌ی بم همچنان یکی از بزرگ‌ترین مجموعه‌های خشتی جهان است. کویر لوت در فهرست یونسکو قرار دارد و به کلوت‌های فرسایشی مشهور است، اما گرمای شدید، فاصله، جهت‌یابی و ارتباطات، راهنمای محلی مجاز و برنامه‌ریزی متناسب با فصل را ضروری می‌کند. وضعیت روز منطقه و جاده باید پیش از حرکت بررسی شود.'
    },
    {
      id: 'north_iran_sites',
      keywords: [
        'north Iran attractions',
        'Gilan Mazandaran travel',
        'Caspian Iran tourism',
        'جاهای دیدنی شمال ایران',
        'گردشگری گیلان و مازندران',
        'سفر دریای خزر'
      ],
      weak: [
        'north Iran travel',
        'Gilan tourism',
        'Mazandaran tourism',
        'سفر شمال',
        'گردشگری گیلان'
      ],
      weakSafe: true,
      hints: ['forest', 'Caspian', 'village', 'جنگل', 'خزر', 'روستا'],
      en: 'Northern Iran spans the Caspian coast, Hyrcanian forests, rice and tea landscapes, wetlands, mountain roads, and distinct local cultures. Masuleh, Rasht’s food culture and bazaar, Anzali Lagoon, Lahijan’s tea hills, Ramsar, the forests around Sari and Gorgan, and mountain villages are common interests. Rain, road congestion, landslide risk, swimming conditions, and fragile forest or wetland ecosystems vary, so local forecasts and responsible waste practices matter.',
      fa: 'شمال ایران ساحل خزر، جنگل‌های هیرکانی، شالیزار و باغ چای، تالاب، جاده‌های کوهستانی و فرهنگ‌های محلی گوناگون دارد. ماسوله، خوراک و بازار رشت، تالاب انزلی، تپه‌های چای لاهیجان، رامسر، جنگل‌های اطراف ساری و گرگان و روستاهای کوهستانی از مقصدهای شناخته‌شده‌اند. باران، ترافیک، خطر رانش، وضعیت شنا و آسیب‌پذیری جنگل و تالاب تغییر می‌کند؛ پیش‌بینی محلی و جمع‌کردن زباله اهمیت دارد.'
    },
    {
      id: 'west_iran_sites',
      keywords: [
        'Kermanshah Kurdistan attractions',
        'west Iran tourism',
        'Bisotun Taq Bostan',
        'جاهای دیدنی کرمانشاه و کردستان',
        'گردشگری غرب ایران',
        'بیستون و طاق بستان'
      ],
      weak: [
        'west Iran travel',
        'Kermanshah tourism',
        'Kurdistan Iran tourism',
        'سفر غرب ایران'
      ],
      weakSafe: true,
      hints: [
        'mountain',
        'Kurdish',
        'rock relief',
        'کوه',
        'کردی',
        'نقش برجسته'
      ],
      en: 'Western Iran combines Zagros landscapes, Kurdish cultures, archaeological sites, music, and food traditions. Near Kermanshah, Bisotun carries Darius I’s multilingual inscription and Taq-e Bostan preserves Sasanian rock reliefs. Palangan and other stepped villages show mountain settlement patterns, while Sanandaj has important Kurdish music and craft traditions. Border proximity, mountain weather, and road conditions require current local checks.',
      fa: 'غرب ایران چشم‌انداز زاگرس، فرهنگ‌های کردی، محوطه‌های باستانی، موسیقی و سنت‌های خوراک را کنار هم دارد. نزدیک کرمانشاه، بیستون کتیبه‌ی چندزبانه‌ی داریوش یکم را دارد و طاق‌بستان نقش‌برجسته‌های ساسانی را نگه داشته است. پالنگان و روستاهای پلکانی دیگر الگوی سکونت کوهستانی را نشان می‌دهند و سنندج در موسیقی و صنایع‌دستی کردی مهم است. نزدیکی مرز، هوای کوهستان و وضعیت جاده نیازمند بررسی روز محلی است.'
    },
    {
      id: 'khuzestan_sites',
      keywords: [
        'Khuzestan attractions',
        'what cultural sites are in Khuzestan',
        'Shushtar Chogha Zanbil',
        'Susa tourism',
        'جاهای دیدنی خوزستان',
        'جاهای فرهنگی خوزستان رو معرفی کن',
        'شوشتر و چغازنبیل',
        'گردشگری شوش'
      ],
      weak: ['Khuzestan tourism', 'Shushtar', 'Chogha Zanbil', 'خوزستان دیدنی'],
      weakSafe: true,
      hints: ['water system', 'ziggurat', 'Susa', 'سازه آبی', 'زیگورات', 'شوش'],
      en: 'Khuzestan contains some of Iran’s oldest urban and engineering heritage. Chogha Zanbil is an Elamite ziggurat, Susa preserves layers of ancient settlement, and the Shushtar Historical Hydraulic System shows large-scale water management. The region also has Arab Iranian culture, rivers, wetlands, war memory, and intense seasonal heat. Industrial, energy, border, and military-sensitive areas require special caution and no casual photography.',
      fa: 'خوزستان بخشی از کهن‌ترین میراث شهری و مهندسی ایران را دارد. چغازنبیل زیگوراتی ایلامی است، شوش لایه‌های سکونت باستانی را نگه داشته و سازه‌های آبی تاریخی شوشتر مدیریت بزرگ‌مقیاس آب را نشان می‌دهند. فرهنگ عرب ایرانی، رودها، تالاب‌ها و حافظه‌ی جنگ نیز بخشی از منطقه‌اند و گرمای فصل می‌تواند شدید باشد. در نزدیکی مراکز صنعتی، انرژی، مرزی و نظامی باید احتیاط ویژه داشت و خودسرانه عکس نگرفت.'
    },
    {
      id: 'southern_islands_sites',
      keywords: [
        'Qeshm Hormuz attractions',
        'Qeshm Hormuz and Chabahar attractions',
        'Persian Gulf island travel',
        'Chabahar tourism',
        'جاهای دیدنی قشم و هرمز',
        'جاهای دیدنی قشم هرمز و چابهار',
        'گردشگری جزایر جنوب',
        'سفر چابهار'
      ],
      weak: [
        'Qeshm tourism',
        'Hormuz tourism',
        'Chabahar tourism',
        'سفر قشم',
        'سفر هرمز',
        'چابهار دیدنی'
      ],
      weakSafe: true,
      hints: ['geology', 'mangrove', 'coast', 'زمین شناسی', 'حرا', 'ساحل'],
      en: 'Qeshm and Hormuz are known for geology, coastal culture, mangrove forests, canyons, salt formations, and colorful soils. Qeshm’s Hara forests and Stars Valley and Hormuz’s geological landscapes are environmentally sensitive. Chabahar adds Makran coast scenery and distinctive erosion forms. Heat, tides, sea conditions, protected habitats, border or naval sensitivity, and transport change by season and current conditions; use licensed local services and avoid drones or photography near sensitive facilities.',
      fa: 'قشم و هرمز با زمین‌شناسی، فرهنگ ساحلی، جنگل حرا، دره‌ها، گنبدهای نمکی و خاک‌های رنگی شناخته می‌شوند. جنگل‌های حرای قشم، دره‌ی ستارگان و چشم‌اندازهای زمین‌شناختی هرمز از نظر محیط‌زیستی حساس‌اند. چابهار نیز ساحل مکران و فرسایش‌های ویژه دارد. گرما، جزرومد، وضعیت دریا، زیستگاه حفاظت‌شده، حساسیت مرزی یا دریایی و حمل‌ونقل با فصل و وضعیت روز تغییر می‌کند؛ از خدمات محلی مجاز استفاده کن و نزدیک تأسیسات حساس پهپاد یا دوربین به کار نبر.'
    },
    {
      id: 'tabriz_sites',
      keywords: [
        'Tabriz attractions',
        'Azerbaijan Iran tourism',
        'Kandovan Blue Mosque',
        'جاهای دیدنی تبریز',
        'گردشگری آذربایجان شرقی',
        'کندوان و مسجد کبود'
      ],
      weak: ['Tabriz tourism', 'تبریز دیدنی'],
      weakSafe: true,
      hints: [
        'bazaar',
        'Blue Mosque',
        'Kandovan',
        'بازار',
        'مسجد کبود',
        'کندوان'
      ],
      en: 'Tabriz has a UNESCO-listed historic bazaar, the Blue Mosque, Azerbaijan Museum, Constitution House, and a strong tradition of carpets, food, and Azerbaijani Iranian culture. Kandovan is known for rock-cut dwellings, and the region includes mountain and lake landscapes. Winters can be severe, and border or remote-area travel requires current road and local-security checks.',
      fa: 'تبریز بازار تاریخی ثبت‌شده در یونسکو، مسجد کبود، موزه‌ی آذربایجان، خانه‌ی مشروطه و سنت مهم فرش، خوراک و فرهنگ آذربایجانی ایران را دارد. کندوان به خانه‌های صخره‌ای شناخته می‌شود و منطقه چشم‌اندازهای کوهستانی و دریاچه‌ای نیز دارد. زمستان می‌تواند سخت باشد و سفر مرزی یا دورافتاده به بررسی روز جاده و امنیت محلی نیاز دارد.'
    },
    {
      id: 'mashhad_khorasan_sites',
      keywords: [
        'Mashhad attractions',
        'Khorasan cultural sites',
        'Ferdowsi tomb Tus',
        'جاهای دیدنی مشهد',
        'گردشگری خراسان',
        'آرامگاه فردوسی توس'
      ],
      weak: ['Mashhad tourism', 'Khorasan tourism', 'مشهد دیدنی'],
      weakSafe: true,
      hints: ['shrine', 'Ferdowsi', 'Neyshabur', 'حرم', 'فردوسی', 'نیشابور'],
      en: 'Mashhad is centered on the Imam Reza shrine complex, a major pilgrimage destination where dress, security screening, photography, and access rules deserve careful respect. Nearby Tus is associated with Ferdowsi and the Shahnameh. Neyshabur connects to Omar Khayyam, Attar, turquoise, and Khorasan’s literary history. Crowds and religious calendars strongly affect transport and accommodation, so current planning matters.',
      fa: 'مشهد پیرامون مجموعه‌ی حرم امام رضا شکل گرفته، مقصدی مهم برای زیارت که در آن پوشش، بازرسی امنیتی، عکاسی و مقررات ورود باید با دقت رعایت شود. توس نزدیک مشهد با فردوسی و شاهنامه پیوند دارد. نیشابور با عمر خیام، عطار، فیروزه و تاریخ ادبی خراسان شناخته می‌شود. جمعیت و تقویم مذهبی بر حمل‌ونقل و اقامت اثر زیادی دارند و برنامه‌ریزی روز اهمیت دارد.'
    },
    {
      id: 'world_cultural_sites',
      keywords: [
        'world cultural sites itinerary',
        'famous heritage sites around the world',
        'global cultural tourism',
        'سایت های فرهنگی جهان',
        'میراث جهانی برای سفر',
        'گردشگری فرهنگی جهان'
      ],
      weak: [
        'world heritage travel',
        'global cultural sites',
        'میراث جهانی سفر'
      ],
      weakSafe: true,
      hints: ['UNESCO', 'culture', 'heritage', 'یونسکو', 'فرهنگ', 'میراث'],
      en: 'A world-cultural route can compare different kinds of heritage rather than racing through a checklist: ancient urbanism at Rome or Petra, sacred architecture at Kyoto or Angkor, imperial landscapes at Beijing, archaeological memory at Machu Picchu or Teotihuacan, Islamic architecture at Isfahan or Samarkand, and living historic cities such as Istanbul or Fez. Responsible travel learns whose heritage it is, follows conservation rules, pays local guides fairly, and does not climb, remove, touch, or stage damaging photos at fragile sites.',
      fa: 'یک مسیر فرهنگی جهانی می‌تواند به‌جای مسابقه‌ی تیک‌زدن، گونه‌های متفاوت میراث را مقایسه کند: شهرسازی باستانی در رم یا پترا، معماری مقدس در کیوتو یا آنگکور، چشم‌اندازهای امپراتوری در پکن، حافظه‌ی باستان‌شناختی در ماچوپیچو یا تئوتیئواکان، معماری اسلامی در اصفهان یا سمرقند و شهرهای تاریخی زنده مانند استانبول یا فاس. سفر مسئولانه می‌پرسد میراث متعلق به چه جامعه‌ای است، قانون حفاظت را رعایت می‌کند، دستمزد منصفانه به راهنمای محلی می‌دهد و برای عکس به محوطه‌ی شکننده آسیب نمی‌زند.'
    },
    {
      id: 'travel_planning_stable',
      keywords: [
        'how to plan a cultural trip',
        'responsible tourism checklist',
        'travel itinerary basics',
        'چطور سفر فرهنگی برنامه ریزی کنم',
        'چک لیست گردشگری مسئولانه',
        'برنامه سفر گردشگری'
      ],
      weak: [
        'cultural trip planning',
        'responsible tourism',
        'برنامه سفر فرهنگی'
      ],
      weakSafe: true,
      hints: ['itinerary', 'budget', 'respect', 'برنامه', 'بودجه', 'احترام'],
      en: 'A durable travel plan has six layers: current legal and safety checks; realistic transport time; a daily budget and emergency reserve; health, medicine, insurance, and accessibility needs; cultural and environmental respect; and copies of essential documents stored separately. Leave empty time instead of stacking attractions. Opening hours, visas, exchange rates, weather, conflict, and closures are live facts, so verify them shortly before each leg rather than trusting an offline itinerary.',
      fa: 'برنامه‌ی سفر پایدار شش لایه دارد: بررسی روز قانون و امنیت؛ زمان واقعی حمل‌ونقل؛ بودجه‌ی روزانه و ذخیره‌ی اضطراری؛ نیازهای سلامت، دارو، بیمه و دسترس‌پذیری؛ احترام فرهنگی و محیط‌زیستی؛ و نسخه‌ی جداگانه از مدارک ضروری. به‌جای چیدن پشت‌سرهم جاذبه‌ها زمان خالی بگذار. ساعت بازدید، ویزا، نرخ ارز، هوا، درگیری و تعطیلی اطلاعات زنده‌اند و باید نزدیک هر بخش سفر دوباره بررسی شوند.'
    },
    {
      id: 'moon_tourism',
      keywords: [
        'tourist sites on the moon',
        'moon tourism attractions',
        'what would tourists see on the moon',
        'جاذبه های گردشگری ماه',
        'سفر توریستی به ماه',
        'در ماه کجا دیدنی است'
      ],
      weak: ['moon tourism', 'lunar tourism', 'گردشگری ماه'],
      weakSafe: true,
      hints: ['Apollo', 'crater', 'tourist', 'آپولو', 'دهانه', 'گردشگر'],
      en: 'There is no ordinary civilian tourism on the Moon today, but a future scientific itinerary could include views of Earth above the horizon, Apollo landing regions preserved as heritage sites, Tycho and Copernicus craters, the dark basalt plains called maria, and the far side’s radio-quiet environment. These are not walk-up attractions: vacuum, radiation, abrasive dust, extreme temperatures, low gravity, life support, and heritage protection make every movement an engineering operation.',
      fa: 'امروز گردشگری عادی غیرنظامی روی ماه وجود ندارد، اما برنامه‌ای علمی در آینده می‌تواند منظره‌ی زمین بالای افق، مناطق فرود آپولو به‌عنوان میراث، دهانه‌های تیکو و کوپرنیک، دشت‌های بازالتی تیره و محیط رادیویی آرامِ سمت پنهان را دربر بگیرد. این‌ها جاذبه‌ی قابل بازدید معمولی نیستند؛ خلأ، تابش، غبار ساینده، دمای شدید، گرانش کم، پشتیبانی حیات و حفاظت میراث هر حرکت را به عملیات مهندسی تبدیل می‌کند.'
    },
    {
      id: 'mars_tourism',
      keywords: [
        'tourist sites on Mars',
        'Mars tourism attractions',
        'what to visit on Mars',
        'what could tourists visit on Mars',
        'جاذبه های گردشگری مریخ',
        'سفر توریستی به مریخ',
        'در مریخ کجا دیدنی است'
      ],
      weak: ['Mars tourism', 'گردشگری مریخ'],
      weakSafe: true,
      hints: ['Olympus Mons', 'Valles Marineris', 'مریخ', 'المپوس', 'دره'],
      en: 'No human has traveled to Mars and there is no Mars tourism. A fictional future geology route might include Olympus Mons, the solar system’s largest volcano; Valles Marineris, a canyon system thousands of kilometers long; ancient river-delta terrain in Jezero Crater; polar ice caps; and rover heritage sites. The real constraints are years-long mission planning, radiation, toxic dust, thin carbon-dioxide atmosphere, cold, delayed communication, landing risk, and complete dependence on life-support systems.',
      fa: 'هیچ انسانی به مریخ سفر نکرده و گردشگری مریخ وجود ندارد. یک مسیر خیالیِ زمین‌شناسی در آینده شاید کوه المپوس، بزرگ‌ترین آتشفشان منظومه‌ی شمسی؛ دره‌های مارینر با هزاران کیلومتر طول؛ رسوبات دلتای باستانی دهانه‌ی جزرو؛ کلاهک‌های یخی قطبی و محل مأموریت مریخ‌نوردها را شامل شود. محدودیت واقعی، سال‌ها برنامه‌ریزی، تابش، غبار سمی، جو رقیق دی‌اکسیدکربن، سرما، تأخیر ارتباط، خطر فرود و وابستگی کامل به پشتیبانی حیات است.'
    },
    {
      id: 'solar_system_tourism',
      keywords: [
        'tourism around the solar system',
        'best places to visit on other planets',
        'space tourism planets',
        'گردشگری منظومه شمسی',
        'جاهای دیدنی سیاره ها',
        'جاهای دیدنی سیاره های دیگر',
        'سفر به سیاره های دیگر'
      ],
      weak: ['planet tourism', 'solar system travel', 'گردشگری سیاره ای'],
      weakSafe: true,
      hints: ['planet', 'moon', 'space', 'سیاره', 'قمر', 'فضا'],
      en: 'Planetary tourism is currently science fiction beyond limited near-Earth commercial flights. Imagined highlights include Venus’s cloud tops rather than its crushing surface, Mars’s giant volcanoes and canyons, Jupiter’s storms viewed safely from orbit, Saturn’s rings, Titan’s methane lakes, Enceladus’s ice plumes, and Neptune’s deep-blue atmosphere. Gas giants have no solid surface to visit, and every destination brings extreme radiation, pressure, temperature, distance, or life-support constraints.',
      fa: 'گردشگری سیاره‌ای، جز پروازهای محدود نزدیک زمین، فعلاً علمی‌تخیلی است. دیدنی‌های فرضی می‌تواند بالای ابرهای زهره به‌جای سطح پرفشار آن، آتشفشان‌ها و دره‌های مریخ، تماشای امن طوفان‌های مشتری از مدار، حلقه‌های زحل، دریاچه‌های متانی تیتان، فواره‌های یخی انسلادوس و جو آبی نپتون باشد. غول‌های گازی سطح جامد برای فرود ندارند و هر مقصد با تابش، فشار، دما، فاصله یا نیاز حیاتیِ بسیار شدید همراه است.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
