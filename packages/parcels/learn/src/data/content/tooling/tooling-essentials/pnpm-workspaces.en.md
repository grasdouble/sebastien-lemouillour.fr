---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
---

Imagine a team that is growing. At first there is only one React app, one codebase, one repo, and everyone works in the same place. It feels simple. Then the friction appears: a shared validation utility gets copied into two projects, TypeScript versions start diverging, and a bug fixed in one repo quietly survives in the other.

That is the moment when the monorepo stops sounding theoretical and starts looking like the practical answer. Instead of scattering related packages across many repositories, you bring them together in one place and let the tooling manage the boundaries.

## What is a monorepo?

A monorepo is a single git repository that contains multiple packages or applications. With pnpm workspaces, each package keeps its own `package.json` and can still depend on other packages in the same repository. You get code sharing, version consistency, and a single place to run your workflows without giving up package-level ownership.

## pnpm-workspace.yaml configuration

Everything starts with one file at the root. It tells pnpm which folders should be treated as workspace packages:

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Essential commands

Once the workspace is configured, pnpm exposes commands that operate on the whole monorepo — or on one specific package. This is where the workflow changes radically compared to several separate repositories:

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

Instead of jumping between repos, reinstalling dependencies everywhere, and coordinating changes manually, you can operate from one root while still targeting the exact package you need.

## Internal packages (workspace protocol)

The real power of the monorepo appears when one package consumes another package from the same repo. With the `workspace:*` protocol, pnpm links the dependency locally during development and replaces it with the real published version during release. No `npm link`, no brittle relative paths, no duplicated packages pretending to be shared:

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

## Changesets for version management

In a monorepo with multiple published packages, versioning quickly becomes a problem. Who changed what? Which package deserves a patch, and which one needs a minor release? Changesets answers that by attaching a small version note to each PR, then aggregating those notes when it is time to release.

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

A monorepo does not solve everything. Circular dependencies, incremental builds, and partial deployments can still become complex as the system grows. But as a starting point, pnpm workspaces remove most of the day-to-day friction that comes with splitting related work across multiple repositories.
