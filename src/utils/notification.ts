export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export function isNotificationGranted(): boolean {
  return ('Notification' in window) && Notification.permission === 'granted';
} 