import { AlertTriangle, Edit, Github, Library, Loader, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfigurationItem, ProjectData } from '../types';
import AssetSelectionModal from './AssetSelectionModal';

interface ConfigurationPageProps {
  projectData: ProjectData;
  onAddConfigurationItem: (item: ConfigurationItem) => void;
  onUpdateConfigurationItem: (item: ConfigurationItem) => void;
  onDeleteConfigurationItem: (id: string) => void;
  onAssetUsed?: (assetId: string, generatedItemType: 'ci', generatedItemId: string) => void;
}

const TYPE_STYLES: { [key: string]: string } = {
  'Software Component': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'Document': 'bg-green-900/50 text-green-300 border-green-700',
  'Tool': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'Hardware': 'bg-amber-900/50 text-amber-300 border-amber-700',
  'Architectural Product': 'bg-sky-900/50 text-sky-300 border-sky-700',
};

const STATUS_STYLES: { [key: string]: string } = {
  'Baseline': 'bg-green-900/50 text-green-300 border-green-700',
  'In Development': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  'Deprecated': 'bg-red-900/50 text-red-300 border-red-700',
};

const ConfigurationItemModal = ({
  isOpen,
  onClose,
  onSave,
  configurationItems,
  currentItem,
  projectData,
  prefilledData,
  onAssetUsed
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ConfigurationItem) => void;
  configurationItems: ConfigurationItem[];
  currentItem: ConfigurationItem | null;
  projectData: ProjectData;
  prefilledData?: { name?: string; designPatterns?: string; keyInterfaces?: string } | null;
  onAssetUsed?: (assetId: string, generatedItemType: 'ci', generatedItemId: string) => void;
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ConfigurationItem['type']>('Software Component');
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<ConfigurationItem['status']>('In Development');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [designPatterns, setDesignPatterns] = useState('');
  const [keyInterfaces, setKeyInterfaces] = useState('');
  const [error, setError] = useState('');

  // Asset suggestion state
  const [suggestedAsset, setSuggestedAsset] = useState<ProcessAsset | null>(null);
  const [isCheckingAssets, setIsCheckingAssets] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = currentItem !== null;

  useEffect(() => {
    if (isOpen) {
      setId(currentItem?.id || '');
      setName(currentItem?.name || prefilledData?.name || '');
      setType(currentItem?.type || 'Software Component');
      setVersion(currentItem?.version || '');
      setStatus(currentItem?.status || 'In Development');
      setDependencies(currentItem?.dependencies || []);
      setDesignPatterns(currentItem?.designPatterns || prefilledData?.designPatterns || '');
      setKeyInterfaces(currentItem?.keyInterfaces || prefilledData?.keyInterfaces || '');
      setError('');
      setSuggestedAsset(null);
      setIsCheckingAssets(false);
    }
  }, [isOpen, currentItem, prefilledData]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced asset suggestion effect
  useEffect(() => {
    if (!name.trim() || name.length < 5 || isEditing || prefilledData) {
      setSuggestedAsset(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingAssets(true);
      try {
        // Import the function dynamically to avoid auto-formatter issues
        const { suggestRelevantAsset } = await import('../services/geminiService');
        const suggestion = await suggestRelevantAsset(name, projectData.processAssets || [], 'Solution Blueprint');
        setSuggestedAsset(suggestion);
      } catch (error) {
        console.error('Error getting asset suggestion:', error);
        setSuggestedAsset(null);
      } finally {
        setIsCheckingAssets(false);
      }
    }, 1500); // 1.5 second delay

    return () => clearTimeout(timeoutId);
  }, [name, isEditing, prefilledData, projectData.processAssets]);

  const handleApplySuggestedAsset = () => {
    if (suggestedAsset) {
      // Parse the asset content and apply to relevant fields
      const content = suggestedAsset.content;
      setName(suggestedAsset.name);
      setDesignPatterns(content);
      // Track asset usage - we'll pass this to the parent when saving
      setSuggestedAsset({ ...suggestedAsset, _wasUsed: true } as any);
    }
  };

  const handleDismissSuggestion = () => {
    setSuggestedAsset(null);
  };

  const handleToggleDependency = (depId: string) => {
    setDependencies(prev => 
        prev.includes(depId)
            ? prev.filter(id => id !== depId)
            : [...prev, depId]
    );
  };

  const handleSaveClick = () => {
    if (!id.trim() || !name.trim() || !version.trim()) {
        setError('ID, Name, and Version cannot be empty.');
        return;
    }
    if (!isEditing && configurationItems.some(ci => ci.id.toLowerCase() === id.trim().toLowerCase())) {
        setError(`ID "${id}" already exists. Please choose a unique ID.`);
        return;
    }
    setError('');

    const itemToSave: ConfigurationItem = { 
      id: id.trim(), 
      name, 
      type, 
      version, 
      status,
      createdAt: currentItem?.createdAt || '',
      updatedAt: currentItem?.updatedAt || '',
      createdBy: currentItem?.createdBy || 'User',
      updatedBy: 'User',
    };

    if (type === 'Architectural Product') {
        itemToSave.dependencies = dependencies;
        itemToSave.designPatterns = designPatterns;
        itemToSave.keyInterfaces = keyInterfaces;
    }

    onSave(itemToSave);

    // Track asset usage if an asset was applied
    if (suggestedAsset && (suggestedAsset as any)._wasUsed && onAssetUsed) {
      onAssetUsed(suggestedAsset.id, 'ci', itemToSave.id);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary">{isEditing ? 'Edit Configuration Item' : 'Add New CI'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>
        <main className="p-6 space-y-4 overflow-y-auto">
            <div>
                <label htmlFor="ci-id" className="block text-sm font-medium text-gray-300 mb-1">CI ID</label>
                <input 
                    type="text" id="ci-id" value={id} onChange={e => setId(e.target.value)} placeholder="e.g., CI-005" 
                    className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary ${isEditing ? 'cursor-not-allowed text-gray-400' : ''}`} 
                    readOnly={isEditing}
                />
                 {isEditing && <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation.</p>}
            </div>
            <div>
              <label htmlFor="ci-name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" id="ci-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., User Authentication Service" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />

              {/* AI Asset Suggestion */}
              {isCheckingAssets && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-400">
                  <Loader size={14} className="animate-spin" />
                  <span>Checking for relevant Solution Blueprints...</span>
                </div>
              )}

              {suggestedAsset && !isCheckingAssets && (
                <div className="mt-2 bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Library size={14} className="text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Suggested Solution Blueprint</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        <strong>{suggestedAsset.name}</strong>: {suggestedAsset.description}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleApplySuggestedAsset}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Apply Blueprint
                        </button>
                        <button
                          type="button"
                          onClick={handleDismissSuggestion}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ci-type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select id="ci-type" value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option>Software Component</option>
                <option>Document</option>
                <option>Tool</option>
                <option>Hardware</option>
                <option>Architectural Product</option>
              </select>
            </div>
            <div>
              <label htmlFor="ci-version" className="block text-sm font-medium text-gray-300 mb-1">Version</label>
              <input type="text" id="ci-version" value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g., 1.2.3" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
            </div>
          </div>
          <div>
              <label htmlFor="ci-status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="ci-status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option>In Development</option>
                <option>Baseline</option>
                <option>Deprecated</option>
              </select>
          </div>
          
          {type === 'Architectural Product' && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
              <h3 className="text-base font-semibold text-gray-200">Architectural Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dependencies (other CIs)</label>
                <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-36 overflow-y-auto">
                  {configurationItems.filter(ci => ci.id !== id).length > 0 ? (
                      configurationItems.filter(ci => ci.id !== id).map(ci => (
                          <div key={ci.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                              <input type="checkbox" id={`dep-link-${ci.id}`} checked={dependencies.includes(ci.id)} onChange={() => handleToggleDependency(ci.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                              <label htmlFor={`dep-link-${ci.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full">
                                  <span className="font-mono font-medium text-white">{ci.id}:</span> {ci.name}
                              </label>
                          </div>
                      ))
                  ) : <p className="p-4 text-center text-sm text-gray-500">No other CIs to link.</p>}
                </div>
              </div>
              <div>
                  <label htmlFor="ci-design-patterns" className="block text-sm font-medium text-gray-300 mb-1">Design Patterns</label>
                  <textarea id="ci-design-patterns" value={designPatterns} onChange={e => setDesignPatterns(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g., Singleton, Facade, Observer"></textarea>
              </div>
              <div>
                  <label htmlFor="ci-key-interfaces" className="block text-sm font-medium text-gray-300 mb-1">Key Interfaces / APIs</label>
                  <textarea id="ci-key-interfaces" value={keyInterfaces} onChange={e => setKeyInterfaces(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-cyan-300 placeholder-gray-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g., function save(data): boolean&#10;function load(id): object"></textarea>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 flex items-center gap-2 mt-2"><AlertTriangle size={16}/>{error}</p>}
        </main>
        <footer className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-2 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save CI
          </button>
        </footer>
      </div>
    </div>
  );
};

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ projectData, onAddConfigurationItem, onUpdateConfigurationItem, onDeleteConfigurationItem, onAssetUsed }) => {
    const { configurationItems } = projectData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<ConfigurationItem | null>(null);

    // Asset selection state
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [prefilledData, setPrefilledData] = useState<{ name?: string; designPatterns?: string; keyInterfaces?: string } | null>(null);

    const handleAdd = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (ci: ConfigurationItem) => {
        setCurrentItem(ci);
        setIsModalOpen(true);
    };

    const handleSave = useCallback((item: ConfigurationItem) => {
        if(currentItem) {
            onUpdateConfigurationItem(item);
        } else {
            onAddConfigurationItem(item);
        }
        setIsModalOpen(false);
    }, [currentItem, onUpdateConfigurationItem, onAddConfigurationItem]);

    const handleCreateFromAsset = () => {
        setIsAssetModalOpen(true);
    };

    const handleAssetSelected = (asset: ProcessAsset) => {
        // Pre-fill the modal with asset content
        setPrefilledData({
            name: asset.name,
            designPatterns: asset.content,
            keyInterfaces: asset.description
        });
        setCurrentItem(null);
        setIsAssetModalOpen(false);
        setIsModalOpen(true);

        // Track asset usage
        if (onAssetUsed) {
            // We'll track this when the CI is actually saved
        }
    };

    const getRepoUrl = (): string | null => {
         try {
            const settings = JSON.parse(window.localStorage.getItem('githubSettings') || '{}');
            return settings.repoUrl || null;
         } catch {
             return null;
         }
    };
    const repoUrl = getRepoUrl();

    const getLinkedIssues = (ciId: string): number[] => {
        const linked: number[] = [];
        if (!projectData.issueCiLinks) return linked;
        Object.keys(projectData.issueCiLinks).forEach(issueNumStr => {
            const issueNum = parseInt(issueNumStr, 10);
            if (projectData.issueCiLinks[issueNum]?.includes(ciId)) {
                linked.push(issueNum);
            }
        });
        return linked;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Configuration Management</h1>
                    <p className="text-gray-400 mt-1">Catalog and track all versioned Configuration Items (CIs).</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCreateFromAsset} className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        <Library size={20} />
                        <span>Create from Asset</span>
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                        <Plus size={20} />
                        <span>Add CI</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-24">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Version</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Linked Issues</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configurationItems.map((ci) => {
                                const linkedIssues = getLinkedIssues(ci.id);
                                return (
                                <tr key={ci.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{ci.id}</td>
                                    <td className="px-6 py-4 text-gray-300 font-medium">{ci.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_STYLES[ci.type] || ''}`}>
                                            {ci.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{ci.version}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[ci.status] || ''}`}>
                                            {ci.status}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4">
                                        {linkedIssues.length > 0 && repoUrl ? (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {linkedIssues.map(issueNum => (
                                                    <a 
                                                        key={issueNum}
                                                        href={`${repoUrl}/issues/${issueNum}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 font-mono text-xs bg-gray-700 text-gray-200 px-2 py-0.5 rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                                                    >
                                                    <Github size={12} /> #{issueNum}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">{linkedIssues.length > 0 ? `${linkedIssues.length} linked` : 'None'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleEdit(ci)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label={`Edit ${ci.id}`}><Edit size={16} /></button>
                                            <button onClick={() => onDeleteConfigurationItem(ci.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" aria-label={`Delete ${ci.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                             {configurationItems.length === 0 && (
                                <tr className="bg-gray-900 border-b border-gray-800">
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No Configuration Items found. Click "Add CI" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfigurationItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPrefilledData(null);
                }}
                onSave={handleSave}
                configurationItems={projectData.configurationItems}
                currentItem={currentItem}
                projectData={projectData}
                prefilledData={prefilledData}
                onAssetUsed={onAssetUsed}
            />

            <AssetSelectionModal
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                onSelectAsset={handleAssetSelected}
                assets={projectData.processAssets || []}
                assetType="Solution Blueprint"
                title="Select Solution Blueprint"
                description="Choose a Solution Blueprint to use as a template for your Configuration Item."
            />
        </div>
    );
};

export default ConfigurationPage;