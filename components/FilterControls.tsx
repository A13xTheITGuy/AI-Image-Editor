import React from 'react';
import type { Filters } from '../types';

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onResetFilters: () => void;
}

const FilterSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}> = ({ label, value, min, max, onChange, unit = '' }) => (
  <div className="space-y-2">
    <label htmlFor={label} className="block text-sm font-medium">
      {label} <span className="text-app-text-muted font-mono">{value}{unit}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
    />
  </div>
);


export const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, onResetFilters }) => {
  const handleFilterChange = <K extends keyof Filters,>(filter: K, value: Filters[K]) => {
    onFilterChange({ ...filters, [filter]: value });
  };

  return (
    <div className="space-y-4 border-t border-app-text/10 pt-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manual Filters</h3>
            <button
              onClick={onResetFilters}
              className="text-sm text-app-text-muted hover:text-app-text transition-colors"
            >
              Reset
            </button>
        </div>
        <FilterSlider 
            label="Brightness" 
            value={filters.brightness} 
            min={0} 
            max={200}
            onChange={(v) => handleFilterChange('brightness', v)}
            unit="%"
        />
        <FilterSlider 
            label="Contrast" 
            value={filters.contrast} 
            min={0} 
            max={200}
            onChange={(v) => handleFilterChange('contrast', v)}
            unit="%"
        />
        <FilterSlider 
            label="Saturation" 
            value={filters.saturate} 
            min={0} 
            max={200}
            onChange={(v) => handleFilterChange('saturate', v)}
            unit="%"
        />
        <FilterSlider 
            label="Grayscale" 
            value={filters.grayscale} 
            min={0} 
            max={100}
            onChange={(v) => handleFilterChange('grayscale', v)}
            unit="%"
        />
        <FilterSlider 
            label="Sepia" 
            value={filters.sepia} 
            min={0} 
            max={100}
            onChange={(v) => handleFilterChange('sepia', v)}
            unit="%"
        />
        <FilterSlider 
            label="Invert" 
            value={filters.invert} 
            min={0} 
            max={100}
            onChange={(v) => handleFilterChange('invert', v)}
            unit="%"
        />
        <FilterSlider 
            label="Hue Rotate" 
            value={filters.hueRotate} 
            min={0} 
            max={360}
            onChange={(v) => handleFilterChange('hueRotate', v)}
            unit="deg"
        />
    </div>
  );
};
