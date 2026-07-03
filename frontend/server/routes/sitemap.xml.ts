export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'application/xml')

  const base = 'https://kickon.ru'
  const now = new Date().toISOString().slice(0, 10)

  const staticPages = [
    { url: '/',            priority: '1.0', changefreq: 'daily' },
    { url: '/challenges',  priority: '0.9', changefreq: 'hourly' },
    { url: '/leaderboard', priority: '0.8', changefreq: 'hourly' },
    { url: '/parks',       priority: '0.7', changefreq: 'weekly' },
    { url: '/learn',       priority: '0.6', changefreq: 'weekly' },
    { url: '/coaching',    priority: '0.6', changefreq: 'weekly' },
    { url: '/news',        priority: '0.6', changefreq: 'daily' },
    { url: '/select',      priority: '0.5', changefreq: 'monthly' },
  ]

  const urls = staticPages.map(p => `
  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
})
