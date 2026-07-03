<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
    :class="{ 'splash-exit': exiting }"
    :style="{ background: isDark ? '#131E1D' : '#F0F2F4' }"
  >
    <!-- scanlines -->
    <div class="absolute inset-0 pointer-events-none"
      :style="{ background: `repeating-linear-gradient(0deg,transparent,transparent 2px,${isDark ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.04)'} 2px,${isDark ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.04)'} 4px)` }"
    />

    <div class="text-center z-10">
      <div class="font-display tracking-widest leading-none mb-3 select-none" style="font-size:clamp(3rem,14vw,7rem)">
        <span class="splash-word" style="color:var(--t-hi)">TRAVEL</span>
      </div>
      <div class="font-display tracking-widest leading-none mb-6 select-none" style="font-size:clamp(1.5rem,7vw,3.5rem)">
        <span class="splash-word" style="animation-delay:0.1s" :style="{ color: isDark ? '#f0f0f0' : '#1a1a1a' }">CHALLENGES</span>
      </div>
      <p class="font-condensed text-sm uppercase tracking-widest opacity-60 mb-8" :style="{ color: isDark ? '#aaa' : '#555' }">
        выполняй задания · зарабатывай XP
      </p>

      <!-- loading bar -->
      <div class="w-48 h-0.5 mx-auto overflow-hidden" :style="{ background: isDark ? '#1F3330' : '#C8CCD4' }">
        <div class="h-full transition-all duration-300 ease-out" :style="{ width: progress + '%', background: 'var(--t-hi)' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { isDark } = useDarkMode()
const { fetchMe } = useAuth()
const { city, loadSaved } = useSelectedCity()
const router = useRouter()

const progress = ref(0)
const exiting = ref(false)

onMounted(async () => {
  loadSaved()
  await fetchMe()
  const start = Date.now()
  const dur = 900
  const tick = () => {
    progress.value = Math.min(100, ((Date.now() - start) / dur) * 100)
    if (progress.value < 100) requestAnimationFrame(tick)
    else setTimeout(go, 80)
  }
  requestAnimationFrame(tick)
})

function go() {
  exiting.value = true
  const dest = city.value ? '/menu' : '/select'
  setTimeout(() => router.replace(dest), 280)
}
</script>

<style scoped>
.splash-word { display: inline-block; animation: pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes pop-in { from { opacity:0; transform: scale(0.85) translateY(8px); } to { opacity:1; transform:none; } }
.splash-exit { animation: splash-fade 0.28s ease forwards; }
@keyframes splash-fade { to { opacity:0; transform:scale(1.04); } }
</style>
