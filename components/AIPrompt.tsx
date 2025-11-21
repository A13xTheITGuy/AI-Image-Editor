import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface AIPromptProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export const AIPrompt: React.FC<AIPromptProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerateClick = () => {
    if (prompt && !isLoading) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Magic Edit</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Make the sky a vibrant sunset' or 'Add a birthday hat on the cat'"
        className="w-full h-24 p-2 bg-app-bg border border-app-text/10 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
        disabled={isLoading}
      />
      <button
        onClick={handleGenerateClick}
        disabled={isLoading || !prompt}
        className="w-full bg-brand-primary hover:bg-brand-primary/80 disabled:bg-app-text-muted/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
        <span>{isLoading ? 'Generating...' : 'Generate with AI'}</span>
      </button>
    </div>
  );
};
