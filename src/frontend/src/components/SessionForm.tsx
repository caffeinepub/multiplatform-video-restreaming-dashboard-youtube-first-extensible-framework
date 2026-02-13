import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSession } from '../features/sessions/mutations';
import { Loader2 } from 'lucide-react';

interface SessionFormProps {
  onSuccess?: () => void;
}

interface SessionFormData {
  title: string;
}

export function SessionForm({ onSuccess }: SessionFormProps) {
  const createSession = useCreateSession();
  const { register, handleSubmit, formState: { errors } } = useForm<SessionFormData>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SessionFormData) => {
    setError(null);
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createSession.mutateAsync({ sessionId, title: data.title });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Session Title</Label>
        <Input
          id="title"
          placeholder="e.g., Weekly Live Stream"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={createSession.isPending} className="w-full">
        {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Session
      </Button>
    </form>
  );
}
