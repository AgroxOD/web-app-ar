// eslint.config.js
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
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
  {
    files: ['server.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
