/**
 * Media utility functions for blog
 * Handles video detection from featuredImageUrl and date formatting
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.m4v', '.ogv'];

/**
 * Detect if a URL points to a video file
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => lowerUrl.includes(ext));
}

/**
 * Get video MIME type for HTML video element
 */
export function getVideoType(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.mp4')) return 'video/mp4';
  if (lowerUrl.includes('.webm')) return 'video/webm';
  if (lowerUrl.includes('.mov')) return 'video/quicktime';
  if (lowerUrl.includes('.ogv')) return 'video/ogg';
  return 'video/mp4'; // default
}

/**
 * Format date for editorial display
 * Returns format like "December 13, 2025"
 */
export function formatEditorialDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format reading time with "min read" suffix
 */
export function formatReadingTime(minutes: number | null | undefined): string {
  const mins = minutes || 5;
  return `${mins} min read`;
}
