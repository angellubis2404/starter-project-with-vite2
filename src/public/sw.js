const CACHE_NAME = 'story-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/scripts/index.js',
  '/styles/styles.css',
  '/favicon.png',
  '/manifest.json',
  '/images/logo.png',
  '/offline.html' // tambahkan ini
];

// ==== Install service worker & simpan cache ====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ==== Fetch: cache-first fallback to network ====
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return (
        cacheRes ||
        fetch(event.request).catch(() => caches.match('/offline.html'))
      );
    })
  );
});

// ==== Hapus cache lama saat update ====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

/* ========== PUSH NOTIFICATION ========== */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Ada cerita baru!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/#/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Story App', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

/* ========== BACKGROUND SYNC ========== */
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
      const formData = new FormData();
      formData.append('description', story.description);
      formData.append('photo', story.photo);
      formData.append('lat', story.lat);
      formData.append('lon', story.lon);

      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${story.token}` },
        body: formData
      });

      if (response.ok) {
        const delTx = db.transaction(['offline-stories'], 'readwrite');
        delTx.objectStore('offline-stories').delete(story.id);
      }
    }
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('story-app-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('offline-stories')) {
        db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
