import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192x192.png', 'firebase-messaging-sw.js'],
      manifest: {
        name: 'Prayer Times',
        short_name: 'Prayer',
        description: 'Prayer times for Sri Lanka districts',
        theme_color: '#166534',
        background_color: '#faf9f6',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-192x192.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-192x192.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Don't precache the Firebase messaging service worker
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
