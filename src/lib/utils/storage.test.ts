import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStorageItem,
  getStorageString,
  setStorageItem,
  setStorageString,
} from './storage'

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('getStorageItem', () => {
    it('should return default value when key does not exist', () => {
      const result = getStorageItem('nonexistent', { foo: 'bar' })
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should return stored value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify({ foo: 'baz' }))
      const result = getStorageItem('testKey', { foo: 'bar' })
      expect(result).toEqual({ foo: 'baz' })
    })

    it('should return default value on parse error', () => {
      localStorage.setItem('testKey', 'invalid json')
      const result = getStorageItem('testKey', { foo: 'bar' })
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should handle arrays', () => {
      localStorage.setItem('testKey', JSON.stringify([1, 2, 3]))
      const result = getStorageItem('testKey', [])
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle primitive values', () => {
      localStorage.setItem('testKey', JSON.stringify(42))
      const result = getStorageItem('testKey', 0)
      expect(result).toBe(42)
    })
  })

  describe('getStorageString', () => {
    it('should return default value when key does not exist', () => {
      const result = getStorageString('nonexistent', 'default')
      expect(result).toBe('default')
    })

    it('should return stored string when key exists', () => {
      localStorage.setItem('testKey', 'stored value')
      const result = getStorageString('testKey', 'default')
      expect(result).toBe('stored value')
    })

    it('should handle empty string as stored value', () => {
      localStorage.setItem('testKey', '')
      const result = getStorageString('testKey', 'default')
      expect(result).toBe('')
    })
  })

  describe('setStorageItem', () => {
    it('should store a value and return true', () => {
      const result = setStorageItem('testKey', { foo: 'bar' })
      expect(result).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('{"foo":"bar"}')
    })

    it('should store arrays', () => {
      const result = setStorageItem('testKey', [1, 2, 3])
      expect(result).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('[1,2,3]')
    })

    it('should return false when localStorage throws', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const result = setStorageItem('testKey', { foo: 'bar' })
      expect(result).toBe(false)

      mockSetItem.mockRestore()
    })
  })

  describe('setStorageString', () => {
    it('should store a string and return true', () => {
      const result = setStorageString('testKey', 'test value')
      expect(result).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('test value')
    })

    it('should handle empty strings', () => {
      const result = setStorageString('testKey', '')
      expect(result).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('')
    })

    it('should return false when localStorage throws', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const result = setStorageString('testKey', 'test')
      expect(result).toBe(false)

      mockSetItem.mockRestore()
    })
  })
})
