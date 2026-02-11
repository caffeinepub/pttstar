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
import { saveConnection, loadConnection, isDigitalVoiceConnection } from '../hooks/usePreferredConnection';
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

  // Apply BrandMeister preset
  useEffect(() => {
    if (preset === 'brandmeister-dmr') {
      const connection = loadConnection();
      const hasExistingConnection = connection && isDigitalVoiceConnection(connection);
      
      // Only apply preset if fields are empty or no saved connection exists
      if (!hasExistingConnection || !selectedReflector) {
        setActiveMode('dmr');
        setSelectedReflector('BrandMeister');
        
        // Prefill talkgroup to 91 only if empty
        if (!talkgroup && (!connection || !isDigitalVoiceConnection(connection) || !connection.talkgroup)) {
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
    m17: ['M17 Reflector 1', 'M17 Reflector 2', 'M17 Reflector 3', 'M17-USA', 'M17-EUR'],
  };

  // Get BrandMeister servers from backend - filter by networkLabel containing "BrandMeister" or address containing "bm."
  const brandmeisterServers: PersistentNetwork[] = builtinNetworks.filter(
    (network) => 
      network.networkType === 'dmr' && 
      (network.networkLabel.includes('BrandMeister') || 
       network.networkLabel.includes('BM') || 
       network.address.includes('bm.'))
  );

  const validateForm = (): boolean => {
    if (!selectedReflector) {
      setValidationError('Please select a network or reflector');
      return false;
    }

    if (isDmrMode && !talkgroup.trim()) {
      setValidationError('Talkgroup is required for DMR networks');
      return false;
    }

    if (isDmrMode && isBrandmeisterSelected && !selectedBmServer) {
      setValidationError('Please select a BrandMeister server');
      return false;
    }

    if (!gatewayUrl.trim()) {
      setValidationError('Gateway URL is required for real transmission');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Find the selected BrandMeister server details
    const bmServer = brandmeisterServers.find((s) => s.address === selectedBmServer);

    const config = {
      type: 'digital-voice' as const,
      mode: activeMode,
      reflector: selectedReflector,
      talkgroup: talkgroup || undefined,
      bmUsername: bmUsername || undefined,
      bmPassword: bmPassword || undefined,
      dmrId: dmrId || undefined,
      ssid: ssid || undefined,
      bmServerLabel: bmServer?.networkLabel || undefined,
      bmServerAddress: selectedBmServer || undefined,
      gatewayUrl: gatewayUrl || undefined,
      gatewayToken: gatewayToken || undefined,
      gatewayRoom: gatewayRoom || undefined,
      gatewayUsername: gatewayUsername || undefined,
    };
    
    saveConnection(config);
    
    if (onSaved) {
      onSaved();
    }
  };

  const handleSaveAndGoToPtt = () => {
    if (!validateForm()) return;
    handleSave();
    navigate({ to: '/ptt' });
  };

  const isDmrMode = activeMode === 'dmr';
  const isBrandmeisterSelected = selectedReflector === 'BrandMeister';
  const showTalkgroupInput = isDmrMode && selectedReflector;
  const showBmServerSelect = isDmrMode && isBrandmeisterSelected;

  const modeDescriptions: Record<string, string> = {
    dmr: 'Digital Mobile Radio - requires DMR ID and talkgroup selection',
    nxdn: 'NXDN digital voice protocol - select a reflector to connect',
    p25: 'Project 25 digital voice standard - choose a reflector or network',
    dstar: 'D-STAR digital voice mode - connect to REF, XRF, DCS, or XLX reflectors',
    ysf: 'System Fusion (C4FM) - Yaesu digital voice protocol',
    m17: 'M17 open-source digital voice protocol - community-driven standard',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Digital Voice Configuration
          </CardTitle>
          <CardDescription>
            Configure your digital voice connection settings including mode, network, and gateway for real transmission
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
          <div className="space-y-3">
            <Label>Digital Voice Mode</Label>
            <Tabs value={activeMode} onValueChange={setActiveMode}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="dmr">DMR</TabsTrigger>
                <TabsTrigger value="nxdn">NXDN</TabsTrigger>
                <TabsTrigger value="p25">P25</TabsTrigger>
                <TabsTrigger value="dstar">D-STAR</TabsTrigger>
                <TabsTrigger value="ysf">YSF</TabsTrigger>
                <TabsTrigger value="m17">M17</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-muted-foreground">{modeDescriptions[activeMode]}</p>
          </div>

          {/* Network/Reflector Selection */}
          <div className="space-y-2">
            <Label htmlFor="reflector">Network / Reflector</Label>
            <Select value={selectedReflector} onValueChange={setSelectedReflector}>
              <SelectTrigger id="reflector">
                <SelectValue placeholder="Select a network or reflector" />
              </SelectTrigger>
              <SelectContent>
                {reflectorsByMode[activeMode]?.map((reflector) => (
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
          {showBmServerSelect && (
            <div className="space-y-2">
              <Label htmlFor="bm-server">BrandMeister Server</Label>
              <Select value={selectedBmServer} onValueChange={setSelectedBmServer}>
                <SelectTrigger id="bm-server">
                  <SelectValue placeholder="Select a BrandMeister server" />
                </SelectTrigger>
                <SelectContent>
                  {brandmeisterServers.map((server) => (
                    <SelectItem key={server.address} value={server.address}>
                      <div className="flex flex-col">
                        <span className="font-medium">{server.networkLabel}</span>
                        <span className="text-xs text-muted-foreground">{server.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select your preferred BrandMeister regional server for optimal connectivity
              </p>
            </div>
          )}

          {/* Talkgroup Input (DMR only) */}
          {showTalkgroupInput && (
            <div className="space-y-2">
              <Label htmlFor="talkgroup">Talkgroup</Label>
              <Input
                id="talkgroup"
                placeholder="e.g., 91 (Worldwide)"
                value={talkgroup}
                onChange={(e) => setTalkgroup(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the talkgroup number you want to connect to (e.g., 91 for Worldwide, 3100 for USA Nationwide)
              </p>
            </div>
          )}

          {/* BrandMeister Credentials (DMR + BrandMeister only) */}
          {isDmrMode && isBrandmeisterSelected && (
            <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">BrandMeister Credentials (Optional)</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                BrandMeister credentials are optional. If your setup requires authentication, enter your credentials below.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bm-username">BrandMeister Username</Label>
                  <Input
                    id="bm-username"
                    placeholder="BrandMeister Username"
                    value={bmUsername}
                    onChange={(e) => setBmUsername(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bm-password">BrandMeister Password</Label>
                  <Input
                    id="bm-password"
                    type="password"
                    placeholder="BrandMeister Password"
                    value={bmPassword}
                    onChange={(e) => setBmPassword(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DMR ID and SSID (DMR only) */}
          {isDmrMode && (
            <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
              <h4 className="text-sm font-semibold">DMR Identification</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="dmr-id">DMR ID</Label>
                  <Input
                    id="dmr-id"
                    placeholder="Your DMR ID"
                    value={dmrId}
                    onChange={(e) => setDmrId(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your registered DMR ID from your profile
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssid">SSID (Optional)</Label>
                  <Input
                    id="ssid"
                    placeholder="SSID (e.g., 01-99)"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional SSID suffix for multiple devices (01-99)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Digital Voice Gateway Configuration */}
          <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-semibold">Digital Voice Gateway (Required)</h4>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                A Digital Voice Gateway is required for real transmission. This gateway handles the WebRTC signaling and audio routing for your digital voice connection.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="gateway-url">Gateway URL *</Label>
                <Input
                  id="gateway-url"
                  placeholder="wss://gateway.example.com"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  WebSocket URL of your Digital Voice Gateway (required for transmission)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gateway-token">Gateway Token (Optional)</Label>
                <Input
                  id="gateway-token"
                  type="password"
                  placeholder="Authentication token"
                  value={gatewayToken}
                  onChange={(e) => setGatewayToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Optional authentication token if required by your gateway
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gateway-room">Room (Optional)</Label>
                <Input
                  id="gateway-room"
                  placeholder="Room name or ID"
                  value={gatewayRoom}
                  onChange={(e) => setGatewayRoom(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Optional room identifier for multi-room gateways
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gateway-username">Gateway Username</Label>
                <Input
                  id="gateway-username"
                  placeholder="Your callsign"
                  value={gatewayUsername}
                  onChange={(e) => setGatewayUsername(e.target.value)}
                  className="font-mono text-sm uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Your callsign or username for the gateway (defaults to your profile callsign)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSaveAndGoToPtt}
              disabled={!selectedReflector || !gatewayUrl.trim()}
              className="w-full"
              size="lg"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Save and Go to PTT
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedReflector || !gatewayUrl.trim()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
