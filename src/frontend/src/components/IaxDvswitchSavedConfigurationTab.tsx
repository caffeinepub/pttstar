import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, Edit, AlertCircle, Hash, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { loadConnection, isIaxDvswitchConnection } from '../hooks/usePreferredConnection';
import AutoGatewayStatusIndicator from './AutoGatewayStatusIndicator';

interface IaxDvswitchSavedConfigurationTabProps {
  onEdit?: () => void;
}

export default function IaxDvswitchSavedConfigurationTab({ onEdit }: IaxDvswitchSavedConfigurationTabProps) {
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ReturnType<typeof loadConnection>>(null);

  useEffect(() => {
    const conn = loadConnection();
    setConnection(conn);
  }, []);

  if (!connection || !isIaxDvswitchConnection(connection)) {
    return (
      <Card className="console-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4" />
            IAX / DVSwitch Configuration
          </CardTitle>
          <CardDescription className="text-xs">No saved IAX / DVSwitch configuration found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              You haven't configured an IAX or DVSwitch connection yet. Use the Configure tab to set up your connection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const maskPassword = (password: string | undefined): string => {
    if (!password) return 'Not set';
    return '••••••••';
  };

  const phoneToIaxStatus = connection.phoneToIaxConfirmed ? 'Yes' : 'No';
  const codecTypeDisplay = connection.codecType ?? 'ulaw';

  return (
    <Card className="console-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-4 w-4" />
          Saved IAX / DVSwitch Configuration
        </CardTitle>
        <CardDescription className="text-xs">Your current IAX or DVSwitch connection settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Gateway Status Indicator */}
        <AutoGatewayStatusIndicator />

        {/* Primary Connection Settings */}
        <div className="console-section">
          <h4 className="console-label mb-2">Connection Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Hostname</span>
              <span className="console-value">{connection.gateway}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Port</span>
              <span className="console-value">{connection.port || '4569'}</span>
            </div>
            {connection.iaxUsername && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Username</span>
                <span className="console-value">{connection.iaxUsername}</span>
              </div>
            )}
            {connection.iaxPassword && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Password</span>
                <span className="console-value">{maskPassword(connection.iaxPassword)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Callsign</span>
              <span className="console-value uppercase">{connection.userCallsign}</span>
            </div>
            {connection.nodeNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Node Number</span>
                <span className="console-value">{connection.nodeNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Phone to IAX Connection Status */}
        <div className="console-section">
          <h4 className="console-label mb-2">Connection Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Phone to IAX connection</span>
            <div className="flex items-center gap-2">
              {connection.phoneToIaxConfirmed ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="console-value">{phoneToIaxStatus}</span>
            </div>
          </div>
        </div>

        {/* Codec Types */}
        <div className="console-section">
          <h4 className="console-label mb-2">Codec Types</h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Selected Codec</span>
            <span className="console-value uppercase">{codecTypeDisplay}</span>
          </div>
        </div>

        {/* AllStar Credentials Section - Optional */}
        {(connection.allstarUsername || connection.allstarPassword) && (
          <div className="console-section">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="console-label">AllStar Credentials</h4>
            </div>
            <div className="space-y-2">
              {connection.allstarUsername && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">AllStar Username</span>
                  <span className="console-value">{connection.allstarUsername}</span>
                </div>
              )}
              {connection.allstarPassword && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">AllStar Password</span>
                  <span className="console-value">{maskPassword(connection.allstarPassword)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onEdit} variant="outline" size="sm" className="flex-1 text-xs">
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit Configuration
          </Button>
          <Button onClick={() => navigate({ to: '/ptt' })} size="sm" className="flex-1 text-xs">
            <Server className="mr-2 h-3.5 w-3.5" />
            Go to PTT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
