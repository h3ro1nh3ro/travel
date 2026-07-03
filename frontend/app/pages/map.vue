<template>
  <div>
    <!-- Full-screen map -->
    <div class="relative -mx-4 -mt-5 -mb-5" style="height: calc(100dvh - 8rem)">

      <!-- Top overlay: city filter + category filter -->
      <div class="absolute top-0 left-0 right-0 z-[500] px-3 pt-3 pb-6"
        style="background:linear-gradient(to bottom,rgba(0,0,0,0.85) 0%,transparent 100%);pointer-events:none"
      >
        <div class="flex items-center gap-2 mb-2" style="pointer-events:auto">
          <!-- City filter -->
          <div class="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            <button v-for="c in cityFilters" :key="c.id"
              @click="setCity(c.id)"
              class="font-display text-xs uppercase tracking-widest px-3 py-1.5 whitespace-nowrap shrink-0 transition-all active:scale-95"
              :style="activeCity === c.id
                ? { background: 'var(--t-hi)', color: '#000', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)', boxShadow: '0 0 12px color-mix(in srgb, var(--t-hi) 40%, transparent)' }
                : { background: 'rgba(0,0,0,0.6)', color: 'var(--t-hi)', border: '1px solid rgba(0,201,167,0.4)', clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }"
            >{{ c.label }}</button>
          </div>
        </div>

        <!-- Category filter -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide" style="pointer-events:auto">
          <button v-for="cat in catFilters" :key="cat.id"
            @click="setCat(cat.id)"
            class="font-display text-[10px] uppercase tracking-widest px-2.5 py-1 whitespace-nowrap shrink-0 transition-all active:scale-95"
            :style="activeCat === cat.id
              ? { background: cat.color, color: '#000', clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }
              : { background: 'rgba(0,0,0,0.5)', color: cat.color, border: `1px solid ${cat.color}60`, clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }"
          >{{ cat.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <Transition name="fade">
        <div v-if="mapLoading" class="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-4"
          style="background:var(--t-bg)"
        >
          <div class="font-display text-4xl tracking-widest animate-pulse" style="color:var(--t-hi)">КАРТА</div>
          <div class="flex gap-1.5">
            <div v-for="i in 3" :key="i" class="w-2 h-2 animate-bounce"
              style="background:var(--t-hi);clip-path:polygon(3px 0%,100% 0%,calc(100% - 3px) 100%,0% 100%)"
              :style="{ animationDelay: `${i * 0.15}s` }"
            />
          </div>
          <div class="font-condensed text-xs uppercase tracking-widest" :style="{ color: 'var(--t-muted)' }">загружаю карту...</div>
        </div>
      </Transition>

      <!-- Leaflet map -->
      <div ref="mapEl" class="absolute inset-0" style="z-index:0" />

      <!-- Bottom sheet on challenge select -->
      <Transition name="sheet-up">
        <div v-if="selected" class="absolute bottom-0 left-0 right-0 z-[500]"
          style="background:var(--t-card);border-top:1px solid rgba(0,201,167,0.2)"
          @touchstart="sheetTouchStart" @touchmove="sheetTouchMove" @touchend="sheetTouchEnd"
        >
          <!-- Handle -->
          <div class="flex justify-center pt-2.5 pb-1 cursor-grab">
            <div class="w-10 h-1 rounded-full" style="background:rgba(255,255,255,0.25)" />
          </div>

          <div class="px-4 pb-4">
            <!-- Header row -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-condensed text-[10px] uppercase tracking-widest px-1.5 py-0.5"
                    :style="{ background: catColor(selected.category) + '20', color: catColor(selected.category), clipPath: 'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)' }"
                  >{{ selected.category }}</span>
                  <span class="font-condensed text-[10px] uppercase" :style="{ color: diffColor(selected.difficulty) }">{{ diffLabel(selected.difficulty) }}</span>
                </div>
                <h3 class="font-display text-xl tracking-widest leading-tight" :style="{ color: 'var(--t-text)' }">{{ selected.title }}</h3>
                <p class="font-condensed text-xs mt-0.5" :style="{ color: 'var(--t-muted)' }">{{ selected.city?.name }}</p>
              </div>
              <div class="flex flex-col items-end shrink-0">
                <span class="font-display text-2xl leading-none" style="color:var(--t-hi)">+{{ selected.xp }}</span>
                <span class="font-condensed text-[10px] uppercase" :style="{ color: 'var(--t-muted)' }">xp</span>
              </div>
            </div>

            <p class="font-condensed text-sm leading-relaxed mb-4" :style="{ color: 'var(--t-muted)' }">{{ selected.description }}</p>

            <!-- Status + action -->
            <div v-if="selected.completed" class="py-2.5 text-center font-display text-lg tracking-widest"
              style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
            >✓ ВЫПОЛНЕНО</div>
            <button v-else @click="goToChallenge"
              class="w-full py-2.5 font-display text-lg tracking-widest transition-all active:scale-[0.98]"
              style="background:var(--t-hi);color:#000;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
            >ВЫПОЛНИТЬ →</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, Marker, DivIcon } from 'leaflet'

useSeoMeta({ title: 'Карта — Travel Challenges' })

const config = useRuntimeConfig()
const { isDark } = useDarkMode()
const router = useRouter()

const mapEl = ref<HTMLDivElement>()
const mapLoading = ref(true)
const selected = ref<any>(null)
const activeCity = ref('all')
const activeCat = ref('all')

let leafletMap: LeafletMap | null = null
let tileLayerDark: any = null
let tileLayerLight: any = null
const markerRefs: Record<number, Marker> = {}

const cityFilters = [
  { id: 'all', label: 'Все города' },
  { id: '1',   label: 'СПб' },
  { id: '2',   label: 'Москва' },
  { id: '3',   label: 'Казань' },
]

const catFilters = [
  { id: 'all',      label: 'Все',       color: 'var(--t-hi)' },
  { id: 'История',  label: 'История',   color: '#F0BB72' },
  { id: 'Гастро',   label: 'Гастро',   color: '#EE8888' },
  { id: 'Спорт',    label: 'Спорт',    color: '#88AAEE' },
  { id: 'Арт',      label: 'Арт',      color: '#B490F0' },
  { id: 'Природа',  label: 'Природа',  color: '#7CC89A' },
]

const catColorMap: Record<string, string> = {
  'История': '#F0BB72', 'Гастро': '#EE8888', 'Спорт': '#88AAEE',
  'Арт': '#B490F0', 'Природа': '#7CC89A',
}
function catColor(cat: string) { return catColorMap[cat] ?? 'var(--t-hi)' }
function diffLabel(d: string) { return d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно' }
function diffColor(d: string) { return d === 'easy' ? '#7CC89A' : d === 'medium' ? '#F5C87A' : '#EE8888' }

const { data: challenges } = useAsyncData('map-challenges', async () => {
  const token = import.meta.client ? (localStorage.getItem('token') ?? '') : ''
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${config.public.apiBase}/challenges`, { headers })
  return res.json() as Promise<any[]>
}, { server: false })

function createIcon(ch: any, sel: boolean): DivIcon {
  const L = (window as any).L
  const color = catColor(ch.category)
  const w = sel ? 56 : 44
  const h = sel ? 38 : 30
  const bg = sel ? color : '#111'
  const textColor = sel ? '#000' : color
  const border = sel ? color : `${color}80`
  const glow = sel ? `0 0 16px ${color}cc, 0 4px 12px rgba(0,0,0,0.9)` : '0 2px 8px rgba(0,0,0,0.9)'
  const text = ch.title.split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase().slice(0, 3)
  return L.divIcon({
    className: '',
    html: `<div style="width:${w}px;height:${h}px;background:${bg};border:2px solid ${border};clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:${glow};overflow:hidden;position:relative">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${color}"></div>
      <span style="font-family:Impact,'Arial Black',sans-serif;font-size:${sel ? 12 : 10}px;font-weight:900;letter-spacing:0.08em;color:${textColor};line-height:1">${text}</span>
    </div>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
  })
}

function updateMarkers() {
  if (!leafletMap) return
  const all = challenges.value ?? []
  for (const ch of all) {
    const marker = markerRefs[ch.id]
    if (!marker) continue
    const visible = (activeCity.value === 'all' || String(ch.cityId) === activeCity.value)
      && (activeCat.value === 'all' || ch.category === activeCat.value)
    if (visible) marker.addTo(leafletMap)
    else marker.remove()
    marker.setIcon(createIcon(ch, selected.value?.id === ch.id))
  }
}

function setCity(id: string) {
  activeCity.value = id
  updateMarkers()
  // Pan to city center
  const centers: Record<string, [number, number]> = {
    '1': [59.9343, 30.3351], '2': [55.7558, 37.6173], '3': [55.7887, 49.1221],
  }
  if (id !== 'all' && centers[id] && leafletMap) {
    leafletMap.flyTo(centers[id], 13, { animate: true, duration: 0.8 })
  } else if (leafletMap) {
    leafletMap.flyTo([58, 35], 5, { animate: true, duration: 0.8 })
  }
}

function setCat(id: string) {
  activeCat.value = id
  updateMarkers()
}

watch(challenges, (list) => {
  if (!list || !leafletMap) return
  const L = (window as any).L
  for (const ch of list) {
    if (!ch.lat || !ch.lng) continue
    if (markerRefs[ch.id]) continue
    const marker = L.marker([ch.lat, ch.lng], { icon: createIcon(ch, false) })
      .addTo(leafletMap)
      .on('click', () => {
        selected.value = ch
        updateMarkers()
        leafletMap?.panTo([ch.lat, ch.lng], { animate: true, duration: 0.4 })
      })
    markerRefs[ch.id] = marker
  }
})

watch(isDark, (dark) => {
  if (!leafletMap) return
  if (dark) { tileLayerLight?.remove(); tileLayerDark?.addTo(leafletMap) }
  else { tileLayerDark?.remove(); tileLayerLight?.addTo(leafletMap) }
})

function goToChallenge() {
  if (selected.value) router.push(`/challenges/${selected.value.id}`)
}

// Swipe down to close sheet
let sheetStartY = 0
function sheetTouchStart(e: TouchEvent) { sheetStartY = e.touches[0].clientY }
function sheetTouchMove(_: TouchEvent) {}
function sheetTouchEnd(e: TouchEvent) {
  if (e.changedTouches[0].clientY - sheetStartY > 60) { selected.value = null; updateMarkers() }
}

async function initMap() {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default
  ;(window as any).L = L

  leafletMap = L.map(mapEl.value, {
    center: [59.9343, 30.3351],
    zoom: 12,
    zoomControl: false,
    attributionControl: false,
  })

  const tileOpts = { subdomains: 'abcd', maxZoom: 19 }
  tileLayerDark  = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',  tileOpts)
  tileLayerLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', tileOpts)
  ;(isDark.value ? tileLayerDark : tileLayerLight).addTo(leafletMap)

  tileLayerDark.once('load',  () => { mapLoading.value = false })
  tileLayerLight.once('load', () => { mapLoading.value = false })
  setTimeout(() => { mapLoading.value = false }, 4000)

  L.control.attribution({ position: 'bottomleft', prefix: '' })
    .addAttribution('© OSM © CARTO')
    .addTo(leafletMap)

  // Add markers if already loaded
  if (challenges.value?.length) {
    const L2 = (window as any).L
    for (const ch of challenges.value) {
      if (!ch.lat || !ch.lng || markerRefs[ch.id]) continue
      const marker = L2.marker([ch.lat, ch.lng], { icon: createIcon(ch, false) })
        .addTo(leafletMap)
        .on('click', () => {
          selected.value = ch
          updateMarkers()
          leafletMap?.panTo([ch.lat, ch.lng], { animate: true, duration: 0.4 })
        })
      markerRefs[ch.id] = marker
    }
  }
}

onMounted(initMap)
onUnmounted(() => { leafletMap?.remove(); leafletMap = null })
</script>

<style>
@import 'leaflet/dist/leaflet.css';
.leaflet-container { background: var(--t-bg, #0d1a1a); }
.leaflet-attribution-flag { display: none !important; }
.leaflet-control-attribution { background: rgba(0,0,0,0.6) !important; color: #555 !important; font-size: 9px !important; }
</style>

<style scoped>
.sheet-up-enter-active { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease; }
.sheet-up-leave-active { transition: transform 0.2s ease, opacity 0.15s ease; }
.sheet-up-enter-from, .sheet-up-leave-to { transform: translateY(100%); opacity: 0; }
.fade-enter-active { transition: opacity 0.3s ease; }
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
