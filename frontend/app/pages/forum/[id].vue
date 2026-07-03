<template>
  <div v-if="post">
    <!-- Back -->
    <NuxtLink to="/forum" class="font-condensed text-sm uppercase tracking-widest mb-4 inline-block transition-opacity active:opacity-60"
      :style="{ color: 'var(--t-muted)' }"
    >← ДВИЖОК</NuxtLink>

    <!-- Post -->
    <div class="mb-4 p-4"
      :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
    >
      <div class="flex items-start gap-3">
        <!-- Vote -->
        <div class="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button @click="votePost(1)"
            class="w-8 h-8 flex items-center justify-center font-display text-lg transition-all active:scale-90"
            :style="{ color: post.myVote === 1 ? 'var(--t-hi)' : 'var(--t-muted)' }"
          >▲</button>
          <span class="font-display text-base leading-none"
            :style="{ color: post.upvotes - post.downvotes > 0 ? 'var(--t-hi)' : post.upvotes - post.downvotes < 0 ? '#EE8888' : 'var(--t-muted)' }"
          >{{ post.upvotes - post.downvotes }}</span>
          <button @click="votePost(-1)"
            class="w-8 h-8 flex items-center justify-center font-display text-lg transition-all active:scale-90"
            :style="{ color: post.myVote === -1 ? '#EE8888' : 'var(--t-muted)' }"
          >▼</button>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="font-condensed text-[10px] uppercase tracking-widest px-1.5 py-0.5"
              style="background:color-mix(in srgb, var(--t-hi) 9%, transparent);color:var(--t-hi);border:1px solid color-mix(in srgb, var(--t-hi) 19%, transparent)"
            >{{ post.tag }}</span>
            <span class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">
              {{ post.author.username }} · {{ post.author.level }} · {{ timeAgo(post.createdAt) }}
            </span>
          </div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <h1 class="font-display text-xl leading-tight" :style="{ color: 'var(--t-text)' }">{{ post.title }}</h1>
            <button v-if="canEdit" @click="openEdit"
              class="shrink-0 font-condensed text-xs uppercase tracking-widest px-2 py-1 transition-all active:scale-90"
              :style="{ border: '1px solid var(--t-border)', color: 'var(--t-muted)' }"
            >✎ ИЗМЕНИТЬ</button>
          </div>
          <p class="font-condensed text-sm leading-relaxed whitespace-pre-line" :style="{ color: 'var(--t-text)' }">{{ post.body }}</p>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <Transition name="fade">
      <div v-if="showEdit" class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 md:pb-0"
        @click.self="showEdit = false"
      >
        <div class="w-full max-w-lg flex flex-col gap-4 p-5"
          :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }"
        >
          <div class="flex items-center justify-between">
            <span class="font-display text-xl tracking-widest" :style="{ color: 'var(--t-text)' }">РЕДАКТИРОВАТЬ</span>
            <button @click="showEdit = false" class="font-display text-xl" :style="{ color: 'var(--t-muted)' }">✕</button>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button v-for="t in editTags" :key="t" @click="editTag = t"
              class="font-condensed text-xs uppercase tracking-widest px-2.5 py-1 transition-all"
              :style="editTag === t
                ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }
                : { border: '1px solid var(--t-border)', color: 'var(--t-muted)', clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)' }"
            >{{ t }}</button>
          </div>
          <input v-model="editTitle" placeholder="Заголовок"
            class="w-full px-3 py-2.5 font-display text-base outline-none"
            :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
          />
          <textarea v-model="editBody" placeholder="Текст..." rows="6"
            class="w-full px-3 py-2.5 font-condensed text-sm outline-none resize-none"
            :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
          />
          <button @click="saveEdit"
            class="w-full font-display text-xl py-3 transition-all active:scale-[0.98]"
            style="background:var(--t-hi);color:#000;clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)"
          >СОХРАНИТЬ</button>
        </div>
      </div>
    </Transition>

    <!-- Comments header -->
    <div class="flex items-center gap-2 mb-3">
      <span class="font-display text-base tracking-widest" :style="{ color: 'var(--t-text)' }">КОММЕНТЫ</span>
      <span class="font-condensed text-sm" :style="{ color: 'var(--t-muted)' }">{{ post._count.comments }}</span>
    </div>

    <!-- Add comment -->
    <div v-if="isLoggedIn" class="mb-4 p-4"
      :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)' }"
    >
      <textarea v-model="newComment" placeholder="Напиши что думаешь..." rows="3"
        class="w-full px-3 py-2.5 font-condensed text-sm outline-none resize-none mb-3"
        :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
      />
      <div class="flex justify-end">
        <button @click="addComment(null)"
          class="font-display text-base px-5 py-2 transition-all active:scale-95"
          style="background:var(--t-hi);color:#000;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
        >ОТПРАВИТЬ</button>
      </div>
    </div>
    <div v-else class="mb-4 px-4 py-3 font-condensed text-sm"
      :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', color: 'var(--t-muted)' }"
    >
      <NuxtLink to="/auth" style="color:var(--t-hi)">Войди</NuxtLink> чтобы оставить комментарий
    </div>

    <!-- Comments list -->
    <div class="flex flex-col gap-3 mb-8">
      <div v-for="comment in post.comments" :key="comment.id">
        <div class="p-3" :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)' }">
          <div class="flex items-start gap-2">
            <div class="flex flex-col items-center gap-0.5 shrink-0">
              <button @click="voteComment(comment, 1)"
                class="w-5 h-5 flex items-center justify-center font-display text-xs transition-all active:scale-90"
                :style="{ color: comment.myVote === 1 ? 'var(--t-hi)' : 'var(--t-muted)' }"
              >▲</button>
              <span class="font-display text-[10px] leading-none"
                :style="{ color: comment.upvotes - comment.downvotes >= 0 ? 'var(--t-muted)' : '#EE8888' }"
              >{{ comment.upvotes - comment.downvotes }}</span>
              <button @click="voteComment(comment, -1)"
                class="w-5 h-5 flex items-center justify-center font-display text-xs transition-all active:scale-90"
                :style="{ color: comment.myVote === -1 ? '#EE8888' : 'var(--t-muted)' }"
              >▼</button>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-condensed text-xs font-bold" :style="{ color: 'var(--t-text)' }">{{ comment.author.username }}</span>
                <span class="font-condensed text-[10px]" :style="{ color: 'var(--t-muted)' }">{{ timeAgo(comment.createdAt) }}</span>
              </div>
              <p class="font-condensed text-sm leading-relaxed" :style="{ color: 'var(--t-text)' }">{{ comment.body }}</p>
              <button v-if="isLoggedIn" @click="replyingTo = replyingTo === comment.id ? null : comment.id"
                class="font-condensed text-xs uppercase tracking-widest mt-1.5 transition-opacity active:opacity-60"
                :style="{ color: 'var(--t-muted)' }"
              >{{ replyingTo === comment.id ? 'отмена' : 'ответить' }}</button>
            </div>
          </div>

          <!-- Reply input -->
          <div v-if="replyingTo === comment.id" class="mt-3 ml-7">
            <textarea v-model="replyText" placeholder="Ответить..." rows="2"
              class="w-full px-3 py-2 font-condensed text-sm outline-none resize-none mb-2"
              :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }"
            />
            <button @click="addComment(comment.id)"
              class="font-display text-sm px-4 py-1.5 transition-all active:scale-95"
              style="background:var(--t-hi);color:#000;clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
            >ОТВЕТИТЬ</button>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies?.length" class="ml-6 flex flex-col gap-1 mt-1">
          <div v-for="reply in comment.replies" :key="reply.id"
            class="p-3"
            :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', borderLeft: '2px solid color-mix(in srgb, var(--t-hi) 25%, transparent)' }"
          >
            <div class="flex items-start gap-2">
              <div class="flex flex-col items-center gap-0.5 shrink-0">
                <button @click="voteComment(reply, 1)"
                  class="w-5 h-5 flex items-center justify-center font-display text-xs transition-all active:scale-90"
                  :style="{ color: reply.myVote === 1 ? 'var(--t-hi)' : 'var(--t-muted)' }"
                >▲</button>
                <span class="font-display text-[10px] leading-none" :style="{ color: 'var(--t-muted)' }">{{ reply.upvotes - reply.downvotes }}</span>
                <button @click="voteComment(reply, -1)"
                  class="w-5 h-5 flex items-center justify-center font-display text-xs transition-all active:scale-90"
                  :style="{ color: reply.myVote === -1 ? '#EE8888' : 'var(--t-muted)' }"
                >▼</button>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-condensed text-xs font-bold" :style="{ color: 'var(--t-text)' }">{{ reply.author.username }}</span>
                  <span class="font-condensed text-[10px]" :style="{ color: 'var(--t-muted)' }">{{ timeAgo(reply.createdAt) }}</span>
                </div>
                <p class="font-condensed text-sm leading-relaxed" :style="{ color: 'var(--t-text)' }">{{ reply.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!pending" class="flex flex-col items-center justify-center py-32 gap-4">
    <div class="font-display text-4xl tracking-widest" style="color:var(--t-muted);opacity:0.3">NOT FOUND</div>
    <NuxtLink to="/forum" class="font-display text-base px-5 py-2.5"
      :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', color: 'var(--t-muted)', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
    >← ДВИЖОК</NuxtLink>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Движок — Travel Challenges' })

const route = useRoute()
const { isLoggedIn, user } = useAuth()
const api = useApi()

const isAdmin = computed(() => user.value?.role === 'ADMIN')
const isAuthor = computed(() => post.value && user.value && post.value.author.id === user.value.id)
const canEdit = computed(() => isAdmin.value || isAuthor.value)

const showEdit = ref(false)
const editTitle = ref('')
const editBody = ref('')
const editTag = ref('')
const editTags = ['города', 'гастро', 'история', 'природа', 'спорт', 'советы', 'общее']

function openEdit() {
  editTitle.value = post.value.title
  editBody.value = post.value.body
  editTag.value = post.value.tag
  showEdit.value = true
}

async function saveEdit() {
  if (!editTitle.value.trim() || !editBody.value.trim()) return
  try {
    const updated = await api.put<any>(`/posts/${post.value.id}`, {
      title: editTitle.value.trim(),
      body: editBody.value.trim(),
      tag: editTag.value,
    })
    post.value.title = updated.title
    post.value.body = updated.body
    post.value.tag = updated.tag
    showEdit.value = false
  } catch {}
}

const post    = ref<any>(null)
const pending = ref(true)

async function load() {
  pending.value = true
  try { post.value = await api.get<any>(`/posts/${route.params.id}`) } catch {}
  pending.value = false
}

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

async function votePost(value: 1 | -1) {
  if (!post.value) return
  const prev = post.value.myVote
  const isSame = prev === value
  if (isSame) {
    post.value.myVote = 0
    value === 1 ? post.value.upvotes-- : post.value.downvotes--
  } else {
    if (prev === 1) post.value.upvotes--
    if (prev === -1) post.value.downvotes--
    post.value.myVote = value
    value === 1 ? post.value.upvotes++ : post.value.downvotes++
  }
  try {
    const res = await api.post<any>(`/posts/${post.value.id}/vote`, { value })
    post.value.upvotes = res.upvotes
    post.value.downvotes = res.downvotes
    post.value.myVote = res.myVote
  } catch {}
}

async function voteComment(comment: any, value: 1 | -1) {
  const prev = comment.myVote
  const isSame = prev === value
  if (isSame) {
    comment.myVote = 0
    value === 1 ? comment.upvotes-- : comment.downvotes--
  } else {
    if (prev === 1) comment.upvotes--
    if (prev === -1) comment.downvotes--
    comment.myVote = value
    value === 1 ? comment.upvotes++ : comment.downvotes++
  }
  try {
    const res = await api.post<any>(`/posts/comments/${comment.id}/vote`, { value })
    comment.upvotes = res.upvotes
    comment.downvotes = res.downvotes
    comment.myVote = res.myVote
  } catch {}
}

const newComment = ref('')
const replyingTo = ref<number | null>(null)
const replyText  = ref('')

async function addComment(parentId: number | null) {
  const body = parentId ? replyText.value : newComment.value
  if (!body.trim()) return
  try {
    const comment = await api.post<any>(`/posts/${post.value.id}/comments`, { body, parentId })
    if (parentId) {
      const parent = post.value.comments.find((c: any) => c.id === parentId)
      if (parent) { parent.replies = parent.replies || []; parent.replies.push(comment) }
      replyingTo.value = null
      replyText.value = ''
    } else {
      comment.replies = []
      post.value.comments.unshift(comment)
      newComment.value = ''
    }
    post.value._count.comments++
  } catch {}
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
