import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, Edit, AlertCircle, Hash } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { loadConnection, isIaxDvswitchConnection } from '../hooks/usePreferredConnection';

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            IAX / DVSwitch Configuration
          </CardTitle>
          <CardDescription>No saved IAX / DVSwitch configuration found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You haven't configured an IAX or DVSwitch connection yet. Use the form above to set up your connection.
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Saved IAX / DVSwitch Configuration
        </CardTitle>
        <CardDescription>Your current IAX or DVSwitch connection settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gateway Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Gateway / Server</span>
            <span className="font-mono text-sm">{connection.gateway}</span>
          </div>
          {connection.iaxUsername && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">IAX Username</span>
              <span className="font-mono text-sm">{connection.iaxUsername}</span>
            </div>
          )}
          {connection.iaxPassword && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">IAX Password</span>
              <span className="font-mono text-sm">{maskPassword(connection.iaxPassword)}</span>
            </div>
          )}
          {connection.userCallsign && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">User Callsign</span>
              <span className="font-mono text-sm uppercase">{connection.userCallsign}</span>
            </div>
          )}
        </div>

        {/* Port & Node */}
        {(connection.port || connection.nodeNumber) && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Port & Node</h4>
            </div>
            <div className="space-y-2">
              {connection.port && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Port</span>
                  <span className="font-mono text-sm">{connection.port}</span>
                </div>
              )}
              {connection.nodeNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Node Number</span>
                  <span className="font-mono text-sm">{connection.nodeNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AllStar Credentials */}
        {(connection.allstarId || connection.allstarPassword) && (
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">AllStar Credentials</h4>
            </div>
            <div className="space-y-2">
              {connection.allstarId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AllStar ID / Username</span>
                  <span className="font-mono text-sm">{connection.allstarId}</span>
                </div>
              )}
              {connection.allstarPassword && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AllStar Password</span>
                  <span className="font-mono text-sm">{maskPassword(connection.allstarPassword)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onEdit} variant="outline" className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Button>
          <Button onClick={() => navigate({ to: '/ptt' })} className="flex-1">
            <Server className="mr-2 h-4 w-4" />
            Go to PTT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
