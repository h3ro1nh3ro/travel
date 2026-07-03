const _unread = ref(0)
let _bound = false

export function useMessages() {
  const api = useApi()
  const { isLoggedIn } = useAuth()

  async function fetchUnread() {
    if (!isLoggedIn.value) return
    try {
      const res = await api.get<{ count: number }>('/messages/unread')
      _unread.value = res.count
    } catch {}
  }

  function bindSocket() {
    if (!import.meta.client || _bound) return
    _bound = true
    const { connect } = useSocket()
    const socket = connect()
    socket.on('dm:new', () => { _unread.value++ })
  }

  function clearUnread() { _unread.value = 0 }

  return { unread: _unread, fetchUnread, bindSocket, clearUnread }
}
