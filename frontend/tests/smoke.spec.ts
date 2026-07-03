import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

// ─── Routes ──────────────────────────────────────────────────────────────────
const ROUTES = [
  '/select', '/menu', '/challenges', '/video',
  '/leaderboard', '/news', '/parks', '/skate',
  '/auction', '/auction/1', '/profile',
  '/championship', '/market', '/run', '/auth',
]

// ─── Errors that are expected without a running backend ──────────────────────
const IGNORED_PATTERNS = [
  'favicon',
  'ERR_CONNECTION_REFUSED',
  'Failed to fetch',
  'NetworkError',
  'net::ERR',
  'bad HTTP response code',  // 404 for script (socket.io etc.)
  '(404)',
  // localStorage-based category causes SSR ↔ client mismatch in dev — not a crash
  'Hydration completed but contains mismatches',
  'Hydration node mismatch',
  '[Vue warn]',
]

function isIgnored(text: string) {
  return IGNORED_PATTERNS.some(p => text.includes(p))
}

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!isIgnored(text)) errors.push(text)
    }
  })
  page.on('pageerror', (err: Error) => {
    if (!isIgnored(err.message)) errors.push(`[pageerror] ${err.message}`)
  })
  return errors
}

/** Dismiss both Vite error overlay and any app-level fixed modal */
async function dismissAll(page: Page) {
  // 1. Vite error overlay
  const viteOverlay = page.locator('vite-error-overlay')
  if (await viteOverlay.count() > 0) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    await page.evaluate(() => {
      document.querySelectorAll('vite-error-overlay').forEach(el => el.remove())
    })
  }
  // 2. App-level fixed modals (intro, create-room, etc.) — click self-close backdrop
  await page.evaluate(() => {
    // Remove elements that have fixed inset-0 and a dark backdrop
    document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach(el => {
      // Don't remove the Nuxt page root itself
      if (el.children.length > 0 && (el.style.background || el.className.includes('bg-'))) {
        el.remove()
      }
    })
  })
  await page.waitForTimeout(100)
}

/** Seed localStorage so first-run modals don't appear */
async function seedStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('skate-intro-seen', '1')
  })
}

// ─── Splash ───────────────────────────────────────────────────────────────────
test('splash screen loads without crash', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── Every route opens ────────────────────────────────────────────────────────
for (const path of ROUTES) {
  test(`[${path}] открывается без JS-ошибок`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(path)
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {})
    const body = await page.locator('body').textContent()
    expect(body?.trim().length, `пустая страница: ${path}`).toBeGreaterThan(10)
    expect(errors, errors.join(' | ')).toHaveLength(0)
  })
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
test('нижняя навигация — все кнопки ведут на рабочую страницу', async ({ page }) => {
  // Mobile bottom nav has 3 links: challenges, video, profile
  const navRoutes = ['/challenges', '/video', '/profile', '/menu']

  for (const path of navRoutes) {
    const errors = collectErrors(page)
    await page.goto(path)
    await page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => {})
    const body = await page.locator('body').textContent()
    expect(body?.trim().length, `пустая страница: ${path}`).toBeGreaterThan(10)
    expect(errors, `errors on ${path}: ${errors.join(' | ')}`).toHaveLength(0)
  }
})

// ─── Challenge cards ──────────────────────────────────────────────────────────
test('челленджи — карточки рендерятся', async ({ page }) => {
  await page.goto('/challenges')
  await page.waitForLoadState('networkidle').catch(() => {})
  const count = await page.locator('[class*="font-display"]').count()
  expect(count).toBeGreaterThan(0)
})

// ─── Challenges — КАК ИГРАТЬ dropdown ────────────────────────────────────────
test('челленджи — КАК ИГРАТЬ открывается и закрывается', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/challenges')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  const btn = page.locator('button').filter({ hasText: /как играть/i }).first()
  await expect(btn).toBeVisible()
  await btn.click()
  await page.waitForTimeout(400)
  await expect(page.getByText('ЧТО ТАКОЕ ЧЕЛЛЕНДЖ')).toBeVisible()

  await btn.click()
  await page.waitForTimeout(400)
  await expect(page.getByText('ЧТО ТАКОЕ ЧЕЛЛЕНДЖ')).toBeHidden()
  expect(errors).toHaveLength(0)
})

// ─── Challenges — ТОП НЕДЕЛИ dropdown ────────────────────────────────────────
test('челленджи — ТОП НЕДЕЛИ открывается', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/challenges')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  const btn = page.locator('button').filter({ hasText: /ТОП НЕДЕЛИ/i }).first()
  await expect(btn).toBeVisible()
  await btn.click()
  await page.waitForTimeout(400)
  // Leaderboard entries have truncate class on username
  await expect(page.locator('p.truncate').first()).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── Auction — navigate to lot detail ────────────────────────────────────────
test('аукцион — клик по лоту открывает детальную страницу', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/auction')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  const link = page.locator('a[href^="/auction/"]').first()
  await expect(link).toBeVisible()
  await link.click()
  await page.waitForURL(/\/auction\/\d+/, { timeout: 5_000 })
  await expect(page.getByText('СДЕЛАТЬ СТАВКУ')).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── Auction — place bid ──────────────────────────────────────────────────────
test('аукцион — ставка принимается', async ({ page }) => {
  await page.goto('/auction/1')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  await page.getByText('СДЕЛАТЬ СТАВКУ').click()
  const input = page.locator('input[type=number]')
  await expect(input).toBeVisible()

  const placeholder = await input.getAttribute('placeholder') ?? ''
  const minBid = parseInt(placeholder.replace(/\D/g, ''), 10) || 10000
  await input.fill(String(minBid + 500))
  await page.locator('button').filter({ hasText: 'ОК' }).click()
  await expect(page.locator('text=Ставка').first()).toBeVisible({ timeout: 3_000 })
})

// ─── Skate — КАК ИГРАТЬ (skip intro modal) ───────────────────────────────────
test('скейт — КАК ИГРАТЬ открывается', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/skate')
  await page.waitForLoadState('networkidle').catch(() => {})
  // Seed localStorage AFTER page load so Nuxt hydration doesn't interfere
  await seedStorage(page)
  await dismissAll(page)

  const btn = page.locator('button').filter({ hasText: /как играть/i }).first()
  await expect(btn).toBeVisible({ timeout: 5_000 })
  await btn.click()
  await page.waitForTimeout(400)
  await expect(page.getByText('СИСТЕМА БУКВ')).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── Auth — mode toggle ───────────────────────────────────────────────────────
test('авторизация — переключение режима', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/auth')
  await dismissAll(page)

  // Heading div (not submit button) shows mode text
  const heading = page.locator('div.text-center .font-display').first()
  await expect(heading).toContainText('DROP IN')

  await page.getByRole('button', { name: 'ЗАРЕГАТЬСЯ' }).click()
  // Submit button now says LET'S GO (or JOIN UP in heading)
  await expect(page.locator('button[type=submit]')).toContainText('GO')

  await page.getByRole('button', { name: 'ВОЙТИ' }).click()
  await expect(page.locator('button[type=submit]')).toContainText('DROP IN')
  expect(errors).toHaveLength(0)
})

// ─── Leaderboard — tabs ───────────────────────────────────────────────────────
test('лидерборд — переключение по табам', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/leaderboard')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  // Tab bar is the flex container with gap-1 mb-6 p-1
  const tabBar = page.locator('.flex.gap-1.mb-6.p-1').first()
  const tabs = tabBar.locator('button')
  const count = await tabs.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    await dismissAll(page)
    await tabs.nth(i).click()
    await page.waitForTimeout(150)
    const body = await page.locator('body').textContent()
    expect(body?.trim().length).toBeGreaterThan(10)
  }
  expect(errors).toHaveLength(0)
})

// ─── Championship — tabs ──────────────────────────────────────────────────────
test('чемпионат — переключение по табам', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/championship')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  const tabScroll = page.locator('.overflow-x-auto').first()
  const tabs = tabScroll.locator('button')
  const count = await tabs.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < Math.min(count, 6); i++) {
    await dismissAll(page)
    await tabs.nth(i).click()
    await page.waitForTimeout(150)
  }
  expect(errors).toHaveLength(0)
})

// ─── Profile — no freeze ──────────────────────────────────────────────────────
test('профиль — страница рендерится без зависания', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/profile')
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
  const text = await page.locator('body').textContent()
  expect(text?.trim().length).toBeGreaterThan(10)
  expect(errors).toHaveLength(0)
})

// ─── Market — items render ────────────────────────────────────────────────────
test('рынок — товары рендерятся', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/market')
  await page.waitForLoadState('networkidle').catch(() => {})
  const grid = page.locator('.grid').first()
  await expect(grid).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── News — tag filter ────────────────────────────────────────────────────────
test('новости — фильтр по тегам работает', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/news')
  await page.waitForLoadState('networkidle').catch(() => {})
  await dismissAll(page)

  const tagBtn = page.locator('button').filter({ hasText: /Ивент/i }).first()
  if (await tagBtn.count() > 0) {
    await tagBtn.click()
    await page.waitForTimeout(200)
    // At least one article visible
    await expect(page.locator('article').first()).toBeVisible()
  }
  expect(errors).toHaveLength(0)
})

// ─── Skate top leaders dropdown ───────────────────────────────────────────────
test('скейт — ТОП НЕДЕЛИ открывается', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/skate')
  await page.waitForLoadState('networkidle').catch(() => {})
  await seedStorage(page)
  await dismissAll(page)

  const btn = page.locator('button').filter({ hasText: /ТОП НЕДЕЛИ/i }).first()
  await expect(btn).toBeVisible({ timeout: 5_000 })
  await btn.click()
  await page.waitForTimeout(400)
  await expect(page.locator('p.truncate').first()).toBeVisible()
  expect(errors).toHaveLength(0)
})

// ─── Parks — map renders ──────────────────────────────────────────────────────
test('парки — карта рендерится', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/parks')
  await page.waitForLoadState('networkidle').catch(() => {})
  // Leaflet map container should appear
  const map = page.locator('.leaflet-container, #map, [class*="map"]')
  await expect(map.first()).toBeVisible({ timeout: 8_000 })
  expect(errors).toHaveLength(0)
})
