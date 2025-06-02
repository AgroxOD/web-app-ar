# web-app-ar

## Overview
web-app-ar is a simple augmented reality web project built with Svelte and Vite. It uses A-Frame and AR.js to display AR content and is configured for deployment to GitHub Pages.

The goal is to show a 3D model through AR.js directly on GitHub Pages. When the application is published, opening the page and pointing a device's camera at the marker will load the model in augmented reality.

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

## Markers and Models
Marker pattern files (`.patt`) live in `public/markers_patt`, and 3D models are stored in `public/models`. After adding or replacing files, update the `markerUrl` and `modelUrl` constants in `src/App.svelte` to load the new assets.

## Deployment
Build the project and publish it to GitHub Pages:
```bash
npm run build
npm run deploy
```
The build output is generated in the `dist` directory and the `deploy` script pushes it to the `gh-pages` branch.

## License
This project is licensed under the [MIT License](LICENSE).
