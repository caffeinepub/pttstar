import { Badge } from '@/components/ui/badge';
import { Radio, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface RealTimeStatusBadgeProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isTransmitting: boolean;
  isReceiving: boolean;
  roomLabel: string;
}

export default function RealTimeStatusBadge({
  connectionStatus,
  isTransmitting,
  isReceiving,
  roomLabel,
}: RealTimeStatusBadgeProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {connectionStatus === 'connected' && (
          <Badge variant="outline" className="bg-status-active/10 text-status-active border-status-active">
            <Wifi className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        )}
        {connectionStatus === 'connecting' && (
          <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">
            <Wifi className="mr-1 h-3 w-3 animate-pulse" />
            Connecting...
          </Badge>
        )}
        {connectionStatus === 'disconnected' && (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <WifiOff className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        )}
        {connectionStatus === 'error' && (
          <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        )}
      </div>

      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-2">
          {isTransmitting && (
            <Badge className="bg-status-error text-white animate-pulse">
              <Radio className="mr-1 h-3 w-3" />
              Transmitting
            </Badge>
          )}
          {isReceiving && !isTransmitting && (
            <Badge className="bg-status-active text-white">
              <Radio className="mr-1 h-3 w-3" />
              Receiving
            </Badge>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Room: {roomLabel}
      </div>
    </div>
  );
}
