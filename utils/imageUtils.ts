import { Filters } from "../types";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function extractMimeType(base64String: string): string {
  const match = base64String.match(/^data:(.*);base64,/);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback for when the string might not have a header
  return 'image/png';
}

export function downloadImage(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function resizeImage(dataUrl: string, newWidth: number, newHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      resolve(canvas.toDataURL());
    };
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}

export function rotateImage(dataUrl: string): Promise<{ dataUrl: string; width: number; height: number; }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Swap width and height
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      // Rotate the context
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2); // 90 degrees
      // Draw the image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve({ dataUrl: canvas.toDataURL(), width: canvas.width, height: canvas.height });
    };
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}

export function mirrorImageHorizontal(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      // Flip the context horizontally
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      // Draw the image
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}

export function mirrorImageVertical(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      // Flip the context vertically
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      // Draw the image
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}


export function applyFiltersToImage(dataUrl: string, filters: Filters): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      
      const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hueRotate}deg)`;
      ctx.filter = filterString;

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}