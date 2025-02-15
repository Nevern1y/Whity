// This script runs before React hydration
export function themeScript() {
  return `
    (function() {
      try {
        function getInitialTheme() {
          try {
            const persistedColorPreference = window.localStorage.getItem('theme')
            const hasPersistedPreference = typeof persistedColorPreference === 'string'

            if (hasPersistedPreference) {
              return persistedColorPreference
            }

            const mql = window.matchMedia('(prefers-color-scheme: dark)')
            const hasMediaQueryPreference = typeof mql.matches === 'boolean'

            if (hasMediaQueryPreference) {
              return mql.matches ? 'dark' : 'light'
            }

            return 'light'
          } catch (err) {
            return 'light'
          }
        }

        const theme = getInitialTheme()
        const root = document.documentElement
        const body = document.body

        if (root && body) {
          root.style.setProperty('--initial-color-mode', theme)
          root.classList.add(theme)
          body.dataset.theme = theme

          // Prevent transition flashing
          root.classList.add('no-transitions')
          window.setTimeout(() => {
            root.classList.remove('no-transitions')
          }, 0)
        }
      } catch (err) {
        // Fail silently - the theme will be handled by React after hydration
        console.warn('Theme script error:', err)
      }
    })()
  `
} 