<template>
  <div>
    <h1 class="font-display text-3xl tracking-widest mb-1" :style="{ color: 'var(--t-text)' }">РЕЙТИНГ</h1>
    <p class="font-condensed text-sm mb-6" :style="{ color: 'var(--t-muted)' }">Топ путешественников по XP</p>

    <div v-if="pending" class="space-y-3">
      <div v-for="i in 10" :key="i" class="h-14 animate-pulse" :style="{ background: 'var(--t-card)' }" />
    </div>

    <div v-else class="flex flex-col gap-2">
      <div v-for="(entry, i) in leaders" :key="entry.id"
        class="flex items-center gap-3 px-4 py-3"
        :style="{
          background: i < 3 ? 'var(--t-card)' : 'var(--t-panel)',
          border: `1px solid ${i === 0 ? '#FFD70060' : i === 1 ? '#C0C0C060' : i === 2 ? '#CD7F3260' : 'var(--t-border)'}`,
          clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)'
        }"
      >
        <!-- Rank -->
        <div class="w-8 text-center shrink-0">
          <span v-if="i === 0" class="text-xl">🥇</span>
          <span v-else-if="i === 1" class="text-xl">🥈</span>
          <span v-else-if="i === 2" class="text-xl">🥉</span>
          <span v-else class="font-display text-base" :style="{ color: 'var(--t-muted)' }">{{ i + 1 }}</span>
        </div>

        <!-- Avatar placeholder -->
        <div class="w-8 h-8 flex items-center justify-center font-display text-sm shrink-0"
          :style="{ background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
        >{{ entry.username[0].toUpperCase() }}</div>

        <!-- Name + level -->
        <div class="flex-1 min-w-0">
          <p class="font-condensed font-bold text-sm truncate" :style="{ color: 'var(--t-text)' }">{{ entry.username }}</p>
          <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ entry.level }}</p>
        </div>

        <!-- XP -->
        <div class="flex flex-col items-end shrink-0">
          <span class="font-display text-xl" style="color:var(--t-hi)">{{ entry.points }}</span>
          <span class="font-condensed text-[10px] uppercase" :style="{ color: 'var(--t-muted)' }">xp</span>
        </div>
      </div>

      <p v-if="!leaders?.length" class="text-center font-condensed text-sm py-8" :style="{ color: 'var(--t-muted)' }">
        Пока нет участников
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Рейтинг — Travel Challenges' })
const config = useRuntimeConfig()

const { data: leaders, pending } = useAsyncData('leaderboard', async () => {
  const res = await fetch(`${config.public.apiBase}/users/leaderboard`)
  return res.json() as Promise<any[]>
}, { server: false })
</script>
