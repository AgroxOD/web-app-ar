# Contributing

Thank you for helping improve **web-app-ar**. These guidelines cover the basic steps to get your environment ready and describe the workflow for linting and testing the project.

## Prerequisites

- **Node.js** 20 LTS (Node.js 22+ is not supported)
- **pnpm** 9 or newer

See [AGENTS.md](./AGENTS.md) or [README](./README.md) for additional details.

## Setup

1. Fork and clone the repository.
2. Ensure you are using Node 20 LTS:
   ```bash
   nvm install 20
   nvm use 20
   sh scripts/setup-node.sh
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the example environment file and adjust values if necessary:
   ```bash
   cp .env.example .env
   ```
5. (Optional) Download heavy models:
   ```bash
   sh public/assets/download_models.sh
   ```
6. Start the development server with `pnpm dev`.

## Lint and Test Workflow

Before submitting a pull request, make sure the project builds and tests cleanly:

```bash
pnpm install       # required before lint or test
pnpm lint          # ESLint checks
pnpm test          # Vitest suite
```

The repository defines scripts in `package.json` that run `scripts/check-deps.js` before linting or testing to verify that dependencies are installed. Formatting can be applied with `pnpm format`.

For lockfile conflicts, see the instructions in [AGENTS.md](./AGENTS.md).

---

For full documentation and troubleshooting tips, refer to [AGENTS.md](./AGENTS.md) and the main [README](./README.md).
