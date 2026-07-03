<template>
  <span :title="meta.label" class="inline-flex items-center justify-center shrink-0">
    <Icon :name="meta.icon" :style="{ fontSize: size + 'px' }" />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  badge: string
  size?: number
}>(), { size: 32 })

const BADGE_META: Record<string, { label: string; icon: string }> = {
  first_trick:  { label: 'Первый трюк',       icon: 'openmoji:skateboard' },
  first_fan:    { label: 'Первый подписчик',   icon: 'openmoji:call-me-hand' },
  streak_3:     { label: '3 дня подряд',       icon: 'openmoji:fire' },
  streak_7:     { label: '7 дней подряд',      icon: 'openmoji:high-voltage' },
  daily_grind:  { label: '30 дней подряд',     icon: 'openmoji:calendar' },
  trick_master: { label: 'Трюк 90+',           icon: 'openmoji:bullseye' },
  multi_sport:  { label: 'Два вида спорта',    icon: 'openmoji:person-cartwheeling' },
  crowd_fav:    { label: '100 реакций',        icon: 'openmoji:red-heart' },
  top_10:       { label: 'Топ-10 рейтинга',    icon: 'openmoji:trophy' },
  skate_king:   { label: 'Победа в S.K.A.T.E.', icon: 'openmoji:crown' },
  street:       { label: 'Street',              icon: 'openmoji:glowing-star' },
  shredder:     { label: 'Shredder',            icon: 'openmoji:gem-stone' },
  amateur:      { label: 'Amateur',             icon: 'openmoji:flexed-biceps' },
  sponsored:    { label: 'Sponsored',           icon: 'openmoji:sports-medal' },
  legend:       { label: 'Legend',              icon: 'openmoji:shooting-star' },
  // legacy
  intermediate: { label: 'Intermediate',        icon: 'openmoji:glowing-star' },
  advanced:     { label: 'Advanced',            icon: 'openmoji:gem-stone' },
  pro:          { label: 'PRO',                 icon: 'openmoji:crown' },
}

const meta = computed(() => BADGE_META[props.badge] ?? { label: props.badge, icon: 'openmoji:sports-medal' })
</script>
