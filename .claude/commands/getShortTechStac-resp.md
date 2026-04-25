## Tech Stack — Short List by Area

### Frontend
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui + Radix UI
- **State:** Zustand 5 (client) + TanStack Query 5 (server)
- **Forms:** React Hook Form + Zod
- **Animation:** Motion (Framer Motion) 11
- **i18n:** next-intl 3

### Backend
- **Runtime:** Node.js 22 LTS
- **API:** tRPC 11 (internal) + REST (public/webhooks)
- **Auth:** Auth.js v5 (NextAuth, self-hosted)
- **Jobs:** BullMQ 5
- **Email:** Resend + React Email
- **File uploads:** AWS S3 + presigned URLs

### Data
- **Database:** PostgreSQL 16 (Aurora Serverless v2)
- **ORM:** Drizzle ORM 0.30+
- **Cache:** Redis 7 (Upstash edge + ElastiCache)
- **Analytics + Flags:** PostHog

### Infrastructure
- **Hosting:** AWS ECS Fargate
- **CDN:** CloudFront + S3
- **CI/CD:** GitHub Actions + AWS CodePipeline
- **Secrets:** AWS Secrets Manager
- **Errors:** Sentry
- **Observability:** OpenTelemetry → Grafana + Tempo + Pino logs

### DX & Quality
- **Monorepo:** Turborepo + pnpm 9
- **Language:** TypeScript strict mode
- **Lint/Format:** Biome (replaces ESLint + Prettier)
- **Unit tests:** Vitest + Testing Library
- **E2E tests:** Playwright
- **Docs:** Storybook 8