const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/scripts/index.js',
  '/scripts/pages/app.js',
  '/scripts/routes/routes.js',
  '/scripts/routes/url-parser.js',
  '/scripts/data/api.js',
  '/scripts/config.js',
  '/scripts/utils/index.js',
  '/scripts/pages/home/home-page.js',
  '/scripts/pages/add-story/add-story-page.js',
  '/scripts/pages/auth/login-page.js',
  '/scripts/pages/auth/register-page.js',
  '/scripts/pages/about/about-page.js',
  '/styles/styles.css',
  '/favicon.png',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Ada cerita baru!',
    icon: data.icon || '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      storyId: data.storyId
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

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cerita Baru', options)
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NEW_STORY_ADDED') {
    // Show notification when new story is added
    const story = event.data.story;
    const options = {
      body: `Cerita baru: "${story.description?.substring(0, 50)}..."`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        storyId: story.id,
        dateOfArrival: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'Lihat Cerita',
          icon: '/favicon.png'
        }
      ]
    };

    self.registration.showNotification('Cerita Baru Ditambahkan!', options);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Navigate to the story detail or home page
    event.waitUntil(
      clients.openWindow('/#/')
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offline-stories'], 'readonly');
    const store = transaction.objectStore('offline-stories');
    const offlineStories = await store.getAll();

    for (const story of offlineStories) {
      try {
        const formData = new FormData();
        formData.append('description', story.description);
        formData.append('photo', story.photo);
        formData.append('lat', story.lat);
        formData.append('lon', story.lon);

        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${story.token}`
          },
          body: formData
        });

        if (response.ok) {
          // Remove from offline storage
          const deleteTransaction = db.transaction(['offline-stories'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('offline-stories');
          await deleteStore.delete(story.id);
        }
      } catch (error) {
        console.error('Failed to sync story:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('story-app-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-stories')) {
        db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
