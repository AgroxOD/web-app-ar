import { defineConfig, loadEnv } from 'vite';
import postcss from './src/postcss.config.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE_PATH || '/web-app-ar/',
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          main: 'index.html',
          cms: 'cms/index.html',
          catalog: 'cms/app/catalog.html',
          login: 'cms/app/login.html',
          profile: 'cms/app/profile.html',
          register: 'cms/app/register.html',
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
