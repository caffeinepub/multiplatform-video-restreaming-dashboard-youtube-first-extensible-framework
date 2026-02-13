import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Loader2, CheckCircle2 } from 'lucide-react';
import { useSetVideoSource } from '../features/sessions/mutations';

interface VideoSourcePanelProps {
  sessionId: string;
  currentVideoSource?: string;
}

export function VideoSourcePanel({ sessionId, currentVideoSource }: VideoSourcePanelProps) {
  const [videoUrl, setVideoUrl] = useState(currentVideoSource || '');
  const setVideoSource = useSetVideoSource();

  const handleSave = async () => {
    if (!videoUrl.trim()) return;
    await setVideoSource.mutateAsync({ sessionId, videoSourceUrl: videoUrl.trim() });
  };

  const hasChanges = videoUrl !== (currentVideoSource || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Source
        </CardTitle>
        <CardDescription>Configure the video media source for this session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVideoSource && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Video source configured: {currentVideoSource}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video Source URL</Label>
          <Input
            id="videoUrl"
            type="url"
            placeholder="https://example.com/video.mp4 or rtmp://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter a video file URL or RTMP stream URL to use as your video source
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={setVideoSource.isPending || !videoUrl.trim() || !hasChanges}
          className="w-full"
        >
          {setVideoSource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentVideoSource ? 'Update Video Source' : 'Set Video Source'}
        </Button>
      </CardContent>
    </Card>
  );
}
