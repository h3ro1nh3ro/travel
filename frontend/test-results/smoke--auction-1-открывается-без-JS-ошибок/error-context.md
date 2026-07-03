# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> [/auction/1] открывается без JS-ошибок
- Location: tests/smoke.spec.ts:85:3

# Error details

```
Error: Failed to load resource: the server responded with a status of 429 () | Failed to load resource: the server responded with a status of 401 () | [pageerror] solveSimpleChallenge is not defined

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 3
Received array:  ["Failed to load resource: the server responded with a status of 429 ()", "Failed to load resource: the server responded with a status of 401 ()", "[pageerror] solveSimpleChallenge is not defined"]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - separator [ref=e3]
  - iframe [ref=e8]:
    - generic [ref=f2e2]:
      - generic [ref=f2e3]:
        - checkbox "I'm not a robot" [ref=f2e7]
        - generic [ref=f2e11]: I'm not a robot
      - generic [ref=f2e15]: reCAPTCHA
  - separator [ref=e9]
  - generic [ref=e10]:
    - text: About this page
    - text: Our systems have detected unusual traffic from your computer network. This page checks to see if it's really you sending the requests, and not a robot.
    - link "Why did this happen?" [ref=e11] [cursor=pointer]:
      - /url: "#"
    - generic [ref=e12]:
      - text: "IP address: 89.19.217.68"
      - text: "Time: 2026-06-17T23:16:15Z"
      - text: "URL: https://www.google.com/search?q=%D1%81%D1%82%D0%BE%D0%BF&oq=%D1%81%D1%82%D0%BE%D0%BF&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBBzY3M2owajSoAgCwAgA&sourceid=chrome&ie=UTF-8&sei=viozapDfPILwi-gPzJKDoAM"
```

# Test source

```ts
  1   | import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'
  2   | 
  3   | // ─── Routes ──────────────────────────────────────────────────────────────────
  4   | const ROUTES = [
  5   |   '/select', '/menu', '/challenges', '/video',
  6   |   '/leaderboard', '/news', '/parks', '/skate',
  7   |   '/auction', '/auction/1', '/profile',
  8   |   '/championship', '/market', '/run', '/auth',
  9   | ]
  10  | 
  11  | // ─── Errors that are expected without a running backend ──────────────────────
  12  | const IGNORED_PATTERNS = [
  13  |   'favicon',
  14  |   'ERR_CONNECTION_REFUSED',
  15  |   'Failed to fetch',
  16  |   'NetworkError',
  17  |   'net::ERR',
  18  |   'bad HTTP response code',  // 404 for script (socket.io etc.)
  19  |   '(404)',
  20  |   // localStorage-based category causes SSR ↔ client mismatch in dev — not a crash
  21  |   'Hydration completed but contains mismatches',
  22  |   'Hydration node mismatch',
  23  |   '[Vue warn]',
  24  | ]
  25  | 
  26  | function isIgnored(text: string) {
  27  |   return IGNORED_PATTERNS.some(p => text.includes(p))
  28  | }
  29  | 
  30  | function collectErrors(page: Page): string[] {
  31  |   const errors: string[] = []
  32  |   page.on('console', (msg: ConsoleMessage) => {
  33  |     if (msg.type() === 'error') {
  34  |       const text = msg.text()
  35  |       if (!isIgnored(text)) errors.push(text)
  36  |     }
  37  |   })
  38  |   page.on('pageerror', (err: Error) => {
  39  |     if (!isIgnored(err.message)) errors.push(`[pageerror] ${err.message}`)
  40  |   })
  41  |   return errors
  42  | }
  43  | 
  44  | /** Dismiss both Vite error overlay and any app-level fixed modal */
  45  | async function dismissAll(page: Page) {
  46  |   // 1. Vite error overlay
  47  |   const viteOverlay = page.locator('vite-error-overlay')
  48  |   if (await viteOverlay.count() > 0) {
  49  |     await page.keyboard.press('Escape')
  50  |     await page.waitForTimeout(150)
  51  |     await page.evaluate(() => {
  52  |       document.querySelectorAll('vite-error-overlay').forEach(el => el.remove())
  53  |     })
  54  |   }
  55  |   // 2. App-level fixed modals (intro, create-room, etc.) — click self-close backdrop
  56  |   await page.evaluate(() => {
  57  |     // Remove elements that have fixed inset-0 and a dark backdrop
  58  |     document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach(el => {
  59  |       // Don't remove the Nuxt page root itself
  60  |       if (el.children.length > 0 && (el.style.background || el.className.includes('bg-'))) {
  61  |         el.remove()
  62  |       }
  63  |     })
  64  |   })
  65  |   await page.waitForTimeout(100)
  66  | }
  67  | 
  68  | /** Seed localStorage so first-run modals don't appear */
  69  | async function seedStorage(page: Page) {
  70  |   await page.evaluate(() => {
  71  |     localStorage.setItem('skate-intro-seen', '1')
  72  |   })
  73  | }
  74  | 
  75  | // ─── Splash ───────────────────────────────────────────────────────────────────
  76  | test('splash screen loads without crash', async ({ page }) => {
  77  |   const errors = collectErrors(page)
  78  |   await page.goto('/')
  79  |   await expect(page.locator('body')).toBeVisible()
  80  |   expect(errors).toHaveLength(0)
  81  | })
  82  | 
  83  | // ─── Every route opens ────────────────────────────────────────────────────────
  84  | for (const path of ROUTES) {
  85  |   test(`[${path}] открывается без JS-ошибок`, async ({ page }) => {
  86  |     const errors = collectErrors(page)
  87  |     await page.goto(path)
  88  |     await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {})
  89  |     const body = await page.locator('body').textContent()
  90  |     expect(body?.trim().length, `пустая страница: ${path}`).toBeGreaterThan(10)
> 91  |     expect(errors, errors.join(' | ')).toHaveLength(0)
      |                                        ^ Error: Failed to load resource: the server responded with a status of 429 () | Failed to load resource: the server responded with a status of 401 () | [pageerror] solveSimpleChallenge is not defined
  92  |   })
  93  | }
  94  | 
  95  | // ─── Bottom nav ───────────────────────────────────────────────────────────────
  96  | test('нижняя навигация — все кнопки ведут на рабочую страницу', async ({ page }) => {
  97  |   // Mobile bottom nav has 3 links: challenges, video, profile
  98  |   const navRoutes = ['/challenges', '/video', '/profile', '/menu']
  99  | 
  100 |   for (const path of navRoutes) {
  101 |     const errors = collectErrors(page)
  102 |     await page.goto(path)
  103 |     await page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => {})
  104 |     const body = await page.locator('body').textContent()
  105 |     expect(body?.trim().length, `пустая страница: ${path}`).toBeGreaterThan(10)
  106 |     expect(errors, `errors on ${path}: ${errors.join(' | ')}`).toHaveLength(0)
  107 |   }
  108 | })
  109 | 
  110 | // ─── Challenge cards ──────────────────────────────────────────────────────────
  111 | test('челленджи — карточки рендерятся', async ({ page }) => {
  112 |   await page.goto('/challenges')
  113 |   await page.waitForLoadState('networkidle').catch(() => {})
  114 |   const count = await page.locator('[class*="font-display"]').count()
  115 |   expect(count).toBeGreaterThan(0)
  116 | })
  117 | 
  118 | // ─── Challenges — КАК ИГРАТЬ dropdown ────────────────────────────────────────
  119 | test('челленджи — КАК ИГРАТЬ открывается и закрывается', async ({ page }) => {
  120 |   const errors = collectErrors(page)
  121 |   await page.goto('/challenges')
  122 |   await page.waitForLoadState('networkidle').catch(() => {})
  123 |   await dismissAll(page)
  124 | 
  125 |   const btn = page.locator('button').filter({ hasText: /как играть/i }).first()
  126 |   await expect(btn).toBeVisible()
  127 |   await btn.click()
  128 |   await page.waitForTimeout(400)
  129 |   await expect(page.getByText('ЧТО ТАКОЕ ЧЕЛЛЕНДЖ')).toBeVisible()
  130 | 
  131 |   await btn.click()
  132 |   await page.waitForTimeout(400)
  133 |   await expect(page.getByText('ЧТО ТАКОЕ ЧЕЛЛЕНДЖ')).toBeHidden()
  134 |   expect(errors).toHaveLength(0)
  135 | })
  136 | 
  137 | // ─── Challenges — ТОП НЕДЕЛИ dropdown ────────────────────────────────────────
  138 | test('челленджи — ТОП НЕДЕЛИ открывается', async ({ page }) => {
  139 |   const errors = collectErrors(page)
  140 |   await page.goto('/challenges')
  141 |   await page.waitForLoadState('networkidle').catch(() => {})
  142 |   await dismissAll(page)
  143 | 
  144 |   const btn = page.locator('button').filter({ hasText: /ТОП НЕДЕЛИ/i }).first()
  145 |   await expect(btn).toBeVisible()
  146 |   await btn.click()
  147 |   await page.waitForTimeout(400)
  148 |   // Leaderboard entries have truncate class on username
  149 |   await expect(page.locator('p.truncate').first()).toBeVisible()
  150 |   expect(errors).toHaveLength(0)
  151 | })
  152 | 
  153 | // ─── Auction — navigate to lot detail ────────────────────────────────────────
  154 | test('аукцион — клик по лоту открывает детальную страницу', async ({ page }) => {
  155 |   const errors = collectErrors(page)
  156 |   await page.goto('/auction')
  157 |   await page.waitForLoadState('networkidle').catch(() => {})
  158 |   await dismissAll(page)
  159 | 
  160 |   const link = page.locator('a[href^="/auction/"]').first()
  161 |   await expect(link).toBeVisible()
  162 |   await link.click()
  163 |   await page.waitForURL(/\/auction\/\d+/, { timeout: 5_000 })
  164 |   await expect(page.getByText('СДЕЛАТЬ СТАВКУ')).toBeVisible()
  165 |   expect(errors).toHaveLength(0)
  166 | })
  167 | 
  168 | // ─── Auction — place bid ──────────────────────────────────────────────────────
  169 | test('аукцион — ставка принимается', async ({ page }) => {
  170 |   await page.goto('/auction/1')
  171 |   await page.waitForLoadState('networkidle').catch(() => {})
  172 |   await dismissAll(page)
  173 | 
  174 |   await page.getByText('СДЕЛАТЬ СТАВКУ').click()
  175 |   const input = page.locator('input[type=number]')
  176 |   await expect(input).toBeVisible()
  177 | 
  178 |   const placeholder = await input.getAttribute('placeholder') ?? ''
  179 |   const minBid = parseInt(placeholder.replace(/\D/g, ''), 10) || 10000
  180 |   await input.fill(String(minBid + 500))
  181 |   await page.locator('button').filter({ hasText: 'ОК' }).click()
  182 |   await expect(page.locator('text=Ставка').first()).toBeVisible({ timeout: 3_000 })
  183 | })
  184 | 
  185 | // ─── Skate — КАК ИГРАТЬ (skip intro modal) ───────────────────────────────────
  186 | test('скейт — КАК ИГРАТЬ открывается', async ({ page }) => {
  187 |   const errors = collectErrors(page)
  188 |   await page.goto('/skate')
  189 |   await page.waitForLoadState('networkidle').catch(() => {})
  190 |   // Seed localStorage AFTER page load so Nuxt hydration doesn't interfere
  191 |   await seedStorage(page)
```