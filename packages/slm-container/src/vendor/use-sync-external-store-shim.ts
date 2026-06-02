/**
 * ESM shim for use-sync-external-store/shim.
 *
 * React 18+ ships useSyncExternalStore natively. This shim re-exports it,
 * replacing the CJS-only use-sync-external-store package (which would otherwise
 * generate a runtime __require("react") that fails in browser ESM).
 */
export { useSyncExternalStore } from 'react';
