# sebastien-lemouillour.fr

Source code of [sebastien-lemouillour.fr](https://sebastien-lemouillour.fr) — personal website built as a microfrontend application.

## Architecture

This repo is a **pnpm monorepo** organised around a [single-spa](https://single-spa.js.org/) microfrontend setup:

| Package                                     | Name                                              | Role                                                            |
| ------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| `packages/slm-container`                    | `@grasdouble/slm-container`                       | Shell — bootstraps single-spa, loads import maps, applies theme |
| `packages/parcels/landing-page`             | `@grasdouble/slm_parcel_landing-page`             | Landing page parcel (React 19 + i18next FR/EN)                  |
| `packages/plugins/vite/react-preamble`      | `@grasdouble/slm_plugin_vite_react-preamble`      | Vite plugin — React preamble for microfrontend compatibility    |
| `packages/plugins/vite/import-map-injector` | `@grasdouble/slm_plugin_vite_import-map-injector` | Vite plugin — injects import maps into the HTML shell           |

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (build tooling)
- **single-spa** (microfrontend orchestration)
- **[Lufa Design System](https://lufa-design.sebastien-lemouillour.fr)** (UI components + theming)
- **i18next** (FR / EN)
- **pnpm workspaces**

## Getting started

```bash
pnpm install
pnpm slm:dev
```

## Scripts

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `pnpm slm:dev`             | Start container + landing page in dev mode |
| `pnpm slm:build`           | Build container + landing page             |
| `pnpm slm:preview`         | Preview production build                   |
| `pnpm slm:sync:importmaps` | Sync import maps in the container          |
| `pnpm all:typecheck`       | TypeScript check across all packages       |
| `pnpm all:lint`            | ESLint across all packages                 |
| `pnpm all:build`           | Build all packages                         |
| `pnpm clean`               | Remove `node_modules`, `dist` and cache    |

## License

[MIT](./LICENSE.md)
