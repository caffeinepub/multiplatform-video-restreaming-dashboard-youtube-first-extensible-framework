import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function StreamKeyNotice() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        Stream keys are stored as configuration data. For production use, consider additional security measures
        for sensitive credentials.
      </AlertDescription>
    </Alert>
  );
}
