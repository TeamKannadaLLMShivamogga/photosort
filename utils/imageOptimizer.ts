
import { OptimizationType } from '../types';

interface OptimizationResult {
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
}

export const optimizeImage = async (
  file: File,
  type: OptimizationType
): Promise<OptimizationResult> => {
  if (type === 'none') {
    return {
      blob: file,
      originalSize: file.size,
      optimizedSize: file.size,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Configuration based on optimization type
        let quality = 0.8;
        let maxWidth = Infinity;

        switch (type) {
          case 'balanced':
            maxWidth = 2560; // 2K
            quality = 0.75;
            break;
          case 'performance':
            maxWidth = 1920; // 1080p
            quality = 0.6;
            break;
          case 'high-quality':
            maxWidth = 3840; // 4K
            quality = 0.9;
            break;
        }

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                originalSize: file.size,
                optimizedSize: blob.size,
              });
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
