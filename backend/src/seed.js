import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const cities = [
  {
    name: 'Санкт-Петербург',
    description: 'Культурная столица России — дворцы, каналы, белые ночи',
    lat: 59.9343, lng: 30.3351,
    challenges: [
      { title: 'Сфотографируйся у Эрмитажа', description: 'Сделай фото на фоне главного входа Зимнего дворца', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Разведённые мосты', description: 'Сфотографируй разведённый мост ночью', category: 'Природа', difficulty: 'medium', xp: 100 },
      { title: 'Уличная еда на Думской', description: 'Попробуй местный фастфуд и покажи чек или фото еды', category: 'Гастро', difficulty: 'easy', xp: 40 },
      { title: 'Стрит-арт Петербурга', description: 'Найди и сфотографируй граффити или мурал в городе', category: 'Арт', difficulty: 'easy', xp: 50 },
      { title: 'Петропавловская крепость', description: 'Сделай фото у Петропавловского собора', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Канал Грибоедова', description: 'Фото с видом на один из каналов', category: 'Природа', difficulty: 'easy', xp: 40 },
      { title: 'Кофе в Питере', description: 'Выпей кофе в атмосферной кофейне и покажи чашку', category: 'Гастро', difficulty: 'easy', xp: 30 },
      { title: 'Крыши Петербурга', description: 'Поднимись на крышу или смотровую площадку и сделай фото города сверху', category: 'Спорт', difficulty: 'hard', xp: 150 },
      { title: 'Дворцовая площадь', description: 'Фото на Дворцовой площади с Александровской колонной', category: 'История', difficulty: 'easy', xp: 40 },
      { title: 'Невский проспект', description: 'Пройди по Невскому и сделай фото главной улицы', category: 'История', difficulty: 'easy', xp: 30 },
    ]
  },
  {
    name: 'Москва',
    description: 'Столица России — история, архитектура, ритм мегаполиса',
    lat: 55.7558, lng: 37.6173,
    challenges: [
      { title: 'Красная площадь', description: 'Сделай фото на Красной площади с видом на Кремль', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Метро Москвы', description: 'Сфотографируй красивый зал одной из станций метро', category: 'Арт', difficulty: 'easy', xp: 40 },
      { title: 'Парк Горького', description: 'Прогуляйся по парку и сделай фото у набережной', category: 'Природа', difficulty: 'easy', xp: 40 },
      { title: 'Московский стрит-фуд', description: 'Попробуй еду на фудкорте или фудтраке', category: 'Гастро', difficulty: 'easy', xp: 40 },
      { title: 'ГУМ', description: 'Сделай фото внутри ГУМа', category: 'История', difficulty: 'easy', xp: 30 },
      { title: 'ВДНХ', description: 'Сфотографируй фонтан "Дружба народов" или павильоны', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Смотровая Воробьёвых гор', description: 'Вид на город со смотровой площадки', category: 'Природа', difficulty: 'medium', xp: 70 },
      { title: 'Арбат', description: 'Фото на Старом Арбате', category: 'История', difficulty: 'easy', xp: 30 },
      { title: 'Уличный арт Москвы', description: 'Найди мурал или инсталляцию в городе', category: 'Арт', difficulty: 'easy', xp: 50 },
      { title: 'Зарядье', description: 'Фото на парящем мосту в парке Зарядье', category: 'Природа', difficulty: 'easy', xp: 60 },
    ]
  },
  {
    name: 'Казань',
    description: 'Татарская столица — мечети, кремль, уникальная кухня',
    lat: 55.7887, lng: 49.1221,
    challenges: [
      { title: 'Казанский кремль', description: 'Фото внутри или у стен Казанского кремля', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Мечеть Кул-Шариф', description: 'Сделай фото у главной мечети Казани', category: 'История', difficulty: 'easy', xp: 50 },
      { title: 'Эчпочмак', description: 'Попробуй эчпочмак (татарский треугольник) и покажи его', category: 'Гастро', difficulty: 'easy', xp: 60 },
      { title: 'Улица Баумана', description: 'Прогуляйся по пешеходной улице Баумана', category: 'История', difficulty: 'easy', xp: 30 },
      { title: 'Чак-чак', description: 'Купи чак-чак в местной кондитерской', category: 'Гастро', difficulty: 'easy', xp: 40 },
      { title: 'Кабан-озеро', description: 'Фото у озера Кабан', category: 'Природа', difficulty: 'easy', xp: 40 },
      { title: 'Стрит-арт Казани', description: 'Найди граффити или мурал в городе', category: 'Арт', difficulty: 'easy', xp: 50 },
      { title: 'Храм всех религий', description: 'Сфотографируй уникальный Храм всех религий', category: 'История', difficulty: 'medium', xp: 70 },
      { title: 'Старо-Татарская слобода', description: 'Пройдись по историческому татарскому кварталу', category: 'История', difficulty: 'medium', xp: 80 },
      { title: 'Казань-Арена', description: 'Фото у стадиона', category: 'Спорт', difficulty: 'easy', xp: 40 },
    ]
  },
]

async function main() {
  console.log('Seeding cities and challenges...')

  for (const cityData of cities) {
    const { challenges, ...cityFields } = cityData
    const city = await prisma.city.upsert({
      where: { name: cityFields.name },
      update: { challengeCount: challenges.length },
      create: { ...cityFields, challengeCount: challenges.length }
    })
    console.log(`  City: ${city.name}`)

    const existing = await prisma.challenge.count({ where: { cityId: city.id } })
    if (existing === 0) {
      for (const ch of challenges) {
        await prisma.challenge.create({ data: { ...ch, cityId: city.id } })
      }
      console.log(`    Created ${challenges.length} challenges`)
    } else {
      console.log(`    Skipped (${existing} already exist)`)
    }
  }

  const hash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', email: 'admin@travel.app', password: hash, role: 'ADMIN', points: 9999, level: 'Амбассадор' }
  })
  console.log('Admin: admin / admin123')
  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
