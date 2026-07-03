<template>
  <!-- pb-10 leaves room for the fixed social bar -->
  <div class="flex flex-col py-6 pb-10">

    <!-- ─── Logo + city ─── -->
    <div class="mb-5">
      <div class="font-display leading-none mb-2" style="font-size: clamp(2.8rem,12vw,5rem)">
        <span style="color:var(--t-hi)">TRAVEL</span><span :style="{ color: 'var(--t-text)' }">CH</span><span style="font-size:1rem;opacity:0.25;color:var(--t-hi)">™</span>
      </div>
      <NuxtLink v-if="city" to="/select"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all active:scale-95"
        style="background:color-mix(in srgb, var(--t-hi) 8%, transparent);border:1px solid color-mix(in srgb, var(--t-hi) 25%, transparent);clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
      >
        <span class="font-display text-sm tracking-widest" style="color:var(--t-hi)">{{ city.name.toUpperCase() }}</span>
        <span class="font-condensed text-xs ml-0.5" :style="{ color: 'var(--t-muted)' }">↺</span>
      </NuxtLink>
      <NuxtLink v-else to="/select"
        class="inline-flex font-condensed text-xs uppercase tracking-widest px-3 py-1.5"
        style="border:1px solid color-mix(in srgb, var(--t-hi) 25%, transparent);color:var(--t-hi);clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
      >ВЫБРАТЬ ГОРОД</NuxtLink>
    </div>

    <!-- ─── ИССЛЕДОВАТЬ ─── -->
    <div class="mb-2">
      <button @click="playOpen = !playOpen"
        class="w-full relative overflow-hidden flex items-center gap-4 px-5 py-5 transition-all active:scale-[0.99]"
        style="background:color-mix(in srgb,var(--t-hi) 8%,var(--t-card));border:1px solid color-mix(in srgb,var(--t-hi) 30%,transparent);clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
      >
        <div class="absolute left-0 top-0 bottom-0 w-0.5" style="background:var(--t-hi)" />
        <Icon name="game-icons:compass" class="shrink-0 relative z-10" style="font-size:2.5rem;color:var(--t-hi)" />
        <div class="flex-1 relative z-10 text-left">
          <div class="font-display text-3xl md:text-4xl tracking-widest leading-none mb-1" :style="{ color: 'var(--t-text)' }">ИССЛЕДОВАТЬ</div>
          <div class="font-condensed text-sm uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">
            {{ city ? city.name : 'Выбери город' }} · Задания и города
          </div>
        </div>
        <span class="font-display text-3xl leading-none shrink-0 relative z-10 transition-transform duration-300 select-none"
          style="color:var(--t-hi);display:inline-block"
          :style="{ transform: playOpen ? 'rotate(45deg)' : 'rotate(0deg)' }"
        >+</span>
      </button>

      <Transition @enter="slideEnter" @after-enter="slideAfterEnter" @leave="slideLeave">
        <div v-if="playOpen" class="grid grid-cols-2 gap-1.5 mt-1.5">
          <!-- Selected city with photo -->
          <NuxtLink v-if="city" :to="`/cities/${city.id}`"
            class="relative overflow-hidden flex flex-col items-end justify-end transition-all active:scale-[0.97] group"
            style="min-height:130px;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);border:1px solid color-mix(in srgb, var(--t-hi) 25%, transparent)"
          >
            <!-- City photo -->
            <img v-if="city"
              :src="`/images/cities/${city.id}.jpg`"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              :alt="city.name"
            />
            <!-- Fallback gradient -->
            <div v-else class="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
              :style="{ background: cityGradient(city.id) }"
            />
            <!-- Dark overlay for text legibility -->
            <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" />
            <!-- City name bottom-left -->
            <div class="relative z-10 w-full p-3">
              <div class="font-display text-sm tracking-widest leading-tight" style="color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.9)">{{ city.name.toUpperCase() }}</div>
              <div class="font-condensed text-[10px] mt-0.5" style="color:rgba(255,255,255,0.7)">{{ city.challengeCount ?? '' }} заданий</div>
            </div>
          </NuxtLink>

          <!-- All cities with Russia map -->
          <NuxtLink to="/cities"
            class="relative overflow-hidden flex flex-col items-end justify-end transition-all active:scale-[0.97] group"
            style="min-height:130px;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);border:1px solid color-mix(in srgb, var(--t-hi) 25%, transparent)"
          >
            <!-- Russia map image -->
            <img src="/images/russia-map.svg"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt="Карта России"
            />
            <!-- Dark overlay -->
            <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" />
            <!-- Label -->
            <div class="relative z-10 w-full p-3">
              <div class="font-display text-base tracking-widest leading-none" style="color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.9)">ВСЕ ГОРОДА</div>
              <div class="font-condensed text-[10px] mt-0.5" style="color:rgba(255,255,255,0.7)">Россия</div>
            </div>
          </NuxtLink>
        </div>
      </Transition>
    </div>

    <!-- ─── 3 section squares ─── -->
    <div class="grid grid-cols-3 gap-1.5 mb-3">
      <NuxtLink v-for="s in sceneItems" :key="s.to" :to="s.to"
        class="relative overflow-hidden flex flex-col items-center justify-center gap-2 py-6 px-2 text-center transition-all active:scale-[0.96]"
        :style="{
          background: `linear-gradient(135deg,var(--t-card),${s.color}15)`,
          border: `1px solid ${s.color}25`,
          clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)'
        }"
      >
        <Icon :name="s.icon" style="font-size:2.2rem" :style="{ color: s.color, opacity: 0.9 }" />
        <div class="font-display text-xs tracking-widest leading-none" :style="{ color: 'var(--t-text)' }">{{ s.title }}</div>
      </NuxtLink>
    </div>

    <!-- ─── Лента ─── -->
    <NuxtLink to="/feed"
      class="flex items-center gap-3 px-4 py-3 mb-3 transition-all active:opacity-70"
      style="background:linear-gradient(135deg,color-mix(in srgb, var(--t-hi) 7%, transparent),var(--t-card));border:1px solid color-mix(in srgb, var(--t-hi) 19%, transparent);clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
    >
      <Icon name="game-icons:scroll-unfurled" style="font-size:1.5rem;color:var(--t-hi);opacity:0.8" />
      <div class="flex-1 min-w-0">
        <div class="font-display text-sm tracking-widest" :style="{ color: 'var(--t-text)' }">ЛЕНТА СООБЩЕСТВА</div>
        <div class="font-condensed text-xs mt-0.5" :style="{ color: 'var(--t-muted)' }">Смотри что выполнили другие путешественники</div>
      </div>
      <span class="font-display text-lg" :style="{ color: 'var(--t-muted)' }">›</span>
    </NuxtLink>

    <!-- Admin -->
    <NuxtLink v-if="isAdmin" to="/admin"
      class="flex items-center gap-3 px-4 py-3 transition-all active:opacity-70"
      style="background:#EE888815;border:1px solid #EE888830;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
    >
      <Icon name="game-icons:shield" style="font-size:1.25rem;color:#EE8888" />
      <div class="font-display text-xs tracking-widest" style="color:#EE8888">ADMIN</div>
    </NuxtLink>
  </div>

  <!-- ─── Fixed social bar above bottom tab bar ─── -->
  <Teleport to="body">
    <div class="md:hidden fixed bottom-14 left-0 right-0 z-40 px-3 py-2 flex items-center gap-1.5"
      :style="{ background: 'var(--t-card)', borderTop: '1px solid var(--t-border)' }"
    >
      <span class="font-condensed text-[9px] uppercase tracking-widest shrink-0 mr-1" :style="{ color: 'var(--t-muted)' }">МЫ:</span>
      <a v-for="soc in socials" :key="soc.label"
        :href="soc.url" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-1.5 px-2.5 py-1.5 flex-1 justify-center transition-all active:opacity-60"
        :style="{
          background: `color-mix(in srgb, ${soc.color} 8%, var(--t-panel))`,
          border: `1px solid color-mix(in srgb, ${soc.color} 22%, transparent)`,
          clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)'
        }"
      >
        <Icon :name="soc.icon" style="font-size:0.85rem" :style="{ color: soc.color }" />
        <span class="font-display text-[10px] tracking-widest leading-none hidden sm:block" :style="{ color: soc.color }">{{ soc.label }}</span>
      </a>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Меню — Travel Challenges' })

const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string).replace('/api', '')

const { city } = useSelectedCity()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'ADMIN')

const playOpen = ref(false)

const gradients = [
  'linear-gradient(135deg,#0f4c75,#1b6ca8)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#2d6a4f,#40916c)',
  'linear-gradient(135deg,#7b2d8b,#a855f7)',
  'linear-gradient(135deg,#b5451b,#e07b39)',
]
function cityGradient(id: number) { return gradients[(id - 1) % gradients.length] }

const sceneItems = [
  { to: '/forum',       icon: 'game-icons:discussion',   title: 'ДВИЖОК',  color: 'var(--t-hi)' },
  { to: '/leaderboard', icon: 'game-icons:trophy',       title: 'РЕЙТИНГ', color: '#F0BB72' },
  { to: '/map',         icon: 'game-icons:treasure-map', title: 'КАРТА',   color: '#B490F0' },
]

const socials = [
  { icon: 'simple-icons:instagram', label: 'Instagram', color: '#D4839A', url: 'https://instagram.com' },
  { icon: 'simple-icons:telegram',  label: 'Telegram',  color: '#70B8D8', url: 'https://t.me' },
  { icon: 'simple-icons:vk',        label: 'VKontakte', color: '#8AABEE', url: 'https://vk.com' },
]

function slideEnter(el: Element) {
  const h = el as HTMLElement
  const height = h.scrollHeight
  h.style.overflow = 'hidden'
  h.style.maxHeight = '0'
  h.style.transition = 'none'
  void h.offsetHeight
  h.style.transition = 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)'
  h.style.maxHeight = height + 'px'
}
function slideAfterEnter(el: Element) {
  const h = el as HTMLElement
  h.style.maxHeight = ''
  h.style.overflow = ''
  h.style.transition = ''
}
function slideLeave(el: Element) {
  const h = el as HTMLElement
  h.style.maxHeight = h.scrollHeight + 'px'
  h.style.overflow = 'hidden'
  h.style.transition = 'none'
  void h.offsetHeight
  h.style.transition = 'max-height 0.25s ease'
  h.style.maxHeight = '0'
}
</script>
