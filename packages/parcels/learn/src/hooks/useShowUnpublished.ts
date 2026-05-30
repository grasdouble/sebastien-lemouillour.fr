import { useEffect, useState } from 'react';

const STORAGE_KEY = 'learn.showUnpublished';

function readInitialValue(): boolean {
  const param = new URLSearchParams(window.location.search).get('showUnpublished');
  if (param === null) return sessionStorage.getItem(STORAGE_KEY) === 'true';
  if (param === 'false') {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return true;
}

export function useShowUnpublished(): boolean {
  const [showUnpublished] = useState<boolean>(readInitialValue);

  useEffect(() => {
    if (showUnpublished) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [showUnpublished]);

  return showUnpublished;
}
