<template>
  <div class="min-h-screen" :style="{ background: 'var(--t-bg)' }">

    <div v-if="!isAdmin" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="font-display text-5xl tracking-widest mb-3" :style="{ color: 'var(--t-muted)' }">403</div>
        <p class="font-condensed text-sm mb-4" :style="{ color: 'var(--t-muted)' }">Нет доступа. Войдите как администратор.</p>
        <NuxtLink to="/auth" class="inline-block font-display text-sm tracking-widest px-6 py-2"
          style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
        >ВОЙТИ</NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        :style="{ background: 'var(--t-card)', borderBottom: '1px solid var(--t-border)' }"
      >
        <div class="flex items-center gap-3">
          <span class="font-display text-xl tracking-widest" style="color:var(--t-hi)">TRAVEL</span>
          <span class="font-display text-xl tracking-widest" :style="{ color: 'var(--t-text)' }">ADMIN</span>
          <span class="font-condensed text-xs px-2 py-0.5" style="background:#EE888820;color:#EE8888">ADMIN</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-condensed text-xs hidden sm:block" :style="{ color: 'var(--t-muted)' }">{{ user?.username }}</span>
          <NuxtLink to="/cities" class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">← Сайт</NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="overflow-x-auto pt-3" style="scrollbar-width:none">
        <div class="flex px-4 gap-0 border-b" :style="{ borderColor: 'var(--t-border)', minWidth: 'max-content' }">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            class="px-4 py-2.5 font-display text-xs tracking-widest whitespace-nowrap border-b-2 transition-colors"
            :style="activeTab === tab.id
              ? { color: 'var(--t-hi)', borderColor: 'var(--t-hi)' }
              : { color: 'var(--t-muted)', borderColor: 'transparent' }"
          >{{ tab.label }}</button>
        </div>
      </div>

      <div class="px-4 py-5 pb-16">

        <!-- STATS -->
        <div v-if="activeTab === 'stats'">
          <div v-if="!stats" class="font-condensed text-sm animate-pulse" :style="{ color: 'var(--t-muted)' }">загрузка...</div>
          <template v-else>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div v-for="s in statCards" :key="s.label" class="p-4"
                :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }"
              >
                <div class="font-display text-3xl mb-1" style="color:var(--t-hi)">{{ s.value }}</div>
                <div class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">{{ s.label }}</div>
              </div>
            </div>

            <div v-if="stats.pendingCount > 0" class="mb-6 px-4 py-3 flex items-center justify-between"
              style="background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.3);clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"
            >
              <div>
                <div class="font-display text-base tracking-widest" style="color:#F0BB72">{{ stats.pendingCount }} НА МОДЕРАЦИИ</div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">Требуют ручной проверки</div>
              </div>
              <button @click="activeTab = 'completions'; subStatus = 'pending'; loadCompletions()"
                class="font-display text-xs px-3 py-2 transition-all active:scale-95"
                style="background:#F0BB72;color:#000;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
              >ПРОВЕРИТЬ →</button>
            </div>

            <div class="font-display text-sm tracking-widest mb-3" :style="{ color: 'var(--t-text)' }">ГОРОДА</div>
            <div class="flex flex-col gap-2 mb-6">
              <div v-for="c in stats.cityStats" :key="c.id"
                class="flex items-center gap-3 px-4 py-2.5"
                :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)' }"
              >
                <div class="flex-1 font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ c.name }}</div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ c._count.challenges }} челленджей</div>
              </div>
            </div>

            <div class="font-display text-sm tracking-widest mb-3" :style="{ color: 'var(--t-text)' }">ПОСЛЕДНИЕ РЕГИСТРАЦИИ</div>
            <div class="flex flex-col gap-1.5">
              <div v-for="u in stats.recentUsers" :key="u.id"
                class="flex items-center gap-3 px-4 py-2.5"
                :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)' }"
              >
                <div class="flex-1 font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ u.username }}</div>
                <div class="font-display text-sm" style="color:var(--t-hi)">{{ u.points }} xp</div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ u.level }}</div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ fmtDate(u.createdAt) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- COMPLETIONS -->
        <div v-else-if="activeTab === 'completions'">
          <div class="flex gap-2 mb-4 flex-wrap">
            <button v-for="s in completionStatuses" :key="s.id" @click="subStatus = s.id; loadCompletions()"
              class="px-3 py-1.5 font-display text-xs tracking-widest transition-all active:scale-95"
              :style="subStatus === s.id
                ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
                : { background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
            >{{ s.label }}</button>
          </div>
          <p class="font-condensed text-xs mb-3" :style="{ color: 'var(--t-muted)' }">{{ compTotal }} записей</p>

          <div class="flex flex-col gap-3">
            <div v-for="c in completions" :key="c.id"
              :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }"
            >
              <!-- Photo -->
              <div v-if="c.photoUrl" class="relative" style="height:160px">
                <img :src="apiBase + c.photoUrl" :alt="c.challenge?.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 50%)" />
                <div class="absolute bottom-2 left-3 right-3">
                  <p class="font-display text-base text-white leading-tight">{{ c.challenge?.title }}</p>
                  <p class="font-condensed text-xs" style="color:rgba(255,255,255,0.6)">{{ c.challenge?.city?.name }}</p>
                </div>
              </div>

              <div class="px-4 py-3">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1">
                    <p class="font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ c.user?.username }}</p>
                    <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ fmtDate(c.createdAt) }}</p>
                  </div>
                  <!-- Status -->
                  <div class="font-condensed text-xs px-2 py-1"
                    :style="{
                      background: c.status === 'approved' ? 'color-mix(in srgb, var(--t-hi) 13%, transparent)' : c.status === 'pending' ? '#F0BB7220' : '#EE888820',
                      color: c.status === 'approved' ? 'var(--t-hi)' : c.status === 'pending' ? '#F0BB72' : '#EE8888',
                      clipPath: 'polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)'
                    }"
                  >{{ c.status === 'approved' ? '✓ ОДОБРЕНО' : c.status === 'pending' ? '⏳ ОЖИДАЕТ' : '✕ ОТКЛОНЕНО' }}</div>
                </div>

                <div v-if="c.aiFeedback" class="px-3 py-2 mb-3"
                  :style="{ background: 'var(--t-panel)', border: '1px solid var(--t-border)' }"
                >
                  <p class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">
                    <span style="color:var(--t-hi)">AI ({{ c.aiScore ?? '?' }}): </span>{{ c.aiFeedback }}
                  </p>
                </div>

                <div v-if="c.status === 'pending'" class="flex gap-2">
                  <button @click="moderateCompletion(c.id, 'approved')"
                    class="flex-1 font-display text-sm py-2 transition-all active:scale-95"
                    style="background:var(--t-hi);color:#000;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
                  >✓ ОДОБРИТЬ</button>
                  <button @click="moderateCompletion(c.id, 'rejected')"
                    class="flex-1 font-display text-sm py-2 transition-all active:scale-95"
                    style="background:#EE8888;color:#fff;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)"
                  >✕ ОТКЛОНИТЬ</button>
                  <button @click="deleteCompletion(c.id)"
                    class="px-3 py-2 font-display text-xs transition-all active:scale-95"
                    :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                  >УДЛ</button>
                </div>
                <button v-else @click="deleteCompletion(c.id)"
                  class="font-condensed text-xs" style="color:#EE8888"
                >удалить</button>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button v-if="compPage > 1" @click="compPage--; loadCompletions()" class="font-condensed text-xs px-3 py-1.5"
              :style="{ background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >← пред.</button>
            <button v-if="completions.length === compLimit" @click="compPage++; loadCompletions()" class="font-condensed text-xs px-3 py-1.5"
              :style="{ background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >след. →</button>
          </div>
        </div>

        <!-- CHALLENGES -->
        <div v-else-if="activeTab === 'challenges'">
          <div class="flex justify-end mb-4">
            <button @click="openChallengeForm(null)"
              class="px-4 py-2 font-display text-xs tracking-widest"
              style="background:var(--t-hi);color:#000;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"
            >+ ЧЕЛЛЕНДЖ</button>
          </div>

          <div class="flex flex-col gap-2">
            <div v-for="ch in challenges" :key="ch.id"
              class="px-4 py-3"
              :style="{ background: 'var(--t-card)', border: `1px solid ${ch.isActive ? 'var(--t-border)' : 'rgba(239,68,68,0.2)'}` }"
            >
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="font-condensed font-bold text-sm" :style="{ color: ch.isActive ? 'var(--t-text)' : 'var(--t-muted)' }">{{ ch.title }}</div>
                  <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">
                    {{ ch.city?.name }} · {{ ch.category }} · {{ ch.difficulty }} · {{ ch.xp }} xp · {{ ch._count.completions }} выполнений
                  </div>
                </div>
                <div class="shrink-0 flex flex-col items-end gap-1">
                  <div class="font-condensed text-xs px-1.5 py-0.5"
                    :style="{ background: ch.isActive ? '#7CC89A20' : '#EE888820', color: ch.isActive ? '#7CC89A' : '#EE8888' }"
                  >{{ ch.isActive ? 'активен' : 'скрыт' }}</div>
                  <div class="flex gap-2">
                    <button @click="openChallengeForm(ch)" class="font-condensed text-xs" style="color:var(--t-hi)">ред.</button>
                    <button @click="toggleChallenge(ch)" class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">
                      {{ ch.isActive ? 'скрыть' : 'показать' }}
                    </button>
                    <button @click="deleteChallenge(ch.id)" class="font-condensed text-xs" style="color:#EE8888">удал.</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- USERS -->
        <div v-else-if="activeTab === 'users'">
          <div class="flex items-center gap-3 mb-4">
            <input v-model="userSearch" placeholder="поиск по нику..." @input="loadUsers"
              class="flex-1 px-3 py-2 font-condensed text-sm outline-none"
              :style="{ background: 'var(--t-card)', color: 'var(--t-text)', border: '1px solid var(--t-border)' }"
            />
          </div>
          <p class="font-condensed text-xs mb-3" :style="{ color: 'var(--t-muted)' }">{{ usersTotal }} пользователей</p>
          <div class="flex flex-col gap-1.5">
            <div v-for="u in adminUsers" :key="u.id"
              class="flex items-center gap-3 px-4 py-3"
              :style="{ background: 'var(--t-card)', border: u.role === 'ADMIN' ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--t-border)' }"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-condensed font-bold text-sm" :style="{ color: 'var(--t-text)' }">{{ u.username }}</span>
                  <span v-if="u.role === 'ADMIN'" class="font-condensed text-xs px-1.5 py-0.5" style="background:#EE888820;color:#EE8888">ADMIN</span>
                </div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ u.email ?? '—' }} · {{ u._count.completions }} выполнений</div>
              </div>
              <div class="text-right shrink-0">
                <div class="font-display text-sm" style="color:var(--t-hi)">{{ u.points }} xp</div>
                <div class="font-condensed text-xs" :style="{ color: 'var(--t-muted)' }">{{ u.level }}</div>
              </div>
              <div class="flex gap-2 shrink-0">
                <button @click="openUserForm(u)" class="font-condensed text-xs" style="color:var(--t-hi)">ред.</button>
                <button v-if="u.id !== user?.id" @click="deleteUser(u.id, u.username)" class="font-condensed text-xs" style="color:#EE8888">удал.</button>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button v-if="userPage > 1" @click="userPage--; loadUsers()" class="font-condensed text-xs px-3 py-1.5"
              :style="{ background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >← пред.</button>
            <button v-if="adminUsers.length === userLimit" @click="userPage++; loadUsers()" class="font-condensed text-xs px-3 py-1.5"
              :style="{ background: 'var(--t-card)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >след. →</button>
          </div>
        </div>

        <!-- AI -->
        <div v-else-if="activeTab === 'ai'">
          <div v-if="aiLoading" class="font-condensed text-sm animate-pulse" :style="{ color: 'var(--t-muted)' }">загрузка...</div>
          <div v-else class="flex flex-col gap-2 max-w-md">
            <button v-for="m in aiAvailable" :key="m.provider + m.model" @click="switchAiModel(m)"
              :disabled="aiSwitching"
              class="w-full text-left px-4 py-3 relative transition-all active:scale-[0.99]"
              :style="{
                background: isCurrentAi(m) ? 'var(--t-hi)' : 'var(--t-card)',
                color: isCurrentAi(m) ? '#000' : 'var(--t-text)',
                border: isCurrentAi(m) ? 'none' : '1px solid var(--t-border)',
                clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)',
              }"
            >
              <div class="font-display text-sm tracking-widest">{{ m.label.split('·')[1]?.trim() }}</div>
              <div class="font-condensed text-xs mt-0.5 opacity-70">{{ m.label.split('·')[0].trim() }}</div>
              <div v-if="isCurrentAi(m)" class="absolute top-2 right-3 font-condensed text-xs">✓ активна</div>
              <div v-if="!aiKeys[m.provider]" class="font-condensed text-xs mt-1" style="color:#EE8888">нет ключа</div>
            </button>
            <p v-if="aiMsg" class="mt-2 font-condensed text-sm text-center" :style="{ color: aiMsgOk ? '#7CC89A' : '#EE8888' }">{{ aiMsg }}</p>
          </div>
        </div>

      </div>
    </template>

    <!-- Challenge form modal -->
    <Teleport to="body">
      <div v-if="challengeForm" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)" @click.self="challengeForm = null"
      >
        <div class="w-full max-w-lg" :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', maxHeight: '90dvh', overflowY: 'auto' }">
          <div class="px-5 py-4 border-b" :style="{ borderColor: 'var(--t-border)' }">
            <div class="font-display text-lg tracking-widest" :style="{ color: 'var(--t-text)' }">
              {{ challengeForm.id ? 'РЕДАКТИРОВАТЬ' : 'НОВЫЙ ЧЕЛЛЕНДЖ' }}
            </div>
          </div>
          <div class="px-5 py-4 flex flex-col gap-3">
            <!-- City -->
            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Город</div>
              <div class="flex gap-2">
                <button v-for="city in adminCities" :key="city.id" @click="challengeForm.cityId = city.id"
                  class="px-3 py-1.5 font-display text-xs tracking-widest"
                  :style="challengeForm.cityId === city.id
                    ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
                    : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
                >{{ city.name }}</button>
              </div>
            </div>

            <AdminInput v-model="challengeForm.title" label="Название" />
            <AdminInput v-model="challengeForm.description" label="Описание" type="textarea" />
            <AdminInput v-model="challengeForm.hint" label="Подсказка (необязательно)" />

            <!-- Category -->
            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Категория</div>
              <div class="flex gap-1.5 flex-wrap">
                <button v-for="cat in ['История','Гастро','Спорт','Арт','Природа']" :key="cat" @click="challengeForm.category = cat"
                  class="px-3 py-1 font-display text-xs tracking-widest"
                  :style="challengeForm.category === cat
                    ? { background: 'var(--t-hi)', color: '#000' }
                    : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                >{{ cat }}</button>
              </div>
            </div>

            <!-- Difficulty -->
            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Сложность</div>
              <div class="flex gap-1.5">
                <button v-for="d in [['easy','Легко'],['medium','Средне'],['hard','Сложно']]" :key="d[0]" @click="challengeForm.difficulty = d[0]"
                  class="px-3 py-1 font-display text-xs"
                  :style="challengeForm.difficulty === d[0]
                    ? { background: 'var(--t-hi)', color: '#000' }
                    : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                >{{ d[1] }}</button>
              </div>
            </div>

            <AdminInput v-model.number="challengeForm.xp" label="XP за выполнение" type="number" />

            <div class="grid grid-cols-2 gap-3">
              <AdminInput v-model="challengeForm.lat" label="Широта (lat)" type="number" />
              <AdminInput v-model="challengeForm.lng" label="Долгота (lng)" type="number" />
            </div>

            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Активен</div>
              <div class="flex gap-2">
                <button @click="challengeForm.isActive = true"
                  :style="challengeForm.isActive ? { background: '#7CC89A', color: '#000' } : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                  class="px-3 py-1.5 font-display text-xs"
                >ДА</button>
                <button @click="challengeForm.isActive = false"
                  :style="!challengeForm.isActive ? { background: '#EE8888', color: '#fff' } : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                  class="px-3 py-1.5 font-display text-xs"
                >НЕТ</button>
              </div>
            </div>
          </div>
          <div class="px-5 py-4 flex gap-3 border-t" :style="{ borderColor: 'var(--t-border)' }">
            <button @click="saveChallenge"
              class="flex-1 py-3 font-display text-sm tracking-widest"
              style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
            >{{ challengeForm.id ? 'СОХРАНИТЬ' : 'СОЗДАТЬ' }}</button>
            <button @click="challengeForm = null" class="px-4 py-3 font-display text-sm"
              :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >ОТМЕНА</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- User form modal -->
    <Teleport to="body">
      <div v-if="userForm" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)" @click.self="userForm = null"
      >
        <div class="w-full max-w-md" :style="{ background: 'var(--t-card)', border: '1px solid var(--t-border)', maxHeight: '90dvh', overflowY: 'auto' }">
          <div class="px-5 py-4 border-b" :style="{ borderColor: 'var(--t-border)' }">
            <div class="font-display text-lg tracking-widest" :style="{ color: 'var(--t-text)' }">{{ userForm.username }}</div>
          </div>
          <div class="px-5 py-4 flex flex-col gap-3">
            <AdminInput v-model="userForm.email" label="Email" />
            <AdminInput v-model.number="userForm.points" label="XP" type="number" />
            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Уровень</div>
              <div class="flex gap-1.5 flex-wrap">
                <button v-for="l in levels" :key="l" @click="userForm.level = l"
                  class="px-2.5 py-1 font-display text-xs"
                  :style="userForm.level === l
                    ? { background: 'var(--t-hi)', color: '#000' }
                    : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                >{{ l }}</button>
              </div>
            </div>
            <div>
              <div class="font-condensed text-xs mb-1.5 uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">Роль</div>
              <div class="flex gap-2">
                <button @click="userForm.role = 'USER'"
                  :style="userForm.role !== 'ADMIN' ? { background: 'var(--t-hi)', color: '#000' } : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                  class="px-3 py-1 font-display text-xs"
                >USER</button>
                <button @click="userForm.role = 'ADMIN'"
                  :style="userForm.role === 'ADMIN' ? { background: '#EE8888', color: '#fff' } : { background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
                  class="px-3 py-1 font-display text-xs"
                >ADMIN</button>
              </div>
            </div>
            <AdminInput v-model="userForm.bio" label="О себе" type="textarea" />
          </div>
          <div class="px-5 py-4 flex gap-3 border-t" :style="{ borderColor: 'var(--t-border)' }">
            <button @click="saveUser" class="flex-1 py-3 font-display text-sm tracking-widest"
              style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
            >СОХРАНИТЬ</button>
            <button @click="userForm = null" class="px-4 py-3 font-display text-sm"
              :style="{ background: 'var(--t-panel)', color: 'var(--t-muted)', border: '1px solid var(--t-border)' }"
            >ОТМЕНА</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const api = useApi()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string).replace('/api', '')
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'ADMIN')

const tabs = [
  { id: 'stats',       label: 'СТАТИСТИКА' },
  { id: 'completions', label: 'ВЫПОЛНЕНИЯ' },
  { id: 'challenges',  label: 'ЧЕЛЛЕНДЖИ' },
  { id: 'users',       label: 'ПОЛЬЗОВАТЕЛИ' },
  { id: 'ai',          label: 'AI' },
]
const activeTab = ref('stats')

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── Stats ──────────────────────────────────────────────────────────────────
const stats = ref<any>(null)
async function loadStats() {
  try { stats.value = await api.get('/admin/stats') } catch { /* silent */ }
}
const statCards = computed(() => stats.value ? [
  { label: 'Пользователей', value: stats.value.users },
  { label: 'Челленджей',    value: stats.value.challenges },
  { label: 'Выполнений',    value: stats.value.completions },
  { label: 'На проверке',   value: stats.value.pendingCount },
] : [])

// ── Completions ────────────────────────────────────────────────────────────
const completions = ref<any[]>([])
const compTotal = ref(0)
const compPage = ref(1)
const compLimit = 20
const subStatus = ref('')
const completionStatuses = [
  { id: '', label: 'ВСЕ' },
  { id: 'pending', label: 'ОЖИДАЮТ' },
  { id: 'approved', label: 'ОДОБРЕНЫ' },
  { id: 'rejected', label: 'ОТКЛОНЕНЫ' },
]

async function loadCompletions() {
  const params = new URLSearchParams({ page: String(compPage.value), limit: String(compLimit) })
  if (subStatus.value) params.set('status', subStatus.value)
  const data = await api.get<any>(`/admin/completions?${params}`)
  completions.value = data.items
  compTotal.value = data.total
}

async function moderateCompletion(id: number, status: string) {
  await api.put(`/admin/completions/${id}`, { status })
  loadCompletions()
  if (stats.value) loadStats()
}

async function deleteCompletion(id: number) {
  if (!confirm('Удалить это выполнение?')) return
  await api.del(`/admin/completions/${id}`)
  loadCompletions()
}

// ── Challenges ─────────────────────────────────────────────────────────────
const challenges = ref<any[]>([])
const challengeForm = ref<any>(null)
const adminCities = ref<any[]>([])

async function loadChallenges() {
  challenges.value = await api.get<any[]>('/admin/challenges')
}

async function loadCities() {
  adminCities.value = await api.get<any[]>('/admin/cities')
}

function openChallengeForm(ch: any) {
  if (ch) {
    challengeForm.value = { id: ch.id, cityId: ch.cityId, title: ch.title, description: ch.description,
      hint: ch.hint ?? '', category: ch.category, difficulty: ch.difficulty, xp: ch.xp,
      lat: ch.lat ?? '', lng: ch.lng ?? '', isActive: ch.isActive }
  } else {
    challengeForm.value = { cityId: adminCities.value[0]?.id, title: '', description: '', hint: '',
      category: 'История', difficulty: 'easy', xp: 50, lat: '', lng: '', isActive: true }
  }
}

async function saveChallenge() {
  const { id, ...data } = challengeForm.value
  if (id) await api.put(`/admin/challenges/${id}`, data)
  else await api.post('/admin/challenges', data)
  challengeForm.value = null
  loadChallenges()
}

async function toggleChallenge(ch: any) {
  await api.put(`/admin/challenges/${ch.id}`, { isActive: !ch.isActive })
  loadChallenges()
}

async function deleteChallenge(id: number) {
  if (!confirm('Удалить челлендж и все его выполнения?')) return
  await api.del(`/admin/challenges/${id}`)
  loadChallenges()
}

// ── Users ──────────────────────────────────────────────────────────────────
const adminUsers = ref<any[]>([])
const usersTotal = ref(0)
const userSearch = ref('')
const userPage = ref(1)
const userLimit = 50
const userForm = ref<any>(null)
const levels = ['Новичок','Путешественник','Исследователь','Бывалый','Знаток','Легенда','Амбассадор']

async function loadUsers() {
  const params = new URLSearchParams({ page: String(userPage.value), limit: String(userLimit) })
  if (userSearch.value) params.set('search', userSearch.value)
  const data = await api.get<any>(`/admin/users?${params}`)
  adminUsers.value = data.users
  usersTotal.value = data.total
}

function openUserForm(u: any) { userForm.value = { ...u } }

async function saveUser() {
  const { id, ...data } = userForm.value
  await api.put(`/admin/users/${id}`, data)
  userForm.value = null
  loadUsers()
}

async function deleteUser(id: number, name: string) {
  if (!confirm(`Удалить ${name}? Это необратимо.`)) return
  await api.del(`/admin/users/${id}`)
  loadUsers()
}

// ── AI ─────────────────────────────────────────────────────────────────────
const aiCurrent = ref<any>(null)
const aiAvailable = ref<any[]>([])
const aiKeys = ref<any>({})
const aiLoading = ref(false)
const aiSwitching = ref(false)
const aiMsg = ref('')
const aiMsgOk = ref(true)

function isCurrentAi(m: any) { return aiCurrent.value?.provider === m.provider && aiCurrent.value?.model === m.model }

async function loadAi() {
  aiLoading.value = true
  try {
    const data = await api.get<any>('/admin/ai')
    aiCurrent.value = data.current; aiAvailable.value = data.available; aiKeys.value = data.keys
  } finally { aiLoading.value = false }
}

async function switchAiModel(m: any) {
  if (isCurrentAi(m) || aiSwitching.value) return
  aiSwitching.value = true
  try {
    const data = await api.post<any>('/admin/ai', { provider: m.provider, model: m.model })
    aiCurrent.value = data.current; aiMsgOk.value = true; aiMsg.value = 'Переключено ✓'
  } catch { aiMsgOk.value = false; aiMsg.value = 'Ошибка' }
  finally { aiSwitching.value = false; setTimeout(() => aiMsg.value = '', 3000) }
}

// ── Tab watchers ───────────────────────────────────────────────────────────
watch(activeTab, (tab) => {
  if (tab === 'stats') loadStats()
  else if (tab === 'completions') loadCompletions()
  else if (tab === 'challenges') { loadChallenges(); loadCities() }
  else if (tab === 'users') loadUsers()
  else if (tab === 'ai') loadAi()
}, { immediate: true })
</script>
