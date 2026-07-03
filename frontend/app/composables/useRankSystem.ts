export const RANK_TIERS = [
  { id: 'D', label: 'ROOKIE',    shortLabel: '0–499',   color: '#94a3b8', minPts: 0,    maxPts: 499   },
  { id: 'C', label: 'STREET',    shortLabel: '500–1499', color: '#7CC89A', minPts: 500,  maxPts: 1499  },
  { id: 'B', label: 'SHREDDER',  shortLabel: '1500–3499',color: '#88AAEE', minPts: 1500, maxPts: 3499  },
  { id: 'A', label: 'AMATEUR',   shortLabel: '3500–5999',color: '#F5A878', minPts: 3500, maxPts: 5999  },
  { id: 'S', label: 'SPONSORED', shortLabel: '6000–8999',color: '#B490F0', minPts: 6000, maxPts: 8999  },
  { id: 'R', label: 'LEGEND',    shortLabel: '9000+',    color: '#FFE600', minPts: 9000, maxPts: 999999},
]

export function useRankSystem(pts: Ref<number>) {
  const currentRank = computed(() =>
    [...RANK_TIERS].reverse().find(t => pts.value >= t.minPts) ?? RANK_TIERS[0]!
  )

  const nextRank = computed(() => {
    const idx = RANK_TIERS.findIndex(t => t.id === currentRank.value.id)
    return RANK_TIERS[idx + 1] ?? null
  })

  const ptsInClass  = computed(() => pts.value - currentRank.value.minPts)
  const classSpan   = computed(() => currentRank.value.maxPts - currentRank.value.minPts)
  const ptsLeft     = computed(() => currentRank.value.id === 'R' ? '—' : String(currentRank.value.maxPts - pts.value + 1))

  const rankPct = computed(() =>
    currentRank.value.id === 'R'
      ? 100
      : Math.min(100, Math.round((ptsInClass.value / classSpan.value) * 100))
  )

  const rankDisplay = computed(() => {
    if (currentRank.value.id === 'R') return 'R'
    const sub = Math.min(ptsInClass.value, classSpan.value)
    return currentRank.value.id + String(sub).padStart(3, '0').slice(0, 3)
  })

  return { currentRank, nextRank, ptsInClass, classSpan, ptsLeft, rankPct, rankDisplay }
}
