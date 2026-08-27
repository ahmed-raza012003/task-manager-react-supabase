export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export function fireBrowserNotification(title: string, body: string): boolean {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false
  try {
    new Notification(title, { body, icon: '/icons/icon-192.svg', tag: title })
    return true
  } catch {
    return false
  }
}
