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
              <Label htmlFor="callsign" className="text-xs">Callsign <span className="text-destructive">*</span></Label>
              <Input
                id="callsign"
                placeholder="e.g., KO4RXE"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                className="text-xs font-mono uppercase"
              />
              <p className="text-[10px] text-muted-foreground">
                Your amateur radio callsign. Format: letters and numbers only (e.g., KO4RXE, W1AW).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dmrId" className="text-xs">DMR ID (Optional)</Label>
              <Input
                id="dmrId"
                type="number"
                placeholder="e.g., 3123456"
                value={dmrId}
                onChange={(e) => setDmrId(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Your DMR ID from radioid.net. Required for DMR networks.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssid" className="text-xs">SSID (Optional)</Label>
              <Input
                id="ssid"
                type="number"
                placeholder="e.g., 1"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Your SSID (typically 1-15). Used with DMR ID for network identification.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="license"
                checked={licenseAcknowledgement}
                onCheckedChange={setLicenseAcknowledgement}
              />
              <Label htmlFor="license" className="text-xs cursor-pointer">
                I hold a valid amateur radio license <span className="text-destructive">*</span>
              </Label>
            </div>

            <Button
              onClick={handleSave}
              disabled={saveProfileMutation.isPending}
              className="w-full text-xs"
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Login Preferences</CardTitle>
            <CardDescription className="text-xs">Control how your login session is managed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="remember-login" className="text-xs">Remember my login on this device</Label>
                <p className="text-[10px] text-muted-foreground">
                  Stay logged in between sessions
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
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <CardTitle className="text-base">Server Directory Sources</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configure GitHub raw URLs for BrandMeister and AllStar server lists. 
              These lists are cached locally and can be manually refreshed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                <strong>DroidStar-style behavior:</strong> Server lists are fetched from GitHub and cached locally. 
                If a refresh fails, the app continues using cached data or built-in defaults. 
                Default source URLs are shown below when no custom overrides exist.
              </AlertDescription>
            </Alert>

            {/* BrandMeister Section */}
            <div className="space-y-3 rounded-md border border-border/50 p-3">
              <div className="space-y-2">
                <Label htmlFor="bm-source" className="text-xs font-semibold">BrandMeister Source URL</Label>
                <Input
                  id="bm-source"
                  placeholder="GitHub raw URL for BrandMeister servers"
                  value={bmSourceUrl}
                  onChange={(e) => setBmSourceUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Default: https://raw.githubusercontent.com/brandmeister/brandmeister-hosts/master/BM_Hosts.txt
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="console-label">Last updated:</span>
                  <span className="console-value ml-1">{formatTimestamp(bmMetadata?.lastUpdated || null)}</span>
                </div>
                <div>
                  <span className="console-label">Cache age:</span>
                  <span className="console-value ml-1">{formatCacheAge('brandmeister')}</span>
                </div>
              </div>

              {bmMetadata?.lastError && (
                <Alert variant="destructive" className="console-panel">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-[10px]">
                    Last fetch error: {bmMetadata.lastError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRefreshBrandmeister}
                disabled={refreshBrandmeisterMutation.isPending}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${refreshBrandmeisterMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshBrandmeisterMutation.isPending ? 'Refreshing...' : 'Refresh BrandMeister List'}
              </Button>
            </div>

            {/* AllStar Section */}
            <div className="space-y-3 rounded-md border border-border/50 p-3">
              <div className="space-y-2">
                <Label htmlFor="allstar-source" className="text-xs font-semibold">AllStar Source URL</Label>
                <Input
                  id="allstar-source"
                  placeholder="GitHub raw URL for AllStar servers"
                  value={allstarSourceUrl}
                  onChange={(e) => setAllstarSourceUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Default: https://raw.githubusercontent.com/AllStarLink/ASL-Nodes-Diff/main/asl-nodes.txt
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="console-label">Last updated:</span>
                  <span className="console-value ml-1">{formatTimestamp(allstarMetadata?.lastUpdated || null)}</span>
                </div>
                <div>
                  <span className="console-label">Cache age:</span>
                  <span className="console-value ml-1">{formatCacheAge('allstar')}</span>
                </div>
              </div>

              {allstarMetadata?.lastError && (
                <Alert variant="destructive" className="console-panel">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-[10px]">
                    Last fetch error: {allstarMetadata.lastError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRefreshAllstar}
                disabled={refreshAllstarMutation.isPending}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${refreshAllstarMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshAllstarMutation.isPending ? 'Refreshing...' : 'Refresh AllStar List'}
              </Button>
            </div>

            <Button
              onClick={handleSaveSources}
              disabled={updateSourcesMutation.isPending}
              className="w-full text-xs"
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              {updateSourcesMutation.isPending ? 'Saving...' : 'Save Source URLs'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
