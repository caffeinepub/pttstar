import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, isLoginError, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showError, setShowError] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleClearSession = async () => {
    console.log('LoginButton: Clearing session and cache');
    await clear();
    queryClient.clear();
    setShowError(false);
  };

  const handleRetryLogin = async () => {
    console.log('LoginButton: Retrying login after error');
    setShowError(false);
    await handleClearSession();
    setTimeout(() => {
      login();
    }, 300);
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      setShowError(false);
    } else {
      try {
        setShowError(false);
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        setShowError(true);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'} size="sm">
        {loginStatus === 'logging-in' ? (
          'Logging in...'
        ) : isAuthenticated ? (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>
      {(isLoginError || showError) && loginError && !isAuthenticated && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="text-xs font-semibold">Login failed</div>
            <div className="mt-1 text-xs">{loginError.message}</div>
            <div className="mt-2 flex gap-2">
              <Button onClick={handleRetryLogin} variant="outline" size="sm" className="h-7 text-xs">
                Retry
              </Button>
              <Button onClick={handleClearSession} variant="outline" size="sm" className="h-7 text-xs">
                Clear Session
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
