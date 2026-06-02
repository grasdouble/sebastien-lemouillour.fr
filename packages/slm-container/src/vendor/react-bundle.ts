/**
 * Combined React vendor bundle.
 *
 * All four React package specifiers are mapped to this single file in the
 * production import map:
 *   - react
 *   - react/jsx-runtime
 *   - react-dom
 *   - react-dom/client
 *
 * Bundling everything together avoids circular imports and guarantees a single
 * React instance shared by all parcels.
 */

// ---------- react ----------
import reactDefault, {
  act,
  Activity,
  cache,
  cacheSignal,
  captureOwnerStack,
  Children,
  cloneElement,
  Component,
  createContext,
  createElement,
  createRef,
  forwardRef,
  Fragment,
  isValidElement,
  lazy,
  memo,
  Profiler,
  PureComponent,
  startTransition,
  StrictMode,
  Suspense,
  use,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} from 'react';
// ---------- react-dom ----------
import { createPortal, flushSync, unstable_batchedUpdates, useFormState, useFormStatus } from 'react-dom';
// ---------- react-dom/client ----------
import { createRoot, hydrateRoot } from 'react-dom/client';
// ---------- react/jsx-runtime ----------
// Fragment is the same symbol as React.Fragment; no need to re-export it.
import { jsx, jsxs } from 'react/jsx-runtime';

export default reactDefault;

export {
  // react
  Activity,
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  act,
  cache,
  cacheSignal,
  captureOwnerStack,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  use,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
  // react/jsx-runtime
  jsx,
  jsxs,
  // react-dom
  createPortal,
  flushSync,
  unstable_batchedUpdates,
  useFormState,
  useFormStatus,
  // react-dom/client
  createRoot,
  hydrateRoot,
};
