import { useEffect, useState } from 'react';
import { useAudioLevelMeter } from '../hooks/useAudioLevelMeter';

interface AudioLevelMeterProps {
  disabled?: boolean;
}

export default function AudioLevelMeter({ disabled = false }: AudioLevelMeterProps) {
  const { level, isActive } = useAudioLevelMeter(!disabled);
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    if (disabled) {
      setDisplayLevel(0);
    } else {
      setDisplayLevel(level);
    }
  }, [level, disabled]);

  const segments = 20;
  const activeSegments = Math.round((displayLevel / 100) * segments);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Input Level</span>
        <span className="text-xs text-muted-foreground">{isActive && !disabled ? 'Active' : 'Inactive'}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const color =
            i < segments * 0.6
              ? 'bg-status-active'
              : i < segments * 0.85
                ? 'bg-status-warning'
                : 'bg-status-error';
          return (
            <div
              key={i}
              className={`h-6 flex-1 rounded-sm transition-colors ${isActive ? color : 'bg-muted'}`}
            />
          );
        })}
      </div>
    </div>
  );
}
