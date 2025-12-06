import CONFIG from '../config.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

class PushNotificationManager {
  constructor() {
    this.registration = null;
    this.isSubscribed = false;
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const subscription = await this.registration.pushManager.getSubscription();
        this.isSubscribed = !!subscription;

        if (!subscription) {
          await this.subscribe();
        }

        return true;
      } catch (error) {
        console.error('Push notification initialization failed:', error);
        return false;
      }
    }
    return false;
  }

  async subscribe() {
    try {
      const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'));
      const auth = arrayBufferToBase64(subscription.getKey('auth'));
      const endpoint = subscription.endpoint;

      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint,
          keys: {
            p256dh,
            auth
          }
        })
      });

      if (response.ok) {
        this.isSubscribed = true;
        console.log('Successfully subscribed to push notifications');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  }

  async unsubscribe() {
    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;

        const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            endpoint
          })
        });

        if (response.ok) {
          await subscription.unsubscribe();
          this.isSubscribed = false;
          console.log('Successfully unsubscribed from push notifications');
        }
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
    }
  }

  getSubscriptionStatus() {
    return this.isSubscribed;
  }

  // Simulate sending push notification (in real app, this would be server-side)
  async sendNotification(title, body, icon = '/favicon.png', storyId = null) {
    if (this.registration) {
      const options = {
        body: body,
        icon: icon,
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
          storyId: storyId,
          dateOfArrival: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: 'Lihat Cerita',
            icon: '/favicon.png'
          },
          {
            action: 'close',
            title: 'Tutup'
          }
        ]
      };

      await this.registration.showNotification(title, options);
    }
  }
}

export default PushNotificationManager;
