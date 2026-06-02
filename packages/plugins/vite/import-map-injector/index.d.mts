export interface ImportMap {
  imports?: Record<string, string>;
}

export interface ImportMapPluginOptions {
  extImportMap?: string | ImportMap;
  prodImportMap?: string | ImportMap;
  devImportMap?: string | ImportMap;
  previewImportMap?: string | ImportMap;
}

export default function importMapPlugin(options?: ImportMapPluginOptions): {
  name: string;
  configResolved(config: { command: string; mode: string }): void;
  transformIndexHtml(html: string): string;
};
