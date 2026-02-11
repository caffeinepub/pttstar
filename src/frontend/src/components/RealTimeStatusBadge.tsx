import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Radio, AlertCircle } from 'lucide-react';

interface RealTimeStatusBadgeProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isTransmitting: boolean;
  isReceiving: boolean;
}

export default function RealTimeStatusBadge({
  connectionStatus,
  isTransmitting,
  isReceiving,
}: RealTimeStatusBadgeProps) {
  const getStatusInfo = () => {
    if (isTransmitting) {
      return {
        icon: <Radio className="h-3 w-3" />,
        label: 'Transmitting',
        description: 'You are transmitting',
        className: 'bg-status-danger/20 text-status-danger border-status-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]',
      };
    }

    if (isReceiving) {
      return {
        icon: <Radio className="h-3 w-3" />,
        label: 'Receiving',
        description: 'Receiving transmission',
        className: 'bg-status-success/20 text-status-success border-status-success shadow-[0_0_8px_rgba(34,197,94,0.4)]',
      };
    }

    if (connectionStatus === 'connected') {
      return {
        icon: <Wifi className="h-3 w-3" />,
        label: 'Connected',
        description: 'Connected and ready',
        className: 'bg-status-success/20 text-status-success border-status-success shadow-[0_0_6px_rgba(34,197,94,0.3)]',
      };
    }

    if (connectionStatus === 'connecting') {
      return {
        icon: <Wifi className="h-3 w-3 animate-pulse" />,
        label: 'Connecting',
        description: 'Establishing connection',
        className: 'bg-status-warning/20 text-status-warning border-status-warning shadow-[0_0_6px_rgba(234,179,8,0.3)]',
      };
    }

    if (connectionStatus === 'error') {
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Error',
        description: 'Connection failed',
        className: 'bg-status-danger/20 text-status-danger border-status-danger shadow-[0_0_6px_rgba(239,68,68,0.3)]',
      };
    }

    return {
      icon: <WifiOff className="h-3 w-3" />,
      label: 'Disconnected',
      description: 'Not connected',
      className: 'bg-muted/50 text-muted-foreground border-border',
    };
  };

  const status = getStatusInfo();

  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant="outline" className={`flex items-center gap-1.5 ${status.className}`}>
        {status.icon}
        <span className="font-semibold">{status.label}</span>
      </Badge>
      <span className="text-xs text-muted-foreground">{status.description}</span>
    </div>
  );
}
