import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, CheckCircle2, AlertCircle, Sparkles, RotateCcw, FileText, Info } from 'lucide-react';
import { useQuickStart } from '../features/sessions/mutations';
import { platformRegistry } from '../platforms/registry';
import type { PlatformFieldValue } from '../platforms/types';
import { generateFireplaceTitle } from '../lib/fireplaceTitles';
import { getLastUsedTitle, setLastUsedTitle, getLastUsedVideoUrl, setLastUsedVideoUrl } from '../lib/quickStartStorage';
import { isGoogleDriveLink, getGoogleDrivePermissionsGuidance } from '../lib/googleDriveLinks';
import { parsePresetsFromText, getPresetFormatInstructions, type StreamPreset } from '../lib/presetImport';

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

  // Preset import
  const [showPresetImport, setShowPresetImport] = useState(false);
  const [presetText, setPresetText] = useState('');
  const [parsedPresets, setParsedPresets] = useState<StreamPreset[]>([]);
  const [presetErrors, setPresetErrors] = useState<string[]>([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  const platforms = platformRegistry.getAllPlatforms();
  const adapter = selectedPlatform ? platformRegistry.getPlatform(selectedPlatform) : null;

  const lastUsedTitle = getLastUsedTitle();
  const lastUsedVideoUrl = getLastUsedVideoUrl();

  // Auto-fill video URL on step 2
  useEffect(() => {
    if (step === 2 && !videoSourceUrl && lastUsedVideoUrl) {
      setVideoSourceUrl(lastUsedVideoUrl);
    }
  }, [step, lastUsedVideoUrl]);

  const handleFieldChange = (fieldId: string, value: PlatformFieldValue) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerateTitle = () => {
    setTitle(generateFireplaceTitle());
  };

  const handleUsePreviousTitle = () => {
    if (lastUsedTitle) {
      setTitle(lastUsedTitle);
    }
  };

  const handleParsePresets = () => {
    const result = parsePresetsFromText(presetText);
    setParsedPresets(result.presets);
    setPresetErrors(result.errors);
    setSelectedPresetIndex(null);
  };

  const handleApplyPreset = () => {
    if (selectedPresetIndex === null || !parsedPresets[selectedPresetIndex]) return;

    const preset = parsedPresets[selectedPresetIndex];
    
    // Fill in all fields
    setTitle(preset.title);
    setVideoSourceUrl(preset.videoLink);
    setSelectedPlatform('youtube');
    setFieldValues({
      name: preset.title,
      ingestUrl: preset.ingestUrl,
      streamKey: preset.streamKey,
      maxBitrate: 4500,
    });

    // Close preset import and move to step 1
    setShowPresetImport(false);
    setStep(1);
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

      // Save last used values
      setLastUsedTitle(title.trim());
      setLastUsedVideoUrl(videoSourceUrl.trim());

      // Navigate to session detail page
      navigate({ to: '/session/$sessionId', params: { sessionId } });
      onOpenChange(false);

      // Reset form
      setStep(1);
      setTitle('');
      setVideoSourceUrl('');
      setSelectedPlatform('');
      setFieldValues({});
      setShowPresetImport(false);
      setPresetText('');
      setParsedPresets([]);
      setPresetErrors([]);
      setSelectedPresetIndex(null);
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

  const isGDriveLink = isGoogleDriveLink(videoSourceUrl);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
          {/* Preset Import Section */}
          {!showPresetImport ? (
            <Button
              variant="outline"
              onClick={() => setShowPresetImport(true)}
              className="w-full gap-2"
            >
              <FileText className="h-4 w-4" />
              Import Preset from Google Docs
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Import Preset from Google Docs
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPresetImport(false)}
                >
                  Close
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Format Instructions</AlertTitle>
                <AlertDescription className="text-xs whitespace-pre-line mt-2">
                  {getPresetFormatInstructions()}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="presetText">Paste Google Docs Text</Label>
                <Textarea
                  id="presetText"
                  placeholder="Paste your preset text here..."
                  value={presetText}
                  onChange={(e) => setPresetText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleParsePresets} className="w-full">
                Parse Presets
              </Button>

              {presetErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                      {presetErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {parsedPresets.length > 0 && (
                <div className="space-y-2">
                  <Label>Select a Preset ({parsedPresets.length} found)</Label>
                  <Select
                    value={selectedPresetIndex?.toString() ?? ''}
                    onValueChange={(val) => setSelectedPresetIndex(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parsedPresets.map((preset, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {preset.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPresetIndex !== null && parsedPresets[selectedPresetIndex] && (
                    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-background rounded border">
                      <p><strong>Video:</strong> {parsedPresets[selectedPresetIndex].videoLink}</p>
                      <p><strong>Ingest:</strong> {parsedPresets[selectedPresetIndex].ingestUrl}</p>
                      <p><strong>Key:</strong> {parsedPresets[selectedPresetIndex].streamKey.substring(0, 8)}...</p>
                    </div>
                  )}

                  <Button
                    onClick={handleApplyPreset}
                    disabled={selectedPresetIndex === null}
                    className="w-full"
                  >
                    Apply Selected Preset
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator />

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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTitle}
                    className="gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    Random Fireplace Title
                  </Button>
                  {lastUsedTitle && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUsePreviousTitle}
                      className="gap-2"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Use Previous: {lastUsedTitle.substring(0, 20)}...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Video Source */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Video Source</h3>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Video Source Tips</AlertTitle>
                <AlertDescription className="text-sm space-y-1">
                  <p>• Use direct-accessible media URLs (MP4, HLS, RTMP)</p>
                  <p>• Ensure the link is publicly accessible without authentication</p>
                  <p>• For Google Drive, set sharing to "Anyone with the link"</p>
                  <p>• Test the link in an incognito window to verify access</p>
                </AlertDescription>
              </Alert>

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

              {isGDriveLink && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Required Permissions for Google Drive</AlertTitle>
                  <AlertDescription className="text-sm whitespace-pre-line">
                    {getGoogleDrivePermissionsGuidance()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Output Target */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Streaming Target</h3>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>RTMP Configuration Tips</AlertTitle>
                <AlertDescription className="text-sm space-y-1">
                  <p>• <strong>Ingest URL</strong> is the RTMP server address (e.g., rtmp://a.rtmp.youtube.com/live2)</p>
                  <p>• <strong>Stream Key</strong> is your unique secret key from YouTube Studio</p>
                  <p>• Never share your stream key publicly - it grants access to your stream</p>
                  <p>• Make sure both video source and output are configured before starting</p>
                </AlertDescription>
              </Alert>

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
