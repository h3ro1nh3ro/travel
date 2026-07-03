export function useApi() {
  const config = useRuntimeConfig()
  const base = import.meta.server
    ? ((config.apiBaseInternal as string) || config.public.apiBase)
    : config.public.apiBase

  async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 8000): Promise<T> {
    const token = import.meta.client ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>)
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${base}${path}`, { ...options, headers, signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'Request failed')
      }
      return res.json()
    } catch (e: any) {
      clearTimeout(timer)
      if (e.name === 'AbortError') throw new Error('Network timeout')
      throw e
    }
  }

  return {
    get:      <T>(path: string) => request<T>(path),
    post:     <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put:      <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    del:      <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    postForm: <T>(path: string, form: FormData) =>
      request<T>(path, { method: 'POST', body: form }, 120000),

    uploadForm: <T>(path: string, form: FormData, onProgress?: (pct: number) => void): Promise<T> =>
      new Promise((resolve, reject) => {
        if (!import.meta.client) { reject(new Error('SSR')); return }
        const token = localStorage.getItem('token')
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${base}${path}`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.timeout = 180_000
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100))
          })
        }
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)) } catch { reject(new Error('Bad response')) }
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed')) }
            catch { reject(new Error(`Upload failed: ${xhr.status}`)) }
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')))
        xhr.send(form)
      }),
  }
}
