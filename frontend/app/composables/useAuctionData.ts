export interface AuctionLot {
  id: number
  sport: string
  sportId: string
  category: string
  condition: string
  title: string
  size: string
  description: string
  startPrice: number
  currentBid: number
  step: number
  bidsCount: number
  seller: string
  sellerRating: number
  sellerDeals: number
  timeLeft: string
  urgent: boolean
  location: string
  img: string
  imgs: string[]
}

export const AUCTION_LOTS = ref<AuctionLot[]>([
  {
    id: 1, sport: 'Скейт', sportId: 'skate', category: 'Деки', condition: 'Новый',
    title: 'Element Landscape Asia 8.0"', size: '8.0"',
    description: 'Новая дека Element серии Landscape Asia. Конкейв medium, 7-слойный канадский клён. Ни разу не ставилась на подвески, в фабричном виде.',
    startPrice: 3000, currentBid: 4200, step: 200, bidsCount: 6,
    seller: 'Danya_SK8', sellerRating: 4.9, sellerDeals: 34,
    timeLeft: '2ч 14м', urgent: false, location: 'Санкт-Петербург, Крестовский',
    img: 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80',
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80',
    ],
  },
  {
    id: 2, sport: 'Скейт', sportId: 'skate', category: 'Деки', condition: 'Б/у',
    title: 'Baker Brand Logo 8.25"', size: '8.25"',
    description: 'Дека Baker Brand Logo, катана около 3 месяцев. Есть потёртости и мелкие сколы по графике, конкейв живой. Отдаю потому что перешёл на 8.5".',
    startPrice: 1500, currentBid: 2800, step: 100, bidsCount: 11,
    seller: 'mxm_ride', sellerRating: 4.7, sellerDeals: 12,
    timeLeft: '47м', urgent: true, location: 'Санкт-Петербург, Васильевский',
    img: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80',
      'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80',
    ],
  },
  {
    id: 3, sport: 'Скейт', sportId: 'skate', category: 'Колёса', condition: 'Новый',
    title: 'Spitfire Formula Four 52mm', size: '52mm / 99a',
    description: 'Колёса Spitfire Formula Four 99 дюрометр, 52мм. В упаковке, не ставились. Идеально для стрита и флэт-граунда.',
    startPrice: 1800, currentBid: 2400, step: 150, bidsCount: 4,
    seller: 'Pavel_Boards', sellerRating: 5.0, sellerDeals: 67,
    timeLeft: '1д 6ч', urgent: false, location: 'Санкт-Петербург, Центр',
    img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'],
  },
  {
    id: 4, sport: 'Скейт', sportId: 'skate', category: 'Полный сет', condition: 'Б/у',
    title: 'Полный комплект Santa Cruz 8.0"', size: '8.0"',
    description: 'Полный сет: дека Santa Cruz 8.0" (катана 2 мес), подвески Independent 149, колёса Bones STF 52мм, подшипники Bones Reds. Всё в хорошем состоянии.',
    startPrice: 4500, currentBid: 6100, step: 300, bidsCount: 9,
    seller: 'kira_skates', sellerRating: 4.8, sellerDeals: 21,
    timeLeft: '5ч 30м', urgent: false, location: 'Санкт-Петербург, Купчино',
    img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80'],
  },
  {
    id: 5, sport: 'Скейт', sportId: 'skate', category: 'Обувь', condition: 'Новый',
    title: 'Vans Old Skool Pro р.42', size: 'EU 42',
    description: 'Vans Old Skool Pro (не Old Skool обычные — именно Pro с усиленным носком и стелькой UltraCush). Новые, не ношены. Черно-белые.',
    startPrice: 4200, currentBid: 5300, step: 200, bidsCount: 7,
    seller: 'roma_ollie', sellerRating: 4.6, sellerDeals: 8,
    timeLeft: '3д 2ч', urgent: false, location: 'Санкт-Петербург, Невский',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
  },
  {
    id: 6, sport: 'BMX', sportId: 'bmx', category: 'Полный сет', condition: 'Б/у',
    title: 'Cult Crew 21" Complete BMX', size: '21"',
    description: 'BMX Cult Crew 21" полный комплект. Катан 1 сезон на стрите и в скейт-парке. Рама целая, без трещин. Менял только пеги (на новые). Отличный вариант для входа в тему.',
    startPrice: 14000, currentBid: 18500, step: 500, bidsCount: 8,
    seller: 'igor_bmx', sellerRating: 4.9, sellerDeals: 15,
    timeLeft: '1д 3ч', urgent: false, location: 'Санкт-Петербург, Пушкин',
    img: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80'],
  },
  {
    id: 7, sport: 'BMX', sportId: 'bmx', category: 'Аксессуары', condition: 'Новый',
    title: 'Odyssey Twisted Pro Пеги 2шт', size: '4.5"',
    description: 'Стальные пеги Odyssey Twisted Pro 4.5". Новые, в упаковке. Диаметр оси 14мм. Подходят под стандарт RHD/LHD.',
    startPrice: 800, currentBid: 1100, step: 100, bidsCount: 3,
    seller: 'bmx_spb', sellerRating: 5.0, sellerDeals: 42,
    timeLeft: '2д 8ч', urgent: false, location: 'Санкт-Петербург, Московский',
    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'],
  },
  {
    id: 8, sport: 'Ролики', sportId: 'rollers', category: 'Полный сет', condition: 'Б/у',
    title: 'Rollerblade Twister 80 р.41', size: 'EU 41',
    description: 'Ролики Rollerblade Twister 80 (агрессив). Катаны 2 сезона, лезвия целые, фрейм без трещин. Колёса 80мм 82A заменены на новые. Ботинок без люфтов.',
    startPrice: 6000, currentBid: 7800, step: 300, bidsCount: 5,
    seller: 'alina_roll', sellerRating: 4.8, sellerDeals: 9,
    timeLeft: '4ч 15м', urgent: true, location: 'Санкт-Петербург, Приморский',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
  },
  {
    id: 9, sport: 'Ролики', sportId: 'rollers', category: 'Аксессуары', condition: 'Новый',
    title: 'USD Carbon Free Фрейм р.42', size: 'EU 42',
    description: 'Фрейм USD Carbon Free для агрессивных роликов, размер EU 42. Новый, не ставился. Карбоновый нейлон, под 4×80мм или 3×90мм.',
    startPrice: 5500, currentBid: 6200, step: 200, bidsCount: 2,
    seller: 'vera_roll', sellerRating: 4.7, sellerDeals: 5,
    timeLeft: '2д 11ч', urgent: false, location: 'Санкт-Петербург, Колпино',
    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'],
  },
  {
    id: 10, sport: 'Самокат', sportId: 'scooter', category: 'Полный сет', condition: 'Б/у',
    title: 'Envy One S3 Complete Scooter', size: '110мм',
    description: 'Самокат Envy One S3 полный комплект, колёса 110мм. Катан 1 год на парке. Дека целая, рулевая подтянута. Есть царапины на деке и руле.',
    startPrice: 7000, currentBid: 9400, step: 300, bidsCount: 7,
    seller: 'scoot_vanya', sellerRating: 4.6, sellerDeals: 18,
    timeLeft: '6ч 50м', urgent: false, location: 'Санкт-Петербург, Кировский',
    img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80'],
  },
  {
    id: 11, sport: 'Самокат', sportId: 'scooter', category: 'Деки', condition: 'Новый',
    title: 'Tilt Stage 1 Дека 5.5"', size: '5.5" × 20.5"',
    description: 'Дека для самоката Tilt Stage 1, ширина 5.5", длина 20.5". Новая, только распакована. Чёрная анодировка, стандарт IHC/ICS/SCS.',
    startPrice: 3500, currentBid: 4100, step: 200, bidsCount: 4,
    seller: 'max_scoot', sellerRating: 4.9, sellerDeals: 27,
    timeLeft: '1д 9ч', urgent: false, location: 'Санкт-Петербург, Петроградский',
    img: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80'],
  },
  {
    id: 12, sport: 'Серфскейт', sportId: 'surfskate', category: 'Полный сет', condition: 'Новый',
    title: 'Carver CX Raw 32" Complete', size: '32"',
    description: 'Серфскейт Carver 32" на системе CX Raw. Полный комплект из коробки. Система CX лучшая для имитации волны. Никогда не катался.',
    startPrice: 18000, currentBid: 21500, step: 500, bidsCount: 5,
    seller: 'nikita_surf', sellerRating: 5.0, sellerDeals: 11,
    timeLeft: '3д 4ч', urgent: false, location: 'Санкт-Петербург, Центр',
    img: 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80'],
  },
  {
    id: 13, sport: 'Серфскейт', sportId: 'surfskate', category: 'Подвески', condition: 'Б/у',
    title: 'YOW System G5 Подвески', size: 'Комплект',
    description: 'Подвески YOW System G5 комплект (передняя адаптивная + задняя стандарт). Катаны 1 сезон. Состояние хорошее, мягкость не потеряна.',
    startPrice: 6000, currentBid: 7300, step: 300, bidsCount: 3,
    seller: 'surf_den', sellerRating: 4.8, sellerDeals: 6,
    timeLeft: '18ч 20м', urgent: true, location: 'Санкт-Петербург, Выборгский',
    img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'],
  },
  {
    id: 14, sport: 'Бег', sportId: 'run', category: 'Обувь', condition: 'Новый',
    title: 'Nike Pegasus 40 р.43', size: 'EU 43',
    description: 'Кроссовки Nike Pegasus 40 для бега, размер EU 43. Новые, не ношены. Белые с серым. React пена, отличная амортизация для длинных пробежек.',
    startPrice: 8000, currentBid: 10200, step: 400, bidsCount: 12,
    seller: 'maxim_run', sellerRating: 4.9, sellerDeals: 53,
    timeLeft: '1ч 5м', urgent: true, location: 'Санкт-Петербург, Московский',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
  },
  {
    id: 15, sport: 'Бег', sportId: 'run', category: 'Аксессуары', condition: 'Б/у',
    title: 'Garmin Forerunner 255 GPS', size: '41мм',
    description: 'Часы Garmin Forerunner 255 с GPS. Использовались 8 месяцев. Батарея держит 14+ часов в режиме GPS. Ремешок заменён на новый силиконовый.',
    startPrice: 12000, currentBid: 15800, step: 500, bidsCount: 9,
    seller: 'anna_run', sellerRating: 4.7, sellerDeals: 14,
    timeLeft: '2д 14ч', urgent: false, location: 'Санкт-Петербург, Фрунзенский',
    img: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80'],
  },
  {
    id: 16, sport: 'Снаряжение', sportId: 'gear', category: 'Защита', condition: 'Новый',
    title: 'Pro-Tec Full Cut Шлем', size: 'M / 56–58см',
    description: 'Шлем Pro-Tec Full Cut, размер M (56–58 см). Новый, в коробке. EPS пена + ABS скорлупа. Сертифицирован EN1078. Чёрный матовый.',
    startPrice: 3500, currentBid: 4700, step: 200, bidsCount: 5,
    seller: 'sk8shop_spb', sellerRating: 5.0, sellerDeals: 89,
    timeLeft: '4д 1ч', urgent: false, location: 'Санкт-Петербург, Центр',
    img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80'],
  },
  {
    id: 17, sport: 'Снаряжение', sportId: 'gear', category: 'Защита', condition: 'Б/у',
    title: 'Комплект защиты Triple 8 (колени+локти+запястья)', size: 'M',
    description: 'Защитный комплект Triple 8, размер M: наколенники, налокотники, защита запястий. Использован 1 сезон, пластик целый, застёжки рабочие.',
    startPrice: 2000, currentBid: 2900, step: 100, bidsCount: 6,
    seller: 'Danya_SK8', sellerRating: 4.9, sellerDeals: 34,
    timeLeft: '9ч 40м', urgent: false, location: 'Санкт-Петербург, Крестовский',
    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    imgs: ['https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'],
  },
])
