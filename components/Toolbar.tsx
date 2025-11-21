import React from 'react';
import type { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const ToolButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 w-16 ${
      isActive ? 'bg-brand-primary text-white' : 'text-app-text-muted hover:bg-app-panel'
    }`}
  >
    {children}
    <span className="text-xs">{label}</span>
  </button>
);

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tools</h3>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-app-bg/50 rounded-lg">
        <ToolButton label="Select" isActive={activeTool === 'select'} onClick={() => onToolSelect('select')}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672z" />
            </svg>
        </ToolButton>
        <ToolButton label="Pen" isActive={activeTool === 'pen'} onClick={() => onToolSelect('pen')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
          </svg>
        </ToolButton>
        <ToolButton label="Eraser" isActive={activeTool === 'eraser'} onClick={() => onToolSelect('eraser')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.025 21H4.5A2.5 2.5 0 012 18.5V9.5A2.5 2.5 0 014.5 7h15A2.5 2.5 0 0122 9.5v3.025" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 12.5l8-8-3-3-8 8-3 3 3 3z" />
            </svg>
        </ToolButton>
        <ToolButton label="Text" isActive={activeTool === 'text'} onClick={() => onToolSelect('text')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14M12 4v16" />
            </svg>
        </ToolButton>
         <ToolButton label="Shapes" isActive={activeTool === 'shapes'} onClick={() => onToolSelect('shapes')}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </ToolButton>
        <ToolButton label="Gradient" isActive={activeTool === 'gradient'} onClick={() => onToolSelect('gradient')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:'currentColor', stopOpacity:1}} /><stop offset="100%" style={{stopColor:'currentColor', stopOpacity:0.3}} /></linearGradient></defs>
                <rect width="24" height="24" fill="url(#grad1)" />
            </svg>
        </ToolButton>
      </div>
    </div>
  );
};