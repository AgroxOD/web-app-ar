# web-app-ar

## Overview
web-app-ar is a simple augmented reality web project built with Svelte and Vite. It uses A-Frame and AR.js to display AR content and is configured for deployment to GitHub Pages.

## Installation
1. Clone this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

## Development
Start the development server with:
```bash
npm run dev
```
This runs Vite in development mode and watches for file changes.

## Deployment
Build the project and publish it to GitHub Pages:
```bash
npm run build
npm run deploy
```
The build output is generated in the `dist` directory and the `deploy` script pushes it to the `gh-pages` branch.
