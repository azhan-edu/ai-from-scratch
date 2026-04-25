# JavaScript Web App — Architectural Tech Stack Analysis 2025
**Prepared for:** Senior Engineers & CTOs  
**Context:** Production SaaS web application · Medium team (6–12 engineers) · ~50k MAU scaling to 500k · AWS deployment · 12-week MVP → long-term product · TypeScript-first · No legacy constraints

---

## 1. CURRENT LANDSCAPE SCAN (2024–2025)

### 1.1 Framework Momentum

**React** retains dominant market position — 40%+ of production codebases, largest hiring pool, strongest ecosystem. React 19 introduced stable Server Components, Actions, and `use()` hook. The React Foundation formation in 2025 added institutional assurance. **Verdict: safe long-term bet.**

**Next.js 15** (App Router, stable) is the production-grade meta-framework of choice. It delivers SSR, SSG, ISR, edge-ready API routes, and React Server Components out of the box. TanStack Start is the fastest-rising alternative for teams wanting more control over routing architecture.

**Vue 3 / Nuxt 4** — excellent, but smaller hiring pool for SaaS teams. **Angular 18** — strong for large enterprise teams who value enforced structure; overkill for most SaaS.

**SvelteKit** — exceptional DX and performance, but ecosystem immaturity limits component library choice. Assess for future adoption.

### 1.2 Runtime Evolution

| Runtime | RPS (raw HTTP) | Cold Start | TypeScript | Ecosystem | Verdict |
|---|---|---|---|---|---|
| **Node.js 22 LTS** | ~65k req/s | ~150ms | Via toolchain | Gold standard | **Adopt** |
| **Bun 1.3** | ~180k req/s | ~10ms | Native, zero-config | 94% npm compat | **Trial** |
| **Deno 2** | ~75k req/s | ~40ms | Native, sandboxed | Good, npm via `npm:` | **Assess** |

**Decision:** Node.js 22 LTS for production (stability + APM maturity). Bun for local dev and CI (25× faster installs, faster test runs). The `Next.js on Bun: 380MB vs 512MB on Node` memory advantage is real but not yet worth production risk.

### 1.3 Build Tooling

| Tool | Dev HMR | Prod Build | Config Complexity |
|---|---|---|---|
| **Vite 6** | Sub-100ms | Via Rollup | Low |
| **Turbopack** (Next.js native) | Sub-50ms | Rust-native | Zero (bundled) |
| **esbuild** | N/A (library) | Sub-1s | Medium |
| **Rspack** | Fast | Rust webpack-compat | Medium-High |

**Decision:** Turbopack via Next.js 15 — no separate configuration, best integrated DX. Vite for standalone tooling needs.

### 1.4 Package Manager

**pnpm 9** — 40-60% faster installs than npm, strict dependency isolation, native monorepo workspace support with `pnpm-workspace.yaml`. Zero phantom dependencies. **Adopt now.**

### 1.5 Edge / Serverless

- **Vercel Edge Runtime** — zero cold start, V8 isolates, 25ms CPU limit. Best for lightweight middleware, auth guards, A/B testing.
- **AWS Lambda** — Node.js 22 runtime, cold starts 200–400ms (mitigated with Provisioned Concurrency for critical paths).
- **Cloudflare Workers** — best raw edge performance, but Deno/Bun alignment preferred over their runtime quirks.

**Verdict:** Hybrid model. Edge for read-heavy/CDN-cacheable routes, Lambda for complex business logic.

---

## 2. ARCHITECTURE DECISION RECORDS

### ADR-001: UI Framework

| Field | Detail |
|---|---|
| **Layer** | UI |
| **Decision** | React 19 + Next.js 15.x (App Router) |
| **Rationale** | (1) Server Components reduce client bundle by 40–60% for data-heavy dashboards. (2) Largest ecosystem — shadcn/ui, Radix, React Query, all first-class. (3) Hiring: React leads all JS framework job postings by 3×. |
| **Rejected** | SvelteKit — limited component library ecosystem. Vue 3 — smaller hiring pool at this scale. |
| **Trade-offs** | App Router mental model (async server components, "use client" boundaries) is a learning curve. Next.js vendor affinity with Vercel, though self-hosting is well-supported. |
| **Review date** | Q1 2026 — reassess TanStack Start if RSC adoption remains complex |

### ADR-002: State Management

| Field | Detail |
|---|---|
| **Layer** | State |
| **Decision** | Zustand 5 (client state) + TanStack Query 5 (server state) |
| **Rationale** | (1) Server state (80% of app state) belongs in TanStack Query — caching, deduplication, background refetch out of the box. (2) Zustand for UI state: minimal boilerplate, no providers, TypeScript-native. (3) With RSC, Redux is architectural overkill. |
| **Rejected** | Redux Toolkit — too heavy for SaaS dashboard. Jotai — excellent, but weaker devtools. |
| **Trade-offs** | Two separate libraries. Discipline needed to not blur server/client state boundaries. |
| **Review date** | Q3 2025 — React 19 `use()` + RSC may eliminate most client state needs |

### ADR-003: Styling

| Field | Detail |
|---|---|
| **Layer** | Styling |
| **Decision** | Tailwind CSS 4 + shadcn/ui |
| **Rationale** | (1) Tailwind 4 uses Lightning CSS — 10× faster builds. (2) shadcn/ui: unstyled, copy-paste components = full ownership, no npm update hell. (3) Design tokens via CSS variables — dark mode trivial. |
| **Rejected** | CSS Modules — verbose, poor colocating of styles. Emotion/styled-components — runtime overhead, poor RSC support. |
| **Trade-offs** | Tailwind class verbosity in JSX; mitigated with `clsx` + `cva` patterns. |
| **Review date** | Stable — no planned review |

### ADR-004: API Layer

| Field | Detail |
|---|---|
| **Layer** | API |
| **Decision** | tRPC 11 over HTTP for internal SaaS API; REST for public/webhook endpoints |
| **Rationale** | (1) End-to-end TypeScript safety — zero API contract drift. (2) No code generation step. (3) With Next.js App Router, tRPC server actions integrate cleanly. |
| **Rejected** | GraphQL — operational complexity (schema, resolvers, N+1 guards) unjustified at this scale. Pure REST — loses type safety across FE/BE boundary. |
| **Trade-offs** | tRPC is not suitable for public third-party API consumption. REST layer maintained in parallel for webhooks, partner integrations. |
| **Review date** | Q2 2026 — evaluate if React Server Actions could replace tRPC for read paths |

### ADR-005: Authentication

| Field | Detail |
|---|---|
| **Layer** | Auth |
| **Decision** | Auth.js v5 (NextAuth) — self-hosted |
| **Rationale** | (1) Native Next.js App Router integration via middleware. (2) Supports OAuth (Google, GitHub), magic links, credentials. (3) Full data ownership — no vendor lock-in. (4) PKCE + rotating refresh tokens by default. |
| **Rejected** | Clerk — excellent DX but $0.02/MAU adds up to $10k/month at 500k users. Auth0 — similar cost concern + JSON config complexity. |
| **Trade-offs** | Auth.js self-hosting requires your team to handle session storage, rotation edge cases. Budget ~2 sprints for hardening. |
| **Review date** | Stable for 18 months |

### ADR-006: Database

| Field | Detail |
|---|---|
| **Layer** | DB |
| **Decision** | PostgreSQL 16 (primary) + Drizzle ORM 0.30+ |
| **Rationale** | (1) PostgreSQL: JSONB for schema flexibility, row-level security, pgvector for future AI features, unmatched reliability. (2) Drizzle: TypeScript-first, schema-as-code, 3× faster query throughput than Prisma in benchmarks. (3) Zero runtime overhead — generates pure SQL. |
| **Rejected** | Prisma — slower query throughput, heavier runtime. MongoDB — ACID trade-offs unacceptable for financial/transactional SaaS. |
| **Trade-offs** | Drizzle migrations are less automated than Prisma. Requires disciplined migration workflow (see Section 3). |
| **Review date** | Database layer is stable — no planned review |

### ADR-007: Caching

| Field | Detail |
|---|---|
| **Layer** | Cache |
| **Decision** | Redis 7 (Upstash serverless or AWS ElastiCache) |
| **Rationale** | (1) Session store, rate limiting, queue backing. (2) Upstash for serverless paths — per-request pricing. ElastiCache for sustained high-throughput. (3) Redis 7 functions replace Lua scripts. |
| **Rejected** | Memcached — no persistence, limited data types. In-memory caching — worthless in horizontal scaled environment. |
| **Trade-offs** | Upstash has 40ms+ P99 latency vs ElastiCache's <1ms in same-region. Use ElastiCache for session-critical paths. |
| **Review date** | Q2 2026 — evaluate Cloudflare KV for edge cache |

### ADR-008: Infrastructure

| Field | Detail |
|---|---|
| **Layer** | Infra |
| **Decision** | AWS (ECS Fargate + RDS Aurora PostgreSQL + CloudFront) |
| **Rationale** | (1) Fargate: container-native, no EC2 management, autoscaling to zero. (2) Aurora: 5× throughput vs standard RDS, auto-scaling storage, multi-AZ by default. (3) CloudFront: 400+ edge locations, S3 origin for assets. |
| **Rejected** | Vercel — $20/seat/month + bandwidth costs unscalable past Series A. Pure Kubernetes — operational overhead unjustified before 10M MAU. |
| **Trade-offs** | AWS operational complexity. Mitigated with Terraform + CDK. |
| **Review date** | Q4 2026 |

### ADR-009: Testing

| Field | Detail |
|---|---|
| **Layer** | Testing |
| **Decision** | Vitest (unit/integration) + Playwright (E2E) + Testing Library |
| **Rationale** | (1) Vitest: 3× faster than Jest, native ESM, compatible test API. (2) Playwright: cross-browser, auto-wait, component testing support. (3) Testing Library: behavior-first assertions aligned with a11y. |
| **Rejected** | Jest — slower, ESM config friction. Cypress — slower, no component testing in v12. |
| **Trade-offs** | Vitest requires Vite or custom config outside Next.js; use `@vitejs/plugin-react` adapter. |
| **Review date** | Stable |

### ADR-010: CI/CD

| Field | Detail |
|---|---|
| **Layer** | CI/CD |
| **Decision** | GitHub Actions + AWS CodePipeline (prod) |
| **Rationale** | (1) GitHub Actions: generous free tier, native OIDC to AWS (no static credentials). (2) CodePipeline for prod: audit logs, approval gates, rollback to previous task definition. |
| **Rejected** | CircleCI — cost. Jenkins — operational overhead. GitLab CI — unnecessary migration from GitHub. |
| **Trade-offs** | Two CI systems to maintain. Mitigated by keeping GHA for PR checks only, CodePipeline for deployment. |
| **Review date** | Q1 2026 |

---

## 3. RECOMMENDED STACK — UNIFIED TABLE

### Frontend

| Concern | Technology | Version | Notes |
|---|---|---|---|
| UI Framework | React + Next.js | 19 / 15.x | App Router, RSC |
| Styling | Tailwind CSS | 4.x | Lightning CSS engine |
| Components | shadcn/ui + Radix UI | Latest | Copy-paste, fully owned |
| State (client) | Zustand | 5.x | Minimal, TypeScript-native |
| State (server) | TanStack Query | 5.x | Cache, dedup, optimistic UI |
| Forms | React Hook Form + Zod | 7.x / 3.x | Schema-validated, no re-renders |
| Routing | Next.js App Router | Built-in | File-based, parallel routes |
| Animation | Motion (Framer Motion) | 11.x | Layout animations, gestures |
| i18n | next-intl | 3.x | RSC-compatible, edge-ready |

### Backend

| Concern | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js LTS | 22.x | V8, widest APM support |
| Framework | Next.js API Routes + Hono | 15.x / 4.x | tRPC on Next.js; Hono for standalone services |
| API Style | tRPC (internal) + REST (public) | 11.x | Type-safe internal; OpenAPI for partners |
| Auth | Auth.js (NextAuth) | v5 | Edge-compatible, rotating tokens |
| File Uploads | AWS S3 + presigned URLs | SDK v3 | Never route files through server |
| Background Jobs | BullMQ | 5.x | Redis-backed, job retries, priorities |
| Caching | Upstash Redis | Latest | Edge-compatible; ElastiCache for high RPS |
| Search | Typesense (self-hosted) or Algolia | Latest | Typesense for cost; Algolia for instant DX |
| Email | Resend + React Email | Latest | React components for emails, 99.9% deliverability |

### Data

| Concern | Technology | Version | Notes |
|---|---|---|---|
| Primary DB | PostgreSQL | 16.x | Aurora Serverless v2 in prod |
| ORM | Drizzle | 0.30+ | Schema-as-code, fastest JS ORM |
| Migrations | Drizzle Kit | Bundled | `drizzle-kit push` (dev), `migrate` (prod) |
| Cache | Redis (Upstash) | 7.x | TTL-based invalidation |
| Analytics | PostHog (self-hosted or cloud) | Latest | Event tracking, session replay, feature flags |
| Feature Flags | PostHog Flags | Built-in | Gradual rollouts, A/B tests |

### Infrastructure

| Concern | Technology | Notes |
|---|---|---|
| Hosting | AWS ECS Fargate | Auto-scaling, no EC2 ops |
| CDN | CloudFront + S3 | Assets, ISR caching |
| CI/CD | GitHub Actions + CodePipeline | OIDC, no static AWS keys |
| Secrets | AWS Secrets Manager + SSM | Rotation, audit trail |
| Observability | OpenTelemetry → Grafana + Tempo | Vendor-neutral traces |
| Error Tracking | Sentry | Source maps, session replay |
| Logging | Pino → AWS CloudWatch | Structured JSON logs |

### DX & Quality

| Concern | Technology | Notes |
|---|---|---|
| Monorepo | Turborepo | Task caching, affected-only builds |
| TypeScript | `tsc` strict mode | `"strict": true`, no `any` policy |
| Linting | Biome | Replaces ESLint + Prettier; 25× faster |
| Testing (unit) | Vitest + Testing Library | `coverage: 80%` threshold |
| Testing (E2E) | Playwright | Chrome + Firefox in CI |
| Docs | Storybook 8 | Component catalogue, a11y audit |
| Git strategy | Trunk-based + feature flags | No long-lived branches |

---

## 4. BEST PRACTICES CHECKLIST

### 4.1 Security

- **CSP headers**: Strict via `next.config.js` `headers()` — `default-src 'self'`, nonce-based `script-src`
- **XSS**: React escapes by default. Never `dangerouslySetInnerHTML` without DOMPurify sanitization
- **CSRF**: tRPC uses SameSite cookies + CSRF token header for state-mutating procedures
- **Dependency auditing**: `pnpm audit` in CI gate — fail build on high/critical CVEs. Renovate bot for automated PRs
- **OWASP Top 10**: SQL injection impossible via Drizzle parameterized queries. IDOR protected via row-level security in PostgreSQL. Rate limiting via Upstash Ratelimit on all auth endpoints (10 req/min)
- **Secrets**: Zero secrets in env vars in code. All rotated via AWS Secrets Manager. GitHub OIDC — no static IAM keys

### 4.2 Performance

| Metric | Target | Strategy |
|---|---|---|
| LCP | < 2.5s | RSC, image optimization via `next/image` |
| INP | < 200ms | Defer non-critical JS, `useTransition` for state updates |
| CLS | < 0.1 | Explicit image dimensions, skeleton loaders |
| TTFB | < 600ms | ISR at edge, CloudFront caching |
| Bundle | < 80KB JS (initial) | RSC, dynamic imports, `next/dynamic` |

- Code splitting: automatic per route in Next.js + manual `dynamic()` for heavy components (charts, editors)
- Image optimization: `next/image` with AVIF/WebP, CDN-served from S3
- Font optimization: `next/font` — zero layout shift, subsetting

### 4.3 Scalability

- **Stateless design**: All session state in Redis/DB — any container can handle any request
- **Horizontal scaling**: ECS Fargate target tracking policy — scale at 60% CPU or 1000 req/instance
- **DB connection pooling**: PgBouncer in transaction mode (max 20 connections per instance to Aurora)
- **Read replicas**: Aurora auto-promotes. Route analytics/reporting queries to replica via Drizzle connection config
- **Queue-based load leveling**: Heavy operations (PDF generation, email sends, data exports) to BullMQ — never block HTTP

### 4.4 Accessibility

- **WCAG 2.2 AA** compliance required — Radix UI primitives handle keyboard navigation, ARIA by default
- **Automated testing**: `axe-core` via `@axe-core/playwright` in CI — fail on any violation
- **Storybook a11y addon**: Visual review per component
- **Focus management**: `focus-trap-react` for modals, `@radix-ui/react-focus-scope` for dialogs
- **Color contrast**: All text meets 4.5:1 ratio; enforced via Storybook a11y + design tokens

### 4.5 Observability

- **Structured logging**: Pino with request ID, user ID, trace ID in every log line
- **Distributed tracing**: OpenTelemetry SDK → Grafana Tempo. Trace ID propagated via `traceparent` header through tRPC
- **Metrics**: Custom business metrics (signup rate, API error rate) via OpenTelemetry → Grafana
- **Alerting SLOs**:
  - API error rate > 1% over 5min → PagerDuty
  - P99 latency > 2s over 10min → Slack alert
  - DB connection pool saturation > 80% → immediate page

### 4.6 Maintainability

- **Coding standards**: Biome config committed to repo — no negotiation in PRs
- **PR template**: Required fields: what/why/how, testing steps, screenshot for UI PRs
- **Architecture fitness functions**: Automated checks in CI:
  - Import boundaries via `eslint-plugin-boundaries`
  - Bundle size regression via `bundlesize`
  - TypeScript coverage via `typescript-coverage-report`
- **Documentation**: ADRs in `/docs/decisions/` — one per significant decision, reviewed quarterly
- **Dependency policy**: Major version upgrades require RFC. Security patches within 48h

### 4.7 Cost

**Estimated monthly infra at 50k MAU:**

| Service | Cost |
|---|---|
| ECS Fargate (3 tasks × 0.5 vCPU / 1GB) | ~$45 |
| Aurora Serverless v2 (0.5–4 ACU) | ~$90 |
| CloudFront + S3 (1TB transfer) | ~$85 |
| ElastiCache (cache.t4g.small) | ~$25 |
| Upstash Redis (edge) | ~$10 |
| Sentry Team | $26 |
| Resend (50k emails) | $20 |
| **Total** | **~$300/month** |

At 500k MAU, projected $1,800–2,500/month. Cost alerts set at 120% of monthly budget via AWS Cost Anomaly Detection.

**Optimization levers**: Aurora Serverless scales to zero in staging; Fargate Spot for background workers (70% discount); CloudFront caching reduces Lambda invocations.

---

## 5. MIGRATION PATH

*Applicable if migrating from a legacy stack (e.g., PHP monolith, Create React App):*

### Phase 1 — Strangler Fig (Weeks 1–4)
- Deploy Next.js behind CloudFront alongside legacy app
- Route `/app/*` to new stack, `/*` to legacy via CloudFront behaviors
- Auth: implement Auth.js with SSO to legacy session store (shared Redis)
- Rollback: flip CloudFront behavior — zero downtime

### Phase 2 — Data Layer (Weeks 5–8)
- Stand up Aurora; dual-write pattern — new writes go to both DBs
- Validate data integrity with automated reconciliation scripts
- Cutover reads to Aurora per domain, not all at once
- Rollback checkpoint: revert read target, dual-write continues

### Phase 3 — Full Cutover (Weeks 9–12)
- All routes migrated. Legacy app in read-only mode 2 weeks
- DNS cutover with TTL reduced to 60s 48h prior
- Legacy app maintained for 30 days on minimal infra as cold standby

**Risk Register:**

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Session incompatibility | Medium | High | Shared Redis session bridge |
| Data divergence | Low | Critical | Automated reconciliation + integrity alerts |
| Performance regression | Medium | High | Load test at 2× peak before each phase cutover |
| Team knowledge gap | High | Medium | 2-day Next.js workshop before Phase 1 |

---

## 6. GOVERNANCE & EVOLUTION

### RFC / ADR Process

1. Engineer opens GitHub Discussion with RFC template
2. 5-day async review window — any engineer may block
3. Tech lead resolves disagreements. Approved → ADR committed to `/docs/decisions/`
4. ADR format: Status (Proposed/Accepted/Deprecated) · Context · Decision · Consequences

### Upgrade Cadence Policy

| Type | Timeline | Process |
|---|---|---|
| Security patches (critical CVE) | 48 hours | Emergency PR, skip RFC |
| Security patches (high CVE) | 1 week | Fast-track PR |
| Minor/patch upgrades | Weekly via Renovate | Auto-merge if CI passes |
| Major upgrades | Quarterly | RFC required, staging validation ≥2 weeks |

### Tech Radar

| Technology | Quadrant | Status |
|---|---|---|
| Next.js 15 | Frameworks | **Adopt** |
| React 19 | Languages & Frameworks | **Adopt** |
| Tailwind CSS 4 | Tools | **Adopt** |
| Drizzle ORM | Tools | **Adopt** |
| tRPC 11 | Frameworks | **Adopt** |
| Vitest | Tools | **Adopt** |
| Playwright | Tools | **Adopt** |
| pnpm + Turborepo | Tools | **Adopt** |
| Biome | Tools | **Adopt** |
| Bun (production) | Languages & Runtimes | **Trial** |
| TanStack Start | Frameworks | **Trial** |
| PostHog | Tools | **Trial** |
| Deno Deploy | Platforms | **Assess** |
| SvelteKit | Frameworks | **Assess** |
| Qwik / Solid | Frameworks | **Hold** |
| Webpack | Tools | **Hold** |

### 12-Month Stack Evolution Forecast

**Q2 2025** — Bun 2.0 expected with full Node.js NAPI compatibility → re-evaluate Bun for production API services

**Q3 2025** — React 19 ecosystem stabilization → migrate remaining `getServerSideProps` patterns to Server Actions

**Q4 2025** — Evaluate TanStack Start for new microservice frontends; Next.js remains primary

**Q1 2026** — TypeScript 7.0 (Go rewrite) — zero migration risk, API stable. Upgrade immediately for build speed gains

**Q2 2026** — Drizzle v1.0 stable release — review breaking changes, update migration playbook

---

## Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Browser\nNext.js 15 App Router\nReact 19 + Tailwind 4"]
        CDN["CloudFront CDN\nISR Cache + Static Assets"]
    end

    subgraph Edge["Edge Layer"]
        Middleware["Next.js Middleware\nAuth Guard · Rate Limit\nA/B Routing"]
    end

    subgraph App["Application Layer — ECS Fargate"]
        NextApp["Next.js Server\nRSC · API Routes · tRPC"]
        BullWorker["BullMQ Workers\nJobs · Emails · Exports"]
    end

    subgraph Data["Data Layer"]
        Aurora["Aurora PostgreSQL 16\nPrimary + Read Replica"]
        Redis["Redis (Upstash + ElastiCache)\nSessions · Cache · Queue"]
        S3["S3\nFile Storage"]
    end

    subgraph Observability["Observability"]
        OTel["OpenTelemetry Collector"]
        Grafana["Grafana Stack\nMetrics · Traces · Logs"]
        Sentry["Sentry\nErrors · Releases"]
    end

    Browser --> CDN
    CDN --> Middleware
    Middleware --> NextApp
    NextApp --> Aurora
    NextApp --> Redis
    NextApp --> S3
    NextApp --> BullWorker
    BullWorker --> Aurora
    BullWorker --> Redis
    NextApp --> OTel
    BullWorker --> OTel
    OTel --> Grafana
    NextApp --> Sentry
```

---

*This document is a living ADR. Review quarterly. Owner: Platform Engineering Lead.*