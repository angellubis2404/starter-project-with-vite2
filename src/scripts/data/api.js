import CONFIG from '../config.js';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getStories(token) {
  try {
    const response = await fetch(`${ENDPOINTS.STORIES}?location=1`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    const data = await response.json();
    return data.listStory || [];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export async function addStory(formData) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding story:', error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(userData) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}
