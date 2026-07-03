export function usePush() {
  const api = useApi()
  const { isLoggedIn } = useAuth()

  const supported = computed(() =>
    import.meta.client && 'serviceWorker' in navigator && 'PushManager' in window
  )

  async function subscribe() {
    if (!supported.value || !isLoggedIn.value) return

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) return

    const { publicKey } = await api.get<{ publicKey: string }>('/push/vapid-key')
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    const json = sub.toJSON()
    await api.post('/push/subscribe', {
      endpoint: json.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    })
  }

  async function unsubscribe() {
    if (!supported.value) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await api.del('/push/subscribe')
    await sub.unsubscribe()
  }

  return { supported, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}
