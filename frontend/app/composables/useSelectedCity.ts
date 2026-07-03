interface SelectedCity {
  id: number
  name: string
  country: string
  coverImage?: string | null
  challengeCount?: number
}

const useCityState = () => useState<SelectedCity | null>('tc_selected_city', () => null)

export function useSelectedCity() {
  const city = useCityState()

  function setCity(c: SelectedCity) {
    city.value = c
    if (import.meta.client) {
      localStorage.setItem('tc_city', JSON.stringify(c))
    }
  }

  function clearCity() {
    city.value = null
    if (import.meta.client) {
      localStorage.removeItem('tc_city')
    }
  }

  function loadSaved() {
    if (!import.meta.client) return
    const raw = localStorage.getItem('tc_city')
    if (raw) {
      try { city.value = JSON.parse(raw) } catch {}
    }
  }

  return { city, setCity, clearCity, loadSaved }
}
