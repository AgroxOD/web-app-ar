import { defineConfig, loadEnv } from 'vite';
import postcss from './ar-app/src/postcss.config.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE_PATH || '/web-app-ar/',
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          main: 'index.html',
        },
      },
    },
    css: { postcss },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'cms/**',
            dest: 'cms',
          },
        ],
        structured: true,
      }),
    ],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL,
      ),
    },
  };
});
