import type { PlatformAdapter } from './types';
import { youtubeAdapter } from './youtubeAdapter';

class PlatformRegistry {
  private platforms: Map<string, PlatformAdapter> = new Map();

  constructor() {
    this.register(youtubeAdapter);
  }

  register(adapter: PlatformAdapter): void {
    this.platforms.set(adapter.id, adapter);
  }

  getPlatform(id: string): PlatformAdapter | undefined {
    return this.platforms.get(id);
  }

  getAllPlatforms(): PlatformAdapter[] {
    return Array.from(this.platforms.values());
  }
}

export const platformRegistry = new PlatformRegistry();
