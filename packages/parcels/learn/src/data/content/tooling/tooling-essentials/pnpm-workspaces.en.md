---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

You split one repo into a few packages to stop copying code around, and then the first annoying question hits: how do you run one install, target one package, and keep local dependencies honest without inventing shell scripts all weekend?

I've burned time on that exact setup. I'd start with [pnpm workspaces](https://pnpm.io/workspaces) every time unless the packages truly have nothing to share, because one lockfile and local package linking solve the pain earlier than people expect.

## The monorepo only helps if the workflow stays boring

Each workspace package still keeps its own `package.json`, but the root workspace gives pnpm one place to coordinate installs. That is the part I actually care about: you stop repeating dependency setup in every package, and you can work on local packages without publishing them first.

## Configuring pnpm-workspace.yaml

The root [pnpm-workspace.yaml](https://pnpm.io/pnpm-workspace_yaml) file decides which folders belong to the workspace. I prefer starting with the smallest glob that matches your package layout, then adding exclusions only when your repo shape really needs them.

```yaml
packages:
  - 'packages/*'
  - '!**/test/**'
```

That pattern is intentionally boring. It matches the common case where packages live one level down, and it avoids teaching a catch-all glob before you need one.

## The two commands you'll keep using

The [recursive CLI](https://pnpm.io/cli/recursive) and [filtering](https://pnpm.io/filtering) docs are the two pages I'd bookmark first, because most day-to-day workspace work is some combination of "run this everywhere" and "run this only here."

```bash
# Install all workspace dependencies
pnpm install

# Build all packages that expose a build script
pnpm -r run build

# Run a script in a specific package
pnpm --filter @my/package dev

# Add a dependency to a specific package
pnpm add -D typescript --filter @my/package

# Add a workspace package as a dependency
pnpm add @my/shared --filter @my/app --workspace

# Run lint in all packages that have a lint script
pnpm -r --parallel run lint
```

I lean on `--filter` constantly. Without it, a monorepo turns into a loud open office where every command interrupts every package.

## Internal packages without guesswork

This is where the [workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) earns its keep. If you want a dependency to resolve only from the local workspace, declare that intention instead of hoping a matching semver range does the right thing.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

pnpm can link local packages when versions match even without `workspace:`, but I'd still use the protocol for internal packages I mean to keep local. It removes the "did this come from the registry?" doubt, and pnpm rewrites those ranges to normal semver when you pack or publish.

## Versioning is a separate problem

Once several packages are published, installs stop being the hard part. Releases do. The [Changesets CLI](https://github.com/changesets/changesets/blob/main/packages/cli/README.md) is the path I'd pick with pnpm because pnpm itself does not try to solve workspace versioning for you.

```bash
# Add a changeset (interactive)
pnpm changeset

# Bump versions from pending changesets
pnpm changeset version

# Publish packages whose versions are ready to ship
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

The useful part is not the file format. It's that release intent is reviewed with the code instead of reconstructed from commit history at the worst possible moment.

If you have two or three packages and they ship together, a workspace usually pays for itself quickly. If you already need strict build orchestration, release trains, and dependency graphs across dozens of packages, treat plain workspaces as the starting point, not the whole monorepo strategy.
