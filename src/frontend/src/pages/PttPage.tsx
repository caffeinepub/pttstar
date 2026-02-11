import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import PttControl from '../components/PttControl';
import AudioLevelMeter from '../components/AudioLevelMeter';
import TransmitDisclaimer from '../components/TransmitDisclaimer';
import RealTimeStatusBadge from '../components/RealTimeStatusBadge';
import { Radio, Wifi, AlertCircle, Info, Server } from 'lucide-react';
import {
  loadConnection,
  isIaxDvswitchConnection,
  isDirectoryConnection,
  type StoredConnection,
} from '../hooks/usePreferredConnection';
import { deriveRoomKey, deriveRoomLabel } from '../utils/roomKey';
import { useWebRtcPtt } from '../hooks/useWebRtcPtt';
import { useMicPttRecorder } from '../hooks/useMicPttRecorder';

export default function PttPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const [connection, setConnection] = useState<StoredConnection | null>(null);
  const [lastRecording, setLastRecording] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadConnection();
    if (loaded) {
      setConnection(loaded);
    }
  }, []);

  const roomKey = deriveRoomKey(connection);
  const roomLabel = deriveRoomLabel(connection);

  const {
    connectionStatus,
    isTransmitting,
    isReceiving,
    error: webRtcError,
    joinRoom,
    leaveRoom,
    startTransmit,
    stopTransmit,
  } = useWebRtcPtt(roomKey);

  // Fallback recorder for testing
  const { error: recorderError } = useMicPttRecorder(setLastRecording);

  const canTransmit = userProfile?.licenseAcknowledgement === true;
  const isIaxConnection = connection && isIaxDvswitchConnection(connection);

  // Auto-join room when authenticated and connection exists
  useEffect(() => {
    if (connection && connectionStatus === 'disconnected') {
      joinRoom();
    }
  }, [connection, connectionStatus, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  if (!connection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Connection</CardTitle>
            <CardDescription>You need to connect to a network first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/connect' })}>
              <Wifi className="mr-2 h-4 w-4" />
              Go to Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayError = webRtcError || (recorderError === 'permission-denied' ? 'Microphone permission denied. Please allow microphone access in your browser settings.' : null);

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Push to Talk</h1>
        <p className="text-muted-foreground">Hold the button to transmit live audio.</p>
      </div>

      {isIaxConnection && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>In-App Voice</AlertTitle>
          <AlertDescription>
            IAX / DVSwitch settings are used for room identification. Real-time voice is transmitted in-app between users, not to external ham radio networks.
          </AlertDescription>
        </Alert>
      )}

      {!canTransmit && (
        <div className="mb-6">
          <TransmitDisclaimer />
        </div>
      )}

      {displayError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>PTT Control</CardTitle>
              <CardDescription>Press and hold to transmit live audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <RealTimeStatusBadge
                  connectionStatus={connectionStatus}
                  isTransmitting={isTransmitting}
                  isReceiving={isReceiving}
                  roomLabel={roomLabel}
                />
              </div>

              <div className="flex flex-col items-center justify-center py-8">
                <PttControl
                  onTransmitStart={startTransmit}
                  onTransmitStop={stopTransmit}
                  isTransmitting={isTransmitting}
                  disabled={!canTransmit || connectionStatus !== 'connected'}
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Audio Level</div>
                <AudioLevelMeter disabled={!canTransmit} />
              </div>

              {lastRecording && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="text-sm font-medium text-muted-foreground">Fallback Test Recording</div>
                  <audio controls src={lastRecording} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    This is a local recording for testing. Real-time audio is transmitted live to other users.
                  </p>
                </div>
              )}

              {!canTransmit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must acknowledge your amateur radio license in Settings before transmitting.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isIaxConnection ? (
                  <>
                    <Server className="h-5 w-5" />
                    IAX / DVSwitch Info
                  </>
                ) : (
                  <>
                    <Radio className="h-5 w-5" />
                    Connection Info
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isIaxConnection ? (
                <>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Gateway</div>
                    <div className="text-sm font-medium text-foreground font-mono">{connection.gateway}</div>
                  </div>
                  {connection.iaxUsername && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground">IAX Username</div>
                      <div className="text-sm font-medium text-foreground font-mono">{connection.iaxUsername}</div>
                    </div>
                  )}
                  {connection.iaxPassword && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground">IAX Password</div>
                      <div className="text-sm font-medium text-foreground font-mono">••••••••</div>
                    </div>
                  )}
                  {connection.port && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground">Port</div>
                      <div className="text-sm font-medium text-foreground font-mono">{connection.port}</div>
                    </div>
                  )}
                  {connection.nodeNumber && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground">AllStar Node</div>
                      <div className="text-sm font-medium text-foreground font-mono">{connection.nodeNumber}</div>
                    </div>
                  )}
                </>
              ) : isDirectoryConnection(connection) ? (
                <>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Mode</div>
                    <div className="text-sm font-medium text-foreground">{connection.network.mode.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Network</div>
                    <div className="text-sm font-medium text-foreground">{connection.network.networkLabel}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Address</div>
                    <div className="text-xs text-muted-foreground">{connection.network.address}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">Talkgroup</div>
                    <div className="text-sm font-medium text-foreground">{connection.talkgroup}</div>
                  </div>
                </>
              ) : null}
              <Button
                onClick={() => navigate({ to: '/connect' })}
                variant="outline"
                className="w-full"
              >
                <Wifi className="mr-2 h-4 w-4" />
                Change Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
