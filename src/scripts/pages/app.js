import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Daftar rute yang harus diproteksi
    const protectedRoutes = ['/add-story', '/favorites'];

    // Redirect ke login jika mengakses rute privat tanpa token
    if (protectedRoutes.includes(url) && !token) {
      location.hash = '#/login';
      return;
    }

    // Hide/Show navbar auth links based on login status
    const navList = document.getElementById('nav-list');
    if (navList) {
      const authLinks = navList.querySelectorAll('li:nth-child(3), li:nth-child(4)');
      if (user) {
        // Hide login and register links
        authLinks.forEach(link => link.style.display = 'none');
        // Add logout link if not already present
        if (!document.getElementById('logout-link')) {
          const logoutLink = document.createElement('li');
          logoutLink.innerHTML = `<a href="#" id="logout-link">Logout (${user.name})</a>`;
          navList.appendChild(logoutLink);

          document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Show login and register links again
            authLinks.forEach(link => link.style.display = 'block');
            // Remove logout link
            logoutLink.remove();
            window.location.hash = '#/login';
          });
        }
      } else {
        // Show login and register links
        authLinks.forEach(link => link.style.display = 'block');
        // Remove logout link if present
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.remove();
        }
      }
    }

    const page = routes[url];

    // Alternative DOM update for browsers that do not support view transition
    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      return;
    }

    // Update DOM with view transition
    const transition = document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });

    transition.updateCallbackDone.then(() => {
      console.log('Callback telah dieksekusi.');
    });
    transition.ready.then(() => {
      console.log('View transition siap dijalankan.');
    });
    transition.finished.then(() => {
      console.log('View transition telah selesai.');
    });
  }

  _hideAuthLinks() {
    const navList = document.getElementById('nav-list');
    const authLinks = navList.querySelectorAll('li:nth-child(3), li:nth-child(4)');
    authLinks.forEach(link => link.style.display = 'none');
  }
}

export default App;
