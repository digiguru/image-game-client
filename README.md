# Image Game Client

React/Vite frontend for the multiplayer Image Game. The browser connects to the separate `digiguru/image-game-server` Socket.IO backend and supports room-based host/player sessions.

## Requirements

- Node.js 24
- npm

## Local development

```bash
npm ci
npm start
```

Vite uses its normal local development address (typically `http://localhost:5173`). Run `digiguru/image-game-server` separately on port `3000`; the client automatically uses `http://localhost:3000` when running locally.

Use `/host?room=ROOM_ID` for host controls and `/?room=ROOM_ID` for players. Without a room query parameter, the backwards-compatible `default` room is used.

## Environment variables

- `VITE_SERVER_HOSTNAME` — override the Socket.IO backend hostname.
- `VITE_SOCKET_PATH` — override the Socket.IO path.

Production defaults to the Image Game Server Vercel deployment and its Vercel Socket.IO function path. Local development defaults to `/socket.io`.

## TypeScript

The shipped application source is TypeScript/TSX. Typed contracts cover the Socket.IO protocol, room/player identity, environment resolution and all React runtime components. The existing Vitest files remain JSX consumers of those typed modules.

`npm run typecheck` is a required CI gate and production builds run it before Vite. The old Create React App bootstrap, duplicate `public/index.html`, CRA logos/manifest, `reportWebVitals`, unused `web-vitals` integration and dead Shuffle helper have been removed. Vite's root `index.html` and `src/main.tsx` are the single application bootstrap path.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run check
```

- `npm run lint` runs ESLint.
- `npm run typecheck` runs strict TypeScript checking without emitting files.
- `npm test` runs Vitest unit/component tests.
- `npm run test:coverage` runs the same suite with enforced V8 coverage thresholds.
- `npm run build` requires a successful typecheck before producing `dist/`.
- `npm run test:e2e` runs the real Playwright multiplayer flow.
- `npm run check` runs the local lint/typecheck/coverage/build quality gate.

The Stage 7 coverage floor is 80% lines/statements and 75% functions/branches. It is intentionally below the current measured coverage so normal refactors have room while meaningful regressions still fail CI.

## Full-stack Playwright test

The Playwright suite starts both the real client and real server locally. By default it expects the server repository next to this repository as `../image-game-server`:

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

Set `IMAGE_GAME_SERVER_DIR` if the server checkout is elsewhere.

The primary E2E scenario creates a unique room and drives three independent browser contexts: one host, Alice and Bob. It covers lobby joining, selecting the Mock provider, prompt submission, generated-image delivery, voting and results. No external image-generation credentials are required.

## CI

Pull requests and `main` pushes run deterministic install/audit, lint, TypeScript checking, coverage-enforced Vitest tests and the production build. Only after those pass does a second required job check out `digiguru/image-game-server@main`, install Chromium and execute the real full-stack Playwright game flow.

## Production-hardening boundary

Host authorization, shared persistent game state, restrictive production CORS/rate limiting and distributed realtime concerns are intentionally deferred to the later productionisation phase.
