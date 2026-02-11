import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, Server, Hash, Save, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection, loadConnection, isIaxDvswitchConnection } from '../hooks/usePreferredConnection';
import type { IaxDvswitchConnection } from '../hooks/usePreferredConnection';

interface IaxDvswitchConnectFormProps {
  onSaved?: () => void;
  preset?: 'brandmeister-dmr' | 'allstar' | null;
  onPresetApplied?: () => void;
}

export default function IaxDvswitchConnectForm({ onSaved, preset, onPresetApplied }: IaxDvswitchConnectFormProps) {
  const navigate = useNavigate();
  const [gateway, setGateway] = useState('');
  const [iaxUsername, setIaxUsername] = useState('');
  const [iaxPassword, setIaxPassword] = useState('');
  const [port, setPort] = useState('');
  const [nodeNumber, setNodeNumber] = useState('');
  const [userCallsign, setUserCallsign] = useState('');
  const [allstarId, setAllstarId] = useState('');
  const [allstarPassword, setAllstarPassword] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const [isAllstarPreset, setIsAllstarPreset] = useState(false);

  // Prefill form from sessionStorage on mount
  useEffect(() => {
    const connection = loadConnection();
    if (connection && isIaxDvswitchConnection(connection)) {
      setGateway(connection.gateway || '');
      setIaxUsername(connection.iaxUsername || '');
      setIaxPassword(connection.iaxPassword || '');
      setPort(connection.port || '');
      setNodeNumber(connection.nodeNumber || '');
      setUserCallsign(connection.userCallsign || '');
      setAllstarId(connection.allstarId || '');
      setAllstarPassword(connection.allstarPassword || '');
    }
  }, []);

  // Apply AllStar preset
  useEffect(() => {
    if (preset === 'allstar') {
      const connection = loadConnection();
      const hasExistingConnection = connection && isIaxDvswitchConnection(connection);
      
      setIsAllstarPreset(true);
      
      // Prefill port to 4569 only if empty and no saved port
      if (!port && (!hasExistingConnection || !connection.port)) {
        setPort('4569');
      }
      
      if (onPresetApplied) {
        onPresetApplied();
      }
    }
  }, [preset, onPresetApplied]);

  const validateForm = (): boolean => {
    if (!gateway.trim()) {
      if (isAllstarPreset) {
        setValidationError('AllStar Gateway/Server is required');
      } else {
        setValidationError('Gateway / Server Address is required');
      }
      return false;
    }

    if (isAllstarPreset && !nodeNumber.trim()) {
      setValidationError('AllStar Node Number is required');
      return false;
    }
    
    if (port && !/^\d+$/.test(port.trim())) {
      setValidationError('Port must be a valid number');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const buildConnection = (): IaxDvswitchConnection => {
    return {
      type: 'iax-dvswitch',
      gateway: gateway.trim(),
      iaxUsername: iaxUsername.trim() || undefined,
      iaxPassword: iaxPassword.trim() || undefined,
      port: port.trim() || undefined,
      nodeNumber: nodeNumber.trim() || undefined,
      userCallsign: userCallsign.trim() || undefined,
      allstarId: allstarId.trim() || undefined,
      allstarPassword: allstarPassword.trim() || undefined,
    };
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const connection = buildConnection();
    saveConnection(connection);
    if (onSaved) {
      onSaved();
    }
  };

  const handleSaveAndGoToPtt = () => {
    if (!validateForm()) return;
    const connection = buildConnection();
    saveConnection(connection);
    navigate({ to: '/ptt' });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {isAllstarPreset ? (
            <>
              <strong>AllStar Network Setup:</strong> Configure your AllStar connection. The gateway address and node number are required; other fields are optional depending on your setup.
            </>
          ) : (
            <>
              Configure your IAX or DVSwitch gateway connection. The gateway address is required; all other fields are optional and depend on your specific setup.
            </>
          )}
        </AlertDescription>
      </Alert>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {isAllstarPreset ? 'AllStar Gateway Configuration' : 'Gateway Configuration'}
          </CardTitle>
          <CardDescription>
            {isAllstarPreset 
              ? 'Enter your AllStar gateway connection details and node information.'
              : 'Enter your IAX or DVSwitch gateway connection details.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway">
                {isAllstarPreset ? 'AllStar Gateway / Server *' : 'Gateway / Server Address *'}
              </Label>
              <Input
                id="gateway"
                placeholder={isAllstarPreset ? 'allstar.example.com or allstar.example.com:4569' : 'example.com or example.com:4569'}
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {isAllstarPreset 
                  ? 'Enter the hostname or IP address of your AllStar gateway. You can include the port (e.g., allstar.example.com:4569) or specify it separately below.'
                  : 'Enter the hostname or IP address of your gateway. You can include the port (e.g., example.com:4569) or specify it separately below.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iaxUsername">IAX Username</Label>
              <Input
                id="iaxUsername"
                placeholder="IAX Username"
                value={iaxUsername}
                onChange={(e) => setIaxUsername(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your IAX authentication username if required by your gateway.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iaxPassword">IAX Password</Label>
              <Input
                id="iaxPassword"
                type="password"
                placeholder="IAX Password"
                value={iaxPassword}
                onChange={(e) => setIaxPassword(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your IAX authentication password if required by your gateway.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userCallsign">User Callsign</Label>
              <Input
                id="userCallsign"
                placeholder="e.g., W1AW"
                value={userCallsign}
                onChange={(e) => setUserCallsign(e.target.value)}
                className="font-mono text-sm uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your amateur radio callsign for this connection. This will be displayed during transmissions.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                {isAllstarPreset ? 'AllStar Port & Node' : 'Ports & Node'}
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="e.g., 4569"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {isAllstarPreset 
                  ? 'AllStar IAX port number. Default is 4569 for AllStar networks.'
                  : 'Optional: IAX port number. Default is typically 4569 if not specified in the gateway address.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeNumber">
                {isAllstarPreset ? 'AllStar Node Number *' : 'AllStar Node Number'}
              </Label>
              <Input
                id="nodeNumber"
                placeholder="e.g., 12345"
                value={nodeNumber}
                onChange={(e) => setNodeNumber(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {isAllstarPreset 
                  ? 'Your AllStar node number (required for AllStar connections).'
                  : 'Optional: Your AllStar node number if you\'re connecting to an AllStar network.'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">AllStar Credentials</h3>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                AllStar credentials are optional and only needed if your AllStar node requires authentication. These are stored locally on your device and are separate from your Internet Identity login.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="allstarId">AllStar ID / Username</Label>
              <Input
                id="allstarId"
                placeholder="AllStar ID or Username"
                value={allstarId}
                onChange={(e) => setAllstarId(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your AllStar node identifier or username for authentication.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allstarPassword">AllStar Password</Label>
              <Input
                id="allstarPassword"
                type="password"
                placeholder="AllStar Password"
                value={allstarPassword}
                onChange={(e) => setAllstarPassword(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your AllStar node password for authentication.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSaveAndGoToPtt}
              disabled={!gateway.trim() || (isAllstarPreset && !nodeNumber.trim())}
              className="w-full"
              size="lg"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Save and Go to PTT
            </Button>
            <Button
              onClick={handleSave}
              disabled={!gateway.trim() || (isAllstarPreset && !nodeNumber.trim())}
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
