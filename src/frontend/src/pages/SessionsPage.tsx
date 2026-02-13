import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Video, AlertCircle, Zap } from 'lucide-react';
import { useListActiveSessions } from '../features/sessions/queries';
import { SessionForm } from '../components/SessionForm';
import { QuickStartDialog } from '../components/QuickStartDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SessionsPage() {
  const navigate = useNavigate();
  const { data: sessions, isLoading, error } = useListActiveSessions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Streaming Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage your multiplatform streaming sessions</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Streaming Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage your multiplatform streaming sessions</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load sessions. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Streaming Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage your multiplatform streaming sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => setIsQuickStartOpen(true)}
          >
            <Zap className="h-5 w-5" />
            Quick Start
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <SessionForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickStartDialog open={isQuickStartOpen} onOpenChange={setIsQuickStartOpen} />

      {!sessions || sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first streaming session to start broadcasting to multiple platforms simultaneously.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsQuickStartOpen(true)} size="lg" variant="outline" className="gap-2">
                <Zap className="h-5 w-5" />
                Quick Start
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/session/$sessionId', params: { sessionId: session.id } })}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{session.title}</CardTitle>
                  {session.isActive && (
                    <Badge variant="default" className="bg-destructive text-destructive-foreground">
                      Live
                    </Badge>
                  )}
                </div>
                <CardDescription>Session ID: {session.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    <span>
                      {session.outputs.length} {session.outputs.length === 1 ? 'output' : 'outputs'} configured
                    </span>
                  </div>
                  {session.videoSourceUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>Video source configured</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
