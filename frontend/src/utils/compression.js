import imageCompression from 'browser-image-compression';

/**
 * Compress a file before upload to save storage space
 * @param {File} file - The file to compress
 * @returns {Promise<{file: File, compressed: boolean, originalSize: number, compressedSize: number}>}
 */
export const compressFile = async (file) => {
  const originalSize = file.size;
  
  // Check file type
  const fileType = file.type.toLowerCase();
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  
  // Images: Compress if > 500KB
  if (isImage && file.size > 500 * 1024) {
    try {
      const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: file.type
      };
      
      console.log(`Compressing image: ${file.name} (${(originalSize / 1024 / 1024).toFixed(2)}MB)`);
      const compressedFile = await imageCompression(file, options);
      const compressedSize = compressedFile.size;
      const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      
      console.log(`✓ Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${savings}% saved)`);
      
      return {
        file: compressedFile,
        compressed: true,
        originalSize,
        compressedSize,
        savings: parseFloat(savings)
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      return {
        file,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        savings: 0
      };
    }
  }
  
  // PDFs and other files: No compression (PDFs are usually already compressed)
  // Could add PDF compression library here if needed
  
  return {
    file,
    compressed: false,
    originalSize,
    compressedSize: originalSize,
    savings: 0
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
