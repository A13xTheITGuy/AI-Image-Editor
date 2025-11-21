import React from 'react';
import type { HistoryState } from '../types';

interface HistoryPanelProps {
    history: HistoryState[];
    currentIndex: number;
    onSelectHistory: (index: number) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentIndex, onSelectHistory, isCollapsed, onToggleCollapse }) => {
    return (
         <div className={`bg-app-panel rounded-2xl shadow-xl flex flex-col ${isCollapsed ? 'p-3 flex justify-center items-center' : 'p-6'}`}>
            {/* Expanded Panel View */}
            <div className={isCollapsed ? 'hidden' : 'w-full'}>
                <div className="flex justify-between items-center w-full border-b border-app-text/10 pb-3 mb-4">
                    <h2 className="text-2xl font-bold">History</h2>
                     <button
                        onClick={onToggleCollapse}
                        className="text-app-text-muted hover:text-app-text transition-colors hidden lg:block"
                        aria-label="Collapse history"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      </button>
                </div>
                <ul className="space-y-2 overflow-y-auto max-h-96 pr-2">
                    {history.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => onSelectHistory(index)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    index === currentIndex
                                        ? 'bg-brand-primary text-white font-semibold'
                                        : 'bg-app-bg hover:bg-app-bg/50'
                                }`}
                            >
                                {item.name}
                            </button>
                        </li>
                    )).reverse()}
                </ul>
            </div>
            
            {/* Collapsed Panel View */}
            {isCollapsed && (
                <button 
                    onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors group px-4 py-2"
                    aria-label="Expand history"
                >
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </button>
            )}
        </div>
    );
};