import React, { useState, useEffect } from 'react';
import type { AnchorPosition } from '../types';

interface CanvasSizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWidth: number;
    currentHeight: number;
    onApply: (width: number, height: number, anchor: AnchorPosition) => void;
}

const anchorPositions: AnchorPosition[] = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

export const CanvasSizeModal: React.FC<CanvasSizeModalProps> = ({ isOpen, onClose, currentWidth, currentHeight, onApply }) => {
    const [width, setWidth] = useState(currentWidth);
    const [height, setHeight] = useState(currentHeight);
    const [anchor, setAnchor] = useState<AnchorPosition>('middle-center');

    useEffect(() => {
        if (isOpen) {
            setWidth(currentWidth);
            setHeight(currentHeight);
            setAnchor('middle-center');
        }
    }, [isOpen, currentWidth, currentHeight]);

    if (!isOpen) {
        return null;
    }
    
    const handleApply = () => {
        if (width > 0 && height > 0) {
            // Ensure values are within safe limits before applying
            const safeWidth = Math.min(width, 4096);
            const safeHeight = Math.min(height, 4096);
            onApply(safeWidth, safeHeight, anchor);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-app-bg border border-app-text/10 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-app-text/10 pb-4 mb-4">
                    <h2 className="text-2xl font-bold">Canvas Size</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-app-panel">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="canvas-width" className="block text-sm font-medium">Width (px)</label>
                            <input
                                id="canvas-width"
                                type="number"
                                min={1}
                                max={4096}
                                value={width}
                                onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-app-panel rounded px-2 py-1 text-sm border border-app-text/10"
                            />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="canvas-height" className="block text-sm font-medium">Height (px)</label>
                             <input
                                id="canvas-height"
                                type="number"
                                min={1}
                                max={4096}
                                value={height}
                                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-app-panel rounded px-2 py-1 text-sm border border-app-text/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Anchor</label>
                        <div className="grid grid-cols-3 gap-2 w-24 mx-auto p-2 bg-app-panel rounded-lg">
                            {anchorPositions.map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => setAnchor(pos)}
                                    className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                                        anchor === pos ? 'bg-brand-primary' : 'bg-app-bg hover:bg-app-bg/50'
                                    }`}
                                >
                                    <div className="w-2 h-2 rounded-full bg-app-text-muted"></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 border-t border-app-text/10 pt-4 mt-6">
                    <button onClick={onClose} className="w-full bg-app-panel hover:bg-app-panel/80 text-app-text font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleApply} className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                        OK
                    </button>
                </div>

            </div>
        </div>
    );
};