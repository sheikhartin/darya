/**
 * Darya - broad offline media catalog.
 *
 * Every category contains seven genre shelves with at least five choices.
 * The deliberately international mix includes classics, recent work, and
 * less obvious picks. Compact tuples keep the shipped database readable.
 */
(function (global) {
  'use strict';

  const GENRE_LABELS = {
    drama: ['character-rich drama', 'درام شخصیت‌محور'],
    sci_fi: ['imaginative science fiction', 'علمی-تخیلی خلاق'],
    thriller: ['tense thriller', 'تریلر پرتعلیق'],
    comedy: ['smart comedy', 'کمدی هوشمند'],
    romance: ['thoughtful romance', 'عاشقانه‌ی تأمل‌برانگیز'],
    horror: ['atmospheric horror', 'وحشت اتمسفریک'],
    animation: ['inventive animation', 'انیمیشن خلاق'],
    crime: ['layered crime story', 'داستان جنایی چندلایه'],
    mystery: ['absorbing mystery', 'معمای پرکشش'],
    historical: ['vivid historical story', 'روایت تاریخی زنده'],
    fantasy: ['richly built fantasy', 'فانتزی خوش‌ساخت'],
    rpg: ['choice-rich role-playing', 'نقش‌آفرینی پرانتخاب'],
    strategy: ['rewarding strategy', 'استراتژی عمیق'],
    puzzle: ['clever puzzle design', 'معماهای هوشمندانه'],
    adventure: ['memorable adventure', 'ماجراجویی به‌یادماندنی'],
    simulation: ['absorbing simulation', 'شبیه‌سازی درگیرکننده'],
    platformer: ['precise platforming', 'سکوبازی دقیق'],
    action: ['dynamic action', 'اکشن پویا'],
    slice_of_life: ['gentle everyday storytelling', 'روایت لطیف روزمره'],
    sports: ['compelling sports story', 'روایت ورزشی جذاب'],
    rock: ['distinctive rock', 'راک متمایز'],
    jazz: ['expressive jazz', 'جاز پراحساس'],
    classical: ['timeless classical music', 'موسیقی کلاسیک ماندگار'],
    electronic: ['adventurous electronic sound', 'صدای الکترونیک جسورانه'],
    folk: ['rooted folk songwriting', 'ترانه‌سرایی فولک اصیل'],
    hip_hop: ['inventive hip-hop', 'هیپ‌هاپ خلاق'],
    ambient: ['immersive ambient music', 'موسیقی امبینت فراگیر'],
    science: ['accessible science', 'علم به زبان روشن'],
    history: ['engaging history', 'تاریخ جذاب'],
    technology: ['thoughtful technology coverage', 'نگاه سنجیده به فناوری'],
    culture: ['curious cultural reporting', 'روایت کنجکاوانه‌ی فرهنگی'],
    true_crime: ['responsible true-crime reporting', 'روایت مسئولانه‌ی جنایی'],
    business: ['practical business thinking', 'نگاه کاربردی به کسب‌وکار'],
    storytelling: ['excellent human storytelling', 'داستان‌گویی انسانی عالی'],
    literary: ['finely crafted literary fiction', 'داستان ادبی خوش‌ساخت'],
    philosophy: ['approachable philosophy', 'فلسفه‌ی قابل‌فهم'],
    memoir: ['honest personal memoir', 'خاطرات شخصی صادقانه'],
    nature: [
      'remarkable natural-world filmmaking',
      'تصویربرداری شگفت‌انگیز طبیعت'
    ],
    society: ['probing social documentary', 'مستند اجتماعی کاوشگر'],
    art: ['insightful art documentary', 'مستند هنری روشنگر'],
    music: ['vivid music documentary', 'مستند موسیقی زنده']
  };

  const RAW = {
    movie: {
      drama: [
        ['A Separation', 2011],
        ['Shoplifters', 2018],
        ['The Lives of Others', 2006],
        ['Yi Yi', 2000],
        ['Aftersun', 2022]
      ],
      sci_fi: [
        ['Arrival', 2016],
        ['Coherence', 2013],
        ['Moon', 2009],
        ['Solaris', 1972],
        ['Aniara', 2018]
      ],
      thriller: [
        ['The Guilty', 2018],
        ['Decision to Leave', 2022],
        ['The Invisible Guest', 2016],
        ['Run Lola Run', 1998],
        ['Tell No One', 2006]
      ],
      comedy: [
        ['Tampopo', 1985],
        ['Wild Tales', 2014],
        ['The Death of Stalin', 2017],
        ['The Lunchbox', 2013],
        ['One Cut of the Dead', 2017]
      ],
      romance: [
        ['In the Mood for Love', 2000],
        ['Past Lives', 2023],
        ['Before Sunrise', 1995],
        ['Portrait of a Lady on Fire', 2019],
        ['The Worst Person in the World', 2021]
      ],
      horror: [
        ['The Wailing', 2016],
        ['The Babadook', 2014],
        ['His House', 2020],
        ['Let the Right One In', 2008],
        ['Under the Shadow', 2016]
      ],
      animation: [
        ['Song of the Sea', 2014],
        ['Persepolis', 2007],
        ['The Red Turtle', 2016],
        ['Ernest and Celestine', 2012],
        ['I Lost My Body', 2019]
      ]
    },
    series: {
      drama: [
        ['The Bear', 2022],
        ['Rectify', 2013],
        ['Pachinko', 2022],
        ['I May Destroy You', 2020],
        ['My Brilliant Friend', 2018]
      ],
      sci_fi: [
        ['Severance', 2022],
        ['Dark', 2017],
        ['Devs', 2020],
        ['Station Eleven', 2021],
        ['Scavengers Reign', 2023]
      ],
      crime: [
        ['Giri/Haji', 2019],
        ['Happy Valley', 2014],
        ['Gomorrah', 2014],
        ['We Own This City', 2022],
        ['Top of the Lake', 2013]
      ],
      comedy: [
        ['Detectorists', 2014],
        ['Derry Girls', 2018],
        ['Reservation Dogs', 2021],
        ['Somebody Somewhere', 2022],
        ['This Way Up', 2019]
      ],
      mystery: [
        ['The OA', 2016],
        ['Les Revenants', 2012],
        ['Sharp Objects', 2018],
        ['The Devil’s Hour', 2022],
        ['The Resort', 2022]
      ],
      historical: [
        ['Chernobyl', 2019],
        ['Wolf Hall', 2015],
        ['The Underground Railroad', 2021],
        ['Babylon Berlin', 2017],
        ['The English', 2022]
      ],
      fantasy: [
        ['Arcane', 2021],
        ['The Dark Crystal: Age of Resistance', 2019],
        ['Kingdom', 2019],
        ['Jonathan Strange & Mr Norrell', 2015],
        ['Over the Garden Wall', 2014]
      ]
    },
    game: {
      rpg: [
        ['Disco Elysium', 2019],
        ['Pentiment', 2022],
        ['Baldur’s Gate 3', 2023],
        ['Citizen Sleeper', 2022],
        ['Hades', 2020]
      ],
      strategy: [
        ['Into the Breach', 2018],
        ['Frostpunk', 2018],
        ['Dorfromantik', 2021],
        ['Invisible, Inc.', 2015],
        ['Against the Storm', 2023]
      ],
      puzzle: [
        ['Baba Is You', 2019],
        ['The Case of the Golden Idol', 2022],
        ['The Witness', 2016],
        ['Patrick’s Parabox', 2022],
        ['Return of the Obra Dinn', 2018]
      ],
      adventure: [
        ['Outer Wilds', 2019],
        ['Sable', 2021],
        ['A Short Hike', 2019],
        ['Heaven’s Vault', 2019],
        ['Chants of Sennaar', 2023]
      ],
      simulation: [
        ['Stardew Valley', 2016],
        ['RimWorld', 2018],
        ['Dwarf Fortress', 2022],
        ['Unpacking', 2021],
        ['Hardspace: Shipbreaker', 2022]
      ],
      horror: [
        ['SOMA', 2015],
        ['Signalis', 2022],
        ['Darkwood', 2017],
        ['Detention', 2017],
        ['Amnesia: The Bunker', 2023]
      ],
      platformer: [
        ['Celeste', 2018],
        ['Hollow Knight', 2017],
        ['Pizza Tower', 2023],
        ['Gris', 2018],
        ['The Messenger', 2018]
      ]
    },
    anime: {
      action: [
        ['Mob Psycho 100', 2016],
        ['Moribito: Guardian of the Spirit', 2007],
        ['Samurai Champloo', 2004],
        ['Dorohedoro', 2020],
        ['Vivy: Fluorite Eye’s Song', 2021]
      ],
      slice_of_life: [
        ['Barakamon', 2014],
        ['Keep Your Hands Off Eizouken!', 2020],
        ['March Comes in Like a Lion', 2016],
        ['Natsume’s Book of Friends', 2008],
        ['Skip and Loafer', 2023]
      ],
      sci_fi: [
        ['Planetes', 2003],
        ['Serial Experiments Lain', 1998],
        ['Psycho-Pass', 2012],
        ['Kaiba', 2008],
        ['Astra Lost in Space', 2019]
      ],
      fantasy: [
        ['Frieren: Beyond Journey’s End', 2023],
        ['Land of the Lustrous', 2017],
        ['The Twelve Kingdoms', 2002],
        ['Ranking of Kings', 2021],
        ['Princess Tutu', 2002]
      ],
      romance: [
        ['Insomniacs After School', 2023],
        ['Nana', 2006],
        ['Bloom Into You', 2018],
        ['Tsuki ga Kirei', 2017],
        ['My Love Story!!', 2015]
      ],
      mystery: [
        ['Odd Taxi', 2021],
        ['Monster', 2004],
        ['Erased', 2016],
        ['Pluto', 2023],
        ['From the New World', 2012]
      ],
      sports: [
        ['Ping Pong the Animation', 2014],
        ['Run with the Wind', 2018],
        ['Chihayafuru', 2011],
        ['Haikyu!!', 2014],
        ['Megalo Box', 2018]
      ]
    },
    music: {
      rock: [
        ['Talk Talk - Spirit of Eden', 1988],
        ['Big Thief - Dragon New Warm Mountain I Believe in You', 2022],
        ['Television - Marquee Moon', 1977],
        ['Warpaint - The Fool', 2010],
        ['Mdou Moctar - Afrique Victime', 2021]
      ],
      jazz: [
        ['Alice Coltrane - Journey in Satchidananda', 1971],
        ['Yussef Kamaal - Black Focus', 2016],
        ['Charles Mingus - The Black Saint and the Sinner Lady', 1963],
        ['Nala Sinephro - Space 1.8', 2021],
        ['GoGo Penguin - Version 2.0', 2014]
      ],
      classical: [
        ['Max Richter - The Blue Notebooks', 2004],
        ['Caroline Shaw - Orange', 2019],
        ['Claude Debussy - La mer', 1905],
        ['Arvo Pärt - Tabula Rasa', 1984],
        ['Ryuichi Sakamoto - async', 2017]
      ],
      electronic: [
        ['Jon Hopkins - Immunity', 2013],
        ['Floating Points - Crush', 2019],
        ['Kelly Lee Owens - Inner Song', 2020],
        ['Four Tet - There Is Love in You', 2010],
        ['Bicep - Isles', 2017]
      ],
      folk: [
        ['Arooj Aftab - Vulture Prince', 2021],
        ['Nick Drake - Pink Moon', 1972],
        ['Lankum - False Lankum', 2023],
        ['Laura Marling - Song for Our Daughter', 2020],
        ['Ali Farka Touré - Savane', 2006]
      ],
      hip_hop: [
        ['Little Simz - Sometimes I Might Be Introvert', 2021],
        ['Madvillain - Madvillainy', 2004],
        ['Noname - Room 25', 2018],
        ['A Tribe Called Quest - We got it from Here...', 2016],
        ['J Dilla - Donuts', 2006]
      ],
      ambient: [
        ['Hiroshi Yoshimura - Green', 1986],
        ['Bing & Ruth - No Home of the Mind', 2017],
        ['Kaitlyn Aurelia Smith - Ears', 2016],
        ['Brian Eno - Apollo', 1983],
        ['Visible Cloaks - Reassemblage', 2017]
      ]
    },
    podcast: {
      science: [
        ['Ologies', null],
        ['The Skeptics’ Guide to the Universe', null],
        ['BBC Inside Science', null],
        ['The Infinite Monkey Cage', null],
        ['Unexplainable', null]
      ],
      history: [
        ['Fall of Civilizations', null],
        ['The Rest Is History', null],
        ['Throughline', null],
        ['You’re Dead to Me', null],
        ['Tides of History', null]
      ],
      technology: [
        ['Hard Fork', null],
        ['Darknet Diaries', null],
        ['Decoder', null],
        ['Command Line Heroes', null],
        ['Tech Won’t Save Us', null]
      ],
      culture: [
        ['Articles of Interest', null],
        ['The Allusionist', null],
        ['Twenty Thousand Hertz', null],
        ['Decoder Ring', null],
        ['Rough Translation', null]
      ],
      true_crime: [
        ['Criminal', null],
        ['In the Dark', null],
        ['Bear Brook', null],
        ['Your Own Backyard', null],
        ['Someone Knows Something', null]
      ],
      business: [
        ['Acquired', null],
        ['How I Built This', null],
        ['The Knowledge Project', null],
        ['Masters of Scale', null],
        ['Odd Lots', null]
      ],
      storytelling: [
        ['The Moth', null],
        ['Heavyweight', null],
        ['This American Life', null],
        ['Snap Judgment', null],
        ['StoryCorps', null]
      ]
    },
    book: {
      literary: [
        ['Stoner', 1965],
        ['The Door', 1987],
        ['A Fine Balance', 1995],
        ['Convenience Store Woman', 2016],
        ['The Remains of the Day', 1989]
      ],
      sci_fi: [
        ['The Dispossessed', 1974],
        ['Children of Time', 2015],
        ['Roadside Picnic', 1972],
        ['Ancillary Justice', 2013],
        ['The Employees', 2018]
      ],
      fantasy: [
        ['Piranesi', 2020],
        ['The Fifth Season', 2015],
        ['The Spear Cuts Through Water', 2022],
        ['Jonathan Strange & Mr Norrell', 2004],
        ['A Wizard of Earthsea', 1968]
      ],
      mystery: [
        ['The Devotion of Suspect X', 2005],
        ['Drive Your Plow Over the Bones of the Dead', 2009],
        ['The Thursday Murder Club', 2020],
        ['The Name of the Rose', 1980],
        ['Case Histories', 2004]
      ],
      history: [
        ['The Dawn of Everything', 2021],
        ['King Leopold’s Ghost', 1998],
        ['The Warmth of Other Suns', 2010],
        ['SPQR', 2015],
        ['The Silk Roads', 2015]
      ],
      philosophy: [
        ['At the Existentialist Café', 2016],
        ['The Pig That Wants to Be Eaten', 2005],
        ['How to Be Perfect', 2022],
        ['The Book of Disquiet', 1982],
        ['Justice', 2009]
      ],
      memoir: [
        ['Educated', 2018],
        ['The Years', 2008],
        ['Crying in H Mart', 2021],
        ['When Death Takes Something from You Give It Back', 2017],
        ['Born a Crime', 2016]
      ]
    },
    documentary: {
      nature: [
        ['Honeyland', 2019],
        ['The Velvet Queen', 2021],
        ['Microcosmos', 1996],
        ['Fire of Love', 2022],
        ['The Elephant Queen', 2018]
      ],
      science: [
        ['Particle Fever', 2013],
        ['The Farthest', 2017],
        ['Human Nature', 2019],
        ['A Trip to Infinity', 2022],
        ['The Most Unknown', 2018]
      ],
      history: [
        ['The Act of Killing', 2012],
        ['They Shall Not Grow Old', 2018],
        ['Shoah', 1985],
        ['The Cave', 2019],
        ['Apollo 11', 2019]
      ],
      society: [
        ['Collective', 2019],
        ['Minding the Gap', 2018],
        ['The Mole Agent', 2020],
        ['Ascension', 2021],
        ['All That Breathes', 2022]
      ],
      art: [
        ['Faces Places', 2017],
        ['Finding Vivian Maier', 2013],
        ['Rivers and Tides', 2001],
        ['Exit Through the Gift Shop', 2010],
        ['Cutie and the Boxer', 2013]
      ],
      music: [
        ['Summer of Soul', 2021],
        ['Searching for Sugar Man', 2012],
        ['20 Feet from Stardom', 2013],
        ['Buena Vista Social Club', 1999],
        ['The Last Waltz', 1978]
      ],
      sports: [
        ['Senna', 2010],
        ['Free Solo', 2018],
        ['Hoop Dreams', 1994],
        ['The Rescue', 2021],
        ['Rising Phoenix', 2020]
      ]
    }
  };

  const categories = {};
  const genres = {};
  Object.entries(RAW).forEach(([category, shelves]) => {
    genres[category] = {};
    categories[category] = [];
    Object.entries(shelves).forEach(([genre, rows]) => {
      const label = GENRE_LABELS[genre];
      const items = rows.map(([t, y]) => ({
        t,
        y,
        genre,
        en: label[0],
        fa: label[1]
      }));
      genres[category][genre] = items;
      categories[category].push(...items);
    });
  });

  global.DaryaMediaPool = { categories, genres, genreLabels: GENRE_LABELS };
})(typeof window !== 'undefined' ? window : globalThis);
