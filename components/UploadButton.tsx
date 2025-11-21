import React, { useCallback, useRef } from 'react';

interface UploadButtonProps {
  onImageUpload: (files: FileList) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ onImageUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(files);
    }
    // Reset input value to allow uploading the same file again
    if (event.target) {
        event.target.value = '';
    }
  }, [onImageUpload]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleClick}
        className="w-full bg-app-panel hover:bg-app-panel/80 text-app-text font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        <span>Upload More</span>
      </button>
    </>
  );
};
