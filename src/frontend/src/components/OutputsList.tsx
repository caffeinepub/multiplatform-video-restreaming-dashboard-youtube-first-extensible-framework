import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, AlertCircle, Video } from 'lucide-react';
import { useGetOutputs } from '../features/sessions/queries';
import { StreamKeyNotice } from './StreamKeyNotice';
import { toast } from 'sonner';
import type { StreamTargetId } from '../backend';

interface OutputsListProps {
  sessionId: string;
  outputIds: StreamTargetId[];
}

export function OutputsList({ sessionId, outputIds }: OutputsListProps) {
  const { data: outputs, isLoading, error } = useGetOutputs(outputIds);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load outputs. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!outputs || outputs.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No outputs configured</h3>
        <p className="text-muted-foreground">Add a streaming target to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StreamKeyNotice />
      {outputs.map((output) => (
        <Card key={output.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {output.name}
                  <Badge variant="outline">{output.protocol.toUpperCase()}</Badge>
                </CardTitle>
                <CardDescription>Target ID: {output.id.toString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ingest URL</Label>
              <div className="flex gap-2">
                <Input value={output.url} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(output.url, 'Ingest URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stream Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={output.stream_key}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(output.stream_key, 'Stream key')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {output.max_bitrate > 0 && (
              <div className="space-y-2">
                <Label>Max Bitrate</Label>
                <Input
                  value={`${output.max_bitrate} kbps`}
                  readOnly
                  className="text-sm"
                />
              </div>
            )}

            {output.ingest_categories.length > 0 && (
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {output.ingest_categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
