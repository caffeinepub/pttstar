import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bookmark, Edit, Radio, Info } from 'lucide-react';
import { loadConnection, isIaxDvswitchConnection } from '../hooks/usePreferredConnection';
import type { IaxDvswitchConnection } from '../hooks/usePreferredConnection';

interface IaxDvswitchSavedConfigurationTabProps {
  onEdit: () => void;
  onGoToPtt: () => void;
}

export default function IaxDvswitchSavedConfigurationTab({
  onEdit,
  onGoToPtt,
}: IaxDvswitchSavedConfigurationTabProps) {
  const connection = loadConnection();
  const savedConfig: IaxDvswitchConnection | null =
    connection && isIaxDvswitchConnection(connection) ? connection : null;

  if (!savedConfig) {
    return (
      <Card className="border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            No Saved Configuration
          </CardTitle>
          <CardDescription>You haven't saved an IAX / DVSwitch configuration yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Create and save your first IAX / DVSwitch connection using the Connect tab. You'll need at minimum a gateway address to get started.
            </AlertDescription>
          </Alert>
          <Button onClick={onEdit} variant="default" size="lg" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Go to Connect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Configuration
        </CardTitle>
        <CardDescription>Your stored IAX / DVSwitch connection settings. Click Edit to modify or Go to PTT to connect.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-lg border border-border bg-card/30 p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Gateway</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.gateway}</p>
            </div>
          </div>

          {savedConfig.iaxUsername && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">IAX Username</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.iaxUsername}</p>
            </div>
          )}

          {savedConfig.iaxPassword && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">IAX Password</p>
              <p className="font-mono text-sm text-foreground">••••••••</p>
            </div>
          )}

          {savedConfig.userCallsign && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">User Callsign</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.userCallsign}</p>
            </div>
          )}

          {savedConfig.port && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Port</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.port}</p>
            </div>
          )}

          {savedConfig.nodeNumber && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AllStar Node Number</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.nodeNumber}</p>
            </div>
          )}

          {savedConfig.allstarId && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AllStar ID / Username</p>
              <p className="font-mono text-sm text-foreground">{savedConfig.allstarId}</p>
            </div>
          )}

          {savedConfig.allstarPassword && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AllStar Password</p>
              <p className="font-mono text-sm text-foreground">••••••••</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={onGoToPtt} size="lg" className="w-full">
            <Radio className="mr-2 h-4 w-4" />
            Go to PTT
          </Button>
          <Button onClick={onEdit} variant="outline" size="lg" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
