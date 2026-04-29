# GitHub Actions CI Improvements

## Phase 2 — Core Quality Gates (implement first)

### 1. `ci.yml` — four parallel jobs on every push + PR

| Job | Command | Fails on |
|-----|---------|----------|
| `lint` | `biome check .` | lint error or format drift |
| `typecheck` | `tsc --noEmit` | any type error |
| `test` | `vitest run --coverage` | test failure or coverage below threshold |
| `build` | `next build` | broken imports, missing env, SSR errors |

### 2. Coverage threshold gate
Add to `vitest.config.ts`:
- Lines: **80%** minimum
- Branches: **75%** minimum

CI fails when a PR drops coverage — not just when tests fail.

### 3. `pnpm audit` security gate
```bash
pnpm audit --audit-level high
```
Zero-cost step in `ci.yml`. Fails on any high or critical CVE.

---

## Phase 3 — PR Quality Gates

### 4. `e2e.yml` — Playwright on PRs only
Runs on `pull_request` only (not every push). Installs Chromium + Firefox via:
```bash
pnpm playwright install --with-deps chromium firefox
```
`playwright.config.ts` already has `workers: 1` on CI.

### 5. Bundle size gate
After `next build`, assert chunk sizes via `bundlesize`. Blocks merge if a new import silently bloats the bundle.

Targets from `CLAUDE.md`:
```json
"bundlesize": [
  { "path": ".next/static/chunks/main-*.js",  "maxSize": "50 kB" },
  { "path": ".next/static/chunks/pages/*.js", "maxSize": "30 kB" }
]
```

### 6. Lighthouse CI
`@lhci/cli` runs against the `next build` output via `lhci autorun`.

Enforces `CLAUDE.md` perf targets:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

Posts a score comment on every PR and flags regressions vs. `main` baseline.

---

## Phase 4 — Ecosystem Health

### 7. `knip` dead code sweep
Scans for unused files, exports, and dependencies. Zero-config for Next.js. Prevents ghost code accumulating as features get refactored.

### 8. Renovate bot
`CLAUDE.md` references Renovate but it is not configured yet. Add `renovate.json` to automate dependency update PRs:
- Security patches: auto-merge within 48h if CI passes
- Minor/patch: auto-merge if CI passes
- Major: RFC required, staging validation ≥ 2 weeks

### 9. PR size gate
A GitHub Action that warns (or fails) when a PR touches more than 400 lines. Forces smaller, reviewable PRs.

---

## Recommended Order

```
Phase 2 — before the next feature PR
  ci.yml: lint + typecheck + test + build (parallel)
  coverage thresholds in vitest.config.ts
  pnpm audit step

Phase 3 — once e2e suite has >1 spec
  e2e.yml: Playwright on Chrome + Firefox
  bundlesize gate
  Lighthouse CI

Phase 4 — ongoing
  knip dead code sweep
  Renovate bot config
  PR size gate
```
