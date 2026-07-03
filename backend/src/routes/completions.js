import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { verifyPhotoWithAI } from '../services/ai.js'
import { sendPushToUser } from './push.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_, file, cb) => {
    cb(null, `completion-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })

// Submit photo proof for a challenge
router.post('/:challengeId', authMiddleware, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Photo required' })

  const challengeId = Number(req.params.challengeId)
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { city: true }
  })
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

  // Check not already completed
  const existing = await prisma.completion.findUnique({
    where: { userId_challengeId: { userId: req.user.id, challengeId } }
  })
  if (existing) return res.status(400).json({ error: 'Already submitted' })

  const photoUrl = `/uploads/${req.file.filename}`
  const completion = await prisma.completion.create({
    data: { userId: req.user.id, challengeId, photoUrl, status: 'pending' }
  })

  res.status(201).json({ id: completion.id, status: 'pending' })

  // AI verify in background
  setImmediate(async () => {
    try {
      const result = await verifyPhotoWithAI(req.file.path, challenge.title, challenge.description, challenge.city.name)
      await prisma.completion.update({
        where: { id: completion.id },
        data: {
          aiVerified: result.verified,
          aiScore: result.score ?? result.confidence,
          aiFeedback: result.feedback,
          aiDetails: JSON.stringify({ strengths: result.strengths, improvements: result.improvements }),
          status: result.verified ? 'approved' : 'rejected',
        }
      })

      if (result.verified) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { points: { increment: challenge.xp } }
        })
        await updateUserLevel(req.user.id)
        sendPushToUser(req.user.id, {
          title: '✅ Задание выполнено!',
          body: `${challenge.title} — +${challenge.xp} XP`,
          url: `/cities/${challenge.cityId}`,
        }).catch(() => {})
      }
    } catch (e) {
      console.error('AI verify failed:', e.message)
      // Leave as pending for manual moderation
    }
  })
})

// Poll status of one completion (for AI result)
router.get('/check/:id', authMiddleware, async (req, res) => {
  const completion = await prisma.completion.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id },
  })
  if (!completion) return res.status(404).json({ error: 'Not found' })
  res.json({ status: completion.status, aiScore: completion.aiScore, aiFeedback: completion.aiFeedback, aiVerified: completion.aiVerified, aiDetails: completion.aiDetails })
})

// Community feed — recent approved completions
router.get('/feed', async (req, res) => {
  const completions = await prisma.completion.findMany({
    where: { status: 'approved' },
    include: {
      user: { select: { id: true, username: true } },
      challenge: { include: { city: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(completions)
})

// My completions
router.get('/my', authMiddleware, async (req, res) => {
  const completions = await prisma.completion.findMany({
    where: { userId: req.user.id },
    include: { challenge: { include: { city: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(completions)
})

async function updateUserLevel(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } })
  const levels = [
    { min: 0,    name: 'Новичок' },
    { min: 200,  name: 'Путешественник' },
    { min: 600,  name: 'Исследователь' },
    { min: 1500, name: 'Бывалый' },
    { min: 3000, name: 'Знаток' },
    { min: 6000, name: 'Легенда' },
    { min: 10000,name: 'Амбассадор' },
  ]
  const level = [...levels].reverse().find(l => user.points >= l.min)?.name ?? 'Новичок'
  await prisma.user.update({ where: { id: userId }, data: { level } })
}

export default router
