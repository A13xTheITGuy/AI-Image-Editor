import React from 'react';
import { themes } from '../themes';
import type { ThemeSettings } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ThemeSettings;
    onSettingsChange: (settings: ThemeSettings) => void;
}

const ColorPicker: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={`color-${label}`} className="text-sm text-app-text">{label}</label>
        <div className="flex items-center space-x-2 border border-app-text/20 rounded-lg p-1">
             <input
                id={`color-${label}`}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-app-panel"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
             />
             <span className="font-mono text-sm pr-2">{value}</span>
        </div>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) {
        return null;
    }

    const handleThemeSelect = (themeName: 'dark' | 'light') => {
        onSettingsChange(themes[themeName]);
    };
    
    const handleColorChange = (key: keyof ThemeSettings, value: string) => {
        onSettingsChange({ ...settings, name: 'Custom', [key]: value });
    }

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
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-app-panel">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-app-text-muted">UI Settings</h3>
                    
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Preset Themes</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleThemeSelect('dark')} className={`text-center p-3 rounded-lg border-2 ${settings.name === 'Dark' ? 'border-brand-primary' : 'border-app-panel hover:border-brand-primary/50'}`}>Dark</button>
                            <button onClick={() => handleThemeSelect('light')} className={`text-center p-3 rounded-lg border-2 ${settings.name === 'Light' ? 'border-brand-primary' : 'border-app-panel hover:border-brand-primary/50'}`}>Light</button>
                        </div>
                    </div>

                     <div className="space-y-4">
                        <p className="text-sm font-medium">Custom Colors</p>
                        <ColorPicker label="Background" value={settings.background} onChange={(v) => handleColorChange('background', v)} />
                        <ColorPicker label="Panels" value={settings.panel} onChange={(v) => handleColorChange('panel', v)} />
                        <ColorPicker label="Text" value={settings.text} onChange={(v) => handleColorChange('text', v)} />
                        <ColorPicker label="Accent" value={settings.accent} onChange={(v) => handleColorChange('accent', v)} />
                    </div>
                </div>

            </div>
        </div>
    );
};
