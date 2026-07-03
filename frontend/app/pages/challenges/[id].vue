<template>
  <div>
    <NuxtLink v-if="data" :to="`/cities/${data.cityId}`"
      class="font-condensed text-xs uppercase tracking-widest mb-4 inline-flex items-center gap-1"
      :style="{ color: 'var(--t-muted)' }"
    >‹ {{ data.city?.name }}</NuxtLink>

    <div v-if="pending" class="space-y-4">
      <div class="h-8 w-64 animate-pulse" :style="{ background: 'var(--t-card)' }" />
      <div class="h-40 animate-pulse" :style="{ background: 'var(--t-card)' }" />
    </div>

    <template v-else-if="data">
      <!-- Title & XP -->
      <div class="flex items-start justify-between gap-4 mb-4">
        <h1 class="font-display text-2xl tracking-widest leading-tight flex-1" :style="{ color: 'var(--t-text)' }">{{ data.title }}</h1>
        <div class="flex flex-col items-end shrink-0">
          <span class="font-display text-3xl leading-none" style="color:var(--t-hi)">+{{ data.xp }}</span>
          <span class="font-condensed text-xs uppercase" :style="{ color: 'var(--t-muted)' }">XP</span>
        </div>
      </div>

      <!-- Meta -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <span class="font-condensed text-xs uppercase tracking-widest px-2 py-1"
          :style="{ background: `${catColor(data.category)}20`, color: catColor(data.category), border: `1px solid ${catColor(data.category)}40`, clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }"
        >{{ data.category }}</span>
        <span class="font-condensed text-xs uppercase px-2 py-1"
          :style="{ background: 'var(--t-panel)', color: diffColor(data.difficulty), clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }"
        >{{ diffLabel(data.difficulty) }}</span>
      </div>

      <!-- Description -->
      <div class="p-4 mb-4" :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }">
        <p class="font-condensed text-sm leading-relaxed" :style="{ color: 'var(--t-text)' }">{{ data.description }}</p>
        <p v-if="data.hint" class="font-condensed text-xs mt-3 pt-3" :style="{ color: 'var(--t-muted)', borderTop: '1px solid var(--t-border)' }">
          💡 {{ data.hint }}
        </p>
      </div>

      <!-- Already completed status (when not re-submitting) -->
      <div v-if="myCompletion && myCompletion.status === 'approved'" class="p-4 mb-4"
        style="background:var(--t-hi);clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"
      >
        <p class="font-display text-lg tracking-widest" style="color:#000">✓ ВЫПОЛНЕНО!</p>
        <p v-if="myCompletion.aiFeedback" class="font-condensed text-sm mt-1" style="color:rgba(0,0,0,0.75)">{{ myCompletion.aiFeedback }}</p>
      </div>

      <!-- Pending status (submitted but AI still evaluating) -->
      <div v-if="myCompletion && myCompletion.status === 'pending' && !aiPending" class="p-4 mb-4"
        :style="{ background: 'var(--t-card)', border: '1px solid color-mix(in srgb, var(--t-hi) 25%, transparent)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
      >
        <div class="flex items-center gap-3">
          <div class="spinner-sm shrink-0"></div>
          <div>
            <p class="font-display text-sm tracking-widest" :style="{ color: 'var(--t-text)' }">AI ОЦЕНИВАЕТ...</p>
            <p class="font-condensed text-xs mt-0.5" :style="{ color: 'var(--t-muted)' }">Фото отправлено, результат скоро появится</p>
          </div>
        </div>
      </div>

      <!-- Rejected banner -->
      <div v-if="myCompletion && myCompletion.status === 'rejected'" class="p-4 mb-4"
        style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"
      >
        <p class="font-display text-sm tracking-widest" style="color:#EE8888">✕ НЕ ЗАСЧИТАНО</p>
        <p v-if="myCompletion.aiFeedback" class="font-condensed text-xs mt-1" :style="{ color: 'var(--t-muted)' }">{{ myCompletion.aiFeedback }}</p>
      </div>

      <!-- Upload form -->
      <div v-if="canSubmit">
        <p class="font-condensed text-xs uppercase tracking-widest mb-3" :style="{ color: 'var(--t-muted)' }">
          {{ myCompletion?.status === 'rejected' ? 'Попробуй ещё раз' : 'Сделай фото чтобы подтвердить' }}
        </p>

        <!-- Drop zone / file picker -->
        <div v-if="!photoPreview"
          class="h-52 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.99] border-2 border-dashed"
          :style="{ borderColor: 'var(--t-hi)', background: 'var(--t-card)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
          @click="fileInput?.click()"
        >
          <div class="w-16 h-16 flex items-center justify-center" style="background:var(--t-hi);color:#000;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)">
            <Icon name="game-icons:video-camera" style="font-size:2.2rem" />
          </div>
          <p class="font-display text-base tracking-widest" :style="{ color: 'var(--t-text)' }">ДОБАВИТЬ ФОТО</p>
          <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">Нажми чтобы выбрать из галереи или снять</p>
          <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFile" />
        </div>

        <!-- Preview -->
        <div v-else class="relative mb-4" style="clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)">
          <img :src="photoPreview" class="w-full object-cover" style="max-height:280px" />
          <button @click="photoPreview = null; selectedFile = null"
            class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center font-display text-lg"
            style="background:rgba(0,0,0,0.65);color:#fff;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
          >✕</button>
        </div>

        <!-- Submit / Login button -->
        <template v-if="photoPreview">
          <button v-if="isLoggedIn" @click="submit"
            class="w-full font-display text-2xl tracking-widest py-4 transition-all active:scale-[0.98] mt-3"
            style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
          >ОТПРАВИТЬ</button>
          <NuxtLink v-else to="/auth"
            class="block w-full text-center font-display text-2xl tracking-widest py-4 transition-all active:scale-[0.98] mt-3"
            style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
          >ВОЙТИ И ОТПРАВИТЬ</NuxtLink>
        </template>

        <p v-if="error" class="font-condensed text-sm mt-3 text-center" style="color:#EE8888">{{ error }}</p>
      </div>
    </template>
  </div>

  <!-- ══ FULLSCREEN: UPLOADING ══ -->
  <Teleport to="body">
    <Transition name="fs-fade">
      <div v-if="uploading" class="fixed inset-0 z-[180] flex flex-col items-center justify-center gap-6" style="background:#000">
        <div class="font-display text-3xl tracking-widest" style="color:var(--t-hi)">ЗАГРУЖАЕМ...</div>
        <div class="spinner-tc"></div>
        <p class="font-condensed text-sm" style="color:rgba(255,255,255,0.4)">Отправляем фото на сервер</p>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ FULLSCREEN: AI PROCESSING ══ -->
  <Teleport to="body">
    <Transition name="fs-fade">
      <div v-if="aiPending && !uploading" class="fixed inset-0 z-[180] flex flex-col items-center justify-center gap-6 px-8 text-center" style="background:#000">
        <div class="font-display text-3xl tracking-widest animate-pulse" style="color:var(--t-hi)">AI ОЦЕНИВАЕТ ФОТО...</div>
        <div class="spinner-tc"></div>
        <!-- Rotating tip -->
        <p class="font-condensed text-sm min-h-[1.5rem] transition-opacity" style="color:rgba(255,255,255,0.45)">{{ aiTips[aiTipIndex] }}</p>
        <!-- Progress bar -->
        <div class="w-48 h-0.5 overflow-hidden" style="background:rgba(255,255,255,0.1)">
          <div class="h-full transition-all duration-1000" :style="{ width: aiProgress + '%', background: 'var(--t-hi)' }" />
        </div>
        <p class="font-condensed text-xs" style="color:rgba(255,255,255,0.2)">~{{ Math.max(0, 60 - aiElapsed) }}с</p>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ FULLSCREEN: SCORE REVEAL ══ -->
  <Teleport to="body">
    <Transition name="fs-fade">
      <div v-if="scoreReveal" class="fixed inset-0 z-[190] flex flex-col items-center justify-center px-6 text-center" style="background:#000">
        <div class="font-condensed text-xs tracking-[0.3em] mb-8" style="color:rgba(255,255,255,0.3)">РЕЗУЛЬТАТ</div>

        <!-- Animated score number -->
        <div class="font-display leading-none mb-3" style="font-size:9rem;line-height:1" :style="{ color: scoreColor(scoreReveal.score) }">
          {{ displayScore }}
        </div>

        <!-- Label -->
        <div class="font-display text-2xl tracking-widest" :style="{ color: scoreColor(scoreReveal.score) }">
          {{ scoreLabel(scoreReveal.score) }}
        </div>

        <!-- XP -->
        <div v-if="scoreReveal.approved" class="font-condensed text-xl mt-3" style="color:rgba(255,255,255,0.45)">
          +{{ scoreReveal.xp }} XP
        </div>

        <!-- AI feedback -->
        <p v-if="scoreReveal.feedback" class="font-condensed text-sm leading-relaxed mt-5 max-w-xs" style="color:rgba(255,255,255,0.6)">
          {{ scoreReveal.feedback }}
        </p>

        <!-- Strengths -->
        <div v-if="scoreReveal.strengths?.length" class="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xs">
          <span v-for="s in scoreReveal.strengths" :key="s"
            class="font-condensed text-xs px-2 py-0.5"
            style="background:color-mix(in srgb, var(--t-hi) 9%, transparent);color:var(--t-hi);border:1px solid color-mix(in srgb, var(--t-hi) 25%, transparent);clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
          >✓ {{ s }}</span>
        </div>

        <!-- Improvements -->
        <div v-if="scoreReveal.improvements?.length" class="flex flex-wrap justify-center gap-1.5 mt-2 max-w-xs">
          <span v-for="imp in scoreReveal.improvements" :key="imp"
            class="font-condensed text-xs px-2 py-0.5"
            style="background:#F0BB7218;color:#F0BB72;border:1px solid #F0BB7240;clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
          >→ {{ imp }}</span>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3 mt-10 w-full max-w-xs">
          <button @click="closeReveal"
            class="w-full font-display text-xl py-4 transition-all active:scale-[0.97]"
            :style="scoreReveal.approved
              ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }
              : { background: 'rgba(255,255,255,0.1)', color: '#fff', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
          >{{ scoreReveal.approved ? '🎉 ОТЛИЧНО!' : 'ПОНЯТНО' }}</button>
          <NuxtLink v-if="!scoreReveal.approved" :to="`/cities/${data?.cityId}`" @click="scoreReveal = null"
            class="block text-center font-display text-xl py-4 transition-all active:scale-[0.97]"
            style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
          >ДРУГОЕ ЗАДАНИЕ</NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const { isLoggedIn } = useAuth()

const photoPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')

// AI processing state
const aiPending = ref(false)
const aiProgress = ref(0)
const aiElapsed = ref(0)
const aiTipIndex = ref(0)
let aiTimer: ReturnType<typeof setInterval> | null = null
let aiTipTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

const aiTips = [
  'Проверяю локацию...',
  'Анализирую содержимое фото...',
  'Сравниваю с заданием...',
  'Оцениваю качество выполнения...',
  'Готовлю результат...',
]

// Score reveal state
const scoreReveal = ref<{
  score: number
  approved: boolean
  xp: number
  feedback: string
  strengths: string[]
  improvements: string[]
} | null>(null)
const displayScore = ref(0)

watch(scoreReveal, (val) => {
  if (!val) { displayScore.value = 0; return }
  const target = val.score
  if (target === 0) { displayScore.value = 0; return }
  const stepCount = 60
  const stepVal = Math.max(1, Math.ceil(target / stepCount))
  let current = 0
  const anim = setInterval(() => {
    current = Math.min(current + stepVal, target)
    displayScore.value = current
    if (current >= target) clearInterval(anim)
  }, 1500 / stepCount)
})

function scoreColor(score: number) {
  if (score >= 75) return 'var(--t-hi)'
  if (score >= 50) return '#F0BB72'
  return '#EE8888'
}

function scoreLabel(score: number) {
  if (score >= 80) return 'ОГОНЬ 🔥'
  if (score >= 60) return 'НЕПЛОХО 👍'
  if (score >= 40) return 'СОЙДЁТ'
  return 'ПРОМАХ ✕'
}

function startAiAnimation() {
  aiProgress.value = 0
  aiElapsed.value = 0
  aiTipIndex.value = 0
  aiTimer = setInterval(() => {
    aiElapsed.value++
    aiProgress.value = Math.min(90, 90 * (1 - Math.exp(-aiElapsed.value / 18)))
  }, 1000)
  aiTipTimer = setInterval(() => {
    aiTipIndex.value = (aiTipIndex.value + 1) % aiTips.length
  }, 2500)
}

function stopAiAnimation() {
  if (aiTimer) { clearInterval(aiTimer); aiTimer = null }
  if (aiTipTimer) { clearInterval(aiTipTimer); aiTipTimer = null }
  aiProgress.value = 100
}

const { data, pending, refresh } = useAsyncData(`challenge-${route.params.id}`, async () => {
  const token = import.meta.client ? (localStorage.getItem('token') ?? '') : ''
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${config.public.apiBase}/challenges/${route.params.id}`, { headers })
  if (!res.ok) return null
  return res.json() as Promise<any>
}, { server: false })

useSeoMeta({ title: computed(() => data.value?.title ?? 'Задание') })

const myCompletion = computed(() => data.value?.myCompletion ?? null)
const canSubmit = computed(() => !aiPending.value && !uploading.value && (!myCompletion.value || myCompletion.value.status === 'rejected'))

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  selectedFile.value = f
  const reader = new FileReader()
  reader.onload = ev => { photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(f)
}

async function pollCompletion(id: number) {
  if (pollTimer) clearInterval(pollTimer)
  let attempts = 0
  pollTimer = setInterval(async () => {
    attempts++
    try {
      const token = localStorage.getItem('token') ?? ''
      const res = await fetch(`${config.public.apiBase}/completions/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const result = await res.json()
      if (result.status !== 'pending') {
        clearInterval(pollTimer!)
        stopAiAnimation()
        aiPending.value = false

        let strengths: string[] = []
        let improvements: string[] = []
        if (result.aiDetails) {
          try {
            const d = JSON.parse(result.aiDetails)
            strengths = d.strengths ?? []
            improvements = d.improvements ?? []
          } catch {}
        }

        scoreReveal.value = {
          approved: result.status === 'approved',
          score: Math.round(result.aiScore ?? (result.status === 'approved' ? 80 : 30)),
          xp: data.value?.xp ?? 0,
          feedback: result.aiFeedback ?? (result.status === 'approved' ? 'Задание выполнено!' : 'Фото не подтверждает выполнение.'),
          strengths,
          improvements,
        }
        await refresh()
      }
    } catch {}
    if (attempts >= 25) {
      clearInterval(pollTimer!)
      stopAiAnimation()
      aiPending.value = false
      error.value = 'AI не ответил. Проверь статус позже.'
    }
  }, 3000)
}

async function submit() {
  if (!selectedFile.value || !isLoggedIn.value) return
  error.value = ''
  uploading.value = true
  try {
    const token = localStorage.getItem('token') ?? ''
    const fd = new FormData()
    fd.append('photo', selectedFile.value)
    const res = await fetch(`${config.public.apiBase}/completions/${route.params.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd,
    })
    uploading.value = false
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || 'Ошибка отправки')
    }
    const result = await res.json()
    photoPreview.value = null
    selectedFile.value = null
    aiPending.value = true
    startAiAnimation()
    await refresh()
    pollCompletion(result.id)
  } catch (e: any) {
    uploading.value = false
    error.value = e.message
  }
}

function closeReveal() {
  scoreReveal.value = null
  displayScore.value = 0
  refresh()
}

onUnmounted(() => {
  if (aiTimer) clearInterval(aiTimer)
  if (aiTipTimer) clearInterval(aiTipTimer)
  if (pollTimer) clearInterval(pollTimer)
})

const catColorMap: Record<string, string> = {
  'История': '#F0BB72', 'Гастро': '#EE8888', 'Спорт': '#88AAEE',
  'Арт': '#B490F0', 'Природа': '#7CC89A',
}
function catColor(cat: string) { return catColorMap[cat] ?? 'var(--t-hi)' }
function diffLabel(d: string) { return d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно' }
function diffColor(d: string) { return d === 'easy' ? '#7CC89A' : d === 'medium' ? '#F5C87A' : '#EE8888' }
</script>

<style scoped>
.spinner-sm {
  width: 1.25rem; height: 1.25rem;
  border: 2px solid var(--t-border);
  border-top-color: var(--t-hi);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-tc {
  width: 2.5rem; height: 2.5rem;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--t-hi);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fs-fade-enter-active { transition: opacity 0.2s ease; }
.fs-fade-leave-active { transition: opacity 0.25s ease; }
.fs-fade-enter-from, .fs-fade-leave-to { opacity: 0; }
</style>
