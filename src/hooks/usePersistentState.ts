import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState] as const;
}
