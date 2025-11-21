import React from 'react';
import type { ShapeSettings, ShapeType } from '../types';

interface ShapeControlsProps {
    settings: ShapeSettings;
    onSettingsChange: (settings: Partial<ShapeSettings>) => void;
}

const ShapeButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`p-2 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-brand-primary text-white' : 'text-app-text-muted hover:bg-app-panel'
        }`}
    >
        {children}
    </button>
);

const shapes: { name: ShapeType, icon: React.ReactNode }[] = [
    { name: 'line', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5" /></svg> },
    { name: 'rectangle', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" /></svg> },
    { name: 'circle', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: 'ellipse', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg> },
    { name: 'triangle', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 22h20L12 2z" /></svg> },
    { name: 'rounded-rectangle', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="4" ry="4" /></svg> }
];

export const ShapeControls: React.FC<ShapeControlsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div className="space-y-4 border-t border-app-text/10 pt-4">
            <h3 className="text-lg font-semibold">Shapes</h3>
            <div className="grid grid-cols-3 gap-2 p-2 bg-app-bg/50 rounded-lg">
                {shapes.map(shape => (
                    <ShapeButton
                        key={shape.name}
                        label={shape.name}
                        isActive={settings.activeShape === shape.name}
                        onClick={() => onSettingsChange({ activeShape: shape.name })}
                    >
                        {shape.icon}
                    </ShapeButton>
                ))}
            </div>
            <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <label htmlFor="shape-fill-toggle" className="text-sm font-medium">Fill</label>
                    <button
                        id="shape-fill-toggle"
                        onClick={() => onSettingsChange({ fill: !settings.fill })}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.fill ? 'bg-brand-primary' : 'bg-app-bg'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.fill ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
                {settings.fill && (
                     <div className="space-y-2">
                        <label htmlFor="shape-fill-color" className="block text-sm font-medium">Fill Color</label>
                        <input
                            id="shape-fill-color"
                            type="color"
                            value={settings.fillColor}
                            onChange={(e) => onSettingsChange({ fillColor: e.target.value })}
                            className="p-1 h-10 w-full block bg-app-bg border border-app-text/10 rounded-lg cursor-pointer"
                        />
                    </div>
                )}
                 <div className="space-y-2">
                    <label htmlFor="shape-stroke-color" className="block text-sm font-medium">Outline Color</label>
                    <input
                        id="shape-stroke-color"
                        type="color"
                        value={settings.strokeColor}
                        onChange={(e) => onSettingsChange({ strokeColor: e.target.value })}
                        className="p-1 h-10 w-full block bg-app-bg border border-app-text/10 rounded-lg cursor-pointer"
                    />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="shape-stroke-width" className="block text-sm font-medium">
                        Outline Width <span className="text-app-text-muted font-mono">{settings.strokeWidth}px</span>
                    </label>
                    <input
                        id="shape-stroke-width"
                        type="range"
                        min={0}
                        max={50}
                        value={settings.strokeWidth}
                        onChange={(e) => onSettingsChange({ strokeWidth: Number(e.target.value) })}
                        className="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                </div>
            </div>
        </div>
    );
};
