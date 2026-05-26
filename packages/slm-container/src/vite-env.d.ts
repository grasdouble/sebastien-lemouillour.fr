/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- required for declaration merging with Vite's ImportMetaEnv, `type` is not valid here
interface ImportMetaEnv {
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- required for declaration merging with Vite's ImportMeta, `type` is not valid here
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
