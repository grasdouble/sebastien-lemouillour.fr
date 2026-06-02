import lufaNodeConfig from '@grasdouble/lufa_config_eslint/light.mjs';

export default [
  ...lufaNodeConfig,
  {
    ignores: ['dist/**', 'src/**'],
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
];
