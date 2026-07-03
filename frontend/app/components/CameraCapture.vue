<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex flex-col" style="background:#000">

      <!-- ── LIVE VIEWFINDER ── -->
      <div v-show="!previewUrl" class="relative flex-1 overflow-hidden">
        <video ref="liveEl" autoplay muted playsinline
          class="absolute inset-0 w-full h-full object-cover"
          :style="{ transform: facingUser ? 'scaleX(-1)' : 'none' }"
        />

        <!-- Top bar -->
        <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe-top pb-3"
          style="background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)"
        >
          <button @click="$emit('close')"
            class="font-display text-2xl leading-none w-10 h-10 flex items-center justify-center"
            style="color:#fff"
          >✕</button>
          <div v-if="recording" class="flex items-center gap-2 font-condensed text-sm" style="color:#fff">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
            {{ formatTime(elapsed) }}
          </div>
          <div v-else class="w-10"></div>
          <button @click="flipCamera"
            class="w-10 h-10 flex items-center justify-center font-display text-xl"
            style="color:#fff"
          >↺</button>
        </div>

        <!-- Error -->
        <div v-if="cameraError" class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p class="font-condensed text-sm" style="color: rgba(255,255,255,0.7)">{{ cameraError }}</p>
          <button @click="$emit('close')"
            class="font-display text-base px-6 py-2"
            style="background:#FFE600; color:#000; clip-path: polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
          >ЗАКРЫТЬ</button>
        </div>

        <!-- Bottom controls -->
        <div v-if="!cameraError"
          class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-10 py-8 pb-safe"
          style="background: linear-gradient(to top, rgba(0,0,0,0.6), transparent)"
        >
          <!-- Rec button -->
          <button @click="toggleRecord"
            class="relative flex items-center justify-center transition-all active:scale-90"
            :style="{ width: '72px', height: '72px' }"
          >
            <!-- Outer ring -->
            <div class="absolute inset-0 rounded-full border-4" style="border-color: rgba(255,255,255,0.8)"></div>
            <!-- Inner fill -->
            <div class="transition-all duration-200 rounded-full"
              :style="recording
                ? { width: '32px', height: '32px', background: '#EE8888', borderRadius: '6px' }
                : { width: '52px', height: '52px', background: '#EE8888', borderRadius: '50%' }
              "
            ></div>
          </button>
        </div>
      </div>

      <!-- ── RECORDED PREVIEW ── -->
      <div v-if="previewUrl" class="relative flex-1 overflow-hidden flex flex-col">
        <video :src="previewUrl" controls playsinline
          class="flex-1 w-full object-contain"
          style="background:#000"
        />

        <!-- Action bar -->
        <div class="flex gap-3 px-4 py-4 pb-safe"
          style="background: rgba(0,0,0,0.9); border-top: 1px solid rgba(255,255,255,0.08)"
        >
          <button @click="retake" :disabled="uploading"
            class="flex-1 font-display text-lg py-3 transition-all"
            style="background: rgba(255,255,255,0.08); color: #fff; clip-path: polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
          >↩ ПЕРЕСНЯТЬ</button>
          <button @click="submitRecording" :disabled="uploading"
            class="flex-1 font-display text-lg py-3 transition-all flex items-center justify-center gap-2"
            :style="uploading
              ? { background: 'rgba(255,230,0,0.25)', color: '#FFE600', cursor: 'wait', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }
              : { background: '#FFE600', color: '#000', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }
            "
          >
            <span v-if="uploading" class="spinner-xs" style="border-color:rgba(0,0,0,0.2);border-top-color:#000"></span>
            {{ uploading ? 'ЗАГРУЖАЕМ...' : '✓ ИСПОЛЬЗОВАТЬ' }}
          </button>
        </div>
        <p v-if="uploadError" class="px-4 pb-3 font-condensed text-xs text-center" style="color:#EE8888; background:rgba(0,0,0,0.9)">{{ uploadError }}</p>
      </div>

    </div>

    <!-- ── PROCESSING OVERLAY ── -->
    <div v-if="revealLoading" class="fixed inset-0 z-[200] flex flex-col items-center justify-center" style="background:#000">
      <div class="font-display text-3xl tracking-widest mb-6" style="color:#FFE600">ОБРАБАТЫВАЕМ...</div>
      <span class="spinner-xs" style="border-color:rgba(255,255,255,0.15);border-top-color:#FFE600;width:2rem;height:2rem;border-width:3px"></span>
    </div>

    <!-- ── SCORE REVEAL OVERLAY ── -->
    <div v-if="scoreReveal" class="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 text-center" style="background:#000">
      <div class="font-condensed text-xs tracking-[0.3em] mb-10" style="color:rgba(255,255,255,0.35)">РЕЗУЛЬТАТ</div>

      <!-- Animated score number -->
      <div class="font-display leading-none" :style="{ fontSize: '9rem', lineHeight: 1, color: scoreColor(scoreReveal.score) }">
        {{ displayScore }}
      </div>

      <!-- Score label -->
      <div class="font-display text-2xl tracking-widest mt-4" :style="{ color: scoreColor(scoreReveal.score) }">
        {{ scoreLabel(scoreReveal.score) }}
      </div>

      <!-- XP earned -->
      <div class="font-condensed text-xl mt-3" style="color:rgba(255,255,255,0.45)">
        +{{ scoreReveal.points }} XP
      </div>

      <!-- AI feedback -->
      <p v-if="scoreReveal.feedback" class="font-condensed text-sm leading-relaxed mt-6 max-w-xs" style="color:rgba(255,255,255,0.65)">
        {{ scoreReveal.feedback }}
      </p>

      <!-- Action buttons -->
      <div class="flex flex-col gap-3 mt-10 w-full max-w-xs">
        <button @click="shareResult"
          class="w-full font-display text-lg py-4 transition-all active:scale-[0.97]"
          style="background:#FFE600; color:#000; clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >↗ ПОДЕЛИТЬСЯ</button>
        <button @click="goToClips"
          class="w-full font-display text-lg py-4 transition-all active:scale-[0.97]"
          style="background:rgba(255,255,255,0.15); color:#fff; clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >КЛИПЫ</button>
        <button @click="closeReveal"
          class="w-full font-display text-lg py-4 transition-all active:scale-[0.97]"
          style="background:rgba(255,255,255,0.08); color:#fff; clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >ЕЩЁ РАЗ</button>
      </div>
    </div>

  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ trickName?: string }>()
const emit = defineEmits<{ close: []; done: [] }>()

const router = useRouter()
const api = useApi()

const liveEl = ref<HTMLVideoElement>()
const previewUrl = ref('')
const cameraError = ref('')
const recording = ref(false)
const facingUser = ref(false)
const elapsed = ref(0)

let stream: MediaStream | null = null
let recorder: MediaRecorder | null = null
let chunks: Blob[] = []
let timer: ReturnType<typeof setInterval> | null = null
let recordedBlob: Blob | null = null

// ── Score reveal state ──────────────────────────────────────────────────────
const scoreReveal = ref<{ score: number; feedback: string; points: number } | null>(null)
const revealLoading = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const displayScore = ref(0)
let pollInterval: ReturnType<typeof setInterval> | null = null

function clearPoll() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
}

function scoreColor(score: number) {
  if (score >= 75) return '#4ade80'
  if (score >= 50) return '#FFE600'
  return '#EE8888'
}

function scoreLabel(score: number) {
  if (score >= 75) return 'ОГОНЬ 🔥'
  if (score >= 50) return 'НЕПЛОХО'
  return 'ПРОМАХ'
}

// Count-up animation when reveal appears
watch(scoreReveal, (val) => {
  if (!val) { displayScore.value = 0; return }
  const target = val.score
  if (target === 0) { displayScore.value = 0; return }
  const duration = 1500
  const stepCount = 60
  const stepVal = Math.max(1, Math.ceil(target / stepCount))
  let current = 0
  const anim = setInterval(() => {
    current = Math.min(current + stepVal, target)
    displayScore.value = current
    if (current >= target) clearInterval(anim)
  }, duration / stepCount)
})

async function submitRecording() {
  if (!recordedBlob || uploading.value) return
  uploadError.value = ''
  uploading.value = true

  const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm'
  const file = new File([recordedBlob], `video_${Date.now()}.${ext}`, { type: recordedBlob.type })
  const trickName = props.trickName ?? 'OLLIE'

  try {
    const fd = new FormData()
    fd.append('video', file)
    fd.append('trickName', trickName)
    const result = await api.postForm<any>('/submissions/free', fd)
    uploading.value = false

    if (result?.aiScore != null) {
      const score = Math.round(result.aiScore)
      scoreReveal.value = { score, feedback: result.aiFeedback ?? '', points: score }
    } else if (result?.id) {
      // Score not ready yet — poll
      revealLoading.value = true
      const submissionId = result.id
      let attempts = 0
      const maxAttempts = 15 // 30s / 2s
      pollInterval = setInterval(async () => {
        attempts++
        try {
          const data = await api.get<any>(`/submissions/${submissionId}`)
          if (data?.aiScore != null) {
            clearPoll()
            revealLoading.value = false
            const score = Math.round(data.aiScore)
            scoreReveal.value = { score, feedback: data.aiFeedback ?? '', points: score }
          }
        } catch {}
        if (attempts >= maxAttempts) {
          clearPoll()
          revealLoading.value = false
          scoreReveal.value = { score: 0, feedback: 'Результат обрабатывается — загляни в клипы позже', points: 0 }
        }
      }, 2000)
    } else {
      // Unexpected response — just close
      emit('done')
    }
  } catch (e: any) {
    uploading.value = false
    uploadError.value = e?.message ?? 'Ошибка загрузки. Попробуй ещё раз.'
  }
}

async function shareResult() {
  if (!scoreReveal.value) return
  const { score, feedback } = scoreReveal.value
  const label = scoreLabel(score)
  const text = `${label} — поставил ${score}/100 на KickOn! 🛹\n${feedback ? feedback.slice(0, 80) : ''}\nkickon.app`
  if (navigator.share) {
    try { await navigator.share({ text }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(text); alert('Скопировано!') } catch {}
  }
}

function closeReveal() {
  clearPoll()
  scoreReveal.value = null
  displayScore.value = 0
  retake()
}

function goToClips() {
  clearPoll()
  scoreReveal.value = null
  emit('done')
  router.push('/video')
}

// ── Camera logic ────────────────────────────────────────────────────────────

onMounted(() => startCamera())
onUnmounted(() => { stopAll(); clearPoll() })

async function startCamera() {
  cameraError.value = ''
  stopAll()
  if (!navigator?.mediaDevices?.getUserMedia) {
    cameraError.value = 'Камера требует HTTPS или приложение APK. В браузере по HTTP съёмка недоступна.'
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingUser.value ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    })
    if (liveEl.value) liveEl.value.srcObject = stream
  } catch (e: any) {
    const msg: Record<string, string> = {
      NotAllowedError: 'Доступ к камере запрещён. Разреши доступ в настройках браузера.',
      NotFoundError: 'Камера не найдена на этом устройстве.',
      NotReadableError: 'Камера занята другим приложением.',
      OverconstrainedError: 'Камера не поддерживает запрошенные параметры.',
      SecurityError: 'Камера заблокирована политикой безопасности. Нужен HTTPS.',
    }
    cameraError.value = msg[e.name] ?? `Ошибка камеры: ${e.message}`
  }
}

async function flipCamera() {
  facingUser.value = !facingUser.value
  await startCamera()
}

function toggleRecord() {
  recording.value ? stopRecord() : startRecord()
}

function startRecord() {
  if (!stream) return
  chunks = []
  elapsed.value = 0
  const mimeType = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4', ''].find(t => !t || MediaRecorder.isTypeSupported(t)) ?? ''
  recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
  recorder.onstop = () => {
    recordedBlob = new Blob(chunks, { type: recorder!.mimeType || 'video/webm' })
    previewUrl.value = URL.createObjectURL(recordedBlob)
    stopAll(false)
  }
  recorder.start(250)
  recording.value = true
  timer = setInterval(() => elapsed.value++, 1000)
}

function stopRecord() {
  recorder?.stop()
  recording.value = false
  if (timer) clearInterval(timer)
}

function retake() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  recordedBlob = null
  uploadError.value = ''
  startCamera()
}

function stopAll(stopStream = true) {
  recorder?.stop()
  if (timer) clearInterval(timer)
  recording.value = false
  if (stopStream && stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
}

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
</script>
