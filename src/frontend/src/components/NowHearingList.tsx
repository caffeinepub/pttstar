import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock, User, MapPin, Hash } from 'lucide-react';
import type { PersistentTransmission } from '../backend';

interface NowHearingListProps {
  transmissions: PersistentTransmission[];
  isLoading: boolean;
}

export default function NowHearingList({ transmissions, isLoading }: NowHearingListProps) {
  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading activity...</div>;
  }

  if (transmissions.length === 0) {
    return (
      <div className="py-12 text-center">
        <Radio className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">No recent activity</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Transmissions will appear here in real-time
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{transmissions.length} recent transmissions</span>
        <Badge variant="outline" className="text-xs bg-status-active/10 text-status-active border-status-active">
          Live
        </Badge>
      </div>
      {transmissions.map((tx, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Radio className="h-4 w-4 text-status-active" />
                <span className="font-mono text-sm font-bold text-foreground">{tx.fromCallsign}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Network:</span> {tx.network}
                </div>
                <div>
                  <span className="font-medium">Talkgroup:</span> {tx.talkgroup}
                </div>
                {tx.dmrId !== undefined && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-medium">DMR ID:</span> {tx.dmrId.toString()}
                  </div>
                )}
                {tx.dmrOperatorName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">Name:</span> {tx.dmrOperatorName}
                  </div>
                )}
                {tx.dmrOperatorLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">Location:</span> {tx.dmrOperatorLocation}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(Number(tx.timestamp) / 1000000).toLocaleTimeString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
