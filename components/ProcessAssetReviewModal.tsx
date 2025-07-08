import React, { useState, useEffect } from 'react';
import { X, Bot, Check, Inbox, CheckSquare, Square } from 'lucide-react';
import { ProcessAsset } from '../types';

const ASSET_TYPE_STYLES: { [key: string]: string } = {
  'Requirement Archetype': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'Solution Blueprint': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'Risk Playbook': 'bg-red-900/50 text-red-300 border-red-700',
  'Test Strategy': 'bg-green-900/50 text-green-300 border-green-700',
};

const ProcessAssetReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  suggestedAssets: ProcessAsset[];
  onImport: (assetsToImport: ProcessAsset[]) => void;
}> = ({ isOpen, onClose, suggestedAssets, onImport }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      // Pre-select all by default
      setSelectedIds(new Set(suggestedAssets.map(a => a.id)));
    }
  }, [isOpen, suggestedAssets]);

  const handleToggle = (assetId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === suggestedAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestedAssets.map(a => a.id)));
    }
  };

  const handleImportClick = () => {
    const assetsToImport = suggestedAssets.filter(a => selectedIds.has(a.id));
    onImport(assetsToImport);
    onClose();
  };

  if (!isOpen) return null;

  const allSelected = selectedIds.size === suggestedAssets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary flex items-center gap-3">
            <Bot size={24} /> Review AI-Suggested Process Assets
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>

        <main className="p-6 overflow-y-auto space-y-4">
          {suggestedAssets.length > 0 ? (
            <>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <p className="text-sm text-gray-400">Select the assets you want to import into your library.</p>
                  <button onClick={handleToggleAll} className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors">
                      {allSelected ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} />}
                      {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
              </div>
              {suggestedAssets.map(asset => (
                <div key={asset.id} className="bg-gray-800/50 p-4 rounded-lg flex items-start gap-4 border border-gray-700">
                  <input
                    type="checkbox"
                    id={`asset-select-${asset.id}`}
                    checked={selectedIds.has(asset.id)}
                    onChange={() => handleToggle(asset.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary flex-shrink-0"
                  />
                  <label htmlFor={`asset-select-${asset.id}`} className="flex-grow cursor-pointer">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-white">{asset.name}</h3>
                            <p className="text-sm text-gray-400">{asset.description}</p>
                        </div>
                        <span className={`flex-shrink-0 ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ASSET_TYPE_STYLES[asset.type]}`}>
                            {asset.type}
                        </span>
                    </div>
                    <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-white">Show Content</summary>
                        <pre className="mt-2 text-xs bg-gray-950 p-3 rounded-md whitespace-pre-wrap font-mono text-cyan-300 max-h-40 overflow-auto">{asset.content}</pre>
                    </details>
                  </label>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <Inbox size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">No New Assets Suggested</h3>
              <p className="text-gray-500 mt-2">The AI didn't find any new reusable patterns in your project data.</p>
            </div>
          )}
        </main>

        <footer className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleImportClick}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Import ({selectedIds.size}) Selected
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProcessAssetReviewModal;
