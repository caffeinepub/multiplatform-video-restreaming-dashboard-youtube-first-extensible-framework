import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    id: SessionId;
    title: string;
    videoSourceUrl?: string;
    layers: Array<LayerId>;
    isActive: boolean;
    outputs: Array<StreamTargetId>;
}
export type LayerId = bigint;
export type StreamTargetId = bigint;
export type SessionId = string;
export type IngestCategoryId = string;
export interface Output {
    id: StreamTargetId;
    ingest_categories: Array<IngestCategoryId>;
    url: string;
    protocol: string;
    name: string;
    stream_key: string;
    max_bitrate: bigint;
}
export interface Layer {
    id: LayerId;
    name: string;
    size: {
        height: bigint;
        width: bigint;
    };
    sourceUrl: string;
    position: {
        x: bigint;
        y: bigint;
    };
}
export interface backendInterface {
    addLayer(sessionId: SessionId, name: string, sourceUrl: string, x: bigint, y: bigint, width: bigint, height: bigint): Promise<LayerId>;
    addOutput(sessionId: SessionId, name: string, protocol: string, url: string, stream_key: string, max_bitrate: bigint, ingest_categories: Array<IngestCategoryId>): Promise<StreamTargetId>;
    createSession(sessionId: SessionId, title: string): Promise<void>;
    getLayer(id: LayerId): Promise<Layer>;
    getOutput(id: StreamTargetId): Promise<Output>;
    getSession(id: SessionId): Promise<Session>;
    listActiveSessions(): Promise<Array<Session>>;
    listOutputsByCategory(categoryId: IngestCategoryId): Promise<Array<Output>>;
    setVideoSource(sessionId: SessionId, videoSourceUrl: string): Promise<void>;
    startSession(id: SessionId): Promise<void>;
    stopSession(id: SessionId): Promise<void>;
}
