<template>
  <NuxtLink :to="`/challenges/${challenge.id}`" class="thps-card block p-5 group">
    <div class="h-0.5 w-full mb-4" :class="difficultyColor"></div>

    <div class="flex items-center justify-between mb-4">
      <span class="thps-tag" :class="difficultyTagClass">{{ challenge.difficulty }}</span>
      <div class="flex items-center gap-2">
        <span v-if="participated" class="font-condensed text-[10px] uppercase tracking-widest px-1.5 py-0.5"
          :style="{ background: 'rgba(34,197,94,0.15)', color: '#7CC89A', border: '1px solid rgba(34,197,94,0.3)' }"
        >✓ ИДУ</span>
        <span class="font-display text-2xl t-primary">+{{ challenge.prizePoints }}</span>
      </div>
    </div>

    <h3 class="font-display text-2xl mb-2 leading-tight transition-colors" :style="{ color: 'var(--t-text)' }">
      {{ challenge.title }}
    </h3>
    <p class="font-body text-base mb-5 line-clamp-2 leading-relaxed t-muted">{{ challenge.description }}</p>

    <div class="flex items-center justify-between font-condensed text-xs border-t pt-3" :style="{ borderColor: 'var(--t-border)', color: 'var(--t-muted)' }">
      <span class="uppercase tracking-wide">{{ challenge._count?.submissions || 0 }} участников</span>
      <div class="flex items-center gap-2 uppercase tracking-wide">
        <span>5 попыток</span>
        <span :style="{ color: 'var(--t-border)' }">·</span>
        <span>до {{ formatDate(challenge.endsAt) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ challenge: any; participated?: boolean }>()

const difficultyColor = computed(() => ({
  'bg-green-500': props.challenge.difficulty === 'beginner',
  'bg-yellow-400': props.challenge.difficulty === 'intermediate',
  'bg-orange-500': props.challenge.difficulty === 'advanced',
  'bg-purple-500': props.challenge.difficulty === 'pro',
}))

const difficultyTagClass = computed(() => ({
  'bg-green-900/50 text-green-400': props.challenge.difficulty === 'beginner',
  'bg-yellow-900/50 text-yellow-400': props.challenge.difficulty === 'intermediate',
  'bg-orange-900/50 text-orange-400': props.challenge.difficulty === 'advanced',
  'bg-purple-900/50 text-purple-400': props.challenge.difficulty === 'pro',
}))

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>
