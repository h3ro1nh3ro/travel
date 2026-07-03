import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// All challenges with coords (for map)
router.get('/', optionalAuth, async (req, res) => {
  const challenges = await prisma.challenge.findMany({
    where: { isActive: true, lat: { not: null } },
    include: { city: { select: { id: true, name: true } } },
    orderBy: { cityId: 'asc' },
  })

  let completedIds = new Set()
  if (req.user) {
    const done = await prisma.completion.findMany({
      where: { userId: req.user.id, challengeId: { in: challenges.map(c => c.id) } },
      select: { challengeId: true, status: true },
    })
    for (const d of done) if (d.status === 'approved') completedIds.add(d.challengeId)
  }

  res.json(challenges.map(c => ({ ...c, completed: completedIds.has(c.id) })))
})

router.get('/:id', optionalAuth, async (req, res) => {
  const id = Number(req.params.id)
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { city: true }
  })
  if (!challenge) return res.status(404).json({ error: 'Not found' })

  let myCompletion = null
  if (req.user) {
    myCompletion = await prisma.completion.findUnique({
      where: { userId_challengeId: { userId: req.user.id, challengeId: id } }
    })
  }

  res.json({ ...challenge, myCompletion })
})

export default router
