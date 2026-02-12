import { useRegeneratedAuth } from '../auth/iiAuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, isLoginError, error } = useRegeneratedAuth();
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
      } catch (err: any) {
        console.error('Login error:', err);
        setShowError(true);
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
      {(isLoginError || showError) && error && !isAuthenticated && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="text-xs font-semibold">Sign-in failed</div>
            <div className="mt-1 text-xs">{error.message}</div>
            <div className="mt-2 flex gap-2">
              <Button onClick={handleRetryLogin} variant="outline" size="sm" className="h-7 text-xs">
                Retry Login
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
