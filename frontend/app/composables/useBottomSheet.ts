export function useBottomSheet(onClose: () => void) {
  const sheetEl = ref<HTMLElement | null>(null)
  let startY = 0
  let currentY = 0
  let dragging = false

  function onTouchStart(e: TouchEvent) {
    startY = e.touches[0].clientY
    currentY = 0
    dragging = true
    if (sheetEl.value) {
      sheetEl.value.style.transition = 'none'
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging || !sheetEl.value) return
    const dy = e.touches[0].clientY - startY
    if (dy < 0) return // don't allow dragging up
    currentY = dy
    sheetEl.value.style.transform = `translateY(${dy}px)`
  }

  function onTouchEnd() {
    if (!dragging || !sheetEl.value) return
    dragging = false
    if (currentY > 120) {
      sheetEl.value.style.transition = 'transform 0.2s ease'
      sheetEl.value.style.transform = `translateY(100%)`
      setTimeout(onClose, 200)
    } else {
      sheetEl.value.style.transition = 'transform 0.25s cubic-bezier(0.16,1,0.3,1)'
      sheetEl.value.style.transform = ''
      setTimeout(() => {
        if (sheetEl.value) sheetEl.value.style.transition = ''
      }, 250)
    }
    currentY = 0
  }

  return { sheetEl, onTouchStart, onTouchMove, onTouchEnd }
}
