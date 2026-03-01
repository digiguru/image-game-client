# Security advisory remediation routines

This repository currently depends on `react-scripts@5.0.1` and inherits a number of older transitive packages. In this execution environment I could not query GitHub Dependabot alerts or the npm audit API directly (both returned HTTP 403), so the routines below are based on the dependency graph in `package-lock.json` and known advisory hotspots commonly flagged for this stack.

## How to use this document with Dependabot

For each alert in GitHub:
1. Match the alert package name to the section below.
2. Apply the **Immediate routine** first (lowest-risk patch path).
3. If Dependabot still cannot resolve cleanly, apply the **Structural routine** for that package family.

---

## 1) `nth-check@1.0.2` via `svgo@1.3.2`

**Observed path**
`react-scripts -> @svgr/webpack -> @svgr/plugin-svgo -> svgo@1.3.2 -> css-select@2.1.0 -> nth-check@1.0.2`

**Risk pattern**
Old `nth-check` versions are frequently flagged for ReDoS.

**Immediate routine**
- Add an npm `overrides` entry for `nth-check` forcing `^2.1.1`.
- Regenerate lockfile and run build/tests.
- Verify generated SVG handling still works.

**Structural routine**
- Replace `react-scripts` with a maintained toolchain (Vite/Next/custom webpack) so `@svgr/plugin-svgo@5`/`svgo@1` are no longer pinned.

---

## 2) `postcss@8.4.27` (and `postcss@7.0.39`)

**Observed paths**
Multiple `react-scripts` CSS plugins pin `postcss@8.4.27`; `resolve-url-loader` pulls `postcss@7.0.39`.

**Risk pattern**
Dependabot often flags older PostCSS lines for parser bypass/ReDoS-class issues.

**Immediate routine**
- Add `overrides` for `postcss` to a patched version in the 8.4.x line where compatible.
- Validate CSS build output and source maps (`resolve-url-loader` path is sensitive).

**Structural routine**
- Remove `react-scripts` dependency chain and move to newer bundler plugins that do not drag PostCSS 7.

---

## 3) `webpack-dev-server@4.15.1` + `http-proxy-middleware@2.0.9`

**Observed path**
`react-scripts -> webpack-dev-server@4.15.1 -> http-proxy-middleware@2.0.9`

**Risk pattern**
Dev-server/proxy packages frequently receive advisories around request smuggling, origin checks, and denial-of-service conditions.

**Immediate routine**
- Use `overrides` to bump `http-proxy-middleware` and `webpack-dev-server` to patched minors/patches compatible with webpack 5.
- Re-test local dev workflow (HMR, proxy routes, websocket reconnects).

**Structural routine**
- Migrate off CRA dev server (`react-scripts start`) to Vite or another modern server with active maintenance.

---

## 4) `ws` versions (`7.5.10`, `8.17.1`, `8.18.3`)

**Observed paths**
- `react-scripts -> jest/jsdom -> ws@7.5.10`
- `socket.io-client -> engine.io-client -> ws@8.17.1`
- `webpack-dev-server -> ws@8.18.3`

**Risk pattern**
`ws` has had multiple DoS and header-validation advisories across major lines.

**Immediate routine**
- Add `overrides` to patched `ws` versions per major line where consumers allow it.
- Prefer updating parents (`socket.io-client`, `engine.io-client`, `jest/jsdom`) before forcing overrides.

**Structural routine**
- Upgrade test/runtime stacks so old major lines (`ws@7`) are eliminated.

---

## 5) `serialize-javascript@4.0.0`

**Observed path**
`react-scripts -> workbox-webpack-plugin -> workbox-build -> rollup-plugin-terser -> serialize-javascript@4.0.0`

**Risk pattern**
Older `serialize-javascript` versions are commonly flagged for XSS-related unsafe serialization cases.

**Immediate routine**
- Add `overrides` for `serialize-javascript` to `^6.0.2` where semver allows.
- Confirm service worker build (`workbox`) still compiles.

**Structural routine**
- Upgrade or replace workbox build chain through toolchain migration.

---

## 6) `svgo@1.3.2`

**Observed path**
`react-scripts -> @svgr/plugin-svgo@5.5.0 -> svgo@1.3.2`

**Risk pattern**
`svgo` v1 is deprecated and appears in many advisory chains through sub-dependencies.

**Immediate routine**
- Attempt targeted override only if compatible; expect breakage risk because v1->v2 is major.

**Structural routine (recommended)**
- Move to a build stack that uses modern `@svgr/*` and `svgo@2+`.

---

## Practical execution order (lowest disruption first)

1. Create a dedicated `security/dependabot-remediation` branch.
2. Apply **override-only** lockfile remediations for leaf deps first (`nth-check`, `postcss`, `serialize-javascript`, `ws`).
3. Run checks: `npm run build` + test suite.
4. If alerts remain blocked by pinned transitive deps in CRA, plan toolchain migration as the durable fix.

## Suggested PR slicing strategy

- **PR A (Low risk):** overrides + lockfile refresh for leaf vulnerabilities.
- **PR B (Medium risk):** direct dep bumps (`socket.io-client`, test libs).
- **PR C (High value):** migrate from CRA/`react-scripts` to maintained build system.

This sequencing keeps production risk low while making steady progress through Dependabot alerts one-by-one.
