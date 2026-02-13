import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import * as api from './api';
import type { SessionId, StreamTargetId, LayerId } from '../../backend';

export function useListActiveSessions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return api.listActiveSessions(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSession(sessionId: SessionId) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return api.getSession(actor, sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetOutput(outputId: StreamTargetId) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['outputs', outputId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return api.getOutput(actor, outputId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOutputs(outputIds: StreamTargetId[]) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['outputs', 'batch', outputIds.map(id => id.toString()).join(',')],
    queryFn: async () => {
      if (!actor) return [];
      return Promise.all(outputIds.map((id) => api.getOutput(actor, id)));
    },
    enabled: !!actor && !isFetching && outputIds.length > 0,
  });
}

export function useGetLayer(layerId: LayerId) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['layers', layerId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return api.getLayer(actor, layerId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLayers(layerIds: LayerId[]) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['layers', 'batch', layerIds.map(id => id.toString()).join(',')],
    queryFn: async () => {
      if (!actor) return [];
      return Promise.all(layerIds.map((id) => api.getLayer(actor, id)));
    },
    enabled: !!actor && !isFetching && layerIds.length > 0,
  });
}
