import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Layers, Plus, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useGetLayers } from '../features/sessions/queries';
import { useAddLayer } from '../features/sessions/mutations';
import type { LayerId } from '../backend';

interface LayersPanelProps {
  sessionId: string;
  layerIds: LayerId[];
}

export function LayersPanel({ sessionId, layerIds }: LayersPanelProps) {
  const { data: layers, isLoading, error } = useGetLayers(layerIds);
  const [isAddLayerOpen, setIsAddLayerOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load layers. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Layers
            </CardTitle>
            <CardDescription>Manage overlay layers for your stream</CardDescription>
          </div>
          <Sheet open={isAddLayerOpen} onOpenChange={setIsAddLayerOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Layer
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Layer</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <AddLayerForm
                  sessionId={sessionId}
                  onSuccess={() => setIsAddLayerOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {!layers || layers.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No layers yet</h3>
            <p className="text-muted-foreground">Add overlay layers to customize your stream</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Layers are stacked from top (first) to bottom (last)
            </p>
            {layers.map((layer, index) => (
              <Card key={layer.id} className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Layer {index + 1}</Badge>
                        <h4 className="font-semibold">{layer.name}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="truncate">Source: {layer.sourceUrl}</p>
                        <p>
                          Position: ({layer.position.x.toString()}, {layer.position.y.toString()})
                        </p>
                        <p>
                          Size: {layer.size.width.toString()} × {layer.size.height.toString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AddLayerFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

function AddLayerForm({ sessionId, onSuccess }: AddLayerFormProps) {
  const addLayer = useAddLayer();
  const [name, setName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sourceUrl.trim()) {
      setError('Name and source URL are required');
      return;
    }

    try {
      await addLayer.mutateAsync({
        sessionId,
        name: name.trim(),
        sourceUrl: sourceUrl.trim(),
        x: BigInt(x),
        y: BigInt(y),
        width: BigInt(width),
        height: BigInt(height),
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add layer');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="layerName">Layer Name</Label>
        <Input
          id="layerName"
          placeholder="e.g., Logo Overlay"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          type="url"
          placeholder="https://example.com/image.png"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Image or video URL to overlay on your stream
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="x">X Position</Label>
          <Input
            id="x"
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="y">Y Position</Label>
          <Input
            id="y"
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={addLayer.isPending} className="w-full">
        {addLayer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Layer
      </Button>
    </form>
  );
}
