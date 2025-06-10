// eslint.config.js
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  // Общие правила для JS-файлов фронта (браузер)
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'strapi/.strapi/**', 'strapi/dist/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...configPrettier.rules,
      'prettier/prettier': 'error',
    },
  },
  // Node.js/Backend + тесты (server.js, все *.test.js и все из tests/)
  {
    files: ['server.js', '**/tests/**/*.js', '**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest, // если используешь jest
      },
    },
  },
];
