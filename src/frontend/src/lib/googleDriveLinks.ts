/**
 * Google Drive share link detection and permissions guidance.
 * Helps users understand required sharing settings for video sources.
 */

const GDRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\//i,
  /drive\.google\.com\/open\?id=/i,
  /drive\.google\.com\/uc\?id=/i,
  /docs\.google\.com\/.*\/d\//i,
];

export function isGoogleDriveLink(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return GDRIVE_PATTERNS.some(pattern => pattern.test(url));
}

export function getGoogleDrivePermissionsGuidance(): string {
  return `Google Drive links require specific sharing settings:
• Set sharing to "Anyone with the link" (public access)
• Private/restricted links will fail to load
• For video files, consider using the direct download link format
• Test the link in an incognito window to verify public access`;
}
