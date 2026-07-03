self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try { data = event.data.json() } catch { data = { title: 'KickOn', body: event.data.text() } }
  const { title = 'KickOn', body = '', url = '/', icon = '/icon-192.png' } = data
  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, data: { url }, vibrate: [100, 50, 100],
      badge: '/icon-192.png',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
