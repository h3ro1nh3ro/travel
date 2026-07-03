import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { AI_CONFIG, AVAILABLE_MODELS } from '../services/ai.js'

const router = Router()
const adminGuard = [authMiddleware, (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' })
  next()
}]

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', adminGuard, async (_, res) => {
  const [users, challenges, completions, pendingCount] = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.completion.count(),
    prisma.completion.count({ where: { status: 'pending' } }),
  ])
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }, take: 5,
    select: { id: true, username: true, points: true, level: true, createdAt: true },
  })
  const cityStats = await prisma.city.findMany({
    include: { _count: { select: { challenges: true } } }
  })
  res.json({ users, challenges, completions, pendingCount, recentUsers, cityStats })
})

// ── Completions (moderation) ──────────────────────────────────────────────────
router.get('/completions', adminGuard, async (req, res) => {
  const { page = '1', limit = '20', status } = req.query
  const where = status ? { status } : {}
  const [items, total] = await Promise.all([
    prisma.completion.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit), take: Number(limit),
      include: {
        user: { select: { id: true, username: true } },
        challenge: { include: { city: { select: { name: true } } } },
      },
    }),
    prisma.completion.count({ where }),
  ])
  res.json({ items, total })
})

router.put('/completions/:id', adminGuard, async (req, res) => {
  const { status, moderNote } = req.body
  const id = Number(req.params.id)
  const existing = await prisma.completion.findUnique({
    where: { id }, include: { challenge: true }
  })
  if (!existing) return res.status(404).json({ error: 'not found' })

  const completion = await prisma.completion.update({
    where: { id },
    data: { status, moderNote: moderNote ?? existing.moderNote },
  })

  if (status === 'approved' && existing.status !== 'approved') {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { points: { increment: existing.challenge.xp } }
    })
    await updateUserLevel(existing.userId)
  }
  res.json(completion)
})

router.delete('/completions/:id', adminGuard, async (req, res) => {
  await prisma.completion.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

// ── Challenges ────────────────────────────────────────────────────────────────
router.get('/challenges', adminGuard, async (_, res) => {
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ cityId: 'asc' }, { createdAt: 'desc' }],
    include: {
      city: { select: { name: true } },
      _count: { select: { completions: true } },
    },
  })
  res.json(challenges)
})

router.post('/challenges', adminGuard, async (req, res) => {
  const { cityId, title, description, category, difficulty, xp, hint, lat, lng, isActive } = req.body
  if (!cityId || !title) return res.status(400).json({ error: 'cityId and title required' })
  const ch = await prisma.challenge.create({
    data: {
      cityId: Number(cityId), title, description: description || '',
      category: category || 'История', difficulty: difficulty || 'easy',
      xp: Number(xp) || 50, hint: hint || null,
      lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null,
      isActive: isActive !== false,
    },
  })
  res.json(ch)
})

router.put('/challenges/:id', adminGuard, async (req, res) => {
  const { cityId, title, description, category, difficulty, xp, hint, lat, lng, isActive } = req.body
  const ch = await prisma.challenge.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(cityId !== undefined && { cityId: Number(cityId) }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(xp !== undefined && { xp: Number(xp) }),
      ...(hint !== undefined && { hint: hint || null }),
      ...(lat !== undefined && { lat: lat ? parseFloat(lat) : null }),
      ...(lng !== undefined && { lng: lng ? parseFloat(lng) : null }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    },
  })
  res.json(ch)
})

router.delete('/challenges/:id', adminGuard, async (req, res) => {
  await prisma.completion.deleteMany({ where: { challengeId: Number(req.params.id) } })
  await prisma.challenge.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', adminGuard, async (req, res) => {
  const { search, page = '1', limit = '50' } = req.query
  const where = search ? { OR: [
    { username: { contains: search } },
    { email: { contains: search } },
  ] } : {}
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit), take: Number(limit),
      select: {
        id: true, username: true, email: true, role: true,
        points: true, level: true, bio: true, createdAt: true,
        _count: { select: { completions: true } },
      },
    }),
    prisma.user.count({ where }),
  ])
  res.json({ users, total })
})

router.put('/users/:id', adminGuard, async (req, res) => {
  const { points, level, bio, role, email } = req.body
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(points !== undefined && { points: Number(points) }),
      ...(level !== undefined && { level }),
      ...(bio !== undefined && { bio }),
      ...(role !== undefined && { role }),
      ...(email !== undefined && { email }),
    },
    select: { id: true, username: true, email: true, role: true, points: true, level: true, bio: true },
  })
  res.json(user)
})

router.delete('/users/:id', adminGuard, async (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: 'нельзя удалить себя' })
  await prisma.completion.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })
  res.json({ ok: true })
})

// ── Cities ────────────────────────────────────────────────────────────────────
router.get('/cities', adminGuard, async (_, res) => {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
  res.json(cities)
})

// ── AI Model ──────────────────────────────────────────────────────────────────
router.get('/ai', adminGuard, (_, res) => {
  res.json({
    current: { ...AI_CONFIG },
    available: AVAILABLE_MODELS,
    keys: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      google: !!process.env.GOOGLE_AI_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
  })
})

router.post('/ai', adminGuard, (req, res) => {
  const { provider, model } = req.body
  const valid = AVAILABLE_MODELS.find(m => m.provider === provider && m.model === model)
  if (!valid) return res.status(400).json({ error: 'unknown model' })
  AI_CONFIG.provider = provider
  AI_CONFIG.model = model
  res.json({ ok: true, current: { ...AI_CONFIG } })
})

async function updateUserLevel(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } })
  const levels = [
    { min: 0, name: 'Новичок' }, { min: 200, name: 'Путешественник' },
    { min: 600, name: 'Исследователь' }, { min: 1500, name: 'Бывалый' },
    { min: 3000, name: 'Знаток' }, { min: 6000, name: 'Легенда' }, { min: 10000, name: 'Амбассадор' },
  ]
  const level = [...levels].reverse().find(l => user.points >= l.min)?.name ?? 'Новичок'
  await prisma.user.update({ where: { id: userId }, data: { level } })
}

export default router
