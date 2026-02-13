import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuickStart } from '../features/sessions/mutations';
import { platformRegistry } from '../platforms/registry';
import type { PlatformFieldValue } from '../platforms/types';

interface QuickStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickStartDialog({ open, onOpenChange }: QuickStartDialogProps) {
  const navigate = useNavigate();
  const quickStart = useQuickStart();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Session details
  const [title, setTitle] = useState('');

  // Step 2: Video source
  const [videoSourceUrl, setVideoSourceUrl] = useState('');

  // Step 3: Output target
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, PlatformFieldValue>>({});

  const platforms = platformRegistry.getAllPlatforms();
  const adapter = selectedPlatform ? platformRegistry.getPlatform(selectedPlatform) : null;

  const handleFieldChange = (fieldId: string, value: PlatformFieldValue) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    setError(null);

    if (step === 1) {
      if (!title.trim()) {
        setError('Session title is required');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!videoSourceUrl.trim()) {
        setError('Video source URL is required');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleStart = async () => {
    setError(null);

    if (!adapter) {
      setError('Please select a platform');
      return;
    }

    // Validate required fields
    const missingFields = adapter.fields
      .filter((field) => field.required && !fieldValues[field.id])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const name = (fieldValues.name as string) || adapter.displayName;
      const url = fieldValues.ingestUrl as string;
      const streamKey = fieldValues.streamKey as string;
      const maxBitrate = BigInt((fieldValues.maxBitrate as number) || 0);
      const categories = adapter.defaultCategories || [];

      await quickStart.mutateAsync({
        sessionId,
        title: title.trim(),
        videoSourceUrl: videoSourceUrl.trim(),
        outputName: name,
        outputProtocol: adapter.protocol,
        outputUrl: url,
        outputStreamKey: streamKey,
        outputMaxBitrate: maxBitrate,
        outputCategories: categories,
      });

      // Navigate to session detail page
      navigate({ to: '/session/$sessionId', params: { sessionId } });
      onOpenChange(false);

      // Reset form
      setStep(1);
      setTitle('');
      setVideoSourceUrl('');
      setSelectedPlatform('');
      setFieldValues({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream');
    }
  };

  const handleClose = () => {
    if (!quickStart.isPending) {
      onOpenChange(false);
      setStep(1);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start Stream
          </DialogTitle>
          <DialogDescription>
            Set up and start streaming in just a few steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    s < step
                      ? 'bg-primary border-primary text-primary-foreground'
                      : s === step
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      s < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Session Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Session Details</h3>
              <div className="space-y-2">
                <Label htmlFor="quickTitle">Session Title</Label>
                <Input
                  id="quickTitle"
                  placeholder="e.g., Weekly Live Stream"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Video Source */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Video Source</h3>
              <div className="space-y-2">
                <Label htmlFor="quickVideo">Video Source URL</Label>
                <Input
                  id="quickVideo"
                  type="url"
                  placeholder="https://example.com/video.mp4 or rtmp://..."
                  value={videoSourceUrl}
                  onChange={(e) => setVideoSourceUrl(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Enter a video file URL or RTMP stream URL
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Output Target */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Streaming Target</h3>
              
              <div className="space-y-2">
                <Label htmlFor="quickPlatform">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger id="quickPlatform">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {adapter && (
                <>
                  {adapter.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`quick-${field.id}`}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === 'text' && (
                        <Input
                          id={`quick-${field.id}`}
                          type={field.sensitive ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={(fieldValues[field.id] as string) || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      )}
                      {field.type === 'number' && (
                        <Input
                          id={`quick-${field.id}`}
                          type="number"
                          placeholder={field.placeholder}
                          value={(fieldValues[field.id] as number) || ''}
                          onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
                        />
                      )}
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || quickStart.isPending}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleClose} disabled={quickStart.isPending}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleStart} disabled={quickStart.isPending} className="gap-2">
                  {quickStart.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Streaming
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
