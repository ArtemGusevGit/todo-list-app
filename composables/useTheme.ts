export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'notes-app-theme'
const DEFAULT_THEME: Theme = 'dark'

// Singleton — shared state across all useTheme() calls
const theme = ref<Theme>(DEFAULT_THEME)

function applyTheme(value: Theme) {
  theme.value = value
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', value)
    localStorage.setItem(STORAGE_KEY, value)
  }
}

export function useTheme() {
  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    applyTheme(saved ?? DEFAULT_THEME)
  }

  function toggle() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, toggle, init }
}
