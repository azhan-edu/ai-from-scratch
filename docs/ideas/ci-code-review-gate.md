# Code Review Gate — Implementation Options

## The Core Problem with AI Review on Pre-commit

A Claude API call takes 3–15 seconds. On every commit that kills dev flow. Pre-commit must stay
under ~1 second or developers start using `--no-verify`. Three realistic placements exist:

---

## Option A — Pre-push hook (recommended for local)

Run the review on `git push` against the branch diff (`git diff main...HEAD`). Friction is
acceptable — you push less often than you commit.

**Implementation:** a shell script in `.husky/pre-push` that:
1. Gets the staged diff vs main
2. Calls Claude API (Haiku for speed, ~500ms)
3. Asks for a PASS/BLOCK verdict with reasons
4. Aborts the push on BLOCK

```bash
# .husky/pre-push
#!/bin/sh
DIFF=$(git diff main...HEAD -- '*.ts' '*.tsx')
if [ -z "$DIFF" ]; then exit 0; fi

RESULT=$(echo "$DIFF" | node scripts/ai-review.mjs)
echo "$RESULT"
echo "$RESULT" | grep -q "BLOCK" && exit 1 || exit 0
```

```js
// scripts/ai-review.mjs — reads diff from stdin, calls Claude API
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
const diff = await readStdin();
const msg = await client.messages.create({
  model: "claude-haiku-4-5-20251001", // fast + cheap for this use case
  max_tokens: 400,
  messages: [{ role: "user", content: REVIEW_PROMPT + diff }],
});
// parse and print verdict
```

**Pros:** local, immediate feedback, no GitHub setup needed
**Cons:** adds ~2–5s to every push, requires `ANTHROPIC_API_KEY` in the dev environment

---

## Option B — GitHub Actions PR gate (recommended for team)

A required status check that runs on every PR using the Claude API. Blocks merge until it passes.
The right place for AI review — sees the full PR context, not just a diff fragment.

```yaml
# .github/workflows/ai-review.yml
- name: AI code review
  run: node scripts/ai-review.mjs
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    DIFF: ${{ steps.diff.outputs.diff }}
```

Mark it as a **required status check** in GitHub branch protection rules — merge is blocked until
the AI review passes.

**Pros:** enforced for everyone, sees full PR diff + PR description, can post a GitHub comment
with findings
**Cons:** requires `ANTHROPIC_API_KEY` in GitHub Secrets, adds ~30s to PR pipeline

---

## Option C — CodeRabbit / external service (zero-config)

A GitHub App that auto-reviews every PR using Claude under the hood. Install it, it posts a
review comment, configure whether it blocks merge. Free tier available.

**Pros:** zero implementation work, good UI
**Cons:** third-party service, sends code to their servers, less control over prompt and model

---

## Recommended Setup for This Project

| Gate | Tool | When |
|------|------|------|
| Format + lint | biome (lint-staged) | pre-commit |
| Type check | tsc | pre-commit |
| Unit tests | vitest | pre-push |
| AI review | Claude API script | pre-push + PR gate |
| E2E | Playwright | PR only |

Do both Option A and Option B — the pre-push hook catches issues before they hit GitHub, the PR
gate enforces it for the whole team.
