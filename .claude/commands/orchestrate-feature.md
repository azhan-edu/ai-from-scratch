<--
prepare a professional prompt base on this request:
ask question 

I have a set of agents and skills in the project
I have an app in the folder `app`  and file CLAUDE.md there
Can you suggest how to orchestrate these agents to implement full feature development process/loop: development, static code analysis, linting, add/update/check unit tests, etc...?


!!!!! --- >> then 

 i want you create 
  - A dedicated orchestrator agent system should use him to manage each developmemt request
  - save the runbook to docs/agent-orchestration.md
  - update CLAUDE.md
according to these changes

++
The orchestrator must adhere to a strict Test-Driven Development (TDD) methodology, enforcing the following quality gates before any code is considered complete:
- Test Coverage: All functionality must be preceded by corresponding unit and/or integration tests. No implementation code is merged without passing tests.
- Static Analysis: TypeScript compilation must succeed with zero errors (tsc --noEmit or equivalent build step) before proceeding.
- Linting: Code must pass all configured linting rules (e.g., ESLint) with no errors or warnings suppressed without explicit justification.
- Quality Gate Sequence: Tests → Type Check → Lint → Build. Each step must pass before advancing to the next.

-->

I have a Next.js 15 / React 19 / TypeScript project with a set of custom Claude Code
subagents (`.claude/agents/`) and skills (`.claude/skills/`). The app lives in the
`app/` folder and has its own `CLAUDE.md` with per-slice instructions.

Available agents:
  ui-architect, component-spec-writer, db-agent, state-manager, api-route-builder,
  component-builder, test-engineer, e2e-agent, auth-agent, ci-agent, security-agent,
  architecture-reviewer, logic-reviewer, security-reviewer, style-reviewer,
  dependency-reviewer, review-synthesiser

Available skills:
  nextjs-developer, ui-ux-pro-max, shadcn-ui, senior-architect, software-architecture,
  frontend-design, webapp-testing, sequential-thinking, drizzle, drawio-diagrams-enhanced

Goal: design a complete, repeatable agent orchestration loop for full feature
development — covering every phase from spec to merge-ready PR.

The loop must address:
  1. Feature specification       — component API, variant list, state catalogue
  2. Data layer                  — schema changes, migrations, query helpers
  3. State design                — Zustand slices, TanStack Query keys, cache strategy
  4. API layer                   — tRPC procedures, Zod validation, error codes
  5. Component implementation    — React + Tailwind + shadcn/ui, dark mode, a11y
  6. Static analysis             — TypeScript strict check, Biome lint, import boundaries
  7. Unit + integration tests    — Vitest, real DB (no mocks), coverage gates 80%/75%
  8. E2E tests                   — Playwright golden path, axe-core zero critical violations
  9. Parallel review panel       — architecture, logic, security, style, dependency
  10. Synthesis + gate           — consolidated verdict, BLOCK or PASS before merge

For each phase answer:
  - Which agent runs it?
  - Which skill(s) should be loaded?
  - What is the concrete output (file path, format)?
  - What are the entry/exit conditions (what input does it need, what must be true
    before the next phase starts)?
  - Which phases can run in parallel and which must be sequential?

Constraints:
  - Agents that do not exist in the list above must not be referenced.
  - Missing capabilities (e.g. a11y audit, perf audit, dark-mode enforcement)
    must be covered by the closest available agent + skill combination, not by
    inventing new agent names.
  - The output should be a runnable reference — concrete enough that I can copy
    a phase prompt and invoke the agent directly without further clarification.



