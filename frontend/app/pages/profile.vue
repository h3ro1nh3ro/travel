<template>
  <div>
    <div v-if="!isLoggedIn" class="text-center py-12">
      <p class="font-condensed text-base mb-4" :style="{ color: 'var(--t-muted)' }">Войдите чтобы видеть профиль</p>
      <NuxtLink to="/auth" class="inline-block font-display text-xl tracking-widest px-6 py-3" style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)">
        ВОЙТИ
      </NuxtLink>
    </div>

    <template v-else-if="user">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 flex items-center justify-center font-display text-3xl shrink-0"
          style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >{{ user.username[0].toUpperCase() }}</div>
        <div>
          <h1 class="font-display text-2xl tracking-widest" :style="{ color: 'var(--t-text)' }">{{ user.username.toUpperCase() }}</h1>
          <p class="font-condensed text-sm" style="color:var(--t-hi)">{{ user.level }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center py-4"
          :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
        >
          <span class="font-display text-2xl leading-none" style="color:var(--t-hi)">{{ stat.value }}</span>
          <span class="font-condensed text-[10px] uppercase tracking-widest mt-1" :style="{ color: 'var(--t-muted)' }">{{ stat.label }}</span>
        </div>
      </div>

      <!-- XP progress -->
      <div class="p-4 mb-6" :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }">
        <div class="flex items-center justify-between mb-2">
          <span class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">До следующего уровня</span>
          <span class="font-condensed text-xs" style="color:var(--t-hi)">{{ user.points }} / {{ nextLevelXp }} XP</span>
        </div>
        <div class="h-2 w-full overflow-hidden" :style="{ background: 'var(--t-panel)' }">
          <div class="h-full transition-all" style="background:var(--t-hi)" :style="{ width: xpProgress + '%' }" />
        </div>
        <p class="font-condensed text-xs mt-2" :style="{ color: 'var(--t-muted)' }">Следующий: {{ nextLevel }}</p>
      </div>

      <!-- Recent completions -->
      <h2 class="font-display text-lg tracking-widest mb-3" :style="{ color: 'var(--t-text)' }">МОИ ЗАДАНИЯ</h2>

      <div v-if="completionsPending" class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-16 animate-pulse" :style="{ background: 'var(--t-card)' }" />
      </div>

      <div v-else-if="completions?.length" class="flex flex-col gap-2">
        <NuxtLink v-for="c in completions" :key="c.id" :to="`/challenges/${c.challengeId}`"
          class="flex items-center gap-3 p-3 transition-opacity active:opacity-70"
          :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
        >
          <div class="w-8 h-8 flex items-center justify-center shrink-0 font-display"
            :style="{ background: statusBg(c.status), color: c.status === 'approved' ? '#000' : '#fff', clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }"
          >{{ statusIcon(c.status) }}</div>
          <div class="flex-1 min-w-0">
            <p class="font-condensed font-bold text-sm truncate" :style="{ color: 'var(--t-text)' }">{{ c.challenge?.title }}</p>
            <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ c.challenge?.city?.name }} · {{ fmtDate(c.createdAt) }}</p>
          </div>
          <span v-if="c.status === 'approved'" class="font-display text-base shrink-0" style="color:var(--t-hi)">+{{ c.challenge?.xp }}</span>
          <span v-else class="font-condensed text-xs shrink-0" :style="{ color: 'var(--t-muted)' }">→</span>
        </NuxtLink>
      </div>

      <p v-else class="text-center font-condensed text-sm py-8" :style="{ color: 'var(--t-muted)' }">
        Пока нет выполненных заданий.<br>
        <NuxtLink to="/cities" style="color:var(--t-hi)">Выбери город</NuxtLink> и начни!
      </p>

      <!-- Logout -->
      <button @click="doLogout" class="w-full mt-8 font-display text-base tracking-widest py-2.5 transition-all"
        :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
      >ВЫЙТИ</button>
    </template>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Профиль — Travel Challenges' })
const { user, isLoggedIn, logout } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()

const LEVELS = [
  { name: 'Новичок', xp: 0 },
  { name: 'Путешественник', xp: 200 },
  { name: 'Исследователь', xp: 600 },
  { name: 'Бывалый', xp: 1500 },
  { name: 'Знаток', xp: 3000 },
  { name: 'Легенда', xp: 6000 },
  { name: 'Амбассадор', xp: 10000 },
]

const { data: completions, pending: completionsPending } = useAsyncData('my-completions', async () => {
  if (!import.meta.client) return []
  const token = localStorage.getItem('token')
  if (!token) return []
  const res = await fetch(`${config.public.apiBase}/completions/my`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) return []
  return res.json() as Promise<any[]>
}, { server: false, watch: [isLoggedIn] })

const stats = computed(() => {
  const approved = completions.value?.filter((c: any) => c.status === 'approved').length ?? 0
  const pending = completions.value?.filter((c: any) => c.status === 'pending').length ?? 0
  return [
    { label: 'XP', value: user.value?.points ?? 0 },
    { label: 'Выполнено', value: approved },
    { label: 'На проверке', value: pending },
  ]
})

const nextLevelIdx = computed(() => {
  const pts = user.value?.points ?? 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].xp) return Math.min(i + 1, LEVELS.length - 1)
  }
  return 1
})
const nextLevel = computed(() => LEVELS[nextLevelIdx.value]?.name ?? 'Амбассадор')
const nextLevelXp = computed(() => LEVELS[nextLevelIdx.value]?.xp ?? 10000)
const prevLevelXp = computed(() => LEVELS[Math.max(0, nextLevelIdx.value - 1)]?.xp ?? 0)
const xpProgress = computed(() => {
  const pts = user.value?.points ?? 0
  const range = nextLevelXp.value - prevLevelXp.value
  if (!range) return 100
  return Math.min(100, Math.round(((pts - prevLevelXp.value) / range) * 100))
})

function doLogout() { logout(); router.push('/cities') }
function statusIcon(s: string) { return s === 'approved' ? '✓' : s === 'pending' ? '⏳' : '✕' }
function statusBg(s: string) { return s === 'approved' ? 'var(--t-hi)' : s === 'pending' ? '#F0BB72' : '#EE8888' }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) }
</script>
