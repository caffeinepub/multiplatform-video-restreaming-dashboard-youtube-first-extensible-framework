import type { backendInterface, Session, Output, StreamTargetId, SessionId, Layer, LayerId } from '../../backend';

export async function createSession(
  actor: backendInterface,
  sessionId: SessionId,
  title: string
): Promise<void> {
  return actor.createSession(sessionId, title);
}

export async function getSession(actor: backendInterface, sessionId: SessionId): Promise<Session> {
  return actor.getSession(sessionId);
}

export async function listActiveSessions(actor: backendInterface): Promise<Session[]> {
  return actor.listActiveSessions();
}

export async function startSession(actor: backendInterface, sessionId: SessionId): Promise<void> {
  return actor.startSession(sessionId);
}

export async function stopSession(actor: backendInterface, sessionId: SessionId): Promise<void> {
  return actor.stopSession(sessionId);
}

export async function addOutput(
  actor: backendInterface,
  sessionId: SessionId,
  name: string,
  protocol: string,
  url: string,
  stream_key: string,
  max_bitrate: bigint,
  ingest_categories: string[]
): Promise<StreamTargetId> {
  return actor.addOutput(sessionId, name, protocol, url, stream_key, max_bitrate, ingest_categories);
}

export async function getOutput(actor: backendInterface, id: StreamTargetId): Promise<Output> {
  return actor.getOutput(id);
}

export async function setVideoSource(
  actor: backendInterface,
  sessionId: SessionId,
  videoSourceUrl: string
): Promise<void> {
  return actor.setVideoSource(sessionId, videoSourceUrl);
}

export async function addLayer(
  actor: backendInterface,
  sessionId: SessionId,
  name: string,
  sourceUrl: string,
  x: bigint,
  y: bigint,
  width: bigint,
  height: bigint
): Promise<LayerId> {
  return actor.addLayer(sessionId, name, sourceUrl, x, y, width, height);
}

export async function getLayer(actor: backendInterface, id: LayerId): Promise<Layer> {
  return actor.getLayer(id);
}
