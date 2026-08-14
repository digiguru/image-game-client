# Image Game Client

React/Vite frontend for the multiplayer Image Game. The browser connects to the separate `digiguru/image-game-server` Socket.IO backend and supports room-based host/player sessions.

## Requirements

- Node.js 24
- npm

## Local development

Install dependencies and start the Vite development server:

```bash
npm ci
npm start
```

Vite uses its normal local development address (typically `http://localhost:5173`). Run `digiguru/image-game-server` separately on port `3000`; the client automatically uses `http://localhost:3000` when running locally.

Use `/host?room=ROOM_ID` for the host controls and `/?room=ROOM_ID` for players. If no room is supplied, the backwards-compatible `default` room is used.

## Environment variables

- `VITE_SERVER_HOSTNAME` — override the Socket.IO backend hostname.
- `VITE_SOCKET_PATH` — override the Socket.IO path.

Production defaults to the Image Game Server Vercel deployment and its Vercel Socket.IO function path. Local development defaults to the standard `/socket.io` path.

## Commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

- `npm run lint` runs ESLint.
- `npm test` runs the Vitest unit/component suite once in jsdom.
- `npm run build` creates the Vite production bundle in `dist/`.
- `npm run test:e2e` runs the Playwright full-stack multiplayer smoke test.

## Full-stack Playwright test

The Playwright suite starts both the real client and real server locally. By default it expects the server repository to be checked out next to this repository as `../image-game-server`:

```text
parent/
  image-game-client/
  image-game-server/
```

Install both repositories first, then from the client run:

```bash
npx playwright install chromium
npm run test:e2e
```

Set `IMAGE_GAME_SERVER_DIR` if your server checkout is elsewhere.

The primary E2E scenario creates a unique room and drives three independent browser contexts: one host, Alice, and Bob. It covers lobby joining, selecting the Mock provider, prompt submission, generated-image delivery, voting, and results. No external image-generation credentials are required.

## CI

Pull requests and `main` pushes first run install/audit, lint, Vitest and the production build. A second required job then checks out `digiguru/image-game-server@main`, installs Chromium and executes the real full-stack Playwright flow.

## Toolchain

The client uses Vite rather than the previous Create React App / `react-scripts` stack. This keeps the React build pipeline on actively maintained tooling and avoids the stale CRA dependency tree.
