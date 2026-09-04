import { describe, it, expect, vi } from 'vitest'
import { setAppBadge, clearAppBadge, REMINDER_BADGE_COUNT } from './appBadge'

describe('appBadge', () => {
  it('sets the reminder count when the API exists', async () => {
    const nav = { setAppBadge: vi.fn().mockResolvedValue(undefined) }
    expect(await setAppBadge(undefined, nav)).toBe(true)
    expect(nav.setAppBadge).toHaveBeenCalledWith(REMINDER_BADGE_COUNT)
  })

  it('clears the badge when the API exists', async () => {
    const nav = { clearAppBadge: vi.fn().mockResolvedValue(undefined) }
    expect(await clearAppBadge(nav)).toBe(true)
    expect(nav.clearAppBadge).toHaveBeenCalled()
  })

  it('is a no-op without the API', async () => {
    expect(await setAppBadge(1, {})).toBe(false)
    expect(await clearAppBadge({})).toBe(false)
    expect(await setAppBadge(1, undefined)).toBe(false)
  })

  it('swallows API errors', async () => {
    const nav = { setAppBadge: vi.fn().mockRejectedValue(new Error('nope')) }
    expect(await setAppBadge(1, nav)).toBe(false)
  })
})
