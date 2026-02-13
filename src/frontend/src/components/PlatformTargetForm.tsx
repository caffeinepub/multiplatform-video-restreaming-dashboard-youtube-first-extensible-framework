import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddOutput } from '../features/sessions/mutations';
import { platformRegistry } from '../platforms/registry';
import { validatePlatformFields } from '../platforms/validation';
import { Loader2 } from 'lucide-react';
import type { PlatformFieldValue } from '../platforms/types';

interface PlatformTargetFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

export function PlatformTargetForm({ sessionId, onSuccess }: PlatformTargetFormProps) {
  const addOutput = useAddOutput();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, PlatformFieldValue>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const platforms = platformRegistry.getAllPlatforms();
  const adapter = selectedPlatform ? platformRegistry.getPlatform(selectedPlatform) : null;

  const handleFieldChange = (fieldId: string, value: PlatformFieldValue) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!adapter) {
      setError('Please select a platform');
      return;
    }

    // Validate fields
    const errors = validatePlatformFields(adapter, fieldValues);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Extract values for backend
      const name = (fieldValues.name as string) || adapter.displayName;
      const url = fieldValues.ingestUrl as string;
      const streamKey = fieldValues.streamKey as string;
      const maxBitrate = BigInt((fieldValues.maxBitrate as number) || 0);
      const categories = adapter.defaultCategories || [];

      await addOutput.mutateAsync({
        sessionId,
        name,
        protocol: adapter.protocol,
        url,
        stream_key: streamKey,
        max_bitrate: maxBitrate,
        ingest_categories: categories,
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add output');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger id="platform">
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
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'text' && (
                <Input
                  id={field.id}
                  type={field.sensitive ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={(fieldValues[field.id] as string) || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
              {field.type === 'number' && (
                <Input
                  id={field.id}
                  type="number"
                  placeholder={field.placeholder}
                  value={(fieldValues[field.id] as number) || ''}
                  onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
                />
              )}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              {validationErrors[field.id] && (
                <p className="text-sm text-destructive">{validationErrors[field.id]}</p>
              )}
            </div>
          ))}
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={addOutput.isPending || !selectedPlatform} className="w-full">
        {addOutput.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Target
      </Button>
    </form>
  );
}
