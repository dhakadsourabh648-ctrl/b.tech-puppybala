/**
 * Utility to identify whether a media URL is a video
 */
export function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false;
  return (
    url.startsWith('data:video/') ||
    /\.(mp4|webm|mov|mkv|avi|m4v)(\?.*)?$/i.test(url)
  );
}
