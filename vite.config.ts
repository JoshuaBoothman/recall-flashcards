import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Aphasia Rehab Flashcards',
        short_name: 'Rehab Cards',
        description: 'Cognitive stroke and aphasia rehabilitation flashcards',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    cssMinify: 'lightningcss'
  }
})
