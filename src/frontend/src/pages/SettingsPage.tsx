import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useQrzLookup } from '../hooks/useQrzLookup';
import TransmitDisclaimer from '../components/TransmitDisclaimer';
import { CheckCircle2, AlertCircle, Search } from 'lucide-react';

export default function SettingsPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const qrzLookup = useQrzLookup();

  const [callsign, setCallsign] = useState('');
  const [name, setName] = useState('');
  const [licenseAck, setLicenseAck] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [lookupCallsign, setLookupCallsign] = useState('');
  const [lookupResult, setLookupResult] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setCallsign(userProfile.callsign || '');
      setName(userProfile.name || '');
      setLicenseAck(userProfile.licenseAcknowledgement || false);
      setLookupCallsign(userProfile.callsign || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!callsign.trim()) {
      setError('Callsign is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        callsign: callsign.trim().toUpperCase(),
        name: name.trim() || undefined,
        licenseAcknowledgement: licenseAck,
        favoriteNetworks: userProfile?.favoriteNetworks || [],
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  const handleQrzLookup = async () => {
    setLookupResult('');
    setLookupError('');

    if (!lookupCallsign.trim()) {
      setLookupError('Please enter a callsign to lookup');
      return;
    }

    try {
      const result = await qrzLookup.mutateAsync(lookupCallsign.trim().toUpperCase());
      setLookupResult(result);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to lookup callsign. Please try again.';
      setLookupError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      {!licenseAck && (
        <div className="mb-6">
          <TransmitDisclaimer />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your callsign, name, and license acknowledgement.</CardDescription>
        </CardHeader>
        <CardContent>
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
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="license"
                  checked={licenseAck}
                  onCheckedChange={(checked) => setLicenseAck(!!checked)}
                />
                <Label htmlFor="license" className="text-sm leading-tight">
                  I hold a valid amateur radio license and understand that I must comply with all applicable
                  regulations when transmitting. I acknowledge that PTTStar is a software client and that I am
                  responsible for adhering to local amateur radio rules.
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-status-active bg-status-active/10">
                <CheckCircle2 className="h-4 w-4 text-status-active" />
                <AlertDescription className="text-status-active">Profile saved successfully!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QRZ Callsign Lookup</CardTitle>
          <CardDescription>Look up callsign information from QRZ.com database.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lookupCallsign">Callsign</Label>
              <div className="flex gap-2">
                <Input
                  id="lookupCallsign"
                  value={lookupCallsign}
                  onChange={(e) => setLookupCallsign(e.target.value)}
                  placeholder="e.g., W1AW"
                  className="uppercase"
                />
                <Button
                  type="button"
                  onClick={handleQrzLookup}
                  disabled={qrzLookup.isPending}
                  className="shrink-0"
                >
                  {qrzLookup.isPending ? (
                    'Looking up...'
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Lookup
                    </>
                  )}
                </Button>
              </div>
            </div>

            {lookupResult && (
              <Alert className="border-status-active bg-status-active/10">
                <CheckCircle2 className="h-4 w-4 text-status-active" />
                <AlertDescription className="whitespace-pre-wrap text-status-active">
                  {lookupResult}
                </AlertDescription>
              </Alert>
            )}

            {lookupError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{lookupError}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
