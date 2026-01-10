import { useState, useEffect } from 'react'
import { getStorageString, setStorageString } from '@/lib/storage'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = getStorageString('theme', '')
    if (saved) return saved === 'dark'
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      setStorageString('theme', 'dark')
    } else {
      root.classList.remove('dark')
      setStorageString('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  return { isDark, toggleTheme }
}
