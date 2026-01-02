/**
 * Media utility functions for blog
 * Handles video detection from featuredImageUrl and date formatting
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.m4v', '.ogv', '.ogg'];

/**
 * Detect if a URL points to a video file
 * Checks both file extensions and Cloudinary video upload paths
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  // Check for video file extensions
  const hasVideoExtension = VIDEO_EXTENSIONS.some(ext => lowerUrl.includes(ext));
  // Check for Cloudinary video upload path
  const isCloudinaryVideo = lowerUrl.includes('/video/upload/');
  return hasVideoExtension || isCloudinaryVideo;
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
