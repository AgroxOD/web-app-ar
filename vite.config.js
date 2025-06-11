import { defineConfig } from 'vite';
import postcss from './src/postcss.config.js';

export default defineConfig({
  base: '/web-app-ar/',
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: 'index.html',
        cp: 'cp.html',
      },
    },
  },
  css: { postcss },
});
