<template>
  <div class="skeleton-shimmer" :style="{ width, height, borderRadius: radius ?? '2px' }" />
</template>

<script setup lang="ts">
defineProps<{ width?: string; height?: string; radius?: string }>()
</script>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(90deg, var(--t-panel) 25%, var(--t-card) 50%, var(--t-panel) 75%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.4s infinite;
}
@keyframes sk-shimmer {
  from { background-position: 200% 0 }
  to   { background-position: -200% 0 }
}
</style>
