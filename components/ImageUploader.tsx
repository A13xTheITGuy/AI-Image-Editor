import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (files: FileList) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(files);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full">
      <label
        htmlFor="image-upload"
        className="relative block w-full border-2 border-dashed border-app-text/20 rounded-lg p-12 text-center hover:border-brand-primary cursor-pointer transition-colors duration-200"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-app-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="mt-2 block text-sm font-medium">
                Upload Image(s)
            </span>
            <p className="text-xs text-app-text-muted">Drag & drop or click to select files</p>
        </div>
        <input
          id="image-upload"
          name="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
