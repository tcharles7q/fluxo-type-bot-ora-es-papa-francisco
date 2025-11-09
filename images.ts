const preloadedImageUrls = new Set<string>();

/**
 * Initiates the download of an image file to cache it.
 * @param url The URL of the image file to preload.
 * @returns A promise that resolves when the image is loaded or fails to load.
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    // Only proceed if the URL is valid and hasn't been preloaded yet.
    if (url && !preloadedImageUrls.has(url)) {
      const img = new Image();
      img.src = url;

      const onFinish = () => {
        preloadedImageUrls.add(url);
        resolve();
      };

      img.onload = onFinish;
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        onFinish(); // Resolve even on error to not block the loading process
      };
    } else {
      resolve(); // Already preloaded or invalid URL
    }
  });
};
