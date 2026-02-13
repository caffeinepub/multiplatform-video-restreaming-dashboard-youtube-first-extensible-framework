/**
 * Local storage helpers for Quick Start workflow persistence.
 * Stores last used session title and video source URL to speed up repeated setups.
 */

const STORAGE_KEY_TITLE = 'quickstart_last_title';
const STORAGE_KEY_VIDEO_URL = 'quickstart_last_video_url';

function safeGetStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getLastUsedTitle(): string | null {
  const storage = safeGetStorage();
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEY_TITLE);
  } catch {
    return null;
  }
}

export function setLastUsedTitle(title: string): void {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_TITLE, title);
  } catch {
    // Silently fail if storage is unavailable
  }
}

export function getLastUsedVideoUrl(): string | null {
  const storage = safeGetStorage();
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEY_VIDEO_URL);
  } catch {
    return null;
  }
}

export function setLastUsedVideoUrl(url: string): void {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_VIDEO_URL, url);
  } catch {
    // Silently fail if storage is unavailable
  }
}
