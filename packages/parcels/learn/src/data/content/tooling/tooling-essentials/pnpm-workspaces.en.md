---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
---

You copy a validation utility from project A to project B because it's faster than setting up a shared package. Six months later, there's a bug in the validator. You fix it in A. You forget to fix it in B because you've forgotten it's there. A user in B finds the bug three weeks later.

I've lived this twice. The second time was embarrassing enough that I went and set up a monorepo properly.

## The monorepo isn't a trend

One git repository, multiple packages, shared tooling. With pnpm workspaces, each package keeps its own `package.json` and declares its own dependencies. They can reference each other without publishing to npm. TypeScript versions stay aligned. You run lint and tests from one place. It doesn't feel revolutionary until you remember what life was like before.

## pnpm-workspace.yaml configuration

One file at the root tells pnpm which directories contain workspace packages:

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

That exclusion pattern is easy to forget and it matters — without it, pnpm might try to process `node_modules` directories as packages, with predictably bad results.

## Essential commands

The workflow shift is real. Instead of `cd`-ing between repos and running installs everywhere, you drive everything from one root:

```bash
# Install all workspace dependencies
pnpm install

# Build all packages (recursive)
pnpm -r build

# Run a script in a specific package
pnpm --filter @my/package dev

# Add a dependency to a specific package
pnpm add -D typescript --filter @my/package

# Add a workspace package as a dependency
pnpm add @my/shared --filter @my/app --workspace

# Run a command in all packages that have a given script
pnpm -r --parallel run lint
```

I use `--filter` constantly. It's how you stay in the monorepo without losing focus on the package you're actually working on.

## Internal packages (workspace protocol)

This is the feature that makes shared code actually work. When package A depends on package B inside the same monorepo, you declare it like this:

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

During development, pnpm links B directly into A's `node_modules` — any change in B is immediately visible in A, no build step needed. When you publish, pnpm substitutes the real version number automatically. No `npm link`, no manual symlinks, no "wait, which version is this?" confusion.

## Changesets for version management

Once you have multiple published packages, "bump the version" stops being a one-liner. Which package changed? By how much? Changesets solves this by asking you to attach a small declaration to each significant change, then aggregating those declarations at release time.

```bash
# Add a changeset (interactive)
pnpm changeset

# Bump versions based on changesets
pnpm changeset version

# Publish changed packages to npm
pnpm changeset publish
```

A changeset file looks like this:

```md
---
'@my/ui': minor
'@my/app': patch
---

feat: add Button variant "ghost"
```

The file lives in the repo, gets reviewed in the PR, and merges with the feature. By the time you run `changeset version`, you already have a clear record of what changed and why.

One honest warning: circular dependencies, incremental builds that actually work, and coordinated deployments all get harder as the monorepo grows. pnpm workspaces get you most of the way there, but they're not a full answer to every monorepo scaling problem. Know what you're signing up for before you migrate six repos.
