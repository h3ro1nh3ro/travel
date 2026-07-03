interface User {
  id: number
  username: string
  email?: string
  points: number
  level: string
  avatar?: string
  bio?: string
  sport?: string
  interests?: string
  role?: string
}

const user = ref<User | null>(null)

export function useAuth() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = import.meta.client ? (localStorage.getItem('token') ?? '') : ''
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${base}${path}`, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(err.error || 'Request failed')
    }
    return res.json()
  }

  async function login(username: string, password: string) {
    if (!import.meta.client) return
    const { user: u, token } = await apiCall<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    localStorage.setItem('token', token)
    localStorage.setItem('challenge_user', JSON.stringify(u))
    user.value = u
  }

  async function register(username: string, password: string) {
    if (!import.meta.client) return
    const { user: u, token } = await apiCall<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    localStorage.setItem('token', token)
    localStorage.setItem('challenge_user', JSON.stringify(u))
    user.value = u
  }

  async function fetchMe() {
    if (!import.meta.client) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const u = await apiCall<User>('/users/me')
      user.value = u
      localStorage.setItem('challenge_user', JSON.stringify(u))
    } catch (e: any) {
      // Invalid / expired token — wipe it so user gets sent to login
      if (e.message?.includes('Invalid') || e.message?.includes('Unauthorized') || e.message?.includes('token')) {
        localStorage.removeItem('token')
        localStorage.removeItem('challenge_user')
        user.value = null
      }
    }
  }

  function logout() {
    if (!import.meta.client) return
    localStorage.removeItem('token')
    localStorage.removeItem('challenge_user')
    user.value = null
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, isLoggedIn, login, register, logout, fetchMe }
}
