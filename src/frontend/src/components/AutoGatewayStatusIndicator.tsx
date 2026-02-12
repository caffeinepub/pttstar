import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Zap } from 'lucide-react';
import { getInferredPreset } from '../utils/gatewayUrlBootstrap';

export default function AutoGatewayStatusIndicator() {
  const inferredPreset = getInferredPreset();

  if (!inferredPreset) {
    return (
      <Alert className="console-panel">
        <Info className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">
          <strong>Configuration Mode:</strong> Manual setup
        </AlertDescription>
      </Alert>
    );
  }

  const presetLabel = inferredPreset === 'brandmeister-dmr' ? 'BrandMeister DMR' : 'AllStar';

  return (
    <Alert className="console-panel border-primary/30 bg-primary/10">
      <Zap className="h-3.5 w-3.5 text-primary" />
      <AlertDescription className="text-xs">
        <div className="flex items-center gap-2">
          <strong>Auto-Configuration Active:</strong>
          <Badge variant="outline" className="text-xs">{presetLabel}</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">
          Gateway parameters were automatically detected and applied. You can edit any field as needed.
        </p>
      </AlertDescription>
    </Alert>
  );
}
