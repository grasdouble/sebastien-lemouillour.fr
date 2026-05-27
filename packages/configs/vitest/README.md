# @grasdouble/slm_config_vitest

Shared [Vitest](https://vitest.dev) configuration for the `sebastien-lemouillour.fr` monorepo.

## Base config

| Option            | Value                                          |
| ----------------- | ---------------------------------------------- |
| Environment       | `happy-dom`                                    |
| Coverage provider | `v8`                                           |
| Coverage include  | `src/**/*.ts`                                  |
| Coverage exclude  | `src/index.ts`, `src/**/*.test.ts`             |
| Thresholds        | 100% statements / branches / functions / lines |

## Usage

### 1. Add the dependency

```bash
pnpm add -D @grasdouble/slm_config_vitest --workspace
```

### 2. Create `vitest.config.ts`

```ts
import { createVitestConfig } from '@grasdouble/slm_config_vitest';

export default createVitestConfig();
```

### 3. Add test scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Overrides

Pass a partial config to `createVitestConfig()` to override specific options. It is merged with [`mergeConfig`](https://vitest.dev/config/#mergeconfig) from vitest.

```ts
import { createVitestConfig } from '@grasdouble/slm_config_vitest';

export default createVitestConfig({
  test: {
    // Exclude additional files from coverage
    coverage: {
      exclude: ['src/index.ts', 'src/**/*.test.ts', 'src/constants.ts'],
    },
  },
});
```
