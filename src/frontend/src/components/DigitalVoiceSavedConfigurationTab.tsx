import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, Edit, AlertCircle, CheckCircle2, Wifi } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { 
  loadConnection, 
  isDigitalVoiceConnection, 
  isDigitalVoiceGatewayConfigured,
  getBrandmeisterMissingFields,
  getTgifMissingFields,
  isBrandmeisterDmrConnection,
  isTgifDmrConnection
} from '../hooks/usePreferredConnection';

interface DigitalVoiceSavedConfigurationTabProps {
  onEdit?: () => void;
}

export default function DigitalVoiceSavedConfigurationTab({ onEdit }: DigitalVoiceSavedConfigurationTabProps) {
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ReturnType<typeof loadConnection>>(null);

  useEffect(() => {
    const conn = loadConnection();
    setConnection(conn);
  }, []);

  if (!connection || !isDigitalVoiceConnection(connection)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Digital Voice Configuration
          </CardTitle>
          <CardDescription>No saved Digital Voice configuration found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You haven't configured a Digital Voice connection yet. Use the form above to set up your connection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isGatewayConfigured = isDigitalVoiceGatewayConfigured(connection);
  const isBrandmeisterDmr = isBrandmeisterDmrConnection(connection);
  const isTgifDmr = isTgifDmrConnection(connection);
  const brandmeisterMissingFields = isBrandmeisterDmr ? getBrandmeisterMissingFields(connection) : [];
  const tgifMissingFields = isTgifDmr ? getTgifMissingFields(connection) : [];
  const missingFields = [...brandmeisterMissingFields, ...tgifMissingFields];
  const hasMissingFields = missingFields.length > 0;

  const maskPassword = (password: string | undefined): string => {
    if (!password) return 'Not set';
    return '••••••••';
  };

  const maskToken = (token: string | undefined): string => {
    if (!token) return 'Not set';
    if (token.length <= 8) return '••••••••';
    return token.substring(0, 4) + '••••••••' + token.substring(token.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Saved Digital Voice Configuration
        </CardTitle>
        <CardDescription>Your current Digital Voice connection settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Missing Fields Alert */}
        {hasMissingFields && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isBrandmeisterDmr && 'BrandMeister configuration incomplete. '}
              {isTgifDmr && 'TGIF configuration incomplete. '}
              Missing: {missingFields.join(', ')}. Please edit your configuration to complete setup.
            </AlertDescription>
          </Alert>
        )}

        {/* Gateway Status Alert */}
        {!hasMissingFields && isGatewayConfigured && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Gateway configured - ready for real transmission
            </AlertDescription>
          </Alert>
        )}
        
        {!hasMissingFields && !isGatewayConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gateway not configured - real transmission is not available. Please configure the Digital Voice Gateway to enable actual voice transmission.
            </AlertDescription>
          </Alert>
        )}

        {/* Mode and Network */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Mode</span>
            <Badge variant="outline">{connection.mode.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Network / Reflector</span>
            <span className="text-sm font-medium">{connection.reflector}</span>
          </div>
          {connection.bmServerLabel && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">BrandMeister Server</span>
              <span className="text-sm font-medium">{connection.bmServerLabel}</span>
            </div>
          )}
          {!connection.bmServerLabel && connection.bmServerAddress && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">BrandMeister Server</span>
              <span className="font-mono text-xs">{connection.bmServerAddress}</span>
            </div>
          )}
          {connection.talkgroup && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Talkgroup</span>
              <span className="text-sm font-medium">{connection.talkgroup}</span>
            </div>
          )}
        </div>

        {/* BrandMeister Credentials */}
        {(connection.bmUsername || connection.bmPassword) && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <h4 className="text-sm font-medium">BrandMeister Credentials</h4>
            <div className="space-y-2">
              {connection.bmUsername && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="text-sm font-mono">{connection.bmUsername}</span>
                </div>
              )}
              {connection.bmPassword && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Password</span>
                  <span className="text-sm font-mono">{maskPassword(connection.bmPassword)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TGIF Hotspot Security Password */}
        {connection.tgifHotspotSecurityPassword && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <h4 className="text-sm font-medium">TGIF Authentication</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hotspot Security Password</span>
              <span className="text-sm font-mono">{maskPassword(connection.tgifHotspotSecurityPassword)}</span>
            </div>
          </div>
        )}

        {/* DMR ID and SSID */}
        {(connection.dmrId || connection.ssid) && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <h4 className="text-sm font-medium">DMR Identification</h4>
            <div className="space-y-2">
              {connection.dmrId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DMR ID</span>
                  <span className="text-sm font-mono">{connection.dmrId}</span>
                </div>
              )}
              {connection.ssid && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SSID</span>
                  <span className="text-sm font-mono">{connection.ssid}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Digital Voice Gateway Configuration */}
        <div className={`space-y-3 rounded-lg border-2 p-4 ${isGatewayConfigured ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5'}`}>
          <div className="flex items-center gap-2">
            <Wifi className={`h-5 w-5 ${isGatewayConfigured ? 'text-primary' : 'text-destructive'}`} />
            <h4 className="text-sm font-semibold">Digital Voice Gateway</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gateway URL</span>
              <span className="text-sm font-mono">{connection.gatewayUrl || 'Not configured'}</span>
            </div>
            {connection.gatewayToken && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Token</span>
                <span className="text-sm font-mono">{maskToken(connection.gatewayToken)}</span>
              </div>
            )}
            {connection.gatewayRoom && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Room</span>
                <span className="text-sm font-mono">{connection.gatewayRoom}</span>
              </div>
            )}
            {connection.gatewayUsername && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-mono">{connection.gatewayUsername}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onEdit} variant="outline" className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Button>
          <Button
            onClick={() => navigate({ to: '/ptt' })}
            className="flex-1"
            disabled={hasMissingFields}
          >
            <Radio className="mr-2 h-4 w-4" />
            {hasMissingFields ? 'Complete Setup First' : isGatewayConfigured ? 'Go to PTT' : 'Go to PTT (Simulation)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
