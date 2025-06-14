# Web AR App Template

**A modern template for marker-based augmented reality built with MindAR.js, Three.js and Vite.**

For the full Russian documentation see [README.md](./README.md).

## Purpose

This project offers a lightweight AR scene that can be extended with CRM features and deployed to GitHub Pages.

## Requirements

- **Node.js** 20 LTS (Node.js 22+ is not supported)
- Run `nvm use 20` before `pnpm install` (see `.nvmrc`)
  or run `scripts/setup-node.sh` to switch Node automatically.
- **pnpm** 9 or newer (the repository stores `pnpm-lock.yaml` only)
- `scripts/check-deps.js` warns when dependencies are missing before running lint or tests
- A modern browser such as Chrome, Firefox or Edge
- GitHub account if you plan to deploy to GitHub Pages

## Quick Setup

_Requires Node.js 20 LTS._

```bash
git clone <repo-url>
cd <project>
nvm install 20
nvm use 20
sh scripts/setup-node.sh
pnpm install
# Run this before `pnpm lint` or `pnpm test`
cp .env.example .env # fill in values if needed
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed. Important variables:

- `MONGODB_URI` – connection string for MongoDB
- `JWT_SECRET` – secret key for signing JWT tokens
- `JWT_MISSING_STATUS` – status code when `JWT_SECRET` is missing
- `VITE_ANALYTICS_ENDPOINT` – optional analytics URL
- `VITE_MODEL_URL` – fallback model URL
- `VITE_API_BASE_URL` – base API URL (without `/api`)
- The value must be a plain URL without extra text or spaces.
  Example: `"https://example.com"`.
  Leading or trailing spaces are trimmed by the app and may cause tests to fail.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` – credentials for Cloudflare R2/S3
- `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` – R2 endpoint, bucket name and public base URL
- `FRONTEND_ORIGINS` – comma separated CORS origins
- `RATE_LIMIT_MAX` – max requests per 15 minutes
- `PORT` – API server port (default 3000)

## Development Scripts

- `pnpm dev` – run the Vite dev server
- `pnpm lint` – run ESLint
  In CI the output is written to `lint.log`; view this file if the check fails.
- `pnpm test` – run Vitest
- _Make sure `pnpm install` has been run before these commands._
- `pnpm format` – run Prettier
- `pnpm build` – production build
- `pnpm preview` – preview built files
- `pnpm start` – launch the API server (same as `pnpm api`)

Open [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) and click **Start AR**. The camera page now shows only the AR view with a **CMS** link for switching to the content manager, and the CMS page has a **Back to Camera** link.

The CMS under `cms/` is based on **MajesticAdmin**. Open it via `${base}cms/`, where `${base}` is the `base` value in `vite.config.js` (default `/web-app-ar/`). For local development this means `http://localhost:5173/web-app-ar/cms/`. Register a user with `role: admin` through `/auth/register` to enable the **Upload** form and manage models.

The Majestic template fonts and background images are loaded from external CDNs
(Google Fonts and placeholder.com) to keep the repository slim (the original
files were about 3.8 MB). If you prefer local assets, place them in
`cms/fonts/` and `cms/images/` and adjust paths in `public/cms/majestic/style.css`.
The archive `MajesticAdmin-Free-Bootstrap-Admin-Template-master.zip` was removed
from version control and is listed in `.gitignore` to avoid bloating the
repository history.
If you need the original template, download it from GitHub:
<https://github.com/BootstrapDash/MajesticAdmin-Free-Bootstrap-Admin-Template/archive/refs/heads/master.zip>.

When deploying to GitHub Pages, include the pages under `cms/app/` in
`rollupOptions.input` inside `vite.config.js` so they are copied to `dist/`.

## Build

Use `pnpm build` for a production build and `pnpm preview` to preview the output.

## Deployment to GitHub Pages

1. Edit `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/web-app-ar/', // repository name
     build: { target: 'esnext' }, // required for GitHub Pages
   });
   ```
2. Build the project:
   ```bash
   pnpm build
   ```
3. Publish the `dist/` directory to the `gh-pages` branch:

   ```bash
   git checkout --orphan gh-pages
   git --work-tree dist add --all
   git --work-tree dist commit -m 'Deploy'
   git push origin gh-pages --force
   git clean -fd
   git checkout main
   ```

4. Optionally configure GitHub Actions for automatic deployment.
5. Ensure paths in `index.html` are correct. GitHub Pages serves content over HTTPS which is required for AR.

## Deployment on Render.com

See the [Russian README](./README.md) for full setup instructions.

### Keeping Render awake

Free services on Render fall asleep after 15 minutes with no requests. Ping the API periodically so it stays responsive.

#### GitHub Actions

Create `.github/workflows/ping-render.yml` with:

```yaml
name: Render keep awake
on:
  schedule:
    - cron: '*/14 * * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl -fsS https://web-app-ar-api.onrender.com/api/models
```

This workflow sends a GET request every ~14 minutes to prevent the service from going to sleep.

#### External services

Instead of GitHub Actions you can use external cron solutions such as [cron-job.org](https://cron-job.org/) or any monitoring service (UptimeRobot, etc.) to ping the same URL.

## License

[MIT](./LICENSE)
