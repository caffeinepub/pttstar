import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, AlertCircle, Info, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useRememberLoginPreference } from '../hooks/useRememberLoginPreference';
import ColorPageHeader from '../components/ColorPageHeader';
import {
  useServerDirectorySources,
  useUpdateServerDirectorySources,
  useRefreshBrandmeisterServers,
  useRefreshAllstarServers,
  useBrandmeisterMetadata,
  useAllstarMetadata,
} from '../hooks/useServerDirectories';
import { getCacheAge } from '../utils/serverDirectoryCache';
import { getPttClipHttpConfig, setPttClipHttpConfig, validateUploadUrl, validateReceivedClipsUrl } from '../utils/pttClipHttpConfig';

export default function SettingsPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const { rememberLogin, setRememberLogin } = useRememberLoginPreference();

  const [callsign, setCallsign] = useState('');
  const [name, setName] = useState('');
  const [dmrId, setDmrId] = useState('');
  const [ssid, setSsid] = useState('');
  const [licenseAcknowledgement, setLicenseAcknowledgement] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Server directory sources
  const { data: sources } = useServerDirectorySources();
  const updateSourcesMutation = useUpdateServerDirectorySources();
  const refreshBrandmeisterMutation = useRefreshBrandmeisterServers();
  const refreshAllstarMutation = useRefreshAllstarServers();
  const { data: bmMetadata } = useBrandmeisterMetadata();
  const { data: allstarMetadata } = useAllstarMetadata();

  const [bmSourceUrl, setBmSourceUrl] = useState('');
  const [allstarSourceUrl, setAllstarSourceUrl] = useState('');

  // PTT Clip HTTP Config
  const [uploadUrl, setUploadUrl] = useState('');
  const [receivedClipsUrl, setReceivedClipsUrl] = useState('');

  useEffect(() => {
    if (userProfile) {
      setCallsign(userProfile.callsign || '');
      setName(userProfile.name || '');
      setDmrId(userProfile.dmrId?.toString() || '');
      setSsid(userProfile.ssid?.toString() || '');
      setLicenseAcknowledgement(userProfile.licenseAcknowledgement || false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (sources) {
      setBmSourceUrl(sources.brandmeister);
      setAllstarSourceUrl(sources.allstar);
    }
  }, [sources]);

  useEffect(() => {
    const config = getPttClipHttpConfig();
    setUploadUrl(config.uploadUrl);
    setReceivedClipsUrl(config.receivedClipsUrl);
  }, []);

  const handleSave = async () => {
    setValidationError('');
    setSuccessMessage('');

    if (!callsign) {
      setValidationError('Callsign is required');
      return;
    }

    if (!licenseAcknowledgement) {
      setValidationError('You must acknowledge that you hold a valid amateur radio license');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        callsign: callsign.toUpperCase(),
        name: name || undefined,
        dmrId: dmrId ? BigInt(dmrId) : undefined,
        ssid: ssid ? BigInt(ssid) : undefined,
        licenseAcknowledgement,
        favoriteNetworks: userProfile?.favoriteNetworks || [],
      });
      setSuccessMessage('Profile saved successfully');
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save profile');
    }
  };

  const handleSaveSources = async () => {
    setValidationError('');
    setSuccessMessage('');
    try {
      await updateSourcesMutation.mutateAsync({
        brandmeister: bmSourceUrl,
        allstar: allstarSourceUrl,
      });
      setSuccessMessage('Server directory sources updated successfully');
    } catch (error: any) {
      setValidationError(error.message || 'Failed to update sources');
    }
  };

  const handleRefreshBrandmeister = async () => {
    setValidationError('');
    setSuccessMessage('');
    try {
      await refreshBrandmeisterMutation.mutateAsync();
      setSuccessMessage('BrandMeister server list refreshed successfully');
    } catch (error: any) {
      setValidationError(`Failed to refresh BrandMeister servers: ${error.message}. The app will continue using cached data if available.`);
    }
  };

  const handleRefreshAllstar = async () => {
    setValidationError('');
    setSuccessMessage('');
    try {
      await refreshAllstarMutation.mutateAsync();
      setSuccessMessage('AllStar server list refreshed successfully');
    } catch (error: any) {
      setValidationError(`Failed to refresh AllStar servers: ${error.message}. The app will continue using cached data if available.`);
    }
  };

  const handleSaveClipConfig = () => {
    setValidationError('');
    setSuccessMessage('');

    const uploadError = uploadUrl ? validateUploadUrl(uploadUrl) : null;
    const receivedError = receivedClipsUrl ? validateReceivedClipsUrl(receivedClipsUrl) : null;

    if (uploadError) {
      setValidationError(uploadError);
      return;
    }

    if (receivedError) {
      setValidationError(receivedError);
      return;
    }

    try {
      setPttClipHttpConfig({ uploadUrl, receivedClipsUrl });
      setSuccessMessage('Audio clip configuration saved successfully');
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save audio clip configuration');
    }
  };

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatCacheAge = (type: 'brandmeister' | 'allstar') => {
    const age = getCacheAge(type);
    if (!age) return 'No cache';
    const hours = Math.floor(age / 1000 / 60 / 60);
    const minutes = Math.floor((age / 1000 / 60) % 60);
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <ColorPageHeader
          title="Settings"
          subtitle="Manage your profile and preferences"
          variant="settings"
          icon={<Settings className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-2xl">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <ColorPageHeader
        title="Settings"
        subtitle="Manage your profile and preferences"
        variant="settings"
        icon={<Settings className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        {validationError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{validationError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="console-panel border-status-active/50 bg-status-active/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-active" />
            <AlertDescription className="text-xs text-status-active">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription className="text-xs">Your operator details stored on-chain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="callsign" className="text-xs">
                Callsign *
              </Label>
              <Input
                id="callsign"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="e.g., KO4RXE"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dmrId" className="text-xs">
                  DMR ID
                </Label>
                <Input
                  id="dmrId"
                  value={dmrId}
                  onChange={(e) => setDmrId(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 3123456"
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssid" className="text-xs">
                  SSID
                </Label>
                <Input
                  id="ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 1"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="license"
                checked={licenseAcknowledgement}
                onCheckedChange={setLicenseAcknowledgement}
              />
              <Label htmlFor="license" className="text-xs">
                I hold a valid amateur radio license *
              </Label>
            </div>

            <Button onClick={handleSave} disabled={saveProfileMutation.isPending} className="w-full text-xs">
              <Save className="mr-2 h-3.5 w-3.5" />
              {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Login Preferences</CardTitle>
            <CardDescription className="text-xs">Control session persistence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="remember-login" className="text-xs font-medium">
                  Remember my login on this device
                </Label>
                <p className="text-xs text-muted-foreground">
                  Keep you logged in between sessions
                </p>
              </div>
              <Switch
                id="remember-login"
                checked={rememberLogin}
                onCheckedChange={setRememberLogin}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Audio Clip Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Configure HTTP endpoints for non-real-time audio clip upload and playback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-url" className="text-xs">
                Upload Endpoint URL
              </Label>
              <Input
                id="upload-url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://your-server.com/api/upload"
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground">
                HTTP endpoint to upload recorded audio clips (POST with multipart/form-data)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="received-url" className="text-xs">
                Received Clips Endpoint URL
              </Label>
              <Input
                id="received-url"
                value={receivedClipsUrl}
                onChange={(e) => setReceivedClipsUrl(e.target.value)}
                placeholder="https://your-server.com/api/clips"
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground">
                HTTP endpoint to fetch list of received audio clips (GET returning JSON array)
              </p>
            </div>

            <Button onClick={handleSaveClipConfig} className="w-full text-xs">
              <Save className="mr-2 h-3.5 w-3.5" />
              Save Audio Clip Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Server Directory Sources
            </CardTitle>
            <CardDescription className="text-xs">
              Configure GitHub raw URLs for BrandMeister and AllStar server lists
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                These URLs point to GitHub raw files containing server lists. The app caches data locally and continues working if refresh fails.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="bm-source" className="text-xs">
                BrandMeister Source URL
              </Label>
              <Input
                id="bm-source"
                value={bmSourceUrl}
                onChange={(e) => setBmSourceUrl(e.target.value)}
                placeholder="GitHub raw URL"
                className="text-xs"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated: {formatTimestamp(bmMetadata?.lastUpdated || null)}</span>
                <span>Cache age: {formatCacheAge('brandmeister')}</span>
              </div>
              {bmMetadata?.lastError && (
                <p className="text-xs text-destructive">Last error: {bmMetadata.lastError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allstar-source" className="text-xs">
                AllStar Source URL
              </Label>
              <Input
                id="allstar-source"
                value={allstarSourceUrl}
                onChange={(e) => setAllstarSourceUrl(e.target.value)}
                placeholder="GitHub raw URL"
                className="text-xs"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated: {formatTimestamp(allstarMetadata?.lastUpdated || null)}</span>
                <span>Cache age: {formatCacheAge('allstar')}</span>
              </div>
              {allstarMetadata?.lastError && (
                <p className="text-xs text-destructive">Last error: {allstarMetadata.lastError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveSources}
                disabled={updateSourcesMutation.isPending}
                variant="outline"
                className="flex-1 text-xs"
              >
                <Save className="mr-2 h-3.5 w-3.5" />
                Save Sources
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRefreshBrandmeister}
                disabled={refreshBrandmeisterMutation.isPending}
                variant="outline"
                className="flex-1 text-xs"
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshBrandmeisterMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh BrandMeister
              </Button>
              <Button
                onClick={handleRefreshAllstar}
                disabled={refreshAllstarMutation.isPending}
                variant="outline"
                className="flex-1 text-xs"
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshAllstarMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh AllStar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
