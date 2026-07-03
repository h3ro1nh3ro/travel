<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div class="h-10 w-48 animate-pulse" :style="{ background: 'var(--t-card)' }" />
      <div v-for="i in 5" :key="i" class="h-28 animate-pulse" :style="{ background: 'var(--t-card)' }" />
    </div>

    <template v-else-if="data">
      <!-- City header -->
      <div class="mb-6">
        <NuxtLink to="/cities" class="font-condensed text-xs uppercase tracking-widest mb-2 inline-flex items-center gap-1" :style="{ color: 'var(--t-muted)' }">
          ‹ Все города
        </NuxtLink>
        <h1 class="font-display text-3xl tracking-widest" :style="{ color: 'var(--t-text)' }">{{ data.name.toUpperCase() }}</h1>
        <p class="font-condensed text-sm mt-1" :style="{ color: 'var(--t-muted)' }">{{ data.description }}</p>
      </div>

      <!-- Category filter -->
      <div class="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button v-for="cat in categories" :key="cat"
          @click="activeCategory = cat"
          class="shrink-0 font-condensed text-xs uppercase tracking-widest px-3 py-1.5 transition-all"
          :style="activeCategory === cat
            ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
            : { background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
          "
        >{{ cat }}</button>
      </div>

      <!-- Challenge list -->
      <div class="flex flex-col gap-3">
        <div v-for="ch in filteredChallenges" :key="ch.id"
          class="flex gap-3 p-3 cursor-pointer transition-all active:scale-[0.99]"
          :style="{ background: 'var(--t-card)', border: `1px solid ${ch.myStatus === 'approved' ? 'color-mix(in srgb, var(--t-hi) 31%, transparent)' : 'var(--t-border)'}`, clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
          @click="openChallenge(ch)"
        >
          <!-- Status icon -->
          <div class="w-10 h-10 shrink-0 flex items-center justify-center font-display text-xl"
            :style="{ background: statusBg(ch.myStatus), color: statusColor(ch.myStatus), clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
          >{{ statusIcon(ch.myStatus) }}</div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="font-condensed font-bold text-sm leading-tight" :style="{ color: 'var(--t-text)' }">{{ ch.title }}</p>
              <div class="shrink-0 flex flex-col items-end">
                <span class="font-display text-base leading-none" style="color:var(--t-hi)">+{{ ch.xp }}</span>
                <span class="font-condensed text-[10px] uppercase" :style="{ color: 'var(--t-muted)' }">xp</span>
              </div>
            </div>
            <p class="font-condensed text-xs mt-0.5 line-clamp-2" :style="{ color: 'var(--t-muted)' }">{{ ch.description }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="font-condensed text-[10px] uppercase tracking-widest px-1.5 py-0.5"
                :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', clipPath: 'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)' }"
              >{{ ch.category }}</span>
              <span class="font-condensed text-[10px] uppercase" :style="{ color: diffColor(ch.difficulty) }">{{ diffLabel(ch.difficulty) }}</span>
            </div>
          </div>
        </div>
      </div>

      <p v-if="filteredChallenges.length === 0" class="text-center font-condensed text-sm py-8" :style="{ color: 'var(--t-muted)' }">
        Нет заданий в этой категории
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const activeCategory = ref('Все')

const { data, pending } = useAsyncData(`city-${route.params.id}`, async () => {
  const token = import.meta.client ? (localStorage.getItem('token') ?? '') : ''
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${config.public.apiBase}/cities/${route.params.id}`, { headers })
  if (!res.ok) return null
  return res.json() as Promise<any>
}, { server: false })

useSeoMeta({
  title: computed(() => data.value ? `${data.value.name} — Travel Challenges` : 'Город')
})

const categories = computed(() => {
  if (!data.value?.challenges) return ['Все']
  const cats = [...new Set(data.value.challenges.map((c: any) => c.category))] as string[]
  return ['Все', ...cats]
})

const filteredChallenges = computed(() => {
  if (!data.value?.challenges) return []
  if (activeCategory.value === 'Все') return data.value.challenges
  return data.value.challenges.filter((c: any) => c.category === activeCategory.value)
})

function openChallenge(ch: any) {
  router.push(`/challenges/${ch.id}`)
}

function statusIcon(s?: string) {
  if (s === 'approved') return '✓'
  if (s === 'pending') return '⏳'
  if (s === 'rejected') return '✕'
  return '→'
}
function statusBg(s?: string) {
  if (s === 'approved') return 'var(--t-hi)'
  if (s === 'pending') return '#F0BB72'
  if (s === 'rejected') return '#EE8888'
  return 'var(--t-panel)'
}
function statusColor(s?: string) {
  if (s === 'approved') return '#000'
  if (s === 'pending') return '#000'
  if (s === 'rejected') return '#fff'
  return 'var(--t-muted)'
}
function diffLabel(d: string) {
  return d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'
}
function diffColor(d: string) {
  return d === 'easy' ? '#7CC89A' : d === 'medium' ? '#F5C87A' : '#EE8888'
}
</script>
