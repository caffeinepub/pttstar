import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, loginStatus } = useInternetIdentity();

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
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
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

  return <>{children}</>;
}
