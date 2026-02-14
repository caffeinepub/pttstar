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
      II_URL: import.meta.env.VITE_II_URL || 'https://identity.internetcomputer.org',
    };
  } catch (err) {
    console.warn('Failed to load config, using defaults:', err);
    return {
      II_URL: 'https://identity.internetcomputer.org',
    };
  }
}

const config = loadConfig();

type LoginStatus = 'idle' | 'logging-in' | 'success' | 'error';

interface RegeneratedAuthContextType {
  identity: Identity | null;
  isInitializing: boolean;
  loginStatus: LoginStatus;
  isLoginError: boolean;
  error: Error | null;
  login: () => Promise<void>;
  clear: () => Promise<void>;
}

const RegeneratedAuthContext = createContext<RegeneratedAuthContextType | undefined>(undefined);

export function RegeneratedAuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const authClientRef = useRef<AuthClient | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AuthClient on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('RegeneratedAuthProvider: Initializing AuthClient');
        
        // Set a timeout to prevent infinite initialization
        initTimeoutRef.current = setTimeout(() => {
          if (mounted && isInitializing) {
            console.warn('RegeneratedAuthProvider: Initialization timeout, forcing completion');
            setIsInitializing(false);
          }
        }, 10000); // 10 second timeout

        const client = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          },
        });

        if (!mounted) return;

        authClientRef.current = client;
        const isAuthenticated = await client.isAuthenticated();

        if (isAuthenticated) {
          const currentIdentity = client.getIdentity();
          console.log('RegeneratedAuthProvider: Found existing authenticated identity');
          setIdentity(currentIdentity);
          setLoginStatus('success');
        } else {
          console.log('RegeneratedAuthProvider: No existing authentication found');
        }
      } catch (err: any) {
        console.error('RegeneratedAuthProvider: Initialization error:', err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const login = useCallback(async () => {
    if (!authClientRef.current) {
      const err = new Error('AuthClient not initialized');
      setError(err);
      setLoginStatus('error');
      throw err;
    }

    try {
      setLoginStatus('logging-in');
      setError(null);

      console.log('RegeneratedAuthProvider: Starting login flow');

      await authClientRef.current.login({
        identityProvider: config.II_URL,
        onSuccess: () => {
          console.log('RegeneratedAuthProvider: Login successful');
          const newIdentity = authClientRef.current!.getIdentity();
          setIdentity(newIdentity);
          setLoginStatus('success');
        },
        onError: (err?: string) => {
          console.error('RegeneratedAuthProvider: Login error:', err);
          const error = new Error(err || 'Login failed');
          setError(error);
          setLoginStatus('error');
        },
      });
    } catch (err: any) {
      console.error('RegeneratedAuthProvider: Login exception:', err);
      setError(err);
      setLoginStatus('error');
      throw err;
    }
  }, []);

  const clear = useCallback(async () => {
    try {
      console.log('RegeneratedAuthProvider: Clearing authentication');
      
      if (authClientRef.current) {
        await authClientRef.current.logout();
      }
      
      clearRegeneratedAuthStorage();
      setIdentity(null);
      setLoginStatus('idle');
      setError(null);
      
      console.log('RegeneratedAuthProvider: Authentication cleared');
    } catch (err: any) {
      console.error('RegeneratedAuthProvider: Error during clear:', err);
      // Still clear local state even if logout fails
      setIdentity(null);
      setLoginStatus('idle');
      setError(null);
    }
  }, []);

  const value: RegeneratedAuthContextType = {
    identity,
    isInitializing,
    loginStatus,
    isLoginError: loginStatus === 'error',
    error,
    login,
    clear,
  };

  return <RegeneratedAuthContext.Provider value={value}>{children}</RegeneratedAuthContext.Provider>;
}

export function useRegeneratedAuth() {
  const context = useContext(RegeneratedAuthContext);
  if (context === undefined) {
    throw new Error('useRegeneratedAuth must be used within RegeneratedAuthProvider');
  }
  return context;
}
