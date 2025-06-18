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
# Run Prettier after install
pnpm format
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
- `VITE_API_BASE_URL` – base API URL (without `/api`).
  Use `http://localhost:3000` locally. For production specify your API URL, e.g. `https://example.com`.
  The value must be a plain URL without extra text or spaces.
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

Open [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) and click **Start AR**.
The camera page now shows only the AR view with a **CMS** link for switching to the content manager.

The admin panel uses [AdminJS](https://github.com/SoftwareBrothers/adminjs).
It is mounted at `/cms` via Express (see `cms/admin.js`).
Run `pnpm dev` and `pnpm api`, then open `http://localhost:5173/web-app-ar/cms/`.
Log in using an account with `role: admin` (`POST /auth/register`).
After authentication you can manage models and users.

## Build

Use `pnpm build` for a production build and `pnpm preview` to preview the output.

### Cloudflare R2 and Worker

1. Create an account on Cloudflare and in the R2 section make a bucket (e.g. `models`).
2. Generate an Access Key/Secret Key pair and copy the endpoint URL.
3. Copy `.env.example` to `.env` and set:
   ```
   AWS_ACCESS_KEY_ID=<your access key>
   AWS_SECRET_ACCESS_KEY=<your secret>
   AWS_REGION=auto
   R2_ENDPOINT=https://<id>.r2.cloudflarestorage.com
   R2_BUCKET=<bucket name>
   R2_PUBLIC_URL=https://pub-<id>.r2.dev/
   ```
   `R2_PUBLIC_URL` must end with `/`.
4. Run `pnpm start` and check the console for `✅ [r2] connection OK`.
5. The `syncR2Models` function keeps the MongoDB collection up to date with files stored in R2.
6. A minimal Worker lives in `src/worker.ts`. Deploy it with:
   ```bash
   pnpm install
   pnpm format
   CLOUDFLARE_API_TOKEN=<token> pnpm run worker:deploy
   ```

````
The [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) CLI is provided as a dev dependency. Create an API Token in the Cloudflare dashboard (My Profile → API Tokens, **Edit Cloudflare Workers** template), set it in `CLOUDFLARE_API_TOKEN` and deploy. See the [Cloudflare documentation](https://developers.cloudflare.com/api/tokens/create/) for details.

## Deployment to GitHub Pages

1. Edit `vite.config.js`:
 ```js
 export default defineConfig({
   base: '/web-app-ar/', // repository name
   build: { target: 'esnext' }, // required for GitHub Pages
 });
````

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

## License

[MIT](./LICENSE)

See [ROADMAP.md](./ROADMAP.md) for upcoming features and [CHANGELOG.md](./CHANGELOG.md) for version history.
