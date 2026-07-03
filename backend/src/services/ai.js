import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import os from 'os'

// ─── Runtime config (mutable via admin endpoint) ──────────────────────────────
export const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openrouter', // 'openrouter' | 'google' | 'groq'
  model:    process.env.AI_MODEL    || 'google/gemini-2.5-flash',
}

export const AVAILABLE_MODELS = [
  { provider: 'openrouter', model: 'google/gemini-2.5-flash',                    label: 'OpenRouter · Gemini 2.5 Flash (кадры)' },
  { provider: 'openrouter', model: 'google/gemini-2.5-pro',                      label: 'OpenRouter · Gemini 2.5 Pro (кадры)' },
  { provider: 'openrouter', model: 'qwen/qwen2.5-vl-72b-instruct',               label: 'OpenRouter · Qwen 2.5 VL 72B (vision)' },
  { provider: 'groq',       model: 'meta-llama/llama-4-scout-17b-16e-instruct',  label: 'Groq · LLaMA 4 Scout (быстрый)' },
  { provider: 'groq',       model: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Groq · LLaMA 4 Maverick (умный)' },
  { provider: 'groq',       model: 'llama-3.2-90b-vision-preview',               label: 'Groq · LLaMA 3.2 90B Vision' },
  { provider: 'google',     model: 'gemini-2.5-flash-preview-05-20',             label: 'Google AI · Gemini 2.5 Flash (нативное видео)' },
  { provider: 'google',     model: 'gemini-2.0-flash',                           label: 'Google AI · Gemini 2.0 Flash (нативное видео)' },
  { provider: 'google',     model: 'gemini-1.5-pro',                             label: 'Google AI · Gemini 1.5 Pro (нативное видео)' },
]

// ─── Clients (lazy to avoid startup error when keys absent) ──────────────────
let _openrouterClient = null
function getOpenrouterClient() {
  if (!_openrouterClient) _openrouterClient = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY || 'none', baseURL: 'https://openrouter.ai/api/v1' })
  return _openrouterClient
}
let _groqClient = null
function getGroqClient() {
  if (!_groqClient) _groqClient = new OpenAI({ apiKey: process.env.GROQ_API_KEY || 'none', baseURL: 'https://api.groq.com/openai/v1' })
  return _groqClient
}

function getGoogleClients() {
  const key = process.env.GOOGLE_AI_KEY
  if (!key) return null
  return {
    ai:      new GoogleGenerativeAI(key),
    files:   new GoogleAIFileManager(key),
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
const TRICK_DATA = {
  ollie:       { base: 68, spread: 20, strengths: ['Чистый удар по хвосту', 'Хорошая постановка ног', 'Контролируемый заход'], improvements: ['Больше высоты', 'Выровняй доску в воздухе', 'Работай над приземлением на болты'] },
  kickflip:    { base: 62, spread: 24, strengths: ['Флип-движение передней ногой', 'Хороший кэтч', 'Уверенный заход'], improvements: ['Полный оборот доски', 'Не раскидывай ноги', 'Жёстче приземление'] },
  heelflip:    { base: 60, spread: 24, strengths: ['Удар пяткой наружу', 'Амплитуда прыжка', 'Ритм захода'], improvements: ['Чище оборот', 'Держи плечи ровно', 'Приземляйся на оба болта'] },
  manual:      { base: 65, spread: 22, strengths: ['Баланс на задних колёсах', 'Уверенная линия', 'Контроль скорости'], improvements: ['Дольше держи мануал', 'Ровнее линия', 'Плавнее выезд'] },
  grind:       { base: 63, spread: 20, strengths: ['Чистый запрыг на препятствие', 'Хороший гринд', 'Выезд с препятствия'], improvements: ['Длиннее гринд', 'Ровнее стойка', 'Чище выезд'] },
  impossible:  { base: 55, spread: 28, strengths: ['Обкрут вокруг ноги', 'Смелый трюк', 'Контроль доски'], improvements: ['Полный оборот', 'Не теряй доску', 'Жёстче кэтч'] },
  default:     { base: 64, spread: 22, strengths: ['Уверенная стойка', 'Хороший контроль', 'Техничный заход'], improvements: ['Чище исполнение', 'Работай над приземлением', 'Больше практики'] },
}

function pickRandom(arr, n = 2) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function mockEvaluate(trickName) {
  const key = Object.keys(TRICK_DATA).find(k => trickName.toLowerCase().includes(k)) ?? 'default'
  const { base, spread, strengths, improvements } = TRICK_DATA[key]
  const score = Math.min(100, Math.max(10, Math.round(base + (Math.random() - 0.4) * spread)))
  const landed = score >= 58
  const detail = strengths[Math.floor(Math.random() * strengths.length)]
  const fix    = improvements[Math.floor(Math.random() * improvements.length)]
  const summary = landed
    ? `Вижу спортсмена с ${trickName.toLowerCase()}\n${detail}\nПриземление чистое, на болты\nЗа такой ${trickName.toLowerCase()} ставлю ${score} баллов`
    : `Вижу попытку ${trickName.toLowerCase()}\n${fix}\nПриземление не засчитано — нужно доработать технику\nЗа такую попытку ставлю ${score} баллов`
  return { score, summary, strengths: pickRandom(strengths), improvements: pickRandom(improvements), landed }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHYSICAL_TRICKS = [
  'vertical jump', 'long jump', 'deep squat', 'toe touch', 'floor touch', 'leg raise',
  'forward roll', 'cartwheel', 'handstand', 'splits', 'back handspring',
  'max pushups', 'plank hold', 'burpee set', 'jump rope', 'box jump',
  'bridge pose', 'frog jumps', 'single leg balance', 'handwalk', 'max pullups',
]
const OUTDOOR_TRICKS = [
  'big fish', 'stone skip', 'water jump', 'log balance', 'rock stand', 'creek jump',
  'mushroom find', 'slackline', 'frisbee throw', 'badminton rally', 'tree climb',
  'water flip', 'shelter build', 'sunset photo',
  'campfire', 'flower crown', 'paper boat', 'kite flying', 'sand drawing',
  'butterfly shot', 'rock hopping', 'picnic setup', 'dragonfly selfie', 'cone toss',
  'sunset silhouette', 'berry find', 'stargazing photo', 'cloud touch',
]
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic']

const isPhysicalTrick = t => PHYSICAL_TRICKS.some(k => t.toLowerCase().includes(k))
const isOutdoorTrick  = t => OUTDOOR_TRICKS.some(k => t.toLowerCase().includes(k))

// ─── Shared: build context from trick name ────────────────────────────────────
function buildContext(trickName) {
  const lower = trickName.toLowerCase()

  const trickCriteria = {
    ollie: 'Олли — базовый прыжок на скейтборде. Задняя нога резко бьёт по хвосту (pop), передняя нога скользит вперёд-вверх (slide), выравнивая доску в воздухе. Обе ноги должны подняться вместе с доской, приземление на болты.',
    kickflip: 'Кикфлип = олли + флип. После попа передняя нога делает флип-движение пяткой наружу от себя, доска делает полный продольный оборот (360°). Если доска не докрутилась — это не кикфлип. Если нет флипа — это олли.',
    heelflip: 'Хилфлип = олли + обратный флип. После попа передняя нога бьёт пяткой наружу (в сторону носа), доска вращается в направлении, обратном кикфлипу. Если нет вращения — это олли.',
    'shove-it': 'Шовит — доска вращается горизонтально на 180° под ногами без олли или с минимальным прыжком. Ноги должны поймать доску после вращения.',
    manual: 'Мануал — баланс на задних (или передних) колёсах скейтборда в движении без касания вторых колёс земли. Оценивается длина, стабильность линии, чистота входа и выхода.',
    grind: 'Гринд на скейтборде — скольжение траками по препятствию (перила, бордюр). Оценивается чистота запрыга, длина гринда, стабильность стойки и выезд.',
    nosegrind: 'Носгринд — гринд только на переднем траке, задний конец доски приподнят. Баланс смещён на нос доски.',
    impossible: 'Импоссибл — доска оборачивается вокруг задней ноги вертикально (360°). Требует полного оборота вокруг ноги и чистого кэтча.',
    varial: 'Вариал флип = фронтсайд шовит (180° горизонтально) + кикфлип одновременно. Оба вращения должны происходить синхронно.',
    hardflip: 'Хардфлип = фронтсайд шовит + кикфлип в противоположные стороны одновременно. Один из технически сложных трюков.',
    '360': 'Трипл (360 флип / трефлип) = 360° шовит + кикфлип одновременно. Доска делает полный горизонтальный и продольный оборот одновременно.',
    nollie: 'Нолли — олли с носа доски. Передняя нога бьёт по носу (pop), задняя нога скользит назад-вверх. Зеркальное отражение олли.',
    'bunny hop': 'Банни хоп на BMX — прыжок на велосипеде без разгона. Оба колеса должны оторваться от земли одновременно. Оценивается высота, синхронность и уверенность.',
    'x-up': 'X-Up на BMX — в воздухе руль перекрещивается (поворачивается на 180°) и возвращается обратно до приземления. Оценивается высота прыжка и чистота вращения руля.',
    tailwhip: 'Тейлвип на BMX — рама велосипеда делает полный оборот (360°) вокруг вилки и руля пока райдер держится за руль. Должен быть полный оборот рамы.',
    barspin: 'Барспин на BMX — руль делает полный оборот (360°) в воздухе пока ноги в воздухе. Оценивается высота прыжка и чистота вращения руля.',
    fufanu: 'Фуфану на BMX — запрыгнуть задним колесом на рейл или край и удержать баланс. Переднее колесо в воздухе, заднее на препятствии.',
    decade: 'Декейд на BMX — райдер в воздухе делает полный оборот вокруг велосипеда. Один из сложнейших трюков.',
    'vertical jump': 'Прыжок в высоту с места. Смотри на высоту отрыва ног от земли и насколько высоко поднялся центр тяжести. Выше 80см — отлично (90-100 баллов), 50-80см — хорошо (60-80), ниже 50см — слабо (20-50).',
    'long jump': 'Прыжок в длину с места. Оцени расстояние от точки отрыва до места приземления. 1.5м+ — 85-100 баллов, 1-1.5м — 60-80, 0.5-1м — 30-60.',
    'deep squat': 'Глубокие приседания. Оцени: бёдра опускаются ниже колен, спина прямая, пятки не отрываются. Считай количество чистых повторений. 10 чистых — 80+ баллов.',
    'toe touch': 'Наклон вперёд стоя — касание пальцами рук до носков ног. Колени прямые. до носков = 60 баллов, ладонями до голеностопа = 80, ниже носков = 95.',
    'floor touch': 'Наклон вперёд — ладони на полу. Колени прямые. кончики пальцев = 40 баллов, вся ладонь = 70, плоско = 95.',
    'leg raise': 'Подъём прямых ног лёжа на спине. Ноги прямые, поясница прижата, подъём до 90° и выше. Считай чистые повторения.',
    'forward roll': 'Кувырок вперёд. Группировка тела, перекат через спину, чистый выход в стойку. Плавный = 80-100, с толчком руками = 50-70.',
    'cartwheel': 'Картвил/колесо. Последовательная постановка рук, обе ноги в воздухе, прямые ноги, чистый выход. Кривой = 40-60, чистый = 75-95.',
    'handstand': 'Стойка на руках. Прямое тело, прямые руки. Без стены 3+ сек = 80-100, у стены 5+ сек = 60-80.',
    'splits': 'Шпагат. Угол 180° = 95-100, 150-170° = 70-90, 120-150° = 40-65.',
    'back handspring': 'Флик-фляк. Взрывной прыжок назад, прямые руки при касании земли, мощный выход в стойку.',
    'big fish': 'Рыболовный конкурс. До 20см = 20 баллов, 20-40см = 45, 40-60см = 65, 60-80см = 80, больше 80см = 90-100.',
    'stone skip': 'Камень по воде. 1-2 прыжка = 20, 3-4 = 45, 5-6 = 65, 7-9 = 80, 10+ = 95.',
    'water jump': 'Прыжок в воду. Рыбка/сальто = 80-100, солдатик = 50-70, бомбочка = 30-50.',
    'log balance': 'Стоять на бревне. Тонкое бревно + уверенно = 80-100.',
    'rock stand': 'Стойка на камне в воде. Маленький камень, уверенно = 85-100.',
    'creek jump': 'Прыжок через ручей. Узкий (до 1м) = 30-50, средний (1-2м) = 55-75, широкий (2м+) = 80-100.',
    'mushroom find': 'Гриб в лесу. Белый гриб = 90+, подберёзовик/подосиновик = 70-85, лисичка = 65-80.',
    'slackline': 'Слэклайн. Несколько шагов = 40-60, полное прохождение = 70-90, трюки = 90-100.',
    'frisbee throw': 'Бросок фрисби. Ровный полёт далеко = 80-100, средне = 50-70, криво/близко = 20-45.',
    'badminton rally': 'Серия ударов в бадминтон. 1-5 = 20-40, 6-15 = 45-65, 16-30 = 70-85, 30+ = 90-100.',
    'tree climb': 'Лазание на дерево. Низко (2-3м) = 30-50, средне (4-6м) = 55-75, высоко (7м+) = 80-100.',
    'water flip': 'Сальто в воду. Чистое сальто = 80-100, полуоборот = 50-70.',
    'shelter build': 'Шалаш. Полноценный шалаш = 80-100, простое укрытие = 40-65.',
    'sunset photo': 'Фото заката. Потрясающий = 85-100, красивый = 60-80, обычное небо = 20-45.',
    powerslide: 'Пауэрслайд на роликах — резкое торможение боком, обе ноги поперёк движения одновременно.',
    crossover: 'Кроссовер на роликах — перекрёстные шаги в стороны.',
    slalom: 'Слалом на роликах — змейка вокруг конусов.',
    'soul grind': 'Соул-гринд на роликах — один ботинок на рейле средней частью, второй перпендикулярно.',
    royale: 'Роял-гринд на роликах — бэксайд гринд, корпус развёрнут спиной.',
    'acid grind': 'Эсид-гринд на роликах — один ботинок на рейле, второй поднят в воздух.',
    ufo: 'UFO гринд на роликах — оба ботинка на рейле параллельно.',
    mistrial: 'Мистриал-гринд — комбинация положений ботинок на рейле.',
    default: 'Оцени технику трюка: стойку, работу ног/рук, высоту, вращение (если есть), чистоту исполнения и приземления/выезда.',
  }

  const key = Object.keys(trickCriteria).find(k => k !== 'default' && lower.includes(k)) ?? 'default'
  const criteria = trickCriteria[key]

  const bmxTricks       = ['bunny hop', 'x-up', 'tailwhip', 'barspin', 'fufanu', 'decade', 'bh 180', 'double whip', 'bmx', 'manual bmx', 'bri flip']
  const rollerTricks    = ['powerslide', 'crossover', 'slalom', 'soul grind', 'royale', 'acid grind', 'ufo', 'mistrial', 'roller']
  const physicalTricks  = ['vertical jump', 'long jump', 'deep squat', 'toe touch', 'floor touch', 'leg raise', 'forward roll', 'cartwheel', 'handstand', 'splits', 'back handspring']
  const scooterTricks   = ['scooter', 'bri flip', 'tailwhip scooter', 'bar spin', 'barspin scooter', 'nose manual', 'barhop', 'scoot']
  const surfskateTricks = ['cutback', 'top turn', 'bottom turn', 'snap', 'floater', 'full rail', 'pump', 'carve', 're-entry', 'reentry', 'surf']
  const runTricks       = ['1k run', '5k', '10k', 'park run', 'intervals', 'hill run', 'night run', 'elite run', 'run', 'sprint', 'marathon', 'tempo']
  const outdoorTricks   = ['рыбалка', 'fishing', 'закат', 'sunset', 'лес', 'forest', 'прыжок в воду', 'cliff jump', 'outdoor', 'природа', 'улов', 'catch']

  let sportContext = 'скейтборд'
  if (bmxTricks.some(t => lower.includes(t)))       sportContext = 'BMX велосипед'
  if (rollerTricks.some(t => lower.includes(t)))    sportContext = 'агрессивные ролики'
  if (physicalTricks.some(t => lower.includes(t)))  sportContext = 'физические упражнения'
  if (scooterTricks.some(t => lower.includes(t)))   sportContext = 'самокат (scooter freestyle)'
  if (surfskateTricks.some(t => lower.includes(t))) sportContext = 'серфскейт (surfskate)'
  if (runTricks.some(t => lower.includes(t)))       sportContext = 'бег'
  if (outdoorTricks.some(t => lower.includes(t)))   sportContext = 'природа / активный отдых'

  return { criteria, sportContext, isSkate: sportContext === 'скейтборд', lower }
}

// ─── Shared: visual checklist for skate trick identification ─────────────────
function buildVisualChecklist(trickName) {
  const lower = trickName.toLowerCase()
  const checklists = {
    kickflip: [
      '1. Оба колеса отрываются от земли (виден pop)?',
      '2. Передняя нога уходит в сторону от носа доски (flick)?',
      '3. Доска делает ПОЛНЫЙ продольный оборот 360° (видна нижняя сторона деки)?',
      '4. Райдер ловит/останавливает доску ногами в воздухе?',
      '5. Приземление: обе ноги над болтами, не на хвост/нос?',
      'Если п.3 нет — это НЕ кикфлип. Пиши "ollie" или "неполный кикфлип".',
    ],
    heelflip: [
      '1. Оба колеса отрываются от земли?',
      '2. Передняя нога бьёт пяткой наружу (в сторону носа) — ОБРАТНОЕ направление от кикфлипа?',
      '3. Доска вращается в обратную от кикфлипа сторону, полный оборот 360°?',
      '4. Кэтч ногами в воздухе?',
      '5. Чистое приземление на болты?',
      'Если нет вращения в обратную сторону — это кикфлип или ollie.',
    ],
    ollie: [
      '1. Задняя нога резко бьёт по хвосту (pop — слышен/виден щелчок)?',
      '2. Передняя нога скользит вперёд-вверх по деке (slide)?',
      '3. Оба колеса в воздухе одновременно, доска горизонтальна?',
      '4. Нет продольного вращения доски (это отличает от флипов)?',
      '5. Приземление на оба трака одновременно?',
    ],
    'shove-it': [
      '1. Доска вращается ГОРИЗОНТАЛЬНО на 180° под ногами?',
      '2. Нет или минимальный вертикальный прыжок?',
      '3. Ноги поймали доску после горизонтального вращения?',
      'Если есть продольное вращение — это varial, не шовит.',
    ],
    manual: [
      '1. Задние (или передние) колёса отрываются от земли?',
      '2. Скейтер едет в движении только на двух колёсах?',
      '3. Вторые колёса ни разу не касаются земли во время трюка?',
      '4. Чистый выход из мануала без падения?',
    ],
    grind: [
      '1. Райдер запрыгивает на препятствие (рейл/бордюр)?',
      '2. Трак(и) доски касаются поверхности препятствия?',
      '3. Скольжение траком по препятствию видно (не просто стойка)?',
      '4. Чистый выезд с препятствия?',
    ],
    nosegrind: [
      '1. Запрыг на препятствие передним траком?',
      '2. ТОЛЬКО передний трак на препятствии, задний конец доски поднят вверх?',
      '3. Баланс удержан, скольжение есть?',
    ],
    impossible: [
      '1. Задняя нога остаётся на месте, доска начинает оборачиваться ВОКРУГ неё?',
      '2. Доска делает ПОЛНЫЙ оборот 360° вертикально вокруг задней ноги?',
      '3. Райдер ловит доску после полного оборота?',
      'Если оборот неполный — это НЕ импоссибл.',
    ],
    varial: [
      '1. Доска делает фронтсайд шовит (180° горизонтально)?',
      '2. ОДНОВРЕМЕННО доска делает кикфлип (360° продольно)?',
      '3. Оба вращения происходят в одном прыжке?',
    ],
    default: [
      '1. Виден ли скейтборд и скейтер в кадре?',
      '2. Есть ли отрыв от земли (оба колеса в воздухе)?',
      '3. Есть ли вращение доски (какое направление)?',
      '4. Чистое приземление на болты?',
    ],
  }
  const key = Object.keys(checklists).find(k => k !== 'default' && lower.includes(k)) ?? 'default'
  return checklists[key].join('\n')
}

// ─── Shared: build the text prompt ───────────────────────────────────────────
function buildPromptText(trickName, criteria, sportContext, isSkate, contextHint = '') {
  const hint = contextHint ? ` (${contextHint})` : ''
  if (isOutdoorTrick(trickName)) {
    return `Ты наблюдатель и знаток природы. Оцени "${trickName}"${hint}.
КРИТЕРИИ: ${criteria}
ФОРМАТ ОТВЕТА — ровно 4 строки через \\n: место/природа/объекты; размер/качество главного объекта; что впечатляет или почему не засчитано; итог "Ставлю X баллов".
ПРАВИЛА: никогда не придумывай то чего нет. Если нужного объекта нет — поставь 0.
Верни строго JSON без markdown:
{"score":<0-100>,"summary":"строка1\\nстрока2\\nстрока3\\nитог","landed":<true/false>}`
  }
  if (isPhysicalTrick(trickName)) {
    return `Ты опытный тренер по физической подготовке. Оцени выполнение упражнения "${trickName}"${hint}.
КРИТЕРИИ: ${criteria}
ФОРМАТ — 4 строки: кто в кадре/положение тела; техника/амплитуда/угол; что хорошо или почему не засчитано; итог.
Верни строго JSON без markdown:
{"score":<0-100>,"summary":"строка1\\nстрока2\\nстрока3\\nитог","landed":<true/false>}`
  }
  if (isSkate) {
    const visualChecklist = buildVisualChecklist(trickName)
    return `Ты профессиональный скейт-судья и тренер. Оцени скейт-трюк "${trickName}"${hint}.

ВИЗУАЛЬНЫЙ ЧЕКЛИСТ (проверяй по кадрам последовательно):
${visualChecklist}

ОПРЕДЕЛЕНИЕ ТРЮКА: называй только то, что РЕАЛЬНО ВИДНО. Не угадывай — если критерии не выполнены, пиши "попытка ${trickName}" или "ollie". Нет скейтборда → trick_name: "не определён", total_score: 0, landed: false.

КОМПОНЕНТЫ (каждый 1-10): pop — сила щелчка хвостом; flick — правильность движения ноги; airtime — высота и стиль; landing — чистота приземления на болты.
total_score = round((pop + flick + airtime + landing) / 4 * 10)

Пиши живо как судья на бортике, скейт-сленг, на русском, на "ты".
Верни строго JSON без markdown:
{"trick_name":"<название>","user_greeting":"<обращение>","total_score":<1-100>,"score_breakdown":{"pop":<1-10>,"flick":<1-10>,"airtime":<1-10>,"landing":<1-10>},"vibe_description":"<2-3 предложения>","constructive_critique":"<конкретные ошибки>","tips":["<совет 1>","<совет 2>","<совет 3>"],"landed":<true/false>}`
  }
  return `Ты профессиональный судья соревнований по экстремальному спорту (${sportContext}). Оцени трюк "${trickName}"${hint}.
КРИТЕРИИ: ${criteria}
Если нет нужного спорта — score: 0, landed: false.
Верни строго JSON без markdown:
{"score":<0-100>,"summary":"кто\\nчто делает\\nприземление\\nитог","landed":<true/false>}`
}

// ─── Shared: parse AI text response ──────────────────────────────────────────
function parseAIResponse(text, isSkate) {
  // Убираем markdown-обёртки (```json ... ```)
  const clean = text.replace(/```[a-z]*\n?/g, '').trim()

  // Ищем JSON-объект от первого { до последнего } (greedy — работает даже если в строках есть { })
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error('[AI] no json found, raw response:', text.slice(0, 800))
    throw new Error('no json in response')
  }

  // Чистим control-символы внутри строковых значений
  const sanitized = match[0].replace(/"((?:[^"\\]|\\.)*)"/gs, m =>
    m.replace(/[\x00-\x1f]/g, c => c === '\n' ? '\\n' : c === '\t' ? '\\t' : '')
  )

  let parsed
  try {
    parsed = JSON.parse(sanitized)
  } catch (e) {
    console.error('[AI] JSON.parse failed:', e.message, 'raw:', sanitized.slice(0, 500))
    throw new Error('no json in response')
  }

  if (isSkate && parsed.total_score !== undefined) {
    return {
      score:        parsed.total_score,
      summary:      parsed.vibe_description ?? '',
      strengths:    Array.isArray(parsed.tips) ? parsed.tips : [],
      improvements: parsed.constructive_critique ? [parsed.constructive_critique] : [],
      landed:       parsed.landed ?? (parsed.total_score >= 50),
      skateDetails: {
        trick_name:          parsed.trick_name,
        user_greeting:       parsed.user_greeting,
        score_breakdown:     parsed.score_breakdown,
        vibe_description:    parsed.vibe_description,
        constructive_critique: parsed.constructive_critique,
        tips:                parsed.tips,
      },
    }
  }
  return parsed
}

// ─── OpenRouter path: frame extraction ───────────────────────────────────────

// Find the 2-second window with the most motion (scene changes) — this is where the trick is
function findTrickWindow(videoPath, duration) {
  try {
    const raw = execSync(
      `ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.05)',showinfo" -vsync vfr -f null /dev/null 2>&1`,
      { stdio: ['pipe', 'pipe', 'pipe'] }
    ).toString()

    const times = []
    const re = /pts_time:([\d.]+)/g
    let m
    while ((m = re.exec(raw)) !== null) {
      const t = parseFloat(m[1])
      if (!isNaN(t) && t < duration) times.push(t)
    }
    if (times.length < 3) return null

    // sliding 2-second window — find densest cluster
    const WINDOW = 2.0
    let bestStart = times[0], bestCount = 0
    for (const t of times) {
      const count = times.filter(x => x >= t && x < t + WINDOW).length
      if (count > bestCount) { bestCount = count; bestStart = t }
    }
    const start = Math.max(0, bestStart - 0.3)
    const end   = Math.min(duration, bestStart + WINDOW + 0.3)
    return { start, len: end - start }
  } catch { return null }
}

// Returns [{ data: base64, ts: number|null }]
function extractFrames(videoPath, isSkate = false) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kickon-'))

  const duration = parseFloat(execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`,
    { stdio: ['pipe', 'pipe', 'pipe'] }
  ).toString().trim()) || 5

  let frameFiles = [] // [{ file, ts }]

  if (isSkate) {
    // Ищем "окно трюка" — зону с наибольшим движением
    const window  = findTrickWindow(videoPath, duration)
    const tStart  = window ? window.start : duration * 0.05
    const tLen    = window ? window.len   : duration * 0.90
    // В плотном окне трюка берём 8 кадров плотнее, в широком — реже
    const fps     = window && window.len < 2.5 ? 6 : 4
    const outPat  = path.join(tmpDir, 'frame%03d.jpg')
    try {
      execSync(
        `ffmpeg -ss ${tStart.toFixed(3)} -i "${videoPath}" -t ${tLen.toFixed(3)} -vf "fps=${fps},scale=240:-1" -frames:v 8 -q:v 5 "${outPat}" -y`,
        { stdio: 'pipe' }
      )
    } catch { /* ignore */ }
    const files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort()
    const step  = files.length > 1 ? tLen / (files.length - 1) : 0
    frameFiles  = files.map((f, i) => ({ file: path.join(tmpDir, f), ts: tStart + i * step }))
  } else {
    // Не-скейт: scene detection, 320px, 12 кадров
    const outPattern = path.join(tmpDir, 'frame%03d.jpg')
    try {
      execSync(
        `ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.10)',scale=320:-1" -vsync vfr -q:v 5 "${outPattern}" -y`,
        { stdio: 'pipe' }
      )
    } catch { /* ignore */ }

    let files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort()
    if (files.length >= 4) {
      if (files.length > 12) {
        const step = (files.length - 1) / 11
        files = Array.from({ length: 12 }, (_, i) => files[Math.round(i * step)])
      }
      frameFiles = files.map(f => ({ file: path.join(tmpDir, f), ts: null }))
    } else {
      files.forEach(f => fs.unlinkSync(path.join(tmpDir, f)))
    }
  }

  if (frameFiles.length === 0) {
    // Fallback: uniform sampling
    const tStart = duration * 0.08, tEnd = duration * 0.95
    const MAX = 10, step = (tEnd - tStart) / (MAX - 1)
    for (let i = 0; i < MAX; i++) {
      const ts  = tStart + i * step
      const out = path.join(tmpDir, `frame${String(i).padStart(3, '0')}.jpg`)
      try {
        execSync(`ffmpeg -ss ${ts.toFixed(3)} -i "${videoPath}" -vf "scale=320:-1" -frames:v 1 -q:v 6 "${out}" -y`, { stdio: 'pipe' })
        frameFiles.push({ file: out, ts })
      } catch { /* skip */ }
    }
  }

  const frames = frameFiles.map(({ file, ts }) => {
    const data = fs.readFileSync(file).toString('base64')
    fs.unlinkSync(file)
    return { data, ts }
  })
  try { fs.rmdirSync(tmpDir) } catch { /* ignore */ }
  return frames
}

function resizeImageForApi(imagePath) {
  const tmpOut = path.join(os.tmpdir(), `ko_img_${Date.now()}.jpg`)
  try {
    execSync(`ffmpeg -y -i "${imagePath}" -vf "scale='min(1024,iw)':-2" -q:v 4 "${tmpOut}" 2>/dev/null`)
    const data = fs.readFileSync(tmpOut).toString('base64')
    fs.unlinkSync(tmpOut)
    return { data, mime: 'image/jpeg' }
  } catch {
    const ext = path.extname(imagePath).toLowerCase()
    return {
      data: fs.readFileSync(imagePath).toString('base64'),
      mime: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
    }
  }
}

async function evaluateWithOpenRouter(filePath, trickName) {
  const ext     = path.extname(filePath).toLowerCase()
  const isImage = IMAGE_EXTS.includes(ext)
  const { criteria, sportContext, isSkate } = buildContext(trickName)

  const systemMsg = { role: 'system', content: 'You are a JSON API. Always respond with valid JSON only. No text before or after the JSON object.' }

  if (isImage) {
    const { data, mime } = resizeImageForApi(filePath)
    const promptText = buildPromptText(trickName, criteria, sportContext, isSkate)
    const response = await getOpenrouterClient().chat.completions.create({
      model:           AI_CONFIG.model,
      max_tokens:      isSkate ? 1200 : 600,
      response_format: { type: 'json_object' },
      messages: [
        systemMsg,
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:${mime};base64,${data}` } },
          { type: 'text', text: promptText },
        ]},
      ],
    })
    return parseAIResponse(response.choices[0].message.content, isSkate)
  }

  const frames = extractFrames(filePath, isSkate)
  const total  = frames.length
  const imageContent = frames.flatMap(({ data, ts }, i) => {
    const label = ts !== null
      ? `[Кадр ${i + 1}/${total} · ${ts.toFixed(1)}с]`
      : `[Кадр ${i + 1}/${total}]`
    return [
      { type: 'text', text: label },
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${data}` } },
    ]
  })
  const contextHint = isSkate ? `${total} кадров, 10fps — каждые 0.1с` : `${total} кадров`
  const promptText = buildPromptText(trickName, criteria, sportContext, isSkate, contextHint)

  const response = await getOpenrouterClient().chat.completions.create({
    model:           AI_CONFIG.model,
    max_tokens:      isSkate ? 1000 : 600,
    response_format: { type: 'json_object' },
    messages: [
      systemMsg,
      { role: 'user', content: [...imageContent, { type: 'text', text: promptText }] },
    ],
  })
  return parseAIResponse(response.choices[0].message.content, isSkate)
}

// ─── Groq path: frames via OpenAI-compatible API ─────────────────────────────
async function evaluateWithGroq(filePath, trickName) {
  const ext     = path.extname(filePath).toLowerCase()
  const isImage = IMAGE_EXTS.includes(ext)
  const { criteria, sportContext, isSkate } = buildContext(trickName)

  if (isImage) {
    const { data, mime } = resizeImageForApi(filePath)
    const promptText = buildPromptText(trickName, criteria, sportContext, isSkate)
    const response = await getGroqClient().chat.completions.create({
      model:      AI_CONFIG.model,
      max_tokens: isSkate ? 700 : 350,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:${mime};base64,${data}` } },
        { type: 'text', text: promptText },
      ]}],
    })
    return parseAIResponse(response.choices[0].message.content, isSkate)
  }

  const frames = extractFrames(filePath, isSkate)
  const total  = frames.length
  const imageContent = frames.flatMap(({ data, ts }, i) => {
    const label = ts !== null
      ? `[Кадр ${i + 1}/${total} · ${ts.toFixed(1)}с]`
      : `[Кадр ${i + 1}/${total}]`
    return [
      { type: 'text', text: label },
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${data}` } },
    ]
  })
  const contextHint = `${total} кадров`
  const promptText = buildPromptText(trickName, criteria, sportContext, isSkate, contextHint)

  const response = await getGroqClient().chat.completions.create({
    model:      AI_CONFIG.model,
    max_tokens: isSkate ? 500 : 350,
    messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: promptText }] }],
  })
  return parseAIResponse(response.choices[0].message.content, isSkate)
}

// ─── Google AI path: native video via Files API ───────────────────────────────
async function evaluateWithGoogle(filePath, trickName) {
  const clients = getGoogleClients()
  if (!clients) throw new Error('GOOGLE_AI_KEY not set')

  const ext      = path.extname(filePath).toLowerCase()
  const isImage  = IMAGE_EXTS.includes(ext)
  const mimeType = isImage
    ? (ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg')
    : 'video/mp4'

  // Upload file to Google AI Files API
  const upload = await clients.files.uploadFile(filePath, {
    mimeType,
    displayName: `ko_${Date.now()}`,
  })
  let file = upload.file

  // Wait for video processing
  if (!isImage) {
    let attempts = 0
    while (file.state === 'PROCESSING' && attempts < 30) {
      await new Promise(r => setTimeout(r, 3000))
      file = await clients.files.getFile(file.name)
      attempts++
    }
    if (file.state !== 'ACTIVE') throw new Error(`Google AI file state: ${file.state}`)
  }

  const { criteria, sportContext, isSkate } = buildContext(trickName)
  const contextHint = isImage ? 'фото' : 'полное видео — нативный анализ движения'
  const promptText  = buildPromptText(trickName, criteria, sportContext, isSkate, contextHint)

  const model  = clients.ai.getGenerativeModel({ model: AI_CONFIG.model })
  const result = await model.generateContent([
    { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
    { text: promptText },
  ])

  // Clean up uploaded file (fire & forget)
  clients.files.deleteFile(file.name).catch(() => {})

  return parseAIResponse(result.response.text(), isSkate)
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function evaluateTrickFromVideo(filePath, trickName) {
  const hasOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-api-key-here'
  const hasGoogle     = process.env.GOOGLE_AI_KEY && process.env.GOOGLE_AI_KEY.length > 10
  const hasGroq       = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10

  if (!hasOpenRouter && !hasGoogle && !hasGroq) {
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500))
    return mockEvaluate(trickName)
  }

  try {
    if (AI_CONFIG.provider === 'google' && hasGoogle) {
      return await evaluateWithGoogle(filePath, trickName)
    }
    if (AI_CONFIG.provider === 'groq' && hasGroq) {
      return await evaluateWithGroq(filePath, trickName)
    }
    return await evaluateWithOpenRouter(filePath, trickName)
  } catch (e) {
    console.error('[AI] fallback to mock, reason:', e?.message || e)
    return mockEvaluate(trickName)
  }
}

// ─── Travel photo verification + assessment ───────────────────────────────────
export async function verifyPhotoWithAI(filePath, challengeTitle, challengeDesc, cityName) {
  try {
    const imageData = fs.readFileSync(filePath)
    const base64 = imageData.toString('base64')
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp'

    const prompt = `Ты оцениваешь выполнение туристического задания по фото.

Город: ${cityName}
Задание: "${challengeTitle}"
Описание: ${challengeDesc}

Посмотри на фото и ответь строго в JSON (без markdown, без пояснений вне JSON):
{
  "verified": true/false,
  "confidence": 0-100,
  "score": 0-100,
  "feedback": "1-2 предложения — что видно на фото и как соответствует заданию",
  "strengths": ["что хорошо на фото (1-3 пункта на русском)"],
  "improvements": ["что можно улучшить в следующий раз (1-2 пункта на русском)"]
}

verified=true если фото явно подтверждает выполнение задания.
score — общая оценка выполнения: 90-100 идеально, 70-89 хорошо, 50-69 сойдёт, ниже — не засчитано.
Будь лояльным: если сомневаешься — ставь verified=true и score 70+.`

    const client = getOpenrouterClient()
    const response = await client.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt }
        ]
      }],
      max_tokens: 400,
    })

    const text = response.choices[0]?.message?.content ?? ''
    const json = text.match(/\{[\s\S]*\}/)
    if (!json) throw new Error('No JSON in response')
    const result = JSON.parse(json[0])
    return {
      verified: result.verified ?? true,
      confidence: result.confidence ?? 80,
      score: result.score ?? result.confidence ?? 80,
      feedback: result.feedback ?? 'Фото принято',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
    }
  } catch (e) {
    console.error('[AI verify] failed:', e.message)
    return { verified: false, confidence: 0, score: 0, feedback: null, strengths: [], improvements: [] }
  }
}
