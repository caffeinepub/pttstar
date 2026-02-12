import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, AlertCircle, Wifi, Activity as ActivityIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import ColorPageHeader from '../components/ColorPageHeader';
import PttControl from '../components/PttControl';
import AudioLevelMeter from '../components/AudioLevelMeter';
import NowHearingList from '../components/NowHearingList';
import RealTimeStatusBadge from '../components/RealTimeStatusBadge';
import { useWebRtcPtt } from '../hooks/useWebRtcPtt';
import { useAudioLevelMeter } from '../hooks/useAudioLevelMeter';
import { useGetNowHearing } from '../hooks/useNowHearing';
import { loadConnection, isDigitalVoiceConnection, isIaxDvswitchConnection, isDirectoryBasedConnection, isDigitalVoiceGatewayConfigured, isBrandmeisterDmrConnection, getBrandmeisterMissingFields } from '../hooks/usePreferredConnection';
import { deriveRoomKey, deriveRoomLabel } from '../utils/roomKey';

export default function PttPage() {
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ReturnType<typeof loadConnection>>(null);
  const [roomKey, setRoomKey] = useState<string>('');
  const [roomLabel, setRoomLabel] = useState<string>('');

  useEffect(() => {
    const conn = loadConnection();
    setConnection(conn);
    
    if (conn && (isDigitalVoiceConnection(conn) || isIaxDvswitchConnection(conn) || isDirectoryBasedConnection(conn))) {
      const key = deriveRoomKey(conn);
      const label = deriveRoomLabel(conn);
      setRoomKey(key);
      setRoomLabel(label);
    }
  }, []);

  const {
    connectionStatus,
    isTransmitting,
    isReceiving,
    joinRoom,
    leaveRoom,
    startTransmit,
    stopTransmit,
    error,
  } = useWebRtcPtt(roomKey);

  const { level, isActive } = useAudioLevelMeter(isTransmitting);

  const { data: transmissions = [], isLoading: isLoadingActivity } = useGetNowHearing();

  // Auto-connect for BrandMeister DMR when configuration is complete
  useEffect(() => {
    if (connection && isDigitalVoiceConnection(connection) && isBrandmeisterDmrConnection(connection)) {
      const missingFields = getBrandmeisterMissingFields(connection);
      if (missingFields.length === 0 && connectionStatus === 'disconnected') {
        console.log('PttPage: Auto-connecting to BrandMeister DMR');
        joinRoom();
      }
    }
  }, [connection, connectionStatus, joinRoom]);

  const hasConnection = connection !== null && (isDigitalVoiceConnection(connection) || isIaxDvswitchConnection(connection) || isDirectoryBasedConnection(connection));
  const isDigitalVoice = connection && isDigitalVoiceConnection(connection);
  const isGatewayConfigured = isDigitalVoice ? isDigitalVoiceGatewayConfigured(connection) : false;
  const isBrandmeisterDmr = connection && isDigitalVoiceConnection(connection) && isBrandmeisterDmrConnection(connection);
  const brandmeisterMissingFields = isBrandmeisterDmr ? getBrandmeisterMissingFields(connection) : [];
  const hasBrandmeisterMissingFields = brandmeisterMissingFields.length > 0;

  if (!hasConnection) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <ColorPageHeader
          title="PTT"
          subtitle="Push-to-talk control and real-time status"
          variant="ptt"
          icon={<Radio className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-2xl">
          <Alert className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              No connection configured. Please go to Connection Settings to set up your gateway or network.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/connect' })} className="mt-4 w-full text-xs">
            Go to Connection Settings
          </Button>
        </div>
      </div>
    );
  }

  if (hasBrandmeisterMissingFields) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <ColorPageHeader
          title="PTT"
          subtitle="Push-to-talk control and real-time status"
          variant="ptt"
          icon={<Radio className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              <strong>BrandMeister configuration incomplete.</strong> Missing: {brandmeisterMissingFields.join(', ')}. Please complete your configuration before using PTT.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/connect' })} className="mt-4 w-full text-xs">
            Complete Configuration
          </Button>
        </div>
      </div>
    );
  }

  if (isDigitalVoice && !isGatewayConfigured) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <ColorPageHeader
          title="PTT"
          subtitle="Push-to-talk control and real-time status"
          variant="ptt"
          icon={<Radio className="h-7 w-7" />}
        />
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              <strong>Gateway not configured.</strong> Real transmission is not available. Please configure the Digital Voice Gateway in Connection Settings to enable actual voice transmission.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/connect' })} className="mt-4 w-full text-xs">
            Configure Gateway
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <ColorPageHeader
        title="PTT"
        subtitle="Push-to-talk control and real-time status"
        variant="ptt"
        icon={<Radio className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        {/* Connection Info */}
        <Card className="console-panel">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Connection Status</CardTitle>
              <RealTimeStatusBadge
                connectionStatus={connectionStatus}
                isTransmitting={isTransmitting}
                isReceiving={isReceiving}
              />
            </div>
            <CardDescription className="text-xs">{roomLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <Alert variant="destructive" className="console-panel">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {connectionStatus === 'disconnected' && (
                <Button onClick={joinRoom} className="flex-1 text-xs">
                  <Wifi className="mr-2 h-3.5 w-3.5" />
                  Join Room
                </Button>
              )}
              {connectionStatus === 'connected' && (
                <Button onClick={leaveRoom} variant="outline" className="flex-1 text-xs">
                  <Wifi className="mr-2 h-3.5 w-3.5" />
                  Leave Room
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transmit Control */}
        <Card className="console-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transmit</CardTitle>
            <CardDescription className="text-xs">Press and hold to transmit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioLevelMeter />
            <PttControl
              disabled={connectionStatus !== 'connected'}
              onTransmitStart={startTransmit}
              onTransmitStop={stopTransmit}
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="console-panel">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ActivityIcon className="h-4 w-4" />
              Activity
            </CardTitle>
            <CardDescription className="text-xs">Recent transmissions</CardDescription>
          </CardHeader>
          <CardContent>
            <NowHearingList transmissions={transmissions} isLoading={isLoadingActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
