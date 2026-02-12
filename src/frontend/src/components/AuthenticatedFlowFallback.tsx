import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface AuthenticatedFlowFallbackProps {
  error: Error;
  context: 'sign-in' | 'backend initialization';
  onRetry?: () => void;
  onClearSession?: () => void;
}

export default function AuthenticatedFlowFallback({
  error,
  context,
  onRetry,
  onClearSession,
}: AuthenticatedFlowFallbackProps) {
  const contextMessage =
    context === 'sign-in'
      ? 'Unable to complete sign-in'
      : 'Unable to connect to backend services';

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Connection Error</CardTitle>
          <CardDescription>{contextMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Error details:</span> {error.message}
            </p>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="default" className="flex-1">
                Retry
              </Button>
            )}
            {onClearSession && (
              <Button onClick={onClearSession} variant="outline" className="flex-1">
                Clear Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
