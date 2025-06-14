# Web AR App Template

**A modern template for marker-based augmented reality built with MindAR.js, Three.js and Vite.**

For the full Russian documentation see [README.md](./README.md).

## Purpose

This project offers a lightweight AR scene that can be extended with CRM features and deployed to GitHub Pages.

## Requirements

- **Node.js** 18–21 (Node.js 20 LTS recommended; Node.js 22 is not supported)
- **pnpm** 9 or newer (the repo uses `pnpm-lock.yaml`)
- A modern browser (Chrome, Edge, Firefox)
- A GitHub account if you plan to deploy to GitHub Pages

## Quick Setup

_Requires Node.js 18–21 (Node.js 20 LTS recommended)._

```bash
git clone <repo-url>
cd <project>
nvm install
nvm use
sh scripts/setup-node.sh
pnpm install
cp .env.example .env # fill in values if needed
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed. Important variables:

- `MONGODB_URI` – connection string for MongoDB
- `JWT_SECRET` – secret used to sign JWT tokens
- `JWT_MISSING_STATUS` – status code if `JWT_SECRET` is missing
- `VITE_ANALYTICS_ENDPOINT` – optional analytics endpoint
- `VITE_MODEL_URL` – fallback URL for the default model
- `VITE_API_BASE_URL` – base URL for API requests (without `/api`)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` – S3 credentials
- `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` – Cloudflare R2 settings (URL ends with `/`)
- `FRONTEND_ORIGINS` – allowed CORS origins
- `RATE_LIMIT_MAX` – requests per 15 minutes (default 100)
- `PORT` – port for the API server (default 3000)

## Development Scripts

- `pnpm dev` – start the development server
- `pnpm build` – production build
- `pnpm preview` – preview the `dist/` folder
- `pnpm lint` – run ESLint
- `pnpm test` – run Vitest
- `pnpm format` – run Prettier
- `pnpm api` or `pnpm start` – run the API server

Open [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) and click **Start AR** to test the scene.

## Build

Use `pnpm build` for a production build and `pnpm preview` to preview the output.

## Deploying to GitHub Pages

1. Set the `base` option in `vite.config.js` to match your repository name and
   keep `build.target = 'esnext'`:

   ```js
   export default defineConfig({
     base: '/web-app-ar/',
     build: { target: 'esnext' },
   });
   ```

2. Build the project:
   ```bash
   pnpm build
   ```
3. Push the contents of the `dist/` folder to the `gh-pages` branch:
   ```bash
   git checkout --orphan gh-pages
   git --work-tree dist add --all
   git --work-tree dist commit -m 'Deploy'
   git push origin gh-pages --force
   git clean -fd
   git checkout main
   ```
4. You can automate the process with GitHub Actions.

## License

[MIT](./LICENSE)
