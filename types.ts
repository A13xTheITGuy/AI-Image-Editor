import React from 'react';

/**
 * Defines the CSS filter properties for a layer.
 */
export interface Filters {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  invert: number;
  hueRotate: number;
}

/**
 * Defines the set of available tools in the editor.
 */
export type Tool = 'select' | 'pen' | 'eraser' | 'text' | 'crop' | 'shapes' | 'gradient';

/**
 * Defines the set of available shapes for the shapes tool.
 */
export type ShapeType = 'line' | 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'rounded-rectangle';

/**
 * Defines the settings for the pen/brush tool.
 */
export interface PenSettings {
  color: string;
  size: number;
  opacity: number;
  hardness: number;
}

/**
 * Defines the settings for the eraser tool.
 */
export interface EraserSettings {
  size: number;
  opacity: number;
  hardness: number;
}

/**
 * Defines the settings for the shape tool.
 */
export interface ShapeSettings {
    activeShape: ShapeType;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fill: boolean;
}

/**
 * Defines the settings for the text tool.
 */
export interface TextSettings {
    content: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    textAlign: 'left' | 'center' | 'right';
}

/**
 * Defines the type of gradient.
 */
export type GradientType = 'linear' | 'radial';

/**
 * Defines the settings for the gradient tool.
 */
export interface GradientSettings {
    type: GradientType;
    startColor: string;
    endColor: string;
    opacity: number;
}

/**
 * Defines the available CSS blend modes for layers.
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export const ALL_BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

/**
 * Represents a single state in a layer's history.
 * Includes the image data URL and the canvas dimensions at that time.
 */
export interface HistoryState {
  src: string;
  name: string;
  width: number;
  height: number;
}

/**
 * Represents a single layer within an image composition.
 */
export interface Layer {
    id: string;
    src: string;
    name: string;
    isVisible: boolean;
    opacity: number; // 0-100
    blendMode: BlendMode;
    filters: Filters;
    history: HistoryState[];
    historyIndex: number;
}

/**
 * Represents the entire state of a single image being edited,
 * including all its layers and view transformations.
 */
export interface ImageState {
  id: string;
  name: string;
  mimeType: string;
  layers: Layer[];
  activeLayerId: string | null;
  zoom: number;
  baseScale: number;
  panOffset: { x: number; y: number };
  width: number;
  height: number;
  isFitted?: boolean;
  preview?: string;
}

/**
 * Defines the imperative handle for the CanvasEditor component,
 * exposing methods that can be called from the parent component.
 */
export interface CanvasEditorHandle {
  getCanvas: () => HTMLCanvasElement | null; // active layer canvas
  getCompositeCanvas: () => Promise<HTMLCanvasElement | null>;
  triggerCrop: () => void;
  fitToScreen: () => void;
}

/**
 * Defines the anchor point for resizing the canvas.
 */
export type AnchorPosition = 
  'top-left' | 'top-center' | 'top-right' |
  'middle-left' | 'middle-center' | 'middle-right' |
  'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Defines the customizable UI theme colors.
 */
export interface ThemeSettings {
  name: string;
  background: string;
  panel: string;
  text: string;
  textMuted: string;
  accent: string;
}