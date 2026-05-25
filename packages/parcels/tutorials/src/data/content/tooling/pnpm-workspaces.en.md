## What is a monorepo?

A monorepo is a single git repository that contains multiple packages or applications. It facilitates code sharing, version consistency and unified CI/CD workflows.

## pnpm-workspace.yaml configuration

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Essential commands

- `pnpm install` — installs all workspace dependencies
- `pnpm -r build` — builds all packages
- `pnpm --filter @my/package dev` — starts a specific package
- `pnpm add -D typescript --filter @my/package` — adds a dependency to a package

## Changesets for version management

Changesets is a tool that manages versions and changelogs in a monorepo. Each PR adds a changeset file describing the impact (patch/minor/major) on the affected packages.

```bash
# Add a changeset
pnpm changeset

# Bump versions
pnpm changeset version

# Publish
pnpm changeset publish
```
