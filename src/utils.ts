/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file client-side before upload to optimize speed on slow network connections.
 * Resizes the image to a max width of 800px and adjusts JPEG quality to hit size targets.
 */
export function compressImage(file: File, maxWidth = 800, maxByteSize = 250000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize the image keeping aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context for image compression canvas'));
          return;
        }
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG
        let quality = 0.7;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // If the base64 size is still larger than the byte budget, lower quality iteratively
        while (dataUrl.length > maxByteSize && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error('Image failed to load for compression'));
    };
    reader.onerror = (err) => reject(new Error('File reader failed to process selected image'));
  });
}

/**
 * Simple generator for safe unique IDs on the client side
 */
export function generateId(prefix = 'c'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date nicely in local formatting
 */
export function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
