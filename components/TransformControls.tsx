import React from 'react';

interface TransformControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetTransform: () => void;
}

const TransformControls: React.FC<TransformControlsProps> = ({ zoom, onZoomChange, onResetTransform }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transform</h3>
        <button
          onClick={onResetTransform}
          className="text-sm text-app-text-muted hover:text-app-text transition-colors"
        >
          Fit
        </button>
      </div>
      <div className="space-y-2">
        <label htmlFor="zoom" className="block text-sm font-medium">
          Zoom <span className="text-app-text-muted font-mono">{zoom.toFixed(0)}%</span>
        </label>
        <input
          id="zoom"
          type="range"
          min="50"
          max="10000"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-full h-2 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
      </div>
    </div>
  );
};

export default TransformControls;
