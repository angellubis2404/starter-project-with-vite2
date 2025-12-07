import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'), // <-- pindahkan ke public utama (bukan src/public)
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
      registerType: 'autoUpdate',
      strategies: 'generateSW',

      includeAssets: [
        'favicon.png',
        'images/logo.png',
        'apple-touch-icon.png',
        'masked-icon.svg'
      ],

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'story-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      },

      manifest: {
        name: 'Story App',
        short_name: 'StoryApp',
        description: 'Aplikasi untuk berbagi cerita',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',

        // path asset PWA harus absolute path dan dalam /public
        icons: [
          { src: '/images/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/images/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],

        screenshots: [
          { src: '/images/logo.png', sizes: '1920x1080', type: 'image/png' },
          { src: '/images/logo.png', sizes: '1080x1920', type: 'image/png' }
        ],

        shortcuts: [
          {
            name: 'Tambah Cerita',
            short_name: 'Tambah',
            description: 'Membuat cerita baru.',
            url: '/#/add-story',
            icons: [{ src: '/images/logo.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Beranda',
            short_name: 'Home',
            description: 'Lihat beranda cerita.',
            url: '/#/',
            icons: [{ src: '/images/logo.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      }
    })
  ]
});
