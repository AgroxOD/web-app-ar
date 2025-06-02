import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    svelte(),
    // Поддержка резолва путей из jsconfig
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      // Алиасы вы можете оставить, но в нашем коде мы ими не пользуемся
      '@logic': '/src/logic',
      '@assets': '/src/assets'
    }
  },
  // Указываем базовый путь для GitHub Pages
  base: '/web-app-ar/',
  server: {
    port: 5173,
    open: true,
  }
});
