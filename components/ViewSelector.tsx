import React from 'react';

interface ViewSelectorProps {
  activeView: 'original' | 'ai';
  onSelectView: (view: 'original' | 'ai') => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {label}
  </button>
);

export const ViewSelector: React.FC<ViewSelectorProps> = ({ activeView, onSelectView }) => {
  return (
    <div className="w-full flex justify-center p-2 bg-gray-900/50 rounded-lg">
      <div className="flex items-center space-x-2 bg-gray-700/50 p-1 rounded-lg">
        <TabButton 
            label="Original Edited" 
            isActive={activeView === 'original'} 
            onClick={() => onSelectView('original')} 
        />
        <TabButton 
            label="AI Edited" 
            isActive={activeView === 'ai'} 
            onClick={() => onSelectView('ai')} 
        />
      </div>
    </div>
  );
};