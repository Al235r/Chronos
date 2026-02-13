import { HistoricalEntity } from '../types';

export const historicalData: HistoricalEntity[] = [
  // --- Lower / Middle / Upper Paleolithic ---
  {
    id: 'oldowan',
    name: { en: 'Oldowan Culture', ru: 'Олдувайская культура' },
    description: {
      en: 'The Oldowan is the earliest widespread stone tool archaeological industry in prehistory. It reflects the transition to regular tool-making and a meat-based diet.',
      ru: 'Олдувайская культура (олдован) — ранний этап нижнего палеолита. Наиболее примитивная культура обработки камня (чопперы, отщепы). Связана с Homo habilis и ранними Homo erectus. Знаменует переход к мясной диете.'
    },
    location: { en: 'East Africa', ru: 'Восточная Африка' },
    startYear: -2600000,
    endYear: -1000000,
    type: 'culture',
    events: [
      {
        year: -2600000,
        title: { en: 'Emergence (Gona)', ru: 'Появление (Гона)' },
        description: {
          en: 'Emergence of Oldowan industry in East Africa (Gona, Ethiopia).',
          ru: 'Появление олдувайской индустрии в Восточной Африке (Гона, Эфиопия).'
        }
      },
      {
        year: -2400000,
        title: { en: 'Olduvai Gorge', ru: 'Олдувайское ущелье' },
        description: {
          en: 'Spread in Olduvai Gorge (Tanzania).',
          ru: 'Распространение в Олдувайском ущелье (Танзания).'
        }
      },
      {
        year: -2300000,
        title: { en: 'Homo habilis', ru: 'Homo habilis' },
        description: {
          en: 'Usage by Homo habilis.',
          ru: 'Использование Homo habilis (человек умелый).'
        }
      },
      {
        year: -1900000,
        title: { en: 'Homo erectus', ru: 'Homo erectus' },
        description: {
          en: 'Usage by early Homo erectus.',
          ru: 'Использование ранним Homo erectus (человек прямоходящий).'
        }
      },
      {
        year: -1800000,
        title: { en: 'Out of Africa', ru: 'Выход из Африки' },
        description: {
          en: 'Migration out of Africa (Dmanisi, Georgia).',
          ru: 'Выход носителей индустрии за пределы Африки (Дманиси, Грузия).'
        }
      },
      {
        year: -1500000,
        title: { en: 'Acheulean Contact', ru: 'Контакт с Ашелем' },
        description: {
          en: 'Coexistence with Acheulean culture.',
          ru: 'Начало сосуществования с ашельской культурой.'
        }
      },
      {
        year: -1000000,
        title: { en: 'Disappearance', ru: 'Исчезновение' },
        description: {
          en: 'Gradual disappearance, replaced by Acheulean industry.',
          ru: 'Постепенное исчезновение, вытеснение ашельской индустрией.'
        }
      }
    ]
  },
  {
    id: 'acheulean',
    name: { en: 'Acheulean Culture', ru: 'Ашельская культура' },
    description: {
      en: 'Lower Paleolithic industry characterized by hand axes (bifaces) and cleavers. Associated with Homo erectus and Homo heidelbergensis. Marks brain volume growth and control of fire.',
      ru: 'Индустрия нижнего палеолита, сменившая олдувайскую. Характеризуется ручными рубилами (бифасами) и кливерами. Связана с Homo erectus и гейдельбергским человеком. Знаменует рост объема мозга и использование огня.'
    },
    location: { en: 'Africa/Eurasia', ru: 'Африка/Евразия' },
    startYear: -1760000,
    endYear: -150000,
    type: 'culture',
    events: [
      {
        year: -1760000,
        title: { en: 'Early Acheulean', ru: 'Ранний Ашель' },
        description: { en: 'First appearance in Kokiselei, Kenya.', ru: 'Ранние ашельские орудия (Кокиселеи, Кения).' }
      },
      {
        year: -1600000,
        title: { en: 'Expansion', ru: 'Распространение' },
        description: { en: 'Spread throughout East and South Africa.', ru: 'Распространение по Восточной и Южной Африке.' }
      },
      {
        year: -1300000,
        title: { en: 'Near East Entry', ru: 'Проникновение в Азию' },
        description: { en: 'Entry into the Near East.', ru: 'Проникновение в Переднюю Азию.' }
      },
      {
        year: -850000,
        title: { en: 'Europe Entry', ru: 'Появление в Европе' },
        description: { en: 'Appearance in Europe (Atapuerca, Spain).', ru: 'Появление в Европе (Атапуэрка, Испания).' }
      },
      {
        year: -600000,
        title: { en: 'Widespread', ru: 'Широкое распространение' },
        description: { en: 'Widespread in Africa and Eurasia.', ru: 'Широкое распространение в Африке и Евразии.' }
      },
      {
        year: -400000,
        title: { en: 'Control of Fire', ru: 'Контроль огня' },
        description: { en: 'Solid evidence for control of fire.', ru: 'Устойчивые свидетельства использования огня.' }
      },
      {
        year: -350000,
        title: { en: 'Transition', ru: 'Переход' },
        description: { en: 'Gradual transition to Middle Paleolithic.', ru: 'Постепенный переход к среднему палеолиту (мустьерская культура).' }
      }
    ]
  },
  {
    id: 'mousterian',
    name: { en: 'Mousterian Culture', ru: 'Мустьерская культура' },
    description: {
      en: 'Middle Paleolithic industry associated with Neanderthals. Characterized by Levallois technique, scrapers, and points. Features burials and care for the sick.',
      ru: 'Индустрия среднего палеолита, ассоциируемая с неандертальцами. Характеризуется техникой Леваллуа, скреблами, остроконечниками. Известна захоронениями (Шанидар) и заботой о больных.'
    },
    location: { en: 'Europe/West Asia', ru: 'Европа/Западная Азия' },
    startYear: -300000,
    endYear: -40000,
    type: 'culture',
    events: [
      {
        year: -300000,
        title: { en: 'Early Forms', ru: 'Ранние формы' },
        description: { en: 'Early forms in Africa and Europe.', ru: 'Ранние формы в Африке и Европе.' }
      },
      {
        year: -180000,
        title: { en: 'Classic Mousterian', ru: 'Классическое Мустье' },
        description: { en: 'Formation of classic Mousterian.', ru: 'Формирование классического мустье.' }
      },
      {
        year: -120000,
        title: { en: 'Expansion', ru: 'Распространение' },
        description: { en: 'Widespread in Europe and Near East.', ru: 'Широкое распространение в Европе и Передней Азии.' }
      },
      {
        year: -60000,
        title: { en: 'Shanidar Burial', ru: 'Погребение Шанидар' },
        description: { en: 'Famous flower burial in Zagros Mountains.', ru: 'Знаменитое «цветочное погребение» в горах Загрос (Ирак).' }
      },
      {
        year: -40000,
        title: { en: 'Disappearance', ru: 'Исчезновение' },
        description: { en: 'Disappearance in Europe, replaced by Upper Paleolithic.', ru: 'Исчезновение в Европе (смена верхним палеолитом).' }
      }
    ]
  },
  {
    id: 'aurignacian',
    name: { en: 'Aurignacian Culture', ru: 'Ориньякская культура' },
    description: {
      en: 'Early Upper Paleolithic culture associated with Cro-Magnons. Known for cave painting (Chauvet), bone flutes, and figurines.',
      ru: 'Ранний этап верхнего палеолита (кроманьонцы). Известна пещерной живописью (Шове), музыкальными инструментами (костяные флейты) и статуэтками.'
    },
    location: { en: 'Europe', ru: 'Европа' },
    startYear: -43000,
    endYear: -28000,
    type: 'culture',
    events: [
      {
        year: -41500,
        title: { en: 'Formation', ru: 'Формирование' },
        description: { en: 'Formation in Europe (Balkans, Central Europe).', ru: 'Формирование в Европе (Балканы, Центральная Европа).' }
      },
      {
        year: -40000,
        title: { en: 'Lion Man / Flutes', ru: 'Человеколев / Флейты' },
        description: { en: 'Lion Man figurine and bone flutes found.', ru: 'Статуэтка «Человеколев» и костяные флейты.' }
      },
      {
        year: -40000,
        title: { en: 'Neanderthal Extinction', ru: 'Исчезновение неандертальцев' },
        description: { en: 'Coincides with disappearance of Neanderthals.', ru: 'Совпадает по времени с исчезновением неандертальцев.' }
      },
      {
        year: -34000,
        title: { en: 'Chauvet Cave', ru: 'Пещера Шове' },
        description: { en: 'Cave paintings in Chauvet.', ru: 'Наскальная живопись в пещере Шове.' }
      }
    ]
  },
  {
    id: 'gravettian',
    name: { en: 'Gravettian Culture', ru: 'Граветтская культура' },
    description: {
      en: 'Mid Upper Paleolithic. Known for mammoth hunting, Venus figurines, mammoth bone dwellings, and elaborate burials (Sungir).',
      ru: 'Средний этап верхнего палеолита. Охотники на мамонтов. Известна «палеолитическими венерами», жилищами из костей мамонта и погребениями (Сунгирь).'
    },
    location: { en: 'Europe', ru: 'Европа' },
    startYear: -30000,
    endYear: -20000,
    type: 'culture',
    events: [
      {
        year: -32000,
        title: { en: 'Sungir Burials', ru: 'Погребения Сунгирь' },
        description: { en: 'Complex burials in Sungir (Russia).', ru: 'Сложные погребения Сунгирь (Россия).' }
      },
      {
        year: -25000,
        title: { en: 'Venus of Willendorf', ru: 'Венера Виллендорфская' },
        description: { en: 'Creation of the Venus of Willendorf.', ru: 'Создание Венеры Виллендорфской.' }
      },
      {
        year: -23000,
        title: { en: 'Peak Spread', ru: 'Расцвет' },
        description: { en: 'Peak spread from France to Russia.', ru: 'Широкое распространение от Франции до Восточной Европы.' }
      },
      {
        year: -14500,
        title: { en: 'Mezhirich Dwellings', ru: 'Жилища Межирич' },
        description: { en: 'Mammoth bone dwellings in Mezhirich (Ukraine).', ru: 'Жилища из костей мамонта (Межирич, Украина).' }
      }
    ]
  },
  {
    id: 'solutrean',
    name: { en: 'Solutrean Culture', ru: 'Солютрейская культура' },
    description: {
      en: 'Late Upper Paleolithic in Western Europe during the Last Glacial Maximum. Famous for finely crafted laurel-leaf points.',
      ru: 'Поздний верхний палеолит Западной Европы. Пик обработки камня (лавролистные наконечники). Адаптация к условиям ледникового максимума.'
    },
    location: { en: 'France/Spain', ru: 'Франция/Испания' },
    startYear: -22000,
    endYear: -17000,
    type: 'culture',
    events: [
      {
        year: -21500,
        title: { en: 'Formation', ru: 'Формирование' },
        description: { en: 'Formation in France and Iberian Peninsula.', ru: 'Формирование (Франция, Иберийский полуостров).' }
      },
      {
        year: -19500,
        title: { en: 'LGM Peak', ru: 'Ледниковый максимум' },
        description: { en: 'Peak during Last Glacial Maximum.', ru: 'Расцвет в период последнего ледникового максимума.' }
      }
    ]
  },
  {
    id: 'magdalenian',
    name: { en: 'Magdalenian Culture', ru: 'Мадленская культура' },
    description: {
      en: 'Late Upper Paleolithic. Peak of cave art (Lascaux, Altamira). Advanced bone/antler industry (harpoons, spearthrowers). Reindeer hunters.',
      ru: 'Поздний верхний палеолит. Расцвет пещерной живописи (Ласко, Альтамира). Развитая костяная индустрия (гарпуны, копьеметалки). Охотники на северного оленя.'
    },
    location: { en: 'Western Europe', ru: 'Западная Европа' },
    startYear: -17000,
    endYear: -11000,
    type: 'culture',
    events: [
      {
        year: -16000,
        title: { en: 'Lascaux', ru: 'Ласко' },
        description: { en: 'Paintings in Lascaux Cave (approx. 17-15k ya).', ru: 'Росписи пещеры Ласко (≈17–15 тыс. лет назад).' }
      },
      {
        year: -14500,
        title: { en: 'Altamira', ru: 'Альтамира' },
        description: { en: 'Paintings in Altamira Cave (approx. 15-14k ya).', ru: 'Росписи пещеры Альтамира (≈15–14 тыс. лет назад).' }
      },
      {
        year: -11500,
        title: { en: 'Transition', ru: 'Переход' },
        description: { en: 'Transition to Azilian/Final Paleolithic.', ru: 'Переход к финальному палеолиту (азиль).' }
      }
    ]
  },

  // --- Paleolithic / Neolithic / Ancient ---
  {
    id: 'natufian',
    name: { en: 'Natufian Culture', ru: 'Натуфийская культура' },
    description: { 
      en: 'Late Epipaleolithic Levant. Semi-sedentary, gathering wild cereals. First stone buildings and dog domestication.',
      ru: 'Поздний эпипалеолит Леванта. Полуседлый образ жизни, сбор диких злаков. Первые каменные постройки и одомашнивание собаки.'
    },
    location: { en: 'Levant', ru: 'Левант' },
    startYear: -15000,
    endYear: -11500,
    type: 'culture',
    events: [
      {
        year: -14000,
        title: { en: 'Early Phase', ru: 'Ранний этап' },
        description: { en: 'Start of Natufian culture (15-13k BC).', ru: 'Ранний этап (≈15–13 тыс. до н. э.).' }
      },
      {
        year: -12000,
        title: { en: 'Ain Mallaha', ru: 'Айн-Малляха' },
        description: { en: 'Settlement at Ain Mallaha.', ru: 'Поселение Айн-Малляха (Эйнан).' }
      },
      {
        year: -10900,
        title: { en: 'Younger Dryas', ru: 'Поздний дриас' },
        description: { en: 'Onset of Younger Dryas cooling.', ru: 'Начало похолодания позднего дриаса.' }
      },
      {
        year: -10000,
        title: { en: 'Early Jericho', ru: 'Ранний Иерихон' },
        description: { en: 'Early settlement at Jericho.', ru: 'Раннее поселение в Иерихоне.' }
      }
    ]
  },
  {
    id: 'ppna',
    name: { en: 'Pre-Pottery Neolithic A', ru: 'Докерамический неолит A' },
    description: {
      en: 'Early Neolithic. Round mud-brick houses, cultivation of wheat/barley. Monumental architecture at Göbekli Tepe and Jericho.',
      ru: 'Ранний неолит. Круглые дома из сырцового кирпича. Культивация пшеницы. Монументальная архитектура (Гёбекли-Тепе, Иерихон).'
    },
    location: { en: 'Fertile Crescent', ru: 'Плодородный полумесяц' },
    startYear: -9700,
    endYear: -8800,
    type: 'period',
    events: [
      {
        year: -9600,
        title: { en: 'Göbekli Tepe', ru: 'Гёбекли-Тепе' },
        description: { en: 'Construction of megalithic pillars.', ru: 'Строительство мегалитических комплексов.' }
      },
      {
        year: -9000,
        title: { en: 'Jericho Wall', ru: 'Стена Иерихона' },
        description: { en: 'Construction of wall and tower at Jericho.', ru: 'Строительство стены и башни в Иерихоне.' }
      },
      {
        year: -9000,
        title: { en: 'Agriculture', ru: 'Земледелие' },
        description: { en: 'Cultivation of emmer and barley.', ru: 'Культивация эммера и ячменя.' }
      }
    ]
  },
  {
    id: 'catalhoyuk',
    name: { en: 'Çatalhöyük', ru: 'Чатал-Хююк' },
    description: {
      en: 'A very large Neolithic and Chalcolithic proto-city settlement in southern Anatolia.',
      ru: 'Крупнейшее неолитическое и халколитическое поселение (протогород) в южной Анатолии.'
    },
    location: { en: 'Anatolia (Turkey)', ru: 'Анатолия (Турция)' },
    startYear: -7100,
    endYear: -5700,
    type: 'culture'
  },
  {
    id: 'sumer',
    name: { en: 'Sumer', ru: 'Шумер' },
    description: {
      en: 'The earliest known civilization in southern Mesopotamia (modern Iraq). Known for city-states, cuneiform writing, ziggurats, and the wheel.',
      ru: 'Древнейшая цивилизация Южной Месопотамии (Ирак). Города-государства, клинопись, зиккураты, изобретение колеса.'
    },
    location: { en: 'Mesopotamia', ru: 'Месопотамия' },
    startYear: -4500,
    endYear: -2000,
    type: 'civilization',
    events: [
      {
        year: -4500,
        title: { en: 'Ubaid Period', ru: 'Убайдский период' },
        description: { en: 'Proto-Sumerian stage (Ubaid culture).', ru: 'Протошумерский этап (культура Убайд).' }
      },
      {
        year: -4000,
        title: { en: 'Uruk Period', ru: 'Урукский период' },
        description: { en: 'Start of urbanization and state formation.', ru: 'Начало урбанизации и формирования государства.' }
      },
      {
        year: -3500,
        title: { en: 'Wheel Invented', ru: 'Изобретение колеса' },
        description: { en: 'Invention of the potter\'s wheel and later transport wheel.', ru: 'Изобретение гончарного круга и колеса для транспорта.' }
      },
      {
        year: -3300,
        title: { en: 'Cuneiform', ru: 'Клинопись' },
        description: { en: 'Invention of writing.', ru: 'Изобретение письменности.' }
      },
      {
        year: -2900,
        title: { en: 'Early Dynastic', ru: 'Раннединастический' },
        description: { en: 'Rise of city-states (Ur, Uruk, Lagash).', ru: 'Расцвет городов-государств (Ур, Урук, Лагаш).' }
      },
      {
        year: -2334,
        title: { en: 'Akkadian Conquest', ru: 'Аккадское завоевание' },
        description: { en: 'Conquest by Sargon of Akkad.', ru: 'Завоевание Саргоном Древним.' }
      },
      {
        year: -2112,
        title: { en: 'Neo-Sumerian', ru: 'Неошумерский период' },
        description: { en: 'Third Dynasty of Ur. Sumerian Renaissance.', ru: 'III династия Ура. Шумерское возрождение.' }
      },
      {
        year: -2100,
        title: { en: 'Code of Ur-Nammu', ru: 'Кодекс Ур-Намму' },
        description: { en: 'One of the oldest known law codes.', ru: 'Один из древнейших сводов законов.' }
      },
      {
        year: -2004,
        title: { en: 'Fall of Ur', ru: 'Падение Ура' },
        description: { en: 'Elamite invasion and end of Sumerian political power.', ru: 'Нашествие эламитов и конец политической самостоятельности.' }
      }
    ]
  },
  {
    id: 'ancient_egypt_old',
    name: { en: 'Old Kingdom of Egypt', ru: 'Древнее царство Египта' },
    description: {
      en: 'The period in the third millennium BC when Egypt attained its first continuous peak of civilization – the Age of the Pyramids.',
      ru: 'Период в III тысячелетии до н.э., когда Египет достиг первого пика своего развития — Эпоха пирамид.'
    },
    location: { en: 'Egypt', ru: 'Египет' },
    startYear: -2686,
    endYear: -2181,
    type: 'state'
  },
  {
    id: 'indus_valley',
    name: { en: 'Indus Valley Civilization', ru: 'Индская цивилизация' },
    description: {
      en: 'A Bronze Age civilization in the northwestern regions of South Asia, noted for its urban planning and drainage systems.',
      ru: 'Цивилизация бронзового века в северо-западных регионах Южной Азии, известная своим городским планированием.'
    },
    location: { en: 'South Asia', ru: 'Южная Азия' },
    startYear: -3300,
    endYear: -1300,
    type: 'civilization'
  },
  {
    id: 'minoan',
    name: { en: 'Minoan Civilization', ru: 'Минойская цивилизация' },
    description: {
      en: 'A Bronze Age Aegean civilization on the island of Crete and other Aegean Islands.',
      ru: 'Эгейская цивилизация бронзового века на острове Крит и других островах Эгейского моря.'
    },
    location: { en: 'Crete', ru: 'Крит' },
    startYear: -2700,
    endYear: -1100,
    type: 'civilization'
  },
  {
    id: 'shang',
    name: { en: 'Shang Dynasty', ru: 'Династия Шан' },
    description: {
      en: 'The earliest ruling dynasty of China to be established in recorded history.',
      ru: 'Первая подтверждённая письменными источниками правящая династия Китая.'
    },
    location: { en: 'China', ru: 'Китай' },
    startYear: -1600,
    endYear: -1046,
    type: 'state'
  },
   // --- Classical Antiquity ---
  {
    id: 'ancient_greece_archaic',
    name: { en: 'Archaic Greece', ru: 'Архаическая Греция' },
    description: {
      en: 'The period in Greek history succeeding the Greek Dark Ages. Rise of the polis.',
      ru: 'Период в истории Греции, последовавший за Тёмными веками. Расцвет полисов.'
    },
    location: { en: 'Greece', ru: 'Греция' },
    startYear: -800,
    endYear: -480,
    type: 'period'
  },
  {
    id: 'roman_republic',
    name: { en: 'Roman Republic', ru: 'Римская республика' },
    description: {
      en: 'The era of classical Roman civilization beginning with the overthrow of the Roman Kingdom.',
      ru: 'Эпоха древнеримской цивилизации, начавшаяся со свержения Римского царства.'
    },
    location: { en: 'Rome/Mediterranean', ru: 'Рим/Средиземноморье' },
    startYear: -509,
    endYear: -27,
    type: 'state'
  },
  {
    id: 'roman_empire',
    name: { en: 'Roman Empire', ru: 'Римская империя' },
    description: {
      en: 'The post-Republican period of ancient Rome. It possessed a large territorial holding around the Mediterranean Sea.',
      ru: 'Постреспубликанский период Древнего Рима, владевшего обширными территориями вокруг Средиземного моря.'
    },
    location: { en: 'Mediterranean/Europe', ru: 'Средиземноморье/Европа' },
    startYear: -27,
    endYear: 476,
    type: 'state'
  },
  {
    id: 'han_dynasty',
    name: { en: 'Han Dynasty', ru: 'Династия Хань' },
    description: {
      en: 'The second imperial dynasty of China, considered a golden age in Chinese history.',
      ru: 'Вторая императорская династия Китая, считающаяся золотым веком китайской истории.'
    },
    location: { en: 'China', ru: 'Китай' },
    startYear: -202,
    endYear: 220,
    type: 'state'
  },
  // --- Middle Ages ---
  {
    id: 'byzantine',
    name: { en: 'Byzantine Empire', ru: 'Византийская империя' },
    description: {
      en: 'The continuation of the Roman Empire in its eastern provinces during Late Antiquity and the Middle Ages.',
      ru: 'Продолжение Римской империи в её восточных провинциях в период поздней античности и средневековья.'
    },
    location: { en: 'Eastern Mediterranean', ru: 'Восточное Средиземноморье' },
    startYear: 330,
    endYear: 1453,
    type: 'state'
  },
  {
    id: 'viking_age',
    name: { en: 'Viking Age', ru: 'Эпоха викингов' },
    description: {
      en: 'The period during which Norsemen known as Vikings undertook large-scale raiding, colonizing, conquest and trading.',
      ru: 'Период, в течение которого норманны (викинги) совершали масштабные набеги, колонизацию и торговлю.'
    },
    location: { en: 'Scandinavia/Europe', ru: 'Скандинавия/Европа' },
    startYear: 793,
    endYear: 1066,
    type: 'period'
  },
  {
    id: 'kievan_rus',
    name: { en: 'Kievan Rus', ru: 'Киевская Русь' },
    description: {
      en: 'A loose federation of East Slavic, Baltic and Finnic peoples in Eastern and Northern Europe.',
      ru: 'Раннефеодальное государство восточных славян.'
    },
    location: { en: 'Eastern Europe', ru: 'Восточная Европа' },
    startYear: 882,
    endYear: 1240,
    type: 'state'
  },
  {
    id: 'mongol_empire',
    name: { en: 'Mongol Empire', ru: 'Монгольская империя' },
    description: {
      en: 'The largest contiguous land empire in history.',
      ru: 'Крупнейшая континентальная империя в истории.'
    },
    location: { en: 'Eurasia', ru: 'Евразия' },
    startYear: 1206,
    endYear: 1368,
    type: 'state'
  },
  // --- Modern History ---
  {
    id: 'ottoman',
    name: { en: 'Ottoman Empire', ru: 'Османская империя' },
    description: {
      en: 'An empire that controlled much of Southeast Europe, Western Asia, and Northern Africa between the 14th and early 20th centuries.',
      ru: 'Империя, контролировавшая большую часть Юго-Восточной Европы, Западной Азии и Северной Африки.'
    },
    location: { en: 'Anatolia/Balkans', ru: 'Анатолия/Балканы' },
    startYear: 1299,
    endYear: 1922,
    type: 'state'
  },
  {
    id: 'russian_empire',
    name: { en: 'Russian Empire', ru: 'Российская империя' },
    description: {
      en: 'An empire that extended across Eurasia and North America from 1721.',
      ru: 'Империя, простиравшаяся через Евразию и Северную Америку с 1721 года.'
    },
    location: { en: 'Eurasia', ru: 'Евразия' },
    startYear: 1721,
    endYear: 1917,
    type: 'state'
  },
  {
    id: 'soviet_union',
    name: { en: 'Soviet Union', ru: 'Советский Союз' },
    description: {
      en: 'A transcontinental country that spanned much of Eurasia from 1922 to 1991.',
      ru: 'Трансконтинентальное государство, занимавшее большую часть Евразии с 1922 по 1991 год.'
    },
    location: { en: 'Eurasia', ru: 'Евразия' },
    startYear: 1922,
    endYear: 1991,
    type: 'state'
  },
  {
    id: 'information_age',
    name: { en: 'Information Age', ru: 'Информационная эра' },
    description: {
      en: 'A historical period that began in the mid-20th century, characterized by the rapid shift from traditional industry to an economy based on information technology.',
      ru: 'Исторический период, начавшийся в середине XX века, характеризующийся быстрым переходом к экономике, основанной на информационных технологиях.'
    },
    location: { en: 'Global', ru: 'Глобально' },
    startYear: 1970,
    endYear: 2025,
    type: 'period'
  }
];
