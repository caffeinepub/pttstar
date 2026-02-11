import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface AuthenticatedFlowFallbackProps {
  error?: Error | null;
  context?: string;
  onRetry?: () => void;
  onClearSession?: () => void;
}

export default function AuthenticatedFlowFallback({
  error,
  context = 'authenticated operation',
  onRetry,
  onClearSession,
}: AuthenticatedFlowFallbackProps) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  console.error(`AuthenticatedFlowFallback: Error in ${context}:`, {
    message: errorMessage,
    stack: error?.stack,
  });

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Connection Error</CardTitle>
              <CardDescription>
                Unable to complete {context}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {onClearSession && (
              <Button
                onClick={onClearSession}
                variant="default"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out & Clear Session
              </Button>
            )}
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            If this problem persists, try logging out and logging back in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
