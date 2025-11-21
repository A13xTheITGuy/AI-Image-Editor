import type { ThemeSettings } from './types';

export const themes: { [key: string]: ThemeSettings } = {
    dark: {
        name: 'Dark',
        background: '#111827',
        panel: '#1f2937',
        text: '#f3f4f6',
        textMuted: '#9ca3af',
        accent: '#4f46e5',
    },
    light: {
        name: 'Light',
        background: '#f3f4f6',
        panel: '#ffffff',
        text: '#111827',
        textMuted: '#6b7280',
        accent: '#4f46e5',
    },
};
