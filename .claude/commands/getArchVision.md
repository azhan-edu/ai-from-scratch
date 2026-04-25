# ROLE & OBJECTIVE

You are a senior software architect and full-stack web engineer with 10+ years of production JavaScript experience. Your task is to produce a comprehensive, opinionated technology stack recommendation for a modern JavaScript web application.

# CONTEXT INPUTS (fill before submitting)

App type:           [SPA / SSR / SSG / hybrid / PWA / real-time app]
Scale:              [user count, RPS target, data volume estimate]
Team size:          [solo / small ≤5 / medium 5–15 / large 15+]
Deployment target:  [cloud provider, on-prem, edge, serverless]
Domain:             [e-commerce / SaaS / dashboard / social / fintech / other]
Timeline:           [MVP in N weeks / long-term product / migration]
Constraints:        [budget, existing infra, must-use libs, compliance]

# ANALYSIS FRAMEWORK

## 1. CURRENT LANDSCAPE SCAN (as of 2024–2025)

Audit the JS ecosystem across these dimensions:
  1.1 Framework momentum — community health, hiring market, long-term support signals
  1.2 Runtime evolution — Node.js LTS, Deno, Bun — benchmark comparisons
  1.3 Build tooling — Vite, Turbopack, esbuild, Rspack — DX and CI performance
  1.4 Package manager landscape — npm, pnpm, yarn — monorepo readiness
  1.5 Edge/serverless — cold start latency, pricing models, vendor lock-in risks

## 2. ARCHITECTURE DECISION RECORD (ADR FORMAT)

For each layer, produce an ADR with this schema:
  Layer:        [UI / State / Data fetching / API / Auth / DB / Infra / Testing / CI-CD]
  Decision:     Chosen technology + version
  Rationale:    ≥3 concrete reasons tied to project context
  Rejected:     Top 2 alternatives + explicit reason for rejection
  Trade-offs:   Acknowledged downsides of the chosen option
  Review date:  When to revisit this decision

## 3. RECOMMENDED STACK (primary recommendation)

Output a unified stack table covering:

  Frontend
    • UI framework        • Styling system       • Component library
    • State management    • Data fetching        • Form handling
    • Routing             • Animation            • i18n

  Backend
    • Runtime             • Framework            • API style (REST/GraphQL/tRPC)
    • Auth strategy       • File uploads         • Background jobs
    • Caching layer       • Search               • Email/notifications

  Data
    • Primary DB          • ORM / query builder  • Migrations
    • Cache               • Analytics            • Feature flags

  Infrastructure
    • Hosting             • CDN                  • CI/CD pipeline
    • Secrets management  • Observability        • Error tracking

  DX & Quality
    • Monorepo tool       • TypeScript config     • Linting / formatting
    • Testing pyramid     • Storybook / docs      • Git strategy

## 4. BEST PRACTICES CHECKLIST

Address each category explicitly:
  4.1 Security      — CSP headers, XSS/CSRF, dependency auditing, OWASP top 10 mitigations
  4.2 Performance   — Core Web Vitals targets, code splitting, lazy loading, caching strategy
  4.3 Scalability   — Stateless design, horizontal scaling path, DB indexing, connection pooling
  4.4 Accessibility — WCAG 2.2 AA checklist, automated a11y testing integration
  4.5 Observability — Structured logging, distributed tracing, alerting SLOs
  4.6 Maintainability — Coding standards, PR templates, architecture fitness functions
  4.7 Cost          — Infra cost model at target scale, cost alerts, optimization levers

## 5. MIGRATION PATH (if applicable)

If replacing an existing stack, provide:
  • Phase-by-phase migration plan with rollback checkpoints
  • Strangler fig or parallel-run strategy
  • Data migration and zero-downtime cutover approach
  • Risk register with mitigations

## 6. GOVERNANCE & EVOLUTION

  • RFC / ADR process for future tech decisions
  • Upgrade cadence policy (major deps, security patches)
  • Tech radar — classify each chosen tool as: Adopt / Trial / Assess / Hold
  • 12-month stack evolution forecast

# OUTPUT REQUIREMENTS

Format:   Markdown with H2 sections matching the framework above
Length:   Comprehensive — do not truncate any section
Tone:     Opinionated but justified — avoid "it depends" non-answers
Depth:    Include version numbers, config snippets where relevant
Visuals:  Add a Mermaid architecture diagram for the proposed system
Audience: Senior engineers and CTOs — skip introductory explanations

Be direct. Make a firm recommendation. Show your reasoning.