import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Server, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useAllstarServers } from '../hooks/useServerDirectories';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection, loadConnection, isIaxDvswitchConnection, areAllstarRequiredFieldsSatisfied } from '../hooks/usePreferredConnection';
import { getPersistedGatewayParameter } from '../utils/gatewayUrlBootstrap';
import { normalizeServerAddress } from '../utils/serverAddress';

interface IaxDvswitchConnectFormProps {
  onSaved?: () => void;
  preset?: 'allstar' | null;
  onPresetApplied?: () => void;
}

const AUTO_SAVE_ATTEMPTED_KEY = 'pttstar_iax_auto_save_attempted';
const DEFAULT_ALLSTAR_GATEWAY = 'allstarlink.org';

export default function IaxDvswitchConnectForm({ onSaved, preset, onPresetApplied }: IaxDvswitchConnectFormProps) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: fetchedAllstarServers = [], isLoading: allstarServersLoading } = useAllstarServers();

  const [gateway, setGateway] = useState('');
  const [iaxUsername, setIaxUsername] = useState('');
  const [iaxPassword, setIaxPassword] = useState('');
  const [userCallsign, setUserCallsign] = useState('');
  const [port, setPort] = useState('4569');
  const [nodeNumber, setNodeNumber] = useState('');
  const [allstarUsername, setAllstarUsername] = useState('');
  const [allstarPassword, setAllstarPassword] = useState('');
  const [validationError, setValidationError] = useState<string>('');

  // Track if AllStar preset was applied internally
  const [isAllstarPresetApplied, setIsAllstarPresetApplied] = useState(false);

  // Advanced section state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const connection = loadConnection();
    if (connection && isIaxDvswitchConnection(connection)) {
      setGateway(connection.gateway);
      setIaxUsername(connection.iaxUsername || '');
      setIaxPassword(connection.iaxPassword || '');
      setUserCallsign(connection.userCallsign);
      setPort(connection.port || '4569');
      setNodeNumber(connection.nodeNumber || '');
      setAllstarUsername(connection.allstarUsername || '');
      setAllstarPassword(connection.allstarPassword || '');
    } else {
      // No saved connection, try to prefill from URL parameters
      const urlGateway = getPersistedGatewayParameter('gateway') || getPersistedGatewayParameter('server');
      const urlPort = getPersistedGatewayParameter('port');
      const urlNode = getPersistedGatewayParameter('node');

      if (urlGateway && !gateway) {
        console.log('IaxDvswitchConnectForm: Prefilling gateway from URL parameter:', urlGateway);
        setGateway(normalizeServerAddress(urlGateway));
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
      setUserCallsign(userProfile.callsign || '');
    }
  }, [userProfile]);

  // Apply AllStar preset - auto-set gateway to allstarlink.org
  useEffect(() => {
    if (preset === 'allstar' && onPresetApplied) {
      const connection = loadConnection();
      const hasExistingConnection = connection && isIaxDvswitchConnection(connection);

      if (!hasExistingConnection) {
        console.log('IaxDvswitchConnectForm: Applying AllStar preset');
        
        // Auto-set gateway to allstarlink.org or first fetched server
        if (!gateway) {
          if (fetchedAllstarServers.length > 0) {
            const firstServer = fetchedAllstarServers[0];
            console.log('IaxDvswitchConnectForm: Auto-selected AllStar server:', firstServer.label);
            setGateway(normalizeServerAddress(firstServer.address));
          } else {
            console.log('IaxDvswitchConnectForm: Auto-set gateway to default:', DEFAULT_ALLSTAR_GATEWAY);
            setGateway(normalizeServerAddress(DEFAULT_ALLSTAR_GATEWAY));
          }
        }

        setIsAllstarPresetApplied(true);
      }

      onPresetApplied();
    }
  }, [preset, onPresetApplied, fetchedAllstarServers, gateway]);

  // Auto-save and navigate when AllStar preset required fields are complete
  useEffect(() => {
    if (!isAllstarPresetApplied) return;

    const autoSaveAttempted = sessionStorage.getItem(AUTO_SAVE_ATTEMPTED_KEY) === 'true';
    if (autoSaveAttempted) return;

    const tempConnection = {
      type: 'iax-dvswitch' as const,
      gateway: normalizeServerAddress(gateway),
      iaxUsername,
      iaxPassword,
      userCallsign,
      port,
      nodeNumber,
      allstarUsername,
      allstarPassword,
    };

    const requiredFieldsSatisfied = areAllstarRequiredFieldsSatisfied(tempConnection);

    if (requiredFieldsSatisfied) {
      console.log('IaxDvswitchConnectForm: AllStar required fields satisfied, auto-saving and navigating to PTT');
      sessionStorage.setItem(AUTO_SAVE_ATTEMPTED_KEY, 'true');
      handleSave();
    }
  }, [isAllstarPresetApplied, gateway, iaxUsername, iaxPassword, userCallsign, port, nodeNumber, allstarUsername, allstarPassword]);

  const handleSave = () => {
    setValidationError('');

    if (!gateway) {
      setValidationError('Gateway/Server is required');
      return;
    }

    if (!userCallsign) {
      setValidationError('Callsign is required');
      return;
    }

    const connection = {
      type: 'iax-dvswitch' as const,
      gateway: normalizeServerAddress(gateway),
      iaxUsername,
      iaxPassword,
      userCallsign,
      port,
      nodeNumber,
      allstarUsername,
      allstarPassword,
    };

    saveConnection(connection);
    onSaved?.();
    navigate({ to: '/ptt' });
  };

  const handleAllstarServerChange = (address: string) => {
    setGateway(normalizeServerAddress(address));
  };

  // Get display label for current gateway
  const gatewayDisplayLabel = fetchedAllstarServers.find(s => 
    normalizeServerAddress(s.address) === normalizeServerAddress(gateway)
  )?.label || gateway || DEFAULT_ALLSTAR_GATEWAY;

  return (
    <Card className="console-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          <CardTitle className="text-base">IAX / DVSwitch Configuration</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure AllStar, DVSwitch, or other IAX-based connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Gateway display (non-editable in basic view) */}
        <div className="space-y-2">
          <Label className="text-xs">AllStar Gateway</Label>
          <div className="console-panel p-3 rounded-md border border-border">
            <p className="text-xs font-mono">{gatewayDisplayLabel}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Connected to {gatewayDisplayLabel}. Change gateway in Advanced Settings below.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nodeNumber" className="text-xs">Node Number</Label>
          <Input
            id="nodeNumber"
            placeholder="e.g., 12345"
            value={nodeNumber}
            onChange={(e) => setNodeNumber(e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allstarUsername" className="text-xs">AllStar Username</Label>
          <Input
            id="allstarUsername"
            placeholder="Your AllStar username"
            value={allstarUsername}
            onChange={(e) => setAllstarUsername(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allstarPassword" className="text-xs">AllStar Password</Label>
          <Input
            id="allstarPassword"
            type="password"
            placeholder="Your AllStar password"
            value={allstarPassword}
            onChange={(e) => setAllstarPassword(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userCallsign" className="text-xs">Your Callsign <span className="text-destructive">*</span></Label>
          <Input
            id="userCallsign"
            placeholder="e.g., KO4RXE"
            value={userCallsign}
            onChange={(e) => setUserCallsign(e.target.value.toUpperCase())}
            className="text-xs font-mono uppercase"
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
            {fetchedAllstarServers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="allstarServer" className="text-xs">AllStar Server</Label>
                <Select value={gateway} onValueChange={handleAllstarServerChange}>
                  <SelectTrigger id="allstarServer" className="text-xs">
                    <SelectValue placeholder={allstarServersLoading ? "Loading servers..." : "Select an AllStar server"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fetchedAllstarServers.map((server) => (
                      <SelectItem key={server.address} value={server.address} className="text-xs">
                        {server.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  {fetchedAllstarServers.length} servers loaded from GitHub. Configure sources in Settings.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gateway" className="text-xs">Gateway / Server</Label>
              <Input
                id="gateway"
                placeholder="e.g., allstarlink.org"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="text-xs">Port</Label>
              <Input
                id="port"
                placeholder="4569"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iaxUsername" className="text-xs">IAX Username</Label>
              <Input
                id="iaxUsername"
                placeholder="Optional"
                value={iaxUsername}
                onChange={(e) => setIaxUsername(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iaxPassword" className="text-xs">IAX Password</Label>
              <Input
                id="iaxPassword"
                type="password"
                placeholder="Optional"
                value={iaxPassword}
                onChange={(e) => setIaxPassword(e.target.value)}
                className="text-xs"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button onClick={handleSave} className="w-full text-xs">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
