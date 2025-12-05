import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar</h1>
        <h2>Form Pendaftaran</h2>
        <form id="register-form" aria-labelledby="register-title">
          <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required aria-describedby="name-help">
            <span id="name-help" class="sr-only">Masukkan nama lengkap Anda</span>
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-describedby="email-help">
            <span id="email-help" class="sr-only">Masukkan alamat email Anda</span>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required aria-describedby="password-help">
            <span id="password-help" class="sr-only">Masukkan kata sandi Anda</span>
          </div>
          <button type="submit" aria-describedby="register-help">Daftar</button>
          <span id="register-help" class="sr-only">Buat akun baru</span>
        </form>
        <div id="message" role="status" aria-live="polite"></div>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    this._setupForm();
  }

  _setupForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const result = await registerUser(data);
        if (result.error === false) {
          document.getElementById('message').textContent = 'Pendaftaran berhasil! Silakan login.';
          window.location.hash = '#/login';
        } else {
          document.getElementById('message').textContent = 'Pendaftaran gagal. Periksa data Anda.';
        }
      } catch (error) {
        document.getElementById('message').textContent = 'Terjadi kesalahan. Silakan coba lagi.';
      }
    });
  }
}
