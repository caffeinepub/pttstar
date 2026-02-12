import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Server, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useAllstarServers } from '../hooks/useServerDirectories';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection, loadConnection, isIaxDvswitchConnection, areAllstarRequiredFieldsSatisfied } from '../hooks/usePreferredConnection';
import { getPersistedGatewayParameter } from '../utils/gatewayUrlBootstrap';
import { normalizeServerAddress } from '../utils/serverAddress';
import type { PresetId } from '../utils/connectionPresets';

interface IaxDvswitchConnectFormProps {
  onSaved?: () => void;
  preset?: PresetId | null;
  onPresetApplied?: () => void;
}

const AUTO_SAVE_ATTEMPTED_KEY = 'pttstar_iax_auto_save_attempted';
const DEFAULT_ALLSTAR_GATEWAY = 'allstarlink.org';

export default function IaxDvswitchConnectForm({ onSaved, preset, onPresetApplied }: IaxDvswitchConnectFormProps) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: fetchedAllstarServers = [], isLoading: allstarServersLoading } = useAllstarServers();

  // DVSwitch-style field order: Hostname, Port, Username, Password, Callsign, Node Number
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('4569');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [nodeNumber, setNodeNumber] = useState('');
  
  // New fields
  const [phoneToIaxConfirmed, setPhoneToIaxConfirmed] = useState(false);
  const [codecType, setCodecType] = useState<'ulaw' | 'slin' | 'adpcm'>('ulaw');
  
  // Advanced fields
  const [allstarUsername, setAllstarUsername] = useState('');
  const [allstarPassword, setAllstarPassword] = useState('');
  const [validationError, setValidationError] = useState<string>('');

  // Track if preset was applied internally
  const [appliedPreset, setAppliedPreset] = useState<PresetId | null>(null);

  // Track if user has edited the form during this session
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Advanced section state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const connection = loadConnection();
    if (connection && isIaxDvswitchConnection(connection)) {
      setHostname(connection.gateway);
      setPort(connection.port || '4569');
      setUsername(connection.iaxUsername || '');
      setPassword(connection.iaxPassword || '');
      setCallsign(connection.userCallsign);
      setNodeNumber(connection.nodeNumber || '');
      setAllstarUsername(connection.allstarUsername || '');
      setAllstarPassword(connection.allstarPassword || '');
      setPhoneToIaxConfirmed(connection.phoneToIaxConfirmed ?? false);
      setCodecType(connection.codecType ?? 'ulaw');
      setHasUserEdited(true); // Existing connection means user has edited
    } else {
      // No saved connection, try to prefill from URL parameters
      const urlGateway = getPersistedGatewayParameter('gateway') || getPersistedGatewayParameter('server');
      const urlPort = getPersistedGatewayParameter('port');
      const urlNode = getPersistedGatewayParameter('node');

      if (urlGateway && !hostname) {
        console.log('IaxDvswitchConnectForm: Prefilling hostname from URL parameter:', urlGateway);
        setHostname(normalizeServerAddress(urlGateway));
      }
      if (urlPort && !port) {
        console.log('IaxDvswitchConnectForm: Prefilling port from URL parameter:', urlPort);
        setPort(urlPort);
      }
      if (urlNode && !nodeNumber) {
        console.log('IaxDvswitchConnectForm: Prefilling node number from URL parameter:', urlNode);
        setNodeNumber(urlNode);
      }
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setCallsign(userProfile.callsign || '');
    }
  }, [userProfile]);

  // Apply preset - only if no existing connection and user hasn't edited
  // Wait for AllStar servers to finish loading before applying AllStar preset
  useEffect(() => {
    if (!preset || !onPresetApplied) return;
    if (appliedPreset === preset) return; // Already applied this preset

    const connection = loadConnection();
    const hasExistingConnection = connection && isIaxDvswitchConnection(connection);

    if (hasExistingConnection || hasUserEdited) {
      console.log('IaxDvswitchConnectForm: Skipping preset application (existing connection or user has edited)');
      onPresetApplied();
      return;
    }

    // For AllStar preset, wait for server list to finish loading
    if (preset === 'allstar' && allstarServersLoading) {
      console.log('IaxDvswitchConnectForm: Waiting for AllStar servers to load before applying preset');
      return;
    }

    console.log('IaxDvswitchConnectForm: Applying preset:', preset);
    
    if (preset === 'allstar') {
      // Auto-set hostname to first fetched server or default
      if (!hostname) {
        if (fetchedAllstarServers.length > 0) {
          const firstServer = fetchedAllstarServers[0];
          console.log('IaxDvswitchConnectForm: Auto-selected AllStar server:', firstServer.label);
          setHostname(normalizeServerAddress(firstServer.address));
        } else {
          console.log('IaxDvswitchConnectForm: Auto-set hostname to default:', DEFAULT_ALLSTAR_GATEWAY);
          setHostname(normalizeServerAddress(DEFAULT_ALLSTAR_GATEWAY));
        }
      }
      
      // Ensure port is set to default
      if (!port || port === '') {
        setPort('4569');
      }
    }

    setAppliedPreset(preset);
    onPresetApplied();
  }, [preset, onPresetApplied, fetchedAllstarServers, allstarServersLoading, hostname, port, appliedPreset, hasUserEdited]);

  // Auto-save and navigate when preset required fields are complete
  useEffect(() => {
    if (!appliedPreset) return;

    const autoSaveAttempted = sessionStorage.getItem(AUTO_SAVE_ATTEMPTED_KEY) === 'true';
    if (autoSaveAttempted) return;

    const tempConnection = {
      type: 'iax-dvswitch' as const,
      gateway: normalizeServerAddress(hostname),
      port,
      iaxUsername: username,
      iaxPassword: password,
      userCallsign: callsign,
      nodeNumber,
      allstarUsername,
      allstarPassword,
      phoneToIaxConfirmed,
      codecType,
    };

    const requiredFieldsSatisfied = areAllstarRequiredFieldsSatisfied(tempConnection);

    if (requiredFieldsSatisfied && phoneToIaxConfirmed) {
      console.log('IaxDvswitchConnectForm: AllStar required fields satisfied, auto-saving and navigating to PTT');
      sessionStorage.setItem(AUTO_SAVE_ATTEMPTED_KEY, 'true');
      handleSave();
    }
  }, [appliedPreset, hostname, username, password, callsign, port, nodeNumber, allstarUsername, allstarPassword, phoneToIaxConfirmed, codecType]);

  // Track user edits
  const handleUserEdit = () => {
    if (!hasUserEdited) {
      console.log('IaxDvswitchConnectForm: User has started editing');
      setHasUserEdited(true);
    }
  };

  const handleSave = () => {
    setValidationError('');

    if (!hostname) {
      setValidationError('Hostname is required');
      return;
    }

    if (!callsign) {
      setValidationError('Callsign is required');
      return;
    }

    if (!phoneToIaxConfirmed) {
      setValidationError('You must confirm Phone to IAX connection to continue');
      return;
    }

    const connection = {
      type: 'iax-dvswitch' as const,
      gateway: normalizeServerAddress(hostname),
      port: port || '4569',
      iaxUsername: username,
      iaxPassword: password,
      userCallsign: callsign,
      nodeNumber,
      allstarUsername,
      allstarPassword,
      phoneToIaxConfirmed,
      codecType,
    };

    saveConnection(connection);
    onSaved?.();
    navigate({ to: '/ptt' });
  };

  const handleAllstarServerChange = (address: string) => {
    setHostname(normalizeServerAddress(address));
    handleUserEdit();
  };

  return (
    <Card className="console-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          <CardTitle className="text-base">IAX / DVSwitch Configuration</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure AllStar or other IAX-based connections using DVSwitch-style settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Hostname */}
        <div className="space-y-2">
          <Label htmlFor="hostname" className="console-label">
            Hostname <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hostname"
            value={hostname}
            onChange={(e) => {
              setHostname(e.target.value);
              handleUserEdit();
            }}
            placeholder="allstarlink.org or 192.168.1.100"
            className="console-panel font-mono text-xs"
          />
        </div>

        {/* Port */}
        <div className="space-y-2">
          <Label htmlFor="port" className="console-label">
            Port <span className="text-destructive">*</span>
          </Label>
          <Input
            id="port"
            value={port}
            onChange={(e) => {
              setPort(e.target.value);
              handleUserEdit();
            }}
            placeholder="4569"
            className="console-panel font-mono text-xs"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="console-label">
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              handleUserEdit();
            }}
            placeholder="IAX username"
            className="console-panel font-mono text-xs"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="console-label">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleUserEdit();
            }}
            placeholder="IAX password"
            className="console-panel font-mono text-xs"
          />
        </div>

        {/* Callsign */}
        <div className="space-y-2">
          <Label htmlFor="callsign" className="console-label">
            Callsign <span className="text-destructive">*</span>
          </Label>
          <Input
            id="callsign"
            value={callsign}
            onChange={(e) => {
              setCallsign(e.target.value.toUpperCase());
              handleUserEdit();
            }}
            placeholder="W1AW"
            className="console-panel font-mono text-xs uppercase"
          />
        </div>

        {/* Node Number */}
        <div className="space-y-2">
          <Label htmlFor="nodeNumber" className="console-label">
            Node Number
          </Label>
          <Input
            id="nodeNumber"
            value={nodeNumber}
            onChange={(e) => {
              setNodeNumber(e.target.value);
              handleUserEdit();
            }}
            placeholder="12345"
            className="console-panel font-mono text-xs"
          />
        </div>

        {/* Phone to IAX Connection Checkbox */}
        <div className="flex items-start space-x-3 rounded-md border border-border p-3">
          <Checkbox
            id="phoneToIax"
            checked={phoneToIaxConfirmed}
            onCheckedChange={(checked) => {
              setPhoneToIaxConfirmed(checked === true);
              handleUserEdit();
            }}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="phoneToIax"
              className="console-label cursor-pointer text-xs font-medium"
            >
              Phone to IAX connection <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Confirm that you are using a phone-to-IAX connection
            </p>
          </div>
        </div>

        {/* Codec Types */}
        <div className="space-y-2">
          <Label className="console-label">
            Codec Types <span className="text-destructive">*</span>
          </Label>
          <Tabs value={codecType} onValueChange={(value) => {
            setCodecType(value as 'ulaw' | 'slin' | 'adpcm');
            handleUserEdit();
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ulaw" className="text-xs">ulaw</TabsTrigger>
              <TabsTrigger value="slin" className="text-xs">slin</TabsTrigger>
              <TabsTrigger value="adpcm" className="text-xs">adpcm</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            Select the codec type for server communication
          </p>
        </div>

        {/* Advanced Settings (Optional Fields) */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
              <span>Advanced Settings (Optional)</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* AllStar Server Selection */}
            {fetchedAllstarServers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="allstarServer" className="console-label">
                  AllStar Server
                </Label>
                <Select value={hostname} onValueChange={handleAllstarServerChange}>
                  <SelectTrigger id="allstarServer" className="console-panel text-xs">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    {fetchedAllstarServers.map((server) => (
                      <SelectItem key={server.address} value={server.address} className="text-xs">
                        {server.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* AllStar Credentials */}
            <div className="space-y-3 rounded-md border border-border p-3">
              <h4 className="console-label text-xs font-medium">AllStar Credentials</h4>
              <div className="space-y-2">
                <Label htmlFor="allstarUsername" className="console-label text-xs">
                  Username
                </Label>
                <Input
                  id="allstarUsername"
                  value={allstarUsername}
                  onChange={(e) => {
                    setAllstarUsername(e.target.value);
                    handleUserEdit();
                  }}
                  placeholder="Optional"
                  className="console-panel font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allstarPassword" className="console-label text-xs">
                  Password
                </Label>
                <Input
                  id="allstarPassword"
                  type="password"
                  value={allstarPassword}
                  onChange={(e) => {
                    setAllstarPassword(e.target.value);
                    handleUserEdit();
                  }}
                  placeholder="Optional"
                  className="console-panel font-mono text-xs"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button onClick={handleSave} className="w-full" size="sm">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save & Continue to PTT
        </Button>
      </CardContent>
    </Card>
  );
}
