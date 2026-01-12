import { useState, useEffect, useCallback } from 'react'
import { getStorageString, setStorageString } from '@/lib/utils/storage'
import {
  THEME_STORAGE_KEY,
  THEME_DARK,
  THEME_LIGHT,
  DARK_CLASS,
} from '@/lib/utils/themeConstants'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = getStorageString(THEME_STORAGE_KEY, '')
    if (saved) return saved === THEME_DARK
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add(DARK_CLASS)
      setStorageString(THEME_STORAGE_KEY, THEME_DARK)
    } else {
      root.classList.remove(DARK_CLASS)
      setStorageString(THEME_STORAGE_KEY, THEME_LIGHT)
    }
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), [])

  return { isDark, toggleTheme }
}
