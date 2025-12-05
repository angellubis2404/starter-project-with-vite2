import { getStories } from '../../data/api.js';
import CONFIG from '../../config.js';
import IndexedDBManager from '../../utils/indexed-db.js';
import PushNotificationManager from '../../utils/push-notification.js';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Beranda</h1>
          <div class="filter-container">
          <h2>Filter Lokasi</h2>
          <label for="location-filter">Cari lokasi:</label>
          <input type="text" id="location-filter" placeholder="Cari lokasi..." aria-describedby="filter-help">
          <span id="filter-help" class="sr-only">Masukkan nama lokasi atau deskripsi untuk memfilter cerita</span>
          <div class="notification-controls">
            <button id="notification-toggle" aria-label="Toggle push notifications">🔔 Enable Notifications</button>
          </div>
        </div>
        <div class="content-wrapper">
          <h2>Daftar Cerita</h2>
          <div class="story-list" id="story-list" role="list" aria-label="Daftar cerita"></div>
          <div class="map-container">
            <h3>Peta Lokasi Cerita</h3>
            <div id="map" style="height: 500px;" role="img" aria-label="Peta lokasi cerita"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('HomePage afterRender called');
    this.dbManager = new IndexedDBManager();
    await this.dbManager.init();

    this.pushManager = new PushNotificationManager();
    await this.pushManager.init();

    const token = localStorage.getItem('token');
    try {
      this.stories = await getStories(token);
      // Cache stories in IndexedDB for offline use
      await this.dbManager.saveStoriesToCache(this.stories);
    } catch (error) {
      // Load from IndexedDB if offline
      this.stories = await this.dbManager.getAllStories();
    }

    this.favorites = await this.dbManager.getFavorites();

    this._renderStories();
    this._initializeMap();
    this._setupFilter();
    this._setupFavorites();
    this._setupNotificationToggle();
    this._checkAuthentication();
  }

  _checkAuthentication() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const navList = document.querySelector('.nav-list');
      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = `<a href="#" id="logout-link">Logout (${user.name})</a>`;
      navList.appendChild(logoutLink);

      document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '#/login';
      });
    }
  }

  _renderStories() {
    console.log('Rendering stories:', this.stories.length);
    const storyList = document.getElementById('story-list');
    storyList.innerHTML = this.stories.map(story => `
      <div class="story-item" data-id="${story.id}" role="listitem" tabindex="0" aria-label="Cerita: ${story.name}">
        <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <small>${new Date(story.createdAt).toLocaleDateString()}</small>
        <button class="favorite-btn" data-id="${story.id}" aria-label="Toggle favorite">
          ${this.favorites?.includes(story.id) ? '❤️' : '🤍'}
        </button>
        <button class="delete-btn" data-id="${story.id}" aria-label="Delete story">🗑️</button>
      </div>
    `).join('');

    // Add click event to highlight marker
    storyList.addEventListener('click', (e) => {
      const storyItem = e.target.closest('.story-item');
      if (storyItem && !e.target.classList.contains('favorite-btn') && !e.target.classList.contains('delete-btn')) {
        const storyId = storyItem.dataset.id;
        const story = this.stories.find(s => s.id === storyId);
        if (story && this.markers[storyId]) {
          this.map.setView([story.lat, story.lon], 15);
          this.markers[storyId].openPopup();
        }
      }
    });
  }

  _initializeMap() {
    console.log('Initializing map...');
    const mapContainer = document.getElementById('map');
    console.log('Map container:', mapContainer);

    if (!mapContainer) {
      console.error('Map container not found!');
      return;
    }

    try {
      this.map = L.map('map').setView([-6.2, 106.816666], 10);
      console.log('Map created:', this.map);

      // Add multiple tile layers
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      });

      const baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer
      };

      osmLayer.addTo(this.map);
      L.control.layers(baseLayers).addTo(this.map);
      console.log('Tile layers added');

      this.markers = {};
      this.stories.forEach(story => {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`
          <b>${story.name}</b><br>
          ${story.description}<br>
          <img src="${story.photoUrl}" alt="${story.name}" style="width: 100px; height: auto;">
        `);
        this.markers[story.id] = marker;
      });
      console.log('Markers added:', Object.keys(this.markers).length);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  _setupFilter() {
    const filterInput = document.getElementById('location-filter');
    filterInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filteredStories = this.stories.filter(story =>
        story.name.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query)
      );

      // Update story list
      const storyList = document.getElementById('story-list');
      storyList.innerHTML = filteredStories.map(story => `
        <div class="story-item" data-id="${story.id}">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small>${new Date(story.createdAt).toLocaleDateString()}</small>
          <button class="favorite-btn" data-id="${story.id}" aria-label="Toggle favorite">
            ${this.favorites?.includes(story.id) ? '❤️' : '🤍'}
          </button>
          <button class="delete-btn" data-id="${story.id}" aria-label="Delete story">🗑️</button>
        </div>
      `).join('');

      // Update map markers
      Object.values(this.markers).forEach(marker => this.map.removeLayer(marker));
      this.markers = {};
      filteredStories.forEach(story => {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`
          <b>${story.name}</b><br>
          ${story.description}<br>
          <img src="${story.photoUrl}" alt="${story.name}" style="width: 100px; height: auto;">
        `);
        this.markers[story.id] = marker;
      });
    });
  }

  _setupFavorites() {
    const storyList = document.getElementById('story-list');
    storyList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('favorite-btn')) {
        e.preventDefault();
        const storyId = e.target.dataset.id;
        const isFavorite = await this.dbManager.toggleFavorite(storyId);

        // Update favorites list
        if (isFavorite) {
          this.favorites.push(storyId);
        } else {
          this.favorites = this.favorites.filter(id => id !== storyId);
        }

        // Update button appearance
        e.target.textContent = isFavorite ? '❤️' : '🤍';
      }

      if (e.target.classList.contains('delete-btn')) {
        e.preventDefault();
        const storyId = e.target.dataset.id;

        // Remove from IndexedDB
        await this.dbManager.deleteStory(storyId);

        // Remove from stories array
        this.stories = this.stories.filter(story => story.id !== storyId);

        // Remove marker from map
        if (this.markers[storyId]) {
          this.map.removeLayer(this.markers[storyId]);
          delete this.markers[storyId];
        }

        // Re-render stories
        this._renderStories();
      }
    });
  }

  _setupNotificationToggle() {
    const toggleButton = document.getElementById('notification-toggle');
    if (toggleButton) {
      const isSubscribed = this.pushManager.getSubscriptionStatus();
      toggleButton.textContent = isSubscribed ? '🔕 Disable Notifications' : '🔔 Enable Notifications';

      toggleButton.addEventListener('click', async () => {
        if (this.pushManager.getSubscriptionStatus()) {
          await this.pushManager.unsubscribe();
          toggleButton.textContent = '🔔 Enable Notifications';
        } else {
          await this.pushManager.subscribe();
          toggleButton.textContent = '🔕 Disable Notifications';
        }
      });
    }
  }
}
