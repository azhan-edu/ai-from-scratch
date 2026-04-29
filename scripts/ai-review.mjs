#!/usr/bin/env node
/**
 * Claude-powered PR code reviewer.
 * Usage: node scripts/ai-review.mjs --diff <path> --out <path>
 *
 * Reads a git diff, sends it to Claude with project-specific context,
 * writes a markdown review to --out.
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const get = (flag) => {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : null
}

const diffPath = get('--diff')
const outPath  = get('--out')

if (!diffPath || !outPath) {
  console.error('Usage: node scripts/ai-review.mjs --diff <path> --out <path>')
  process.exit(1)
}

// ── Config ──────────────────────────────────────────────────────────────────
const PR_TITLE   = process.env.PR_TITLE   ?? '(no title)'
const PR_BODY    = process.env.PR_BODY    ?? '(no description)'
const BASE_REF   = process.env.BASE_BRANCH ?? 'main'
const HEAD_REF   = process.env.HEAD_BRANCH ?? 'unknown'

const MAX_DIFF_CHARS = 80_000   // ~20k tokens — stays well inside context window

// ── System prompt — cached (static per run) ─────────────────────────────────
const SYSTEM_PROMPT = `You are a senior full-stack engineer and AI-systems architect
reviewing a pull request for a browser-based virtual pet companion app.

Tech stack:
- Frontend: Next.js 15 App Router · React 19 · TypeScript 5 strict
- Styling: Tailwind CSS 4 · shadcn/ui · Radix UI · Motion 11
- State: Zustand 5 (UI) · TanStack Query 5 (server state)
- Backend: tRPC 11 · Drizzle ORM · PostgreSQL 16 · Redis
- AI: Anthropic Claude API (claude-sonnet-4-6 / claude-opus-4-7 / claude-haiku-4-5)
- Quality: Biome · Vitest · Playwright · Storybook 8

Core architecture rules to enforce:
1. TypeScript strict mode — no \`any\`, no unsafe casts without explanation
2. Zod schemas are the single source of truth — types derived via \`z.infer<>\`
3. Server Components first — \`'use client'\` only at leaf nodes
4. No raw fetch() from client — all calls go through tRPC
5. No server data in Zustand — TanStack Query owns server state
6. Services return Result<T> — they never throw
7. No database imports in components — only server/services layer
8. Prompt caching required on all Claude API calls
9. No PII sent to Claude API — internal IDs only
10. No \`console.log\` — use Pino logger
11. No hardcoded colours — use CSS custom properties from the design token registry
12. Accessibility: interactive elements need aria labels; status bars need role="progressbar"

Design token colours (only these may appear in component code):
--color-bg, --color-surface, --color-elevated, --color-border,
--color-text, --color-sub, --color-lavender, --color-cyan,
--color-hunger, --color-sleep, --color-happy, --color-hygiene,
--color-pink, --color-yellow, --color-red

Severity scale:
- BLOCKER: Security vulnerability, data loss risk, crashes production, type safety hole
- MAJOR: Bug, arch boundary violation, missing validation, perf regression
- MINOR: Code style, naming, small inefficiency, missing test coverage
- SUGGESTION: Non-blocking improvement, alternate approach worth considering

Review style:
- Be direct and specific — cite file and line number when possible
- Explain WHY something is a problem, not just WHAT
- Acknowledge good patterns you see — not everything needs a note
- If the diff is too large to review in full, say so and focus on highest-risk areas`

// ── Build user message (dynamic — not cached) ────────────────────────────────
function buildUserMessage(diff) {
  const truncated = diff.length > MAX_DIFF_CHARS
  const body = truncated
    ? diff.slice(0, MAX_DIFF_CHARS) + '\n\n[diff truncated — showing first 80k chars]'
    : diff

  return `PR: ${PR_TITLE}
Branch: ${HEAD_REF} → ${BASE_REF}

${PR_BODY ? `Description:\n${PR_BODY}\n\n` : ''}---
Git diff:
\`\`\`diff
${body}
\`\`\``
}

// ── Review format instructions ───────────────────────────────────────────────
const FORMAT_INSTRUCTIONS = `Structure your review using this exact format:

## 🤖 AI Code Review

### Summary
One paragraph: what this PR does, overall quality signal, any theme you noticed.

### Findings

For each finding use:
**[SEVERITY] filename:line-or-range — Short title**
Explanation of the problem and how to fix it.

Group findings by severity: BLOCKER → MAJOR → MINOR → SUGGESTION.
If there are no findings in a category, omit that category entirely.

### Positives
Brief bullet list of patterns done well (max 3 bullets, omit if nothing stands out).

### Verdict
One of: ✅ **PASS** · ⚠️ **PASS WITH NOTES** · 🚫 **BLOCK**
Follow with one sentence explaining the verdict.

---
*Reviewed by Claude ${new Date().toISOString().slice(0, 10)}*`

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const diff = readFileSync(diffPath, 'utf8').trim()
  if (!diff) {
    writeFileSync(outPath, '## 🤖 AI Code Review\n\nNo reviewable changes in this diff.')
    console.log('Empty diff — wrote placeholder.')
    return
  }

  const client = new Anthropic()

  console.log(`Sending ${diff.length} chars of diff to Claude...`)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },   // cached — same across all PRs
      },
      {
        type: 'text',
        text: FORMAT_INSTRUCTIONS,
        cache_control: { type: 'ephemeral' },   // cached — static formatting rules
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildUserMessage(diff),         // dynamic — not cached
      },
    ],
  })

  const review = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')

  // Log token usage for cost attribution
  const usage = response.usage
  console.log('Token usage:', {
    input:       usage.input_tokens,
    output:      usage.output_tokens,
    cacheRead:   usage.cache_read_input_tokens   ?? 0,
    cacheCreate: usage.cache_creation_input_tokens ?? 0,
  })

  writeFileSync(outPath, review)
  console.log(`Review written to ${outPath}`)

  // Exit 1 if BLOCKER found — makes the workflow step fail visibly
  if (review.includes('[BLOCKER]')) {
    console.error('BLOCKER-level finding detected.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Review failed:', err.message)
  process.exit(1)
})
