import { useState, useRef } from 'react';
import { Radio } from 'lucide-react';

interface PttControlProps {
  disabled?: boolean;
  onRecordingComplete?: (blobUrl: string) => void;
  onTransmitStart?: () => void;
  onTransmitStop?: () => void;
  isTransmitting?: boolean;
}

export default function PttControl({ 
  disabled = false, 
  onRecordingComplete,
  onTransmitStart,
  onTransmitStop,
  isTransmitting = false,
}: PttControlProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePressStart = () => {
    if (disabled) return;
    setIsPressed(true);
    if (onTransmitStart) {
      onTransmitStart();
    }
  };

  const handlePressEnd = () => {
    if (disabled) return;
    setIsPressed(false);
    if (onTransmitStop) {
      onTransmitStop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        ref={buttonRef}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        disabled={disabled}
        className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 transition-all ${
          disabled
            ? 'cursor-not-allowed border-muted bg-muted text-muted-foreground'
            : isPressed || isTransmitting
              ? 'border-status-error bg-status-error text-white shadow-lg shadow-status-error/50'
              : 'border-status-active bg-status-active text-white shadow-md hover:shadow-lg'
        }`}
        aria-label="Push to talk"
      >
        <Radio className="h-12 w-12" />
        {(isPressed || isTransmitting) && (
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-status-error opacity-75" />
        )}
      </button>
      <div className="text-center">
        <div className="text-sm font-medium text-foreground">
          {disabled ? 'Disabled' : (isPressed || isTransmitting) ? 'Transmitting...' : 'Press & Hold to Talk'}
        </div>
        <div className="text-xs text-muted-foreground">
          {disabled ? 'Complete license acknowledgement' : 'Release to stop'}
        </div>
      </div>
    </div>
  );
}
