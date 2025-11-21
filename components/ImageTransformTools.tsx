import React, { useState } from 'react';
import type { Tool } from '../types';

interface ImageTransformToolsProps {
    activeTool: Tool;
    onToolSelect: (tool: Tool) => void;
    onCropSelect: () => void;
    onApplyCrop: () => void;
    onResize: (width: number, height: number) => void;
    onRotate: () => void;
    onMirrorHorizontal: () => void;
    onMirrorVertical: () => void;
    onCanvasSize: () => void;
}

const ToolButton: React.FC<{ children: React.ReactNode, label: string, onClick: () => void }> = ({ children, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-1 text-app-text-muted hover:text-app-text transition-colors duration-200 w-16">
        {children}
        <span className="text-xs">{label}</span>
    </button>
);


export const ImageTransformTools: React.FC<ImageTransformToolsProps> = ({ activeTool, onToolSelect, onCropSelect, onApplyCrop, onResize, onRotate, onMirrorHorizontal, onMirrorVertical, onCanvasSize }) => {
    const [showResize, setShowResize] = useState(false);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    
    const handleApplyResize = () => {
        if (width > 0 && height > 0) {
             // Ensure values are within safe limits before applying
            const safeWidth = Math.min(width, 4096);
            const safeHeight = Math.min(height, 4096);
            onResize(safeWidth, safeHeight);
            setShowResize(false);
        }
    }

    return (
        <div className="space-y-4 border-t border-app-text/10 pt-4">
            <h3 className="text-lg font-semibold">Image</h3>
            <div className="flex flex-wrap gap-2 p-2 bg-app-bg/50 rounded-lg">
                <ToolButton label="Crop" onClick={onCropSelect}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 22V8a2 2 0 0 0-2-2H2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v12a2 2 0 0 0 2 2h12" />
                     </svg>
                </ToolButton>
                <ToolButton label="Resize" onClick={() => setShowResize(s => !s)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
                    </svg>
                </ToolButton>
                 <ToolButton label="Canvas" onClick={onCanvasSize}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4M3 14h4m-4-8v12h18V6H3zm18 8v4H7v-4h14z" />
                    </svg>
                </ToolButton>
                 <ToolButton label="Rotate" onClick={onRotate}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" transform="rotate(90 12 12)" />
                    </svg>
                </ToolButton>
                <ToolButton label="Flip H" onClick={onMirrorHorizontal}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-8v16l-8-8zM4 4v16" />
                    </svg>
                </ToolButton>
                <ToolButton label="Flip V" onClick={onMirrorVertical}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 12L20 4H4l8 8zM4 20h16" />
                    </svg>
                </ToolButton>
            </div>
            {activeTool === 'crop' && (
                <div className="space-y-3 p-3 bg-app-bg/50 rounded-lg">
                    <p className="text-sm text-center text-app-text-muted">Adjust the selection on the canvas.</p>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => onToolSelect('select')} className="w-full bg-app-panel hover:bg-app-panel/80 text-app-text font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                            Cancel
                        </button>
                        <button onClick={onApplyCrop} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                            Apply Crop
                        </button>
                    </div>
                </div>
            )}
            {showResize && (
                <div className="space-y-3 p-3 bg-app-bg/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="width" className="text-sm">W:</label>
                        <input type="number" id="width" value={width} onChange={e => setWidth(parseInt(e.target.value, 10))} className="w-full bg-app-bg rounded px-2 py-1 text-sm" min={1} max={4096}/>
                    </div>
                     <div className="flex items-center space-x-2">
                        <label htmlFor="height" className="text-sm">H:</label>
                        <input type="number" id="height" value={height} onChange={e => setHeight(parseInt(e.target.value, 10))} className="w-full bg-app-bg rounded px-2 py-1 text-sm" min={1} max={4096}/>
                    </div>
                    <button onClick={handleApplyResize} className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-2 px-3 rounded-lg text-sm">
                        Apply Resize
                    </button>
                </div>
            )}
        </div>
    );
};