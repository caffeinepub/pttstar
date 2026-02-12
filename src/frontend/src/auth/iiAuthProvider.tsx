import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { clearRegeneratedAuthStorage } from './authClientStorage';

// Load configuration
function loadConfig() {
  try {
    // In production, env.json is served from /env.json
    // During development, we use environment variables
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      return (window as any).__ENV__;
    }
    return {
      DERIVATION_ORIGIN: window.location.origin,
    };
  } catch (error) {
    console.error('[RegeneratedAuth] Failed to load config:', error);
    return {
      DERIVATION_ORIGIN: window.location.origin,
    };
  }
}

type LoginStatus = 'idle' | 'logging-in' | 'success' | 'error' | 'timeout';

interface RegeneratedAuthContextType {
  identity: Identity | null;
  isInitializing: boolean;
  loginStatus: LoginStatus;
  error: Error | null;
  login: () => Promise<void>;
  clear: () => Promise<void>;
  isLoggingIn: boolean;
  isLoginError: boolean;
  isLoginSuccess: boolean;
}

const RegeneratedAuthContext = createContext<RegeneratedAuthContextType | null>(null);

const LOGIN_TIMEOUT_MS = 12000; // 12 seconds to match existing interstitial behavior

export function RegeneratedAuthProvider({ children }: { children: React.ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoginInProgressRef = useRef(false);

  // Initialize AuthClient on mount
  useEffect(() => {
    let mounted = true;

    async function initAuthClient() {
      try {
        console.log('[RegeneratedAuth] Initializing AuthClient...');
        
        const client = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
            disableDefaultIdleCallback: true,
          },
        });

        if (!mounted) return;

        const isAuthenticated = await client.isAuthenticated();
        console.log('[RegeneratedAuth] AuthClient initialized, authenticated:', isAuthenticated);

        setAuthClient(client);

        if (isAuthenticated) {
          const currentIdentity = client.getIdentity();
          setIdentity(currentIdentity);
          setLoginStatus('success');
          console.log('[RegeneratedAuth] Restored identity:', currentIdentity.getPrincipal().toString());
        }
      } catch (err) {
        console.error('[RegeneratedAuth] Failed to initialize AuthClient:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize authentication'));
          setLoginStatus('error');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    initAuthClient();

    return () => {
      mounted = false;
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, []);

  const clearLoginTimeout = useCallback(() => {
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }
  }, []);

  const login = useCallback(async () => {
    if (!authClient) {
      console.error('[RegeneratedAuth] AuthClient not initialized');
      setError(new Error('Authentication system not ready'));
      setLoginStatus('error');
      return;
    }

    if (isLoginInProgressRef.current) {
      console.log('[RegeneratedAuth] Login already in progress, ignoring duplicate call');
      return;
    }

    try {
      isLoginInProgressRef.current = true;
      setLoginStatus('logging-in');
      setError(null);
      clearLoginTimeout();

      console.log('[RegeneratedAuth] Starting login flow...');

      // Set timeout for login handshake
      loginTimeoutRef.current = setTimeout(() => {
        console.warn('[RegeneratedAuth] Login timeout - handshake did not complete within', LOGIN_TIMEOUT_MS, 'ms');
        if (loginStatus === 'logging-in') {
          setLoginStatus('timeout');
          setError(new Error('Sign-in timed out. The Internet Identity window may not have completed the handshake.'));
          isLoginInProgressRef.current = false;
        }
      }, LOGIN_TIMEOUT_MS);

      const config = loadConfig();
      const identityProvider = process.env.II_URL || 'https://identity.internetcomputer.org';

      await authClient.login({
        identityProvider,
        derivationOrigin: config.DERIVATION_ORIGIN,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        onSuccess: () => {
          clearLoginTimeout();
          const newIdentity = authClient.getIdentity();
          console.log('[RegeneratedAuth] Login successful, principal:', newIdentity.getPrincipal().toString());
          setIdentity(newIdentity);
          setLoginStatus('success');
          setError(null);
          isLoginInProgressRef.current = false;
        },
        onError: (errorMsg) => {
          clearLoginTimeout();
          console.error('[RegeneratedAuth] Login error:', errorMsg);
          const errorMessage = errorMsg || 'Unknown error';
          setError(new Error(`Sign-in failed: ${errorMessage}`));
          setLoginStatus('error');
          isLoginInProgressRef.current = false;
        },
      });
    } catch (err) {
      clearLoginTimeout();
      console.error('[RegeneratedAuth] Login exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(`Sign-in failed: ${errorMessage}`));
      setLoginStatus('error');
      isLoginInProgressRef.current = false;
    }
  }, [authClient, loginStatus, clearLoginTimeout]);

  const clear = useCallback(async () => {
    try {
      console.log('[RegeneratedAuth] Clearing session...');
      clearLoginTimeout();
      
      if (authClient) {
        await authClient.logout();
      }
      
      clearRegeneratedAuthStorage();
      
      setIdentity(null);
      setLoginStatus('idle');
      setError(null);
      isLoginInProgressRef.current = false;
      
      console.log('[RegeneratedAuth] Session cleared');
    } catch (err) {
      console.error('[RegeneratedAuth] Error during logout:', err);
      // Still clear local state even if logout fails
      setIdentity(null);
      setLoginStatus('idle');
      setError(null);
      isLoginInProgressRef.current = false;
    }
  }, [authClient, clearLoginTimeout]);

  const value: RegeneratedAuthContextType = {
    identity,
    isInitializing,
    loginStatus,
    error,
    login,
    clear,
    isLoggingIn: loginStatus === 'logging-in',
    isLoginError: loginStatus === 'error' || loginStatus === 'timeout',
    isLoginSuccess: loginStatus === 'success',
  };

  return (
    <RegeneratedAuthContext.Provider value={value}>
      {children}
    </RegeneratedAuthContext.Provider>
  );
}

export function useRegeneratedAuth(): RegeneratedAuthContextType {
  const context = useContext(RegeneratedAuthContext);
  if (!context) {
    throw new Error('useRegeneratedAuth must be used within RegeneratedAuthProvider');
  }
  return context;
}
