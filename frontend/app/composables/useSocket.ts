import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  function connect() {
    if (socket?.connected) return socket
    const config = useRuntimeConfig()
    const base = (config.public.apiBase as string).replace('/api', '')
    const token = import.meta.client ? (localStorage.getItem('token') ?? undefined) : undefined
    socket = io(base, { auth: token ? { token } : {}, transports: ['websocket', 'polling'] })
    return socket
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
  }

  function getSocket() {
    return socket
  }

  return { connect, disconnect, getSocket }
}
