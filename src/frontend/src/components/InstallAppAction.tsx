import { useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export default function InstallAppAction() {
  const { isInstallable, isIos, isInstalled, promptInstall } = usePwaInstall();
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
    } else if (isInstallable) {
      setIsInstalling(true);
      await promptInstall();
      setIsInstalling(false);
    }
  };

  // Only show install button if installable or iOS
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="hidden md:flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isInstalling ? 'Installing...' : 'Install App'}
      </Button>

      {/* iOS Instructions Dialog */}
      <Dialog open={showIosInstructions} onOpenChange={setShowIosInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install PTTStar</DialogTitle>
            <DialogDescription>
              Follow these steps to add PTTStar to your home screen:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button in Safari
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap <strong>"Add"</strong> in the top right corner
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowIosInstructions(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
