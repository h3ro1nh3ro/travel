import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { cacheGet, cacheSet, cacheInvalidate } from '../lib/cache.js'
import multer from 'multer'
import path from 'path'

const router = Router()

const avatarStorage = multer.diskStorage({
  destination: 'uploads/avatars/',
  filename: (_, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
})
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } })

const PUBLIC_FIELDS = {
  id: true, username: true, points: true, level: true, avatar: true,
  bio: true, sport: true, interests: true, createdAt: true,
  streakCount: true, badges: true, role: true,
}

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json([])
  const users = await prisma.user.findMany({
    where: { username: { contains: q } },
    select: { id: true, username: true, points: true, level: true, avatar: true, sport: true },
    take: 20,
    orderBy: { points: 'desc' }
  })
  res.json(users)
})

router.get('/leaderboard', async (_, res) => {
  const hit = cacheGet('leaderboard')
  if (hit) {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
    return res.json(hit)
  }
  const users = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: 50,
    select: { id: true, username: true, points: true, level: true, avatar: true, sport: true }
  })
  cacheSet('leaderboard', users, 60_000)
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  res.json(users)
})

// GET own profile
router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { ...PUBLIC_FIELDS, email: true, _count: { select: { followers: true, following: true } } }
  })
  res.json(user)
})

// GET profile by username
router.get('/by/:username', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      ...PUBLIC_FIELDS,
      submissions: {
        where: { status: 'evaluated' },
        orderBy: { aiScore: 'desc' },
        take: 6,
        include: { challenge: { select: { title: true, trickName: true } } }
      },
      _count: { select: { followers: true, following: true } }
    }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// GET points history
router.get('/me/points-history', authMiddleware, async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { userId: req.user.id, status: 'evaluated', aiScore: { not: null } },
    include: { challenge: { select: { title: true, trickName: true, prizePoints: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(submissions.map(s => {
    const isFree = !s.challenge
    const earned = isFree
      ? (s.aiScore > 60 ? Math.round((s.aiScore - 60) / 40 * 30) : 0)
      : Math.round((s.aiScore / 100) * s.challenge.prizePoints)
    return {
      id: s.id,
      aiScore: s.aiScore,
      trickName: s.challenge?.trickName ?? s.trickName ?? 'Freestyle',
      challengeTitle: s.challenge?.title ?? (isFree ? 'Freestyle' : null),
      earned,
      isFree,
      createdAt: s.createdAt,
    }
  }))
})

// PUT update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { bio, sport, interests } = req.body
  const data = {}
  if (bio !== undefined) data.bio = bio.slice(0, 200)
  if (sport !== undefined) data.sport = sport
  if (interests !== undefined) data.interests = interests
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: { ...PUBLIC_FIELDS, email: true }
  })
  res.json(user)
})

// POST upload avatar
router.post('/me/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const url = `/uploads/avatars/${req.file.filename}`
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: url },
    select: { ...PUBLIC_FIELDS, email: true }
  })
  res.json(user)
})

// Follow a user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  const targetId = Number(req.params.id)
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' })
  try {
    await prisma.follow.create({ data: { followerId: req.user.id, followingId: targetId } })
    res.json({ following: true })
  } catch {
    res.status(409).json({ error: 'Already following' })
  }
})

// Unfollow a user
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  await prisma.follow.deleteMany({ where: { followerId: req.user.id, followingId: Number(req.params.id) } })
  res.json({ following: false })
})

// Check follow status for current user
router.get('/:id/follow-status', authMiddleware, async (req, res) => {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.user.id, followingId: Number(req.params.id) } }
  })
  res.json({ following: !!follow })
})

// legacy by id
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: { ...PUBLIC_FIELDS, submissions: { where: { status: 'evaluated' }, orderBy: { aiScore: 'desc' }, take: 5, include: { challenge: { select: { title: true, trickName: true } } } } }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

export default router
