<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl tracking-widest leading-none" :style="{ color: 'var(--t-text)' }">
        ЛЕН<span style="color:var(--t-hi)">ТА</span>
      </h1>
      <p class="font-condensed text-xs uppercase tracking-widest mt-0.5" :style="{ color: 'var(--t-muted)' }">
        Выполненные задания сообщества
      </p>
    </div>

    <!-- Filters by category -->
    <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
      <button v-for="cat in catFilters" :key="cat.id"
        @click="activeCat = cat.id"
        class="font-display text-xs uppercase tracking-widest px-3 py-1.5 whitespace-nowrap shrink-0 transition-all active:scale-95"
        :style="activeCat === cat.id
          ? { background: cat.color, color: '#000', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }
          : { background: 'var(--t-card)', color: cat.color, border: `1px solid ${cat.color}40`, clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
      >{{ cat.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-40 animate-pulse" :style="{ background: 'var(--t-card)' }" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered?.length" class="py-20 text-center">
      <div class="font-display text-5xl mb-3 opacity-10" :style="{ color: 'var(--t-text)' }">ПУСТО</div>
      <p class="font-condensed text-sm" :style="{ color: 'var(--t-muted)' }">Пока никто не выполнил задания. Будь первым!</p>
    </div>

    <!-- Feed items -->
    <div v-else class="flex flex-col gap-4">
      <div v-for="item in filtered" :key="item.id"
        class="overflow-hidden transition-all"
        :style="{ background: 'var(--t-card)', border: `1px solid var(--t-border)`, clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
      >
        <!-- Photo -->
        <div v-if="item.photoUrl" class="relative" style="height:200px">
          <img :src="apiBase + item.photoUrl" :alt="item.challenge?.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)" />
          <!-- Category badge -->
          <div class="absolute top-2 left-2">
            <span class="font-condensed text-[10px] uppercase tracking-widest px-2 py-0.5"
              :style="{ background: catColor(item.challenge?.category) + 'ee', color: '#000', clipPath: 'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)' }"
            >{{ item.challenge?.category }}</span>
          </div>
          <!-- XP badge -->
          <div class="absolute top-2 right-2 font-display text-base px-2 py-0.5"
            style="background:var(--t-hi);color:#000;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
          >+{{ item.challenge?.xp }} xp</div>
          <!-- Challenge name over photo -->
          <div class="absolute bottom-3 left-3 right-3">
            <p class="font-display text-lg leading-tight text-white">{{ item.challenge?.title }}</p>
            <p class="font-condensed text-xs" style="color:rgba(255,255,255,0.6)">{{ item.challenge?.city?.name }}</p>
          </div>
        </div>

        <div class="px-4 py-3">
          <!-- User row -->
          <div class="flex items-center gap-2.5 mb-3">
            <div class="w-8 h-8 flex items-center justify-center font-display text-sm shrink-0"
              :style="{ background: avatarColor(item.user?.username), color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
            >{{ item.user?.username?.[0]?.toUpperCase() }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ item.user?.username }}</p>
              <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ formatDate(item.createdAt) }}</p>
            </div>
            <NuxtLink :to="`/challenges/${item.challengeId}`"
              class="font-display text-xs px-3 py-1.5 shrink-0 transition-all active:scale-95"
              :style="{ background: 'var(--t-panel)', color: 'var(--t-hi)', border: '1px solid color-mix(in srgb, var(--t-hi) 19%, transparent)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
            >→ ПОДРОБНЕЕ</NuxtLink>
          </div>

          <!-- AI assessment -->
          <div v-if="item.aiFeedback || item.aiScore" class="flex flex-col gap-2">
            <!-- Score row -->
            <div v-if="item.aiScore" class="flex items-center gap-2">
              <div class="font-display text-lg px-2.5 py-0.5 shrink-0"
                :style="scoreStyle(item.aiScore)"
              >{{ Math.round(item.aiScore) }}</div>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background:var(--t-border)">
                <div class="h-full rounded-full transition-all"
                  :style="{ width: item.aiScore + '%', background: scoreColor(item.aiScore) }"
                />
              </div>
              <span class="font-condensed text-xs shrink-0" :style="{ color: 'var(--t-muted)' }">/ 100</span>
            </div>
            <!-- Feedback text -->
            <div v-if="item.aiFeedback" class="px-3 py-2"
              :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
            >
              <p class="font-condensed text-xs leading-relaxed" :style="{ color: 'var(--t-muted)' }">
                <span style="color:var(--t-hi)">AI: </span>{{ item.aiFeedback }}
              </p>
            </div>
            <!-- Strengths / improvements -->
            <template v-if="parsedDetails(item)">
              <div v-if="parsedDetails(item).strengths?.length" class="flex flex-wrap gap-1">
                <span v-for="s in parsedDetails(item).strengths" :key="s"
                  class="font-condensed text-[10px] px-2 py-0.5"
                  style="background:color-mix(in srgb, var(--t-hi) 8%, transparent);color:var(--t-hi);border:1px solid color-mix(in srgb, var(--t-hi) 19%, transparent);clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
                >✓ {{ s }}</span>
              </div>
              <div v-if="parsedDetails(item).improvements?.length" class="flex flex-wrap gap-1">
                <span v-for="imp in parsedDetails(item).improvements" :key="imp"
                  class="font-condensed text-[10px] px-2 py-0.5"
                  style="background:#F0BB7215;color:#F0BB72;border:1px solid #F0BB7230;clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
                >→ {{ imp }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Лента — Travel Challenges' })

const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string).replace('/api', '')

const activeCat = ref('all')

const catFilters = [
  { id: 'all',      label: 'Все',       color: 'var(--t-hi)' },
  { id: 'История',  label: 'История',   color: '#F0BB72' },
  { id: 'Гастро',   label: 'Гастро',   color: '#EE8888' },
  { id: 'Спорт',    label: 'Спорт',    color: '#88AAEE' },
  { id: 'Арт',      label: 'Арт',      color: '#B490F0' },
  { id: 'Природа',  label: 'Природа',  color: '#7CC89A' },
]

const catColorMap: Record<string, string> = {
  'История': '#F0BB72', 'Гастро': '#EE8888', 'Спорт': '#88AAEE',
  'Арт': '#B490F0', 'Природа': '#7CC89A',
}
function catColor(cat: string) { return catColorMap[cat] ?? 'var(--t-hi)' }

const AVATAR_COLORS = ['var(--t-hi)', '#F0BB72', '#B490F0', '#88AAEE', '#EE8888', '#7CC89A']
function avatarColor(username: string = '') {
  let h = 0
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

function scoreColor(score: number) {
  if (score >= 80) return 'var(--t-hi)'
  if (score >= 60) return '#F0BB72'
  return '#EE8888'
}

function scoreStyle(score: number) {
  const color = scoreColor(score)
  return { background: color + '20', color, border: `1px solid ${color}50`, clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
}

function parsedDetails(item: any) {
  if (!item.aiDetails) return null
  try { return JSON.parse(item.aiDetails) } catch { return null }
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = Date.now()
  const diff = now - date.getTime()
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const { data: feed, pending } = useAsyncData('feed', async () => {
  const res = await fetch(`${config.public.apiBase}/completions/feed`)
  if (!res.ok) return []
  return res.json() as Promise<any[]>
}, { server: false })

const filtered = computed(() => {
  if (!feed.value) return []
  if (activeCat.value === 'all') return feed.value
  return feed.value.filter(i => i.challenge?.category === activeCat.value)
})
</script>
