import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import IaxDvswitchConnectForm from '../components/IaxDvswitchConnectForm';
import IaxDvswitchSavedConfigurationTab from '../components/IaxDvswitchSavedConfigurationTab';
import DigitalVoiceConnectForm from '../components/DigitalVoiceConnectForm';
import DigitalVoiceSavedConfigurationTab from '../components/DigitalVoiceSavedConfigurationTab';
import { useNavigate } from '@tanstack/react-router';
import { Server, WifiOff, Info, Bookmark, Zap } from 'lucide-react';
import { loadConnection, clearConnection, isIaxDvswitchConnection, isDigitalVoiceConnection } from '../hooks/usePreferredConnection';
import { useState, useEffect } from 'react';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('connect');
  const [connectionType, setConnectionType] = useState<'iax' | 'digital-voice'>('iax');
  const [preset, setPreset] = useState<'brandmeister-dmr' | 'allstar' | null>(null);

  useEffect(() => {
    const connection = loadConnection();
    const hasSavedConnection = connection !== null && (isIaxDvswitchConnection(connection) || isDigitalVoiceConnection(connection));
    setHasConnection(hasSavedConnection);
    
    // Determine connection type
    if (connection && isDigitalVoiceConnection(connection)) {
      setConnectionType('digital-voice');
    } else {
      setConnectionType('iax');
    }
    
    // Default to Saved tab if connection exists, otherwise Connect tab
    setActiveTab(hasSavedConnection ? 'saved' : 'connect');
  }, []);

  const handleDisconnect = () => {
    clearConnection();
    setHasConnection(false);
    // Switch to connect tab after disconnect
    setActiveTab('connect');
  };

  const handleSaved = () => {
    setHasConnection(true);
    // Switch to Saved tab after saving
    setActiveTab('saved');
  };

  const handleEditFromSaved = () => {
    setActiveTab('connect');
  };

  const handleGoToPttFromSaved = () => {
    navigate({ to: '/ptt' });
  };

  const handleConnectionTypeChange = (type: 'iax' | 'digital-voice') => {
    setConnectionType(type);
    setPreset(null); // Clear preset when manually switching tabs
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

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <ColorPageHeader
        title="Connection Settings"
        subtitle="Configure your radio connection to start transmitting."
        variant="connect"
        icon={<Server className="h-8 w-8" />}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Choose your connection type:</strong> Use <strong>IAX / DVSwitch</strong> for AllStar and similar networks, or <strong>Digital Voice</strong> for DMR, D-Star, YSF, P25, NXDN, and M17 modes. Your saved configuration persists on this device until you disconnect or clear it. This does not affect your Internet Identity login.
          </AlertDescription>
        </Alert>

        {/* Quick Setup Panel */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              Quick Setup
            </CardTitle>
            <CardDescription>
              One-click presets for popular networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleBrandmeisterQuickSetup}
                variant="outline"
                size="lg"
                className="h-auto flex-col gap-2 py-4"
              >
                <Server className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">BrandMeister</div>
                  <div className="text-xs text-muted-foreground">DMR Network</div>
                </div>
              </Button>
              <Button
                onClick={handleAllstarQuickSetup}
                variant="outline"
                size="lg"
                className="h-auto flex-col gap-2 py-4"
              >
                <Server className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">AllStar</div>
                  <div className="text-xs text-muted-foreground">IAX / DVSwitch</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <ColorAccentPanel variant="info">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 gap-1">
              <TabsTrigger value="saved" className="flex items-center gap-2 text-xs sm:text-sm">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
                <span className="sm:hidden">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="connect" className="flex items-center gap-2 text-xs sm:text-sm">
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">Connect</span>
                <span className="sm:hidden">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="disconnect" className="flex items-center gap-2 text-xs sm:text-sm">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
                <span className="sm:hidden">Clear</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-4">
              <Tabs value={connectionType} onValueChange={(v) => handleConnectionTypeChange(v as 'iax' | 'digital-voice')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="iax">IAX / DVSwitch</TabsTrigger>
                  <TabsTrigger value="digital-voice">Digital Voice</TabsTrigger>
                </TabsList>

                <TabsContent value="iax" className="mt-6">
                  <IaxDvswitchSavedConfigurationTab
                    onEdit={handleEditFromSaved}
                    onGoToPtt={handleGoToPttFromSaved}
                  />
                </TabsContent>

                <TabsContent value="digital-voice" className="mt-6">
                  <DigitalVoiceSavedConfigurationTab
                    onEdit={handleEditFromSaved}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="connect" className="space-y-4">
              <Tabs value={connectionType} onValueChange={(v) => handleConnectionTypeChange(v as 'iax' | 'digital-voice')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="iax">IAX / DVSwitch</TabsTrigger>
                  <TabsTrigger value="digital-voice">Digital Voice</TabsTrigger>
                </TabsList>

                <TabsContent value="iax" className="mt-6">
                  <IaxDvswitchConnectForm onSaved={handleSaved} preset={preset} onPresetApplied={() => setPreset(null)} />
                </TabsContent>

                <TabsContent value="digital-voice" className="mt-6">
                  <DigitalVoiceConnectForm onSaved={handleSaved} preset={preset} onPresetApplied={() => setPreset(null)} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="disconnect" className="space-y-4">
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WifiOff className="h-5 w-5" />
                    Disconnect & Clear
                  </CardTitle>
                  <CardDescription>
                    Clear your saved connection settings from this device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasConnection ? (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This will remove your saved connection configuration from this device. You'll need to reconfigure your connection to use PTT again. Your Internet Identity login and profile data will not be affected.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleDisconnect}
                        variant="destructive"
                        size="lg"
                        className="w-full"
                      >
                        <WifiOff className="mr-2 h-4 w-4" />
                        Clear Saved Connection
                      </Button>
                    </>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No saved connection found. Use the Connect tab to configure a new connection.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ColorAccentPanel>
      </div>
    </div>
  );
}
