<template>
  <div class="py-4">
    <!-- Header -->
    <div class="mb-5">
      <div class="inline-flex items-center gap-2 px-3 py-1 mb-4 font-display text-xs tracking-widest"
        style="background:var(--t-hi);color:#000;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
      >СООБЩЕСТВО</div>
      <div class="flex items-end justify-between gap-3">
        <h1 class="font-display text-5xl md:text-7xl tracking-widest leading-none" :style="{ color: 'var(--t-text)' }">
          ДВИ<span style="color:var(--t-hi)">ЖОК</span>
        </h1>
        <button v-if="isLoggedIn" @click="showCreate = true"
          class="font-display text-base px-4 py-2.5 shrink-0 transition-all active:scale-95"
          style="background:var(--t-hi);color:#000;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
        >+ ТОПИК</button>
        <NuxtLink v-else to="/auth"
          class="font-display text-base px-4 py-2.5 shrink-0 transition-all active:scale-95"
          style="border:1px solid color-mix(in srgb, var(--t-hi) 19%, transparent);color:var(--t-hi);clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
        >ВОЙТИ</NuxtLink>
      </div>
      <p class="font-condensed text-sm uppercase tracking-widest mt-1" :style="{ color: 'var(--t-muted)' }">Говори · Спрашивай · Делись</p>
    </div>

    <!-- Sort + Tag filters -->
    <div class="flex flex-col gap-2 mb-5">
      <div class="flex gap-2">
        <button v-for="s in sorts" :key="s.id" @click="sort = s.id"
          class="font-condensed text-xs uppercase tracking-widest px-3 py-1.5 transition-all whitespace-nowrap"
          :style="sort === s.id
            ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
            : { border: '1px solid var(--t-border)', color: 'var(--t-muted)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
        >{{ s.label }}</button>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button v-for="t in tags" :key="t" @click="tag = t"
          class="font-condensed text-xs uppercase tracking-widest px-3 py-1.5 transition-all whitespace-nowrap shrink-0"
          :style="tag === t
            ? { background: 'color-mix(in srgb, var(--t-hi) 13%, transparent)', color: 'var(--t-hi)', border: '1px solid color-mix(in srgb, var(--t-hi) 38%, transparent)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
            : { border: '1px solid var(--t-border)', color: 'var(--t-muted)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
        >{{ t }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="spinner"></div>
    </div>

    <!-- Posts -->
    <div v-else class="flex flex-col gap-3">
      <NuxtLink v-for="post in posts" :key="post.id" :to="`/forum/${post.id}`"
        class="block p-4 transition-all active:opacity-80"
        :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
      >
        <div class="flex items-start gap-3">
          <!-- Reactions column -->
          <div class="flex flex-col items-center gap-1 shrink-0 pt-0.5" @click.prevent>
            <button v-for="r in REACTIONS" :key="r.emoji" @click.prevent="react(post, r.emoji)"
              class="flex items-center justify-center w-7 h-7 rounded transition-all active:scale-90 text-base"
              :style="post.myEmoji === r.emoji
                ? { background: r.color + '28', outline: `1.5px solid ${r.color}60` }
                : { color: 'var(--t-muted)' }"
            >{{ r.emoji }}</button>
            <span class="font-display text-[10px] leading-none mt-0.5" :style="{ color: 'var(--t-muted)' }">
              {{ totalReactions(post) }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-condensed text-[10px] uppercase tracking-widest px-1.5 py-0.5 leading-none"
                style="background:color-mix(in srgb, var(--t-hi) 9%, transparent);color:var(--t-hi);border:1px solid color-mix(in srgb, var(--t-hi) 19%, transparent)"
              >{{ post.tag }}</span>
              <span class="font-condensed text-[10px]" :style="{ color: 'var(--t-muted)' }">{{ post.author.username }} · {{ timeAgo(post.createdAt) }}</span>
            </div>
            <h2 class="font-display text-base leading-tight mb-1" :style="{ color: 'var(--t-text)' }">{{ post.title }}</h2>
            <p class="font-condensed text-sm leading-snug line-clamp-2" :style="{ color: 'var(--t-muted)' }">{{ post.body }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="font-condensed text-xs flex items-center gap-1" :style="{ color: 'var(--t-muted)' }">
                💬 {{ post._count.comments }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>

      <div v-if="posts.length === 0" class="py-20 text-center">
        <div class="font-display text-4xl mb-2" style="color:var(--t-muted);opacity:0.2">ТИХО</div>
        <p class="font-condensed text-sm" :style="{ color: 'var(--t-muted)' }">Пока нет тем в этой категории</p>
      </div>
    </div>

    <!-- Floating create button (mobile) -->
    <button v-if="isLoggedIn" @click="showCreate = true"
      class="fixed bottom-20 right-4 z-40 font-display text-2xl w-14 h-14 flex items-center justify-center shadow-lg transition-all active:scale-90 md:hidden"
      style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
    >+</button>

    <!-- Create modal -->
    <Transition name="fade">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 md:pb-0"
        @click.self="showCreate = false"
      >
        <div class="w-full max-w-lg flex flex-col gap-4 p-5"
          :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }"
        >
          <div class="flex items-center justify-between">
            <span class="font-display text-xl tracking-widest" :style="{ color: 'var(--t-text)' }">НОВАЯ ТЕМА</span>
            <button @click="showCreate = false" class="font-display text-xl" :style="{ color: 'var(--t-muted)' }">✕</button>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button v-for="t in tags.filter(x => x !== 'все')" :key="t" @click="newTag = t"
              class="font-condensed text-xs uppercase tracking-widest px-2.5 py-1 transition-all"
              :style="newTag === t
                ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }
                : { border: '1px solid var(--t-border)', color: 'var(--t-muted)', clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }"
            >{{ t }}</button>
          </div>

          <input v-model="newTitle" placeholder="Заголовок"
            class="w-full px-3 py-2.5 font-display text-base outline-none"
            :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
          />
          <textarea v-model="newBody" placeholder="Расскажи подробнее..." rows="5"
            class="w-full px-3 py-2.5 font-condensed text-sm outline-none resize-none"
            :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
          />

          <div v-if="createError" class="font-condensed text-sm px-3 py-2"
            style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#EE8888"
          >{{ createError }}</div>

          <button @click="createPost"
            class="w-full font-display text-xl py-3 transition-all active:scale-[0.98]"
            style="background:var(--t-hi);color:#000;clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)"
          >ОПУБЛИКОВАТЬ</button>
        </div>
      </div>
    </Transition>

    <!-- Auth toast -->
    <Transition name="slide-up">
      <div v-if="authToast"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 font-condensed text-sm px-5 py-2.5 whitespace-nowrap"
        style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#aaa;clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)"
      >Войди чтобы реагировать</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Движок — Travel Challenges' })

const { isLoggedIn } = useAuth()
const api = useApi()

const sort = ref('new')
const tag  = ref('все')
const sorts = [
  { id: 'new', label: 'НОВОЕ' },
  { id: 'hot', label: 'ГОРЯЧЕЕ' },
  { id: 'top', label: 'ТОП' },
]
const tags = ['все', 'города', 'гастро', 'история', 'природа', 'спорт', 'советы', 'общее']

const posts = ref<any[]>([])
const pending = ref(true)

async function load() {
  pending.value = true
  try {
    const params = new URLSearchParams({ sort: sort.value })
    if (tag.value !== 'все') params.set('tag', tag.value)
    posts.value = await api.get<any[]>(`/posts?${params}`)
  } catch { posts.value = [] }
  pending.value = false
}

watch([sort, tag], load)
onMounted(load)

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m}м`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}ч`
  return `${Math.floor(h / 24)}д`
}

const REACTIONS = [
  { emoji: '🔥', color: '#F97316' },
  { emoji: '❤️', color: '#EE8888' },
  { emoji: '🌍', color: '#7CC89A' },
]

function totalReactions(post: any) {
  if (!post.reactions) return ''
  const t = Object.values(post.reactions as Record<string, number>).reduce((a: number, b: any) => a + Number(b), 0)
  return t > 0 ? t : ''
}

const authToast = ref(false)
let authTimer: ReturnType<typeof setTimeout>

async function react(post: any, emoji: string) {
  if (!isLoggedIn.value) {
    clearTimeout(authTimer)
    authToast.value = true
    authTimer = setTimeout(() => { authToast.value = false }, 2000)
    return
  }
  const prev = post.myEmoji
  post.myEmoji = prev === emoji ? null : emoji
  try {
    const res = await api.post<any>(`/posts/${post.id}/react`, { emoji })
    post.reactions = res.counts
    post.myEmoji = res.myEmoji
  } catch { post.myEmoji = prev }
}

// Create post
const showCreate = ref(false)
const newTitle   = ref('')
const newBody    = ref('')
const newTag     = ref('общее')
const createError = ref('')

async function createPost() {
  createError.value = ''
  if (!newTitle.value.trim() || !newBody.value.trim()) {
    createError.value = 'Заполни заголовок и текст'
    return
  }
  try {
    const post = await api.post<any>('/posts', { title: newTitle.value, body: newBody.value, tag: newTag.value })
    posts.value.unshift(post)
    showCreate.value = false
    newTitle.value = ''
    newBody.value = ''
    newTag.value = 'общее'
  } catch (e: any) {
    createError.value = e.message || 'Ошибка'
  }
}
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.spinner { width: 2rem; height: 2rem; border: 2px solid var(--t-border); border-top-color: var(--t-hi); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
