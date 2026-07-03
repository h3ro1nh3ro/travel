<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <TheOnboarding />
  </div>
</template>

<script setup lang="ts">
const { fetchMe } = useAuth()
const { init } = useDarkMode()

onMounted(async () => {
  const dark = localStorage.getItem('ko_dark') === '1'
  init(dark)
  await fetchMe()
})
</script>
