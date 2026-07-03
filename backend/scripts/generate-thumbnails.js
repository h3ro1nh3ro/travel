#!/usr/bin/env node
// Run: node scripts/generate-thumbnails.js
// Generates thumbnails for all submissions without thumbnailUrl
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const uploadsDir = path.join(__dirname, '../uploads')

async function main() {
  const subs = await prisma.submission.findMany({
    where: { thumbnailUrl: null },
    select: { id: true, videoUrl: true },
  })
  console.log(`Found ${subs.length} submissions without thumbnails`)

  let done = 0, skipped = 0
  for (const sub of subs) {
    const filename = path.basename(sub.videoUrl)
    const filePath = path.join(uploadsDir, filename)
    if (!fs.existsSync(filePath)) { skipped++; continue }

    const ext = path.extname(filename).toLowerCase()
    if (!['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'].includes(ext)) { skipped++; continue }

    const thumbName = `thumb_${path.basename(filename, ext)}.jpg`
    const thumbPath = path.join(uploadsDir, thumbName)

    try {
      execSync(
        `ffmpeg -ss 0.5 -i "${filePath}" -vf "scale=480:-2" -frames:v 1 -q:v 3 "${thumbPath}" -y`,
        { stdio: 'pipe' }
      )
      await prisma.submission.update({
        where: { id: sub.id },
        data: { thumbnailUrl: `/uploads/${thumbName}` },
      })
      done++
      process.stdout.write(`\r[${done + skipped}/${subs.length}] ${thumbName}`)
    } catch (e) {
      skipped++
    }
  }
  console.log(`\nDone: ${done} thumbnails, ${skipped} skipped`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
