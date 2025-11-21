import React from 'react';
import type { EraserSettings } from '../types';

interface EraserControlsProps {
    settings: EraserSettings;
    onSettingsChange: (settings: Partial<EraserSettings>) => void;
}

const ControlSlider: React.FC<{
    label: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
    onChange: (value: number) => void;
}> = ({ label, value, min = 0, max = 100, unit = '', onChange }) => (
    <div className="space-y-2">
        <label htmlFor={`eraser-${label}`} className="block text-sm font-medium">
            {label} <span className="text-app-text-muted font-mono">{value}{unit}</span>
        </label>
        <input
            id={`eraser-${label}`}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
    </div>
);

export const EraserControls: React.FC<EraserControlsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div className="space-y-4 border-t border-app-text/10 pt-4">
            <h3 className="text-lg font-semibold">Eraser Settings</h3>
            <ControlSlider
                label="Size"
                value={settings.size}
                min={1}
                max={200}
                unit="px"
                onChange={(v) => onSettingsChange({ size: v })}
            />
            <ControlSlider
                label="Opacity"
                value={settings.opacity}
                unit="%"
                onChange={(v) => onSettingsChange({ opacity: v })}
            />
            <ControlSlider
                label="Hardness"
                value={settings.hardness}
                unit="%"
                onChange={(v) => onSettingsChange({ hardness: v })}
            />
        </div>
    );
};