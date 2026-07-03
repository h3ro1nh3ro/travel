<template>
  <IconifyIcon v-bind="$attrs" :icon="name" />
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'

defineProps<{ name: string }>()
defineOptions({ inheritAttrs: false })
</script>
