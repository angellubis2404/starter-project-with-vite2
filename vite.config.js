import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => `${request.url}`,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => `${request.url}`,
            },
          },
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'story-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
              },
              cacheKeyWillBeUsed: async ({ request }) => `${request.url}`,
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Story App',
        short_name: 'StoryApp',
        description: 'Aplikasi untuk berbagi cerita',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'images/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
        ],
        screenshots: [
          {
            src: 'images/logo.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'images/logo.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Tambah Cerita',
            short_name: 'Tambah',
            description: 'Membuat cerita baru.',
            url: '/#/add-story',
            icons: [
              {
                src: 'images/logo.png',
                type: 'image/png',
                sizes: '512x512'
              }
            ]
          },
          {
            name: 'Beranda',
            short_name: 'Home',
            description: 'Lihat beranda cerita.',
            url: '/#/',
            icons: [
              {
                src: 'images/logo.png',
                type: 'image/png',
                sizes: '512x512'
              }
            ]
          }
        ]
      },
    }),
  ],
});
