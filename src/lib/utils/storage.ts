/**
 * Safe localStorage utilities with error handling
 */

/**
 * Safely get an item from localStorage
 * Returns the stored value or the default value if storage fails
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue
    }
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

/**
 * Safely get a string item from localStorage (no JSON parsing)
 */
export function getStorageString(key: string, defaultValue: string): string {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue
    }
    return localStorage.getItem(key) ?? defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Safely set an item in localStorage
 * Returns true if successful, false if storage fails
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Safely set a string item in localStorage (no JSON stringification)
 */
export function setStorageString(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
