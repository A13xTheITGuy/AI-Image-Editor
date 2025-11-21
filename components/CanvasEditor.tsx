import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback, useLayoutEffect } from 'react';
import type { Layer, Tool, PenSettings, CanvasEditorHandle, ShapeSettings, TextSettings, EraserSettings, GradientSettings } from '../types';

interface CanvasEditorProps {
  layers: Layer[];
  activeLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  baseScale: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number; }) => void;
  onFit: (baseScale: number) => void;
  activeTool: Tool;
  penSettings: PenSettings;
  eraserSettings: EraserSettings;
  shapeSettings: ShapeSettings;
  textSettings: TextSettings;
  gradientSettings: GradientSettings;
  onDrawEnd: (dataUrl: string) => void;
  onTextPlaced: (dataUrl: string) => void;
  onCrop: (rect: {x: number, y: number, width: number, height: number}) => void;
}

type CropArea = { x: number, y: number, width: number, height: number };
type Handle = 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l' | 'body';
type Point = { x: number, y: number };

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const cropHandlesData = [
    { id: 'tl', styles: { top: -6, left: -6 } },
    { id: 't', styles: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'tr', styles: { top: -6, right: -6 } },
    { id: 'l', styles: { top: '50%', left: -6, transform: 'translateY(-50%)' } },
    { id: 'r', styles: { top: '50%', right: -6, transform: 'translateY(-50%)' } },
    { id: 'bl', styles: { bottom: -6, left: -6 } },
    { id: 'b', styles: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'br', styles: { bottom: -6, right: -6 } },
];

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({ 
  layers,
  activeLayerId,
  canvasWidth,
  canvasHeight,
  zoom, 
  baseScale,
  panOffset,
  onZoomChange, 
  onPanChange,
  onFit,
  activeTool,
  penSettings,
  eraserSettings,
  shapeSettings,
  textSettings,
  gradientSettings,
  onDrawEnd,
  onTextPlaced,
  onCrop,
}, ref) => {
  const layerCanvasRefs = useRef<Record<string, HTMLCanvasElement>>({});
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const drawStartPos = useRef<Point | null>(null);
  const textPreviewPos = useRef<Point | null>(null);
  
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<Handle | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, area: { x: 0, y: 0, width: 0, height: 0 }});

  const scrollDragStartRef = useRef({ panX: 0, panY: 0, clientX: 0, clientY: 0 });
  const [isDraggingThumbX, setIsDraggingThumbX] = useState(false);
  const [isDraggingThumbY, setIsDraggingThumbY] = useState(false);

  const pinchStateRef = useRef<{ 
    initialDistance: number; 
    initialZoom: number;
    initialPan: { x: number, y: number };
    midpoint: { x: number, y: number };
  } | null>(null);
  
  // Optimization: Cache the src that was last drawn to each canvas to avoid unnecessary redraws
  // when only metadata (opacity, blendMode, visibility) changes.
  const renderedSrcsRef = useRef<Record<string, string>>({});

  const prevTransformRef = useRef({ zoom, panOffset });
  
  const scale = (zoom / 100) * baseScale;

  const getFilterString = (f: Layer['filters']) => {
    return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%) sepia(${f.sepia}%) invert(${f.invert}%) hue-rotate(${f.hueRotate}deg)`;
  };
  
  const handleFitToScreen = useCallback(() => {
    if (!canvasWidth || !canvasHeight || !containerSize.width || !containerSize.height) {
        onFit(1);
        onPanChange({ x: 0, y: 0 });
        return;
    }
    const hScale = containerSize.width / canvasWidth;
    const vScale = containerSize.height / canvasHeight;
    const newBaseScale = Math.min(hScale, vScale);
    
    const scaledWidth = canvasWidth * newBaseScale;
    const scaledHeight = canvasHeight * newBaseScale;
    const newPanX = (containerSize.width - scaledWidth) / 2;
    const newPanY = (containerSize.height - scaledHeight) / 2;
    
    onPanChange({ x: newPanX, y: newPanY });
    onFit(newBaseScale);
  }, [canvasWidth, canvasHeight, containerSize, onFit, onPanChange]);

  const getCompositeCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasWidth;
    compositeCanvas.height = canvasHeight;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return null;

    for (const layer of layers) {
      if (layer.isVisible) {
        const layerCanvas = layerCanvasRefs.current[layer.id];
        if (layerCanvas) {
          ctx.globalAlpha = layer.opacity / 100;
          ctx.globalCompositeOperation = (layer.blendMode === 'normal' ? 'source-over' : layer.blendMode) as GlobalCompositeOperation;
          ctx.filter = getFilterString(layer.filters);
          ctx.drawImage(layerCanvas, 0, 0);
        }
      }
    }
    return compositeCanvas;
  }, [layers, canvasWidth, canvasHeight]);


  useImperativeHandle(ref, () => ({
    getCanvas: () => activeLayerId ? layerCanvasRefs.current[activeLayerId] : null,
    getCompositeCanvas,
    triggerCrop: () => {
        if (cropArea) onCrop(cropArea);
    },
    fitToScreen: handleFitToScreen,
  }));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(() => {
      setContainerSize({ width: element.clientWidth, height: element.clientHeight });
    });
    resizeObserver.observe(element);
    setContainerSize({ width: element.clientWidth, height: element.clientHeight });
    return () => resizeObserver.disconnect();
  }, []);
  
  useLayoutEffect(() => {
    // Clean up cache for deleted layers
    const currentLayerIds = new Set(layers.map(l => l.id));
    Object.keys(renderedSrcsRef.current).forEach(id => {
        if (!currentLayerIds.has(id)) {
            delete renderedSrcsRef.current[id];
        }
    });

    layers.forEach(layer => {
        const canvas = layerCanvasRefs.current[layer.id];
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        
        // Check if we need to redraw this layer
        const isSrcCached = renderedSrcsRef.current[layer.id] === layer.src;
        const dimensionsMatch = canvas.width === canvasWidth && canvas.height === canvasHeight;

        if (isSrcCached && dimensionsMatch) {
            // Skip redraw if src hasn't changed and dimensions are correct
            // This is crucial for performance and prevents blinking/empty canvases
            // when changing blend modes or opacity
            return;
        }

        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
             canvas.width = canvasWidth;
             canvas.height = canvasHeight;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.src;
        img.onload = () => {
          // Verify dimensions again inside callback to prevent race conditions
          if (canvas.width === canvasWidth && canvas.height === canvasHeight) {
              ctx.clearRect(0,0, canvas.width, canvas.height);
              if (layer.src) { 
                  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
              }
              // Update cache
              renderedSrcsRef.current[layer.id] = layer.src;
          }
        };
    });
  }, [layers, canvasWidth, canvasHeight]);

  useLayoutEffect(() => {
    const { zoom: prevZoom, panOffset: prevPanOffset } = prevTransformRef.current;
    
    if (zoom !== prevZoom && panOffset.x === prevPanOffset.x && panOffset.y === prevPanOffset.y) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newPanX = centerX - (centerX - panOffset.x) * (zoom / prevZoom);
        const newPanY = centerY - (centerY - panOffset.y) * (zoom / prevZoom);
        onPanChange({ x: newPanX, y: newPanY });
      }
    }
    
    prevTransformRef.current = { zoom, panOffset };
  }, [zoom, panOffset, onPanChange]);

  useEffect(() => {
    if (activeTool === 'crop' && canvasWidth > 0 && canvasHeight > 0) {
      setCropArea({ x: 0, y: 0, width: canvasWidth, height: canvasHeight });
    } else {
      setCropArea(null);
    }
  }, [activeTool, canvasWidth, canvasHeight]);

  useEffect(() => {
    const iCanvas = interactionCanvasRef.current;
    const iCtx = iCanvas?.getContext('2d');
    if (iCanvas && iCtx) {
        iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
    }
    textPreviewPos.current = null;
  }, [activeTool]);
  
  const getCanvasRelativePosFromClient = (clientX: number, clientY: number): Point | null => {
      const canvas = interactionCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return null;
      const rect = container.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const canvasX = (x - panOffset.x) / scale;
      const canvasY = (y - panOffset.y) / scale;
      
      return { x: canvasX, y: canvasY };
  };

  const getActiveHandle = (pos: Point, area: CropArea): Handle | null => {
    const handleSize = 20 / scale;
    const handles: { id: Handle, x: number, y: number, w: number, h: number }[] = [
      { id: 'tl', x: area.x - handleSize/2, y: area.y - handleSize/2, w: handleSize, h: handleSize },
      { id: 't', x: area.x + area.width/2 - handleSize/2, y: area.y - handleSize/2, w: handleSize, h: handleSize },
      { id: 'tr', x: area.x + area.width - handleSize/2, y: area.y - handleSize/2, w: handleSize, h: handleSize },
      { id: 'r', x: area.x + area.width - handleSize/2, y: area.y + area.height/2 - handleSize/2, w: handleSize, h: handleSize },
      { id: 'br', x: area.x + area.width - handleSize/2, y: area.y + area.height - handleSize/2, w: handleSize, h: handleSize },
      { id: 'b', x: area.x + area.width/2 - handleSize/2, y: area.y + area.height - handleSize/2, w: handleSize, h: handleSize },
      { id: 'bl', x: area.x - handleSize/2, y: area.y + area.height - handleSize/2, w: handleSize, h: handleSize },
      { id: 'l', x: area.x - handleSize/2, y: area.y + area.height/2 - handleSize/2, w: handleSize, h: handleSize },
    ];
    for (const h of handles) {
      if (pos.x >= h.x && pos.x <= h.x + h.w && pos.y >= h.y && pos.y <= h.y + h.h) return h.id;
    }
    if (pos.x >= area.x && pos.x <= area.x + area.width && pos.y >= area.y && pos.y <= area.y + area.height) return 'body';
    return null;
  }
  
  const getCursorForHandle = (handle: Handle | null): string => {
    switch (handle) {
        case 'tl': case 'br': return 'nwse-resize';
        case 'tr': case 'bl': return 'nesw-resize';
        case 't': case 'b': return 'ns-resize';
        case 'l': case 'r': return 'ew-resize';
        case 'body': return 'move';
        default: return 'crosshair';
    }
  };

  const handleInteractionStart = (clientX: number, clientY: number) => {
    const pos = getCanvasRelativePosFromClient(clientX, clientY);
    if (!pos || !activeLayerId) return;
    
    if (activeTool === 'pen' || activeTool === 'eraser') {
       setIsDrawing(true); lastPos.current = pos;
    } else if (activeTool === 'shapes' || activeTool === 'gradient') {
       setIsDrawing(true); drawStartPos.current = pos;
    } else if (activeTool === 'text') {
        const canvas = layerCanvasRefs.current[activeLayerId];
        const ctx = canvas?.getContext('2d');
        if (ctx && textPreviewPos.current) {
            drawText(ctx, textPreviewPos.current, textSettings);
            onTextPlaced(canvas.toDataURL());
        }
    } else if (activeTool === 'select') {
      setIsPanning(true);
      panStartRef.current = { x: clientX - panOffset.x, y: clientY - panOffset.y };
    } else if (activeTool === 'crop' && cropArea) {
        const handle = getActiveHandle(pos, cropArea);
        if (handle) {
            setActiveHandle(handle);
            dragStartRef.current = { x: pos.x, y: pos.y, area: { ...cropArea } };
        }
    }
  };

  const drawBrushStroke = useCallback((start: Point, end: Point, settings: PenSettings | EraserSettings) => {
    const canvas = interactionCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.globalAlpha = settings.opacity / 100;
    
    const color = (settings as PenSettings).color || '#000000';

    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    for (let i = 0; i < distance; i+=1) {
        const x = start.x + Math.cos(angle) * i;
        const y = start.y + Math.sin(angle) * i;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, settings.size / 2);
        const hardnessStop = Math.max(0, Math.min(1, settings.hardness / 100));
        const midColor = hexToRgba(color, 1);
        const edgeColor = hexToRgba(color, 0);
        gradient.addColorStop(0, midColor);
        gradient.addColorStop(hardnessStop, midColor);
        gradient.addColorStop(1, edgeColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, settings.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }, []);
  
  const drawShape = useCallback((start: Point, end: Point) => {
    const canvas = interactionCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { activeShape, fillColor, strokeColor, strokeWidth, fill } = shapeSettings;
    
    ctx.beginPath();
    const w = end.x - start.x;
    const h = end.y - start.y;

    switch(activeShape) {
        case 'line':
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            break;
        case 'rectangle':
            ctx.rect(start.x, start.y, w, h);
            break;
        case 'circle':
            const radius = Math.hypot(w, h);
            ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
            break;
        case 'ellipse':
            ctx.ellipse(start.x + w/2, start.y + h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, Math.PI * 2);
            break;
        case 'triangle':
            ctx.moveTo(start.x + w / 2, start.y);
            ctx.lineTo(start.x, end.y);
            ctx.lineTo(end.x, end.y);
            ctx.closePath();
            break;
        case 'rounded-rectangle': {
            // Normalize coordinates to top-left and positive width/height to ensure correct rendering in all directions
            const x = Math.min(start.x, end.x);
            const y = Math.min(start.y, end.y);
            const width = Math.abs(w);
            const height = Math.abs(h);
            const cornerRadius = Math.min(width, height) * 0.2;

            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + width - cornerRadius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
            ctx.lineTo(x + width, y + height - cornerRadius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
            ctx.lineTo(x + cornerRadius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
            ctx.lineTo(x, y + cornerRadius);
            ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
            ctx.closePath();
            break;
        }
    }

    if (fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

  }, [shapeSettings]);

  const drawGradient = useCallback((start: Point, end: Point) => {
    const canvas = interactionCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { type, startColor, endColor, opacity } = gradientSettings;
    
    let grad: CanvasGradient;
    if (type === 'linear') {
        grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    } else { // radial
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        grad = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, radius);
    }
    
    grad.addColorStop(0, startColor);
    grad.addColorStop(1, endColor);

    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
  }, [gradientSettings]);

  const drawText = (ctx: CanvasRenderingContext2D, pos: Point, settings: TextSettings) => {
    const { content, fontFamily, fontSize, color, bold, italic, textAlign } = settings;
    const fontStyle = italic ? 'italic' : 'normal';
    const fontWeight = bold ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(content, pos.x, pos.y);
  };
  
  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    const pos = getCanvasRelativePosFromClient(clientX, clientY);
    if (!pos) return;

    if (activeTool === 'crop' && !activeHandle) {
        const handle = cropArea ? getActiveHandle(pos, cropArea) : null;
        if (hoveredHandle !== handle) {
            setHoveredHandle(handle);
        }
    }
    
    if (isDrawing && (activeTool === 'pen' || activeTool === 'eraser')) {
      const settings = activeTool === 'pen' ? penSettings : eraserSettings;
      if(lastPos.current) drawBrushStroke(lastPos.current, pos, settings);
      lastPos.current = pos;
    } else if (isDrawing && activeTool === 'shapes') {
      if(drawStartPos.current) drawShape(drawStartPos.current, pos);
    } else if (isDrawing && activeTool === 'gradient') {
      if(drawStartPos.current) drawGradient(drawStartPos.current, pos);
    } else if (activeTool === 'text') {
        textPreviewPos.current = pos;
        const canvas = interactionCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawText(ctx, pos, textSettings);
        }
    } else if (isPanning && activeTool === 'select') {
       onPanChange({ x: clientX - panStartRef.current.x, y: clientY - panStartRef.current.y });
    } else if (activeTool === 'crop' && activeHandle && cropArea) {
        const dx = pos.x - dragStartRef.current.x;
        const dy = pos.y - dragStartRef.current.y;
        const { x: startX, y: startY, width: startWidth, height: startHeight } = dragStartRef.current.area;
        let { x: newX, y: newY, width: newWidth, height: newHeight } = dragStartRef.current.area;
        
        if (activeHandle === 'body') {
            newX = startX + dx; newY = startY + dy;
            newX = Math.max(0, Math.min(newX, canvasWidth - newWidth));
            newY = Math.max(0, Math.min(newY, canvasHeight - newHeight));
        } else {
             // Enforce minimum size of 5px to prevent zero-dimension issues
            if (activeHandle.includes('l')) { 
                const newLeft = Math.min(startX + startWidth - 5, startX + dx); 
                newWidth = startX + startWidth - newLeft; 
                newX = newLeft; 
            }
            if (activeHandle.includes('r')) { 
                newWidth = Math.max(5, startWidth + dx); 
            }
            if (activeHandle.includes('t')) { 
                const newTop = Math.min(startY + startHeight - 5, startY + dy); 
                newHeight = startY + startHeight - newTop; 
                newY = newTop; 
            }
            if (activeHandle.includes('b')) { 
                newHeight = Math.max(5, startHeight + dy); 
            }
            
            if (newX < 0) { newWidth += newX; newX = 0; }
            if (newY < 0) { newHeight += newY; newY = 0; }
            if (newX + newWidth > canvasWidth) { newWidth = canvasWidth - newX; }
            if (newY + newHeight > canvasHeight) { newHeight = canvasHeight - newY; }
        }
        setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDrawing, isPanning, activeTool, activeHandle, cropArea, canvasWidth, canvasHeight, onPanChange, drawBrushStroke, drawShape, drawGradient, getCanvasRelativePosFromClient, textSettings, hoveredHandle, penSettings, eraserSettings]);

  const handleInteractionEnd = useCallback(() => {
    if (isDrawing && activeLayerId && (activeTool === 'pen' || activeTool === 'shapes' || activeTool === 'eraser' || activeTool === 'gradient')) {
        const iCanvas = interactionCanvasRef.current;
        const activeCanvas = layerCanvasRefs.current[activeLayerId];
        const ctx = activeCanvas?.getContext('2d');
        if (iCanvas && activeCanvas && ctx) {
            if (activeTool === 'eraser') {
              ctx.globalCompositeOperation = 'destination-out';
            }
            ctx.drawImage(iCanvas, 0, 0);
            if (activeTool === 'eraser') {
              ctx.globalCompositeOperation = 'source-over';
            }
            onDrawEnd(activeCanvas.toDataURL());
            const iCtx = iCanvas.getContext('2d');
            iCtx?.clearRect(0,0, iCanvas.width, iCanvas.height);
        }
    }
    
    if (activeTool === 'text') {
        const iCanvas = interactionCanvasRef.current;
        const iCtx = iCanvas?.getContext('2d');
        if (iCanvas && iCtx) {
            iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
        }
        textPreviewPos.current = null;
    }

    setIsDrawing(false); lastPos.current = null; drawStartPos.current = null; setIsPanning(false); setActiveHandle(null);
    if (hoveredHandle) {
        setHoveredHandle(null);
    }
  }, [isDrawing, activeLayerId, onDrawEnd, activeTool, hoveredHandle]);
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); const touches = e.touches;
    if (touches.length === 2) {
      const t1 = touches[0]; const t2 = touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midpoint = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      pinchStateRef.current = { initialDistance: distance, initialZoom: zoom, initialPan: { ...panOffset }, midpoint: midpoint, };
      setIsDrawing(false); setIsPanning(false); setActiveHandle(null);
    } else if (touches.length === 1) { handleInteractionStart(touches[0].clientX, touches[0].clientY); }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); const touches = e.touches;
    if (touches.length === 2 && pinchStateRef.current) {
      const t1 = touches[0]; const t2 = touches[1];
      const newDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const { initialDistance, initialZoom, initialPan, midpoint } = pinchStateRef.current;
      if (initialDistance === 0) return;
      const zoomRatio = newDistance / initialDistance;
      let newZoom = initialZoom * zoomRatio;
      newZoom = Math.max(10, Math.min(newZoom, 10000));
      const container = containerRef.current; if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const pivotX = midpoint.x - containerRect.left; const pivotY = midpoint.y - containerRect.top;
      const newPanX = pivotX - (pivotX - initialPan.x) * (newZoom / initialZoom);
      const newPanY = pivotY - (pivotY - initialPan.y) * (newZoom / initialZoom);
      onZoomChange(newZoom); onPanChange({ x: newPanX, y: newPanY });
    } else if (touches.length === 1) { handleInteractionMove(touches[0].clientX, touches[0].clientY); }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); if (pinchStateRef.current) { pinchStateRef.current = null; }
    if (e.touches.length === 1) {
      setIsDrawing(false); lastPos.current = null; setIsPanning(false); setActiveHandle(null);
      handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 0) { handleInteractionEnd(); }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); const delta = -e.deltaY; const zoomFactor = 1.1;
    const newZoom = delta > 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(10, Math.min(newZoom, 10000));
    const container = containerRef.current; if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
    const newPanX = mouseX - (mouseX - panOffset.x) * (clampedZoom / zoom);
    const newPanY = mouseY - (mouseY - panOffset.y) * (clampedZoom / zoom);
    onZoomChange(clampedZoom); onPanChange({ x: newPanX, y: newPanY });
  };
  
  const handleScrollThumbDown = (e: React.MouseEvent, direction: 'x' | 'y') => {
    e.preventDefault(); e.stopPropagation();
    scrollDragStartRef.current = { panX: panOffset.x, panY: panOffset.y, clientX: e.clientX, clientY: e.clientY };
    if (direction === 'x') setIsDraggingThumbX(true); else setIsDraggingThumbY(true);
  };

  const handleScrollbarMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const scaledWidth = canvasWidth * scale; const scaledHeight = canvasHeight * scale;
    if (isDraggingThumbX) {
      const dx = e.clientX - scrollDragStartRef.current.clientX;
      const panDx = (dx / containerSize.width) * scaledWidth;
      onPanChange({ ...panOffset, x: scrollDragStartRef.current.panX - panDx });
    }
    if (isDraggingThumbY) {
      const dy = e.clientY - scrollDragStartRef.current.clientY;
      const panDy = (dy / containerSize.height) * scaledHeight;
      onPanChange({ ...panOffset, y: scrollDragStartRef.current.panY - panDy });
    }
  }, [isDraggingThumbX, isDraggingThumbY, panOffset, onPanChange, canvasWidth, canvasHeight, containerSize, scale]);

  const handleScrollbarMouseUp = useCallback(() => { setIsDraggingThumbX(false); setIsDraggingThumbY(false); }, []);

  useEffect(() => {
    if (isDraggingThumbX || isDraggingThumbY) {
      window.addEventListener('mousemove', handleScrollbarMouseMove);
      window.addEventListener('mouseup', handleScrollbarMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleScrollbarMouseMove);
      window.removeEventListener('mouseup', handleScrollbarMouseUp);
    };
  }, [isDraggingThumbX, isDraggingThumbY, handleScrollbarMouseMove, handleScrollbarMouseUp]);

  const showViewportControls = scale > 1 || panOffset.x !== 0 || panOffset.y !== 0;
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;
  const isOverflowingX = scaledWidth > containerSize.width;
  const isOverflowingY = scaledHeight > containerSize.height;
  const thumbWidth = (containerSize.width / scaledWidth) * containerSize.width;
  const thumbHeight = (containerSize.height / scaledHeight) * containerSize.height;
  const getPanRange = (canvasDim: number, containerDim: number) => (canvasDim * scale - containerDim) / 2;
  const panRangeX = getPanRange(canvasWidth, containerSize.width);
  const panRangeY = getPanRange(canvasHeight, containerSize.height);
  const thumbX = ((panRangeX - panOffset.x) / (2 * panRangeX)) * (containerSize.width - thumbWidth);
  const thumbY = ((panRangeY - panOffset.y) / (2 * panRangeY)) * (containerSize.height - thumbHeight);


  return (
    <div className="w-full relative flex-grow flex items-center justify-center min-h-[50vh] touch-none">
      <div 
        ref={containerRef} 
        className="w-full h-full aspect-square bg-gray-900/50 rounded-lg overflow-hidden relative"
      >
        <div style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
        }}>
           <div 
             className="absolute top-0 left-0 checkerboard"
             style={{ width: canvasWidth, height: canvasHeight }}
           />
           {layers.map(layer => (
              <canvas
                key={layer.id}
                ref={el => { if(el) layerCanvasRefs.current[layer.id] = el; }}
                width={canvasWidth}
                height={canvasHeight}
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                    display: layer.isVisible ? 'block' : 'none',
                    opacity: layer.opacity / 100,
                    mixBlendMode: layer.blendMode,
                    filter: getFilterString(layer.filters),
                    imageRendering: scale > 5 ? 'pixelated' : 'auto',
                }}
              />
           ))}
        </div>
        <canvas
            ref={interactionCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                transformOrigin: '0 0',
            }}
        />

        {activeTool === 'crop' && cropArea && (
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: canvasWidth, height: canvasHeight,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                transformOrigin: '0 0',
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black/50" style={{
                 clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y}px)`
              }}/>
              <div className="absolute border border-dashed border-white" style={{ left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height }}>
                  {cropHandlesData.map(handle => (
                    <div
                      key={handle.id}
                      className="absolute w-3 h-3 bg-white rounded-full border border-gray-600"
                      style={handle.styles}
                    />
                  ))}
              </div>
            </div>
        )}

        <div
            className='absolute top-0 left-0 w-full h-full'
            style={{ 
                cursor: isPanning ? 'grabbing' 
                    : activeTool === 'text' ? 'text' 
                    : activeTool === 'crop' ? getCursorForHandle(activeHandle || hoveredHandle)
                    : (activeTool === 'shapes' || activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'gradient') ? 'crosshair' 
                    : 'default'
            }}
            onMouseDown={(e) => handleInteractionStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleInteractionMove(e.clientX, e.clientY)}
            onMouseUp={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        />
        
        {showViewportControls && isOverflowingX && (
            <div className="absolute bottom-0 left-0 w-full h-2.5 bg-black/20">
                <div onMouseDown={(e) => handleScrollThumbDown(e, 'x')} className="absolute h-full bg-gray-500/80 rounded-full hover:bg-gray-400 cursor-pointer" style={{ width: thumbWidth, left: thumbX }} />
            </div>
        )}
        {showViewportControls && isOverflowingY && (
            <div className="absolute top-0 right-0 h-full w-2.5 bg-black/20">
                 <div onMouseDown={(e) => handleScrollThumbDown(e, 'y')} className="absolute w-full bg-gray-500/80 rounded-full hover:bg-gray-400 cursor-pointer" style={{ height: thumbHeight, top: thumbY }} />
            </div>
        )}

      </div>
       {showViewportControls && (
          <div className="absolute bottom-5 right-5 flex flex-col space-y-2">
            <button onClick={handleFitToScreen} className="p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white transition-colors" aria-label="Fit to View">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
       )}
    </div>
  );
});