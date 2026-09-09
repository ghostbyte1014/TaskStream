import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  esbuild: {
    sourcemap: false
  },
  build: {
    sourcemap: false
  }
});
