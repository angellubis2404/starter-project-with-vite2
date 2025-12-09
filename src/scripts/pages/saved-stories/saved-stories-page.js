import IndexedDBManager from '../../utils/indexed-db.js';

class SavedStoriesPage {
  constructor() {
    this.dbManager = new IndexedDBManager();
    this.container = document.querySelector('#main-content');
  }

  async render() {
    this.container.innerHTML = `
      <div class="saved-stories-page">
        <h2>Cerita Tersimpan</h2>
        <div id="saved-stories-list" class="stories-list">
          <p>Loading...</p>
        </div>
      </div>
    `;

    await this.loadSavedStories();
  }

  async loadSavedStories() {
    try {
      await this.dbManager.init();
      const savedStories = await this.dbManager.getAllStories();
      const favorites = await this.dbManager.getFavorites();

      const storiesList = document.getElementById('saved-stories-list');

      if (savedStories.length === 0 && favorites.length === 0) {
        storiesList.innerHTML = '<p>Tidak ada cerita tersimpan.</p>';
        return;
      }

      storiesList.innerHTML = '';

      // Display cached stories
      if (savedStories.length > 0) {
        storiesList.innerHTML += '<h3>Cerita dari Cache</h3>';
        savedStories.forEach(story => {
          const storyElement = this.createStoryElement(story, favorites.includes(story.id));
          storiesList.appendChild(storyElement);
        });
      }

      // Display favorites
      if (favorites.length > 0) {
        storiesList.innerHTML += '<h3>Cerita Favorit</h3>';
        const favoriteStories = await this.dbManager.getStoriesByIds(favorites);
        favoriteStories.forEach(story => {
          const favElement = this.createStoryElement(story, true);
          storiesList.appendChild(favElement);
        });
      }

      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading saved stories:', error);
      document.getElementById('saved-stories-list').innerHTML = '<p>Error loading saved stories.</p>';
    }
  }

  createStoryElement(story, isFavorite) {
    const storyDiv = document.createElement('div');
    storyDiv.className = 'story-item';
    storyDiv.innerHTML = `
      <h3>${story.name || 'Anonymous'}</h3>
      <p>${story.description || ''}</p>
      ${story.photoUrl ? `<img src="${story.photoUrl}" alt="Story photo" style="max-width: 200px;">` : ''}
      <p><small>${new Date(story.createdAt).toLocaleString()}</small></p>
      <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-id="${story.id}">
        ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Favorit' : 'Tambah Favorit'}
      </button>
      <button class="delete-btn" data-id="${story.id}">Hapus</button>
    `;
    return storyDiv;
  }

  attachEventListeners() {
    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        try {
          const isFavorited = await this.dbManager.toggleFavorite(storyId);
          e.target.textContent = isFavorited ? '❤️ Favorit' : '🤍 Tambah Favorit';
          e.target.classList.toggle('favorited', isFavorited);
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        try {
          await this.dbManager.deleteStory(storyId);
          e.target.closest('.story-item').remove();
        } catch (error) {
          console.error('Error deleting story:', error);
        }
      });
    });

    // Remove favorite buttons
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        try {
          await this.dbManager.toggleFavorite(storyId);
          e.target.closest('.favorite-item').remove();
        } catch (error) {
          console.error('Error removing favorite:', error);
        }
      });
    });
  }
}

export default SavedStoriesPage;
