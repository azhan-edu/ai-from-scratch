# CI Improvement Ideas

## Local (pre-commit / pre-push)

### 1. Husky + lint-staged for pre-commit
Run `biome check --write` only on staged `.ts`/`.tsx` files. `biome.json` already has VCS integration enabled (`useIgnoreFile: true`) — biome is already git-aware. Fast: staged-only means a single file commit takes ~200ms, not 3s.

### 2. Pre-commit TypeScript check (scoped)
Run `tsc --noEmit` on pre-commit. `tsconfig.json` has `incremental: true` and `.tsbuildinfo` caching — subsequent runs are near-instant after the first.

### 3. Pre-push unit tests
Run `vitest run` before push. Suite will grow — better to gate it now before it matters. Playwright e2e stays CI-only (too slow locally).

### 4. Commit message linting with commitlint
CLAUDE.md defines `feat(pet): ...` / `fix(decay): ...` convention. `commitlint` + `@commitlint/config-conventional` enforces it via a `commit-msg` hook. Keeps git log clean for changelogs and the ADR trail.

---

## GitHub Actions Pipeline

### 5. `ci.yml` — core quality gates (every push + PR)
Four parallel jobs, no sequential waiting:

| Job | Command | Fails on |
|-----|---------|----------|
| `lint` | `biome check .` | any lint error or format drift |
| `typecheck` | `tsc --noEmit` | any type error |
| `test` | `vitest run --coverage` | test failure or coverage below threshold |
| `build` | `next build` | broken imports, missing env, SSR errors |

### 6. Coverage threshold gate
`vitest.config.ts` has no `coverage` config. Add thresholds matching CLAUDE.md targets (80% lines, 75% branches). CI fails when a PR drops coverage — not just when tests fail.

### 7. E2E job on PRs only
`playwright.config.ts` already has `workers: 1` on CI and Chrome + Firefox projects. Add `e2e.yml` that runs on `pull_request` only (not every push). Uses `pnpm playwright install --with-deps chromium firefox` to install browsers in CI.

### 8. `pnpm audit` security gate
CLAUDE.md mandates `pnpm audit --audit-level high`. Zero-cost to add as a job step. Fails on any high or critical CVE.

---

## Bundle Size Gate

### 9. `bundlesize` in CI
CLAUDE.md specifies < 80 KB initial JS bundle (50 KB main chunk, 30 KB per page). After `next build`, assert chunk sizes via `bundlesize`. Blocks merge if a new import bloats the bundle silently.

### 10. Compressed size check
Check gzip size, not raw size — that is what users download. `bundlesize` supports `maxSize` in gzip by default.

---

## Lighthouse / Performance Gates

### 11. Lighthouse CI on PRs
`@lhci/cli` runs against the `next build` output via `lhci autorun`. Enforces CLAUDE.md perf targets:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

Posts a comment on the PR with scores and flags regressions vs. `main` baseline.

### 12. Lighthouse baseline on `main`
Store Lighthouse results from `main` as a workflow artifact. PRs compare against the baseline rather than an absolute number — catches regressions even when the absolute score is fine.

---

## Other Quality Gates

### 13. Dead code check with `knip`
Scans for unused files, exports, and dependencies. Zero-config for Next.js. Prevents ghost code from accumulating as features get refactored.

### 14. Dependency license check
`license-checker` or `licensee` — blocks PRs that introduce a GPL or AGPL dependency into what may become a commercial product.

### 15. PR size gate
A GitHub Action that fails (or posts a warning comment) when a PR touches more than N files or N lines. Forces smaller, reviewable PRs. 400 lines changed is a common starting threshold.

### 16. Stale dependency check
Weekly scheduled workflow running `pnpm outdated` and opening an issue, or Renovate bot for automated update PRs. CLAUDE.md references Renovate but it is not configured yet.

---

## Recommended Implementation Order

```
Phase 1 — Local (immediate dev experience)
  husky + lint-staged (pre-commit biome)
  pre-push vitest run
  commitlint

Phase 2 — GitHub Actions (before next feature PR)
  ci.yml: lint + typecheck + test + build (parallel jobs)
  pnpm audit step
  coverage threshold in vitest.config.ts

Phase 3 — PR quality (once e2e suite has >1 spec)
  e2e.yml: Playwright on Chrome + Firefox
  bundlesize gate after next build
  Lighthouse CI

Phase 4 — Ecosystem health (ongoing)
  knip dead code sweep
  Renovate bot config
  PR size gate
```
