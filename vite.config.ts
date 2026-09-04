import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { readFileSync } from 'fs'

const { version: appVersion } = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Injected at build time so the About dialog tracks `npm version`.
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // One service worker (src/sw.ts) handles both precaching and FCM push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icon-192x192.png',
        'icon-512x512.png',
        'icon-maskable-512x512.png',
        'apple-touch-icon.png',
        'badge-96x96.png',
      ],
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
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
      },
      devOptions: {
        // Serve the real service worker in `vite dev` so push can be tested locally.
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
