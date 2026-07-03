import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, async (req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
  if (!req.user) return res.json(cities)

  const completions = await prisma.completion.findMany({
    where: { userId: req.user.id, status: 'approved' },
    select: { challenge: { select: { cityId: true } } }
  })
  const countByCity = {}
  for (const c of completions) {
    const cid = c.challenge.cityId
    countByCity[cid] = (countByCity[cid] ?? 0) + 1
  }
  res.json(cities.map(c => ({ ...c, myCompleted: countByCity[c.id] ?? 0 })))
})

router.get('/:id', optionalAuth, async (req, res) => {
  const cityId = Number(req.params.id)
  const { category } = req.query

  const where = { cityId, isActive: true }
  if (category && category !== 'all') where.category = category

  const [city, challenges] = await Promise.all([
    prisma.city.findUnique({ where: { id: cityId } }),
    prisma.challenge.findMany({ where, orderBy: { category: 'asc' } }),
  ])

  if (!city) return res.status(404).json({ error: 'City not found' })

  let statusById = {}
  if (req.user) {
    const done = await prisma.completion.findMany({
      where: { userId: req.user.id, challengeId: { in: challenges.map(c => c.id) } },
      select: { challengeId: true, status: true },
    })
    for (const d of done) statusById[d.challengeId] = d.status
  }

  const approvedCount = Object.values(statusById).filter(s => s === 'approved').length
  res.json({
    ...city,
    challenges: challenges.map(c => ({ ...c, myStatus: statusById[c.id] ?? null })),
    completedCount: approvedCount,
    totalCount: challenges.length,
  })
})

export default router
