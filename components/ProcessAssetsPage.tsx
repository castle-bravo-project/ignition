import { AlertTriangle, BarChart3, Bot, CheckSquare, Edit, Library, Loader, Package, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { scanForProcessAssets } from '../services/geminiService';
import { ProcessAsset, ProjectData } from '../types';
import ProcessAssetReviewModal from './ProcessAssetReviewModal';

interface ProcessAssetsPageProps {
  projectData: ProjectData;
  onAddProcessAsset: (asset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => void;
  onUpdateProcessAsset: (asset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => void;
  onDeleteProcessAsset: (id: string) => void;
}

const ASSET_TYPE_STYLES: { [key: string]: string } = {
  'Requirement Archetype': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'Solution Blueprint': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'Risk Playbook': 'bg-red-900/50 text-red-300 border-red-700',
  'Test Strategy': 'bg-green-900/50 text-green-300 border-green-700',
};

const ProcessAssetModal = ({
  isOpen,
  onClose,
  onSave,
  processAssets,
  currentAsset,
  projectData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => void;
  processAssets: ProcessAsset[];
  currentAsset: ProcessAsset | null;
  projectData: ProjectData;
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ProcessAsset['type']>('Requirement Archetype');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [linkedReqIds, setLinkedReqIds] = useState<string[]>([]);
  const [linkedRiskIds, setLinkedRiskIds] = useState<string[]>([]);
  const [linkedCiIds, setLinkedCiIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = currentAsset !== null;

  useEffect(() => {
    if (isOpen) {
      setId(currentAsset?.id || `PA-${uuidv4().substring(0,8).toUpperCase()}`);
      setName(currentAsset?.name || '');
      setType(currentAsset?.type || 'Requirement Archetype');
      setDescription(currentAsset?.description || '');
      setContent(currentAsset?.content || '');
      setError('');

      // Load existing links if editing
      if (currentAsset && projectData.assetLinks?.[currentAsset.id]) {
        const links = projectData.assetLinks[currentAsset.id];
        setLinkedReqIds(links.requirements || []);
        setLinkedRiskIds(links.risks || []);
        setLinkedCiIds(links.cis || []);
      } else {
        setLinkedReqIds([]);
        setLinkedRiskIds([]);
        setLinkedCiIds([]);
      }
    }
  }, [isOpen, currentAsset, projectData.assetLinks]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggleReqLink = (reqId: string) => {
    setLinkedReqIds(prev =>
      prev.includes(reqId)
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const handleToggleRiskLink = (riskId: string) => {
    setLinkedRiskIds(prev =>
      prev.includes(riskId)
        ? prev.filter(id => id !== riskId)
        : [...prev, riskId]
    );
  };

  const handleToggleCiLink = (ciId: string) => {
    setLinkedCiIds(prev =>
      prev.includes(ciId)
        ? prev.filter(id => id !== ciId)
        : [...prev, ciId]
    );
  };

  const handleSaveClick = () => {
    if (!id.trim() || !name.trim() || !description.trim()) {
      setError('ID, Name, and Description cannot be empty.');
      return;
    }
    if (!isEditing && processAssets.some(a => a.id.toLowerCase() === id.trim().toLowerCase())) {
      setError(`ID "${id}" already exists. Please choose a unique ID.`);
      return;
    }
    setError('');

    const assetToSave: ProcessAsset = {
      id: id.trim(),
      name,
      type,
      description,
      content,
      createdAt: currentAsset?.createdAt || '',
      updatedAt: currentAsset?.updatedAt || '',
      createdBy: currentAsset?.createdBy || 'User',
      updatedBy: 'User',
    };

    onSave(assetToSave, linkedReqIds, linkedRiskIds, linkedCiIds);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary">{isEditing ? 'Edit Process Asset' : 'Add New Process Asset'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>
        <main className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label htmlFor="pa-id" className="block text-sm font-medium text-gray-300 mb-1">Asset ID</label>
              <input 
                  type="text" id="pa-id" value={id} onChange={e => setId(e.target.value)}
                  className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary ${isEditing ? 'cursor-not-allowed text-gray-400' : ''}`} 
                  readOnly={isEditing}
              />
              {isEditing && <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation.</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pa-name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input type="text" id="pa-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., OAuth 2.0 Login Flow" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div>
                <label htmlFor="pa-type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select id="pa-type" value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                  <option>Requirement Archetype</option>
                  <option>Solution Blueprint</option>
                  <option>Risk Playbook</option>
                  <option>Test Strategy</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="pa-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea id="pa-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="A short summary of what this asset represents."></textarea>
            </div>
            <div>
              <label htmlFor="pa-content" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
              <textarea id="pa-content" value={content} onChange={e => setContent(e.target.value)} rows={8} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-cyan-300 placeholder-gray-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="The detailed content of the asset. Can be markdown, a JSON schema, or plain text."></textarea>
            </div>

            {/* Linking Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Link to Project Artifacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Requirements Linking */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                    <CheckSquare size={16}/> Link to Requirements
                  </label>
                  <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-32 overflow-y-auto">
                    {projectData.requirements.length > 0 ? projectData.requirements.map(req => (
                      <div key={req.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                        <input
                          type="checkbox"
                          id={`req-link-${req.id}`}
                          checked={linkedReqIds.includes(req.id)}
                          onChange={() => handleToggleReqLink(req.id)}
                          className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor={`req-link-${req.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer flex-1 truncate">
                          {req.id}: {req.description}
                        </label>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm p-3">No requirements available</p>
                    )}
                  </div>
                </div>

                {/* Risks Linking */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                    <AlertTriangle size={16}/> Link to Risks
                  </label>
                  <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-32 overflow-y-auto">
                    {projectData.risks.length > 0 ? projectData.risks.map(risk => (
                      <div key={risk.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                        <input
                          type="checkbox"
                          id={`risk-link-${risk.id}`}
                          checked={linkedRiskIds.includes(risk.id)}
                          onChange={() => handleToggleRiskLink(risk.id)}
                          className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor={`risk-link-${risk.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer flex-1 truncate">
                          {risk.id}: {risk.description}
                        </label>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm p-3">No risks available</p>
                    )}
                  </div>
                </div>

                {/* Configuration Items Linking */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                    <Package size={16}/> Link to Configuration Items
                  </label>
                  <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-32 overflow-y-auto">
                    {projectData.configurationItems.length > 0 ? projectData.configurationItems.map(ci => (
                      <div key={ci.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                        <input
                          type="checkbox"
                          id={`ci-link-${ci.id}`}
                          checked={linkedCiIds.includes(ci.id)}
                          onChange={() => handleToggleCiLink(ci.id)}
                          className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                        />
                        <label htmlFor={`ci-link-${ci.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer flex-1 truncate">
                          {ci.id}: {ci.name}
                        </label>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm p-3">No configuration items available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {error && <p className="text-sm text-red-400 flex items-center gap-2"><AlertTriangle size={16}/>{error}</p>}
        </main>
        <footer className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save Asset
          </button>
        </footer>
      </div>
    </div>
  );
};

const ProcessAssetsPage: React.FC<ProcessAssetsPageProps> = ({ projectData, onAddProcessAsset, onUpdateProcessAsset, onDeleteProcessAsset }) => {
    const { processAssets = [] } = projectData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<ProcessAsset | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [suggestedAssets, setSuggestedAssets] = useState<ProcessAsset[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);


    const handleAdd = () => {
        setCurrentAsset(null);
        setIsModalOpen(true);
    };

    const handleEdit = (asset: ProcessAsset) => {
        setCurrentAsset(asset);
        setIsModalOpen(true);
    };

    const handleSave = useCallback((asset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => {
        if(currentAsset) {
            onUpdateProcessAsset(asset, linkedReqIds, linkedRiskIds, linkedCiIds);
        } else {
            onAddProcessAsset(asset, linkedReqIds, linkedRiskIds, linkedCiIds);
        }
        setIsModalOpen(false);
    }, [currentAsset, onUpdateProcessAsset, onAddProcessAsset]);

    const handleScanForAssets = async () => {
        setIsScanning(true);
        try {
            const suggestions = await scanForProcessAssets(projectData);
            setSuggestedAssets(suggestions);
            setIsReviewModalOpen(true);
        } catch (e: any) {
            console.error("Failed to scan for process assets:", e);
            alert(`Error scanning for assets: ${e.message}`);
        } finally {
            setIsScanning(false);
        }
    };

    const handleImportAssets = (assetsToImport: ProcessAsset[]) => {
        assetsToImport.forEach(asset => {
            onAddProcessAsset(asset);
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Library /> Process Asset Library</h1>
                    <p className="text-gray-400 mt-1">Create and manage reusable process patterns for your organization.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-colors ${
                            showAnalytics
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                    >
                        <BarChart3 size={20} />
                        <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
                    </button>
                    <button onClick={handleScanForAssets} disabled={isScanning} className="flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-wait">
                        {isScanning ? <Loader size={20} className="animate-spin" /> : <Bot size={20} />}
                        <span>{isScanning ? 'Scanning...' : 'AI Scan for Assets'}</span>
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                        <Plus size={20} />
                        <span>Add Asset</span>
                    </button>
                </div>
            </div>

            {/* Analytics View */}
            {showAnalytics && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-purple-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Asset Performance Analytics</h2>
                    </div>

                    {processAssets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {processAssets.map(asset => (
                                <AssetAnalyticsCard
                                    key={asset.id}
                                    asset={asset}
                                    projectData={projectData}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
                            <Activity size={48} className="mx-auto text-gray-500 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Assets to Analyze</h3>
                            <p className="text-gray-500 mb-4">Create some process assets to see performance analytics.</p>
                            <button
                                onClick={handleAdd}
                                className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                            >
                                Create Your First Asset
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-40">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3 w-48">Type</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Usage</th>
                                <th scope="col" className="px-6 py-3 w-28 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processAssets.map((asset) => (
                                <tr key={asset.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{asset.id}</td>
                                    <td className="px-6 py-4">
                                      <p className="text-gray-200 font-semibold">{asset.name}</p>
                                      <p className="text-gray-400 truncate">{asset.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ASSET_TYPE_STYLES[asset.type]}`}>
                                            {asset.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {(() => {
                                            const usage = projectData.assetUsage?.[asset.id];
                                            if (!usage || usage.usageCount === 0) {
                                                return <span className="text-gray-500 text-xs">Not used</span>;
                                            }
                                            return (
                                                <div className="text-center">
                                                    <div className="text-sm font-medium text-green-400">{usage.usageCount}x</div>
                                                    <div className="text-xs text-gray-500">
                                                        Last: {new Date(usage.lastUsed).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleEdit(asset)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label={`Edit ${asset.id}`}><Edit size={16} /></button>
                                            <button onClick={() => onDeleteProcessAsset(asset.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" aria-label={`Delete ${asset.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {processAssets.length === 0 && (
                                <tr className="bg-gray-900 border-b border-gray-800">
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No process assets found. Click "Add Asset" to build your knowledge base.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ProcessAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                processAssets={processAssets}
                currentAsset={currentAsset}
                projectData={projectData}
            />
            <ProcessAssetReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                suggestedAssets={suggestedAssets}
                onImport={handleImportAssets}
            />
        </div>
    );
};

export default ProcessAssetsPage;