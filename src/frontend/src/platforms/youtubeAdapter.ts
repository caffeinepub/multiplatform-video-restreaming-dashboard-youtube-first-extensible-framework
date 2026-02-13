import type { PlatformAdapter } from './types';

export const youtubeAdapter: PlatformAdapter = {
  id: 'youtube',
  displayName: 'YouTube',
  protocol: 'rtmp',
  fields: [
    {
      id: 'name',
      label: 'Target Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., My YouTube Channel',
      helpText: 'A friendly name to identify this output',
    },
    {
      id: 'ingestUrl',
      label: 'RTMP Ingest URL',
      type: 'text',
      required: true,
      placeholder: 'rtmp://a.rtmp.youtube.com/live2',
      helpText: 'YouTube RTMP server URL (usually rtmp://a.rtmp.youtube.com/live2)',
    },
    {
      id: 'streamKey',
      label: 'Stream Key',
      type: 'text',
      required: true,
      sensitive: true,
      placeholder: 'xxxx-xxxx-xxxx-xxxx',
      helpText: 'Your YouTube stream key from YouTube Studio',
    },
    {
      id: 'maxBitrate',
      label: 'Max Bitrate (kbps)',
      type: 'number',
      required: false,
      placeholder: '4500',
      helpText: 'Maximum bitrate for the stream (optional, 0 for unlimited)',
      defaultValue: 4500,
    },
  ],
  defaultCategories: ['youtube', 'live'],
};
