// This set stores URLs that have been passed to the preloader.
// This prevents creating duplicate audio elements for the same source,
// although the browser's caching would likely handle redundant requests anyway.
// It's a lightweight way to avoid unnecessary work.
const preloadedUrls = new Set<string>();

/**
 * Initiates the download of an audio file to cache it and waits until it's ready for playback.
 * Creates a new Audio element and waits for the 'canplaythrough' event, which indicates
 * the browser has buffered enough data to play the audio without interruption.
 * @param url The URL of the audio file to preload.
 */
export const preloadAudio = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    // Only proceed if the URL is valid and hasn't been preloaded yet.
    if (!url || preloadedUrls.has(url)) {
      resolve();
      return;
    }

    const audio = new Audio();

    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('error', onError);
    };

    const onCanPlayThrough = () => {
      preloadedUrls.add(url);
      cleanup();
      resolve();
    };

    const onError = () => {
      console.warn(`Failed to preload audio: ${url}`);
      // Add even on error to avoid retrying, and resolve to not block the app.
      preloadedUrls.add(url);
      cleanup();
      resolve();
    };

    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('error', onError);

    audio.src = url;
    audio.preload = 'auto';
    // Some browsers require a call to load() to start the preloading process.
    audio.load();
  });
};
