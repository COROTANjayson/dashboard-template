import imageCompression from 'browser-image-compression';

/**
 * Standard compression options for typical web imagery (avatars, product shots, etc.)
 */
export const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,          // 1 Megabyte max output
  maxWidthOrHeight: 1920, // Downscale images larger than 1080p width/height
  useWebWorker: true,    // Offload compression from main JS thread
  alwaysKeepResolution: false,
};

/**
 * Compresses a File object in the browser using browser-image-compression.
 * Useful before uploading files to save bandwidth and storage.
 * 
 * @param file The original File from an <input type="file" />
 * @param options Custom compression options (overrides defaults)
 * @returns Compressed File
 */
export async function compressClientImage(
  file: File, 
  options: typeof DEFAULT_COMPRESSION_OPTIONS = DEFAULT_COMPRESSION_OPTIONS
): Promise<File> {
  // Only attempt to compress image variants
  if (!file.type.startsWith('image/')) {
    return file; 
  }

  // Skip compressing already highly optimized vectors/gifs where logic might fail or inflate sizes
  if (['image/svg+xml', 'image/gif'].includes(file.type)) {
    return file;
  }

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File, preserving original name and modified date
    return new File(
      [compressedBlob], 
      file.name, 
      { type: file.type, lastModified: Date.now() }
    );
  } catch (error) {
    console.warn('Failed to compress image on client, falling back to original file:', error);
    return file; // If compression fails, still return the original rather than breaking completely
  }
}
