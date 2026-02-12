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
import { saveConnection, loadConnection, isDigitalVoiceConnection, areBrandmeisterRequiredFieldsSatisfied } from '../hooks/usePreferredConnection';
import type { PersistentNetwork } from '../backend';
import { getPersistedGatewayParameter } from '../utils/gatewayUrlBootstrap';
import { normalizeServerAddress } from '../utils/serverAddress';

interface DigitalVoiceConnectFormProps {
  onSaved?: () => void;
  preset?: 'brandmeister-dmr' | 'allstar' | null;
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

  // Track if BrandMeister preset was applied internally
  const [isBrandmeisterPresetApplied, setIsBrandmeisterPresetApplied] = useState(false);

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

  // Apply BrandMeister preset - auto-select US server and hide URL inputs
  useEffect(() => {
    if (preset === 'brandmeister-dmr' && onPresetApplied) {
      const connection = loadConnection();
      const hasExistingConnection = connection && isDigitalVoiceConnection(connection);
      
      if (!hasExistingConnection) {
        console.log('DigitalVoiceConnectForm: Applying BrandMeister DMR preset');
        setActiveMode('dmr');
        
        // Auto-select BrandMeister United States server
        if (!selectedBmServer && allBmServers.length > 0) {
          const usNetwork = allBmServers.find(n => n.networkLabel === 'BrandMeister United States');
          const selectedNetwork = usNetwork || allBmServers[0];
          
          console.log('DigitalVoiceConnectForm: Auto-selected BrandMeister network:', selectedNetwork.networkLabel);
          setSelectedBmServer(normalizeServerAddress(selectedNetwork.address));
          setSelectedReflector(selectedNetwork.networkLabel);
        }
        
        setIsBrandmeisterPresetApplied(true);
      }
      
      onPresetApplied();
    }
  }, [preset, onPresetApplied, allBmServers, selectedBmServer]);

  // Auto-save and navigate when BrandMeister preset required fields are complete
  useEffect(() => {
    if (!isBrandmeisterPresetApplied) return;
    
    const autoSaveAttempted = sessionStorage.getItem(AUTO_SAVE_ATTEMPTED_KEY) === 'true';
    if (autoSaveAttempted) return;
    
    const tempConnection = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup,
      bmServerAddress: normalizeServerAddress(selectedBmServer),
      gatewayUrl,
      gatewayToken,
      gatewayRoom,
      gatewayUsername,
      bmUsername,
      bmPassword,
      dmrId,
      ssid,
      tgifHotspotSecurityPassword,
    };
    
    const requiredFieldsSatisfied = areBrandmeisterRequiredFieldsSatisfied(tempConnection);
    
    if (requiredFieldsSatisfied) {
      console.log('DigitalVoiceConnectForm: BrandMeister required fields satisfied, auto-saving and navigating to PTT');
      sessionStorage.setItem(AUTO_SAVE_ATTEMPTED_KEY, 'true');
      handleSave();
    }
  }, [isBrandmeisterPresetApplied, activeMode, selectedReflector, talkgroup, selectedBmServer, gatewayUrl, gatewayToken, gatewayRoom, gatewayUsername, bmUsername, bmPassword, dmrId, ssid, tgifHotspotSecurityPassword]);

  const handleSave = () => {
    setValidationError('');

    if (!selectedReflector) {
      setValidationError('Please select a network/reflector');
      return;
    }

    const selectedNetwork = allBmServers.find(n => 
      normalizeServerAddress(n.address) === normalizeServerAddress(selectedBmServer) ||
      n.networkLabel === selectedReflector
    );
    const bmServerLabel = selectedNetwork?.networkLabel || '';

    const connection = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup,
      bmUsername,
      bmPassword,
      dmrId,
      ssid,
      bmServerAddress: normalizeServerAddress(selectedBmServer),
      bmServerLabel,
      gatewayUrl,
      gatewayToken,
      gatewayRoom,
      gatewayUsername,
      tgifHotspotSecurityPassword,
    };

    saveConnection(connection);
    onSaved?.();
    navigate({ to: '/ptt' });
  };

  const handleBmServerChange = (address: string) => {
    const normalized = normalizeServerAddress(address);
    setSelectedBmServer(normalized);
    
    const server = allBmServers.find(s => normalizeServerAddress(s.address) === normalized);
    if (server) {
      setSelectedReflector(server.networkLabel);
    }
  };

  // Get selected server label for display
  const selectedServerLabel = allBmServers.find(s => 
    normalizeServerAddress(s.address) === normalizeServerAddress(selectedBmServer)
  )?.networkLabel || 'BrandMeister United States';

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

        <Tabs value={activeMode} onValueChange={setActiveMode}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dmr" className="text-xs">DMR</TabsTrigger>
            <TabsTrigger value="dstar" className="text-xs">D-Star</TabsTrigger>
            <TabsTrigger value="ysf" className="text-xs">YSF</TabsTrigger>
          </TabsList>

          <TabsContent value="dmr" className="space-y-4 mt-4">
            {/* Server display (non-editable in basic view) */}
            <div className="space-y-2">
              <Label className="text-xs">BrandMeister Server</Label>
              <div className="console-panel p-3 rounded-md border border-border">
                <p className="text-xs font-mono">{selectedServerLabel}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Connected to {selectedServerLabel}. Change server in Advanced Settings below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmUsername" className="text-xs">BrandMeister Username</Label>
              <Input
                id="bmUsername"
                placeholder="Your BrandMeister username"
                value={bmUsername}
                onChange={(e) => setBmUsername(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmPassword" className="text-xs">Hotspot Security Password</Label>
              <Input
                id="bmPassword"
                type="password"
                placeholder="Your hotspot security password"
                value={bmPassword}
                onChange={(e) => setBmPassword(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="talkgroup" className="text-xs">Talkgroup (Optional)</Label>
              <Input
                id="talkgroup"
                placeholder="e.g., 3100"
                value={talkgroup}
                onChange={(e) => setTalkgroup(e.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="bmServer" className="text-xs">BrandMeister Server</Label>
                  <Select value={selectedBmServer} onValueChange={handleBmServerChange}>
                    <SelectTrigger id="bmServer" className="text-xs">
                      <SelectValue placeholder={bmServersLoading ? "Loading servers..." : "Select a BrandMeister server"} />
                    </SelectTrigger>
                    <SelectContent>
                      {allBmServers.map((server) => (
                        <SelectItem key={server.address} value={server.address} className="text-xs">
                          {server.networkLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    {fetchedBmServers.length > 0 
                      ? `${builtinNetworks.filter(n => n.networkLabel.toLowerCase().includes('brandmeister')).length} built-in + ${fetchedBmServers.length} from GitHub`
                      : 'Built-in servers only. Configure GitHub sources in Settings to load more.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayUrl" className="text-xs">Gateway URL</Label>
                  <Input
                    id="gatewayUrl"
                    placeholder="wss://gateway.example.com"
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
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
                    onChange={(e) => setGatewayToken(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayRoom" className="text-xs">Gateway Room</Label>
                  <Input
                    id="gatewayRoom"
                    placeholder="Optional"
                    value={gatewayRoom}
                    onChange={(e) => setGatewayRoom(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayUsername" className="text-xs">Gateway Username</Label>
                  <Input
                    id="gatewayUsername"
                    placeholder="Your callsign"
                    value={gatewayUsername}
                    onChange={(e) => setGatewayUsername(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="dstar" className="space-y-4 mt-4">
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                D-Star configuration coming soon
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="ysf" className="space-y-4 mt-4">
            <Alert className="console-panel">
              <Info className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                YSF configuration coming soon
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full text-xs">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
