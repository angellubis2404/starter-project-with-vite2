import { addStory } from '../../data/api.js';
import CONFIG from '../../config.js';
import IndexedDBManager from '../../utils/indexed-db.js';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        <h2>Form Tambah Cerita</h2>
        <form id="add-story-form" aria-labelledby="form-title">
          <div>
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required aria-describedby="desc-help"></textarea>
            <span id="desc-help" class="sr-only">Masukkan deskripsi cerita Anda</span>
          </div>
          <div>
            <label for="photo">Foto:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required aria-describedby="photo-help">
            <span id="photo-help" class="sr-only">Pilih file gambar atau gunakan kamera</span>
            <button type="button" id="camera-button" aria-label="Ambil foto dari kamera">Ambil dari Kamera</button>
          </div>
          <div id="map-container">
            <label for="map">Klik pada peta untuk memilih lokasi:</label>
            <div id="map" style="height: 300px;" role="img" aria-label="Peta untuk memilih lokasi cerita"></div>
          </div>
          <button type="submit" aria-describedby="submit-help">Tambah Cerita</button>
          <span id="submit-help" class="sr-only">Kirim cerita baru dengan deskripsi, foto, dan lokasi</span>
        </form>
        <div id="message" role="status" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    this.dbManager = new IndexedDBManager();
    await this.dbManager.init();

    this._initializeMap();
    this._setupForm();
    this._setupCamera();
  }

  _initializeMap() {
    this.map = L.map('map').setView([-6.2, 106.816666], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = null;
    this.map.on('click', (e) => {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker(e.latlng).addTo(this.map);
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;
    });
  }

  _setupForm() {
    const form = document.getElementById('add-story-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      formData.append('lat', this.lat);
      formData.append('lon', this.lon);

      const storyData = {
        description: formData.get('description'),
        photo: formData.get('photo'),
        lat: this.lat,
        lon: this.lon,
        token: localStorage.getItem('token'),
        createdAt: new Date().toISOString()
      };

      try {
        const result = await addStory(formData);
        document.getElementById('message').textContent = 'Cerita berhasil ditambahkan!';

        // Trigger push notification for new story
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('Cerita Baru Ditambahkan!', {
            body: `Cerita "${storyData.description.substring(0, 50)}..." telah berhasil dipublikasikan.`,
            icon: '/favicon.png',
            badge: '/favicon.png',
            vibrate: [100, 50, 100],
            data: {
              storyId: result.story?.id,
              dateOfArrival: Date.now()
            },
            actions: [
              {
                action: 'view',
                title: 'Lihat Cerita',
                icon: '/favicon.png'
              }
            ]
          });
        }

        form.reset();
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
      } catch (error) {
        // Store offline if network fails
        await this.dbManager.saveStory(storyData);
        document.getElementById('message').textContent = 'Cerita disimpan offline. Akan disinkronkan saat online.';

        // Register background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('background-sync-stories');
        }

        form.reset();
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
      }
    });
  }

  _setupCamera() {
    const cameraButton = document.getElementById('camera-button');
    const photoInput = document.getElementById('photo');

    cameraButton.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Capture image after 3 seconds
        setTimeout(() => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            photoInput.files = dataTransfer.files;
          });
          stream.getTracks().forEach(track => track.stop());
        }, 3000);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    });
  }
}
