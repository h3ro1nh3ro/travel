<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl tracking-widest mb-1" :style="{ color: 'var(--t-text)' }">ГОРОДА</h1>
      <p class="font-condensed text-sm" :style="{ color: 'var(--t-muted)' }">Выбери город и выполняй задания</p>
    </div>

    <!-- Stats bar (if logged in) -->
    <div v-if="isLoggedIn && user" class="flex gap-3 mb-6 overflow-x-auto pb-1">
      <div v-for="stat in userStats" :key="stat.label"
        class="flex-shrink-0 flex flex-col items-center px-4 py-3 min-w-[80px]"
        :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
      >
        <span class="font-display text-2xl leading-none" style="color:var(--t-hi)">{{ stat.value }}</span>
        <span class="font-condensed text-[10px] uppercase tracking-widest mt-1" :style="{ color: 'var(--t-muted)' }">{{ stat.label }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-44 animate-pulse" :style="{ background: 'var(--t-card)' }" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="font-condensed text-sm mb-4" :style="{ color: 'var(--t-muted)' }">Не удалось загрузить города</p>
      <button @click="refresh()" class="font-display text-base px-5 py-2 tracking-widest" style="background:var(--t-hi);color:#000;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)">ПОВТОРИТЬ</button>
    </div>

    <!-- City cards -->
    <div v-else class="flex flex-col gap-4">
      <NuxtLink v-for="city in cities" :key="city.id" :to="`/cities/${city.id}`"
        class="block relative overflow-hidden transition-all active:scale-[0.99]"
        :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
      >
        <!-- Cover image -->
        <div class="h-44 flex items-end relative overflow-hidden"
          :style="{ backgroundImage: `url(/images/cities/${city.id}.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }"
        >
          <!-- dark overlay for text readability -->
          <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" />
          <div class="relative p-4 z-10">
            <div class="font-display text-2xl tracking-widest text-white" style="text-shadow:0 2px 8px rgba(0,0,0,0.6)">{{ city.name.toUpperCase() }}</div>
            <div class="font-condensed text-xs text-white/70">{{ city.country }}</div>
          </div>
        </div>

        <div class="px-4 py-3 flex items-center justify-between">
          <p class="font-condensed text-sm flex-1 mr-4" :style="{ color: 'var(--t-muted)' }">{{ city.description }}</p>
          <div class="flex flex-col items-end shrink-0">
            <span class="font-display text-xl" style="color:var(--t-hi)">{{ city.challengeCount }}</span>
            <span class="font-condensed text-[10px] uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">задания</span>
          </div>
        </div>

        <!-- progress bar if logged in -->
        <div v-if="city.myCompleted !== undefined" class="px-4 pb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="font-condensed text-[10px] uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Выполнено</span>
            <span class="font-condensed text-[10px]" style="color:var(--t-hi)">{{ city.myCompleted }}/{{ city.challengeCount }}</span>
          </div>
          <div class="h-1 w-full overflow-hidden" :style="{ background: 'var(--t-panel)' }">
            <div class="h-full transition-all" style="background:var(--t-hi)"
              :style="{ width: `${Math.round((city.myCompleted / city.challengeCount) * 100)}%` }"
            />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Города — Travel Challenges' })

const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

const { data: cities, pending, error, refresh } = useAsyncData('cities', async () => {
  const token = import.meta.client ? (localStorage.getItem('token') ?? '') : ''
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${config.public.apiBase}/cities`, { headers })
  if (!res.ok) throw new Error('Failed to load cities')
  return res.json() as Promise<any[]>
}, { server: false, lazy: false })

onMounted(() => {
  if (!cities.value || cities.value.length === 0) refresh()
})

const userStats = computed(() => {
  if (!user.value) return []
  return [
    { label: 'XP',      value: user.value.points },
    { label: 'Уровень', value: user.value.level },
  ]
})

const gradients = [
  'linear-gradient(135deg,#0f4c75,#1b6ca8)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#2d6a4f,#40916c)',
  'linear-gradient(135deg,#7b2d8b,#B490F0)',
  'linear-gradient(135deg,#b5451b,#e07b39)',
]
function cityGradient(id: number) { return gradients[(id - 1) % gradients.length] }
</script>
