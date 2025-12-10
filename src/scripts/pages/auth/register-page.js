import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar</h1>
        <h2>Form Pendaftaran</h2>

        <form id="register-form">
          <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" minlength="6" required>
            <small>Minimal 6 karakter</small>
          </div>

          <button type="submit">Daftar</button>
        </form>

        <p id="message" style="margin-top:10px;font-weight:bold;"></p>

        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const msg = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = "Memproses pendaftaran...";

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim(),
      };

      if (data.password.length < 6) {
        msg.textContent = "Password minimal 6 karakter!";
        msg.style.color = "red";
        return;
      }

      try {
        const result = await registerUser(data);
        console.log("API Response:", result);

        if (!result.error) {
          msg.textContent = "Pendaftaran berhasil! Mengarahkan ke login...";
          msg.style.color = "green";
          setTimeout(() => (window.location.hash = "#/login"), 1200);
        } else {
          msg.textContent = result.message;
          msg.style.color = "red";
        }

      } catch (err) {
        console.error("Registration Error:", err);
        msg.textContent = "Terjadi kesalahan pada server. Coba lagi nanti.";
        msg.style.color = "red";
      }
    });
  }
}
