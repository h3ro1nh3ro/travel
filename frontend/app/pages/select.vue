<template>
  <div class="fixed inset-0 z-40 overflow-y-auto" :style="{ background: 'var(--t-bg)' }">
    <div class="flex flex-col items-center justify-center min-h-full px-4 py-10 gap-3">

      <div class="text-center mb-2">
        <div class="font-display text-4xl tracking-widest leading-none mb-1">
          <span style="color:var(--t-hi)">TRAVEL</span><span :style="{ color: 'var(--t-text)' }">CH</span><span class="text-sm opacity-30" style="color:var(--t-hi)">™</span>
        </div>
        <p class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Выбери локацию</p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col gap-2 w-full">
        <div v-for="i in 3" :key="i" class="h-24 animate-pulse w-full" :style="{ background: 'var(--t-card)' }" />
      </div>

      <!-- City cards -->
      <button
        v-for="city in cities" :key="city.id"
        @click="pick(city)"
        class="group relative overflow-hidden text-left transition-all duration-200 active:scale-[0.98] w-full"
        style="height: 108px; clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)"
      >
        <!-- Cover -->
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          :style="{ backgroundImage: `url(/images/cities/${city.id}.jpg)` }"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0"
          style="background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%)"
        />
        <!-- Top accent line -->
        <div class="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300" style="background:var(--t-hi)" />

        <!-- Content -->
        <div class="relative z-10 flex items-center gap-4 h-full px-5">
          <div class="w-10 h-10 flex items-center justify-center shrink-0 font-display text-xl"
            style="background:rgba(0,201,167,0.2);border:1px solid rgba(0,201,167,0.4);clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%);color:var(--t-hi)"
          >{{ city.name[0].toUpperCase() }}</div>
          <div class="flex-1 min-w-0">
            <div class="font-display text-2xl leading-tight" style="color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.8)">
              {{ city.name.toUpperCase() }}
            </div>
            <div class="font-condensed text-xs uppercase tracking-widest mt-0.5" style="color:rgba(255,255,255,0.55)">
              {{ city.country }} · {{ city.challengeCount }} заданий
            </div>
          </div>
          <div class="font-display text-xs tracking-widest shrink-0 mr-2 px-2 py-1"
            style="background:rgba(0,201,167,0.15);color:var(--t-hi);border:1px solid rgba(0,201,167,0.3);clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
          >→</div>
        </div>
      </button>

      <!-- Back (if city already chosen) -->
      <button v-if="city" @click="$router.back()"
        class="mt-4 font-condensed text-xs uppercase tracking-widest transition-opacity active:opacity-60"
        :style="{ color: 'var(--t-muted)' }"
      >← НАЗАД</button>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Выбор города — Travel Challenges' })

const { city, setCity } = useSelectedCity()
const api = useApi()
const router = useRouter()

const { data: cities, pending } = useAsyncData('select-cities', () =>
  api.get<any[]>('/cities').catch(() => [] as any[])
, { server: false })

const gradients = [
  'linear-gradient(135deg,#0f4c75,#1b6ca8)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#2d6a4f,#40916c)',
  'linear-gradient(135deg,#7b2d8b,#B490F0)',
  'linear-gradient(135deg,#b5451b,#e07b39)',
]
function cityGradient(id: number) { return gradients[(id - 1) % gradients.length] }

function pick(c: any) {
  setCity({ id: c.id, name: c.name, country: c.country, coverImage: c.coverImage ?? null, challengeCount: c.challengeCount })
  router.replace('/menu')
}
</script>
