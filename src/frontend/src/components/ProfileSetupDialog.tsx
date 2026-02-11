import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfileSetupDialog() {
  const [callsign, setCallsign] = useState('');
  const [name, setName] = useState('');
  const [licenseAck, setLicenseAck] = useState(false);
  const [error, setError] = useState('');

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!callsign.trim()) {
      setError('Callsign is required');
      return;
    }

    if (!licenseAck) {
      setError('You must acknowledge that you hold a valid amateur radio license');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        callsign: callsign.trim().toUpperCase(),
        name: name.trim() || undefined,
        licenseAcknowledgement: licenseAck,
        favoriteNetworks: [],
      });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to PTTStar</DialogTitle>
          <DialogDescription>Please set up your profile to continue.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callsign">
              Callsign <span className="text-destructive">*</span>
            </Label>
            <Input
              id="callsign"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="e.g., W1AW"
              className="uppercase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="license" checked={licenseAck} onCheckedChange={(checked) => setLicenseAck(!!checked)} />
            <Label htmlFor="license" className="text-sm leading-tight">
              I hold a valid amateur radio license and understand that I must comply with all applicable regulations
              when transmitting.
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
