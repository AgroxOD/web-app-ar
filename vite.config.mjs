import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // Алиасы вы можете оставить, но в нашем коде мы ими не пользуемся
      '@logic': '/src/logic',
      '@assets': '/src/assets'
    }
  },
  base: './',
  server: {
    port: 5173,
    open: true,
  }
});
