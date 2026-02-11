import { Loader2 } from 'lucide-react';

export default function PostLoginInterstitial() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Finishing sign-in…</h2>
          <p className="text-sm text-muted-foreground">Loading your profile</p>
        </div>
      </div>
    </div>
  );
}
