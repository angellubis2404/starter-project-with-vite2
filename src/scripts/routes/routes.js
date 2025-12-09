import HomePage from '../pages/home/home-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import RegisterPage from '../pages/auth/register-page';
import LoginPage from '../pages/auth/login-page';
import AboutPage from '../pages/about/about-page';
import FavoritesPage from '../pages/favorites/favorites-page';
import SavedStoriesPage from '../pages/saved-stories/saved-stories-page';

const routes = {
  '/': new HomePage(),
  '/add-story': new AddStoryPage(),
  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/about': new AboutPage(),
  '/favorites': new FavoritesPage(),
  '/saved-stories': new SavedStoriesPage(),
};

export default routes;
