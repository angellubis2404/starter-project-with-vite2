import IndexedDBManager from '../../utils/indexed-db.js';

class FavoritesPage {
  constructor() {
    this.dbManager = new IndexedDBManager();
    this.container = document.querySelector('#main-content');
  }

  async render() {
    this.container.innerHTML = `
      <div class="favorites-page">
        <h2>Cerita Favorit</h2>
        <div id="favorites-list" class="stories-list">
          <p>Loading...</p>
        </div>
      </div>
    `;

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

      // For each favorite ID, we need to get the story data
      // Since favorites only store IDs, we'll show them with a note
      favorites.forEach(favId => {
        const favElement = document.createElement('div');
        favElement.className = 'story-item favorite-item';
        favElement.innerHTML = `
          <p>Story ID: ${favId}</p>
          <p><em>Data lengkap cerita akan ditampilkan saat online</em></p>
          <button class="remove-favorite-btn" data-id="${favId}">Hapus dari Favorit</button>
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
