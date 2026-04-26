<!-- 
suggest list of skills and MCPs that could be useful for the Claude custom agents in folder
Agents/reviewers 
-->

# Tools, Skills & MCPs — Reviewer Agents Reference

## General list by category

### Tools (Claude built-in)

| Tool | What it does |
|---|---|
| `Read` | Read any file — already used by most agents |
| `Grep` | Pattern search across files — already used |
| `Glob` | Find files by pattern — already used |
| `Bash` | Run shell commands (linters, scanners, test runners) — already used |
| `Write` | Write reports/output files to disk |
| `WebFetch` | Fetch a specific URL (OSV API, Bundlephobia, package READMEs) |
| `WebSearch` | Search the web (CVE lookups, Next.js changelog, OWASP updates) |
| `Agent` | Spawn sub-agents — needed by `review-synthesiser` to launch the panel in parallel |
| `TodoWrite` | Track in-flight findings during multi-file review passes |

---

### Skills (available in this project)

| Skill | What it provides |
|---|---|
| `security-review` | Structured OWASP checklist, severity taxonomy, pre-built threat model prompts |
| `typescript-code-review` | TS type safety anti-patterns, React 19 hooks rules, strict-mode checks |
| `code-review-excellence` | React 19 / Vue 3 / Rust / Java / Python patterns, architectural smell checklist |
| `simplify` | Detects over-engineering, premature abstraction, and redundant code |

---

### MCPs

| MCP | What it provides |
|---|---|
| **GitHub MCP** | `get_pull_request_diff`, `get_pull_request_files`, `create_pull_request_review`, inline PR comments per file+line |
| **Semgrep MCP** | SAST scan via Semgrep rules (or `semgrep --json` via Bash if binary installed) |
| **Snyk MCP** | Real-time CVE data, licence compatibility checks, fix advice per package |
| **OSV API** (via `WebFetch`) | Lightweight CVE lookups at `api.osv.dev` — no MCP required, `WebFetch` suffices |
| **Bundlephobia API** (via `WebFetch`) | Package install/bundle size — `bundlephobia.com/api/size?package=X` |
| **Playwright MCP** | Headless browser — render the running app and inspect actual DOM strings |
| **Sentry MCP** | Query error rates and perf traces to validate whether a flagged pattern is already causing prod issues |
| **Slack MCP** | Post synthesiser verdict to `#code-review` channel on blocker |
| **Linear MCP** | Link architecture findings to ADR tickets; create issues for blockers automatically |

---

## Per-agent breakdown

### `architecture-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Glob`, `Grep` ✓ already · add **`WebSearch`** (look up App Router RFC, Next.js changelog for convention changes) |
| Skills | **`code-review-excellence`** (React 19 / App Router patterns) · **`typescript-code-review`** (module boundary rules) |
| MCPs | **GitHub MCP** — `get_pull_request_files` to filter review to changed files only · **Linear MCP** — link violations to ADR tickets |

---

### `dependency-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Bash` ✓ already · add **`WebFetch`** (hit OSV API per package) · add **`WebSearch`** (check package reputation, download trends) |
| Skills | None directly applicable |
| MCPs | **GitHub MCP** — `get_pull_request_files` to scope to `package.json` / lockfile changes only · **Snyk MCP** — richer CVE + fix advice than raw OSV · **OSV API via WebFetch** — free fallback if no Snyk |

---

### `logic-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Grep`, `Glob` ✓ already · add **`WebSearch`** (known race condition patterns, JS async gotchas) |
| Skills | **`typescript-code-review`** (async/await pitfalls, TS narrowing edge cases) · **`code-review-excellence`** (algorithmic correctness patterns) |
| MCPs | **GitHub MCP** — `get_pull_request_diff` to receive the exact diff rather than needing the full file read |

---

### `performance-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Grep`, `Bash` ✓ already · add **`WebFetch`** (Bundlephobia API to get actual bundle sizes for flagged imports) |
| Skills | **`typescript-code-review`** (memoisation, hook dependency arrays) · **`code-review-excellence`** (React 19 perf patterns) |
| MCPs | **GitHub MCP** — `get_pull_request_diff` · **Bundlephobia via WebFetch** — confirm whether a new import is actually heavy before filing a finding · **Sentry MCP** — correlate findings with live perf data to prioritise by actual prod impact · **Playwright MCP** — run Lighthouse on the route touched by the diff |

---

### `review-synthesiser`
| Category | Items |
|---|---|
| Tools | `Read`, `Write`, `Bash` ✓ already · add **`Agent`** — must spawn the 8 reviewer agents in parallel (its core responsibility) |
| Skills | None — it aggregates, not reviews |
| MCPs | **GitHub MCP** — `create_pull_request_review` with inline comments per finding · **Slack MCP** — post BLOCK verdict to `#code-review` · **Linear MCP** — auto-create issues for blocker findings |

> `Agent` tool is the most critical gap here — without it the synthesiser cannot actually orchestrate the parallel panel.

---

### `security-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Grep`, `Glob`, `Bash` ✓ already · add **`WebSearch`** (check NVD/OWASP for new vuln patterns) |
| Skills | **`security-review`** — directly maps to this agent's OWASP checklist |
| MCPs | **GitHub MCP** — `get_pull_request_diff` · **Semgrep MCP** (or `semgrep --json` via existing `Bash`) · **Snyk MCP** — dependency CVEs surfaced during code-level review |

---

### `style-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Grep`, `Bash` ✓ already · add **`Glob`** (find all files matching a naming pattern for consistency checks) |
| Skills | **`typescript-code-review`** (naming conventions, import structure) · **`simplify`** (flag dead code, over-abstraction) |
| MCPs | **GitHub MCP** — `get_pull_request_files` to scope to changed files only |

---

### `test-coverage-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Glob`, `Bash` ✓ already · add **`Grep`** (find test files co-located with changed source) |
| Skills | **`code-review-excellence`** — test quality patterns (arrange/act/assert, over-mocking, test isolation) |
| MCPs | **GitHub MCP** — `get_pull_request_files` to identify which source files changed and check for corresponding test files |

---

### `ux-copy-reviewer`
| Category | Items |
|---|---|
| Tools | `Read`, `Grep` ✓ already · add **`Glob`** (find all `.tsx` files for consistency sweeps) · add **`WebSearch`** (check i18n library plural syntax, plain language guidelines) |
| Skills | None directly — bake a tone-of-voice checklist into the system prompt using the project style guide |
| MCPs | **GitHub MCP** — `get_pull_request_diff` to scope to changed strings only · **Playwright MCP** — render affected component in a real browser to verify strings appear as expected |

---

## Priority order for implementation

1. **GitHub MCP** — unblocks the entire pipeline; `review-synthesiser` explicitly requires it
2. **`Agent` tool on `review-synthesiser`** — without it the parallel panel cannot be launched
3. **`WebFetch` on `dependency-reviewer`** — free CVE lookups via OSV with no extra infrastructure
4. **`security-review` skill** — bake the checklist into `security-reviewer` system prompt during authoring
5. **Semgrep via `Bash`** — `security-reviewer` already has `Bash`; just needs the binary in CI
6. **Snyk MCP** — richer than OSV; worth adding once GitHub MCP is stable
7. **Playwright MCP** — only needed if `ux-copy-reviewer` must validate rendered output, not just source
