export default defineNuxtPlugin(() => {
  const darkCookie = useCookie<string | null>('ko_dark')
  const { init } = useDarkMode()
  const isDark = darkCookie.value === '1'
  init(isDark)
  if (import.meta.client) {
    localStorage.setItem('ko_dark', isDark ? '1' : '0')
  }
})
