# Image Game Client

This project now uses a Vite-based React toolchain (migrated from Create React App) to avoid the stale `react-scripts` dependency tree.

## Available Scripts

In the project directory, run:

### `npm start`
Starts the Vite development server on `http://localhost:3000`.

### `npm run build`
Builds the production bundle to `dist/`.

### `npm run preview`
Serves the production build locally for verification.

### `npm test`
Runs the Vitest test suite once in `jsdom`.

### `npm run test:watch`
Runs Vitest in watch mode.

## Environment Variables

Use Vite-style environment variables:

- `VITE_SERVER_HOSTNAME` – backend socket host (defaults to `http://<current-hostname>:3000`).

## Why this migration

The CRA `react-scripts@5.x` stack pins transitive packages like `@svgr/plugin-svgo@5` / `svgo@1`, which are frequent security-advisory hotspots. Migrating to a maintained toolchain is the structural remediation path.
