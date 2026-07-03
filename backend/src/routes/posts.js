import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = Router()

const AUTHOR_SELECT = { select: { id: true, username: true, level: true } }

router.get('/', optionalAuth, async (req, res) => {
  const { sort = 'new', tag } = req.query
  const where = tag && tag !== 'все' ? { tag } : {}

  const posts = await prisma.post.findMany({
    where,
    orderBy: sort === 'top' ? { upvotes: 'desc' } : { createdAt: 'desc' },
    include: { author: AUTHOR_SELECT, _count: { select: { comments: true } } },
  })

  if (sort === 'hot') {
    posts.sort((a, b) => {
      const score = (p) => {
        const age = (Date.now() - new Date(p.createdAt).getTime()) / 3600000
        return (p.upvotes - p.downvotes) / Math.pow(age + 2, 1.5)
      }
      return score(b) - score(a)
    })
  }

  const userId = req.user?.id ?? null
  let votes = []
  if (userId) {
    votes = await prisma.postVote.findMany({
      where: { userId, postId: { in: posts.map(p => p.id) } },
    })
  }

  const voteMap = Object.fromEntries(votes.map(v => [v.postId, v.value]))
  res.json(posts.map(p => ({ ...p, myVote: voteMap[p.id] ?? 0 })))
})

router.get('/:id', optionalAuth, async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      author: AUTHOR_SELECT,
      _count: { select: { comments: true } },
      comments: {
        where: { parentId: null },
        orderBy: { upvotes: 'desc' },
        include: {
          author: AUTHOR_SELECT,
          replies: { orderBy: { createdAt: 'asc' }, include: { author: AUTHOR_SELECT } },
        },
      },
    },
  })
  if (!post) return res.status(404).json({ error: 'Not found' })
  const userId = req.user?.id ?? null

  let postVote = 0
  let commentVotes = {}
  if (userId) {
    const pv = await prisma.postVote.findUnique({ where: { postId_userId: { postId: post.id, userId } } })
    postVote = pv?.value ?? 0

    const allCommentIds = [
      ...post.comments.map(c => c.id),
      ...post.comments.flatMap(c => c.replies.map(r => r.id)),
    ]
    const cvs = await prisma.commentVote.findMany({ where: { userId, commentId: { in: allCommentIds } } })
    commentVotes = Object.fromEntries(cvs.map(v => [v.commentId, v.value]))
  }

  const attachVote = (c) => ({ ...c, myVote: commentVotes[c.id] ?? 0 })
  res.json({
    ...post,
    myVote: postVote,
    comments: post.comments.map(c => ({ ...attachVote(c), replies: c.replies.map(attachVote) })),
  })
})

router.post('/', authMiddleware, async (req, res) => {
  const { title, body, tag } = req.body
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'title and body required' })
  const post = await prisma.post.create({
    data: { title: title.trim(), body: body.trim(), tag: tag || 'общее', authorId: req.user.id },
    include: { author: AUTHOR_SELECT, _count: { select: { comments: true } } },
  })
  res.json({ ...post, myVote: 0 })
})

router.put('/:id', authMiddleware, async (req, res) => {
  const postId = Number(req.params.id)
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return res.status(404).json({ error: 'Not found' })
  if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'forbidden' })
  }
  const { title, body, tag } = req.body
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'title and body required' })
  const updated = await prisma.post.update({
    where: { id: postId },
    data: { title: title.trim(), body: body.trim(), tag: tag || post.tag },
  })
  res.json(updated)
})

router.post('/:id/vote', authMiddleware, async (req, res) => {
  const postId = Number(req.params.id)
  const userId = req.user.id
  const value = Number(req.body.value)
  if (value !== 1 && value !== -1) return res.status(400).json({ error: 'value must be 1 or -1' })

  await prisma.$transaction(async (tx) => {
    const existing = await tx.postVote.findUnique({ where: { postId_userId: { postId, userId } } })
    if (existing) {
      if (existing.value === value) {
        await tx.postVote.delete({ where: { id: existing.id } })
        await tx.post.update({ where: { id: postId }, data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } } })
      } else {
        await tx.postVote.update({ where: { id: existing.id }, data: { value } })
        await tx.post.update({ where: { id: postId }, data: value === 1 ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } : { downvotes: { increment: 1 }, upvotes: { decrement: 1 } } })
      }
    } else {
      await tx.postVote.create({ data: { postId, userId, value } })
      await tx.post.update({ where: { id: postId }, data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } } })
    }
  })

  const post = await prisma.post.findUnique({ where: { id: postId } })
  const myVote = await prisma.postVote.findUnique({ where: { postId_userId: { postId, userId } } })
  res.json({ upvotes: post.upvotes, downvotes: post.downvotes, myVote: myVote?.value ?? 0 })
})

router.post('/:id/comments', authMiddleware, async (req, res) => {
  const { body, parentId } = req.body
  if (!body?.trim()) return res.status(400).json({ error: 'body required' })
  const comment = await prisma.comment.create({
    data: { body: body.trim(), postId: Number(req.params.id), authorId: req.user.id, parentId: parentId ? Number(parentId) : null },
    include: { author: AUTHOR_SELECT, replies: { include: { author: AUTHOR_SELECT } } },
  })
  res.json({ ...comment, myVote: 0 })
})

router.post('/comments/:id/vote', authMiddleware, async (req, res) => {
  const commentId = Number(req.params.id)
  const userId = req.user.id
  const value = Number(req.body.value)
  if (value !== 1 && value !== -1) return res.status(400).json({ error: 'value must be 1 or -1' })

  await prisma.$transaction(async (tx) => {
    const existing = await tx.commentVote.findUnique({ where: { commentId_userId: { commentId, userId } } })
    if (existing) {
      if (existing.value === value) {
        await tx.commentVote.delete({ where: { id: existing.id } })
        await tx.comment.update({ where: { id: commentId }, data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } } })
      } else {
        await tx.commentVote.update({ where: { id: existing.id }, data: { value } })
        await tx.comment.update({ where: { id: commentId }, data: value === 1 ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } : { downvotes: { increment: 1 }, upvotes: { decrement: 1 } } })
      }
    } else {
      await tx.commentVote.create({ data: { commentId, userId, value } })
      await tx.comment.update({ where: { id: commentId }, data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } } })
    }
  })

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  const myVote = await prisma.commentVote.findUnique({ where: { commentId_userId: { commentId, userId } } })
  res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes, myVote: myVote?.value ?? 0 })
})

const ALLOWED_EMOJIS = ['🔥', '❤️', '🌍']

router.post('/:id/react', authMiddleware, async (req, res) => {
  const postId = Number(req.params.id)
  const userId = req.user.id
  const { emoji } = req.body
  if (!ALLOWED_EMOJIS.includes(emoji)) return res.status(400).json({ error: 'Invalid emoji' })

  const existing = await prisma.feedReaction.findUnique({ where: { postId_userId: { postId, userId } } })
  if (existing) {
    if (existing.emoji === emoji) {
      await prisma.feedReaction.delete({ where: { id: existing.id } })
    } else {
      await prisma.feedReaction.update({ where: { id: existing.id }, data: { emoji } })
    }
  } else {
    await prisma.feedReaction.create({ data: { postId, userId, emoji } })
  }

  const counts = await prisma.feedReaction.groupBy({ by: ['emoji'], where: { postId }, _count: true })
  const myReaction = await prisma.feedReaction.findUnique({ where: { postId_userId: { postId, userId } } })
  res.json({ counts: Object.fromEntries(counts.map(c => [c.emoji, c._count])), myEmoji: myReaction?.emoji ?? null })
})

export default router
