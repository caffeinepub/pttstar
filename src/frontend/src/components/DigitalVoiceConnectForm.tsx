import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Radio, Save, Info, AlertCircle, ChevronDown } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useGetBuiltinNetworks } from '../hooks/useNetworks';
import { useBrandmeisterServers } from '../hooks/useServerDirectories';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection, loadConnection, isDigitalVoiceConnection, areBrandmeisterRequiredFieldsSatisfied, areTgifRequiredFieldsSatisfied } from '../hooks/usePreferredConnection';
import type { PersistentNetwork } from '../backend';
import { getPersistedGatewayParameter } from '../utils/gatewayUrlBootstrap';
import { normalizeServerAddress } from '../utils/serverAddress';
import type { PresetId } from '../utils/connectionPresets';

interface DigitalVoiceConnectFormProps {
  onSaved?: () => void;
  preset?: PresetId | null;
  onPresetApplied?: () => void;
}

const AUTO_SAVE_ATTEMPTED_KEY = 'pttstar_dv_auto_save_attempted';

export default function DigitalVoiceConnectForm({ onSaved, preset, onPresetApplied }: DigitalVoiceConnectFormProps) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: builtinNetworks = [] } = useGetBuiltinNetworks();
  const { data: fetchedBmServers = [], isLoading: bmServersLoading } = useBrandmeisterServers();

  const [activeMode, setActiveMode] = useState<string>('dmr');
  const [selectedReflector, setSelectedReflector] = useState<string>('');
  const [talkgroup, setTalkgroup] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  // BrandMeister credentials
  const [bmUsername, setBmUsername] = useState('');
  const [bmPassword, setBmPassword] = useState('');
  
  // BrandMeister server selection
  const [selectedBmServer, setSelectedBmServer] = useState<string>('');
  
  // DMR ID and SSID from profile
  const [dmrId, setDmrId] = useState('');
  const [ssid, setSsid] = useState('');

  // Digital Voice Gateway configuration
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [gatewayToken, setGatewayToken] = useState('');
  const [gatewayRoom, setGatewayRoom] = useState('');
  const [gatewayUsername, setGatewayUsername] = useState('');

  // TGIF hotspot security password
  const [tgifHotspotSecurityPassword, setTgifHotspotSecurityPassword] = useState('');

  // Track if preset was applied internally
  const [appliedPreset, setAppliedPreset] = useState<PresetId | null>(null);

  // Track if user has edited the form during this session
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Advanced section state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Merge builtin and fetched BrandMeister servers
  const allBmServers = [
    ...builtinNetworks.filter(n => n.networkLabel.toLowerCase().includes('brandmeister')),
    ...fetchedBmServers.map(s => ({
      networkType: 'dmr' as const,
      networkLabel: s.label,
      address: s.address,
      talkgroups: [],
    })),
  ];

  // Load saved configuration on mount
  useEffect(() => {
    const connection = loadConnection();
    if (connection && isDigitalVoiceConnection(connection)) {
      setActiveMode(connection.mode);
      setSelectedReflector(connection.reflector);
      setTalkgroup(connection.talkgroup || '');
      setBmUsername(connection.bmUsername || '');
      setBmPassword(connection.bmPassword || '');
      setDmrId(connection.dmrId || '');
      setSsid(connection.ssid || '');
      setSelectedBmServer(connection.bmServerAddress || '');
      setGatewayUrl(connection.gatewayUrl || '');
      setGatewayToken(connection.gatewayToken || '');
      setGatewayRoom(connection.gatewayRoom || '');
      setGatewayUsername(connection.gatewayUsername || '');
      setTgifHotspotSecurityPassword(connection.tgifHotspotSecurityPassword || '');
      setHasUserEdited(true); // Existing connection means user has edited
    } else {
      // No saved connection, try to prefill from URL parameters
      const urlGatewayUrl = getPersistedGatewayParameter('gatewayUrl');
      const urlGatewayToken = getPersistedGatewayParameter('gatewayToken');
      const urlGatewayRoom = getPersistedGatewayParameter('gatewayRoom');
      const urlGatewayUsername = getPersistedGatewayParameter('gatewayUsername');
      const urlServer = getPersistedGatewayParameter('server');

      if (urlGatewayUrl && !gatewayUrl) {
        console.log('DigitalVoiceConnectForm: Prefilling gatewayUrl from URL parameter:', urlGatewayUrl);
        setGatewayUrl(urlGatewayUrl);
      }
      if (urlGatewayToken && !gatewayToken) {
        console.log('DigitalVoiceConnectForm: Prefilling gatewayToken from URL parameter');
        setGatewayToken(urlGatewayToken);
      }
      if (urlGatewayRoom && !gatewayRoom) {
        console.log('DigitalVoiceConnectForm: Prefilling gatewayRoom from URL parameter:', urlGatewayRoom);
        setGatewayRoom(urlGatewayRoom);
      }
      if (urlGatewayUsername && !gatewayUsername) {
        console.log('DigitalVoiceConnectForm: Prefilling gatewayUsername from URL parameter:', urlGatewayUsername);
        setGatewayUsername(urlGatewayUsername);
      }
      if (urlServer && !selectedBmServer) {
        console.log('DigitalVoiceConnectForm: Prefilling BrandMeister server from URL parameter:', urlServer);
        setSelectedBmServer(normalizeServerAddress(urlServer));
      }
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setDmrId(userProfile.dmrId?.toString() || '');
      setSsid(userProfile.ssid?.toString() || '');
      if (!gatewayUsername) {
        setGatewayUsername(userProfile.callsign || '');
      }
    }
  }, [userProfile]);

  // Apply preset - only if no existing connection and user hasn't edited
  useEffect(() => {
    if (!preset || !onPresetApplied) return;
    if (appliedPreset === preset) return; // Already applied this preset

    const connection = loadConnection();
    const hasExistingConnection = connection && isDigitalVoiceConnection(connection);
    
    if (hasExistingConnection || hasUserEdited) {
      console.log('DigitalVoiceConnectForm: Skipping preset application (existing connection or user has edited)');
      onPresetApplied();
      return;
    }

    console.log('DigitalVoiceConnectForm: Applying preset:', preset);
    setActiveMode('dmr');
    
    if (preset === 'brandmeister-dmr') {
      // Auto-select BrandMeister United States server
      if (!selectedBmServer && allBmServers.length > 0) {
        const usNetwork = allBmServers.find(n => n.networkLabel === 'BrandMeister United States');
        const selectedNetwork = usNetwork || allBmServers[0];
        
        console.log('DigitalVoiceConnectForm: Auto-selected BrandMeister network:', selectedNetwork.networkLabel);
        setSelectedBmServer(normalizeServerAddress(selectedNetwork.address));
        setSelectedReflector(selectedNetwork.networkLabel);
      }
    } else if (preset === 'tgif-dmr') {
      // Set TGIF as reflector label
      setSelectedReflector('TGIF DMR Network');
      
      // Check if URL has TGIF server
      const urlServer = getPersistedGatewayParameter('server');
      if (urlServer && urlServer.toLowerCase().includes('tgif')) {
        console.log('DigitalVoiceConnectForm: Using TGIF server from URL:', urlServer);
        setSelectedBmServer(normalizeServerAddress(urlServer));
      }
    }
    
    setAppliedPreset(preset);
    onPresetApplied();
  }, [preset, onPresetApplied, allBmServers, selectedBmServer, appliedPreset, hasUserEdited]);

  // Auto-save and navigate when preset required fields are complete
  useEffect(() => {
    if (!appliedPreset) return;
    
    const autoSaveAttempted = sessionStorage.getItem(AUTO_SAVE_ATTEMPTED_KEY) === 'true';
    if (autoSaveAttempted) return;
    
    const tempConnection = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup,
      bmUsername,
      bmPassword,
      dmrId,
      ssid,
      bmServerAddress: selectedBmServer,
      gatewayUrl,
      gatewayToken,
      gatewayRoom,
      gatewayUsername,
      tgifHotspotSecurityPassword,
    };

    let requiredFieldsSatisfied = false;
    
    if (appliedPreset === 'brandmeister-dmr') {
      requiredFieldsSatisfied = areBrandmeisterRequiredFieldsSatisfied(tempConnection);
    } else if (appliedPreset === 'tgif-dmr') {
      requiredFieldsSatisfied = areTgifRequiredFieldsSatisfied(tempConnection);
    }

    if (requiredFieldsSatisfied) {
      console.log('DigitalVoiceConnectForm: Preset required fields satisfied, auto-saving and navigating to PTT');
      sessionStorage.setItem(AUTO_SAVE_ATTEMPTED_KEY, 'true');
      handleSave();
    }
  }, [appliedPreset, activeMode, selectedReflector, talkgroup, bmUsername, bmPassword, dmrId, ssid, selectedBmServer, gatewayUrl, gatewayToken, gatewayRoom, gatewayUsername, tgifHotspotSecurityPassword]);

  // Track user edits
  const handleUserEdit = () => {
    if (!hasUserEdited) {
      console.log('DigitalVoiceConnectForm: User has started editing');
      setHasUserEdited(true);
    }
  };

  const handleSave = () => {
    setValidationError('');

    if (!selectedReflector) {
      setValidationError('Network/Reflector is required');
      return;
    }

    // Validate TGIF-specific requirements
    if (selectedReflector.toLowerCase().includes('tgif') && !tgifHotspotSecurityPassword) {
      setValidationError('TGIF Hotspot Security Password is required for TGIF networks');
      return;
    }

    const connection = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup,
      bmUsername,
      bmPassword,
      dmrId,
      ssid,
      bmServerAddress: selectedBmServer ? normalizeServerAddress(selectedBmServer) : undefined,
      bmServerLabel: selectedReflector,
      gatewayUrl: gatewayUrl ? normalizeServerAddress(gatewayUrl) : undefined,
      gatewayToken: gatewayToken || undefined,
      gatewayRoom: gatewayRoom || undefined,
      gatewayUsername: gatewayUsername || undefined,
      tgifHotspotSecurityPassword: tgifHotspotSecurityPassword || undefined,
    };

    saveConnection(connection);
    onSaved?.();
    navigate({ to: '/ptt' });
  };

  const handleNetworkChange = (address: string) => {
    const network = allBmServers.find(n => normalizeServerAddress(n.address) === normalizeServerAddress(address));
    if (network) {
      setSelectedBmServer(normalizeServerAddress(network.address));
      setSelectedReflector(network.networkLabel);
      handleUserEdit();
    }
  };

  // Get display label for current server
  const serverDisplayLabel = allBmServers.find(s => 
    normalizeServerAddress(s.address) === normalizeServerAddress(selectedBmServer)
  )?.networkLabel || selectedReflector || 'No server selected';

  const isTgifNetwork = selectedReflector.toLowerCase().includes('tgif');

  return (
    <Card className="console-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          <CardTitle className="text-base">Digital Voice Configuration</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure DMR, D-Star, YSF, P25, NXDN, or M17 connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{validationError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeMode} onValueChange={(v) => { setActiveMode(v); handleUserEdit(); }}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dmr" className="text-xs">DMR</TabsTrigger>
            <TabsTrigger value="dstar" className="text-xs">D-Star</TabsTrigger>
            <TabsTrigger value="ysf" className="text-xs">YSF</TabsTrigger>
            <TabsTrigger value="p25" className="text-xs">P25</TabsTrigger>
            <TabsTrigger value="nxdn" className="text-xs">NXDN</TabsTrigger>
            <TabsTrigger value="m17" className="text-xs">M17</TabsTrigger>
          </TabsList>

          <TabsContent value="dmr" className="space-y-4 mt-4">
            {/* Server display (non-editable in basic view) */}
            <div className="space-y-2">
              <Label className="text-xs">DMR Network</Label>
              <div className="console-panel p-3 rounded-md border border-border">
                <p className="text-xs font-mono">{serverDisplayLabel}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Connected to {serverDisplayLabel}. Change network in Advanced Settings below.
              </p>
            </div>

            {isTgifNetwork && (
              <Alert className="console-panel border-primary/30">
                <Info className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">
                  <strong>TGIF Network:</strong> You must provide your TGIF Hotspot Security Password below to connect.
                </AlertDescription>
              </Alert>
            )}

            {isTgifNetwork && (
              <div className="space-y-2">
                <Label htmlFor="tgifPassword" className="text-xs">
                  TGIF Hotspot Security Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tgifPassword"
                  type="password"
                  placeholder="Your TGIF hotspot security password"
                  value={tgifHotspotSecurityPassword}
                  onChange={(e) => { setTgifHotspotSecurityPassword(e.target.value); handleUserEdit(); }}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Find this in your TGIF account settings at tgif.network
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="talkgroup" className="text-xs">Talkgroup (Optional)</Label>
              <Input
                id="talkgroup"
                placeholder="e.g., 3100"
                value={talkgroup}
                onChange={(e) => { setTalkgroup(e.target.value); handleUserEdit(); }}
                className="text-xs font-mono"
              />
            </div>

            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                  Advanced Settings
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {allBmServers.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="bmNetwork" className="text-xs">DMR Network</Label>
                    <Select value={selectedBmServer} onValueChange={handleNetworkChange}>
                      <SelectTrigger id="bmNetwork" className="text-xs">
                        <SelectValue placeholder={bmServersLoading ? "Loading networks..." : "Select a DMR network"} />
                      </SelectTrigger>
                      <SelectContent>
                        {allBmServers.map((network) => (
                          <SelectItem key={network.address} value={network.address} className="text-xs">
                            {network.networkLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      {allBmServers.length} networks available. Configure sources in Settings.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bmUsername" className="text-xs">BrandMeister Username</Label>
                  <Input
                    id="bmUsername"
                    placeholder="Optional"
                    value={bmUsername}
                    onChange={(e) => { setBmUsername(e.target.value); handleUserEdit(); }}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmPassword" className="text-xs">BrandMeister Password</Label>
                  <Input
                    id="bmPassword"
                    type="password"
                    placeholder="Optional"
                    value={bmPassword}
                    onChange={(e) => { setBmPassword(e.target.value); handleUserEdit(); }}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dmrId" className="text-xs">DMR ID</Label>
                  <Input
                    id="dmrId"
                    placeholder="From your profile"
                    value={dmrId}
                    onChange={(e) => { setDmrId(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssid" className="text-xs">SSID</Label>
                  <Input
                    id="ssid"
                    placeholder="From your profile"
                    value={ssid}
                    onChange={(e) => { setSsid(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayUrl" className="text-xs">Gateway URL</Label>
                  <Input
                    id="gatewayUrl"
                    placeholder="Optional"
                    value={gatewayUrl}
                    onChange={(e) => { setGatewayUrl(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayToken" className="text-xs">Gateway Token</Label>
                  <Input
                    id="gatewayToken"
                    type="password"
                    placeholder="Optional"
                    value={gatewayToken}
                    onChange={(e) => { setGatewayToken(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayRoom" className="text-xs">Gateway Room</Label>
                  <Input
                    id="gatewayRoom"
                    placeholder="Optional"
                    value={gatewayRoom}
                    onChange={(e) => { setGatewayRoom(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayUsername" className="text-xs">Gateway Username</Label>
                  <Input
                    id="gatewayUsername"
                    placeholder="Your callsign"
                    value={gatewayUsername}
                    onChange={(e) => { setGatewayUsername(e.target.value); handleUserEdit(); }}
                    className="text-xs font-mono"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {['dstar', 'ysf', 'p25', 'nxdn', 'm17'].map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-4 mt-4">
              <Alert className="console-panel">
                <Info className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">
                  {mode.toUpperCase()} configuration coming soon. Use DMR for now.
                </AlertDescription>
              </Alert>
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={handleSave} className="w-full text-xs">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
