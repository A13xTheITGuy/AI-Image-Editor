import React, { useState, useRef } from 'react';
import type { Layer, BlendMode } from '../types';
import { ALL_BLEND_MODES } from '../types';

interface LayersPanelProps {
    layers: Layer[];
    activeLayerId: string | null;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onLayerSelect: (id: string) => void;
    onLayerChange: (id: string, updates: Partial<Layer>) => void;
    onLayerAdd: () => void;
    onLayerDelete: (id: string) => void;
    onLayerReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
    layers,
    activeLayerId,
    isCollapsed,
    onToggleCollapse,
    onLayerSelect,
    onLayerChange,
    onLayerAdd,
    onLayerDelete,
    onLayerReorder,
}) => {
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            onLayerReorder(dragItem.current, dragOverItem.current);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    const handleNameDoubleClick = (layer: Layer) => {
        setEditingNameId(layer.id);
        setTempName(layer.name);
    }
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempName(e.target.value);
    }
    
    const handleNameBlur = (layerId: string) => {
        if (tempName.trim()) {
            onLayerChange(layerId, { name: tempName.trim() });
        }
        setEditingNameId(null);
    }
    
    const handleNameKeyDown = (e: React.KeyboardEvent, layerId: string) => {
        if (e.key === 'Enter') {
            handleNameBlur(layerId);
        } else if (e.key === 'Escape') {
            setEditingNameId(null);
        }
    }

    return (
        <div className={`bg-app-panel rounded-2xl shadow-xl flex flex-col ${isCollapsed ? 'p-3 items-center' : 'p-6'}`}>
            
            {/* Expanded View */}
            <div className={isCollapsed ? 'hidden' : 'w-full'}>
                <div className="flex justify-between items-center w-full border-b border-app-text/10 pb-3 mb-4">
                    <h2 className="text-2xl font-bold">Layers</h2>
                    <button
                        onClick={onToggleCollapse}
                        className="text-app-text-muted hover:text-app-text transition-colors hidden lg:block"
                        aria-label="Collapse layers"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      </button>
                </div>
                <ul className="space-y-2 overflow-y-auto flex-grow min-h-[150px] max-h-96 pr-2">
                    {layers.map((layer, index) => (
                        <li
                            key={layer.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => onLayerSelect(layer.id)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer flex flex-col space-y-2 ${
                                layer.id === activeLayerId ? 'bg-brand-primary/50' : 'bg-app-bg hover:bg-app-bg/50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                               <div className="w-10 h-10 rounded-md checkerboard overflow-hidden flex items-center justify-center">
                                   <img src={layer.src} className="max-w-full max-h-full object-contain" alt="layer thumbnail"/>
                               </div>
                               <div className="flex-grow">
                                    {editingNameId === layer.id ? (
                                        <input 
                                            type="text"
                                            value={tempName}
                                            onChange={handleNameChange}
                                            onBlur={() => handleNameBlur(layer.id)}
                                            onKeyDown={(e) => handleNameKeyDown(e, layer.id)}
                                            className="w-full bg-app-panel text-app-text p-1 rounded text-sm"
                                            autoFocus
                                            maxLength={50} // Security: Limit input length
                                        />
                                    ) : (
                                        <p className="text-sm font-semibold truncate" onDoubleClick={() => handleNameDoubleClick(layer)}>
                                            {layer.name}
                                        </p>
                                    )}
                               </div>
                               <button onClick={(e) => { e.stopPropagation(); onLayerChange(layer.id, { isVisible: !layer.isVisible });}} className="text-app-text-muted hover:text-app-text">
                                    {layer.isVisible ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                    ):(
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    )}
                               </button>
                            </div>
                            <div className="flex flex-col space-y-2 text-xs">
                                 <div className="flex items-center space-x-2">
                                    <label htmlFor={`opacity-${layer.id}`} className="text-app-text-muted">Opacity</label>
                                    <input
                                        id={`opacity-${layer.id}`}
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={layer.opacity}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onChange={(e) => onLayerChange(layer.id, { opacity: Number(e.target.value) })}
                                        className="w-full h-1 bg-app-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <label htmlFor={`blend-${layer.id}`} className="text-app-text-muted">Blend</label>
                                    <select 
                                        id={`blend-${layer.id}`}
                                        value={layer.blendMode}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => onLayerChange(layer.id, { blendMode: e.target.value as BlendMode })}
                                        className="w-full bg-app-panel text-app-text p-1 rounded text-xs border border-app-text/10"
                                    >
                                        {ALL_BLEND_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                    </select>
                                 </div>
                            </div>
                        </li>
                    )).reverse()}
                </ul>
                <div className="flex items-center justify-end space-x-2 border-t border-app-text/10 pt-4 mt-4">
                     <button onClick={onLayerAdd} className="p-2 text-app-text-muted hover:text-app-text" aria-label="Add Layer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                     </button>
                     <button onClick={() => activeLayerId && onLayerDelete(activeLayerId)} disabled={!activeLayerId || layers.length <= 1} className="p-2 text-app-text-muted hover:text-app-text disabled:text-app-text-muted/30 disabled:cursor-not-allowed" aria-label="Delete Layer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                     </button>
                </div>
            </div>

            {/* Collapsed View */}
            {isCollapsed && (
                <button 
                    onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors group px-4 py-2"
                    aria-label="Expand layers"
                >
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338 0 4.5 4.5 0 01-1.41 8.775H6.75z" />
                        </svg>
                    </div>
                </button>
            )}
        </div>
    );
};