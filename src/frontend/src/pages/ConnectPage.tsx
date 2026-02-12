import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, Wifi, AlertCircle, Zap, ExternalLink } from 'lucide-react';
import ColorPageHeader from '../components/ColorPageHeader';
import IaxDvswitchConnectForm from '../components/IaxDvswitchConnectForm';
import IaxDvswitchSavedConfigurationTab from '../components/IaxDvswitchSavedConfigurationTab';
import DigitalVoiceConnectForm from '../components/DigitalVoiceConnectForm';
import DigitalVoiceSavedConfigurationTab from '../components/DigitalVoiceSavedConfigurationTab';
import AutoGatewayStatusIndicator from '../components/AutoGatewayStatusIndicator';
import { loadConnection, isIaxDvswitchConnection, isDigitalVoiceConnection } from '../hooks/usePreferredConnection';
import { getInferredPreset, clearAutoFlowAttempted } from '../utils/gatewayUrlBootstrap';
import type { PresetId } from '../utils/connectionPresets';

export default function ConnectPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { preset?: PresetId };
  
  const [activeTab, setActiveTab] = useState<'iax-dvswitch' | 'digital-voice'>('digital-voice');
  const [presetForChild, setPresetForChild] = useState<PresetId | null>(null);

  // Determine if we have a saved connection and its type
  const savedConnection = loadConnection();
  const hasIaxConnection = savedConnection && isIaxDvswitchConnection(savedConnection);
  const hasDigitalVoiceConnection = savedConnection && isDigitalVoiceConnection(savedConnection);

  // On first mount, check for URL preset or inferred preset
  useEffect(() => {
    const urlPreset = search.preset;
    const inferredPreset = getInferredPreset();
    const effectivePreset = urlPreset || inferredPreset;

    if (effectivePreset) {
      console.log('ConnectPage: Detected preset:', effectivePreset, { urlPreset, inferredPreset });
      
      // Set the appropriate tab based on preset
      if (effectivePreset === 'allstar') {
        setActiveTab('iax-dvswitch');
      } else if (effectivePreset === 'brandmeister-dmr' || effectivePreset === 'tgif-dmr') {
        setActiveTab('digital-voice');
      }
      
      // Pass preset to child form
      setPresetForChild(effectivePreset);
    } else if (hasIaxConnection) {
      setActiveTab('iax-dvswitch');
    } else if (hasDigitalVoiceConnection) {
      setActiveTab('digital-voice');
    }
  }, []);

  const handleQuickSetupPreset = (preset: PresetId) => {
    console.log('ConnectPage: Quick Setup preset selected:', preset);
    
    // Clear any auto-flow state to let manual preset take precedence
    clearAutoFlowAttempted();
    
    // Set the appropriate tab
    if (preset === 'allstar') {
      setActiveTab('iax-dvswitch');
    } else {
      setActiveTab('digital-voice');
    }
    
    // Pass preset to child
    setPresetForChild(preset);
  };

  const handlePresetApplied = () => {
    console.log('ConnectPage: Preset applied by child, clearing preset state');
    setPresetForChild(null);
  };

  const showStaleWarning = savedConnection !== null;

  return (
    <div className="min-h-screen bg-background">
      <ColorPageHeader 
        variant="connect" 
        title="Connect" 
        subtitle="Configure your radio connection settings"
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Auto Gateway Status */}
        <AutoGatewayStatusIndicator />

        {/* Quick Setup Panel */}
        <Card className="console-panel border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Quick Setup</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Choose a preset to get started quickly with popular networks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSetupPreset('brandmeister-dmr')}
                className="justify-start text-xs h-auto py-3"
              >
                <Radio className="mr-2 h-3.5 w-3.5 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">BrandMeister DMR</div>
                  <div className="text-xs text-muted-foreground">Popular DMR network</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSetupPreset('tgif-dmr')}
                className="justify-start text-xs h-auto py-3"
              >
                <Radio className="mr-2 h-3.5 w-3.5 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">TGIF DMR</div>
                  <div className="text-xs text-muted-foreground">Alternative DMR network</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSetupPreset('allstar')}
                className="justify-start text-xs h-auto py-3"
              >
                <Wifi className="mr-2 h-3.5 w-3.5 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">AllStar</div>
                  <div className="text-xs text-muted-foreground">IAX/DVSwitch network</div>
                </div>
              </Button>
            </div>

            {/* BrandMeister Onboarding Callout */}
            <Alert className="console-panel border-primary/30">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                <strong>New to BrandMeister?</strong> You'll need a free account.{' '}
                <a
                  href="https://brandmeister.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Create one here
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Stale Cache Warning */}
        {showStaleWarning && (
          <Alert className="console-panel border-warning/50">
            <AlertCircle className="h-3.5 w-3.5 text-warning" />
            <AlertDescription className="text-xs">
              You have a saved configuration. Changing settings here will update your saved connection.
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Type Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="digital-voice" className="text-xs">
              <Radio className="mr-2 h-3.5 w-3.5" />
              Digital Voice
            </TabsTrigger>
            <TabsTrigger value="iax-dvswitch" className="text-xs">
              <Wifi className="mr-2 h-3.5 w-3.5" />
              IAX / DVSwitch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="digital-voice" className="space-y-4 mt-4">
            <Tabs defaultValue={hasDigitalVoiceConnection ? 'saved' : 'configure'}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configure" className="text-xs">Configure</TabsTrigger>
                <TabsTrigger value="saved" className="text-xs" disabled={!hasDigitalVoiceConnection}>
                  Saved Configuration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="configure" className="mt-4">
                <DigitalVoiceConnectForm 
                  preset={presetForChild}
                  onPresetApplied={handlePresetApplied}
                />
              </TabsContent>
              <TabsContent value="saved" className="mt-4">
                {hasDigitalVoiceConnection && <DigitalVoiceSavedConfigurationTab />}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="iax-dvswitch" className="space-y-4 mt-4">
            <Tabs defaultValue={hasIaxConnection ? 'saved' : 'configure'}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configure" className="text-xs">Configure</TabsTrigger>
                <TabsTrigger value="saved" className="text-xs" disabled={!hasIaxConnection}>
                  Saved Configuration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="configure" className="mt-4">
                <IaxDvswitchConnectForm 
                  preset={presetForChild}
                  onPresetApplied={handlePresetApplied}
                />
              </TabsContent>
              <TabsContent value="saved" className="mt-4">
                {hasIaxConnection && <IaxDvswitchSavedConfigurationTab />}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
