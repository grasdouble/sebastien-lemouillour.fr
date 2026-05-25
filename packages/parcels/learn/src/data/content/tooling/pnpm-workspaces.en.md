## What is a monorepo?

A monorepo is a single git repository that contains multiple packages or applications. It facilitates code sharing, version consistency and unified CI/CD workflows. With pnpm workspaces, each package keeps its own `package.json` and can declare dependencies on other workspace packages.

## pnpm-workspace.yaml configuration

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Essential commands

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

## Internal packages (workspace protocol)

Reference workspace packages with the `workspace:*` protocol in `package.json`. pnpm resolves them locally during development and replaces them with real version numbers when publishing.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

## Changesets for version management

Changesets is a tool that manages versions and changelogs in a monorepo. Each PR adds a changeset file describing the impact (patch/minor/major) on the affected packages.

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
