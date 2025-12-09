class IndexedDBManager {
  constructor() {
    this.dbName = 'story-app-db';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create offline-stories store
        if (!db.objectStoreNames.contains('offline-stories')) {
          const offlineStore = db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
          offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }

        // Create stories store for caching
        if (!db.objectStoreNames.contains('stories')) {
          const storiesStore = db.createObjectStore('stories', { keyPath: 'id' });
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveStory(storyData) {
    const transaction = this.db.transaction(['offline-stories'], 'readwrite');
    const store = transaction.objectStore('offline-stories');
    return new Promise((resolve, reject) => {
      const request = store.add(storyData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllStories() {
    const transaction = this.db.transaction(['stories'], 'readonly');
    const store = transaction.objectStore('stories');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveStoriesToCache(stories) {
    const transaction = this.db.transaction(['stories'], 'readwrite');
    const store = transaction.objectStore('stories');

    // Clear existing stories
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add new stories
    for (const story of stories) {
      await new Promise((resolve, reject) => {
        const request = store.add(story);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getFavorites() {
    const transaction = this.db.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const favorites = request.result.map(item => item.id);
        resolve(favorites);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStoriesByIds(ids) {
    const transaction = this.db.transaction(['stories'], 'readonly');
    const store = transaction.objectStore('stories');
    const stories = [];
    for (const id of ids) {
      const request = store.get(id);
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          if (request.result) {
            stories.push(request.result);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
    return stories;
  }

  async toggleFavorite(storyId) {
    const transaction = this.db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');

    return new Promise(async (resolve, reject) => {
      const getRequest = store.get(storyId);
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          // Remove from favorites
          const deleteRequest = store.delete(storyId);
          deleteRequest.onsuccess = () => resolve(false);
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          // Add to favorites
          const addRequest = store.add({ id: storyId });
          addRequest.onsuccess = () => resolve(true);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteStory(storyId) {
    const transaction = this.db.transaction(['stories'], 'readwrite');
    const store = transaction.objectStore('stories');
    return new Promise((resolve, reject) => {
      const request = store.delete(storyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineStories() {
    const transaction = this.db.transaction(['offline-stories'], 'readonly');
    const store = transaction.objectStore('offline-stories');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineStories() {
    const transaction = this.db.transaction(['offline-stories'], 'readwrite');
    const store = transaction.objectStore('offline-stories');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default IndexedDBManager;
