const onlineCount = ref(1)
const activityFeedGlobal = ref<Array<{ user: string; action: string }>>([])
let _socketBound = false

const FAKE_ACTIVITY = [
  { user: 'Danya_SK8', action: 'выполнил Kickflip' },
  { user: 'mxm_ride', action: 'набрал 95 очков' },
  { user: 'kira_skates', action: 'завершил челлендж' },
  { user: 'serg_bmx', action: 'присоединился к руму' },
  { user: 'Pavel_Boards', action: 'занял 1-е место' },
]

if (import.meta.client) {
  const pick = () => FAKE_ACTIVITY[Math.floor(Math.random() * FAKE_ACTIVITY.length)]!
  activityFeedGlobal.value = [pick()!]
}

export function useOnlineUsers() {
  const { connect } = useSocket()

  const displayCount = computed(() => Math.max(1, onlineCount.value))
  const activityFeed = activityFeedGlobal

  function start() {
    if (_socketBound) return
    _socketBound = true
    const s = connect()
    s.on('presence:count', (count: number) => {
      onlineCount.value = count
    })
    s.on('connect', () => {})
    if (import.meta.client) {
      setInterval(() => {
        const item = FAKE_ACTIVITY[Math.floor(Math.random() * FAKE_ACTIVITY.length)]!
        activityFeedGlobal.value = [item]
      }, 7000)
    }
  }

  function stop() {}

  return { displayCount, activityFeed, start, stop }
}
