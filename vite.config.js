import { defineConfig, loadEnv } from 'vite';
import postcss from './src/postcss.config.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL,
      ),
    },
  };
});
