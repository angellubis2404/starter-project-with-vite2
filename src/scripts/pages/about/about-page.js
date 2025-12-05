export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Tentang Aplikasi</h1>
        <p>Aplikasi ini adalah platform untuk berbagi cerita dengan lokasi geografis. Pengguna dapat menambahkan cerita dengan foto dan lokasi, serta melihat cerita dari pengguna lain di peta interaktif.</p>
        <h2>Fitur Utama</h2>
        <ul>
          <li>Tambah cerita dengan foto dan lokasi</li>
          <li>Lihat cerita di peta interaktif</li>
          <li>Filter cerita berdasarkan lokasi</li>
          <li>Autentikasi pengguna</li>
        </ul>
        <h2>Teknologi yang Digunakan</h2>
        <ul>
          <li>HTML, CSS, JavaScript</li>
          <li>Leaflet untuk peta</li>
          <li>View Transitions API untuk transisi halaman</li>
        </ul>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
