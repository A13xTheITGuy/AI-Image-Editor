import React from 'react';
import type { TextSettings } from '../types';

interface TextControlsProps {
    settings: TextSettings;
    onSettingsChange: (settings: Partial<TextSettings>) => void;
}

const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Impact', 'Comic Sans MS'];

export const TextControls: React.FC<TextControlsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div className="space-y-4 border-t border-app-text/10 pt-4">
            <h3 className="text-lg font-semibold">Text Settings</h3>
            
            <textarea
                value={settings.content}
                onChange={(e) => onSettingsChange({ content: e.target.value })}
                placeholder="Your text here..."
                className="w-full h-24 p-2 bg-app-bg border border-app-text/10 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                maxLength={500} // Security: Limit text length
            />

            <div className="space-y-2">
                <label htmlFor="font-family" className="block text-sm font-medium">Font</label>
                <select
                    id="font-family"
                    value={settings.fontFamily}
                    onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                    className="w-full bg-app-bg text-app-text p-2 rounded text-sm border border-app-text/10"
                >
                    {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="font-size" className="block text-sm font-medium">Size</label>
                    <input
                        id="font-size"
                        type="number"
                        min={1}
                        value={settings.fontSize}
                        onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
                        className="w-full bg-app-bg rounded px-2 py-1 text-sm border border-app-text/10"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="text-color" className="block text-sm font-medium">Color</label>
                    <input
                        id="text-color"
                        type="color"
                        value={settings.color}
                        onChange={(e) => onSettingsChange({ color: e.target.value })}
                        className="p-1 h-8 w-full block bg-app-bg border border-app-text/10 rounded-lg cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onSettingsChange({ bold: !settings.bold })}
                    className={`p-2 rounded-lg w-full ${settings.bold ? 'bg-brand-primary text-white' : 'bg-app-bg'}`}
                >
                    <span className="font-bold">B</span>
                </button>
                <button
                    onClick={() => onSettingsChange({ italic: !settings.italic })}
                    className={`p-2 rounded-lg w-full ${settings.italic ? 'bg-brand-primary text-white' : 'bg-app-bg'}`}
                >
                    <span className="italic">I</span>
                </button>
            </div>
            
             <div className="flex items-center justify-around p-1 bg-app-bg rounded-lg">
                <button
                    onClick={() => onSettingsChange({ textAlign: 'left' })}
                    className={`p-2 rounded ${settings.textAlign === 'left' ? 'text-brand-primary' : 'text-app-text-muted'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>
                </button>
                <button
                    onClick={() => onSettingsChange({ textAlign: 'center' })}
                    className={`p-2 rounded ${settings.textAlign === 'center' ? 'text-brand-primary' : 'text-app-text-muted'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" transform="scale(0.8, 1) translate(2.5, 0)" /></svg>
                </button>
                <button
                    onClick={() => onSettingsChange({ textAlign: 'right' })}
                    className={`p-2 rounded ${settings.textAlign === 'right' ? 'text-brand-primary' : 'text-app-text-muted'}`}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>
                </button>
            </div>
        </div>
    );
};