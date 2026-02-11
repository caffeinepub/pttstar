import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, AlertCircle, Settings } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import PttControl from '../components/PttControl';
import AudioLevelMeter from '../components/AudioLevelMeter';
import NowHearingList from '../components/NowHearingList';
import RealTimeStatusBadge from '../components/RealTimeStatusBadge';
import { useWebRtcPtt } from '../hooks/useWebRtcPtt';
import { useGetNowHearing } from '../hooks/useNowHearing';
import { loadConnection, isDigitalVoiceConnection, isDigitalVoiceGatewayConfigured, isDirectoryConnection } from '../hooks/usePreferredConnection';
import { deriveRoomKey, deriveRoomLabel } from '../utils/roomKey';

export default function PttPage() {
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ReturnType<typeof loadConnection>>(null);
  const [roomKey, setRoomKey] = useState<string>('');
  const [roomLabel, setRoomLabel] = useState<string>('');
  const [showGatewayWarning, setShowGatewayWarning] = useState(false);

  const { data: nowHearing = [], isLoading: isLoadingActivity } = useGetNowHearing();
  const {
    connectionStatus,
    isTransmitting,
    isReceiving,
    error,
    joinRoom,
    leaveRoom,
    startTransmit,
    stopTransmit,
  } = useWebRtcPtt(roomKey);

  useEffect(() => {
    const conn = loadConnection();
    setConnection(conn);

    if (conn) {
      const key = deriveRoomKey(conn);
      const label = deriveRoomLabel(conn);
      setRoomKey(key);
      setRoomLabel(label);

      // Check if Digital Voice gateway is configured
      if (isDigitalVoiceConnection(conn)) {
        const gatewayConfigured = isDigitalVoiceGatewayConfigured(conn);
        setShowGatewayWarning(!gatewayConfigured);
      } else {
        setShowGatewayWarning(false);
      }
    }
  }, []);

  const handleTransmitStart = async () => {
    if (connectionStatus === 'connected') {
      await startTransmit();
    }
  };

  const handleTransmitStop = () => {
    stopTransmit();
  };

  const handleJoinRoom = async () => {
    if (showGatewayWarning) {
      // Don't allow joining if gateway is not configured
      return;
    }
    await joinRoom();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const hasError = connectionStatus === 'error';

  // Determine network label for display
  let networkLabel = 'Unknown Network';
  let talkgroupValue = '';
  
  if (connection) {
    if (isDigitalVoiceConnection(connection)) {
      networkLabel = `${connection.mode.toUpperCase()} / ${connection.reflector}`;
      if (connection.bmServerLabel) {
        networkLabel += ` (${connection.bmServerLabel})`;
      }
      talkgroupValue = connection.talkgroup || '';
    } else if (isDirectoryConnection(connection)) {
      networkLabel = connection.network.networkLabel;
      talkgroupValue = connection.talkgroup;
    } else {
      networkLabel = roomLabel;
    }
  }

  if (!connection) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Push-to-Talk
            </CardTitle>
            <CardDescription>No connection configured</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to configure a connection before using PTT. Go to the Connect page to set up your connection.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/connect' })} className="mt-4">
              <Settings className="mr-2 h-4 w-4" />
              Go to Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      {/* Gateway Warning for Digital Voice */}
      {showGatewayWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Digital Voice Gateway not configured. Real transmission is not available. Please configure the gateway to enable actual voice transmission.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/connect' })}
              className="ml-4 shrink-0"
            >
              Configure Gateway
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Push-to-Talk
          </CardTitle>
          <CardDescription>Real-time voice transmission control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-time Status */}
          <div className="space-y-3">
            <RealTimeStatusBadge
              connectionStatus={connectionStatus}
              isTransmitting={isTransmitting}
              isReceiving={isReceiving}
            />
          </div>

          {/* Connection Info */}
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            <h4 className="text-sm font-medium">Connection Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium">{networkLabel}</span>
              </div>
              {talkgroupValue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Talkgroup</span>
                  <Badge variant="outline">{talkgroupValue}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Room Key</span>
                <span className="text-sm font-mono text-muted-foreground">{roomKey}</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {hasError && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Audio Level Meter */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Audio Level</h4>
            <AudioLevelMeter disabled={!isConnected} />
          </div>

          {/* PTT Control */}
          <div className="flex flex-col items-center gap-4">
            <PttControl
              onTransmitStart={handleTransmitStart}
              onTransmitStop={handleTransmitStop}
              disabled={!isConnected || showGatewayWarning}
              isTransmitting={isTransmitting}
            />
            <p className="text-center text-sm text-muted-foreground">
              {showGatewayWarning
                ? 'Configure gateway to enable transmission'
                : isConnected
                ? 'Press and hold to transmit'
                : 'Join room to enable transmission'}
            </p>
          </div>

          {/* Room Controls */}
          <div className="flex gap-3">
            {!isConnected ? (
              <Button
                onClick={handleJoinRoom}
                className="flex-1"
                disabled={isConnecting || showGatewayWarning}
              >
                {isConnecting ? 'Connecting...' : 'Join Room'}
              </Button>
            ) : (
              <Button onClick={handleLeaveRoom} variant="outline" className="flex-1">
                Leave Room
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Now Hearing</CardTitle>
          <CardDescription>Recent transmissions on this network</CardDescription>
        </CardHeader>
        <CardContent>
          <NowHearingList transmissions={nowHearing} isLoading={isLoadingActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
