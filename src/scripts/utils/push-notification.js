import CONFIG from '../config.js';

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
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint: 'push-endpoint',
          keys: {
            p256dh: 'sample-p256dh-key',
            auth: 'sample-auth-key'
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
        await subscription.unsubscribe();
        this.isSubscribed = false;

        await fetch(`${CONFIG.BASE_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('Successfully unsubscribed from push notifications');
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
