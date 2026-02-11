import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function TransmitDisclaimer() {
  return (
    <Alert variant="destructive" className="border-status-warning/50 bg-status-warning/10 shadow-lg shadow-status-warning/10">
      <AlertTriangle className="h-5 w-5 text-status-warning" />
      <AlertTitle className="text-status-warning">License Acknowledgement Required</AlertTitle>
      <AlertDescription className="text-foreground">
        You must acknowledge that you hold a valid amateur radio license before using real-time voice features.{' '}
        <Link to="/settings" className="font-medium underline">
          Complete setup in Settings
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
