import { Library, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProcessAsset } from '../types';

interface AssetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: ProcessAsset) => void;
  assets: ProcessAsset[];
  assetType: ProcessAsset['type'];
  title: string;
}

const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  assets,
  assetType,
  title,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<ProcessAsset[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = assets
      .filter(asset => asset.type === assetType)
      .filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFilteredAssets(filtered);
  }, [assets, assetType, searchTerm]);

  const handleSelect = (asset: ProcessAsset) => {
    onSelect(asset);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary flex items-center gap-3">
            <Library size={24} /> {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name, description, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <Library size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {assets.filter(a => a.type === assetType).length === 0 
                  ? `No ${assetType}s Available`
                  : 'No Matching Assets Found'
                }
              </h3>
              <p className="text-gray-500">
                {assets.filter(a => a.type === assetType).length === 0 
                  ? `Create some ${assetType}s in the Process Assets page to use them here.`
                  : 'Try adjusting your search terms or browse all available assets.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-brand-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleSelect(asset)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{asset.name}</h3>
                    <span className="text-xs px-2 py-1 bg-brand-primary/20 text-brand-primary rounded-md border border-brand-primary/30">
                      {asset.id}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{asset.description}</p>
                  <div className="bg-gray-900 border border-gray-600 rounded-md p-3">
                    <h4 className="text-xs font-medium text-gray-300 mb-2">Content Preview:</h4>
                    <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap overflow-hidden">
                      {asset.content.length > 200 
                        ? `${asset.content.substring(0, 200)}...` 
                        : asset.content
                      }
                    </pre>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(asset.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(asset.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="px-4 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AssetSelectionModal;
