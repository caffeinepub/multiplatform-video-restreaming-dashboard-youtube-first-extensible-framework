/**
 * Preset import parser for Google Docs text format.
 * Parses strictly formatted text blocks into streaming presets.
 */

export interface StreamPreset {
  title: string;
  videoLink: string;
  ingestUrl: string;
  streamKey: string;
}

export interface ParseResult {
  presets: StreamPreset[];
  errors: string[];
}

const PRESET_BEGIN = '---PRESET-BEGIN---';
const PRESET_END = '---PRESET-END---';

export function parsePresetsFromText(text: string): ParseResult {
  const presets: StreamPreset[] = [];
  const errors: string[] = [];

  if (!text || typeof text !== 'string') {
    return { presets, errors: ['No text provided'] };
  }

  // Find all preset blocks between markers
  const blocks: string[] = [];
  let currentIndex = 0;

  while (true) {
    const beginIndex = text.indexOf(PRESET_BEGIN, currentIndex);
    if (beginIndex === -1) break;

    const endIndex = text.indexOf(PRESET_END, beginIndex);
    if (endIndex === -1) {
      errors.push('Found PRESET-BEGIN without matching PRESET-END');
      break;
    }

    const blockContent = text.substring(beginIndex + PRESET_BEGIN.length, endIndex).trim();
    blocks.push(blockContent);
    currentIndex = endIndex + PRESET_END.length;
  }

  if (blocks.length === 0) {
    errors.push('No valid preset blocks found. Make sure to wrap presets with ---PRESET-BEGIN--- and ---PRESET-END--- markers.');
    return { presets, errors };
  }

  // Parse each block
  blocks.forEach((block, index) => {
    try {
      const preset = parsePresetBlock(block);
      if (preset) {
        presets.push(preset);
      } else {
        errors.push(`Preset block ${index + 1}: Missing required fields`);
      }
    } catch (err) {
      errors.push(`Preset block ${index + 1}: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  });

  return { presets, errors };
}

function parsePresetBlock(block: string): StreamPreset | null {
  const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const preset: Partial<StreamPreset> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();

    if (!value) continue;

    switch (key) {
      case 'title':
        preset.title = value;
        break;
      case 'video':
      case 'videolink':
      case 'video link':
        preset.videoLink = value;
        break;
      case 'ingest':
      case 'ingesturl':
      case 'ingest url':
      case 'rtmp':
      case 'rtmp url':
        preset.ingestUrl = value;
        break;
      case 'key':
      case 'streamkey':
      case 'stream key':
        preset.streamKey = value;
        break;
    }
  }

  // Validate required fields
  if (preset.title && preset.videoLink && preset.ingestUrl && preset.streamKey) {
    return preset as StreamPreset;
  }

  return null;
}

export function getPresetFormatInstructions(): string {
  return `Copy and paste text in this exact format:

---PRESET-BEGIN---
Title: Cozy Fireplace Stream
Video Link: https://drive.google.com/file/d/YOUR_FILE_ID/view
Ingest URL: rtmp://a.rtmp.youtube.com/live2
Stream Key: xxxx-xxxx-xxxx-xxxx
---PRESET-END---

You can include multiple presets. Each preset must:
• Start with ---PRESET-BEGIN---
• End with ---PRESET-END---
• Include all four fields (Title, Video Link, Ingest URL, Stream Key)
• Use the exact field names shown above

Any text outside the markers will be ignored.`;
}
