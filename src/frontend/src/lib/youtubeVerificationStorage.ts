/**
 * Local storage for per-session YouTube verification status.
 * Stores manual verification state without requiring YouTube APIs.
 */

export type VerificationStatus = 'not-checked' | 'verified' | 'not-receiving';

export interface YouTubeVerification {
  status: VerificationStatus;
  youtubeUrl?: string;
  lastChecked?: number;
}

function safeGetStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getStorageKey(sessionId: string): string {
  return `youtube_verification_${sessionId}`;
}

export function getYouTubeVerification(sessionId: string): YouTubeVerification {
  const storage = safeGetStorage();
  if (!storage) {
    return { status: 'not-checked' };
  }

  try {
    const key = getStorageKey(sessionId);
    const stored = storage.getItem(key);
    if (!stored) {
      return { status: 'not-checked' };
    }
    return JSON.parse(stored) as YouTubeVerification;
  } catch {
    return { status: 'not-checked' };
  }
}

export function setYouTubeVerification(sessionId: string, verification: YouTubeVerification): void {
  const storage = safeGetStorage();
  if (!storage) return;

  try {
    const key = getStorageKey(sessionId);
    const data: YouTubeVerification = {
      ...verification,
      lastChecked: Date.now(),
    };
    storage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently fail if storage is unavailable
  }
}
