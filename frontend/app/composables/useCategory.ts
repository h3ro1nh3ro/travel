export function contrastColor(hex: string): string {
  if (!hex.startsWith('#') || hex.length < 7) return '#000000'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.5 ? '#000000' : '#ffffff'
}

export interface CategoryTheme {
  bg: string
  card: string
  panel: string
  primary: string
  accent: string
  text: string
  textMuted: string
  border: string
  isDark: boolean
  gradient: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  icon: string
  tagline: string
  game: string
  theme: CategoryTheme
  brightPrimary: string
  darkTheme?: Partial<CategoryTheme>
}

const DARK_OVERLAY = {
  bg: '#161616',
  card: '#1f1f1f',
  panel: '#282828',
  text: '#f0f0f0',
  textMuted: '#8a8a96',
  border: 'rgba(255,255,255,0.10)',
  isDark: true,
}

export const CATEGORIES: Category[] = [
  {
    id: 'skate',
    name: 'Skateboard',
    emoji: '🛹',
    icon: 'game-icons:skateboard',
    tagline: 'Street · Park · Vert',
    game: 'S.K.A.T.E.',
    brightPrimary: '#C8FF00',
    theme: {
      bg: '#ECECEA',
      card: '#F5F5F3',
      panel: '#FFFFFF',
      primary: '#0F0F0D',
      accent: '#C8FF00',
      text: '#0F0F0D',
      textMuted: '#666662',
      border: 'rgba(0,0,0,0.12)',
      isDark: false,
      gradient: 'from-lime-400 to-neutral-900',
    },
    darkTheme: {
      primary: '#9EBF28',
      accent: '#7A9810',
      border: 'rgba(158,191,40,0.15)',
      isDark: true,
    },
  },
  {
    id: 'bmx',
    name: 'BMX',
    emoji: '🚵',
    icon: 'game-icons:cycling',
    tagline: 'Dirt · Street · Park',
    game: 'B.M.X.',
    brightPrimary: '#4488EE',
    theme: {
      bg: '#E8EDF5',
      card: '#F0F4FA',
      panel: '#FFFFFF',
      primary: '#0D1B2A',
      accent: '#FF5500',
      text: '#0D1B2A',
      textMuted: '#4A5A6A',
      border: 'rgba(13,27,42,0.12)',
      isDark: false,
      gradient: 'from-orange-500 to-blue-900',
    },
    darkTheme: {
      primary: '#4488EE',
      accent: '#2266CC',
      textMuted: '#7A9AB8',
      border: 'rgba(68,136,238,0.16)',
      isDark: true,
    },
  },
  {
    id: 'scooter',
    name: 'Scooter',
    emoji: '🛴',
    icon: 'game-icons:kick-scooter',
    tagline: 'Park · Street',
    game: 'S.C.O.O.T.',
    brightPrimary: '#CC7744',
    theme: {
      bg: '#F5EDE6',
      card: '#FAF2EB',
      panel: '#FFFFFF',
      primary: '#1A0800',
      accent: '#FF4400',
      text: '#1A0800',
      textMuted: '#7A5535',
      border: 'rgba(26,8,0,0.12)',
      isDark: false,
      gradient: 'from-orange-500 to-red-700',
    },
    darkTheme: {
      primary: '#CC7744',
      accent: '#AA5533',
      textMuted: '#9A8070',
      border: 'rgba(204,119,68,0.16)',
      isDark: true,
    },
  },
]

// ── DISABLED — remove from CATEGORIES array to re-enable ──
export const DISABLED_CATEGORIES: Category[] = [
  {
    id: 'rollers',
    name: 'Rollers',
    emoji: '🛼',
    icon: 'game-icons:roller-skate',
    tagline: 'Aggressive · Freeskate',
    game: 'S.K.A.T.E.',
    brightPrimary: '#AAFF00',
    theme: {
      bg: '#EBEEE8',
      card: '#F3F5EE',
      panel: '#FFFFFF',
      primary: '#1A2A08',
      accent: '#AAFF00',
      text: '#1A2A08',
      textMuted: '#5A6A48',
      border: 'rgba(0,0,0,0.10)',
      isDark: false,
      gradient: 'from-lime-400 to-green-800',
    },
    darkTheme: {
      bg: '#050F02',
      card: '#0A1A06',
      panel: '#10240C',
      primary: '#AAFF00',
      accent: '#88CC00',
      text: '#EEF5E8',
      textMuted: '#6A8A58',
      border: 'rgba(170,255,0,0.12)',
      isDark: true,
    },
  },
  {
    id: 'surfskate',
    name: 'Surfskate',
    emoji: '🏄',
    icon: 'game-icons:surf-board',
    tagline: 'Flow · Carving',
    game: 'S.U.R.F.',
    brightPrimary: '#00D4C8',
    theme: {
      bg: '#f4ede0',
      card: '#ebe4d7',
      panel: '#dfd8cb',
      primary: '#00A89D',
      accent: '#FF9F1C',
      text: '#1a170f',
      textMuted: '#8a8070',
      border: 'rgba(0,0,0,0.08)',
      isDark: false,
      gradient: 'from-teal-400 to-cyan-500',
    }
  },
  {
    id: 'run',
    name: 'Бег',
    emoji: '🏃',
    icon: 'game-icons:running-shoe',
    tagline: 'Street · Trail · Track',
    game: 'R.U.N.',
    brightPrimary: '#00FF87',
    theme: {
      bg: '#EEEFEB',
      card: '#F5F5F2',
      panel: '#FFFFFF',
      primary: '#0A1A0E',
      accent: '#00FF87',
      text: '#0A1A0E',
      textMuted: '#4A6050',
      border: 'rgba(10,26,14,0.12)',
      isDark: false,
      gradient: 'from-emerald-400 to-neutral-900',
    },
    darkTheme: {
      bg: '#040C06',
      card: '#0A1A0E',
      panel: '#102816',
      primary: '#00FF87',
      accent: '#00CC6A',
      text: '#EEFAF2',
      textMuted: '#5A8A68',
      border: 'rgba(0,255,135,0.12)',
      isDark: true,
    },
  },
  {
    id: 'outdoor',
    name: 'Природа',
    emoji: '🌲',
    icon: 'game-icons:pine-tree',
    tagline: 'Вода · Лес · Поле · Рыбалка',
    game: 'O.U.T.',
    brightPrimary: '#5DBB63',
    theme: {
      bg: '#e2f0e4',
      card: '#eef7ef',
      panel: '#ffffff',
      primary: '#3a9040',
      accent: '#e09030',
      text: '#071509',
      textMuted: '#4a7050',
      border: 'rgba(58,144,64,0.15)',
      isDark: false,
      gradient: 'from-green-500 to-orange-400',
    }
  },
  {
    id: 'physical',
    name: 'Физуха',
    emoji: '⚡',
    icon: 'game-icons:biceps',
    tagline: 'Jump · Flip · Lift · Fish',
    game: 'F.I.T.',
    brightPrimary: '#00E5A0',
    theme: {
      bg: '#ddf4ed',
      card: '#eaf9f4',
      panel: '#ffffff',
      primary: '#00a878',
      accent: '#0090e0',
      text: '#021510',
      textMuted: '#3a7060',
      border: 'rgba(0,168,120,0.15)',
      isDark: false,
      gradient: 'from-emerald-400 to-cyan-500',
    }
  },
]

const useCategoryId = () => useState<string | null>('ko_cat_id', () => 'skate')

export function useCategory() {
  const currentCategoryId = useCategoryId()
  const { isDark } = useDarkMode()

  const ALL_CATEGORY: Category = {
    id: 'all',
    name: 'Все виды',
    emoji: '🌍',
    icon: 'game-icons:fire-bowl',
    tagline: 'Скейт · BMX · Ролики · Самокат · Сёрф · Бег · Физуха · Природа',
    game: 'S.K.A.T.E.',
    brightPrimary: '#8fa898',
    theme: {
      bg: '#eaecea',
      card: '#f4f5f4',
      panel: '#ffffff',
      primary: '#4a6858',
      accent: '#7a9888',
      text: '#111814',
      textMuted: '#5a7060',
      border: 'rgba(74,104,88,0.12)',
      isDark: false,
      gradient: 'from-green-700 to-slate-500',
    }
  }

  const rawCategory = computed(() => {
    if (currentCategoryId.value === 'all') return ALL_CATEGORY
    return CATEGORIES.find(c => c.id === currentCategoryId.value) ?? null
  })

  function darkThemeFor(cat: Category): CategoryTheme {
    return { ...cat.theme, ...DARK_OVERLAY, primary: cat.brightPrimary, ...cat.darkTheme } as CategoryTheme
  }

  const category = computed(() => {
    const cat = rawCategory.value
    if (!cat) return null
    if (!isDark.value) return cat
    return { ...cat, theme: darkThemeFor(cat) }
  })

  function applyTheme(cat: Category) {
    if (!import.meta.client) return

    // Brief sport-color flash during theme switch
    const flash = document.createElement('div')
    flash.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;background:${cat.brightPrimary};opacity:0;transition:opacity 0.15s ease`
    document.body.appendChild(flash)

    requestAnimationFrame(() => {
      flash.style.opacity = '0.1'
      const root = document.documentElement
      const t = isDark.value ? darkThemeFor(cat) : cat.theme
      root.style.setProperty('--t-bg', t.bg)
      root.style.setProperty('--t-card', t.card)
      root.style.setProperty('--t-panel', t.panel)
      root.style.setProperty('--t-primary', t.primary)
      root.style.setProperty('--t-on-primary', contrastColor(t.primary))
      root.style.setProperty('--t-accent', t.accent)
      root.style.setProperty('--t-text', t.text)
      root.style.setProperty('--t-muted', t.textMuted)
      root.style.setProperty('--t-border', t.border)
      root.setAttribute('data-theme', cat.id)
      root.setAttribute('data-dark', isDark.value ? '1' : '0')
      setTimeout(() => {
        flash.style.opacity = '0'
        setTimeout(() => flash.remove(), 200)
      }, 90)
    })
  }

  function setCategory(id: string) {
    const cat = id === 'all' ? ALL_CATEGORY : CATEGORIES.find(c => c.id === id)
    if (!cat) return
    currentCategoryId.value = id
    useCookie('ko_cat', { maxAge: 60 * 60 * 24 * 365, path: '/' }).value = id
    if (import.meta.client) {
      localStorage.setItem('challenge_category', id)
      applyTheme(cat)
    }
  }

  function loadSaved() {}

  const primaryContrast = computed(() => contrastColor(category.value?.theme.primary ?? '#FFE600'))

  return { category, currentCategoryId, setCategory, loadSaved, applyTheme, CATEGORIES, primaryContrast }
}
