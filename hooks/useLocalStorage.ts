
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  reviver?: (parsedValue: any) => T // Optional reviver function
): [T, (value: T | ((val: T) => T)) => void] {
  
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return reviver ? reviver(parsed) : (parsed as T);
      }
      // If initialValue is [], and reviver is sortTasks, sortTasks([]) is [].
      // If localStorage is empty, initialValue is returned. If initialValue itself
      // needs processing by reviver, the caller should ensure it's pre-processed or
      // the hook's logic for initialValue would need to be more complex.
      // For the current use case (tasks), initialValue is [] and reviver is sortTasks, which is fine.
      return initialValue; 
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, reviver]); // Added reviver to dependencies

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // The value passed to setValue should already be in the final, transformed state (e.g., sorted)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, readValue]); // readValue dependency includes reviver

  // Listen to storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue !== null) {
          try {
              let parsedValue = JSON.parse(event.newValue);
              if (reviver) {
                  parsedValue = reviver(parsedValue);
              }
              setStoredValue(parsedValue as T);
          } catch (error) {
              console.warn(`Error parsing storage change for key "${key}":`, error);
              // Optionally, set to initialValue or a safe default.
              // For now, mirrors readValue's error handling.
          }
        } else {
          // Handle item removal from other tabs, revert to initialValue
          // (which might be revived if contractually initialValue also needed it)
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, reviver]); // Added reviver and initialValue to dependencies


  return [storedValue, setValue];
}

export default useLocalStorage;
