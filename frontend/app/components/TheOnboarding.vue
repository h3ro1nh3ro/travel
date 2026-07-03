<template>
  <Teleport to="body">
    <Transition name="onboard">
      <div v-if="visible" class="fixed inset-0 z-[200] flex flex-col" :style="{ background: isDark ? '#0a1a1a' : '#e8f5f3' }">

        <!-- Progress dots -->
        <div class="flex justify-center gap-2 pt-12 pb-8 shrink-0">
          <div v-for="i in steps.length" :key="i"
            class="h-1 rounded-full transition-all duration-400"
            :style="{
              width: step === i - 1 ? '2rem' : '0.5rem',
              background: step >= i - 1 ? 'var(--t-hi)' : 'var(--t-border)',
            }"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <Transition name="slide" mode="out-in">
            <div :key="step" class="w-full max-w-sm">
              <div class="mb-8 flex justify-center">
                <div class="w-24 h-24 flex items-center justify-center"
                  style="background:rgba(0,201,167,0.12);border:1px solid rgba(0,201,167,0.35);clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)"
                >
                  <span class="text-5xl select-none">{{ current.emoji }}</span>
                </div>
              </div>

              <div class="font-display text-4xl leading-none mb-4" :style="{ color: 'var(--t-text)' }">
                {{ current.title }}
              </div>

              <p class="font-condensed text-base leading-relaxed" :style="{ color: 'var(--t-muted)' }">
                {{ current.desc }}
              </p>

              <!-- Step-specific extra content -->
              <div v-if="current.extra" class="mt-6 grid grid-cols-2 gap-2">
                <div v-for="item in current.extra" :key="item.label"
                  class="px-3 py-2.5 flex items-center gap-2"
                  :style="{ background: isDark ? 'rgba(0,201,167,0.08)' : 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
                >
                  <span class="text-xl">{{ item.icon }}</span>
                  <span class="font-condensed text-xs" :style="{ color: 'var(--t-text)' }">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Footer -->
        <div class="shrink-0 px-6 pb-12 space-y-3">
          <button @click="next"
            class="w-full font-display text-xl py-4 transition-all active:scale-[0.98]"
            style="background:var(--t-hi);color:#000;clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
          >{{ step < steps.length - 1 ? 'ДАЛЕЕ →' : 'ПОГНАЛИ!' }}</button>

          <button v-if="step === 0" @click="finish"
            class="w-full font-condensed text-xs uppercase tracking-widest py-2 transition-opacity hover:opacity-60"
            :style="{ color: 'var(--t-muted)' }"
          >Пропустить</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { isDark } = useDarkMode()

const steps = [
  {
    emoji: '🗺️',
    title: 'ДОБРО\nПОЖАЛОВАТЬ',
    desc: 'Исследуй города России через живые задания. Не туристом — исследователем.',
  },
  {
    emoji: '📍',
    title: 'ВЫБЕРИ\nГОРОД',
    desc: 'Санкт-Петербург, Москва, Казань — в каждом десятки заданий в реальных местах.',
    extra: [
      { icon: '🏛️', label: 'История' },
      { icon: '🍜', label: 'Гастро' },
      { icon: '⚽', label: 'Спорт' },
      { icon: '🎨', label: 'Арт' },
      { icon: '🌿', label: 'Природа' },
    ],
  },
  {
    emoji: '📸',
    title: 'ФОТО-\nДОКАЗАТЕЛЬСТВО',
    desc: 'Сделай фото на месте. AI проверяет подлинность и даёт оценку за точность.',
  },
  {
    emoji: '⚡',
    title: 'ЗАРАБАТЫВАЙ\nXP',
    desc: 'Расти от Новичка до Амбассадора. Смотри ленту сообщества и рейтинг.',
  },
]

const step = ref(0)
const visible = ref(false)

const current = computed(() => steps[step.value])

onMounted(() => {
  if (!localStorage.getItem('tc_onboarded')) {
    visible.value = true
  }
})

function next() {
  if (step.value < steps.length - 1) step.value++
  else finish()
}

function finish() {
  localStorage.setItem('tc_onboarded', '1')
  visible.value = false
}
</script>

<style scoped>
.onboard-enter-active { transition: opacity 0.3s ease; }
.onboard-leave-active { transition: opacity 0.25s ease; }
.onboard-enter-from, .onboard-leave-to { opacity: 0; }

.slide-enter-active { transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(32px); }
.slide-leave-to { opacity: 0; transform: translateX(-24px); }
</style>
