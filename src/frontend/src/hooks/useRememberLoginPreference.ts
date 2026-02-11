import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pttstar_remember_login';

/**
 * Hook to manage the "Remember my login on this device" preference.
 * Defaults to ON (true) to preserve current behavior where users stay logged in.
 */
export function useRememberLoginPreference() {
  const [rememberLogin, setRememberLoginState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Default to true (ON) if not set
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const setRememberLogin = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
      setRememberLoginState(value);
    } catch (error) {
      console.error('Failed to save remember login preference:', error);
    }
  }, []);

  return {
    rememberLogin,
    setRememberLogin,
  };
}

/**
 * Get the current remember login preference without using React hooks.
 * Useful for checking the preference outside of React components.
 */
export function getRememberLoginPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}
