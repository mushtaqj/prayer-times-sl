/**
 * Firebase module exports
 */

export { app, getMessagingInstance, VAPID_KEY } from './config'
export {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  subscribeToZone,
  unsubscribeFromZone,
  enablePushNotifications,
  disablePushNotifications,
  changeNotificationZone,
  getPushSettings,
  shouldShowLocationChangePrompt,
  setupForegroundMessaging,
} from './messaging'
