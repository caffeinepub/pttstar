import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, Save, Info, AlertCircle, Wifi } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useGetBuiltinNetworks } from '../hooks/useNetworks';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection, loadConnection, isDigitalVoiceConnection, getBrandmeisterMissingFields, getTgifMissingFields } from '../hooks/usePreferredConnection';
import type { PersistentNetwork } from '../backend';

interface DigitalVoiceConnectFormProps {
  onSaved?: () => void;
  preset?: 'brandmeister-dmr' | 'allstar' | null;
  onPresetApplied?: () => void;
}

export default function DigitalVoiceConnectForm({ onSaved, preset, onPresetApplied }: DigitalVoiceConnectFormProps) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: builtinNetworks = [] } = useGetBuiltinNetworks();

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

  // Apply BrandMeister preset - only when no existing connection or fields are empty
  useEffect(() => {
    if (preset === 'brandmeister-dmr') {
      const connection = loadConnection();
      const hasExistingConnection = connection && isDigitalVoiceConnection(connection);
      
      // Only apply preset if no saved connection exists
      if (!hasExistingConnection) {
        setActiveMode('dmr');
        setSelectedReflector('BrandMeister');
        
        // Prefill talkgroup to 91 only if empty
        if (!talkgroup) {
          setTalkgroup('91');
        }
      }
      
      if (onPresetApplied) {
        onPresetApplied();
      }
    }
  }, [preset, onPresetApplied]);

  const reflectorsByMode: Record<string, string[]> = {
    dmr: ['BrandMeister', 'DMR+', 'TGIF', 'FreeDMR', 'HBLink', 'DMRplus IPSC2'],
    nxdn: ['NXDN Reflector 1', 'NXDN Reflector 2', 'NXDN Reflector 3', 'NXDN Network A'],
    p25: ['P25 Reflector 1', 'P25 Reflector 2', 'P25 Reflector 3', 'P25 Network A', 'P25 Network B'],
    dstar: ['REF001', 'REF030', 'XRF757', 'DCS001', 'XLX757', 'XLX123'],
    ysf: ['YSF Reflector 1', 'YSF Reflector 2', 'YSF Reflector 3', 'America-Link', 'YSF Network A'],
  };

  const brandmeisterServers = builtinNetworks
    .filter((net: PersistentNetwork) => net.networkLabel.toLowerCase().includes('brandmeister'))
    .map((net: PersistentNetwork) => ({
      label: net.networkLabel,
      address: net.address,
    }));

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setSelectedReflector('');
    setValidationError('');
  };

  const handleReflectorChange = (reflector: string) => {
    setSelectedReflector(reflector);
    setValidationError('');
    
    // Clear BrandMeister-specific fields when switching away from BrandMeister
    if (reflector !== 'BrandMeister') {
      setSelectedBmServer('');
    }
    
    // Clear TGIF-specific fields when switching away from TGIF
    if (reflector !== 'TGIF') {
      setTgifHotspotSecurityPassword('');
    }
  };

  const validateAndSave = (goToPtt: boolean = false) => {
    setValidationError('');

    if (!selectedReflector) {
      setValidationError('Please select a network/reflector');
      return;
    }

    // BrandMeister-specific validation
    if (activeMode === 'dmr' && selectedReflector === 'BrandMeister') {
      if (!selectedBmServer) {
        setValidationError('Please select a BrandMeister server');
        return;
      }
      if (!talkgroup || !talkgroup.trim()) {
        setValidationError('Talkgroup is required for BrandMeister');
        return;
      }
      if (!gatewayUrl || !gatewayUrl.trim()) {
        setValidationError('Gateway URL is required for BrandMeister');
        return;
      }
    }

    // TGIF-specific validation (only when gateway is configured)
    if (activeMode === 'dmr' && selectedReflector === 'TGIF') {
      if (gatewayUrl && gatewayUrl.trim()) {
        if (!tgifHotspotSecurityPassword || !tgifHotspotSecurityPassword.trim()) {
          setValidationError('TGIF Hotspot Security Password is required when using a gateway');
          return;
        }
      }
    }

    const selectedServer = brandmeisterServers.find(s => s.address === selectedBmServer);

    const connection = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup: talkgroup || undefined,
      bmUsername: bmUsername || undefined,
      bmPassword: bmPassword || undefined,
      dmrId: dmrId || undefined,
      ssid: ssid || undefined,
      bmServerLabel: selectedServer?.label,
      bmServerAddress: selectedBmServer || undefined,
      gatewayUrl: gatewayUrl || undefined,
      gatewayToken: gatewayToken || undefined,
      gatewayRoom: gatewayRoom || undefined,
      gatewayUsername: gatewayUsername || undefined,
      tgifHotspotSecurityPassword: tgifHotspotSecurityPassword || undefined,
    };

    saveConnection(connection);
    
    if (onSaved) {
      onSaved();
    }

    if (goToPtt) {
      navigate({ to: '/ptt' });
    }
  };

  const isBrandmeisterDmr = activeMode === 'dmr' && selectedReflector === 'BrandMeister';
  const isTgifDmr = activeMode === 'dmr' && selectedReflector === 'TGIF';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Digital Voice Configuration
        </CardTitle>
        <CardDescription>
          Configure your Digital Voice connection (DMR, D-STAR, YSF, P25, NXDN)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Mode Selection */}
        <Tabs value={activeMode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dmr">DMR</TabsTrigger>
            <TabsTrigger value="dstar">D-STAR</TabsTrigger>
            <TabsTrigger value="ysf">YSF</TabsTrigger>
            <TabsTrigger value="p25">P25</TabsTrigger>
            <TabsTrigger value="nxdn">NXDN</TabsTrigger>
          </TabsList>

          {Object.keys(reflectorsByMode).map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`reflector-${mode}`}>Network / Reflector</Label>
                <Select value={selectedReflector} onValueChange={handleReflectorChange}>
                  <SelectTrigger id={`reflector-${mode}`}>
                    <SelectValue placeholder="Select a network or reflector" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    {reflectorsByMode[mode].map((reflector) => (
                      <SelectItem key={reflector} value={reflector}>
                        {reflector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the network or reflector you want to connect to
                </p>
              </div>

              {/* BrandMeister Server Selection (DMR only) */}
              {isBrandmeisterDmr && (
                <div className="space-y-2">
                  <Label htmlFor="bm-server">
                    BrandMeister Server <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedBmServer} onValueChange={setSelectedBmServer}>
                    <SelectTrigger id="bm-server">
                      <SelectValue placeholder="Select a BrandMeister server" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="max-h-[300px]">
                      {brandmeisterServers.map((server) => (
                        <SelectItem key={server.address} value={server.address}>
                          {server.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Required: Select your regional BrandMeister server
                  </p>
                </div>
              )}

              {/* Talkgroup (for DMR networks) */}
              {mode === 'dmr' && selectedReflector && (
                <div className="space-y-2">
                  <Label htmlFor="talkgroup">
                    Talkgroup {isBrandmeisterDmr && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="talkgroup"
                    value={talkgroup}
                    onChange={(e) => setTalkgroup(e.target.value)}
                    placeholder="e.g., 91 (Worldwide)"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isBrandmeisterDmr 
                      ? 'Required: Enter the talkgroup number you want to join'
                      : 'Enter the talkgroup number you want to join (e.g., 91 for Worldwide)'}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* BrandMeister Credentials */}
        {isBrandmeisterDmr && (
          <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">BrandMeister Credentials (Optional)</h4>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bm-username">BrandMeister Username</Label>
                <Input
                  id="bm-username"
                  value={bmUsername}
                  onChange={(e) => setBmUsername(e.target.value)}
                  placeholder="Your BrandMeister username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bm-password">BrandMeister Password</Label>
                <Input
                  id="bm-password"
                  type="password"
                  value={bmPassword}
                  onChange={(e) => setBmPassword(e.target.value)}
                  placeholder="Your BrandMeister password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optional: Provide your BrandMeister account credentials if required by your gateway
              </p>
            </div>
          </div>
        )}

        {/* TGIF Hotspot Security Password */}
        {isTgifDmr && (
          <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">TGIF Authentication</h4>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                TGIF requires a hotspot security password for authentication when using a gateway. This password is provided by your TGIF network administrator.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="tgif-password">
                TGIF Hotspot Security Password {gatewayUrl && gatewayUrl.trim() && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="tgif-password"
                type="password"
                value={tgifHotspotSecurityPassword}
                onChange={(e) => setTgifHotspotSecurityPassword(e.target.value)}
                placeholder="Your TGIF hotspot security password"
              />
              <p className="text-xs text-muted-foreground">
                {gatewayUrl && gatewayUrl.trim() 
                  ? 'Required: Your TGIF hotspot security password for gateway authentication'
                  : 'Your TGIF hotspot security password (required when using a gateway)'}
              </p>
            </div>
          </div>
        )}

        {/* DMR ID and SSID */}
        {activeMode === 'dmr' && (
          <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">DMR Identification</h4>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dmr-id">DMR ID</Label>
                <Input
                  id="dmr-id"
                  value={dmrId}
                  onChange={(e) => setDmrId(e.target.value)}
                  placeholder="Your DMR ID"
                />
                <p className="text-xs text-muted-foreground">
                  From your profile or enter manually
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssid">SSID</Label>
                <Input
                  id="ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="Your SSID (e.g., 1-15)"
                />
                <p className="text-xs text-muted-foreground">
                  Suffix for your DMR ID (1-15)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Digital Voice Gateway Configuration */}
        <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold">Digital Voice Gateway Configuration</h4>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isBrandmeisterDmr 
                ? 'Gateway URL is required for BrandMeister connections. Configure your gateway to enable real voice transmission over WebRTC.'
                : isTgifDmr
                ? 'Configure your Digital Voice Gateway to enable real voice transmission over WebRTC. TGIF requires a hotspot security password when using a gateway.'
                : 'Configure your Digital Voice Gateway to enable real voice transmission over WebRTC. Without a gateway, only simulation mode is available.'}
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-url">
                Gateway URL {isBrandmeisterDmr && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="gateway-url"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="wss://gateway.example.com or https://gateway.example.com"
              />
              <p className="text-xs text-muted-foreground">
                {isBrandmeisterDmr 
                  ? 'Required: WebSocket or HTTPS URL of your Digital Voice Gateway'
                  : 'WebSocket or HTTPS URL of your Digital Voice Gateway'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway-token">Gateway Token (Optional)</Label>
              <Input
                id="gateway-token"
                type="password"
                value={gatewayToken}
                onChange={(e) => setGatewayToken(e.target.value)}
                placeholder="Authentication token if required"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Authentication token for your gateway
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway-room">Gateway Room (Optional)</Label>
              <Input
                id="gateway-room"
                value={gatewayRoom}
                onChange={(e) => setGatewayRoom(e.target.value)}
                placeholder="Room identifier if required"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Room identifier for your gateway
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway-username">Gateway Username</Label>
              <Input
                id="gateway-username"
                value={gatewayUsername}
                onChange={(e) => setGatewayUsername(e.target.value)}
                placeholder="Your callsign or username"
              />
              <p className="text-xs text-muted-foreground">
                Your callsign or username for gateway identification
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => validateAndSave(false)} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          <Button onClick={() => validateAndSave(true)} variant="default" className="flex-1">
            <Radio className="mr-2 h-4 w-4" />
            Save and Go to PTT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
