import { reactive } from 'vue'

export const pwaState = reactive({ canInstall: false })

let deferredPrompt = null

export function initPwa() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    pwaState.canInstall = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    pwaState.canInstall = false
  })
}

export function isStandalone() {
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true
  )
}

export async function promptInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
  pwaState.canInstall = false
}
