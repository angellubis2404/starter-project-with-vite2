# TODO: Fix Push Notification Implementation

## Current Issue
- Push notifications are only initialized in home-page.js, causing them to not work globally.
- Status shows active but no notifications appear when pushed.

## Plan
1. Move PushNotificationManager initialization from home-page.js to index.js for global availability.
2. Update home-page.js to use the global instance instead of creating a new one.
3. Ensure notification toggle works across the app.
4. Test that existing PWA, IndexedDB, and other features remain intact.

## Steps
- [ ] Initialize PushNotificationManager globally in index.js
- [ ] Remove local initialization from home-page.js
- [ ] Update home-page.js to reference global push manager
- [ ] Verify service worker push event handling
- [ ] Test notification functionality
