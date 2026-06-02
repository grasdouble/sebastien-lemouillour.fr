/**
 * ESM shim for use-sync-external-store/shim/with-selector.
 *
 * Implements useSyncExternalStoreWithSelector using React 18+'s native
 * useSyncExternalStore, replacing the CJS-only package to avoid runtime
 * __require("react") failures in browser ESM bundles.
 */
import { useRef, useSyncExternalStore } from 'react';

const objectIs: (a: unknown, b: unknown) => boolean =
  typeof Object.is === 'function'
    ? Object.is
    : (x, y) => (x === y && (x !== 0 || 1 / (x as number) === 1 / (y as number))) || (x !== x && y !== y); // NaN

type Cache<Snapshot, Selection> = {
  snap: Snapshot;
  sel: Selection;
  selector: (snapshot: Snapshot) => Selection;
  isEqual: ((a: Selection, b: Selection) => boolean) | undefined;
};

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: null | undefined | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean
): Selection {
  // Cache keyed by snap + selector + isEqual identity to avoid stale selections
  const cacheRef = useRef<Cache<Snapshot, Selection> | null>(null);

  const getSelection = (): Selection => {
    const snap = getSnapshot();
    const cache = cacheRef.current;

    if (cache !== null && cache.selector === selector && cache.isEqual === isEqual && objectIs(cache.snap, snap)) {
      return cache.sel;
    }

    const nextSel = selector(snap);

    // Only apply isEqual optimisation when selector/isEqual are stable references
    if (cache !== null && cache.selector === selector && cache.isEqual === isEqual) {
      if (isEqual ? isEqual(cache.sel, nextSel) : objectIs(cache.sel, nextSel)) {
        // Selection is referentially equal — keep cached instance to avoid re-renders
        cacheRef.current = { snap, sel: cache.sel, selector, isEqual };
        return cache.sel;
      }
    }

    cacheRef.current = { snap, sel: nextSel, selector, isEqual };
    return nextSel;
  };

  const getServerSelection = getServerSnapshot ? (): Selection => selector(getServerSnapshot()) : undefined;

  return useSyncExternalStore(subscribe, getSelection, getServerSelection);
}
