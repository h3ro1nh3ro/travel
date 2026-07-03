<template>
  <div class="max-w-md mx-auto mt-10">
    <div class="text-center mb-8">
      <div class="font-display text-5xl md:text-7xl mb-1" style="color:var(--t-hi)">
        {{ mode === 'login' ? 'ВОЙТИ' : 'СТАРТ' }}
      </div>
      <p class="font-condensed uppercase tracking-widest text-sm" :style="{ color: 'var(--t-muted)' }">
        {{ mode === 'login' ? 'Войди в аккаунт' : 'Создай аккаунт путешественника' }}
      </p>
    </div>

    <div class="p-6 md:p-8" :style="{ background: 'var(--t-card)', border: `1px solid var(--t-border)`, clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }">
      <div class="h-0.5 w-full mb-6" style="background:linear-gradient(to right,var(--t-hi),#F0BB72)"></div>

      <!-- Toggle -->
      <div class="flex gap-1 mb-6 p-1" :style="{ background: 'var(--t-panel)', border: `1px solid var(--t-border)` }">
        <button @click="mode = 'login'" class="flex-1 font-display text-xl py-2 transition-all"
          :style="mode === 'login' ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' } : { color: 'var(--t-muted)' }"
        >ВОЙТИ</button>
        <button @click="mode = 'register'" class="flex-1 font-display text-xl py-2 transition-all"
          :style="mode === 'register' ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' } : { color: 'var(--t-muted)' }"
        >РЕГИСТРАЦИЯ</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="font-display text-xs tracking-widest block mb-1" :style="{ color: 'var(--t-muted)' }">НИКНЕЙМ</label>
          <input v-model="form.username" type="text" placeholder="traveler_pro" autocomplete="username"
            class="w-full px-4 py-3 font-condensed outline-none transition-colors"
            :style="{ background: 'var(--t-panel)', border: `1px solid var(--t-border)`, color: 'var(--t-text)' }"
          />
        </div>
        <div>
          <label class="font-display text-xs tracking-widest block mb-1" :style="{ color: 'var(--t-muted)' }">ПАРОЛЬ</label>
          <div class="relative">
            <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••"
              autocomplete="current-password"
              class="w-full px-4 py-3 pr-11 font-condensed outline-none transition-colors"
              :style="{ background: 'var(--t-panel)', border: `1px solid var(--t-border)`, color: 'var(--t-text)' }"
            />
            <button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5" :style="{ color: 'var(--t-muted)' }">
              <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <p v-if="error" class="font-condensed text-sm uppercase tracking-widest" style="color:#EE8888">{{ error }}</p>

        <button type="submit" :disabled="loading" class="w-full font-display text-2xl py-3 mt-2 transition-all disabled:opacity-40"
          style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >{{ loading ? '...' : mode === 'login' ? 'ВОЙТИ' : 'ПОЕХАЛИ' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Вход — Travel Challenges' })
const router = useRouter()
const route = useRoute()
const { login, register } = useAuth()

const mode = ref<'login' | 'register'>(route.query.mode === 'register' ? 'register' : 'login')
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'login') {
      await login(form.username, form.password)
      const redirect = route.query.redirect as string
      router.push(redirect && redirect.startsWith('/') ? redirect : '/cities')
    } else {
      await register(form.username, form.password)
      router.push('/cities')
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
