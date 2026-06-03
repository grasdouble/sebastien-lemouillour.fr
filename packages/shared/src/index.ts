export { LangSwitcher, LANG_CHANGE_EVENT } from './components/LangSwitcher';
export { CapabilitiesInfo, LoadingIndicator, ModelSelector } from './components';
export type { CapabilitiesInfoProps, LoadingIndicatorProps, ModelSelectorProps } from './components';
export { initializeGoogleAnalytics, trackGoogleAnalyticsEvent, trackGoogleAnalyticsPageView } from './googleAnalytics';
export type { GoogleAnalyticsEventParams, GoogleAnalyticsPageView } from './googleAnalytics';
export {
  canRunModel,
  createProvider,
  detectCapabilities,
  getCompatibleModels,
  getModelById,
  getModelsByProvider,
  getModelsBySize,
  MODEL_REGISTRY,
  useCapabilities,
  useLLM,
  useModelLoader,
} from './llm';
export type {
  BrowserCapabilities,
  GenerationConfig,
  GenerationResult,
  GenerationState,
  LLMProvider,
  LLMProviderInstance,
  ModelConfig,
  ModelLoadProgress,
  OnStreamCallback,
  StreamChunk,
  UseLLMResult,
} from './llm';
export { usePageSeo } from './usePageSeo';
export type { PageSeoConfig } from './usePageSeo';
export { fr as sharedI18nFr, en as sharedI18nEn } from './i18n';
