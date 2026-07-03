import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import cityRoutes from './routes/cities.js'
import completionRoutes from './routes/completions.js'
import challengeRoutes from './routes/challenges.js'
import userRoutes from './routes/users.js'
import pushRoutes from './routes/push.js'
import adminRoutes from './routes/admin.js'
import postRoutes from './routes/posts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)

const PORT = process.env.PORT || 3002

function isAllowedOrigin(origin, callback) {
  if (!origin) return callback(null, true)
  const allowed = ['capacitor://localhost', 'http://localhost'].includes(origin)
    || /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
  callback(null, allowed)
}

export const io = new Server(httpServer, {
  cors: { origin: isAllowedOrigin, credentials: true },
  transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
  socket.join('forum')
})

app.use(cors({ origin: isAllowedOrigin, credentials: true }))
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/images', express.static(path.join(__dirname, '../public/images')))

app.use('/api/auth', authRoutes)
app.use('/api/cities', cityRoutes)
app.use('/api/completions', completionRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/push', pushRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/posts', postRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Travel Challenges backend running on http://localhost:${PORT}`)
})
