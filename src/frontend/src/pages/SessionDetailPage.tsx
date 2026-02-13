import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Play, Square, Plus, AlertCircle } from 'lucide-react';
import { useGetSession } from '../features/sessions/queries';
import { useStartSession, useStopSession } from '../features/sessions/mutations';
import { OutputsList } from '../components/OutputsList';
import { PlatformTargetForm } from '../components/PlatformTargetForm';
import { VideoSourcePanel } from '../components/VideoSourcePanel';
import { LayersPanel } from '../components/LayersPanel';
import { StreamHealthPanel } from '../components/StreamHealthPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams({ from: '/session/$sessionId' });
  const { data: session, isLoading, error } = useGetSession(sessionId);
  const startSession = useStartSession();
  const stopSession = useStopSession();
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);

  const handleStartStop = async () => {
    if (!session) return;
    
    try {
      if (session.isActive) {
        await stopSession.mutateAsync(session.id);
      } else {
        await startSession.mutateAsync(session.id);
      }
    } catch (err) {
      console.error('Failed to toggle session state:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load session. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const canStartStream = session.outputs.length > 0 && !!session.videoSourceUrl;
  const startBlockedReason = !session.videoSourceUrl
    ? 'Please configure a video source before starting the stream'
    : session.outputs.length === 0
    ? 'Please add at least one output target before starting the stream'
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{session.title}</h1>
              {session.isActive && (
                <Badge variant="default" className="bg-destructive text-destructive-foreground">
                  Live
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Session ID: {session.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStartStop}
            disabled={startSession.isPending || stopSession.isPending || (!session.isActive && !canStartStream)}
            variant={session.isActive ? 'destructive' : 'default'}
            size="lg"
            className="gap-2"
          >
            {session.isActive ? (
              <>
                <Square className="h-5 w-5" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Stream
              </>
            )}
          </Button>
        </div>
      </div>

      {!session.isActive && startBlockedReason && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{startBlockedReason}</AlertDescription>
        </Alert>
      )}

      <StreamHealthPanel session={session} />

      <VideoSourcePanel sessionId={session.id} currentVideoSource={session.videoSourceUrl} />

      <LayersPanel sessionId={session.id} layerIds={session.layers} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Output Targets</CardTitle>
              <CardDescription>Streaming destinations for this session</CardDescription>
            </div>
            <Sheet open={isAddTargetOpen} onOpenChange={setIsAddTargetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Target
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add Streaming Target</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <PlatformTargetForm
                    sessionId={session.id}
                    onSuccess={() => setIsAddTargetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {session.outputs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No output targets configured yet.</p>
              <p className="text-sm mt-1">Add a target to start streaming.</p>
            </div>
          ) : (
            <OutputsList sessionId={session.id} outputIds={session.outputs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
