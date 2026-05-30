---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

You split a repo into packages to stop copy-pasting code, then your first week disappears into three boring chores: install everything once, run one script in one package, and make sure internal deps do not quietly come from the registry.

I've lost enough time to that setup that I have a bias now: start with pnpm workspaces unless the packages truly never meet. The win is not "monorepo architecture". The win is getting back to one lockfile and one install flow before the repo turns noisy.

## Keep the workspace shape small on purpose

The root [pnpm-workspace.yaml](https://pnpm.io/pnpm-workspace_yaml) file is where pnpm decides which folders belong to the workspace. I start with the narrowest glob that matches the layout, because broad patterns feel clever right until they pull in folders you never meant to treat as packages.

Before the first config block, this is the shape I'd pick for a plain `packages/*` layout:

```yaml
packages:
  - 'packages/*'
  - '!**/test/**'
```

That example stays boring on purpose. It teaches the common case first, and the pnpm docs also note that the root package is still included even when you customize the `packages` globs.

## One install, then one target

Inside a workspace, [pnpm install](https://pnpm.io/cli/install) installs dependencies in all projects by default. After that, most day-to-day work is either "run this everywhere" or "run this here", so I keep [recursive commands](https://pnpm.io/cli/recursive) and [filtering](https://pnpm.io/filtering) in muscle memory.

Before you copy commands into your shell, I'd make one tweak that saves surprise: use `--if-present` when you do not control every package script.

```bash
# Install dependencies for every workspace project
pnpm install

# Build packages that actually expose a build script
pnpm -r --if-present run build

# Run one script in one package
pnpm --filter @my/package run dev

# Add a dev dependency to one package
pnpm --filter @my/package add -D typescript

# Add a local workspace package and fail if it is not in the workspace
pnpm --filter @my/app add @my/shared --workspace

# Run lint everywhere without exploding on packages that skip lint
pnpm -r --parallel --if-present run lint
```

I reach for `--filter` constantly. Without it, a monorepo starts sounding like an open office where every command interrupts every package.

## Use `workspace:` when you mean "local or fail"

The [workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) exists for the exact moment when "it probably links locally" stops feeling good enough. If a dependency must come from the current workspace, say it directly and let pnpm fail loudly when that package or version is missing.

Before the next snippet, the rule is simple: if the package is internal on purpose, I would rather be explicit than rely on matching ranges.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

Without `workspace:`, pnpm only links matching local packages when `linkWorkspacePackages` is enabled. With `workspace:`, it refuses to fall back to the registry, and pnpm rewrites those specs to normal semver when you pack or publish.

## Workspaces solve installs, not releases

Once a few packages are published, installs stop being the annoying part. Releases do. pnpm's [release workflow](https://pnpm.io/workspaces#release-workflow) is explicit about that: workspace versioning has no built-in pnpm solution, so you should pick a dedicated tool. If I want the least surprising path, I follow pnpm's [Changesets guide](https://pnpm.io/using-changesets).

Before you wire it into CI, the local flow looks like this:

```bash
# Install the Changesets CLI in the workspace root
pnpm add -Dw @changesets/cli

# Create the config once
pnpm changeset init

# Record the release intent for a change
pnpm changeset

# Apply pending version bumps
pnpm changeset version

# Publish versioned packages in the workspace
pnpm publish -r
```

If your repo has two or three packages that mostly move together, plain workspaces are usually enough. Once you need strict release coordination across dozens of packages, keep pnpm workspaces for dependency management and let a release tool own the rest.
