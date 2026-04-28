# Agent Orchestration Runbook

Per-phase reference for the `orchestrator` agent. Contains prompt templates,
entry/exit conditions, output paths, and skill assignments for all 10 phases.

Read by: `orchestrator` agent at the start of every feature development request.

---

## Summary table

| Phase | Agent | Skills | Parallel? | Skip when |
|---|---|---|---|---|
| 1 spec | `component-spec-writer` | `ui-ux-pro-max`, `drawio-diagrams-enhanced` | No | Pure backend |
| 2 db | `db-agent` | `drizzle` | No | No schema changes |
| 3 state | `state-manager` | `nextjs-developer`, `software-architecture` | No | — |
| 4 api | `api-route-builder` | `nextjs-developer`, `software-architecture` | No | — |
| 5 component | `component-builder` | `frontend-design`, `shadcn-ui` | No | Pure backend |
| 6 static | `ci-agent` | `nextjs-developer` | No | — |
| 7 unit tests | `test-engineer` | `webapp-testing`, `software-architecture` | No | — |
| 8 e2e | `e2e-agent` | `webapp-testing`, `nextjs-developer` | No | Pure backend |
| 9a–9e review | 5 reviewers | none | **Yes — one message** | — |
| 10 synthesiser | `review-synthesiser` | none | No (needs 9a–9e) | — |

---

## Phase 1 — Feature Specification

**Agent:** `component-spec-writer`
**Skills:** `ui-ux-pro-max`, `drawio-diagrams-enhanced`
**Entry:** Feature description provided.
**Exit:** Spec file written covering all 7 sections. No code written.
**Output:** `docs/specs/<feature>-spec.md`

**Prompt template:**
```
You are component-spec-writer. Load skills: ui-ux-pro-max, drawio-diagrams-enhanced.

Feature: <feature description>

Produce docs/specs/<feature>-spec.md containing:
- Props API (name, type, required/optional, default)
- Variant list (all visual/behavioural variants)
- State catalogue (idle, loading, error, empty, each interaction state)
- Responsive rules (mobile-first breakpoints)
- Dark mode variants (token names from design-tokens/tokens.json)
- Accessibility states (focus, disabled, aria roles, live regions)
- Component tree diagram (drawio XML)

Do not write any code. Output only the spec file.
```

---

## Phase 2 — Data Layer

**Agent:** `db-agent`
**Skills:** `drizzle`
**Entry:** Phase 1 spec complete. Skip if no new tables or columns.
**Exit:** `pnpm drizzle-kit generate` exits 0. Migration applies on a clean test DB.
**Output:** `src/server/db/schema/<feature>.ts`, `drizzle/<timestamp>_<feature>.sql`

**Prompt template:**
```
You are db-agent. Load skill: drizzle.

Read docs/specs/<feature>-spec.md and src/server/db/schema/.

Tasks:
1. Add or modify Drizzle table definitions in src/server/db/schema/<feature>.ts
2. Add indexes for every foreign key and every column used in WHERE clauses
3. Run: pnpm drizzle-kit generate
4. Confirm the migration file in drizzle/ is present and applies cleanly

Rules (CLAUDE.md §7):
- Use pgEnum for all fixed-value columns
- All timestamps: { withTimezone: true }
- Destructive changes require a two-phase deploy — flag if needed
- Never hand-edit generated migration files

Output: schema file and migration file only.
```

---

## Phase 3 — State Design

**Agent:** `state-manager`
**Skills:** `nextjs-developer`, `software-architecture`
**Entry:** Phase 2 complete (or Phase 1 if Phase 2 skipped).
**Exit:** No server data in any Zustand slice. All new query keys are `as const`.
**Output:** `src/stores/<feature>-store.ts`, updated `src/lib/query-keys.ts`

**Prompt template:**
```
You are state-manager. Load skills: nextjs-developer, software-architecture.

Read:
- docs/specs/<feature>-spec.md
- src/server/db/schema/<feature>.ts (if exists)
- src/lib/query-keys.ts
- src/stores/ (existing slices for pattern reference)

Tasks:
1. Add Zustand slice to src/stores/<feature>-store.ts
   — UI/ephemeral state only (modal open, active tab, multi-step progress)
   — No server data in Zustand
   — useShallow for every multi-field subscription
2. Add typed query keys to src/lib/query-keys.ts
3. Document the optimistic update pattern for every mutation that changes pet needs:
   onMutate → cancelQueries + snapshot → setQueryData
   onError  → rollback to snapshot
   onSettled → invalidateQueries
   staleTime: 30_000 / gcTime: 300_000 on all pet queries

Output: store file and updated query-keys file.
```

---

## Phase 4 — API Layer

**Agent:** `api-route-builder`
**Skills:** `nextjs-developer`, `software-architecture`
**Entry:** Phase 3 complete.
**Exit:** All procedures end-to-end typed. No `any`. No raw `fetch` from client code.
**Output:** `src/server/services/<feature>-service.ts`, `src/server/db/queries/<feature>-queries.ts`, `src/server/api/schemas/<feature>.ts`, `src/server/api/routers/<feature>.ts`, updated `src/server/api/root.ts`

**Prompt template:**
```
You are api-route-builder. Load skills: nextjs-developer, software-architecture.

Read:
- docs/specs/<feature>-spec.md
- src/server/db/schema/<feature>.ts
- src/lib/query-keys.ts
- src/server/api/trpc.ts
- src/lib/errors.ts

Tasks:
1. Service: src/server/services/<feature>-service.ts
   — Result<T> return type, never throw, never return unknown
   — No direct DB imports — use query helpers only
2. Query helpers: src/server/db/queries/<feature>-queries.ts
3. Zod schemas: src/server/api/schemas/<feature>.ts
4. tRPC router: src/server/api/routers/<feature>.ts
   — protectedProcedure for all mutations and authenticated reads
   — publicProcedure only for read-only guest preview
   — Rate limiting on all mutations (30 req/min per user)
   — Add new AppErrors entries to src/lib/errors.ts
5. Register router in src/server/api/root.ts

Output: all 5 files.
```

---

## Phase 5 — Component Implementation

**Agent:** `component-builder`
**Skills:** `frontend-design`, `shadcn-ui`
**Entry:** Phases 1, 3, and 4 complete.
**Exit:** All spec variants implemented. `'use client'` only on leaf nodes. No hardcoded colors or spacing.
**Output:** `src/components/features/<feature>/*.tsx`, `*.stories.tsx`, `*.test.tsx` (stubs)

**Prompt template:**
```
You are component-builder. Load skills: frontend-design, shadcn-ui.

Read:
- docs/specs/<feature>-spec.md
- src/stores/<feature>-store.ts
- src/server/api/routers/<feature>.ts
- src/components/features/ (existing patterns)

Tasks:
1. Implement components in src/components/features/<feature>/
   — Server Components by default; 'use client' only at interactive leaf nodes
   — cva + clsx for variants; no string concatenation for class names
   — Dark mode via CSS custom properties (globals.css) — no JS toggling
   — Every interactive element: aria-label describing action and effect
   — Status bars: role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax, data-testid
   — Dynamic content: role="status", aria-live="polite", aria-atomic="true"
   — Focus ring: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
     on every interactive element — never remove
2. Storybook story for every variant in the spec
3. Co-located test stubs (empty describe blocks) — test-engineer fills in Phase 7

Output: component files, story files, test stubs.
```

---

## Phase 6 — Static Analysis

**Agent:** `ci-agent`
**Skills:** `nextjs-developer`
**Entry:** Phase 5 complete (or Phase 4 for pure backend).
**Exit:** `pnpm typecheck && pnpm lint` both clean. Build does not error.
**Output:** No files — this is a gate only.

**Prompt template:**
```
You are ci-agent. Load skill: nextjs-developer.

Run in order — stop on first failure:
  1. pnpm typecheck
  2. pnpm lint
  3. pnpm build (dry run / build check)

For each failure:
- Report exact file path, line number, and error message
- Fix it directly; re-run to confirm green before proceeding

Do not proceed to step 2 until step 1 is green.
Do not proceed to step 3 until step 2 is green.
```

---

## Phase 7 — Unit + Integration Tests

**Agent:** `test-engineer`
**Skills:** `webapp-testing`, `software-architecture`
**Entry:** Phase 6 green.
**Exit:** `pnpm test --coverage` exits 0. Line ≥ 80%, branch ≥ 75%.
**Output:** `src/server/services/<feature>-service.test.ts`, `src/server/api/routers/<feature>.test.ts`, filled `src/components/features/<feature>/*.test.tsx`

**Prompt template:**
```
You are test-engineer. Load skills: webapp-testing, software-architecture.

Read:
- src/server/services/<feature>-service.ts
- src/server/api/routers/<feature>.ts
- src/components/features/<feature>/*.test.tsx (stubs from Phase 5)

Tasks:
1. Unit tests: src/server/services/<feature>-service.test.ts
   — Every Result<T> branch: success, each error, edge cases
   — Vitest; real test DB — no mocks
2. Integration tests: src/server/api/routers/<feature>.test.ts
   — Real DB via createInnerTRPCContext; db.delete() in beforeEach
   — Cover: happy path, auth guard (UNAUTHORIZED), rate limit, invalid input
3. Component tests: fill stubs in src/components/features/<feature>/*.test.tsx
   — RTL; test interactions, not implementation details
4. Run: pnpm test --coverage

Gates: line ≥ 80%, branch ≥ 75%. Fail the phase if not met.
```

---

## Phase 8 — E2E Tests

**Agent:** `e2e-agent`
**Skills:** `webapp-testing`, `nextjs-developer`
**Entry:** Phase 7 green.
**Exit:** Playwright exits 0 on Chrome + Firefox. Zero critical axe violations.
**Output:** `e2e/<feature>-golden-path.spec.ts`

**Prompt template:**
```
You are e2e-agent. Load skills: webapp-testing, nextjs-developer.

Read:
- docs/specs/<feature>-spec.md
- e2e/ (existing test patterns)

Tasks:
1. Write e2e/<feature>-golden-path.spec.ts covering:
   — Primary happy path end-to-end
   — State persistence: action → reload → assert state survived
   — Each user-visible error state
2. End of every test — run axe-core:
     const results = await new AxeBuilder({ page }).analyze()
     expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0)
3. Run: pnpm e2e --project=chromium && pnpm e2e --project=firefox

If LCP > 2.5s or CLS > 0.1 observed, flag as a finding before Phase 9.
```

---

## Phase 9 — Parallel Review Panel

Dispatch all 5 in a **single message as parallel Agent calls**.

**Entry:** Phase 8 green (or Phase 7 for pure backend).
**Exit:** All 5 JSON files written to `docs/review/`.

JSON schema for all 5 outputs:
```json
{
  "verdict": "PASS" | "BLOCK",
  "findings": [
    { "severity": "blocker" | "major" | "minor", "file": "", "line": 0, "message": "" }
  ]
}
```

### 9a — `architecture-reviewer`
```
You are architecture-reviewer. Review the diff for the <feature> feature.
Focus: RSC/client boundary correctness, layer import rules (CLAUDE.md §9),
folder structure, separation of concerns, tRPC vs Route Handler usage.
Output JSON to docs/review/<feature>-arch.json.
```

### 9b — `logic-reviewer`
```
You are logic-reviewer. Review the diff for the <feature> feature.
Focus: Result<T> pattern completeness, optimistic update rollback safety,
calculation correctness, race conditions, impossible states.
Output JSON to docs/review/<feature>-logic.json.
```

### 9c — `security-reviewer`
```
You are security-reviewer. Review the diff for the <feature> feature.
Focus: input validation coverage, auth guards on every protected procedure,
no PII sent to Claude API, no secrets in code, dangerouslySetInnerHTML,
OWASP Top 10 patterns.
Output JSON to docs/review/<feature>-security.json.
```

### 9d — `style-reviewer`
```
You are style-reviewer. Review the diff for the <feature> feature.
Focus: naming conventions, import order, no console.log, cva/clsx usage,
no hardcoded colors or spacing, no 'use client' on non-leaf nodes, dead code.
Output JSON to docs/review/<feature>-style.json.
```

### 9e — `dependency-reviewer`
```
You are dependency-reviewer. Review the diff for the <feature> feature.
Focus: new packages (run pnpm audit on each), bundle size impact,
licence compatibility, duplicate functionality.
Output JSON to docs/review/<feature>-deps.json.
```

---

## Phase 10 — Synthesis + Gate

**Agent:** `review-synthesiser`
**Skills:** none
**Entry:** All 5 JSON files present from Phase 9.
**Exit:** PASS → PR merge-ready. BLOCK → return to named phase.
**Output:** `docs/review/<feature>-consolidated.md`

**Prompt template:**
```
You are review-synthesiser.

Read:
- docs/review/<feature>-arch.json
- docs/review/<feature>-logic.json
- docs/review/<feature>-security.json
- docs/review/<feature>-style.json
- docs/review/<feature>-deps.json

Tasks:
1. Deduplicate overlapping findings across reviewers
2. Group by severity: blocker → major → minor
3. Write consolidated PR comment to docs/review/<feature>-consolidated.md
4. Verdict:
   — BLOCK if any finding is severity "blocker"
   — PASS if all findings are "major" or "minor"
5. For each BLOCK finding, name the return phase:
   — Architecture/logic/security → Phase 4 or 5
   — Style → Phase 5, then re-run Phases 6–10
   — Dependency → Phase 5, then re-run Phases 6–10
```
