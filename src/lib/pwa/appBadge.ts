/**
 * App icon badge (Badging API).
 *
 * Works for installed PWAs on Android Chrome and on iOS 16.4+ Home Screen web
 * apps. The service worker sets the badge when a prayer reminder arrives and
 * the page clears it whenever the app is opened or brought to the foreground.
 * Both calls are safe no-ops where the API is missing.
 */

export interface BadgeNavigator {
  setAppBadge?: (contents?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

export const REMINDER_BADGE_COUNT = 1

function defaultNavigator(): BadgeNavigator | undefined {
  return (globalThis as { navigator?: BadgeNavigator }).navigator
}

export async function setAppBadge(
  count: number = REMINDER_BADGE_COUNT,
  nav: BadgeNavigator | undefined = defaultNavigator()
): Promise<boolean> {
  if (!nav || typeof nav.setAppBadge !== 'function') return false
  try {
    await nav.setAppBadge(count)
    return true
  } catch (error) {
    console.warn('[badge] setAppBadge failed:', error)
    return false
  }
}

export async function clearAppBadge(
  nav: BadgeNavigator | undefined = defaultNavigator()
): Promise<boolean> {
  if (!nav || typeof nav.clearAppBadge !== 'function') return false
  try {
    await nav.clearAppBadge()
    return true
  } catch (error) {
    console.warn('[badge] clearAppBadge failed:', error)
    return false
  }
}

/** Clear the badge now and every time the app comes back to the foreground. */
export function clearAppBadgeOnOpen(): void {
  if (typeof document === 'undefined') return
  void clearAppBadge()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void clearAppBadge()
  })
}
