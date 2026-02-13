/**
 * Utility to generate random fireplace-style session titles.
 * Provides quick, friendly title suggestions for streaming sessions.
 */

const ADJECTIVES = [
  'Cozy',
  'Warm',
  'Crackling',
  'Peaceful',
  'Relaxing',
  'Ambient',
  'Soothing',
  'Tranquil',
  'Serene',
  'Calming',
];

const NOUNS = [
  'Fireplace',
  'Hearth',
  'Flames',
  'Embers',
  'Campfire',
  'Bonfire',
  'Fire',
  'Blaze',
];

const TIMES = [
  'Evening',
  'Night',
  'Morning',
  'Afternoon',
  'Winter',
  'Holiday',
  'Weekend',
  'Midnight',
];

export function generateFireplaceTitle(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const time = TIMES[Math.floor(Math.random() * TIMES.length)];
  
  return `${adjective} ${noun} - ${time}`;
}
