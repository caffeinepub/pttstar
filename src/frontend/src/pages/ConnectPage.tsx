import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import IaxDvswitchConnectForm from '../components/IaxDvswitchConnectForm';
import IaxDvswitchSavedConfigurationTab from '../components/IaxDvswitchSavedConfigurationTab';
import DigitalVoiceConnectForm from '../components/DigitalVoiceConnectForm';
import DigitalVoiceSavedConfigurationTab from '../components/DigitalVoiceSavedConfigurationTab';
import AutoGatewayStatusIndicator from '../components/AutoGatewayStatusIndicator';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Server, WifiOff, Info, Zap, ExternalLink, AlertCircle } from 'lucide-react';
import { loadConnection, clearConnection, isIaxDvswitchConnection, isDigitalVoiceConnection } from '../hooks/usePreferredConnection';
import { useState, useEffect } from 'react';
import ColorPageHeader from '../components/ColorPageHeader';
import { getInferredPreset, hasAutoFlowBeenAttempted, markAutoFlowAttempted } from '../utils/gatewayUrlBootstrap';
import { getCacheAge } from '../utils/serverDirectoryCache';

export default function ConnectPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { preset?: string };
  const [hasConnection, setHasConnection] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('connect');
  const [connectionType, setConnectionType] = useState<'iax' | 'digital-voice'>('iax');
  const [preset, setPreset] = useState<'brandmeister-dmr' | 'allstar' | null>(null);

  useEffect(() => {
    const connection = loadConnection();
    const hasSavedConnection = connection !== null && (isIaxDvswitchConnection(connection) || isDigitalVoiceConnection(connection));
    setHasConnection(hasSavedConnection);
    
    if (connection && isDigitalVoiceConnection(connection)) {
      setConnectionType('digital-voice');
    } else {
      setConnectionType('iax');
    }
    
    if (search.preset === 'brandmeister-dmr' && !hasSavedConnection) {
      setActiveTab('connect');
      setConnectionType('digital-voice');
      setPreset('brandmeister-dmr');
      navigate({ to: '/connect', replace: true });
    } else if (!hasSavedConnection && !hasAutoFlowBeenAttempted()) {
      const inferredPreset = getInferredPreset();
      if (inferredPreset) {
        console.log('ConnectPage: Auto-applying inferred preset:', inferredPreset);
        setActiveTab('connect');
        
        if (inferredPreset === 'brandmeister-dmr') {
          setConnectionType('digital-voice');
          setPreset('brandmeister-dmr');
        } else if (inferredPreset === 'allstar') {
          setConnectionType('iax');
          setPreset('allstar');
        }
        
        markAutoFlowAttempted();
      }
    } else {
      setActiveTab(hasSavedConnection ? 'saved' : 'connect');
    }
  }, [search.preset, navigate]);

  const handleDisconnect = () => {
    clearConnection();
    setHasConnection(false);
    setActiveTab('connect');
  };

  const handleSaved = () => {
    setHasConnection(true);
    setActiveTab('saved');
  };

  const handleEditFromSaved = () => {
    setActiveTab('connect');
  };

  const handleConnectionTypeChange = (type: 'iax' | 'digital-voice') => {
    setConnectionType(type);
    setPreset(null);
  };

  const handleBrandmeisterQuickSetup = () => {
    setActiveTab('connect');
    setConnectionType('digital-voice');
    setPreset('brandmeister-dmr');
  };

  const handleAllstarQuickSetup = () => {
    setActiveTab('connect');
    setConnectionType('iax');
    setPreset('allstar');
  };

  const bmCacheAge = getCacheAge('brandmeister');
  const allstarCacheAge = getCacheAge('allstar');
  const showStaleWarning = (bmCacheAge && bmCacheAge > 7 * 24 * 60 * 60 * 1000) || 
                           (allstarCacheAge && allstarCacheAge > 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <ColorPageHeader
        title="Connection Settings"
        subtitle="Configure your radio connection to start transmitting"
        variant="connect"
        icon={<Server className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        {/* Quick Setup Panel */}
        <Card className="console-panel border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Quick Setup</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Get started quickly with recommended configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                onClick={handleBrandmeisterQuickSetup}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <Server className="mr-2 h-3.5 w-3.5" />
                BrandMeister DMR
              </Button>
              <Button
                onClick={handleAllstarQuickSetup}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <Server className="mr-2 h-3.5 w-3.5" />
                AllStar Network
              </Button>
            </div>
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                <strong>New to DMR?</strong> BrandMeister is recommended for DMR use.{' '}
                <a
                  href="https://brandmeister.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-foreground underline hover:text-accent-foreground"
                >
                  Sign up at brandmeister.network
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Stale Cache Warning */}
        {showStaleWarning && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              <strong>Server lists may be outdated.</strong> Visit Settings to refresh BrandMeister and AllStar server directories from GitHub.
            </AlertDescription>
          </Alert>
        )}

        {/* Auto Gateway Status */}
        <AutoGatewayStatusIndicator />

        {/* Main Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect" className="text-xs">Configure</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                <strong>Choose your connection type:</strong> Use <strong>IAX / DVSwitch</strong> for AllStar and similar networks, or <strong>Digital Voice</strong> for DMR, D-Star, YSF, P25, NXDN, and M17 modes.
              </AlertDescription>
            </Alert>

            <Tabs value={connectionType} onValueChange={(v) => handleConnectionTypeChange(v as 'iax' | 'digital-voice')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="iax" className="text-xs">IAX / DVSwitch</TabsTrigger>
                <TabsTrigger value="digital-voice" className="text-xs">Digital Voice</TabsTrigger>
              </TabsList>

              <TabsContent value="iax" className="mt-4">
                <IaxDvswitchConnectForm
                  onSaved={handleSaved}
                  preset={preset === 'allstar' ? 'allstar' : null}
                  onPresetApplied={() => setPreset(null)}
                />
              </TabsContent>

              <TabsContent value="digital-voice" className="mt-4">
                <DigitalVoiceConnectForm
                  onSaved={handleSaved}
                  preset={preset === 'brandmeister-dmr' ? 'brandmeister-dmr' : null}
                  onPresetApplied={() => setPreset(null)}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {hasConnection ? (
              <>
                {connectionType === 'iax' ? (
                  <IaxDvswitchSavedConfigurationTab onEdit={handleEditFromSaved} />
                ) : (
                  <DigitalVoiceSavedConfigurationTab onEdit={handleEditFromSaved} />
                )}
                <Card className="console-panel border-destructive/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <WifiOff className="h-4 w-4 text-destructive" />
                      <CardTitle className="text-base">Disconnect</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Clear your saved connection settings from this device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleDisconnect}
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <WifiOff className="mr-2 h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert className="console-panel">
                <Info className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">
                  No saved connection found. Use the Configure tab to set up your connection.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
