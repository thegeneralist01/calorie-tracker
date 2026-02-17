// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Calorie Tracker',
        short_name: 'Calories',
        description: 'Track nutrition, hydration, and activity with offline support.',
        theme_color: '#0f766e',
        background_color: '#f4f9f8',
        display: 'standalone',
        lang: 'en',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: '/'
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
