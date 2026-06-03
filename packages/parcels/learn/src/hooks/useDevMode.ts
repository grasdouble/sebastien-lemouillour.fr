import { useEffect, useState } from 'react';

const STORAGE_KEY = 'learn.dev';

function readInitialValue(): boolean {
  const param = new URLSearchParams(window.location.search).get('dev');
  if (param === null) return sessionStorage.getItem(STORAGE_KEY) === 'true';
  if (param === 'false') {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return true;
}

export function useDevMode(): boolean {
  const [devMode] = useState<boolean>(readInitialValue);

  useEffect(() => {
    if (devMode) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [devMode]);

  return devMode;
}
