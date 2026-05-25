# ⚠️ Agent — Read this entire file before acting

These rules apply to every session, including after a compact or checkpoint. Before making any change, verify you have internalized all sections below. Never add a rule without first checking it doesn't already exist.

---

## ⚠️ FIRST — Read the shared Grasdouble rules

Before doing anything else, read and apply the shared cross-repo rules:

```bash
cat ./node_modules/@grasdouble/lufa_config_agents/AGENTS.shared.md
```

If the file doesn't exist, run `pnpm install` first. The shared rules cover: Self-improvement, Critical thinking, Git, Package Manager (pnpm/npx), RTK CLI, TypeScript, No planning files, Accessibility, and Changesets.

---

## Build & Validation

Run these commands to validate your changes before presenting them to the user. **Always prefix commands with `rtk`** (e.g. `rtk pnpm all:lint`).

| Scope                      | Command              | From           |
| -------------------------- | -------------------- | -------------- |
| All packages — lint        | `pnpm all:lint`      | root           |
| All packages — build       | `pnpm all:build`     | root           |
| All packages — typecheck   | `pnpm all:typecheck` | root           |
| Single package — lint      | `pnpm lint`          | package folder |
| Single package — build     | `pnpm build`         | package folder |
| Single package — typecheck | `pnpm typecheck`     | package folder |

**Which scope to use:**

- Changed only one package → run package-level commands first (faster)
- Changed shared code (DS tokens, container, config) → run root-level commands
- Unsure → run root-level to be safe

**On failure:** Stop. Fix the error. Re-run the failing command. Do not stage with `git add` or report to the user until the relevant commands pass. Never edit generated files (`dist/`, `node_modules/`, `.pnpm-store/`, `*.map`, `*.d.ts` in build output) to work around a failure.

> The repo is a monorepo. Explore `packages/` to discover available packages — never assume their paths.

---

## Design System — Prefer components over custom CSS

Always use Lufa Design System components before writing custom CSS. Use the `lufa-design-system` skill to discover the current list of available components and their props.

Only write custom CSS for things the DS genuinely cannot do:

- `min-height`, `aspect-ratio`, or other structural constraints
- Responsive `auto-fit` / `auto-fill` grid layouts
- Element-level styles (e.g. `img` sizing)
- Design token values not exposed via component props (e.g. `border-top` with a token)

---

## i18n — Trans component and namespace

When a translation string contains inline JSX (links, `<strong>`, etc.), always use `<Trans>` instead of splitting into multiple keys.

- ✅ One key with `<Trans t={t} i18nKey="..." components={{...}} />` — translators see the full sentence
- ❌ `key_prefix` / `key_middle` / `key_suffix` — fragments that break translation context

Always pass `t={t}` (from `useTranslation`) to `<Trans>` so it inherits the namespace automatically — **never hardcode `ns="..."`** on `<Trans>`.

- ✅ `<Trans i18nKey="section.myKey" t={t} components={{...}} />`
- ❌ `<Trans i18nKey="section.myKey" ns="landing-page" components={{...}} />`

> Rationale: in production, i18next is a shared singleton initialized by the container. Setting `defaultNS` in the parcel's local config has no effect in production. Passing `t` is the only reliable way to propagate the namespace.

---

## Changesets — Repo-specific examples

> The naming convention, content rules, and prefix guide are in the shared rules. The following examples are specific to this repo's package names.

One changeset per package — with examples:

```md
# .changeset/add-hero-image.md ← only touches landing-page

---

'@grasdouble/slm_parcel_landing-page': minor

---

feat: replace hero logo with diorama image.
```

```md
# .changeset/update-shared-component.md ← atomic change spanning two parcels

---

'@grasdouble/slm_parcel_header-bar': minor
'@grasdouble/slm_parcel_landing-page': patch

---

feat: add new shared component and consume it in landing-page.
```

- ❌ One file for a refactor that touches N packages independently — create N files instead
