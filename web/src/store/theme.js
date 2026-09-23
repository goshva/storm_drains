import { reactive } from 'vue'

const THEME_KEY = 'storm_drains_theme'

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export const themeState = reactive({ theme: loadTheme() })

// Applied as soon as this module loads (main.js imports it before mounting
// the app), so there's no flash of the wrong theme on first paint.
applyTheme(themeState.theme)

export function setTheme(theme) {
  themeState.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
  applyTheme(theme)
}
