import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import type { Session, Output } from '../backend';
import { useGetOutput } from '../features/sessions/queries';
import { getYouTubeVerification, setYouTubeVerification, type VerificationStatus } from '../lib/youtubeVerificationStorage';

interface StreamHealthPanelProps {
  session: Session;
}

interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function StreamHealthPanel({ session }: StreamHealthPanelProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [networkSupported, setNetworkSupported] = useState(true);
  const [youtubeVerification, setYoutubeVerificationState] = useState(getYouTubeVerification(session.id));

  // Check for Network Information API
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      setNetworkSupported(false);
      return;
    }

    const updateNetworkInfo = () => {
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    };

    updateNetworkInfo();
    connection.addEventListener('change', updateNetworkInfo);

    return () => {
      connection.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  const handleVerificationChange = (status: VerificationStatus) => {
    const updated = { ...youtubeVerification, status };
    setYoutubeVerificationState(updated);
    setYouTubeVerification(session.id, updated);
  };

  const handleYoutubeUrlChange = (url: string) => {
    const updated = { ...youtubeVerification, youtubeUrl: url };
    setYoutubeVerificationState(updated);
    setYouTubeVerification(session.id, updated);
  };

  // Configuration readiness checks
  const hasVideoSource = !!session.videoSourceUrl;
  const hasOutputs = session.outputs.length > 0;

  // Check if outputs have required fields (we'll check the first output as a sample)
  const OutputFieldsCheck = ({ outputId }: { outputId: bigint }) => {
    const { data: output } = useGetOutput(outputId);
    
    if (!output) return null;

    const hasRequiredFields = !!(output.url && output.stream_key);

    return (
      <div className="flex items-center gap-2 text-sm">
        {hasRequiredFields ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span>{output.name}: {hasRequiredFields ? 'Configured' : 'Missing fields'}</span>
      </div>
    );
  };

  const isLowBandwidth = networkInfo && (
    networkInfo.effectiveType === 'slow-2g' || 
    networkInfo.effectiveType === '2g' ||
    (networkInfo.downlink !== undefined && networkInfo.downlink < 1)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Stream Health & Readiness
        </CardTitle>
        <CardDescription>
          Configuration checklist and network status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Readiness */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Configuration Checklist</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {hasVideoSource ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span>Video source configured</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {hasOutputs ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span>At least one output target configured</span>
            </div>

            {hasOutputs && session.outputs.map((outputId) => (
              <OutputFieldsCheck key={outputId.toString()} outputId={outputId} />
            ))}
          </div>

          {(!hasVideoSource || !hasOutputs) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Complete the configuration checklist above before starting the stream.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Network Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            {networkSupported ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            Network Status
          </h4>

          {!networkSupported ? (
            <Alert>
              <AlertDescription className="text-sm">
                Network speed information not available in this browser. The Network Information API is not supported.
              </AlertDescription>
            </Alert>
          ) : networkInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connection Type:</span>
                <Badge variant="outline">{networkInfo.effectiveType || 'unknown'}</Badge>
              </div>
              
              {networkInfo.downlink !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Downlink Speed:</span>
                  <span>{networkInfo.downlink.toFixed(1)} Mbps</span>
                </div>
              )}

              {networkInfo.rtt !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Round-trip Time:</span>
                  <span>{networkInfo.rtt} ms</span>
                </div>
              )}

              {isLowBandwidth && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Low Bandwidth Detected</AlertTitle>
                  <AlertDescription className="text-sm">
                    Your current network connection appears to be slow. This may cause buffering, stream drops, or quality issues. Consider:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Switching to a faster network (WiFi or wired)</li>
                      <li>Reducing stream bitrate settings</li>
                      <li>Closing other bandwidth-intensive applications</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading network information...</p>
          )}
        </div>

        <Separator />

        {/* YouTube Verification */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">YouTube Stream Verification</h4>
          
          <Alert>
            <AlertDescription className="text-sm space-y-2">
              <p><strong>Manual verification required:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open YouTube Studio → Go Live → Stream</li>
                <li>Check if your stream appears in the Live Control Room</li>
                <li>Verify the stream preview is showing your content</li>
                <li>Update the status below based on what you see</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is a manual checklist. Automatic verification requires YouTube API access which is not configured.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="ytVerification">Verification Status</Label>
            <Select
              value={youtubeVerification.status}
              onValueChange={(val) => handleVerificationChange(val as VerificationStatus)}
            >
              <SelectTrigger id="ytVerification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-checked">Not Checked</SelectItem>
                <SelectItem value="verified">✓ Verified Receiving</SelectItem>
                <SelectItem value="not-receiving">✗ Not Receiving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ytUrl">YouTube Studio / Watch URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="ytUrl"
                type="url"
                placeholder="https://studio.youtube.com/... or https://youtube.com/watch?v=..."
                value={youtubeVerification.youtubeUrl || ''}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
              />
              {youtubeVerification.youtubeUrl && (
                <a
                  href={youtubeVerification.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Paste your YouTube Studio or watch page URL for quick access
            </p>
          </div>

          {youtubeVerification.status === 'verified' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                Stream verified as receiving on YouTube
              </AlertDescription>
            </Alert>
          )}

          {youtubeVerification.status === 'not-receiving' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Stream not receiving on YouTube. Check your RTMP settings and stream key.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
