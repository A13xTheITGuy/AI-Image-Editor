import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { FilterControls } from './components/FilterControls';
import TransformControls from './components/TransformControls';
import { AIPrompt } from './components/AIPrompt';
import { CanvasEditor } from './components/CanvasEditor';
import { Spinner } from './components/Spinner';
import { downloadImage, extractMimeType, fileToBase64, mirrorImageHorizontal, mirrorImageVertical, resizeImage, rotateImage, applyFiltersToImage } from './utils/imageUtils';
import { editImageWithAI } from './services/geminiService';
import type { Filters, ImageState, Tool, PenSettings, CanvasEditorHandle, Layer, ShapeSettings, HistoryState, ThemeSettings, TextSettings, AnchorPosition, EraserSettings, GradientSettings } from './types';
import { ImageGallery } from './components/ImageGallery';
import { Toolbar } from './components/Toolbar';
import { ImageTransformTools } from './components/ImageTransformTools';
import { UploadButton } from './components/UploadButton';
import { PenControls } from './components/PenControls';
import { HistoryPanel } from './components/HistoryPanel';
import { LayersPanel } from './components/LayersPanel';
import { ShapeControls } from './components/ShapeControls';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { themes } from './themes';
import { TextControls } from './components/TextControls';
import { CanvasSizeModal } from './components/CanvasSizeModal';
import { EraserControls } from './components/EraserControls';
import { GradientControls } from './components/GradientControls';

const initialFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
};

function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

const App: React.FC = () => {
  const [images, setImages] = useState<ImageState[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [isHistoryPanelCollapsed, setIsHistoryPanelCollapsed] = useState<boolean>(false);
  const [isLayersPanelCollapsed, setIsLayersPanelCollapsed] = useState<boolean>(false);
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCanvasSizeModalOpen, setIsCanvasSizeModalOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(themes.dark);

  const handleError = useCallback((err: unknown, context: string = 'Error') => {
    console.error(context, err);
    if (err instanceof Error) {
        setError(`${context}: ${err.message}`);
    } else if (typeof err === 'string') {
        setError(`${context}: ${err}`);
    } else {
        setError(`${context}: An unknown error occurred.`);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const [ar, ag, ab] = hexToRgb(themeSettings.accent);
    const [br, bg, bb] = hexToRgb(themeSettings.background);
    const [pr, pg, pb] = hexToRgb(themeSettings.panel);
    const [tr, tg, tb] = hexToRgb(themeSettings.text);
    const [tmr, tmg, tmb] = hexToRgb(themeSettings.textMuted);

    root.style.setProperty('--color-accent-r', String(ar));
    root.style.setProperty('--color-accent-g', String(ag));
    root.style.setProperty('--color-accent-b', String(ab));
    root.style.setProperty('--color-bg-r', String(br));
    root.style.setProperty('--color-bg-g', String(bg));
    root.style.setProperty('--color-bg-b', String(bb));
    root.style.setProperty('--color-panel-r', String(pr));
    root.style.setProperty('--color-panel-g', String(pg));
    root.style.setProperty('--color-panel-b', String(pb));
    root.style.setProperty('--color-text-r', String(tr));
    root.style.setProperty('--color-text-g', String(tg));
    root.style.setProperty('--color-text-b', String(tb));
    root.style.setProperty('--color-text-muted-r', String(tmr));
    root.style.setProperty('--color-text-muted-g', String(tmg));
    root.style.setProperty('--color-text-muted-b', String(tmb));
  }, [themeSettings]);

  const [toolSettings, setToolSettings] = useState<{ pen: PenSettings; shape: ShapeSettings; text: TextSettings; eraser: EraserSettings; gradient: GradientSettings; }>({
    pen: { color: '#ffffff', size: 5, opacity: 100, hardness: 100 },
    shape: { 
        activeShape: 'rectangle',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 5,
        fill: true,
     },
     text: {
        content: 'Hello World',
        fontFamily: 'Arial',
        fontSize: 50,
        color: '#ffffff',
        bold: false,
        italic: false,
        textAlign: 'left',
     },
     eraser: { size: 30, opacity: 100, hardness: 100 },
     gradient: { type: 'linear', startColor: '#000000', endColor: '#ffffff', opacity: 100 },
  });

  const editorRef = useRef<CanvasEditorHandle>(null);
  const filterDebounceTimer = useRef<number | null>(null);

  const activeImage = images.find(img => img.id === activeImageId);
  const activeLayer = activeImage?.layers.find(l => l.id === activeImage.activeLayerId);
  
  const activeImageWidth = activeImage?.width;
  const activeImageHeight = activeImage?.height;
  const isImageFitted = activeImage?.isFitted;
  
  const updateImageState = useCallback((imageId: string, updates: Partial<ImageState>) => {
    setImages(imgs => imgs.map(img => img.id === imageId ? { ...img, ...updates } : img));
  }, []);

  useEffect(() => {
    if (!activeImage || !editorRef.current) return;

    const isInitialFit = !isImageFitted;
    
    const delay = isInitialFit ? 50 : 0;
    const timer = setTimeout(() => {
        editorRef.current?.fitToScreen();
    }, delay);

    return () => clearTimeout(timer);
    
  }, [activeImageId, activeImageWidth, activeImageHeight, isImageFitted]);
  
  // Effect to update thumbnail when layers change
  useEffect(() => {
    if (!activeImageId) return;

    const timer = setTimeout(async () => {
      if (editorRef.current) {
        try {
          const canvas = await editorRef.current.getCompositeCanvas();
          if (canvas) {
             const maxSize = 300;
             let targetWidth = canvas.width;
             let targetHeight = canvas.height;
             
             if (canvas.width > maxSize || canvas.height > maxSize) {
                const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height);
                targetWidth = canvas.width * ratio;
                targetHeight = canvas.height * ratio;
             }
             
             const thumbCanvas = document.createElement('canvas');
             thumbCanvas.width = targetWidth;
             thumbCanvas.height = targetHeight;
             const ctx = thumbCanvas.getContext('2d');
             if (ctx) {
                ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
                const preview = thumbCanvas.toDataURL('image/png');
                
                setImages(prev => prev.map(img => {
                    if (img.id === activeImageId) {
                        return { ...img, preview };
                    }
                    return img;
                }));
             }
          }
        } catch (e) {
          console.error("Failed to generate thumbnail", e);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeImageId, activeImage?.layers]);


  const updateLayerState = useCallback((imageId: string, layerId: string, updates: Partial<Layer>) => {
    // SECURITY: Enforce truncation on layer names if they are being updated
    if (updates.name) {
        updates.name = updates.name.slice(0, 50);
    }

    setImages(imgs => imgs.map(img => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        layers: img.layers.map(l => l.id === layerId ? { ...l, ...updates } : l),
      };
    }));
  }, []);

  const addLayerHistoryState = useCallback((newSrc: string, name: string, extraUpdates: Partial<Layer> = {}) => {
    if (!activeImageId || !activeLayer || !activeImage) return;
    
    let currentHistory = activeLayer.history.slice(0, activeLayer.historyIndex + 1);
    const newHistoryState: HistoryState = { 
      src: newSrc, 
      name,
      width: activeImage.width,
      height: activeImage.height,
    };
    
    currentHistory.push(newHistoryState);

    // SECURITY: Limit history size to prevent memory exhaustion (DoS)
    const MAX_HISTORY = 20;
    if (currentHistory.length > MAX_HISTORY) {
        currentHistory = currentHistory.slice(currentHistory.length - MAX_HISTORY);
    }

    updateLayerState(activeImageId, activeLayer.id, {
        src: newSrc,
        history: currentHistory,
        historyIndex: currentHistory.length - 1,
        ...extraUpdates,
    });
  }, [activeImageId, activeLayer, activeImage, updateLayerState]);

  const handleDrawEnd = useCallback((dataUrl: string) => {
    if (!activeLayer) return;

    let name = 'Edit';
    if (activeTool === 'pen') {
        const drawCount = activeLayer.history.filter(h => h.name.startsWith('Draw')).length + 1;
        name = `Draw ${drawCount}`;
    } else if (activeTool === 'shapes') {
        const shapeCount = activeLayer.history.filter(h => h.name.startsWith('Shape')).length + 1;
        name = `Shape ${shapeCount}`;
    } else if (activeTool === 'eraser') {
        const eraseCount = activeLayer.history.filter(h => h.name.startsWith('Erase')).length + 1;
        name = `Erase ${eraseCount}`;
    } else if (activeTool === 'gradient') {
        const gradientCount = activeLayer.history.filter(h => h.name.startsWith('Gradient')).length + 1;
        name = `Gradient ${gradientCount}`;
    }
    
    addLayerHistoryState(dataUrl, name);
  }, [addLayerHistoryState, activeLayer, activeTool]);
  
  const handleTextPlaced = useCallback((dataUrl: string) => {
    addLayerHistoryState(dataUrl, 'Add Text');
  }, [addLayerHistoryState]);

  const handleImageUpload = useCallback(async (files: FileList) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const allFiles = Array.from(files);
      const imageFiles = allFiles.filter(file => file.type.startsWith('image/'));

      if (allFiles.length > 0 && imageFiles.length === 0) {
        setError('No valid image files were selected. Please upload file types like PNG, JPEG, GIF, etc.');
        setIsLoading(false);
        return;
      }

      if (imageFiles.length === 0) {
          setIsLoading(false);
          return;
      }

      // SECURITY: Check for max file size to prevent memory issues
      const MAX_FILE_SIZE_MB = 10;
      const largeFiles = imageFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
      if (largeFiles.length > 0) {
          setError(`File too large (max ${MAX_FILE_SIZE_MB}MB): ${largeFiles[0].name}`);
          setIsLoading(false);
          return;
      }

      const newImages: ImageState[] = [];
      const errors: string[] = [];

      await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const base64String = await fileToBase64(file);
            const mimeType = extractMimeType(base64String);
            
            const nameWithoutExtension = file.name.lastIndexOf('.') > 0 
              ? file.name.substring(0, file.name.lastIndexOf('.'))
              : file.name;
            
            // SECURITY: Truncate name to prevent UI overflow
            const safeName = nameWithoutExtension.slice(0, 50);
            
            const id = `${Date.now()}-${safeName.replace(/[^a-z0-9]/gi, '_')}`;
            const layerId = `${id}-layer-0`;
            
            const img = new Image();
            // SECURITY: Prevent hanging on invalid/corrupt images
            await new Promise((resolve, reject) => { 
                img.onload = resolve; 
                img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
                img.src = base64String; 
            });
            
            const initialLayer: Layer = {
              id: layerId,
              src: base64String,
              name: 'Background',
              isVisible: true,
              opacity: 100,
              blendMode: 'normal',
              filters: initialFilters,
              history: [{ src: base64String, name: 'Original', width: img.naturalWidth, height: img.naturalHeight }],
              historyIndex: 0,
            };

            newImages.push({
              id,
              name: safeName,
              mimeType,
              layers: [initialLayer],
              activeLayerId: layerId,
              zoom: 100,
              baseScale: 1,
              panOffset: { x: 0, y: 0 },
              width: img.naturalWidth,
              height: img.naturalHeight,
              isFitted: false,
              preview: base64String,
            });
          } catch (e) {
              console.error(e);
              errors.push(file.name);
          }
        })
      );

      if (errors.length > 0) {
          setError(`Failed to load the following files: ${errors.join(', ')}`);
      }

      if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
          if (!activeImageId) {
            setActiveImageId(newImages[0].id);
          }
      }
    } catch (err) {
      handleError(err, 'Failed to load images');
    } finally {
        setIsLoading(false);
    }
  }, [activeImageId, handleError]);

  const handleSelectImage = useCallback((id: string) => {
    setActiveImageId(id);
  }, []);
  
  const handleHistorySelection = useCallback((index: number) => {
    if (!activeImageId || !activeLayer || !activeImage) return;
    
    const selectedHistoryState = activeLayer.history[index];
    const { src: newSrc, width: newWidth, height: newHeight } = selectedHistoryState;
    
    updateLayerState(activeImageId, activeLayer.id, { src: newSrc, historyIndex: index, filters: initialFilters });

    if (activeImage.width !== newWidth || activeImage.height !== newHeight) {
        updateImageState(activeImageId, { width: newWidth, height: newHeight, isFitted: false });
    }
  }, [activeImageId, activeLayer, activeImage, updateLayerState, updateImageState]);


  const handleResetApp = useCallback(() => {
    setImages([]);
    setActiveImageId(null);
    setError(null);
  }, []);

  const commitFilterChange = useCallback(async (filtersToApply: Filters) => {
    if (!activeImage || !activeLayer) return;
    setIsLoading(true);
    try {
        const currentSrc = activeLayer.history[activeLayer.historyIndex].src;
        const newSrc = await applyFiltersToImage(currentSrc, filtersToApply);

        const filterCount = activeLayer.history.filter(h => h.name.startsWith('Filter')).length + 1;
        addLayerHistoryState(newSrc, `Filter ${filterCount}`, { filters: initialFilters });
    } catch (err) {
        handleError(err, 'Failed to apply filters');
    } finally {
        setIsLoading(false);
    }
  }, [activeImage, activeLayer, addLayerHistoryState, handleError]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    if (!activeImageId || !activeLayer) return;
    
    updateLayerState(activeImageId, activeLayer.id, { filters: newFilters });

    if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
    }

    filterDebounceTimer.current = window.setTimeout(() => {
        commitFilterChange(newFilters);
    }, 800);

  }, [activeImageId, activeLayer, updateLayerState, commitFilterChange]);


  const handleResetFilters = useCallback(() => {
    if (activeImageId && activeLayer) {
      handleFilterChange(initialFilters);
    }
  }, [activeImageId, activeLayer, handleFilterChange]);

  const handleFit = useCallback((newBaseScale: number) => {
    if (activeImageId) {
      updateImageState(activeImageId, {
        baseScale: newBaseScale,
        zoom: 100,
        isFitted: true,
      });
    }
  }, [activeImageId, updateImageState]);

  const handleResetTransform = useCallback(() => {
    editorRef.current?.fitToScreen();
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!activeImage || !activeLayer || !prompt) {
      setError('Please select an image and enter a prompt.');
      return;
    }
    
    // SECURITY: Basic Input Sanitization
    if (prompt.length > 1000) {
        setError('Prompt is too long (max 1000 characters).');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const base64Data = activeLayer.src.split(',')[1];
      const result = await editImageWithAI(base64Data, activeImage.mimeType, prompt);
      const newSrc = `data:image/png;base64,${result}`;
      
      addLayerHistoryState(newSrc, 'AI Generation');

    } catch (err) {
      handleError(err, 'AI generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [activeImage, activeLayer, addLayerHistoryState, handleError]);

  const handleSaveImage = useCallback(async () => {
    try {
        const canvas = await editorRef.current?.getCompositeCanvas();
        if (!canvas || !activeImage) {
          setError("Could not get a reference to the image canvas.");
          return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        const fileName = `edited-${activeImage.id}.png`;
        downloadImage(dataUrl, fileName);
    } catch (err) {
        handleError(err, 'Failed to save image');
    }
  }, [activeImage, handleError]);

  const handleDeleteImage = useCallback(() => {
    if (!activeImageId) return;
    const imageIndex = images.findIndex(img => img.id === activeImageId);
    const newImages = images.filter(img => img.id !== activeImageId);
    setImages(newImages);
    if (newImages.length === 0) {
        setActiveImageId(null);
    } else {
        const newIndex = Math.max(0, Math.min(imageIndex, newImages.length - 1));
        setActiveImageId(newImages[newIndex].id);
    }
  }, [activeImageId, images]);
  
  const handlePenSettingsChange = (settings: Partial<PenSettings>) => {
    setToolSettings(prev => ({ ...prev, pen: { ...prev.pen, ...settings } }));
  };

  const handleEraserSettingsChange = (settings: Partial<EraserSettings>) => {
    setToolSettings(prev => ({ ...prev, eraser: { ...prev.eraser, ...settings } }));
  };

  const handleShapeSettingsChange = (settings: Partial<ShapeSettings>) => {
    setToolSettings(prev => ({ ...prev, shape: { ...prev.shape, ...settings } }));
  };
  
  const handleTextSettingsChange = (settings: Partial<TextSettings>) => {
    setToolSettings(prev => ({ ...prev, text: { ...prev.text, ...settings } }));
  };
  
  const handleGradientSettingsChange = (settings: Partial<GradientSettings>) => {
    setToolSettings(prev => ({ ...prev, gradient: { ...prev.gradient, ...settings } }));
  };

  const handleResize = async (width: number, height: number) => {
    if (!activeImage) return;
    
    // SECURITY: Prevent memory exhaustion DoS
    if (width > 4096 || height > 4096) {
        setError('Maximum dimensions allowed are 4096x4096px.');
        return;
    }
    
    setIsLoading(true);
    try {
        const newLayers = await Promise.all(activeImage.layers.map(async (layer) => {
          const resizedSrc = await resizeImage(layer.src, width, height);
          const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
          const newHistoryState: HistoryState = { src: resizedSrc, name: 'Resize', width, height };
          return {
            ...layer,
            src: resizedSrc,
            history: [...currentHistory, newHistoryState],
            historyIndex: currentHistory.length
          };
        }));
        updateImageState(activeImage.id, { layers: newLayers, width, height, isFitted: false });
    } catch (err) {
        handleError(err, 'Resize failed');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRotate = useCallback(async () => {
      if (!activeImage) return;
      setIsLoading(true);
      try {
          let newWidth = activeImage.width;
          let newHeight = activeImage.height;

          const newLayers = await Promise.all(activeImage.layers.map(async (layer, index) => {
            const { dataUrl, width, height } = await rotateImage(layer.src);
            if (index === 0) {
                newWidth = width;
                newHeight = height;
            }
            const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
            const rotateCount = currentHistory.filter(h => h.name.startsWith('Rotate')).length + 1;
            const newHistoryState: HistoryState = { src: dataUrl, name: `Rotate ${rotateCount}`, width, height };
            return { ...layer, src: dataUrl, history: [...currentHistory, newHistoryState], historyIndex: currentHistory.length };
          }));

          updateImageState(activeImage.id, { layers: newLayers, width: newWidth, height: newHeight, isFitted: false });
      } catch (err) {
          handleError(err, 'Rotate failed');
      } finally {
          setIsLoading(false);
      }
    }, [activeImage, updateImageState, handleError]);
    
  const handleMirrorHorizontal = useCallback(async () => {
    if (!activeImage) return;
    setIsLoading(true);
    try {
        const newLayers = await Promise.all(activeImage.layers.map(async (layer) => {
          const mirroredSrc = await mirrorImageHorizontal(layer.src);
          const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
          const mirrorCount = currentHistory.filter(h => h.name.startsWith('Flip Horizontal')).length + 1;
          const newHistoryState: HistoryState = { src: mirroredSrc, name: `Flip Horizontal ${mirrorCount}`, width: activeImage.width, height: activeImage.height, };
          return { ...layer, src: mirroredSrc, history: [...currentHistory, newHistoryState], historyIndex: currentHistory.length };
        }));

        updateImageState(activeImage.id, { layers: newLayers });
    } catch (err) {
        handleError(err, 'Flip Horizontal failed');
    } finally {
        setIsLoading(false);
    }
  }, [activeImage, updateImageState, handleError]);
  
  const handleMirrorVertical = useCallback(async () => {
    if (!activeImage) return;
    setIsLoading(true);
    try {
        const newLayers = await Promise.all(activeImage.layers.map(async (layer) => {
          const mirroredSrc = await mirrorImageVertical(layer.src);
          const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
          const mirrorCount = currentHistory.filter(h => h.name.startsWith('Flip Vertical')).length + 1;
          const newHistoryState: HistoryState = { src: mirroredSrc, name: `Flip Vertical ${mirrorCount}`, width: activeImage.width, height: activeImage.height, };
          return { ...layer, src: mirroredSrc, history: [...currentHistory, newHistoryState], historyIndex: currentHistory.length };
        }));

        updateImageState(activeImage.id, { layers: newLayers });
    } catch (err) {
        handleError(err, 'Flip Vertical failed');
    } finally {
        setIsLoading(false);
    }
  }, [activeImage, updateImageState, handleError]);

  const handleCanvasSizeChange = async (newWidth: number, newHeight: number, anchor: AnchorPosition) => {
    if (!activeImage) return;

    // SECURITY: Prevent memory exhaustion DoS
    if (newWidth > 4096 || newHeight > 4096) {
        setError('Maximum dimensions allowed are 4096x4096px.');
        return;
    }

    setIsLoading(true);

    try {
        const oldWidth = activeImage.width;
        const oldHeight = activeImage.height;

        const newLayers = await Promise.all(activeImage.layers.map(async (layer) => {
            const img = new Image();
            img.src = layer.src;
            if (layer.src) {
                await new Promise(r => { img.onload = r; img.onerror = r; });
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return layer;

            let x = 0;
            let y = 0;
            
            if (anchor.includes('center')) {
                x = (newWidth - oldWidth) / 2;
            } else if (anchor.includes('right')) {
                x = newWidth - oldWidth;
            }

            if (anchor.includes('middle')) {
                y = (newHeight - oldHeight) / 2;
            } else if (anchor.includes('bottom')) {
                y = newHeight - oldHeight;
            }
            
            if (layer.src) {
              tempCtx.drawImage(img, x, y, oldWidth, oldHeight);
            }
            
            const newSrc = tempCanvas.toDataURL();

            const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
            const historyName = `Canvas Size`;
            const newHistoryState: HistoryState = { src: newSrc, name: historyName, width: newWidth, height: newHeight };

            return { ...layer, src: newSrc, history: [...currentHistory, newHistoryState], historyIndex: currentHistory.length };
        }));

        updateImageState(activeImage.id, { layers: newLayers, width: newWidth, height: newHeight, isFitted: false });
    } catch (err) {
        handleError(err, 'Canvas size change failed');
    } finally {
        setIsLoading(false);
        setIsCanvasSizeModalOpen(false);
    }
  };

  const handleCrop = async (rect: {x: number, y: number, width: number, height: number}) => {
    if (!activeImage) return;
    setIsLoading(true);
    try {
        // 1. Round coordinates to ensure integers and prevent sub-pixel rendering issues
        const cropX = Math.round(rect.x);
        const cropY = Math.round(rect.y);
        const cropWidth = Math.round(rect.width);
        const cropHeight = Math.round(rect.height);

        // 2. Validate dimensions
        if (cropWidth <= 0 || cropHeight <= 0) {
            throw new Error("Invalid crop dimensions");
        }

        const newLayers = await Promise.all(activeImage.layers.map(async (layer) => {
            const img = new Image();
            // 3. FIX RACE CONDITION: Set onload/onerror BEFORE setting src
            // This ensures we don't miss the event if the browser loads the data URI synchronously
            const loadPromise = new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = (e) => reject(new Error(`Failed to load layer image for cropping`));
            });
            img.src = layer.src;
            await loadPromise;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return layer;
            
            // Draw the cropped region from the source image
            tempCtx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            
            const newSrc = tempCanvas.toDataURL();
            
            const currentHistory = layer.history.slice(0, layer.historyIndex + 1);
            const cropCount = currentHistory.filter(h => h.name.startsWith('Crop')).length + 1;
            const newHistoryState: HistoryState = { src: newSrc, name: `Crop ${cropCount}`, width: cropWidth, height: cropHeight };
            
            return { ...layer, src: newSrc, history: [...currentHistory, newHistoryState], historyIndex: currentHistory.length };
        }));
        updateImageState(activeImage.id, { layers: newLayers, width: cropWidth, height: cropHeight, isFitted: false });
        setActiveTool('select');
    } catch (err) {
        handleError(err, 'Crop failed');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCropSelect = useCallback(() => {
    handleResetTransform();
    setActiveTool('crop');
  }, [handleResetTransform]);

  const handleApplyCrop = useCallback(() => { editorRef.current?.triggerCrop(); }, []);

  const isRightColumnTotallyCollapsed = isHistoryPanelCollapsed && isLayersPanelCollapsed;

  const getCenterColSpan = () => {
    const leftSpan = isLeftPanelCollapsed ? 1 : 3;
    const rightSpan = isRightColumnTotallyCollapsed ? 1 : 3;
    const centerSpan = 12 - leftSpan - rightSpan;
    const spanMap: { [key: number]: string } = { 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8', 9: 'lg:col-span-9', 10: 'lg:col-span-10' };
    return spanMap[centerSpan] || 'lg:col-span-6';
  };
  
  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans flex flex-col">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} onOpenAbout={() => setIsAboutOpen(true)} />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={`lg:relative transition-all duration-300 ease-in-out ${isLeftPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <div className={`lg:sticky lg:top-24 bg-app-panel rounded-2xl shadow-xl flex flex-col max-h-[calc(100vh-8rem)] ${isLeftPanelCollapsed ? 'p-3 flex justify-center items-center' : 'p-6'}`}>
              
              {/* Expanded Panel View */}
              <div className={isLeftPanelCollapsed ? 'hidden' : 'flex flex-col overflow-y-auto'}>
                  <div className="flex justify-between items-center w-full border-b border-app-text/10 pb-3 mb-4">
                      <h2 className="text-2xl font-bold">Controls</h2>
                      <button onClick={() => setIsLeftPanelCollapsed(true)} className="text-app-text-muted hover:text-app-text transition-colors hidden lg:block" aria-label="Collapse controls">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                      </button>
                  </div>
                  <div className="w-full space-y-6">
                    {!activeImage ? <ImageUploader onImageUpload={handleImageUpload} /> : (
                      <>
                        <Toolbar activeTool={activeTool} onToolSelect={setActiveTool} />
                        {activeTool === 'pen' && <PenControls settings={toolSettings.pen} onSettingsChange={handlePenSettingsChange} />}
                        {activeTool === 'eraser' && <EraserControls settings={toolSettings.eraser} onSettingsChange={handleEraserSettingsChange} />}
                        {activeTool === 'shapes' && <ShapeControls settings={toolSettings.shape} onSettingsChange={handleShapeSettingsChange} />}
                        {activeTool === 'text' && <TextControls settings={toolSettings.text} onSettingsChange={handleTextSettingsChange} />}
                        {activeTool === 'gradient' && <GradientControls settings={toolSettings.gradient} onSettingsChange={handleGradientSettingsChange} />}
                        <ImageTransformTools activeTool={activeTool} onToolSelect={setActiveTool} onCropSelect={handleCropSelect} onApplyCrop={handleApplyCrop} onResize={handleResize} onRotate={handleRotate} onMirrorHorizontal={handleMirrorHorizontal} onMirrorVertical={handleMirrorVertical} onCanvasSize={() => setIsCanvasSizeModalOpen(true)} />
                         {activeImage && activeLayer && (
                           <>
                            <TransformControls zoom={activeImage.zoom} onZoomChange={(z) => updateImageState(activeImage.id, { zoom: z })} onResetTransform={handleResetTransform} />
                            <FilterControls filters={activeLayer.filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />
                           </>
                         )}
                        <AIPrompt onGenerate={handleGenerate} isLoading={isLoading} />
                        <div className="space-y-3 border-t border-app-text/10 pt-4">
                          <button onClick={handleSaveImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            <span>Save Image</span>
                          </button>
                          <UploadButton onImageUpload={handleImageUpload} />
                          <button onClick={handleDeleteImage} className="w-full bg-red-600/80 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span>Delete Image</span>
                          </button>
                          <button onClick={handleResetApp} className="w-full bg-transparent border border-red-600/80 text-red-500 hover:bg-red-600/20 font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                            </svg>
                            <span>Reset Session</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
              </div>

              {/* Collapsed Panel View */}
              {isLeftPanelCollapsed && (
                 <button onClick={() => setIsLeftPanelCollapsed(false)} className="hidden lg:flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors group px-4 py-2" aria-label="Expand controls">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6h9m-9 6h9m-9 6h9M6 6h1v1H6V6zm0 6h1v1H6v-1zm0 6h1v1H6v-1zm0 6h1v1H6v-1z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </div>
                </button>
              )}
          </div>
        </div>

        <div className={`transition-all duration-300 ease-in-out ${getCenterColSpan()}`}>
          <div className="bg-app-panel rounded-2xl shadow-xl p-6 flex flex-col items-center justify-start h-full space-y-4">
            {activeImage && (
                <div className="w-full text-center border-b border-app-text/10 pb-3">
                    <h2 className="text-xl font-bold text-app-text truncate" title={activeImage.name}>
                        {activeImage.name}
                    </h2>
                </div>
            )}
             <ImageGallery images={images} activeImageId={activeImageId} onSelectImage={handleSelectImage} />
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center w-full">{error}</div>}
            
            {activeImage ? (
              <div className="w-full flex flex-col items-center space-y-4 flex-grow">
                {isLoading ? (
                  <div className="w-full aspect-square bg-app-bg/50 rounded-lg flex items-center justify-center">
                    <Spinner /> <span className="ml-4 text-lg">Processing...</span>
                  </div>
                ) : (
                   <CanvasEditor ref={editorRef} layers={activeImage.layers} activeLayerId={activeImage.activeLayerId} canvasWidth={activeImage.width} canvasHeight={activeImage.height} zoom={activeImage.zoom} baseScale={activeImage.baseScale} panOffset={activeImage.panOffset} onZoomChange={(z) => updateImageState(activeImage.id, { zoom: z })} onPanChange={(p) => updateImageState(activeImage.id, { panOffset: p })} onFit={handleFit} activeTool={activeTool} penSettings={toolSettings.pen} eraserSettings={toolSettings.eraser} shapeSettings={toolSettings.shape} textSettings={toolSettings.text} gradientSettings={toolSettings.gradient} onDrawEnd={handleDrawEnd} onTextPlaced={handleTextPlaced} onCrop={handleCrop} />
                )}
              </div>
            ) : (
               <div className="flex-grow flex flex-col items-center justify-center text-center text-app-text-muted min-h-[50vh]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-medium">No image selected</p>
                  <p className="text-sm mt-2">Upload an image from the left panel to get started</p>
               </div>
            )}
          </div>
        </div>

        <div className={`lg:relative transition-all duration-300 ease-in-out ${isRightColumnTotallyCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            <div className={`lg:sticky lg:top-24 flex flex-col space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto`}>
                {activeImageId && activeLayer && (
                    <>
                        <HistoryPanel 
                            history={activeLayer.history} 
                            currentIndex={activeLayer.historyIndex} 
                            onSelectHistory={handleHistorySelection}
                            isCollapsed={isHistoryPanelCollapsed}
                            onToggleCollapse={() => setIsHistoryPanelCollapsed(!isHistoryPanelCollapsed)}
                        />
                         <LayersPanel 
                            layers={activeImage.layers} 
                            activeLayerId={activeImage.activeLayerId} 
                            isCollapsed={isLayersPanelCollapsed}
                            onToggleCollapse={() => setIsLayersPanelCollapsed(!isLayersPanelCollapsed)}
                            onLayerSelect={(id) => updateImageState(activeImageId, { activeLayerId: id })}
                            onLayerChange={(id, updates) => updateLayerState(activeImageId, id, updates)}
                            onLayerAdd={() => {
                                const newLayerId = `${activeImageId}-layer-${Date.now()}`;
                                const newLayer: Layer = {
                                    id: newLayerId,
                                    src: '', // Empty transparent layer
                                    name: 'New Layer',
                                    isVisible: true,
                                    opacity: 100,
                                    blendMode: 'normal',
                                    filters: initialFilters,
                                    history: [{ src: '', name: 'Created', width: activeImage.width, height: activeImage.height }],
                                    historyIndex: 0,
                                };
                                updateImageState(activeImageId, { layers: [newLayer, ...activeImage.layers], activeLayerId: newLayerId });
                            }}
                            onLayerDelete={(id) => {
                                const newLayers = activeImage.layers.filter(l => l.id !== id);
                                updateImageState(activeImageId, { layers: newLayers, activeLayerId: newLayers.length > 0 ? newLayers[0].id : null });
                            }}
                            onLayerReorder={(dragIndex, hoverIndex) => {
                                const newLayers = [...activeImage.layers];
                                const [removed] = newLayers.splice(dragIndex, 1);
                                newLayers.splice(hoverIndex, 0, removed);
                                updateImageState(activeImageId, { layers: newLayers });
                            }}
                        />
                    </>
                )}
            </div>
        </div>

      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={themeSettings} onSettingsChange={setThemeSettings} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <CanvasSizeModal 
        isOpen={isCanvasSizeModalOpen} 
        onClose={() => setIsCanvasSizeModalOpen(false)} 
        currentWidth={activeImageWidth || 800}
        currentHeight={activeImageHeight || 600}
        onApply={handleCanvasSizeChange}
      />
    </div>
  );
};

export default App;