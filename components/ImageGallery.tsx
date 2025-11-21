import React from 'react';
import type { ImageState } from '../types';

interface ImageGalleryProps {
  images: ImageState[];
  activeImageId: string | null;
  onSelectImage: (id: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, activeImageId, onSelectImage }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-app-bg/50 p-2 rounded-lg">
      <div className="flex space-x-3 overflow-x-auto">
        {images.map(image => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image.id)}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors duration-200 ${
              activeImageId === image.id ? 'border-brand-primary' : 'border-app-panel hover:border-app-text-muted'
            }`}
          >
            <img
              src={image.preview || image.layers[0]?.src}
              alt={`Thumbnail ${image.id}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};