import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Никнейм и пароль обязательны' })
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Никнейм минимум 3 символа' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль минимум 6 символов' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, password: hash },
      select: { id: true, username: true, points: true, level: true }
    })
    const token = signToken({ id: user.id, username: user.username })
    res.status(201).json({ user, token })
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Никнейм уже занят' })
    }
    res.status(500).json({ error: 'Ошибка регистрации' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Никнейм и пароль обязательны' })
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверный никнейм или пароль' })
    }
    const token = signToken({ id: user.id, username: user.username, role: user.role })
    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch {
    res.status(500).json({ error: 'Ошибка входа' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, points: true, level: true, avatar: true, role: true, createdAt: true }
  })
  res.json(user)
})

export default router
