/**
 * Darya - curated factual entries (famous creators and public figures).
 * Loaded before knowledge-base.js; registers a global part. Entries are
 * neutral and factual, never ranking people or judging private lives.
 */
(function (global) {
  'use strict';

  global.DaryaFactChunks = global.DaryaFactChunks || [];
  global.DaryaFactChunks.push([
    {
      id: 'influencer_definition',
      keywords: [
        'اینفلوئنسر چیه',
        'اینفلوینسر یعنی چی',
        'شغل اینفلوئنسری',
        'what is an influencer',
        'content creator vs influencer',
        'how influencers make money'
      ],
      weak: ['اینفلوئنسر', 'اینفلوینسر', 'influencer', 'creator'],
      weakSafe: true,
      hints: ['چیه', 'چیست', 'شبکه', 'درآمد', 'what', 'social', 'money'],
      fa: 'اینفلوئنسر کسی است که در شبکه‌های اجتماعی دنبال‌کننده‌ی زیادی دارد و بر سلیقه و تصمیم مخاطبش اثر می‌گذارد. درآمدش معمولاً از تبلیغات برند، اسپانسری، اشتراک، فروش محصول و سهم از پلتفرم می‌آید. این شغل نیاز به تولید مداوم محتوا و مدیریت شهرت دارد و پایداری‌اش به الگوریتم‌ها وابسته است؛ بخش زیادی از سازنده‌ها آن را شغل دوم نگه می‌دارند.',
      en: 'An influencer is someone with a large social-media following who shapes their audience’s taste and decisions. Their income usually comes from brand ads, sponsorships, subscriptions, product sales, and platform shares. The work requires constant content production and reputation management, and its stability depends on algorithms; many creators keep it as a second job.'
    },
    {
      id: 'ishowspeed',
      keywords: [
        'آی شو اسپید',
        'آی‌شو اسپید',
        'ایشواسپید',
        'ishowspeed',
        'who is ishowspeed'
      ],
      weak: ['ای شو اسپید', 'آی شو اسپید', 'ishowspeed', 'speed streamer'],
      weakSafe: true,
      hints: ['استریمر', 'کیست', 'یوتیوب', 'streamer', 'who', 'youtube'],
      fa: 'آی‌شو اسپید (نام واقعی دارن واتکینز جونیور) استریمر آمریکایی است که با واکنش‌های پرانرژی، استریم‌های فوتبال و محتوای پرشور در یوتیوب و توییچ معروف شد. استریم‌های زنده‌ی رویدادهای ورزشی و سفرهایش میلیون‌ها بیننده دارند و یکی از پرمخاطب‌ترین چهره‌های جوان پخش زنده است. محتوایش سرشار از هیجان و بداهه‌گویی است.',
      en: 'iShowSpeed (real name Darren Watkins Jr.) is an American streamer known for his high-energy reactions, football streams, and intense content on YouTube and Twitch. His live streams of sports events and travel draw millions of viewers, making him one of the most-watched young live-streaming figures. His content is full of excitement and improvisation.'
    },
    {
      id: 'mrbeast',
      keywords: [
        'مستر بیست',
        'مستر بیست کیست',
        'آقای بیست',
        'mrbeast',
        'who is mrbeast',
        'jimmy donaldson'
      ],
      weak: [
        'مستر بیست',
        'آقای بیست',
        'mrbeast',
        'mr beast',
        'jimmy donaldson'
      ],
      weakSafe: true,
      hints: ['یوتیوبر', 'کیست', 'چالش', 'youtuber', 'who', 'challenge'],
      fa: 'مستر بیست (جیمی دونالدسون) پرطرفدارترین یوتیوبر جهان است که با چالش‌های بزرگ، جایزه‌های کلان و پروژه‌های خیریه‌ای مثل ساختن چاه آب و حمایت مالی معروف شد. ویدیوهایش با بودجه‌های سنگین و ایده‌های عجیب ساخته می‌شوند و صدها میلیون بازدید می‌گیرند. الگویش را «سرگرمی با مقیاس بزرگ و بازتوزیع پول» می‌دانند.',
      en: 'MrBeast (Jimmy Donaldson) is the most-subscribed YouTuber in the world, famous for huge challenges, large cash prizes, and charity projects like building water wells and giving away money. His videos are made with heavy budgets and wild ideas, drawing hundreds of millions of views. His model is described as large-scale entertainment with money redistribution.'
    },
    {
      id: 'cristiano_ronaldo',
      keywords: [
        'کریستیانو رونالدو',
        'رونالدو کیست',
        'cristiano ronaldo',
        'who is cristiano ronaldo'
      ],
      weak: ['رونالدو', 'کریستیانو', 'ronaldo', 'cristiano ronaldo', 'cr7'],
      weakSafe: true,
      hints: ['فوتبال', 'کیست', 'پرتغال', 'football', 'who', 'portugal'],
      fa: 'کریستیانو رونالدو فوتبالیست پرتغالی است که با گلزنی بی‌وقفه، آمادگی بدنی و اخلاق حرفه‌ای به یکی از بهترین‌های تاریخ فوتبال تبدیل شد. در منچستریونایتد، رئال مادرید و یوونتوس بازی کرده و رکوردهای گلزنی ملی و باشگاهی زیادی دارد. به‌خاطر نظم تمرین و طول عمر ورزشی‌اش الگوی بسیاری از ورزشکاران است.',
      en: 'Cristiano Ronaldo is a Portuguese footballer who became one of the greatest in history through relentless goal-scoring, physical conditioning, and professionalism. He has played for Manchester United, Real Madrid, and Juventus, holding many club and national scoring records. His training discipline and sporting longevity make him a model for many athletes.',
      record: {
        fa: 'رونالدو پرگل‌ترین بازیکن تاریخ فوتباله: بیشتر از ۹۰۰ گل رسمی، رکورد گل‌های ملی (بالای ۱۳۰ گل برای پرتغال)، رکورد گل‌های لیگ قهرمانان اروپا و ۵ توپ طلا. چون هنوز بازی می‌کنه، این عددها هر هفته ممکنه بالاتر بره.',
        en: "Ronaldo is the top scorer in football history: over 900 official goals, the all-time international record (130-plus for Portugal), the Champions League scoring record and 5 Ballon d'Ors. He is still playing, so these numbers can climb every single week."
      }
    },
    {
      id: 'lionel_messi',
      keywords: [
        'لیونل مسی',
        'مسی کیست',
        'lionel messi',
        'who is lionel messi'
      ],
      weak: ['مسی', 'لیونل', 'messi', 'lionel messi', 'leo messi'],
      weakSafe: true,
      hints: ['فوتبال', 'کیست', 'آرژانتین', 'football', 'who', 'argentina'],
      fa: 'لیونل مسی فوتبالیست آرژانتینی است که با دریبل، دید بازی و گل‌سازی بی‌نظیرش از نسل خودش متمایز شد. بیشتر دورانش را در بارسلونا گذراند و بعد با آرژانتین قهرمان جام جهانی ۲۰۲۲ شد. هشت توپ طلا و رکوردهای فراوان او را در بحث «بهترین تاریخ» همیشه مطرح نگه می‌دارد.',
      en: 'Lionel Messi is an Argentine footballer distinguished by his dribbling, vision, and playmaking. He spent most of his career at Barcelona and later won the 2022 World Cup with Argentina. Eight Ballon d’Or awards and many records keep him permanently in the greatest-of-all-time conversation.',
      record: {
        fa: 'مسی رکورددار ۸ توپ طلاست، بالای ۸۰۰ گل رسمی زده، بیشترین گل و پاس گل تاریخ لالیگا رو داره و با آرژانتین جام جهانی ۲۰۲۲ و دو کوپا آمریکا رو برده. هنوز بازی می‌کنه، پس این عددها ثابت نیستن.',
        en: "Messi holds the record with 8 Ballon d'Ors, has scored over 800 official goals, owns La Liga's all-time goals and assists records, and won the 2022 World Cup plus two Copa Americas with Argentina. He is still playing, so those numbers are not final."
      },
      more: {
        fa: 'مسی در ۱۳ سالگی به‌خاطر هزینه‌ی درمان کمبود هورمون رشد به بارسلونا رفت و اونجا به بزرگ‌ترین بازیکن تاریخ باشگاه تبدیل شد؛ ۴ لیگ قهرمانان و ده‌ها جام دیگه. سال ۲۰۲۱ با گریه از بارسا خداحافظی کرد، به پاری‌سن‌ژرمن رفت و بعد با رفتن به اینتر میامی، فوتبال آمریکا رو زیر و رو کرد. جام جهانی ۲۰۲۲ قطر، با اون فینال دیوانه‌وار مقابل فرانسه، قصه‌اش رو کامل کرد.',
        en: 'Messi moved to Barcelona at 13 because the club paid for his growth-hormone treatment, then became the greatest player in its history: 4 Champions Leagues and dozens of trophies. He left Barca in tears in 2021, joined Paris Saint-Germain, and later turned American soccer upside down at Inter Miami. The 2022 World Cup in Qatar, with that insane final against France, completed the story.'
      }
    },
    {
      id: 'lebron_james',
      keywords: [
        'لبران جیمز',
        'لبران کیست',
        'lebron james',
        'who is lebron james'
      ],
      weak: ['لبران', 'لبرون', 'lebron james', 'lebron'],
      weakSafe: true,
      hints: ['بسکتبال', 'کیست', 'ان بی ای', 'basketball', 'who', 'nba'],
      fa: 'لبران جیمز بسکتبالیست آمریکایی است که با ترکیب قدرت، هوش بازی و طول عمر حرفه‌ای به یکی از بهترین‌های تاریخ NBA تبدیل شد. با چند تیم قهرمان لیگ شده و در زمین و بیرون آن (کسب‌وکار، مدرسه و فعالیت اجتماعی) اثرگذار است. دوامش در سطح بالا برای نزدیک به دو دهه بی‌سابقه است.',
      en: 'LeBron James is an American basketball player who, through a mix of power, basketball intelligence, and career longevity, became one of the greatest in NBA history. He has won championships with multiple teams and is influential on and off the court through business, a school, and social work. His near two-decade run at the top is unprecedented.'
    },
    {
      id: 'michael_jordan',
      keywords: [
        'مایکل جردن',
        'جردن کیست',
        'michael jordan',
        'who is michael jordan'
      ],
      weak: ['مایکل جردن', 'جردن', 'michael jordan', 'air jordan'],
      weakSafe: true,
      hints: ['بسکتبال', 'کیست', 'نایکی', 'basketball', 'who', 'nike'],
      fa: 'مایکل جردن بسکتبالیست آمریکایی است که در دهه‌ی ۱۹۹۰ با شیکاگو بولز شش قهرمانی NBA برد و استاندارد «ستاره‌ی جهانی ورزش» را تعریف کرد. برند Air Jordan او با نایکی ورزش را وارد فرهنگ مد کرد. بسیاری او را بزرگ‌ترین بسکتبالیست تاریخ می‌دانند.',
      en: 'Michael Jordan is the American basketball player who won six NBA championships with the Chicago Bulls in the 1990s and defined the standard of the global sports superstar. His Air Jordan brand with Nike brought sport into fashion culture. Many consider him the greatest basketball player ever.'
    },
    {
      id: 'khabib',
      keywords: [
        'حبیب نورمحمداف',
        'حبیب کیست',
        'خبیب',
        'khabib nurmagomedov',
        'who is khabib'
      ],
      weak: ['حبیب', 'خبیب', 'khabib', 'khabib nurmagomedov', 'نورمحمداف'],
      weakSafe: true,
      hints: ['ام ام ای', 'کیست', 'داغستان', 'mma', 'who', 'ufc'],
      fa: 'حبیب نورمحمداف رزمی‌کار داغستانی است که قهرمان سبک‌وزن UFC شد و بدون حتی یک شکست از ورزش حرفه‌ای کناره گرفت؛ رکوردی نادر در ام‌ام‌ای. با کشتی و گرپلینگ بی‌رقیبش حریفان را کنترل می‌کرد. بعد از بازنشستگی به مربیگری و کارهای خیریه مشغول است.',
      en: 'Khabib Nurmagomedov is a Dagestani fighter who became the UFC lightweight champion and retired undefeated, a rare feat in MMA. He controlled opponents with unmatched wrestling and grappling. After retirement he moved into coaching and charity work.',
      record: {
        fa: 'خبیب با رکورد بی‌نقص ۲۹ برد و ۰ باخت در سال ۲۰۲۰ بازنشسته شد؛ سر قولی که به مادرش داد هم موند و دیگه برنگشت، پس این عدد دیگه ثابته.',
        en: 'Khabib retired in 2020 with a perfect 29-0 record; he kept the promise he made to his mother and never came back, so that number is settled for good.',
        final: true
      },
      more: {
        fa: 'خبیب رو پدرش عبدالمناپ در کوهستان‌های داغستان تربیت کرد؛ ویدیوی کشتی‌گرفتنش با توله‌خرس در بچگی معروفه. بزرگ‌ترین شبش مبارزه با کانر مک‌گرگور در ۲۰۱۸ بود: پرفروش‌ترین رویداد تاریخ UFC که بعد از تسلیم‌کردن کانر، با پریدنش از قفس هم جنجالی شد. بعد از فوت پدرش در ۲۰۲۰، یه مبارزه‌ی دیگه رفت و همون‌جا در اوج خداحافظی کرد؛ حالا مربی قهرمان‌هاییه مثل اسلام ماخاچف.',
        en: 'Khabib was raised by his father Abdulmanap in the mountains of Dagestan; the childhood video of him wrestling a bear cub is famous. His biggest night was the 2018 Conor McGregor fight, the best-selling event in UFC history, which turned chaotic when he jumped the cage after submitting Conor. After his father died in 2020 he fought once more and retired on top; he now coaches champions like Islam Makhachev.'
      }
    },
    {
      id: 'taylor_swift',
      keywords: [
        'تیلور سویفت',
        'تیلور سوئیفت',
        'تیلور کیست',
        'taylor swift',
        'who is taylor swift'
      ],
      weak: ['تیلور', 'سویفت', 'سوئیفت', 'taylor swift'],
      weakSafe: true,
      hints: ['خواننده', 'کیست', 'موسیقی', 'singer', 'who', 'music'],
      fa: 'تیلور سوئیفت خواننده و ترانه‌سرای آمریکایی است که از موسیقی کانتری شروع کرد و به یکی از پرفروش‌ترین هنرمندان جهان تبدیل شد. تورهایش رکوردهای اقتصادی زدند و انتشار دوباره‌ی آلبوم‌هایش برای پس‌گرفتن حق نشر، بحث مالکیت هنری را جهانی کرد. طرفدارانش از بزرگ‌ترین و وفادارترین جوامع طرفداری‌اند.',
      en: 'Taylor Swift is an American singer-songwriter who began in country music and became one of the best-selling artists in the world. Her tours broke economic records, and re-recording her albums to reclaim their rights made music ownership a global conversation. Her fan base is among the largest and most loyal in music.'
    },
    {
      id: 'pewdiepie',
      keywords: [
        'پیو دی پای',
        'پیودیپای',
        'پیو دی پای کیست',
        'pewdiepie',
        'who is pewdiepie'
      ],
      weak: ['پیو دی پای', 'پیودیپای', 'pewdiepie'],
      weakSafe: true,
      hints: ['یوتیوبر', 'کیست', 'گیم', 'youtuber', 'who', 'gaming'],
      fa: 'پیو‌دی‌پای (فلیکس شلبرگ) یوتیوبر سوئدی است که با ویدیوهای گیم و کمدی اولین کانال انفرادی بود که از ۱۰۰ میلیون مشترک گذشت. سبک طنز و ارتباط صمیمی‌اش با مخاطب، نسل اول یوتیوبرها را نمایندگی می‌کند. بعدها محتوایش به نقد میم، سبک زندگی و پروژه‌های شخصی تنوع پیدا کرد.',
      en: 'PewDiePie (Felix Kjellberg) is a Swedish YouTuber whose gaming and comedy videos made him the first individual channel to pass 100 million subscribers. His humor and close bond with his audience represent the first generation of YouTubers. His content later diversified into meme reviews, lifestyle, and personal projects.'
    },
    {
      id: 'charli_damelio',
      keywords: [
        'چارلی داملیو',
        'چارلی داملو',
        'چارلی کیست',
        'charli damelio',
        'who is charli damelio'
      ],
      weak: ['چارلی', 'داملیو', 'داملو', 'charli damelio'],
      weakSafe: true,
      hints: ['تیک تاک', 'کیست', 'رقص', 'tiktok', 'who', 'dance'],
      fa: 'چارلی داملیو رقصنده‌ی آمریکایی است که با ویدیوهای رقص در تیک‌تاک به سرعت به یکی از شناخته‌شده‌ترین چهره‌های پلتفرم تبدیل شد و جزو اولین‌ها بود که از ۱۰۰ میلیون دنبال‌کننده گذشت. بعداً به برندسازی، تلویزیون و دیگر پلتفرم‌ها گسترش یافت. نمونه‌ی بارز شهرت سریع تیک‌تاکی است.',
      en: 'Charli D’Amelio is an American dancer who quickly became one of TikTok’s most recognized faces with her dance videos and was among the first to pass 100 million followers. She later expanded into branding, television, and other platforms. She is a clear example of rapid TikTok fame.'
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
