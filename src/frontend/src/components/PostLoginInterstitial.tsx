import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface PostLoginInterstitialProps {
  onRetry?: () => void;
  onClearSession?: () => void;
}

const TIMEOUT_MS = 12000; // 12 seconds

export default function PostLoginInterstitial({ onRetry, onClearSession }: PostLoginInterstitialProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('PostLoginInterstitial: Timeout reached after', TIMEOUT_MS, 'ms');
      setShowTimeout(true);
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  if (showTimeout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <Card className="w-full max-w-md border-status-warning">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-warning/20">
              <AlertCircle className="h-6 w-6 text-status-warning" />
            </div>
            <CardTitle>Connection Taking Longer Than Expected</CardTitle>
            <CardDescription>Profile loading is delayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold">If profile loading doesn't complete:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Try the <strong>Retry</strong> button to reload your profile</li>
                <li>Use <strong>Clear Session</strong> to reset and sign in again</li>
                <li>Check your internet connection</li>
                <li>Ensure popups are allowed for this site</li>
              </ul>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Finishing sign-in…</CardTitle>
          <CardDescription>Loading your profile and settings</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
