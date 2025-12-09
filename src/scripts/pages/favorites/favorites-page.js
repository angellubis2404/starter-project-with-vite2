import IndexedDBManager from '../../utils/indexed-db.js';

class FavoritesPage {
  constructor() {
    this.dbManager = new IndexedDBManager();
    this.container = document.querySelector('#main-content');
  }

  async render() {
    return `
      <div class="favorites-page">
        <h2>Cerita Favorit</h2>
        <div id="favorites-list" class="stories-list">
          <p>Loading...</p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.loadFavorites();
  }

  async loadFavorites() {
    try {
      await this.dbManager.init();
      const favorites = await this.dbManager.getFavorites();

      const favoritesList = document.getElementById('favorites-list');

      if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>Tidak ada cerita favorit.</p>';
        return;
      }

      favoritesList.innerHTML = '';

      // Get full story data for favorites
      const favoriteStories = await this.dbManager.getStoriesByIds(favorites);

      favoriteStories.forEach(story => {
        const favElement = document.createElement('div');
        favElement.className = 'story-item favorite-item';
        favElement.innerHTML = `
          <img src="${story.photoUrl}" alt="${story.name}" style="max-width: 200px;">
          <h3>${story.name || 'Anonymous'}</h3>
          <p>${story.description || ''}</p>
          <p><small>${new Date(story.createdAt).toLocaleString()}</small></p>
          <button class="remove-favorite-btn" data-id="${story.id}">Hapus dari Favorit</button>
        `;
        favoritesList.appendChild(favElement);
      });

      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading favorites:', error);
      document.getElementById('favorites-list').innerHTML = '<p>Error loading favorites.</p>';
    }
  }

  attachEventListeners() {
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        try {
          await this.dbManager.toggleFavorite(storyId);
          e.target.closest('.favorite-item').remove();
          // Check if list is empty
          const favoritesList = document.getElementById('favorites-list');
          if (favoritesList.children.length === 0) {
            favoritesList.innerHTML = '<p>Tidak ada cerita favorit.</p>';
          }
        } catch (error) {
          console.error('Error removing favorite:', error);
        }
      });
    });
  }
}

export default FavoritesPage;
