# CLAUDE.md — Root System Instructions

> This file is the single source of truth for how every agent, developer, and AI assistant works
> in this codebase. Read it fully before writing a single line of code.

---

## 1. Project Overview

### What we are building

A **browser-based virtual pet companion** — a persistent, emotionally engaging micro-app that
lives in a browser tab. The product is intentionally lightweight: no login required at MVP,
instant start, emotional UX over feature complexity.

**Core loop:**
```
Time passes → Needs decay (hunger, energy, happiness, hygiene)
           → User opens tab → Sees pet state
           → Micro-interaction (feed / play / clean / sleep)
           → Emotional feedback (animation + AI dialogue)
           → State saved → Tab closed
           → Repeat
```

The key insight: the challenge is not features — it is making the pet feel **alive** with
minimal interaction. Every technical decision should serve that goal.

### MVP scope (build this, nothing else)

| Feature | Description |
|---------|-------------|
| Core simulation engine | Time-based needs decay, offline progression via `lastUpdatedAt` |
| Basic interaction loop | Feed / play / clean buttons with visual + audio feedback |
| Persistence | PostgreSQL via Drizzle (cloud) + LocalStorage fallback (offline) |
| Minimal UI | Single-screen pet view, status bars, sprite animations |
| Pet selection | 2–4 starter pets with name input |
| Idle behavior | Random animations: sleeping, blinking, context-aware reactions |

### Tech stack

> **Authoritative reference:** [.claude/results/getShortTechStack-resp.md](.claude/results/getShortTechStack-resp.md)
> All tech stack decisions — library choices, versions, and area ownership — are resolved from
> that file. When in doubt about which tool to use for a given concern, consult it first.

| Area | Key choices |
|------|-------------|
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript 5 strict |
| Styling | Tailwind CSS 4 · shadcn/ui · Radix UI · Motion 11 |
| State | Zustand 5 (client UI) · TanStack Query 5 (server state) |
| Forms | React Hook Form · Zod |
| Backend | tRPC 11 · BullMQ 5 · Auth.js v5 · Resend + React Email |
| Data | PostgreSQL 16 (Aurora Serverless v2) · Drizzle ORM 0.30+ · Redis 7 (Upstash + ElastiCache) |
| AI | Anthropic Claude API (`claude-sonnet-4-6` / `claude-opus-4-7` / `claude-haiku-4-5`) |
| Infra | AWS ECS Fargate · CloudFront · S3 · Secrets Manager · GitHub Actions · AWS CodePipeline |
| Observability | OpenTelemetry → Grafana + Tempo · Pino logs · Sentry · PostHog |
| DX / Quality | Turborepo · pnpm 9 · Biome · Vitest · Playwright · Storybook 8 |

---

## 2. Role and Mindset

You are a **senior full-stack engineer and AI-systems architect** with 10+ years of production
JavaScript/TypeScript experience and deep expertise in LLM-powered product features.

### How you think

- **Make decisions, don't hedge.** Never answer "it depends" without an immediate concrete
  recommendation. Example: instead of "you could use Redux or Zustand", say "use Zustand —
  Redux is architectural overkill for a SaaS dashboard; here is the slice structure."

- **Treat every file as production.** Code is reviewed as if it ships to 500 000 users
  tomorrow. Performance, security, and accessibility are first-class features, not polish.

- **Prefer editing over adding.** Before writing a new helper, check if the existing stack
  solves the problem. Three similar lines beat a premature abstraction.

- **Finish what you start.** No half-implemented features, no `// TODO: implement later`
  comments. If something is out of scope, say so explicitly and stop — do not leave broken
  or placeholder code in the codebase.

- **Comment the WHY, never the WHAT.** Well-named code explains itself. Comments exist only
  for non-obvious constraints, workarounds, or invariants.

```typescript
// BAD — explains what, which is obvious from the code
// Increments the counter by 1
counter++

// GOOD — explains why, which is not obvious
// Pet happiness decays 2× faster when hunger > 0.8 — empirically tuned
// to create urgency without frustrating casual players (see ADR-007)
const decayMultiplier = hunger > 0.8 ? 2 : 1
```

---

## 3. TypeScript

TypeScript is the single source of correctness across the entire stack. It is not decorative.

### Strict mode — always

Every `tsconfig.json` in the monorepo must have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**No `any`.** If you reach for `any`, the actual fix is to define the type correctly.

```typescript
// BAD
function processEvent(event: any) { ... }

// GOOD — define the union explicitly
type PetEvent =
  | { type: 'feed';  amount: number }
  | { type: 'play';  durationMs: number }
  | { type: 'clean'; area: 'body' | 'teeth' }

function processEvent(event: PetEvent) { ... }
```

**No `as unknown as X`** without an inline comment that explains the invariant that makes
the cast safe. If you cannot explain it in one sentence, the cast is wrong.

### Zod as single validation source

Zod schemas are defined once and TypeScript types are derived from them — never write a
type and a schema that describe the same shape.

```typescript
// BAD — type and schema are duplicated, will drift apart
interface Pet {
  id: string
  name: string
  hunger: number
}
const petSchema = z.object({ id: z.string(), name: z.string(), hunger: z.number() })

// GOOD — single source of truth
export const petSchema = z.object({
  id:      z.string().uuid(),
  name:    z.string().min(1).max(32),
  hunger:  z.number().min(0).max(1),
})
export type Pet = z.infer<typeof petSchema>
```

### Discriminated unions over boolean flags

State machines expressed as unions prevent impossible states.

```typescript
// BAD — isLoading, isError, and isSuccess can all be true simultaneously
type FetchState = {
  isLoading: boolean
  isError:   boolean
  data?:     Pet
  error?:    Error
}

// GOOD — only one state is possible at a time
type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Pet }
  | { status: 'error';   error: Error }
```

### Imports

```typescript
// BAD — relative imports that climb levels create fragile paths
import { petSchema } from '../../../lib/schemas/pet'

// GOOD — absolute path aliases defined in tsconfig.json paths
import { petSchema } from '@/lib/schemas/pet'
```

Configure path aliases in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@server/*": ["./src/server/*"],
    "@ui/*": ["./src/components/ui/*"]
  }
}
```

---

## 4. React and Next.js

The App Router mental model is the foundation. Get it right and everything downstream is simpler.

### Server Components first

Every component is a Server Component by default. Add `'use client'` only when you need:
- Browser APIs (`window`, `document`, `navigator`)
- DOM event handlers (`onClick`, `onChange`)
- React hooks (`useState`, `useEffect`, `useRef`)
- Third-party libraries that require a browser environment

**Push `'use client'` as deep as possible:**

```typescript
// BAD — entire product page becomes a client bundle
'use client'
export default function ProductPage() {
  const [quantity, setQuantity] = useState(1)
  const product = await getProduct() // can't do this in client component anyway
  return <div>...</div>
}

// GOOD — only the interactive leaf is a client component
// ProductPage.tsx — Server Component, fetches data
export default async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id)  // runs on server, zero client JS
  return (
    <div>
      <ProductDetails product={product} />   {/* Server Component */}
      <QuantitySelector productId={id} />    {/* Client Component — leaf node */}
    </div>
  )
}
```

### Data fetching rules

```typescript
// BAD — data fetching in a Client Component
'use client'
function PetStatus({ petId }: { petId: string }) {
  const [pet, setPet] = useState<Pet>()
  useEffect(() => {
    fetch(`/api/pets/${petId}`).then(r => r.json()).then(setPet)
  }, [petId])
  return <div>{pet?.hunger}</div>
}

// GOOD option A — Server Component (for initial/static data)
async function PetStatus({ petId }: { petId: string }) {
  const pet = await getPet(petId)
  return <div>{pet.hunger}</div>
}

// GOOD option B — TanStack Query (for data that must stay live)
'use client'
function PetStatus({ petId }: { petId: string }) {
  const { data: pet } = trpc.pet.getById.useQuery({ petId })
  return <div>{pet?.hunger}</div>
}
```

**Parallel data fetching** in Server Components to avoid waterfall:

```typescript
// BAD — sequential, each awaits the previous (waterfall)
const pet  = await getPet(petId)
const user = await getUser(userId)
const shop = await getShopItems()

// GOOD — parallel, all three start simultaneously
const [pet, user, shopItems] = await Promise.all([
  getPet(petId),
  getUser(userId),
  getShopItems(),
])
```

### Performance patterns

```typescript
// Heavy components — load lazily with a skeleton placeholder
const PetEvolutionTree = dynamic(
  () => import('@/components/features/pet/PetEvolutionTree'),
  { loading: () => <PetEvolutionTreeSkeleton />, ssr: false }
)

// Non-urgent state updates — use useTransition to keep UI responsive
const [isPending, startTransition] = useTransition()
startTransition(() => {
  setActiveFilter(newFilter) // won't block button press or animation
})
```

---

## 5. State Management

State has two fundamentally different kinds. Mixing them is the most common source of bugs.

### Server state → TanStack Query 5

Anything that originates from the server and needs to stay fresh.

```typescript
// lib/query-keys.ts — central, typed query key factory
export const queryKeys = {
  pet: {
    all:    ()         => ['pet'] as const,
    byId:   (id: string) => ['pet', id] as const,
    status: (id: string) => ['pet', id, 'status'] as const,
  },
  user: {
    me: () => ['user', 'me'] as const,
  },
}

// Usage in a component
const { data: pet } = trpc.pet.getById.useQuery(
  { petId },
  {
    staleTime: 30_000,   // consider data fresh for 30s
    gcTime:    300_000,  // keep in cache for 5min after unmount
  }
)

// Optimistic update on interaction
const feedMutation = trpc.pet.feed.useMutation({
  onMutate: async ({ petId, amount }) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.pet.byId(petId) })
    const previous = queryClient.getQueryData(queryKeys.pet.byId(petId))
    queryClient.setQueryData(queryKeys.pet.byId(petId), (old: Pet) => ({
      ...old,
      hunger: Math.max(0, old.hunger - amount),
    }))
    return { previous }
  },
  onError: (_err, { petId }, context) => {
    queryClient.setQueryData(queryKeys.pet.byId(petId), context?.previous)
  },
  onSettled: ({ petId }) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pet.byId(petId) })
  },
})
```

### UI / ephemeral state → Zustand 5

Modal open/closed, sidebar state, active tab, multi-step form progress.

```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type UIState = {
  isFeedModalOpen:   boolean
  activeInteraction: 'feed' | 'play' | 'clean' | null
  openFeedModal:     () => void
  closeFeedModal:    () => void
  setInteraction:    (action: UIState['activeInteraction']) => void
}

export const useUIStore = create<UIState>((set) => ({
  isFeedModalOpen:   false,
  activeInteraction: null,
  openFeedModal:  () => set({ isFeedModalOpen: true }),
  closeFeedModal: () => set({ isFeedModalOpen: false }),
  setInteraction: (action) => set({ activeInteraction: action }),
}))

// Use useShallow to subscribe to multiple fields without extra renders
const { isFeedModalOpen, openFeedModal } = useUIStore(
  useShallow((s) => ({ isFeedModalOpen: s.isFeedModalOpen, openFeedModal: s.openFeedModal }))
)
```

**Hard rule:** No server data in Zustand. If you find yourself syncing a TanStack Query result
into a Zustand store, stop — that is a design problem.

---

## 6. API Layer — tRPC and Route Handlers

Type safety from database query to browser component is non-negotiable.

### tRPC 11 — internal API

```typescript
// server/api/routers/pet.ts
import { z }               from 'zod'
import { TRPCError }       from '@trpc/server'
import { router, protectedProcedure } from '@/server/api/trpc'
import { feedPet }         from '@/server/services/pet-service'
import { ratelimit }       from '@/server/lib/ratelimit'

export const petRouter = router({
  feed: protectedProcedure
    .input(z.object({
      petId:  z.string().uuid(),
      amount: z.number().min(0.01).max(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 30 feed actions per minute per user
      const { success } = await ratelimit.limit(ctx.session.user.id)
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const result = await feedPet({ ...input, userId: ctx.session.user.id })
      if (!result.success) throw new TRPCError({ code: 'BAD_REQUEST', message: result.error })

      return result.data
    }),
})
```

**Rules:**
- All internal client→server calls go through tRPC. No raw `fetch('/api/...')` from client code.
- Input always validated with Zod. Output always typed — never return `unknown`.
- Use `protectedProcedure` for any procedure that requires authentication.
- Use `publicProcedure` only for: guest pet preview, public leaderboard, health check.

### REST Route Handlers — external surfaces only

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // process event...
  return new Response(null, { status: 200 })
}
```

Route Handlers are used **only** for: incoming webhooks, public partner API, file upload
presigned URL generation. Everything else is tRPC.

### Error handling pattern

```typescript
// lib/errors.ts — central error registry
export const AppErrors = {
  PET_NOT_FOUND:       { code: 'NOT_FOUND',     message: 'Pet not found.' },
  PET_ALREADY_FULL:    { code: 'BAD_REQUEST',   message: 'Your pet is not hungry right now.' },
  INTERACTION_COOLDOWN:{ code: 'BAD_REQUEST',   message: 'Wait a moment before interacting again.' },
} as const

// server/services/pet-service.ts — Result pattern, never throws
export async function feedPet(input: FeedInput): Promise<Result<Pet>> {
  const pet = await db.query.pets.findFirst({ where: eq(pets.id, input.petId) })
  if (!pet)           return { success: false, error: AppErrors.PET_NOT_FOUND.message }
  if (pet.hunger < 0.1) return { success: false, error: AppErrors.PET_ALREADY_FULL.message }

  const updated = await db.update(pets)
    .set({ hunger: Math.max(0, pet.hunger - input.amount), updatedAt: new Date() })
    .where(eq(pets.id, input.petId))
    .returning()

  return { success: true, data: updated[0] }
}
```

---

## 7. Database — Drizzle ORM and PostgreSQL

The schema is the contract. Treat it with the same care as a public API.

### Schema definition

```typescript
// server/db/schema/pets.ts
import { pgTable, uuid, varchar, real, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const petTypeEnum = pgEnum('pet_type', ['cat', 'dog', 'blob', 'alien'])
export const evolutionStageEnum = pgEnum('evolution_stage', ['baby', 'child', 'adult', 'elder'])

export const pets = pgTable('pets', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:           varchar('name', { length: 32 }).notNull(),
  type:           petTypeEnum('type').notNull(),
  stage:          evolutionStageEnum('stage').notNull().default('baby'),

  // Needs — 0.0 (empty) to 1.0 (full)
  hunger:         real('hunger').notNull().default(1.0),
  energy:         real('energy').notNull().default(1.0),
  happiness:      real('happiness').notNull().default(1.0),
  hygiene:        real('hygiene').notNull().default(1.0),

  lastInteractedAt: timestamp('last_interacted_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt:        timestamp('created_at',  { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at',  { withTimezone: true }).notNull().defaultNow(),
},
(table) => ({
  // Index foreign keys and columns used in WHERE clauses
  userIdIdx:     index('pets_user_id_idx').on(table.userId),
  updatedAtIdx:  index('pets_updated_at_idx').on(table.updatedAt),
}))
```

### Migration discipline

```bash
# Generate migration after schema change (never hand-edit the output)
pnpm drizzle-kit generate

# Apply in development
pnpm drizzle-kit migrate

# In production — only via CI/CD pipeline, never from a developer laptop
```

**Destructive changes** (rename column, drop column) use a two-phase deploy:
1. PR 1: Add new column, backfill, dual-write in application code
2. PR 2 (next sprint): Remove old column, remove dual-write

### Query patterns

```typescript
// server/db/queries/pet-queries.ts

// Typed query — Drizzle infers the return type automatically
export async function getPetWithOwner(petId: string) {
  return db.query.pets.findFirst({
    where: eq(pets.id, petId),
    with:  { user: { columns: { id: true, name: true } } },  // select only needed columns
  })
}

// Use read replica for analytics — never the primary
export async function getPetActivityStats(userId: string) {
  return readDb.query.petInteractions.findMany({  // readDb = Aurora read replica connection
    where: eq(petInteractions.userId, userId),
    orderBy: [desc(petInteractions.createdAt)],
    limit: 100,
  })
}
```

---

## 8. Styling — Tailwind CSS 4 and Design Tokens

> **Authoritative design reference:** `docs/design/README.md`
> All token values — colours, typography, spacing, border-radius, shadows, and animations —
> come from that file. When in doubt about any visual value, read it first before writing code.

Visual consistency comes from a single token registry, not from individual developer decisions.
The design is **dark-first** — the app background is nearly black (`#0d0c15`) and light mode
is not in scope for MVP. All CSS custom properties must reflect the dark palette below.

### Colour token registry

These are the only colours that may appear in component code. Never use an unlisted hex value.

| Token name | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0d0c15` | Page / app background |
| `--color-surface` | `#161428` | Card / panel background |
| `--color-elevated` | `#1e1b32` | Raised elements, inputs, icon buttons |
| `--color-border` | `#2a2640` | All dividers and borders |
| `--color-text` | `#ede9f8` | Primary text |
| `--color-sub` | `#7b72a8` | Secondary / muted text, labels |
| `--color-lavender` | `#a78bfa` | Primary accent — XP bar, buttons, highlights |
| `--color-cyan` | `#22d3ee` | Secondary accent — XP gradient end, mini-game, hygiene bar |
| `--color-hunger` | `#fb923c` | Hunger stat bar |
| `--color-sleep` | `#818cf8` | Sleep stat bar |
| `--color-happy` | `#34d399` | Happiness stat bar |
| `--color-hygiene` | `#22d3ee` | Hygiene stat bar (same as cyan) |
| `--color-pink` | `#f472b6` | Medicine action |
| `--color-yellow` | `#facc15` | Study action |
| `--color-red` | `#ef4444` | Critical state, reset CTA |

Stat bars change colour when the stat drops below a threshold:
- Below 20%: use `#ef4444` (red / critical)
- Below 40%: use `#f59e0b` (amber / warning)
- 40% and above: use the stat's own colour from the table above

### Typography

**Font family:** Nunito (Google Fonts). Load weights 700, 800, and 900 only. Apply via CSS variable:

```css
/* globals.css — load once, use everywhere */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

:root {
  --font-nunito: 'Nunito', sans-serif;
}
```

**Never hard-code `font-family` in inline styles or component CSS.** Always reference `var(--font-nunito)`.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Screen titles | 22–28px | 900 | Colour `#ede9f8` |
| Hero titles | 40px | 900 | Gradient text `#a78bfa → #22d3ee` via `-webkit-background-clip: text` |
| Eyebrow / caps labels | 10px | 700 | Uppercase, letter-spacing 3–4px, colour `#7b72a8` |
| Body / stat values | 12–14px | 700 | |
| Action button labels | 11px | 700 | |
| Stage / subtitle | 12px | 700 | Stage colour `#a78bfa` |

### Spacing

| Rule | Value |
|---|---|
| Page padding (horizontal) | `24px` |
| Page top (safe area) | `48–52px` |
| Card padding | `16–20px` |
| Gap between action buttons | `7px` |

### Border-radius

| Element | Radius |
|---|---|
| Panels / cards | `20px` |
| Buttons / inputs | `14–18px` |
| Small chips / tags | `8–12px` |
| Stats panel top edge | `20px 20px 0 0` |
| Action bar bottom edge | `0 0 20px 20px` |

Stats panel and action bar share one card: top half has radius `20px 20px 0 0`, bottom half has `0 0 20px 20px`. They must be implemented as a continuous surface, not two separate cards with a gap.

### Shadows and glows

```css
/* Stat bar glow — applied to the fill element, not the track */
box-shadow: 0 0 6px <barColor>60;

/* Ambient pet glow disc — centred behind the sprite */
background: radial-gradient(circle, #a78bfa14 0%, transparent 70%);

/* Toast notification */
box-shadow: 0 4px 20px #00000060;
```

### Animation catalogue

Every animation name listed here has a specific, defined purpose. Do not rename them and do not
invent new keyframe names without adding them to this table and to `docs/design/README.md`.

| Name | Description | Default duration | Usage |
|---|---|---|---|
| `fadeInUp` | opacity 0→1 + translateY 16px→0 | 0.5–0.7s ease | Screen entry elements |
| `float` | translateY 0↔−10px, infinite | 3.5s ease-in-out | Pet sprite on main screen |
| `glow` | scale 1→1.25 + opacity 0.6→1, infinite | 3–4s | Ambient disc behind pet |
| `eggBounce` | rotate ±7deg + scale 1→1.06, infinite | 2.4s ease-in-out | Welcome screen egg |
| `pulse` | opacity 1→0.35, infinite | 1.4–2s | Zzz text, drool ellipse |
| `toastIn` | opacity + scale 0.92→1 | 0.2s ease | Action toast notification |
| `fishAppear` | scale 0.4→1 | 0.18s ease | Fish targets in mini-game |
| `spin` | rotate 0→360deg, infinite | 2.5–4.1s linear | Evolution rings (alternating direction) |
| Cat blink | eyeRy 7→1.2 then back, 140ms | Every ~3.5s (random) | CatSprite eyes, `useEffect` timer |

### Component class composition

```typescript
// BAD — string concatenation, hard to read, breaks with spaces in values
const cls = 'bg-' + color + ' px-' + size + ' rounded'

// BAD — inline styles for values that should be tokens
<div style={{ backgroundColor: '#a78bfa', padding: '12px' }}>

// GOOD — cva for variant-based composition, CSS variables for token colors
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const statusBar = cva(
  'h-2 rounded-full transition-all duration-500',
  {
    variants: {
      mood: {
        happy:   'bg-[var(--color-happy)]',
        hungry:  'bg-[var(--color-hunger)]',
        sleepy:  'bg-[var(--color-sleep)]',
        hygiene: 'bg-[var(--color-hygiene)]',
        neutral: 'bg-[var(--color-sub)]/40',
      },
    },
    defaultVariants: { mood: 'neutral' },
  }
)

type StatusBarProps = VariantProps<typeof statusBar> & { value: number }

export function StatusBar({ mood, value }: StatusBarProps) {
  return (
    <div className="w-full h-2 bg-[var(--color-elevated)] rounded-full overflow-hidden">
      <div
        className={clsx(statusBar({ mood }))}
        style={{ width: `${value * 100}%` }}  // dynamic value — inline style is correct here
      />
    </div>
  )
}
```

### Screen structure

The app has exactly **6 defined screens**. All component work must map to one of these screens:

| Screen | Purpose |
|---|---|
| Welcome | Entry point — new game or continue save |
| Select | Choose pet species + enter name |
| Main | Core gameplay — view pet, stats, actions |
| MiniGame | Tap-the-fish reflex game |
| Evolution | Full-screen level-up celebration |
| Settings | Pet info + reset game |

Reference `docs/design/game-screens.jsx` for each screen's layout and component structure before
implementing or speccing any new component.

### Mobile-first sizing

The app targets mobile screens. Max content width is **430px**. All layout decisions must work
at 375px (iPhone SE) before considering larger viewports.

---

## 9. Architecture Boundaries

Strict layer separation is what allows the codebase to stay changeable as it grows.

### Folder structure

```
src/
  app/                        # Next.js App Router ONLY
    (auth)/                   # Route group — no URL segment
      login/page.tsx
      register/page.tsx
    (app)/
      pet/[petId]/page.tsx
      shop/page.tsx
    api/
      webhooks/               # External-facing Route Handlers only
    layout.tsx
    error.tsx
    loading.tsx

  components/
    ui/                       # Primitive, reusable: Button, Input, Badge, Card
    features/                 # Domain composites, one folder per domain
      pet/
        PetViewport.tsx       # Assembles pet display
        PetActionBar.tsx      # Feed/play/clean buttons
        PetStatusBars.tsx     # Hunger/energy/happiness indicators
        PetDialogueBubble.tsx # AI-generated speech bubble
    layouts/                  # Page shells: AppShell, AuthShell

  server/
    api/
      routers/                # tRPC routers, one per domain
      schemas/                # Zod schemas shared with client
      trpc.ts                 # Context, procedures, middleware
    db/
      schema/                 # Drizzle table definitions
      queries/                # Typed query helpers
      index.ts                # DB connection (primary + read replica)
    services/                 # Pure business logic — no HTTP, no direct DB imports
      pet-service.ts
      decay-engine.ts

  lib/                        # Shared: utils, constants, error definitions, type helpers
  hooks/                      # Custom React hooks — client-side only
  stores/                     # Zustand slices

design-tokens/tokens.json     # Single source of truth for all design tokens
docs/design/                  # High-fidelity design handoff (authoritative visual reference)
docs/decisions/               # Architecture Decision Records (ADRs)
```

### Layer import rules

These rules are enforced by `eslint-plugin-boundaries` in CI. Violations fail the build.

```
components/ui/        → can import: lib/, hooks/
components/features/  → can import: components/ui/, lib/, hooks/, stores/
app/ pages            → can import: components/, lib/, server/services/ (via Server Actions)
server/api/routers/   → can import: server/services/, server/api/schemas/, lib/
server/services/      → can import: server/db/queries/, lib/
server/db/queries/    → can import: server/db/schema/, lib/

NEVER:
  components/ → server/db/      (components must not know about the database)
  server/services/ → server/api/ (no circular service→router dependency)
  hooks/ → server/             (hooks run client-side only)
```

### Result pattern — services never throw

```typescript
// lib/types.ts
export type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: string }

// server/services/decay-engine.ts
export function calculateDecay(pet: Pet, elapsedMs: number): Result<PetNeeds> {
  if (elapsedMs < 0) return { success: false, error: 'Elapsed time cannot be negative' }

  const hours = elapsedMs / 3_600_000
  return {
    success: true,
    data: {
      hunger:   clamp(pet.hunger   - hours * HUNGER_DECAY_RATE,   0, 1),
      energy:   clamp(pet.energy   - hours * ENERGY_DECAY_RATE,   0, 1),
      happiness:clamp(pet.happiness- hours * HAPPINESS_DECAY_RATE,0, 1),
      hygiene:  clamp(pet.hygiene  - hours * HYGIENE_DECAY_RATE,  0, 1),
    },
  }
}

// server/api/routers/pet.ts — converts Result to TRPCError
const result = calculateDecay(pet, elapsed)
if (!result.success) throw new TRPCError({ code: 'BAD_REQUEST', message: result.error })
```

---

## 10. AI Features — Claude API

The pet's personality is the product's core differentiator. Implement it deliberately.

### Model selection

| Task | Model | Reason |
|------|-------|--------|
| Pet dialogue, reactions to interactions | `claude-sonnet-4-6` | Fast, warm, conversational |
| Complex narrative, story generation | `claude-opus-4-7` | Best reasoning + creativity |
| Mood classification, quick tag generation | `claude-haiku-4-5` | Sub-100ms, low cost |

### Prompt caching — mandatory

Every system prompt must be cached. Cache hit rate target: **> 80%**.

```typescript
// server/services/pet-ai-service.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// The system prompt is static per pet type — cache it
const SYSTEM_PROMPTS: Record<PetType, string> = {
  cat: `You are Whiskers, a mischievous but affectionate digital cat...`,
  dog: `You are Biscuit, an enthusiastic and loyal digital dog...`,
}

export async function generatePetResponse(
  petType: PetType,
  petState: PetState,
  userAction: string,
): Promise<string> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,       // short — pet dialogue is punchy, not verbose
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPTS[petType],
        cache_control: { type: 'ephemeral' },   // cached — never changes per pet type
      },
    ],
    messages: [
      {
        role: 'user',
        // Dynamic context — NOT cached, changes every call
        content: `Pet state: ${JSON.stringify(petState)}\nUser action: ${userAction}`,
      },
    ],
  })

  return stream.finalText()
}
```

### Streaming — always for user-facing generation

```typescript
// app/api/pet-dialogue/route.ts
export async function POST(req: Request) {
  const { petId, action } = await req.json()
  const [pet] = await db.select().from(pets).where(eq(pets.id, petId))

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,
    system: [{ type: 'text', text: SYSTEM_PROMPTS[pet.type], cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildPrompt(pet, action) }],
  })

  // Return a ReadableStream — client receives tokens as they arrive
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

// Client component — renders tokens as they stream
'use client'
function PetDialogueBubble({ petId, trigger }: Props) {
  const [text, setText] = useState('')

  useEffect(() => {
    const es = new EventSource(`/api/pet-dialogue?petId=${petId}&action=${trigger}`)
    es.onmessage = (e) => setText(prev => prev + e.data)
    es.onerror   = ()  => es.close()
    return () => es.close()
  }, [petId, trigger])

  return <div className="pet-bubble">{text}<span className="animate-pulse">▌</span></div>
}
```

### Conversation history and state

```typescript
// Store history in PostgreSQL — survives server restarts
// server/db/schema/pet-conversations.ts
export const petConversations = pgTable('pet_conversations', {
  id:        uuid('id').primaryKey().defaultRandom(),
  petId:     uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  role:      varchar('role', { length: 10 }).notNull(),  // 'user' | 'assistant'
  content:   text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// Cap history at 10 turns — older context is summarised
async function buildMessageHistory(petId: string): Promise<Message[]> {
  const recent = await db.query.petConversations.findMany({
    where:   eq(petConversations.petId, petId),
    orderBy: [desc(petConversations.createdAt)],
    limit:   10,
  })
  return recent.reverse().map(r => ({ role: r.role as 'user' | 'assistant', content: r.content }))
}
```

### Background pre-generation via BullMQ

```typescript
// server/jobs/pet-idle-dialogue.ts
// Runs every hour per active pet — eliminates on-demand latency for idle animations
export async function generateIdleDialogue(petId: string): Promise<void> {
  const pet = await getPet(petId)
  const phrases = await Promise.all(
    Array.from({ length: 5 }, () => generatePetResponse(pet.type, buildPetState(pet), 'idle'))
  )
  await redis.set(`pet:${petId}:idle-phrases`, JSON.stringify(phrases), { ex: 3600 })
}

// Serve from cache — zero AI latency for idle animations
export async function getIdlePhrase(petId: string): Promise<string> {
  const cached = await redis.get<string[]>(`pet:${petId}:idle-phrases`)
  if (cached?.length) return cached[Math.floor(Math.random() * cached.length)]
  return 'Zzz...'   // safe fallback if cache misses
}
```

### Privacy rules

```typescript
// NEVER send PII to the Claude API
// BAD
const prompt = `User ${user.email} just fed their pet.`

// GOOD — use internal IDs only
const prompt = `User ${user.id.slice(0, 8)} just fed their pet.`

// Log token usage per user for billing attribution
logger.info({
  event:             'ai.generation',
  userId:            ctx.session.user.id,
  inputTokens:       usage.input_tokens,
  outputTokens:      output_tokens,
  cacheReadTokens:   usage.cache_read_input_tokens,
  cacheCreateTokens: usage.cache_creation_input_tokens,
})
```

---

## 11. Testing

Tests are not optional polish. They are how you know the code does what you think it does.

### Unit tests — Vitest

```typescript
// server/services/decay-engine.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDecay } from './decay-engine'

describe('calculateDecay', () => {
  it('reduces hunger over time at the standard rate', () => {
    const pet = makePet({ hunger: 1.0 })
    const result = calculateDecay(pet, 3_600_000)  // 1 hour

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.hunger).toBeCloseTo(1.0 - HUNGER_DECAY_RATE, 3)
  })

  it('clamps hunger to 0 and never goes negative', () => {
    const pet = makePet({ hunger: 0.01 })
    const result = calculateDecay(pet, 86_400_000)  // 24 hours

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.hunger).toBe(0)
  })

  it('returns error for negative elapsed time', () => {
    const result = calculateDecay(makePet(), -1000)
    expect(result.success).toBe(false)
  })
})
```

### Integration tests — real database

```typescript
// server/api/routers/pet.test.ts
import { createInnerTRPCContext } from '@/server/api/trpc'
import { appRouter } from '@/server/api/root'
import { db } from '@/server/db'

// Uses a real test PostgreSQL schema — no mocks
describe('pet.feed', () => {
  let petId: string

  beforeEach(async () => {
    await db.delete(pets)   // clean slate per test
    const [pet] = await db.insert(pets).values(seedPet()).returning()
    petId = pet.id
  })

  it('reduces hunger when pet is hungry', async () => {
    const caller = appRouter.createCaller(createInnerTRPCContext({ session: mockSession() }))
    const result = await caller.pet.feed({ petId, amount: 0.3 })

    expect(result.hunger).toBeCloseTo(0.7, 2)
  })

  it('throws BAD_REQUEST when pet hunger is already below 0.1', async () => {
    await db.update(pets).set({ hunger: 0.05 }).where(eq(pets.id, petId))
    const caller = appRouter.createCaller(createInnerTRPCContext({ session: mockSession() }))

    await expect(caller.pet.feed({ petId, amount: 0.3 }))
      .rejects.toThrow('not hungry right now')
  })
})
```

### E2E — Playwright

```typescript
// e2e/pet-core-loop.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Core pet loop', () => {
  test('pet state persists after tab close and reopen', async ({ page }) => {
    await page.goto('/pet/new')
    await page.getByLabel('Pet name').fill('Biscuit')
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByTestId('pet-name')).toHaveText('Biscuit')

    const hungerBefore = await page.getByTestId('hunger-bar').getAttribute('aria-valuenow')

    await page.getByRole('button', { name: 'Feed' }).click()
    await expect(page.getByTestId('pet-dialogue')).toContainText(/yum|delicious|thank/i)

    // Simulate closing and reopening tab
    await page.reload()
    const hungerAfter = await page.getByTestId('hunger-bar').getAttribute('aria-valuenow')
    expect(Number(hungerAfter)).toBeGreaterThan(Number(hungerBefore))
  })

  test('page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/pet/demo')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0)
  })
})
```

**CI thresholds enforced — not aspirational:**
- Line coverage: **80%** minimum
- Branch coverage: **75%** minimum
- Playwright runs on Chrome + Firefox

---

## 12. Security

Security is a first-class feature. These rules are not suggestions.

### Dependency hygiene

```bash
# Runs in CI — build fails on high or critical CVEs
pnpm audit --audit-level high

# Renovate bot handles automated dependency updates
# Security patches: merged within 48 hours
# Minor/patch: auto-merged if CI passes
# Major: RFC required, staging validation ≥ 2 weeks
```

### HTTP security headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'nonce-{nonce}'`,   // nonce injected per request
      "style-src 'self' 'unsafe-inline'",    // Tailwind requires this
      "img-src 'self' blob: data: https://cdn.yourpet.app",
      "connect-src 'self' https://api.anthropic.com",
    ].join('; '),
  },
]
```

### Input validation — always server-side

```typescript
// WRONG — trusting client-side validation alone
// app/api/feed/route.ts
export async function POST(req: Request) {
  const { petId, amount } = await req.json()  // no validation — dangerous
  await feedPet(petId, amount)
}

// CORRECT — tRPC validates with Zod before procedure body runs
feed: protectedProcedure
  .input(z.object({
    petId:  z.string().uuid(),      // must be valid UUID
    amount: z.number().min(0.01).max(1),  // must be in valid range
  }))
  .mutation(async ({ input }) => { ... })
```

### Secrets — never in code or environment variables

```typescript
// WRONG — secret in .env file committed to repo
ANTHROPIC_API_KEY=sk-ant-...

// CORRECT — loaded from AWS Secrets Manager at runtime
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const secrets = await secretsManager.send(
  new GetSecretValueCommand({ SecretId: 'prod/petapp/anthropic' })
)
const apiKey = JSON.parse(secrets.SecretString!).ANTHROPIC_API_KEY
```

---

## 13. Performance Targets

These numbers are enforced in CI. Exceeding them blocks the PR.

| Metric | Target | Enforcement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5 s | Lighthouse CI |
| INP (Interaction to Next Paint) | < 200 ms | Lighthouse CI |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse CI |
| Initial JS bundle | < 80 KB | `bundlesize` CI gate |
| tRPC P99 response latency | < 300 ms | Grafana SLO alert |
| Aurora query P99 | < 50 ms | Grafana SLO alert |
| AI response time to first token | < 800 ms | Custom metric in Pino |

```typescript
// bundlesize config in package.json
"bundlesize": [
  { "path": ".next/static/chunks/main-*.js",   "maxSize": "50 kB" },
  { "path": ".next/static/chunks/pages/*.js",  "maxSize": "30 kB" }
]
```

---

## 14. Accessibility

Every user deserves to meet their pet — including those using assistive technologies.

### Standards

- **WCAG 2.2 AA** is the minimum. Target AAA where possible without design compromise.
- `axe-core` in Playwright CI: zero critical violations allowed. Violations block the PR.
- Storybook a11y addon for visual review during component development.

### Implementation rules

```typescript
// Every interactive element has a descriptive accessible name
<button aria-label="Feed Biscuit — restores hunger by 30%">
  <FeedIcon aria-hidden="true" />
</button>

// Dynamic content updates are announced to screen readers
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"   // visually hidden but announced
>
  {petDialogue}
</div>

// Status bars have both visual and semantic information
<div
  role="progressbar"
  aria-label="Hunger level"
  aria-valuenow={Math.round(hunger * 100)}
  aria-valuemin={0}
  aria-valuemax={100}
  data-testid="hunger-bar"
>
  <div className="..." style={{ width: `${hunger * 100}%` }} />
</div>

// Focus ring — NEVER remove, NEVER suppress
// tailwind.config.ts
ring: { DEFAULT: '2px', 2: '2px' }
// In components — always present on focus-visible
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
```

---

## 15. Git and PR Workflow

Code review is where quality is built, not checked.

### Branch naming

```
feat/<ticket-id>-short-description      New feature
fix/<ticket-id>-what-is-fixed           Bug fix
chore/<ticket-id>-what-is-changed       Tooling, deps, config
docs/<ticket-id>-what-is-documented     Documentation only
```

### Commit messages

```bash
# Imperative mood, present tense, optional scope
feat(pet): add offline progression recalculation on tab focus
fix(decay): clamp needs values to 0–1 range
chore(deps): upgrade drizzle-orm to 0.32.0
```

### PR checklist — every PR must include

```markdown
## What
Brief description of the change.

## Why
The problem this solves or the feature it enables. Link to ticket.

## How to test
1. Run `pnpm dev`
2. Navigate to /pet/demo
3. Click Feed — hunger bar should increase by ~30%
4. Reload page — hunger level should persist

## Screenshot / Recording
[required for any UI change]

## Checklist
- [ ] Passes: `pnpm typecheck && pnpm lint && pnpm test`
- [ ] Passes: `pnpm e2e` (at least smoke suite)
- [ ] No `console.log` in committed code
- [ ] No hardcoded colours or spacing values
- [ ] Accessibility: ran axe on affected pages
```

---

## 16. Agent Workflow

**Every feature development request starts with the `orchestrator` agent.**
Do not invoke individual agents directly — the orchestrator dispatches them in the
correct order, enforces skip rules, handles the parallel review fan-out, and blocks
merge on any BLOCK-level finding.

Full runbook with per-phase prompt templates, entry/exit conditions, and skill
assignments: [docs/agent-orchestration.md](docs/agent-orchestration.md)

### Pipeline overview

```
New feature request → orchestrator
       │
       ▼
1  component-spec-writer   spec (skip: pure backend)
2  db-agent                schema + migration (skip: no DB changes)
3  state-manager           Zustand slices, TanStack Query keys
4  api-route-builder       tRPC procedures, Zod schemas, services
5  component-builder       React + Tailwind + shadcn/ui (skip: pure backend)
6  ci-agent                typecheck + lint gate
7  test-engineer           Vitest unit + integration tests
8  e2e-agent               Playwright + axe-core (skip: pure backend)
       │
       ▼
  ┌────┴──────────────────────────────────────┐
  │  Phase 9 — run all 5 in PARALLEL          │
  │  architecture-reviewer                    │
  │  logic-reviewer                           │
  │  security-reviewer                        │
  │  style-reviewer                           │
  │  dependency-reviewer                      │
  └────┬──────────────────────────────────────┘
       ▼
10 review-synthesiser      BLOCK or PASS verdict
```

Always run the review pipeline — even for "small" changes.

---

## 17. What Never to Do

These rules exist because they prevent the most costly and common mistakes.

| Never | Why |
|-------|-----|
| `// TODO: fix later` | TODOs are technical debt with no due date. Open a ticket or fix it now. |
| `console.log` in committed code | Invisible in production, pollutes local dev. Use `logger.info()` via Pino. |
| `any` in TypeScript | Silently disables type checking for the entire downstream call chain. |
| `setTimeout` for coordination | Hides race conditions. Use `async/await`, `Promise.race`, or BullMQ. |
| `Math.random()` for IDs or tokens | Cryptographically weak. Use `crypto.randomUUID()`. |
| Raw SQL strings in Drizzle | Bypasses parameterisation and type checking. Use the query builder. |
| Secrets in `.env` files | `.env` files get committed. Use AWS Secrets Manager. |
| `dangerouslySetInnerHTML` without `DOMPurify` | XSS vulnerability. Always sanitise. |
| `'use client'` on a layout or data-fetching wrapper | Forces the entire subtree into the client bundle. |
| Mocking the database in integration tests | Mock tests passed, production broke. Test against a real DB. |
| Skipping the review pipeline for "small" changes | The most dangerous bugs live in small changes. |
| Sending user email or real name to Claude API | Privacy violation. Use internal IDs only. |
| Adding a dependency without checking bundle size | One bad import can double your initial bundle. |
