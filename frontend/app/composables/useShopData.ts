export interface ShopProduct {
  id: number
  tab: string
  brand: string
  title: string
  price: number
  badge?: string
  img: string
  description: string
  specs: { label: string; value: string }[]
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 1, tab: 'merch', brand: 'KickOn',
    title: 'Футболка KickOn OG Logo',
    price: 2490, badge: 'NEW',
    img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    description: 'Оригинальная футболка KickOn с логотипом первого сезона. Плотный хлопок, увеличенный крой для свободы движений во время трюков. Принт выполнен методом шелкографии — не трескается и не выцветает после стирки.',
    specs: [
      { label: 'Материал', value: '100% хлопок, 220г/м²' },
      { label: 'Крой', value: 'Оверсайз' },
      { label: 'Размеры', value: 'S / M / L / XL / XXL' },
      { label: 'Цвет', value: 'Белый' },
      { label: 'Уход', value: 'Стирка 30°C, не отбеливать' },
    ],
  },
  {
    id: 2, tab: 'merch', brand: 'KickOn',
    title: 'Худи KickOn SK8 Block',
    price: 4990,
    img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    description: 'Тяжёлое худи для сессий в холодную погоду. Объёмный карман-кенгуру, усиленные манжеты. Внутри — мягкий начёс, снаружи — плотная петля. Блочный принт SK8 на спине.',
    specs: [
      { label: 'Материал', value: '80% хлопок, 20% полиэстер, 380г/м²' },
      { label: 'Крой', value: 'Оверсайз' },
      { label: 'Размеры', value: 'S / M / L / XL / XXL' },
      { label: 'Цвет', value: 'Чёрный' },
      { label: 'Капюшон', value: 'Двойной, с кулиской' },
    ],
  },
  {
    id: 3, tab: 'merch', brand: 'KickOn',
    title: 'Кепка KickOn Five-Panel',
    price: 1490, badge: 'HIT',
    img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    description: 'Классическая пятипанельная кепка с вышитым логотипом. Жёсткий козырёк, регулируемая застёжка сзади. Лёгкая и дышащая — идеально для летних сессий.',
    specs: [
      { label: 'Материал', value: '100% хлопок' },
      { label: 'Конструкция', value: '5 панелей, неструктурированная' },
      { label: 'Козырёк', value: 'Плоский, жёсткий' },
      { label: 'Размер', value: 'One size (регулировка)' },
      { label: 'Логотип', value: 'Вышивка' },
    ],
  },
  {
    id: 4, tab: 'decks', brand: 'Element',
    title: 'Дека Element Section 8.0"',
    price: 4800,
    img: 'https://www.warehouseskateboards.com/images/products/preview/1DELE0LSPAS80GE.jpg',
    description: 'Классическая дека от Element из семи слоёв канадского клёна. Форма Section обеспечивает баланс между попом и стабильностью — подходит как для стрит-скейтинга, так и для парка.',
    specs: [
      { label: 'Ширина', value: '8.0"' },
      { label: 'Длина', value: '31.75"' },
      { label: 'Вилхилбейс', value: '14.25"' },
      { label: 'Материал', value: '7 слоёв клёна (Канада)' },
      { label: 'Конкейв', value: 'Средний' },
    ],
  },
  {
    id: 5, tab: 'decks', brand: 'Santa Cruz',
    title: 'Дека Santa Cruz Classic Dot 8.25"',
    price: 5200, badge: 'TOP',
    img: 'https://www.warehouseskateboards.com/images/products/preview/1DELE0SEAL825KK.jpg',
    description: 'Легендарная дека Santa Cruz с иконичным принтом Classic Dot. Чуть более широкая форма даёт дополнительную опору при лендинге. Отличный вариант для опытных скейтеров.',
    specs: [
      { label: 'Ширина', value: '8.25"' },
      { label: 'Длина', value: '32.0"' },
      { label: 'Вилхилбейс', value: '14.375"' },
      { label: 'Материал', value: '7 слоёв клёна (Канада)' },
      { label: 'Конкейв', value: 'Глубокий' },
    ],
  },
  {
    id: 6, tab: 'shoes', brand: 'Vans',
    title: 'Кеды Vans Old Skool Pro',
    price: 6990,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    description: 'Профессиональная версия культовой модели Old Skool. Усиленная носочная часть, подкладка Duracap, технология Sickstick на подошве для максимального сцепления с деке.',
    specs: [
      { label: 'Верх', value: 'Кожа + сетка' },
      { label: 'Подошва', value: 'Вулканизированная резина Sickstick' },
      { label: 'Усиление', value: 'Дублированный язычок, Duracap' },
      { label: 'Размеры', value: '36–47' },
      { label: 'Цвет', value: 'Чёрный/Белый' },
    ],
  },
  {
    id: 7, tab: 'shoes', brand: 'DC Shoes',
    title: 'Кеды DC Manteca 4',
    price: 5490, badge: 'SALE',
    img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    description: 'Обновлённая версия Manteca с улучшенной защитой лодыжки. Мягкая подкладка, усиленный мыс, сцепная подошва. Хорошо держат форму после интенсивных тренировок.',
    specs: [
      { label: 'Верх', value: 'Замша + ткань' },
      { label: 'Подошва', value: 'Резина DC' },
      { label: 'Стелька', value: 'Съёмная, с подушкой' },
      { label: 'Размеры', value: '36–46' },
      { label: 'Цвет', value: 'Серый/Белый' },
    ],
  },
  {
    id: 8, tab: 'pads', brand: 'Pro-Tec',
    title: 'Шлем Pro-Tec Classic Cert',
    price: 3800,
    img: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
    description: 'Классический сертифицированный шлем Pro-Tec, обязательный в большинстве скейт-парков. ABS-корпус, мягкая поролоновая подкладка, регулируемые ремни с пластиковой застёжкой.',
    specs: [
      { label: 'Сертификат', value: 'ASTM F1492, CE EN1078' },
      { label: 'Корпус', value: 'ABS пластик' },
      { label: 'Подкладка', value: 'Поролон, съёмная' },
      { label: 'Размеры', value: 'XS(51-52) / S(53-54) / M(55-56) / L(57-58)' },
      { label: 'Вес', value: '340г' },
    ],
  },
  {
    id: 9, tab: 'pads', brand: 'Triple Eight',
    title: 'Налокотники + наколенники Triple Eight',
    price: 2200,
    img: 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80',
    description: 'Набор защиты для начинающих и продвинутых скейтеров. Жёсткие пластиковые чашки, мягкий вспененный вкладыш, эластичные ремни с липучкой. Не стесняют движение.',
    specs: [
      { label: 'Комплект', value: '2 налокотника + 2 наколенника' },
      { label: 'Чашка', value: 'Жёсткий ABS пластик' },
      { label: 'Внутри', value: 'EVA пена' },
      { label: 'Размеры', value: 'S / M / L' },
      { label: 'Крепление', value: 'Двойная эластичная лента' },
    ],
  },
]
