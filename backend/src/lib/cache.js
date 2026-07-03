const store = new Map()

export function cacheGet(key) {
  const item = store.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) { store.delete(key); return null }
  return item.value
}

export function cacheSet(key, value, ttlMs = 30_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

// Invalidate all keys that start with prefix
export function cacheInvalidate(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

// Wrap an async fn with cache
export async function cached(key, fn, ttlMs = 30_000) {
  const hit = cacheGet(key)
  if (hit !== null) return hit
  const value = await fn()
  cacheSet(key, value, ttlMs)
  return value
}
