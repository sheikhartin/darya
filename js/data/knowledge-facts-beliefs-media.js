/**
 * Darya - respectful religion knowledge and cross-media comparisons.
 * Descriptions are neutral, introductory, and explicit about diversity.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];

  const fact = (id, keywords, weak, fa, en, hints = []) => ({
    id,
    keywords,
    weak,
    weakSafe: true,
    hints,
    fa,
    en
  });

  global.DaryaFactChunks.push([
    fact(
      'islam_overview',
      [
        'explain islam respectfully',
        'what do muslims believe',
        'اسلام را بی طرفانه توضیح بده',
        'مسلمانان به چه باور دارند'
      ],
      ['islam', 'muslim', 'اسلام', 'مسلمان'],
      'اسلام دینی یکتاپرست و ابراهیمی است. مسلمانان قرآن را وحی الهی و محمد را آخرین پیامبر می‌دانند. پنج عمل مشهور، شهادتین، نماز، زکات، روزه‌ی رمضان و حج برای فرد توانمند است. اخلاق، عدالت، رحمت و مسئولیت اجتماعی مهم‌اند. مسلمانان در تفسیر، فقه، فرهنگ و میزان عمل‌کردن بسیار متنوع‌اند؛ هیچ توضیح کوتاهی نماینده‌ی همه‌ی آنان نیست.',
      'Islam is an Abrahamic monotheistic religion. Muslims regard the Quran as revelation and Muhammad as the final prophet. The commonly named Five Pillars are profession of faith, prayer, almsgiving, Ramadan fasting, and pilgrimage for those able. Ethics, justice, mercy, and social responsibility matter deeply. Muslims are diverse in interpretation, law, culture, and practice; no short account represents everyone.'
    ),
    fact(
      'christianity_overview',
      [
        'explain christianity respectfully',
        'what do christians believe',
        'مسیحیت را بی طرفانه توضیح بده',
        'مسیحیان به چه باور دارند'
      ],
      ['christianity', 'christian', 'مسیحیت', 'مسیحی'],
      'مسیحیت دینی ابراهیمی است که بر زندگی، مرگ و رستاخیز عیسی مسیح تمرکز دارد. بیشتر مسیحیان به تثلیث باور دارند و کتاب مقدس شامل عهد عتیق و جدید است. عبادت، دعا، محبت به خدا و همسایه، بخشش و خدمت مهم‌اند. کاتولیک، ارتدوکس و شاخه‌های پروتستان در اقتدار، آیین و الهیات تفاوت‌هایی دارند و درون هرکدام هم تنوع زیادی هست.',
      'Christianity is an Abrahamic religion centered on the life, death, and resurrection of Jesus Christ. Most Christians affirm the Trinity, and the Bible contains Old and New Testaments. Worship, prayer, love of God and neighbor, forgiveness, and service are central. Catholic, Orthodox, and many Protestant traditions differ over authority, sacraments, and theology, with substantial diversity inside each.'
    ),
    fact(
      'judaism_overview',
      [
        'explain judaism respectfully',
        'what do jewish people believe',
        'یهودیت را بی طرفانه توضیح بده',
        'یهودیان به چه باور دارند'
      ],
      ['judaism', 'jewish', 'یهودیت', 'یهودی'],
      'یهودیت یک دین و سنت قومی-فرهنگی کهن و ابراهیمی است. تورات در مرکز متون آن قرار دارد و تلمود و سنت تفسیری نیز مهم‌اند. عهد، عمل اخلاقی، مطالعه، عبادت و زندگی جمعی جایگاه دارند. یهودیت ارتدوکس، محافظه‌کار، اصلاح‌گرا و سنت‌های دیگر پاسخ‌های متفاوتی به شریعت و زندگی معاصر دارند؛ هویت یهودی فقط به میزان دینداری محدود نیست.',
      'Judaism is an ancient Abrahamic religion and an ethnoreligious tradition. The Torah stands at the center of its texts, alongside the Talmud and extensive interpretation. Covenant, ethical action, study, worship, and community life matter. Orthodox, Conservative, Reform, and other traditions approach Jewish law and modern life differently; Jewish identity is not reducible to level of observance.'
    ),
    fact(
      'sunni_shia',
      [
        'sunni and shia difference neutrally',
        'difference between sunni and shia',
        'فرق شیعه و سنی بی طرفانه',
        'شیعه و سنی چه تفاوتی دارند'
      ],
      ['sunni', 'shia', 'شیعه', 'سنی'],
      'شیعه و سنی دو خانواده‌ی اصلی در اسلام‌اند. ریشه‌ی تاریخی تفاوت به مسئله‌ی رهبری جامعه پس از پیامبر بازمی‌گردد: اهل سنت بر خلافت و سنت جمعی، و شیعه بر امامت و جایگاه علی و امامان تأکید دارد. تفاوت‌هایی در منابع فقه، آیین و تاریخ هست، اما هر دو به خدای یگانه، قرآن، پیامبری محمد، نماز، روزه و اخلاق اسلامی باور دارند. هر دو درون خود متنوع‌اند و نباید با کلیشه توضیح داده شوند.',
      'Sunni and Shia are the two largest families within Islam. Their historical division began around leadership after Muhammad: Sunni traditions emphasize the caliphate and communal tradition, while Shia traditions emphasize the Imamate and the authority of Ali and the Imams. They differ in some legal sources, rituals, and historical memory, while sharing belief in one God, the Quran, Muhammad, prayer, fasting, and Islamic ethics. Both are internally diverse.'
    ),
    fact(
      'zoroastrianism',
      [
        'what is zoroastrianism',
        'explain zoroastrianism',
        'زرتشتی گری چیست',
        'دین زرتشتی را توضیح بده'
      ],
      ['zoroastrianism', 'zoroastrian', 'زرتشتی', 'مزدا'],
      'زرتشتی‌گری سنت دینی باستانی ایرانی مرتبط با آموزه‌های زرتشت و پرستش اهورامزداست. اوستا متن مقدس اصلی آن است. راستی، انتخاب اخلاقی و نبرد میان سازندگی و ویرانگری مهم‌اند و عبارت «پندار نیک، گفتار نیک، کردار نیک» خلاصه‌ای مشهور است. آتش نماد پاکی و روشنایی است، نه موضوع پرستش. جوامع زرتشتی ایران و پارسیان هند سنت‌های زنده و متنوع دارند.',
      'Zoroastrianism is an ancient Iranian religious tradition associated with Zarathustra and devotion to Ahura Mazda. The Avesta is its principal scripture. Truth, moral choice, and the struggle between constructive and destructive forces are central; “good thoughts, good words, good deeds” is a famous summary. Fire represents purity and light rather than being worshipped. Iranian Zoroastrian and Indian Parsi communities maintain living, diverse traditions.'
    ),
    fact(
      'sikhism',
      [
        'what is sikhism',
        'explain sikh beliefs',
        'دین سیک چیست',
        'باورهای سیک را توضیح بده'
      ],
      ['sikhism', 'sikh', 'سیک'],
      'آیین سیک در سده‌ی پانزدهم در پنجاب با گورو نانک آغاز شد. سیک‌ها به خدای یگانه، برابری انسان‌ها، خدمت، کار صادقانه و یاد خدا تأکید دارند. گورو گرانت صاحب متن و مرجع روحانی مرکزی است. لَنگَر غذای جمعی رایگان و نماد برابری است. سیک‌های خالصه ممکن است پنج نشانه‌ی هویتی را رعایت کنند، اما شیوه‌ی زندگی همه‌ی سیک‌ها یکسان نیست.',
      'Sikhism began with Guru Nanak in fifteenth-century Punjab. Sikhs emphasize one God, human equality, service, honest work, and remembrance of God. The Guru Granth Sahib is the central scripture and living spiritual authority. Langar, the free community meal, embodies equality. Initiated Khalsa Sikhs may observe the five articles of faith, while Sikh lives and levels of observance remain diverse.'
    ),
    fact(
      'bahai_overview',
      [
        'what is the bahai faith',
        'explain bahai beliefs',
        'آیین بهایی چیست',
        'باورهای بهایی را توضیح بده'
      ],
      ['bahai', 'baha’i', 'بهایی', 'بهائی'],
      'آیین بهایی در سده‌ی نوزدهم در ایران پدید آمد. پیروانش به یگانگی خدا، وحدت نوع بشر، پیوستگی ادیان، برابری زن و مرد و اهمیت آموزش باور دارند و بهاءالله شخصیت مرکزی آن است. ساختار جامعه روحانی انتخابی است و روحانیت حرفه‌ای ندارد. این توضیح صرفاً معرفی بی‌طرفانه‌ی باورهاست و درباره‌ی وضعیت حقوقی یا امنیت فردی در هیچ کشور داوری نمی‌کند.',
      'The Baha’i Faith emerged in nineteenth-century Iran. Followers emphasize one God, the unity of humanity, the continuity of religions, equality of women and men, and education, with Baha’u’llah as its central figure. Its community administration is elected and has no professional clergy. This is a neutral description of beliefs, not a judgment about legal status or personal safety in any country.'
    ),
    fact(
      'dharmic_comparison',
      [
        'compare hinduism and buddhism respectfully',
        'hinduism vs buddhism',
        'مقایسه بی طرفانه هندوئیسم و بودیسم',
        'مقایسه بی طرفانه هندوییسم و بودیسم',
        'فرق هندوئیسم و بودیسم',
        'فرق هندوییسم و بودیسم'
      ],
      ['hinduism and buddhism', 'hinduism vs buddhism', 'هندوئیسم و بودیسم'],
      'هندوئیسم خانواده‌ای بسیار متنوع از سنت‌های هندی با مفاهیمی مانند دارما، کارما، سامسارا و موکشاست و دیدگاه‌های گوناگونی درباره‌ی خدا و خود دارد. بودیسم از آموزه‌های بودا درباره‌ی رنج، ناپایداری، نبودِ خودِ ثابت و راه رهایی آغاز می‌کند. هر دو درباره‌ی کارما و چرخه‌ی تولد دوباره سخن می‌گویند، اما آن‌ها را یکسان تفسیر نمی‌کنند. مقایسه باید شاخه‌های مشخص را در نظر بگیرد، نه دو قالب یکدست را.',
      'Hinduism is a highly diverse family of Indian traditions involving ideas such as dharma, karma, samsara, and moksha, with varied views of deity and self. Buddhism begins from the Buddha’s teachings on suffering, impermanence, no fixed self, and liberation. Both discuss karma and cycles of rebirth, but interpret them differently. A fair comparison names particular traditions rather than treating either as uniform.'
    ),
    fact(
      'abrahamic_comparison',
      [
        'compare islam christianity and judaism',
        'abrahamic religions similarities and differences',
        'مقایسه اسلام مسیحیت و یهودیت',
        'شباهت ادیان ابراهیمی'
      ],
      ['abrahamic religions', 'ادیان ابراهیمی'],
      'اسلام، مسیحیت و یهودیت سنت‌های ابراهیمی و یکتاپرست‌اند و در پیامبران، روایت‌ها و ارزش‌هایی مانند عدالت، صدقه، دعا و مسئولیت اخلاقی اشتراک دارند. درباره‌ی ماهیت و جایگاه عیسی، نبوت، وحی، شریعت و مرجعیت دینی تفاوت‌های مهمی دارند. هیچ‌کدام یکدست نیستند؛ مقایسه‌ی دقیق باید شاخه، متن، تاریخ و زندگی واقعی پیروان را جدا کند و از رتبه‌بندی برتری دور بماند.',
      'Islam, Christianity, and Judaism are Abrahamic, monotheistic traditions sharing prophets, narratives, and values such as justice, charity, prayer, and moral responsibility. They differ importantly over Jesus, prophecy, revelation, religious law, and authority. None is uniform; careful comparison distinguishes branches, texts, history, and lived practice rather than ranking superiority.'
    ),
    fact(
      'atheism_agnosticism',
      [
        'atheism vs agnosticism',
        'difference between atheist and agnostic',
        'فرق خداناباوری و ندانم گرایی',
        'آتئیست و اگنوستیک چه فرقی دارند'
      ],
      [
        'atheism',
        'agnosticism',
        'atheist',
        'agnostic',
        'خداناباوری',
        'ندانم گرایی'
      ],
      'خداناباوری معمولاً یعنی فرد به وجود خدا یا خدایان باور ندارد؛ ندانم‌گرایی درباره‌ی دانش است و می‌گوید وجود یا عدم وجود خدا دانسته نشده یا شاید دانستنی نباشد. یک فرد می‌تواند هم خداناباور و هم ندانم‌گرا باشد. این برچسب‌ها به‌تنهایی اخلاق، سیاست یا شخصیت کسی را تعیین نمی‌کنند و افراد مذهبی و نامذهبی هر دو بسیار متنوع‌اند.',
      'Atheism generally means lacking belief in a god or gods; agnosticism concerns knowledge, holding that divine existence is unknown or perhaps unknowable. A person can be both agnostic and atheist. These labels alone do not determine ethics, politics, or character, and religious and nonreligious people are both highly diverse.'
    ),
    fact(
      'religion_spirituality',
      [
        'religion vs spirituality',
        'can someone be spiritual not religious',
        'can someone be spiritual but not religious',
        'فرق دین و معنویت',
        'معنوی ولی غیر مذهبی یعنی چی'
      ],
      ['religion and spirituality', 'spiritual not religious', 'دین و معنویت'],
      'دین معمولاً سنتی جمعی با باور، آیین، متن، تاریخ و نهاد است؛ معنویت واژه‌ای گسترده‌تر برای تجربه‌ی معنا، تعالی، پیوند یا تمرین درونی است. برخی هر دو را دارند، برخی معنوی ولی غیرمذهبی‌اند و برخی هیچ‌کدام را به‌کار نمی‌برند. مرز این واژه‌ها ثابت نیست و بهتر است از خود فرد بپرسیم منظورش چیست.',
      'Religion usually refers to a communal tradition of beliefs, practices, texts, history, and institutions. Spirituality is broader language for meaning, transcendence, connection, or inner practice. Some people embrace both, some are spiritual but not religious, and others use neither label. The boundary is not fixed, so asking what a person means is more accurate than assuming.'
    ),
    fact(
      'religious_texts',
      [
        'how should i compare religious texts',
        'quran bible torah comparison respectfully',
        'چطور متون دینی را مقایسه کنم',
        'مقایسه محترمانه قرآن کتاب مقدس و تورات'
      ],
      ['religious texts', 'quran bible torah', 'متون دینی'],
      'متون دینی را فقط با جداکردن یک جمله مقایسه نکن. ژانر، زبان، تاریخ تدوین، مخاطب، جایگاه متن در سنت و روش تفسیر را بررسی کن. قرآن، کتاب مقدس مسیحی و تنخ یا تورات ساختار و نقش یکسانی ندارند. ترجمه‌ها را با توضیح پژوهشی و تفسیرهای درون‌سنتی متعدد بخوان و میان توصیف باور و تأیید آن فرق بگذار.',
      'Do not compare sacred texts through isolated quotations alone. Examine genre, language, composition history, audience, the text’s role in its tradition, and methods of interpretation. The Quran, Christian Bible, and Jewish Tanakh or Torah do not have identical structures or functions. Read translations with scholarship and multiple internal commentaries, distinguishing description from endorsement.'
    ),
    fact(
      'book_film_adaptation',
      [
        'book vs movie adaptation',
        'how to compare a book and its movie',
        'how do i compare a book and its movie',
        'کتاب بهتره یا فیلم اقتباسی',
        'چطور کتاب و فیلمش را مقایسه کنم'
      ],
      ['book and movie', 'book vs movie', 'کتاب و فیلم'],
      'کتاب و فیلم را فقط با شمارش حذف‌ها نسنج. کتاب به ذهن شخصیت، زبان و زمان بیشتر دسترسی دارد؛ فیلم بازی، تصویر، موسیقی، تدوین و ریتم جمعی اضافه می‌کند. درون‌مایه، قوس شخصیت، لحن و هدف صحنه‌های تغییرکرده را مقایسه کن و بعد کیفیت مستقل هر نسخه را جدا بسنج.',
      'Do not compare a book and film only by counting omissions. A novel has more access to interior thought, language, and time; a film adds performance, image, music, editing, and communal pacing. Compare themes, character arcs, tone, and the purpose of changed scenes, then judge how well each version works on its own.'
    ),
    fact(
      'dune_comparison',
      [
        'compare dune book and movie',
        'dune novel vs denis villeneuve films',
        'مقایسه کتاب و فیلم تل ماسه',
        'رمان dune بهتره یا فیلم'
      ],
      ['dune book movie', 'تل ماسه کتاب فیلم'],
      'رمان «تل‌ماسه» فرانک هربرت سیاست، بوم‌شناسی، دین و ذهن شخصیت‌ها را با جزئیات بیشتری می‌کاود. فیلم‌های دنی ویلنوو بخش زیادی از این جهان را با تصویر، صدا و مقیاس باشکوه منتقل می‌کنند، اما ناچار گفتگوی درونی و برخی خرده‌داستان‌ها را فشرده می‌کنند. برای عمق ایده و ذهن شخصیت کتاب، و برای تجربه‌ی حسی و ریتم سینمایی فیلم‌ها قوی‌ترند.',
      'Frank Herbert’s Dune novel explores politics, ecology, religion, and interior thought in greater detail. Denis Villeneuve’s films translate much of that world through scale, image, sound, and performance, while necessarily compressing inner monologue and subplots. The book is stronger for conceptual and psychological depth; the films for sensory experience and cinematic momentum.'
    ),
    fact(
      'lotr_comparison',
      [
        'compare lord of the rings books and movies',
        'lotr book vs film',
        'مقایسه کتاب و فیلم ارباب حلقه ها',
        'ارباب حلقه ها کتاب یا فیلم'
      ],
      ['lord of the rings book movie', 'ارباب حلقه ها کتاب فیلم'],
      'کتاب‌های «ارباب حلقه‌ها» زبان، تاریخ، شعر، سفر و لحن اسطوره‌ای گسترده‌تری دارند. فیلم‌های پیتر جکسون شخصیت‌ها و زمان‌بندی را فشرده می‌کنند و بعضی نقش‌ها را تغییر می‌دهند، اما طراحی جهان، موسیقی، بازی و وضوح دراماتیک بسیار نیرومندی دارند. کتاب برای بافت و تاریخ؛ فیلم برای حرکت، تصویر و تجربه‌ی جمعی دسترس‌پذیرتر است.',
      'The Lord of the Rings books offer more language, history, poetry, travel, and mythic texture. Peter Jackson’s films compress characters and chronology and alter some roles, while delivering powerful world design, music, performances, and dramatic clarity. The books lead in texture and history; the films in momentum, audiovisual realization, and accessible shared experience.'
    ),
    fact(
      'manga_anime_comparison',
      [
        'manga vs anime which is better',
        'compare manga and anime',
        'مانگا بهتره یا انیمه',
        'مقایسه مانگا و انیمه'
      ],
      ['manga vs anime', 'مانگا و انیمه'],
      'مانگا معمولاً مستقیم‌تر به طراحی و ریتم خالق نزدیک است و می‌توانی سرعت خواندن را خودت تعیین کنی. انیمه حرکت، صدا، موسیقی، رنگ و بازی صوتی اضافه می‌کند، اما ممکن است ریتم را کش بدهد، داستان را متوقف کند یا از منبع فاصله بگیرد. کیفیت اقتباس و ترجیح تو به کنترل ریتم یا تجربه‌ی صوتی-تصویری تعیین‌کننده است.',
      'Manga is often closer to the creator’s drawing and pacing, and the reader controls speed. Anime adds movement, sound, music, color, and voice performance, but may stretch pacing, pause before the source finishes, or diverge. The adaptation’s quality and whether you value reading control or audiovisual performance matter more than a universal winner.'
    ),
    fact(
      'podcast_audiobook',
      [
        'podcast vs audiobook',
        'should i choose podcasts or audiobooks',
        'پادکست بهتره یا کتاب صوتی',
        'فرق پادکست و کتاب صوتی'
      ],
      ['podcast audiobook', 'پادکست کتاب صوتی'],
      'پادکست معمولاً اپیزودیک، گفتگومحور، روزآمد و آسان برای امتحان‌کردن است؛ کتاب صوتی یک اثر کامل با ساختار و استدلال طولانی‌تر ارائه می‌دهد. برای خبر، گفتگو و تنوع پادکست؛ برای غرق‌شدن در یک روایت یا موضوع منسجم کتاب صوتی مناسب‌تر است. مدت رفت‌وآمد و توان تمرکزت هم معیار واقعی‌اند.',
      'Podcasts are usually episodic, conversational, current, and easy to sample. Audiobooks deliver a complete work with a longer structure and sustained argument or narrative. Podcasts suit news, discussion, and variety; audiobooks suit immersion and continuity. Commute length and attention are practical deciding criteria.'
    ),
    fact(
      'documentary_drama',
      [
        'documentary vs based on true story movie',
        'compare documentary and dramatization',
        'مستند بهتره یا فیلم بر اساس واقعیت',
        'فرق مستند و درام تاریخی'
      ],
      ['documentary dramatization', 'مستند و فیلم واقعی'],
      'مستند هم انتخاب و تدوین دارد و خودِ واقعیت خام نیست، اما معمولاً ادعای شواهد و پاسخ‌گویی بیشتری دارد. درامِ مبتنی بر واقعیت برای شخصیت، فشردگی و اثر عاطفی ممکن است زمان، گفتگو یا رویدادها را ترکیب کند. برای یادگیری، منابع و ادعاها را بررسی کن؛ برای تجربه‌ی دراماتیک، تغییرات را بشناس و آن را سند تاریخی فرض نکن.',
      'A documentary is also selected and edited rather than raw reality, but usually makes a stronger claim to evidence and accountability. A based-on-true-events drama may combine chronology, dialogue, and people for character and emotional force. For learning, inspect sources and claims; for drama, understand the changes and do not treat it as a historical record.'
    )
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
