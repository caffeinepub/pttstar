import { useRegeneratedAuth } from '../auth/iiAuthProvider';
import { useActorWithError } from '../hooks/useActorWithError';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import AuthenticatedFlowFallback from './AuthenticatedFlowFallback';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, loginStatus, clear, isLoginError, error } = useRegeneratedAuth();
  const { actor, isFetching, error: actorError, isError: actorIsError } = useActorWithError();
  const queryClient = useQueryClient();

  const handleClearSession = async () => {
    console.log('AuthGate: Clearing session and cache');
    await clear();
    queryClient.clear();
  };

  const handleRetry = () => {
    console.log('AuthGate: Retrying actor initialization');
    queryClient.invalidateQueries({ queryKey: ['actor'] });
  };

  const handleRetryLogin = async () => {
    console.log('AuthGate: Retrying login after error');
    await handleClearSession();
    setTimeout(() => {
      login();
    }, 300);
  };

  // Not authenticated - show login prompt
  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-warning/20">
              <ShieldAlert className="h-6 w-6 text-status-warning" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You must be logged in to access this feature.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoginError && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <div className="font-semibold">Sign-in failed</div>
                  <div className="mt-1 text-sm">{error.message}</div>
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
            {isLoginError && (
              <div className="flex gap-2">
                <Button onClick={handleRetryLogin} variant="outline" className="flex-1" size="sm">
                  Retry Login
                </Button>
                <Button onClick={handleClearSession} variant="outline" className="flex-1" size="sm">
                  Clear Session
                </Button>
              </div>
            )}
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Return to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated but actor initialization failed
  if (actorIsError && actorError) {
    return (
      <AuthenticatedFlowFallback
        error={actorError}
        context="backend initialization"
        onRetry={handleRetry}
        onClearSession={handleClearSession}
      />
    );
  }

  // Authenticated but actor still loading
  if (isFetching || !actor) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold text-foreground">Loading...</div>
          <div className="text-muted-foreground">Connecting to backend</div>
        </div>
      </div>
    );
  }

  // All good - render children
  return <>{children}</>;
}
