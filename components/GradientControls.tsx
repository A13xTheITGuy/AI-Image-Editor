import React from 'react';
import type { GradientSettings } from '../types';

interface GradientControlsProps {
    settings: GradientSettings;
    onSettingsChange: (settings: Partial<GradientSettings>) => void;
}

export const GradientControls: React.FC<GradientControlsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div className="space-y-4 border-t border-app-text/10 pt-4">
            <h3 className="text-lg font-semibold">Gradient Settings</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Type</label>
                <div className="flex items-center space-x-2 bg-app-bg/50 p-1 rounded-lg">
                    <button
                        onClick={() => onSettingsChange({ type: 'linear' })}
                        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${settings.type === 'linear' ? 'bg-brand-primary text-white' : 'hover:bg-app-panel'}`}
                    >
                        Linear
                    </button>
                    <button
                        onClick={() => onSettingsChange({ type: 'radial' })}
                        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${settings.type === 'radial' ? 'bg-brand-primary text-white' : 'hover:bg-app-panel'}`}
                    >
                        Radial
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="gradient-start-color" className="block text-sm font-medium">Start Color</label>
                    <input
                        id="gradient-start-color"
                        type="color"
                        value={settings.startColor}
                        onChange={(e) => onSettingsChange({ startColor: e.target.value })}
                        className="p-1 h-10 w-full block bg-app-bg border border-app-text/10 rounded-lg cursor-pointer"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="gradient-end-color" className="block text-sm font-medium">End Color</label>
                    <input
                        id="gradient-end-color"
                        type="color"
                        value={settings.endColor}
                        onChange={(e) => onSettingsChange({ endColor: e.target.value })}
                        className="p-1 h-10 w-full block bg-app-bg border border-app-text/10 rounded-lg cursor-pointer"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="gradient-opacity" className="block text-sm font-medium">
                    Opacity <span className="text-app-text-muted font-mono">{settings.opacity}%</span>
                </label>
                <input
                    id="gradient-opacity"
                    type="range"
                    min={0}
                    max={100}
                    value={settings.opacity}
                    onChange={(e) => onSettingsChange({ opacity: Number(e.target.value) })}
                    className="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
            </div>
        </div>
    );
};