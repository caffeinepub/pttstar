import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, User, Save, LogOut, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRememberLoginPreference } from '../hooks/useRememberLoginPreference';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { rememberLogin, setRememberLogin } = useRememberLoginPreference();

  const [callsign, setCallsign] = useState('');
  const [name, setName] = useState('');
  const [dmrId, setDmrId] = useState('');
  const [ssid, setSsid] = useState('');
  const [licenseAcknowledgement, setLicenseAcknowledgement] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setCallsign(userProfile.callsign || '');
      setName(userProfile.name || '');
      setDmrId(userProfile.dmrId?.toString() || '');
      setSsid(userProfile.ssid?.toString() || '');
      setLicenseAcknowledgement(userProfile.licenseAcknowledgement || false);
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({
        callsign: callsign.trim().toUpperCase(),
        name: name.trim() || undefined,
        dmrId: dmrId.trim() ? BigInt(dmrId.trim()) : undefined,
        ssid: ssid.trim() ? BigInt(ssid.trim()) : undefined,
        licenseAcknowledgement,
        favoriteNetworks: userProfile?.favoriteNetworks || [],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRememberLoginChange = (checked: boolean) => {
    setRememberLogin(checked);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <ColorPageHeader
          title="Settings"
          subtitle="Manage your profile and preferences"
          variant="settings"
          icon={<Settings className="h-8 w-8" />}
        />
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading settings...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <ColorPageHeader
        title="Settings"
        subtitle="Manage your profile and preferences"
        variant="settings"
        icon={<Settings className="h-8 w-8" />}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your profile information is stored on the Internet Computer blockchain and synced across devices. Connection settings are stored locally on this device only.
          </AlertDescription>
        </Alert>

        <ColorAccentPanel variant="info">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Sign-In Preferences
              </CardTitle>
              <CardDescription>Control how PTTStar handles your login session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="remember-login"
                  checked={rememberLogin}
                  onCheckedChange={handleRememberLoginChange}
                />
                <div className="space-y-1">
                  <Label htmlFor="remember-login" className="cursor-pointer font-medium">
                    Remember my login on this device
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, you'll stay logged in across browser sessions. When disabled, you'll be logged out when you close the browser or navigate away. <strong>Disable this on shared devices for security.</strong>
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> If you're using a shared or public device, disable "Remember my login" and always log out when finished to protect your account.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </ColorAccentPanel>

        {saveSuccess && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Profile Saved</AlertTitle>
            <AlertDescription>Your profile information has been updated successfully.</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your amateur radio operator details and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callsign">Callsign *</Label>
                <Input
                  id="callsign"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                  placeholder="e.g., W1AW"
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Required: Your FCC-issued amateur radio callsign. Must be valid and properly formatted (e.g., W1AW, KE0ABC).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Your name as you'd like it displayed in the app.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">DMR Configuration</h3>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  DMR ID and SSID are only required if you plan to use DMR networks. Register for a DMR ID at <strong>radioid.net</strong> or your regional DMR registry. SSID is an optional suffix (0-9) for your DMR ID.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="dmr-id">DMR ID</Label>
                <Input
                  id="dmr-id"
                  value={dmrId}
                  onChange={(e) => setDmrId(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 1234567"
                  type="text"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Your registered DMR ID number. Required for DMR network connections. Register at radioid.net if you don't have one.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssid">SSID</Label>
                <Input
                  id="ssid"
                  value={ssid}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 9)) {
                      setSsid(val);
                    }
                  }}
                  placeholder="e.g., 0"
                  type="text"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: SSID (Subscriber ID) is a single-digit suffix (0-9) for your DMR ID. Use 0 if unsure or leave blank.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>License Acknowledgement Required</AlertTitle>
                <AlertDescription>
                  You must acknowledge that you hold a valid amateur radio license to enable transmit functionality. Transmitting without a license is illegal in most jurisdictions.
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="license-ack"
                  checked={licenseAcknowledgement}
                  onCheckedChange={(checked) => setLicenseAcknowledgement(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="license-ack" className="cursor-pointer font-medium">
                    I acknowledge that I hold a valid amateur radio license
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you confirm that you are a licensed amateur radio operator authorized to transmit on the frequencies and modes you intend to use. You are responsible for complying with all applicable regulations.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!callsign.trim() || saveProfile.isPending}
                className="flex-1"
                size="lg"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your Internet Identity session</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Logging out will clear your session and all locally stored connection settings. Your profile data remains saved on the blockchain and will be available when you log in again.
              </AlertDescription>
            </Alert>
            <Button onClick={handleLogout} variant="destructive" size="lg" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
