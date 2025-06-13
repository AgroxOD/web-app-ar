# Web AR App Template

**A modern template for marker-based augmented reality built with MindAR.js, Three.js and Vite.**

For the full Russian documentation see [README.md](./README.md).

## Purpose

This project offers a lightweight AR scene that can be extended with CRM features and deployed to GitHub Pages.

## Quick Setup

_Requires Node.js 18–21._

```bash
git clone <repo-url>
cd <project>
pnpm install
cp .env.example .env # fill in values if needed
pnpm dev
```

### Development

- `pnpm lint` – run ESLint
- `pnpm test` – run Vitest
- `pnpm format` – auto format

Open [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) and click **Start AR** to test the scene.

## Build

Use `pnpm build` for a production build and `pnpm preview` to preview the output.

## License

[MIT](./LICENSE)
