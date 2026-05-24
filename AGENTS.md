# ⚠️ Agent — Read this entire file before acting

These rules apply to every session, including after a compact or checkpoint. Before making any change, verify you have internalized all sections below. Never add a rule without first checking it doesn't already exist.

## Self-improvement — Update this file when a mistake is identified

When the user points out a mistake or a recurring problem, **always update this file** to prevent it from happening again — in the same response, before moving on.

- Identify the root cause, not just the symptom
- Write a rule specific enough to prevent the exact mistake
- Do not add vague rules ("be careful with X") — write actionable rules with ✅/❌ examples
- Check that a similar rule doesn't already exist before adding

This applies to any type of mistake: tooling, workflow, code quality, file management, etc.

---

## Critical thinking — Always challenge requests

Before implementing anything, evaluate the request critically:

- If the approach has flaws, better alternatives, or architectural concerns, **say so first** before executing
- Don't just implement what is asked — ask yourself if it's the right solution
- If you disagree, explain why clearly and propose an alternative
- Only proceed once the approach is validated (either confirmed by the user or after proposing a better option)

This applies to: architecture decisions, API design, naming, technology choices, and any non-trivial implementation.

---

# RTK — Token-Optimized CLI

**rtk** is a CLI proxy that filters and compresses command outputs, saving 60-90% tokens.

## Rule

Always prefix shell commands with `rtk`:

```bash
# Instead of:              Use:
git status                 rtk git status
git log -10                rtk git log -10
cargo test                 rtk cargo test
docker ps                  rtk docker ps
kubectl get pods           rtk kubectl pods
```

## Meta commands (use directly)

```bash
rtk gain              # Token savings dashboard
rtk gain --history    # Per-command savings history
rtk discover          # Find missed rtk opportunities
rtk proxy <cmd>       # Run raw (no filtering) but track usage
```

## Design System — Prefer components over custom CSS

Always use Lufa Design System components before writing custom CSS. Use the `lufa-design-system` skill to discover the current list of available components and their props.

Only write custom CSS for things the DS genuinely cannot do:

- `min-height`, `aspect-ratio`, or other structural constraints
- Responsive `auto-fit` / `auto-fill` grid layouts
- Element-level styles (e.g. `img` sizing)
- Design token values not exposed via component props (e.g. `border-top` with a token)

## TypeScript — Never call `tsc` directly

The `tsconfig` files in this repo have `declaration: true` and `sourceMap: true`. **Any direct invocation of the `tsc` binary can emit `.js`, `.d.ts`, and `.map` files into `src/`, even with `--noEmit`.**

### Allowed — type checking

- ✅ `ide-get_diagnostics` tool — preferred, zero risk of file emission
- ✅ `pnpm typecheck` from a specific package folder (e.g. `packages/parcels/landing-page`)
- ✅ `pnpm all:typecheck` from the root (runs all packages)

### Forbidden — always

- ❌ `tsc` — direct binary call
- ❌ `pnpm tsc` — still calls the binary directly, bypass the script
- ❌ `tsc -p tsconfig.json` with any flags, including `--noEmit` or `--listEmittedFiles`

## Git — No commits

Never create git commits. Stage changes and present them for the user to review and commit manually.

- ✅ `git add <files>`
- ❌ `git commit` — never, even when asked to "save" or "apply" changes

## Accessibility — Non-negotiable

Every UI change must consider accessibility. This is not optional and must never be skipped during review or implementation.

Checklist to apply systematically:

- **Decorative elements** (canvas, svg, images without meaning) → `aria-hidden="true"`
- **Interactive elements** → keyboard accessible, `role` and `aria-*` attributes correct
- **Images** → `alt` attribute always present (empty string `""` if decorative)
- **Form fields** → associated `<label>` or `aria-label`
- **Color** → never the only means of conveying information
- **Focus** → visible focus indicator, logical tab order
- **Animations** → always respect `prefers-reduced-motion: reduce` — pause or skip any motion when active
- **Contrast** → WCAG AA minimum: 4.5:1 for text, 3:1 for large text and UI components
- **Semantic HTML** → use the right element first (`<button>`, `<nav>`, `<main>`…) before reaching for ARIA roles
- **Heading hierarchy** → logical `h1 → h2 → h3` structure, never skip levels
- **Live regions** → use `aria-live` for content that updates dynamically without a page reload

When writing or reviewing code, if an accessibility issue is found, fix it in the same PR — never defer it.

## i18n — Trans component and namespace

When a translation string contains inline JSX (links, `<strong>`, etc.), always use `<Trans>` instead of splitting into multiple keys.

- ✅ One key with `<Trans t={t} i18nKey="..." components={{...}} />` — translators see the full sentence
- ❌ `p3_prefix` / `p3_middle` / `p3_suffix` — fragments that break translation context

Always pass `t={t}` (from `useTranslation`) to `<Trans>` so it inherits the namespace automatically — **never hardcode `ns="..."`** on `<Trans>`.

- ✅ `<Trans i18nKey="about.p3" t={t} components={{...}} />`
- ❌ `<Trans i18nKey="about.p3" ns="landing-page" components={{...}} />`

> Rationale: in production, i18next is a shared singleton initialized by the container. Setting `defaultNS` in the parcel's local config has no effect in production. Passing `t` is the only reliable way to propagate the namespace.

## Changesets — Naming and content

When creating a changeset file manually in `.changeset/`, always use a **descriptive kebab-case name** — never a random hex ID.

- ✅ `.changeset/add-hero-animation.md`
- ✅ `.changeset/happy-lions-sing.md` (auto-generated by the CLI — acceptable)
- ❌ `.changeset/6197e9-63944d-6768e0.md`

**Content rules:**

- Always check `git diff main --name-only` first to identify **all** changed packages before writing the changeset
- Include **every changed package** as a separate entry (one line per package with its bump type)
- The description must cover **all changes** in the branch — be synthetic, one short sentence per distinct change if needed
- Use `patch` for fixes/refactors, `minor` for new user-visible features, `major` for breaking changes

```md
---
'@grasdouble/pkg-a': minor
'@grasdouble/pkg-b': patch
---

Short synthetic description covering all changes in the branch.
```
