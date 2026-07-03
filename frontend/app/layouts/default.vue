<template>
  <div class="font-body flex flex-col" style="height:100vh;height:100dvh;overflow-x:hidden" :style="{ background: 'var(--t-bg)', color: 'var(--t-text)' }">

    <!-- Top accent bar -->
    <div class="flex-shrink-0 sticky top-0 z-[60]" :style="{ paddingTop: 'env(safe-area-inset-top)', background: 'var(--t-bg)' }">
      <div class="h-0.5 w-full" style="background: linear-gradient(to right, var(--t-hi), #F0BB72)"></div>
      <nav class="backdrop-blur-sm border-b" :style="{ background: 'var(--t-bg)', borderColor: 'var(--t-border)' }">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-11">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-0.5 shrink-0">
            <span class="font-display text-2xl tracking-widest transition-colors" style="color:var(--t-hi)">TRAVEL</span>
            <span class="font-display text-2xl tracking-widest" :style="{ color: 'var(--t-text)' }">CH</span>
            <span class="ml-1 font-display text-xs opacity-30" style="color:var(--t-hi)">™</span>
          </NuxtLink>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-1">
            <button @click="toggleDark" class="flex items-center justify-center w-8 h-8 transition-all hover:opacity-70" :style="{ color: 'var(--t-muted)' }">
              <Icon :name="isDark ? 'game-icons:sun' : 'game-icons:moon'" style="font-size: 1.1rem" />
            </button>
            <NuxtLink to="/cities" class="font-condensed font-bold text-xs uppercase tracking-widest px-3 py-2 transition-all" :style="{ color: isActive('/cities') ? 'var(--t-hi)' : 'var(--t-muted)' }">ГОРОДА</NuxtLink>
            <NuxtLink to="/feed" class="font-condensed font-bold text-xs uppercase tracking-widest px-3 py-2 transition-all" :style="{ color: isActive('/feed') ? 'var(--t-hi)' : 'var(--t-muted)' }">ЛЕНТА</NuxtLink>
            <NuxtLink to="/forum" class="font-condensed font-bold text-xs uppercase tracking-widest px-3 py-2 transition-all" :style="{ color: isActive('/forum') ? 'var(--t-hi)' : 'var(--t-muted)' }">ДВИЖОК</NuxtLink>
            <NuxtLink to="/leaderboard" class="font-condensed font-bold text-xs uppercase tracking-widest px-3 py-2 transition-all" :style="{ color: isActive('/leaderboard') ? 'var(--t-hi)' : 'var(--t-muted)' }">РЕЙТИНГ</NuxtLink>
            <template v-if="isLoggedIn">
              <NuxtLink to="/profile" class="flex items-center gap-2 ml-1 px-3 py-1.5 transition-all hover:opacity-80"
                :style="{ border: `1px solid var(--t-border)`, clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)' }"
              >
                <span class="font-display text-base leading-none" style="color:var(--t-hi)">{{ user?.points }}</span>
                <span class="font-condensed text-xs uppercase" :style="{ color: 'var(--t-muted)' }">xp</span>
                <span class="font-condensed font-bold text-xs" :style="{ color: 'var(--t-text)' }">{{ user?.username }}</span>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/auth" class="ml-2 font-condensed text-xs uppercase tracking-widest px-3 py-1.5 transition-all"
                :style="{ color: 'var(--t-muted)', border: `1px solid var(--t-border)`, clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }"
              >Войти</NuxtLink>
            </template>
          </div>

          <!-- Mobile: xp + dark + burger -->
          <div class="flex md:hidden items-center gap-3">
            <span v-if="isLoggedIn" class="font-display text-base" style="color:var(--t-hi)">{{ user?.points }} xp</span>
            <button @click="toggleDark" class="w-7 h-7 flex items-center justify-center" :style="{ color: 'var(--t-muted)' }">
              <Icon :name="isDark ? 'game-icons:sun' : 'game-icons:moon'" style="font-size: 1rem" />
            </button>
            <button @click="menuOpen = true" class="w-8 h-8 flex flex-col items-center justify-center gap-1.5" aria-label="Menu">
              <span class="block w-5 h-0.5" style="background:var(--t-hi)"></span>
              <span class="block w-5 h-0.5" style="background:var(--t-hi)"></span>
              <span class="block w-5 h-0.5" style="background:var(--t-hi)"></span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <main ref="mainEl" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.passive="onTouchEnd"
    >
      <div class="max-w-7xl mx-auto px-4 py-5 overflow-x-hidden">
        <Transition name="page" mode="out-in" appear>
          <div :key="route.path"><slot /></div>
        </Transition>
      </div>
    </main>

    <!-- Bottom Tab Bar -->
    <nav class="md:hidden flex-shrink-0 relative z-[60]"
      :style="{ background: 'var(--t-card)', borderTop: `1px solid var(--t-border)`, paddingBottom: 'env(safe-area-inset-bottom)' }"
    >
      <div class="flex items-stretch h-14">
        <NuxtLink to="/menu" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all border-t-2"
          :style="isActive('/menu') || isActive('/select') ? { color: 'var(--t-hi)', borderColor: 'var(--t-hi)' } : { color: 'var(--t-muted)', borderColor: 'transparent' }"
        >
          <Icon name="game-icons:joystick" style="font-size: 1.2rem" />
          <span class="font-condensed text-[9px] uppercase tracking-widest leading-none">МЕНЮ</span>
        </NuxtLink>

        <NuxtLink to="/cities" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all border-t-2"
          :style="isActive('/cities') || isActive('/challenges') ? { color: 'var(--t-hi)', borderColor: 'var(--t-hi)' } : { color: 'var(--t-muted)', borderColor: 'transparent' }"
        >
          <Icon name="game-icons:compass" style="font-size: 1.2rem" />
          <span class="font-condensed text-[9px] uppercase tracking-widest leading-none">ГОРОДА</span>
        </NuxtLink>

        <!-- FAB — МЕНЮ/ИГРАТЬ -->
        <div class="w-16 flex items-center justify-center relative shrink-0">
          <NuxtLink to="/menu" class="absolute -top-4 flex items-center justify-center transition-all active:scale-95"
            style="width:3rem;height:3rem;background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);box-shadow:0 0 24px color-mix(in srgb, var(--t-hi) 38%, transparent)"
          >
            <Icon name="game-icons:joystick" style="font-size: 1.35rem" />
          </NuxtLink>
        </div>

        <NuxtLink to="/forum" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all border-t-2"
          :style="isActive('/forum') ? { color: 'var(--t-hi)', borderColor: 'var(--t-hi)' } : { color: 'var(--t-muted)', borderColor: 'transparent' }"
        >
          <Icon name="game-icons:discussion" style="font-size: 1.2rem" />
          <span class="font-condensed text-[9px] uppercase tracking-widest leading-none">ДВИЖОК</span>
        </NuxtLink>

        <NuxtLink :to="isLoggedIn ? '/profile' : '/auth'" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all border-t-2"
          :style="isActive('/profile') || isActive('/auth') ? { color: 'var(--t-hi)', borderColor: 'var(--t-hi)' } : { color: 'var(--t-muted)', borderColor: 'transparent' }"
        >
          <Icon name="game-icons:person" style="font-size: 1.2rem" />
          <span class="font-condensed text-[9px] uppercase tracking-widest leading-none">ПРОФИЛЬ</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- XP toast -->
    <Transition name="toast-slide">
      <div v-if="xpToast" class="fixed top-16 left-1/2 -translate-x-1/2 z-[200] font-display text-base tracking-widest px-5 py-3 pointer-events-none whitespace-nowrap"
        style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
      >{{ xpToast }}</div>
    </Transition>

    <!-- Logout confirm -->
    <Transition name="fade">
      <div v-if="logoutConfirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
        <div class="w-full max-w-xs p-6 flex flex-col gap-4"
          :style="{ background: 'var(--t-card)', border: `1px solid var(--t-border)`, clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }"
        >
          <div class="font-display text-xl tracking-widest" :style="{ color: 'var(--t-text)' }">ВЫЙТИ?</div>
          <div class="flex gap-2">
            <button @click="logoutConfirm = false" class="flex-1 font-display text-base py-2.5"
              :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
            >ОТМЕНА</button>
            <button @click="doLogout" class="flex-1 font-display text-base py-2.5"
              style="background:#EE8888;color:#fff;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
            >ВЫЙТИ</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Swipe edge -->
    <div class="fixed left-0 top-0 bottom-0 z-[300] pointer-events-none"
      :style="{ width: swipeEdge + 'px', background: 'var(--t-hi)', opacity: swipeEdge > 0 ? 0.75 : 0, transition: swipeEdge === 0 ? 'opacity 0.15s ease, width 0.15s ease' : 'none' }"
    />

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="menuOpen" class="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" @click="menuOpen = false" />
    </Transition>

    <!-- Side drawer -->
    <Transition name="slide">
      <div v-if="menuOpen" class="md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
        :style="{ background: 'var(--t-card)', borderLeft: `1px solid var(--t-border)`, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }"
      >
        <div class="flex items-center justify-between px-5 h-11 border-b shrink-0" :style="{ borderColor: 'var(--t-border)' }">
          <span class="font-display text-xl tracking-widest" style="color:var(--t-hi)">МЕНЮ</span>
          <button @click="menuOpen = false" class="w-8 h-8 flex items-center justify-center font-display text-xl" :style="{ color: 'var(--t-muted)' }">✕</button>
        </div>

        <div class="px-5 py-3 border-b shrink-0" :style="{ borderColor: 'var(--t-border)' }">
          <template v-if="isLoggedIn">
            <NuxtLink to="/profile" @click="menuOpen = false" class="flex items-center gap-3 transition-all active:opacity-70">
              <div class="w-9 h-9 flex items-center justify-center font-display text-base shrink-0"
                style="background:var(--t-hi);color:#000;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              >{{ user?.username?.[0]?.toUpperCase() }}</div>
              <div class="flex-1">
                <p class="font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ user?.username }}</p>
                <p class="font-display text-base leading-none" style="color:var(--t-hi)">{{ user?.points }} <span class="font-condensed text-xs font-normal" :style="{ color: 'var(--t-muted)' }">xp</span></p>
              </div>
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex gap-2">
              <NuxtLink to="/auth" @click="menuOpen = false" class="flex-1 text-center font-display text-base py-2"
                style="background:var(--t-hi);color:#000;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              >ВОЙТИ</NuxtLink>
              <NuxtLink to="/auth?mode=register" @click="menuOpen = false" class="flex-1 text-center font-display text-base py-2"
                :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', border: `1px solid var(--t-border)`, clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
              >РЕГИСТРАЦИЯ</NuxtLink>
            </div>
          </template>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-1">
          <NuxtLink v-for="item in drawerItems" :key="item.to" :to="item.to" @click="menuOpen = false"
            class="flex items-center gap-4 px-4 py-2.5 font-display text-xl tracking-widest transition-all mb-0.5"
            :style="isActive(item.to) ? { color: 'var(--t-hi)', background: 'color-mix(in srgb, var(--t-hi) 6%, transparent)', clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)' } : { color: 'var(--t-muted)' }"
          >
            <Icon :name="item.icon" class="shrink-0" style="font-size: 1.75rem" />
            <span class="flex-1">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="px-5 py-3 border-t shrink-0 flex items-center justify-between" :style="{ borderColor: 'var(--t-border)' }">
          <button @click="toggleDark" class="flex items-center gap-2 font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">
            <Icon :name="isDark ? 'game-icons:sun' : 'game-icons:moon'" style="font-size: 1rem" />
            {{ isDark ? 'Светлая тема' : 'Тёмная тема' }}
          </button>
          <button v-if="isLoggedIn" @click="logoutConfirm = true" class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Выйти</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, logout } = useAuth()
const { isDark, toggle: toggleDark } = useDarkMode()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const logoutConfirm = ref(false)
const xpToast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

watch(() => route.path, () => { menuOpen.value = false })

function showXpToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  xpToast.value = msg
  toastTimer = setTimeout(() => { xpToast.value = '' }, 4000)
}

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function doLogout() {
  logout()
  menuOpen.value = false
  logoutConfirm.value = false
  router.push('/')
}

const drawerItems = [
  { to: '/menu',        icon: 'game-icons:joystick',         label: 'МЕНЮ' },
  { to: '/cities',      icon: 'game-icons:compass',          label: 'ГОРОДА' },
  { to: '/forum',       icon: 'game-icons:discussion',       label: 'ДВИЖОК' },
  { to: '/feed',        icon: 'game-icons:newspaper',        label: 'ЛЕНТА' },
  { to: '/map',         icon: 'game-icons:treasure-map',     label: 'КАРТА' },
  { to: '/leaderboard', icon: 'game-icons:trophy',           label: 'РЕЙТИНГ' },
  { to: '/profile',     icon: 'game-icons:person',           label: 'ПРОФИЛЬ' },
]

// Pull-to-refresh + swipe-back
const mainEl = ref<HTMLElement | null>(null)
let ptrStartY = 0, ptrTriggered = false
let swipeStartX = 0, swipeStartY = 0, swipeBackReady = false
const swipeEdge = ref(0)

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  ptrStartY = t.clientY; ptrTriggered = false
  swipeStartX = t.clientX; swipeStartY = t.clientY; swipeBackReady = false; swipeEdge.value = 0
}
function onTouchMove(e: TouchEvent) {
  const t = e.touches[0]
  const scrollTop = mainEl.value?.scrollTop ?? 0
  if (scrollTop === 0 && t.clientY - ptrStartY > 140) ptrTriggered = true
  if (swipeStartX < 32 && !ptrTriggered) {
    const dx = t.clientX - swipeStartX
    if (dx > 0 && Math.abs(dx) > Math.abs(t.clientY - swipeStartY) * 0.8) {
      swipeEdge.value = Math.min(dx / 4, 6)
      swipeBackReady = dx > 72
    }
  }
}
function onTouchEnd() {
  if (ptrTriggered) { ptrTriggered = false; window.location.reload() }
  if (swipeBackReady) router.back()
  swipeEdge.value = 0; swipeBackReady = false
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.page-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.page-enter-from { opacity: 0; transform: translateX(10px); }
.page-leave-to   { opacity: 0; transform: translateX(-6px); }
.slide-enter-active, .slide-leave-active { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }
</style>
