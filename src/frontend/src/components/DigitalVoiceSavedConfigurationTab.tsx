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
import AutoGatewayStatusIndicator from './AutoGatewayStatusIndicator';

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
      <Card className="console-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="h-4 w-4" />
            Digital Voice Configuration
          </CardTitle>
          <CardDescription className="text-xs">No saved Digital Voice configuration found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              You haven't configured a Digital Voice connection yet. Use the Configure tab to set up your connection.
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
    <Card className="console-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-4 w-4" />
          Saved Digital Voice Configuration
        </CardTitle>
        <CardDescription className="text-xs">Your current Digital Voice connection settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Gateway Status Indicator */}
        <AutoGatewayStatusIndicator />

        {/* Missing Fields Alert */}
        {hasMissingFields && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              {isBrandmeisterDmr && 'BrandMeister configuration incomplete. '}
              {isTgifDmr && 'TGIF configuration incomplete. '}
              Missing: {missingFields.join(', ')}. Please edit your configuration to complete setup.
            </AlertDescription>
          </Alert>
        )}

        {/* Gateway Status Alert */}
        {!hasMissingFields && isGatewayConfigured && (
          <Alert className="console-panel border-status-active/50 bg-status-active/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-active" />
            <AlertDescription className="text-xs text-status-active">
              Gateway configured - ready for real transmission
            </AlertDescription>
          </Alert>
        )}
        
        {!hasMissingFields && !isGatewayConfigured && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              Gateway not configured - real transmission is not available. Please configure the Digital Voice Gateway to enable actual voice transmission.
            </AlertDescription>
          </Alert>
        )}

        {/* Mode and Network Section */}
        <div className="console-section">
          <h4 className="console-label mb-2">Network Configuration</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mode</span>
              <Badge variant="outline" className="text-xs">{connection.mode.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network / Reflector</span>
              <span className="console-value">{connection.reflector}</span>
            </div>
            {connection.bmServerLabel && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">BrandMeister Server</span>
                <span className="console-value">{connection.bmServerLabel}</span>
              </div>
            )}
            {!connection.bmServerLabel && connection.bmServerAddress && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">BrandMeister Server</span>
                <span className="console-value">{connection.bmServerAddress}</span>
              </div>
            )}
            {connection.talkgroup && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Talkgroup</span>
                <span className="console-value">{connection.talkgroup}</span>
              </div>
            )}
          </div>
        </div>

        {/* BrandMeister Credentials Section */}
        {(connection.bmUsername || connection.bmPassword) && (
          <div className="console-section">
            <h4 className="console-label mb-2">BrandMeister Credentials</h4>
            <div className="space-y-2">
              {connection.bmUsername && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Username</span>
                  <span className="console-value">{connection.bmUsername}</span>
                </div>
              )}
              {connection.bmPassword && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Password</span>
                  <span className="console-value">{maskPassword(connection.bmPassword)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TGIF Hotspot Security Password Section */}
        {connection.tgifHotspotSecurityPassword && (
          <div className="console-section">
            <h4 className="console-label mb-2">TGIF Authentication</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Hotspot Security Password</span>
              <span className="console-value">{maskPassword(connection.tgifHotspotSecurityPassword)}</span>
            </div>
          </div>
        )}

        {/* DMR ID and SSID Section */}
        {(connection.dmrId || connection.ssid) && (
          <div className="console-section">
            <h4 className="console-label mb-2">DMR Identification</h4>
            <div className="space-y-2">
              {connection.dmrId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">DMR ID</span>
                  <span className="console-value">{connection.dmrId}</span>
                </div>
              )}
              {connection.ssid && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">SSID</span>
                  <span className="console-value">{connection.ssid}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Digital Voice Gateway Section */}
        <div className={`console-section ${isGatewayConfigured ? 'border-primary/30' : 'border-destructive/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wifi className={`h-4 w-4 ${isGatewayConfigured ? 'text-primary' : 'text-destructive'}`} />
            <h4 className="console-label">Digital Voice Gateway</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Gateway URL</span>
              <span className="console-value">{connection.gatewayUrl || 'Not configured'}</span>
            </div>
            {connection.gatewayToken && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Token</span>
                <span className="console-value">{maskToken(connection.gatewayToken)}</span>
              </div>
            )}
            {connection.gatewayRoom && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Room</span>
                <span className="console-value">{connection.gatewayRoom}</span>
              </div>
            )}
            {connection.gatewayUsername && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Username</span>
                <span className="console-value">{connection.gatewayUsername}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onEdit} variant="outline" size="sm" className="flex-1 text-xs">
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit Configuration
          </Button>
          <Button
            onClick={() => navigate({ to: '/ptt' })}
            size="sm"
            className="flex-1 text-xs"
            disabled={hasMissingFields}
          >
            <Radio className="mr-2 h-3.5 w-3.5" />
            {hasMissingFields ? 'Complete Setup First' : isGatewayConfigured ? 'Go to PTT' : 'Go to PTT (Simulation)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
