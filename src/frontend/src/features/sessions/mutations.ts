import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
import * as api from './api';
import type { SessionId } from '../../backend';
import { toast } from 'sonner';

export function useCreateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: SessionId; title: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await api.createSession(actor, sessionId, title);
      return sessionId;
    },
    onSuccess: (sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
      navigate({ to: '/session/$sessionId', params: { sessionId } });
    },
    onError: (error) => {
      toast.error('Failed to create session');
      console.error('Create session error:', error);
    },
  });
}

export function useStartSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: SessionId) => {
      if (!actor) throw new Error('Actor not initialized');
      return api.startSession(actor, sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'active'] });
      toast.success('Stream started');
    },
    onError: (error) => {
      toast.error('Failed to start stream');
      console.error('Start session error:', error);
    },
  });
}

export function useStopSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: SessionId) => {
      if (!actor) throw new Error('Actor not initialized');
      return api.stopSession(actor, sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'active'] });
      toast.success('Stream stopped');
    },
    onError: (error) => {
      toast.error('Failed to stop stream');
      console.error('Stop session error:', error);
    },
  });
}

export function useAddOutput() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      name,
      protocol,
      url,
      stream_key,
      max_bitrate,
      ingest_categories,
    }: {
      sessionId: SessionId;
      name: string;
      protocol: string;
      url: string;
      stream_key: string;
      max_bitrate: bigint;
      ingest_categories: string[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return api.addOutput(actor, sessionId, name, protocol, url, stream_key, max_bitrate, ingest_categories);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['outputs'] });
      toast.success('Output target added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add output target');
      console.error('Add output error:', error);
    },
  });
}

export function useSetVideoSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, videoSourceUrl }: { sessionId: SessionId; videoSourceUrl: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return api.setVideoSource(actor, sessionId, videoSourceUrl);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      toast.success('Video source updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update video source');
      console.error('Set video source error:', error);
    },
  });
}

export function useAddLayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      name,
      sourceUrl,
      x,
      y,
      width,
      height,
    }: {
      sessionId: SessionId;
      name: string;
      sourceUrl: string;
      x: bigint;
      y: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return api.addLayer(actor, sessionId, name, sourceUrl, x, y, width, height);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      toast.success('Layer added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add layer');
      console.error('Add layer error:', error);
    },
  });
}

export function useQuickStart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      title,
      videoSourceUrl,
      outputName,
      outputProtocol,
      outputUrl,
      outputStreamKey,
      outputMaxBitrate,
      outputCategories,
    }: {
      sessionId: SessionId;
      title: string;
      videoSourceUrl: string;
      outputName: string;
      outputProtocol: string;
      outputUrl: string;
      outputStreamKey: string;
      outputMaxBitrate: bigint;
      outputCategories: string[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');

      // Step 1: Create session
      await api.createSession(actor, sessionId, title);

      // Step 2: Set video source
      await api.setVideoSource(actor, sessionId, videoSourceUrl);

      // Step 3: Add output
      await api.addOutput(
        actor,
        sessionId,
        outputName,
        outputProtocol,
        outputUrl,
        outputStreamKey,
        outputMaxBitrate,
        outputCategories
      );

      // Step 4: Start session
      await api.startSession(actor, sessionId);

      return sessionId;
    },
    onSuccess: (sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Stream started successfully!');
    },
    onError: (error) => {
      toast.error('Failed to start quick stream');
      console.error('Quick start error:', error);
    },
  });
}
