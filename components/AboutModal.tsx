import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-app-bg border border-app-text/10 rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-app-text/10 pb-4 mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">About AI Image Editor</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-app-panel">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-app-text-muted">How to Use</h3>
                        <p className="text-sm">This editor combines traditional tools with AI power. Here's a quick start guide:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
                            <li><strong>Upload:</strong> Start by uploading one or more images using the uploader in the left panel.</li>
                            <li><strong>Tools:</strong> Select tools like Pen, Shapes, or Crop from the left panel. Contextual controls for the active tool will appear below.</li>
                            <li><strong>Layers:</strong> Manage your image composition with the Layers panel on the right. Add, delete, reorder, and change the opacity or blend mode of each layer. All edits apply only to the selected layer.</li>
                            <li><strong>History:</strong> Every action on a layer is recorded in the History panel. Click any past action to revert the layer to that state.</li>
                            <li><strong>AI Magic Edit:</strong> Use the prompt box to describe changes you want to make. The AI will generate a new version of your selected layer, which is added as a reversible step in your history.</li>
                            <li><strong>Save:</strong> When you're done, click "Save Image" to download a flattened PNG of your entire creation.</li>
                        </ul>
                    </div>

                     <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-app-text-muted">Contact & Credits</h3>
                        <p className="text-sm">This application was developed by A13xTheITGuy.</p>
                        <div className="flex flex-col space-y-2 text-sm">
                           <div className="flex items-center space-x-2">
                                <span className="font-semibold w-16">Email:</span>
                                <a href="mailto:alexandru.stan2@student.upt.ro" className="text-brand-primary hover:underline">alexandru.stan2@student.upt.ro</a>
                           </div>
                           <div className="flex items-center space-x-2">
                                <span className="font-semibold w-16">GitHub:</span>
                                <a href="https://github.com/A13xTheITGuy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">A13xTheITGuy</a>
                           </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};