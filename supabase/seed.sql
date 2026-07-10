-- ============================================================
-- Vocabulary Trainer — seed data
-- Run this AFTER schema.sql, once, to create the 4 starting
-- collections and load the Day 35 word list.
-- Safe to skip/edit if you'd rather start empty and add everything
-- from the admin panel instead.
-- ============================================================

with new_book as (
  insert into books (title, subtitle, accent, sort_order)
  values ('Morning Practice Materials', 'Daily vocabulary revision sets', '#4361ee', 1)
  returning id
)
insert into items (book_id, title, subtitle, data, sort_order)
select id, 'Day 35', '4 parts', '[
 {
  "category": "Part 1",
  "words": [
   {
    "en": "abroad",
    "ru": "за границей"
   },
   {
    "en": "belongings",
    "ru": "личные вещи"
   },
   {
    "en": "transport",
    "ru": "перевозка"
   },
   {
    "en": "shipment",
    "ru": "груз, отправка"
   },
   {
    "en": "package",
    "ru": "посылка, упаковка"
   },
   {
    "en": "parcel",
    "ru": "посылка"
   },
   {
    "en": "electrical goods",
    "ru": "электротовары"
   },
   {
    "en": "bulky",
    "ru": "громоздкий"
   },
   {
    "en": "restricted",
    "ru": "запрещённый, ограниченный"
   },
   {
    "en": "comply",
    "ru": "соблюдать"
   },
   {
    "en": "security regulations",
    "ru": "правила безопасности"
   },
   {
    "en": "liquids",
    "ru": "жидкости"
   },
   {
    "en": "containers",
    "ru": "контейнеры"
   },
   {
    "en": "cardboard",
    "ru": "картон"
   },
   {
    "en": "plastic",
    "ru": "пластик"
   },
   {
    "en": "crack",
    "ru": "трещина"
   },
   {
    "en": "fragile",
    "ru": "хрупкий"
   },
   {
    "en": "policy",
    "ru": "политика, правила"
   },
   {
    "en": "collection",
    "ru": "сбор"
   },
   {
    "en": "destination",
    "ru": "пункт назначения"
   },
   {
    "en": "surcharge",
    "ru": "дополнительная плата"
   },
   {
    "en": "storage",
    "ru": "хранение"
   },
   {
    "en": "accommodation",
    "ru": "жильё"
   },
   {
    "en": "arrangement",
    "ru": "организация"
   },
   {
    "en": "express delivery",
    "ru": "экспресс-доставка"
   },
   {
    "en": "special delivery",
    "ru": "специальная доставка"
   },
   {
    "en": "documentation",
    "ru": "документация"
   },
   {
    "en": "photocopy",
    "ru": "ксерокопия"
   },
   {
    "en": "passport",
    "ru": "паспорт"
   },
   {
    "en": "insurance",
    "ru": "страховка"
   },
   {
    "en": "receipt",
    "ru": "квитанция, чек"
   },
   {
    "en": "debit card",
    "ru": "дебетовая карта"
   },
   {
    "en": "credit card",
    "ru": "кредитная карта"
   },
   {
    "en": "calculation",
    "ru": "расчёт"
   },
   {
    "en": "maximum weight",
    "ru": "максимальный вес"
   },
   {
    "en": "transport service",
    "ru": "транспортная услуга"
   },
   {
    "en": "empty boxes",
    "ru": "пустые коробки"
   },
   {
    "en": "free of charge",
    "ru": "бесплатно"
   },
   {
    "en": "bulky items",
    "ru": "громоздкие предметы"
   },
   {
    "en": "security reasons",
    "ru": "соображения безопасности"
   },
   {
    "en": "motorbike",
    "ru": "мотоцикл"
   },
   {
    "en": "cardboard containers",
    "ru": "картонные контейнеры"
   },
   {
    "en": "plastic containers",
    "ru": "пластиковые контейнеры"
   },
   {
    "en": "collect",
    "ru": "забирать"
   },
   {
    "en": "deliver",
    "ru": "доставлять"
   },
   {
    "en": "overseas",
    "ru": "за границу"
   },
   {
    "en": "violin",
    "ru": "скрипка"
   },
   {
    "en": "special package",
    "ru": "специальная упаковка"
   },
   {
    "en": "insurance documents",
    "ru": "страховые документы"
   },
   {
    "en": "destination country",
    "ru": "страна назначения"
   },
   {
    "en": "regulations",
    "ru": "правила"
   },
   {
    "en": "shipment cost",
    "ru": "стоимость доставки"
   },
   {
    "en": "transport company",
    "ru": "транспортная компания"
   },
   {
    "en": "cash payment",
    "ru": "оплата наличными"
   },
   {
    "en": "advance",
    "ru": "предоплата"
   },
   {
    "en": "belongings collection",
    "ru": "сбор личных вещей"
   },
   {
    "en": "package limit",
    "ru": "ограничение по размеру/весу посылки"
   },
   {
    "en": "comply with regulations",
    "ru": "соблюдать правила"
   }
  ]
 },
 {
  "category": "Part 2",
  "words": [
   {
    "en": "adventurous",
    "ru": "любящий приключения"
   },
   {
    "en": "vacation",
    "ru": "отпуск"
   },
   {
    "en": "historic villa",
    "ru": "историческая вилла"
   },
   {
    "en": "sightseeing",
    "ru": "осмотр достопримечательностей"
   },
   {
    "en": "excursion",
    "ru": "экскурсия"
   },
   {
    "en": "salami factory",
    "ru": "фабрика по производству салями"
   },
   {
    "en": "olive oil mill",
    "ru": "маслобойня"
   },
   {
    "en": "ingredients",
    "ru": "ингредиенты"
   },
   {
    "en": "local ingredients",
    "ru": "местные ингредиенты"
   },
   {
    "en": "cheese producers",
    "ru": "производители сыра"
   },
   {
    "en": "master chef",
    "ru": "шеф-повар"
   },
   {
    "en": "one-on-one lessons",
    "ru": "индивидуальные занятия"
   },
   {
    "en": "guided tour",
    "ru": "экскурсия с гидом"
   },
   {
    "en": "French Quarter",
    "ru": "Французский квартал"
   },
   {
    "en": "professional kitchen",
    "ru": "профессиональная кухня"
   },
   {
    "en": "state-of-the-art",
    "ru": "современный, передовой"
   },
   {
    "en": "talented chefs",
    "ru": "талантливые повара"
   },
   {
    "en": "budget feast",
    "ru": "недорогой праздничный ужин"
   },
   {
    "en": "preparation time",
    "ru": "время приготовления"
   },
   {
    "en": "nutritious",
    "ru": "питательный"
   },
   {
    "en": "elegant",
    "ru": "элегантный"
   },
   {
    "en": "romantic",
    "ru": "романтичный"
   },
   {
    "en": "variations",
    "ru": "варианты"
   },
   {
    "en": "theme",
    "ru": "тема"
   },
   {
    "en": "ingredient",
    "ru": "ингредиент"
   },
   {
    "en": "lemon",
    "ru": "лимон"
   },
   {
    "en": "divine",
    "ru": "великолепный"
   },
   {
    "en": "preparation table",
    "ru": "разделочный стол"
   },
   {
    "en": "perishable",
    "ru": "скоропортящийся"
   },
   {
    "en": "non-perishable",
    "ru": "нескоропортящийся"
   },
   {
    "en": "industrial-sized",
    "ru": "промышленного размера"
   },
   {
    "en": "storage room",
    "ru": "кладовая"
   },
   {
    "en": "demonstration kitchen",
    "ru": "демонстрационная кухня"
   },
   {
    "en": "tasting events",
    "ru": "дегустации"
   },
   {
    "en": "utensil",
    "ru": "кухонная утварь"
   },
   {
    "en": "utensil cabinet",
    "ru": "шкаф для кухонной утвари"
   },
   {
    "en": "cookware",
    "ru": "кухонная посуда"
   },
   {
    "en": "pots",
    "ru": "кастрюли"
   },
   {
    "en": "pans",
    "ru": "сковороды"
   },
   {
    "en": "cutlery",
    "ru": "столовые приборы"
   },
   {
    "en": "forks",
    "ru": "вилки"
   },
   {
    "en": "spoons",
    "ru": "ложки"
   },
   {
    "en": "facilities",
    "ru": "удобства, оборудование"
   },
   {
    "en": "culinary school",
    "ru": "кулинарная школа"
   },
   {
    "en": "cooking vacation",
    "ru": "кулинарный отпуск"
   },
   {
    "en": "cooking class",
    "ru": "кулинарный урок"
   },
   {
    "en": "bus excursion",
    "ru": "автобусная экскурсия"
   },
   {
    "en": "hotel kitchen",
    "ru": "кухня отеля"
   },
   {
    "en": "walking tour",
    "ru": "пешеходная экскурсия"
   },
   {
    "en": "local chef",
    "ru": "местный шеф-повар"
   },
   {
    "en": "famous cuisine",
    "ru": "известная кухня"
   },
   {
    "en": "hospitality",
    "ru": "гостеприимство"
   },
   {
    "en": "cooking facilities",
    "ru": "кухонное оборудование"
   },
   {
    "en": "preparation area",
    "ru": "зона приготовления"
   },
   {
    "en": "recipe",
    "ru": "рецепт"
   },
   {
    "en": "cuisine",
    "ru": "кухня (национальная)"
   },
   {
    "en": "flavour",
    "ru": "вкус, аромат"
   },
   {
    "en": "regional products",
    "ru": "региональные продукты"
   },
   {
    "en": "artisan cheese",
    "ru": "ремесленный сыр"
   },
   {
    "en": "relaxation",
    "ru": "отдых"
   },
   {
    "en": "surroundings",
    "ru": "окрестности"
   },
   {
    "en": "market visit",
    "ru": "посещение рынка"
   }
  ]
 },
 {
  "category": "Part 3",
  "words": [
   {
    "en": "assignment",
    "ru": "задание"
   },
   {
    "en": "seminar",
    "ru": "семинар"
   },
   {
    "en": "dissertation",
    "ru": "диссертация"
   },
   {
    "en": "innovation",
    "ru": "инновация"
   },
   {
    "en": "innovative",
    "ru": "инновационный"
   },
   {
    "en": "alternative",
    "ru": "альтернатива"
   },
   {
    "en": "concrete blocks",
    "ru": "бетонные блоки"
   },
   {
    "en": "waste",
    "ru": "отходы"
   },
   {
    "en": "waste ash",
    "ru": "зола отходов"
   },
   {
    "en": "crushed glass",
    "ru": "дроблёное стекло"
   },
   {
    "en": "bitumen",
    "ru": "битум"
   },
   {
    "en": "bind",
    "ru": "связывать"
   },
   {
    "en": "chemical reaction",
    "ru": "химическая реакция"
   },
   {
    "en": "stable",
    "ru": "устойчивый"
   },
   {
    "en": "water absorption",
    "ru": "водопоглощение"
   },
   {
    "en": "manufacture",
    "ru": "производить"
   },
   {
    "en": "manufacturing process",
    "ru": "производственный процесс"
   },
   {
    "en": "existing methods",
    "ru": "существующие методы"
   },
   {
    "en": "investment",
    "ru": "инвестиции"
   },
   {
    "en": "construction industry",
    "ru": "строительная отрасль"
   },
   {
    "en": "recycled materials",
    "ru": "переработанные материалы"
   },
   {
    "en": "recycling",
    "ru": "переработка"
   },
   {
    "en": "green materials",
    "ru": "экологичные материалы"
   },
   {
    "en": "foundation",
    "ru": "фундамент"
   },
   {
    "en": "improvements",
    "ru": "улучшения"
   },
   {
    "en": "rival",
    "ru": "конкурент"
   },
   {
    "en": "veggieblocks",
    "ru": "блоки VeggieBlocks"
   },
   {
    "en": "waste cooking oil",
    "ru": "использованное растительное масло"
   },
   {
    "en": "drawback",
    "ru": "недостаток"
   },
   {
    "en": "architects",
    "ru": "архитекторы"
   },
   {
    "en": "experiment",
    "ru": "эксперимент"
   },
   {
    "en": "commercial success",
    "ru": "коммерческий успех"
   },
   {
    "en": "tax breaks",
    "ru": "налоговые льготы"
   },
   {
    "en": "financial incentives",
    "ru": "финансовые стимулы"
   },
   {
    "en": "beige",
    "ru": "бежевый"
   },
   {
    "en": "facing",
    "ru": "облицовка"
   },
   {
    "en": "dark brown",
    "ru": "тёмно-коричневый"
   },
   {
    "en": "local factories",
    "ru": "местные заводы"
   },
   {
    "en": "further afield",
    "ru": "в более отдалённых районах"
   },
   {
    "en": "commercial production",
    "ru": "промышленное производство"
   },
   {
    "en": "sustainability",
    "ru": "устойчивое развитие"
   },
   {
    "en": "environmental impact",
    "ru": "воздействие на окружающую среду"
   },
   {
    "en": "concrete",
    "ru": "бетон"
   },
   {
    "en": "absorbent",
    "ru": "впитывающий"
   },
   {
    "en": "quality",
    "ru": "качество"
   },
   {
    "en": "responsibility",
    "ru": "ответственность"
   },
   {
    "en": "cautious",
    "ru": "осторожный"
   },
   {
    "en": "commercialisation",
    "ru": "коммерциализация"
   },
   {
    "en": "recycled waste",
    "ru": "переработанные отходы"
   },
   {
    "en": "manufacturing techniques",
    "ru": "технологии производства"
   },
   {
    "en": "construction materials",
    "ru": "строительные материалы"
   },
   {
    "en": "production costs",
    "ru": "производственные затраты"
   },
   {
    "en": "infrastructure",
    "ru": "инфраструктура"
   },
   {
    "en": "implementation",
    "ru": "внедрение"
   },
   {
    "en": "building projects",
    "ru": "строительные проекты"
   },
   {
    "en": "waste management",
    "ru": "управление отходами"
   },
   {
    "en": "eco-friendly",
    "ru": "экологичный"
   },
   {
    "en": "carbon footprint",
    "ru": "углеродный след"
   },
   {
    "en": "resource efficiency",
    "ru": "эффективность использования ресурсов"
   },
   {
    "en": "raw materials",
    "ru": "сырьё"
   },
   {
    "en": "structural performance",
    "ru": "прочность конструкции"
   },
   {
    "en": "durability",
    "ru": "долговечность"
   },
   {
    "en": "lightweight",
    "ru": "лёгкий"
   },
   {
    "en": "insulation",
    "ru": "изоляция"
   },
   {
    "en": "performance tests",
    "ru": "эксплуатационные испытания"
   },
   {
    "en": "laboratory tests",
    "ru": "лабораторные испытания"
   },
   {
    "en": "pilot project",
    "ru": "пилотный проект"
   },
   {
    "en": "building sector",
    "ru": "строительный сектор"
   }
  ]
 },
 {
  "category": "Part 4",
  "words": [
   {
    "en": "archaeological site",
    "ru": "археологический памятник"
   },
   {
    "en": "mountainous",
    "ru": "гористый"
   },
   {
    "en": "overlooking",
    "ru": "возвышающийся над"
   },
   {
    "en": "plain",
    "ru": "равнина"
   },
   {
    "en": "hunter-gatherers",
    "ru": "охотники-собиратели"
   },
   {
    "en": "trade centre",
    "ru": "торговый центр"
   },
   {
    "en": "grain",
    "ru": "зерно"
   },
   {
    "en": "olives",
    "ru": "оливки"
   },
   {
    "en": "earthquake",
    "ru": "землетрясение"
   },
   {
    "en": "abandoned",
    "ru": "заброшенный"
   },
   {
    "en": "rediscovery",
    "ru": "повторное открытие"
   },
   {
    "en": "explorer",
    "ru": "исследователь"
   },
   {
    "en": "remains",
    "ru": "руины, останки"
   },
   {
    "en": "excavation",
    "ru": "раскопки"
   },
   {
    "en": "excavate",
    "ru": "проводить раскопки"
   },
   {
    "en": "evidence",
    "ru": "доказательства"
   },
   {
    "en": "industry",
    "ru": "промышленность"
   },
   {
    "en": "inhabitants",
    "ru": "жители"
   },
   {
    "en": "theatre",
    "ru": "театр"
   },
   {
    "en": "stairway",
    "ru": "лестница"
   },
   {
    "en": "sculptures",
    "ru": "скульптуры"
   },
   {
    "en": "statue",
    "ru": "статуя"
   },
   {
    "en": "emperor",
    "ru": "император"
   },
   {
    "en": "chronology",
    "ru": "хронология"
   },
   {
    "en": "occupation",
    "ru": "заселение"
   },
   {
    "en": "stratigraphic layers",
    "ru": "стратиграфические слои"
   },
   {
    "en": "stone tools",
    "ru": "каменные орудия"
   },
   {
    "en": "artifacts",
    "ru": "артефакты"
   },
   {
    "en": "flint scrapers",
    "ru": "кремнёвые скребки"
   },
   {
    "en": "charcoal",
    "ru": "древесный уголь"
   },
   {
    "en": "hearth",
    "ru": "очаг"
   },
   {
    "en": "butchery",
    "ru": "разделка животных"
   },
   {
    "en": "engravings",
    "ru": "гравировки"
   },
   {
    "en": "geometric",
    "ru": "геометрический"
   },
   {
    "en": "bedrock",
    "ru": "коренная порода"
   },
   {
    "en": "cross-hatched",
    "ru": "перекрёстно заштрихованный"
   },
   {
    "en": "abstract expression",
    "ru": "абстрактное изображение"
   },
   {
    "en": "symbolic thought",
    "ru": "символическое мышление"
   },
   {
    "en": "anthropologists",
    "ru": "антропологи"
   },
   {
    "en": "climatic fluctuation",
    "ru": "климатические колебания"
   },
   {
    "en": "Pleistocene",
    "ru": "плейстоцен"
   },
   {
    "en": "terrestrial",
    "ru": "наземный"
   },
   {
    "en": "coastal ecosystems",
    "ru": "прибрежные экосистемы"
   },
   {
    "en": "mammal bones",
    "ru": "кости млекопитающих"
   },
   {
    "en": "marine resources",
    "ru": "морские ресурсы"
   },
   {
    "en": "mollusk shells",
    "ru": "раковины моллюсков"
   },
   {
    "en": "radiocarbon dating",
    "ru": "радиоуглеродное датирование"
   },
   {
    "en": "occupation horizons",
    "ru": "культурные горизонты"
   },
   {
    "en": "definitive timeline",
    "ru": "точная хронология"
   },
   {
    "en": "disappearance",
    "ru": "исчезновение"
   },
   {
    "en": "findings",
    "ru": "результаты исследования"
   },
   {
    "en": "excavation project",
    "ru": "проект раскопок"
   },
   {
    "en": "chronology of occupation",
    "ru": "хронология заселения"
   },
   {
    "en": "stone tool technology",
    "ru": "технология изготовления каменных орудий"
   },
   {
    "en": "ancient hearths",
    "ru": "древние очаги"
   },
   {
    "en": "soil layers",
    "ru": "слои почвы"
   },
   {
    "en": "symbolic behaviour",
    "ru": "символическое поведение"
   },
   {
    "en": "sheltered environment",
    "ru": "защищённая среда"
   },
   {
    "en": "diverse diet",
    "ru": "разнообразное питание"
   },
   {
    "en": "archaeological evidence",
    "ru": "археологические доказательства"
   },
   {
    "en": "field methods",
    "ru": "полевые методы"
   },
   {
    "en": "ancient civilization",
    "ru": "древняя цивилизация"
   },
   {
    "en": "Roman baths",
    "ru": "римские бани"
   },
   {
    "en": "Doric house",
    "ru": "дорический дом"
   },
   {
    "en": "trade routes",
    "ru": "торговые пути"
   },
   {
    "en": "settlement",
    "ru": "поселение"
   },
   {
    "en": "preservation",
    "ru": "сохранение"
   },
   {
    "en": "excavation season",
    "ru": "сезон раскопок"
   },
   {
    "en": "survey",
    "ru": "обследование"
   },
   {
    "en": "mapping",
    "ru": "картографирование"
   },
   {
    "en": "reconstruction",
    "ru": "реконструкция"
   },
   {
    "en": "heritage",
    "ru": "наследие"
   },
   {
    "en": "civilization",
    "ru": "цивилизация"
   },
   {
    "en": "relics",
    "ru": "реликвии"
   },
   {
    "en": "monument",
    "ru": "памятник"
   },
   {
    "en": "settlement pattern",
    "ru": "схема расселения"
   },
   {
    "en": "ancient society",
    "ru": "древнее общество"
   },
   {
    "en": "cultural heritage",
    "ru": "культурное наследие"
   },
   {
    "en": "historical remains",
    "ru": "исторические руины"
   },
   {
    "en": "archaeological discoveries",
    "ru": "археологические открытия"
   }
  ]
 }
]'::jsonb, 1
from new_book;

insert into books (title, subtitle, accent, sort_order) values
  ('Thematic IELTS Reading', 'Vocabulary grouped by reading topic', '#22b573', 2),
  ('Thematic IELTS Listening', 'Vocabulary grouped by listening topic', '#f5a524', 3),
  ('1000 Collocations', 'High-frequency word pairs, split into tests', '#ef5b52', 4);
