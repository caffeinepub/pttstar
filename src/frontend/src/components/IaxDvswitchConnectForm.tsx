import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Wifi, Server, Hash } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection } from '../hooks/usePreferredConnection';
import type { IaxDvswitchConnection } from '../hooks/usePreferredConnection';

export default function IaxDvswitchConnectForm() {
  const navigate = useNavigate();
  const [gateway, setGateway] = useState('');
  const [iaxUsername, setIaxUsername] = useState('');
  const [iaxPassword, setIaxPassword] = useState('');
  const [port, setPort] = useState('');
  const [nodeNumber, setNodeNumber] = useState('');

  const isValid = gateway.trim() !== '';

  const handleConnect = () => {
    if (!isValid) return;

    const connection: IaxDvswitchConnection = {
      type: 'iax-dvswitch',
      gateway: gateway.trim(),
      iaxUsername: iaxUsername.trim() || undefined,
      iaxPassword: iaxPassword.trim() || undefined,
      port: port.trim() || undefined,
      nodeNumber: nodeNumber.trim() || undefined,
    };

    saveConnection(connection);
    navigate({ to: '/ptt' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            IAX / DVSwitch Configuration
          </CardTitle>
          <CardDescription>
            Configure your IAX or DVSwitch gateway connection settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway / Server Address *</Label>
              <Input
                id="gateway"
                placeholder="example.com or example.com:4569"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the hostname or IP address of your gateway with port
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
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Ports & Node</h3>
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
                IAX port number (default is typically 4569)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeNumber">AllStar Node Number</Label>
              <Input
                id="nodeNumber"
                placeholder="e.g., 12345"
                value={nodeNumber}
                onChange={(e) => setNodeNumber(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your AllStar node number if applicable
              </p>
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            <Wifi className="mr-2 h-4 w-4" />
            Connect
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
