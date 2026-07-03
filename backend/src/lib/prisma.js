import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

// SQLite performance: WAL mode allows concurrent reads alongside writes
prisma.$connect().then(() =>
  Promise.all([
    prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL'),
    prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL'),
    prisma.$queryRawUnsafe('PRAGMA cache_size=10000'),
    prisma.$queryRawUnsafe('PRAGMA temp_store=MEMORY'),
    prisma.$queryRawUnsafe('PRAGMA mmap_size=268435456'),
  ])
).catch(err => console.error('SQLite pragma error:', err))
