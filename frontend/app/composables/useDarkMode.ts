const _isDark = ref(false)

const LIGHT = { bg: '#F0F2F4', card: '#E4E6EB', panel: '#D6DAE0', text: '#0E1820', muted: '#4A5A70', border: 'rgba(0,0,0,0.12)', hi: '#007A72' }
const DARK  = { bg: '#131E1D', card: '#192826', panel: '#1F3330', text: '#D8EEEB', muted: '#7AADAA', border: 'rgba(110,207,199,0.10)', hi: '#6ECFC7' }

function applyTheme(dark: boolean) {
  if (!import.meta.client) return
  const t = dark ? DARK : LIGHT
  const r = document.documentElement
  r.style.setProperty('--t-bg',     t.bg)
  r.style.setProperty('--t-card',   t.card)
  r.style.setProperty('--t-panel',  t.panel)
  r.style.setProperty('--t-text',   t.text)
  r.style.setProperty('--t-muted',  t.muted)
  r.style.setProperty('--t-border', t.border)
  r.style.setProperty('--t-hi',     t.hi)
  r.setAttribute('data-dark', dark ? '1' : '0')
}

export function useDarkMode() {
  const isDark = _isDark

  function init(dark: boolean) {
    isDark.value = dark
    applyTheme(dark)
  }

  function toggle() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      document.documentElement.classList.add('ko-theme-transition')
      const val = isDark.value ? '1' : '0'
      useCookie('ko_dark', { maxAge: 60 * 60 * 24 * 365, path: '/' }).value = val
      localStorage.setItem('ko_dark', val)
      applyTheme(isDark.value)
      setTimeout(() => document.documentElement.classList.remove('ko-theme-transition'), 400)
    }
  }

  return { isDark, init, toggle }
}
