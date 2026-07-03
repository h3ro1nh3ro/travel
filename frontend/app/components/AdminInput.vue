<template>
  <div>
    <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">{{ label }}</div>
    <textarea v-if="type === 'textarea'"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="3"
      class="w-full px-3 py-2 font-condensed text-sm outline-none resize-none"
      :style="inputStyle"
    />
    <input v-else
      :type="type || 'text'"
      :value="modelValue"
      @input="emit('update:modelValue', type === 'number' ? Number(($event.target as HTMLInputElement).value) : ($event.target as HTMLInputElement).value)"
      class="w-full px-3 py-2 font-condensed text-sm outline-none"
      :style="inputStyle"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: any; type?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()

const inputStyle = {
  background: 'var(--t-panel)',
  color: 'var(--t-text)',
  border: '1px solid var(--t-border)',
}
</script>
