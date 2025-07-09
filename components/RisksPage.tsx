import { AlertTriangle, CheckSquare, Edit, Github, Library, Package, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProcessAsset, ProjectData, Risk } from '../types';
import AssetSelectionModal from './AssetSelectionModal';
import RiskHeatMap from './RiskHeatMap';
import RiskListModal from './RiskListModal';

interface RisksPageProps {
  projectData: ProjectData;
  onAddRisk: (risk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => void;
  onUpdateRisk: (risk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => void;
  onDeleteRisk: (id: string) => void;
  onAssetUsed?: (assetId: string, generatedItemType: 'risk', generatedItemId: string) => void;
}

const PROBABILITY_IMPACT_STYLES: { [key: string]: string } = {
  High: 'bg-red-900/50 text-red-300 border-red-700',
  Medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  Low: 'bg-green-900/50 text-green-300 border-green-700',
};

const STATUS_STYLES: { [key:string]: string } = {
    Open: 'bg-blue-900/50 text-blue-300 border-blue-700',
    Mitigated: 'bg-green-900/50 text-green-300 border-green-700',
    Closed: 'bg-gray-700/80 text-gray-300 border-gray-600',
};

const RiskModal = ({
  isOpen,
  onClose,
  onSave,
  projectData,
  currentRisk,
  prefilledData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (risk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => void;
  projectData: ProjectData;
  currentRisk: Risk | null;
  prefilledData?: { description?: string } | null;
  onAssetUsed?: (assetId: string, generatedItemType: 'risk', generatedItemId: string) => void;
}) => {
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [probability, setProbability] = useState<Risk['probability']>('Medium');
  const [impact, setImpact] = useState<Risk['impact']>('Medium');
  const [status, setStatus] = useState<Risk['status']>('Open');
  const [linkedReqIds, setLinkedReqIds] = useState<string[]>([]);
  const [linkedCiIds, setLinkedCiIds] = useState<string[]>([]);
  const [suggestedAsset, setSuggestedAsset] = useState<ProcessAsset | null>(null);
  const [isCheckingAssets, setIsCheckingAssets] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = currentRisk !== null;

  useEffect(() => {
    if (isOpen) {
      const risk = currentRisk;
      setId(risk?.id || '');
      setDescription(risk?.description || prefilledData?.description || '');
      setProbability(risk?.probability || 'Medium');
      setImpact(risk?.impact || 'Medium');
      setStatus(risk?.status || 'Open');
      setError('');

      if (risk) {
        const linkedReqs = Object.keys(projectData.links).filter(reqId =>
            projectData.links[reqId]?.risks?.includes(risk.id)
        );
        setLinkedReqIds(linkedReqs);
        setLinkedCiIds(projectData.riskCiLinks?.[risk.id] || []);
      } else {
        setLinkedReqIds([]);
        setLinkedCiIds([]);
      }
    }
  }, [isOpen, currentRisk, projectData.links, projectData.riskCiLinks, prefilledData]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced asset suggestion effect
  useEffect(() => {
    if (!description.trim() || description.length < 10 || isEditing || prefilledData) {
      setSuggestedAsset(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingAssets(true);
      try {
        // Import the function dynamically to avoid auto-formatter issues
        const { suggestRelevantAsset } = await import('../services/geminiService');
        const suggestion = await suggestRelevantAsset(description, projectData.processAssets || [], 'Risk Playbook');
        setSuggestedAsset(suggestion);
      } catch (error) {
        console.error('Error getting asset suggestion:', error);
        setSuggestedAsset(null);
      } finally {
        setIsCheckingAssets(false);
      }
    }, 1500); // 1.5 second delay

    return () => clearTimeout(timeoutId);
  }, [description, isEditing, prefilledData, projectData.processAssets]);

  const handleToggleReqLink = (reqId: string) => {
    setLinkedReqIds(prev => 
        prev.includes(reqId)
            ? prev.filter(id => id !== reqId)
            : [...prev, reqId]
    );
  };

  const handleToggleCiLink = (ciId: string) => {
    setLinkedCiIds(prev => 
        prev.includes(ciId)
            ? prev.filter(id => id !== ciId)
            : [...prev, ciId]
    );
  };

  const handleApplySuggestedAsset = () => {
    if (suggestedAsset) {
      setDescription(suggestedAsset.content);
      // Track asset usage - we'll pass this to the parent when saving
      setSuggestedAsset({ ...suggestedAsset, _wasUsed: true } as any);
    }
  };

  const handleDismissSuggestion = () => {
    setSuggestedAsset(null);
  };

  const handleSaveClick = () => {
    if (!id.trim() || !description.trim()) {
        setError('ID and Description cannot be empty.');
        return;
    }
    if (!isEditing && projectData.risks.some(r => r.id.toLowerCase() === id.trim().toLowerCase())) {
        setError(`ID "${id}" already exists. Please choose a unique ID.`);
        return;
    }
    setError('');
    const riskToSave: Risk = {
        id: id.trim(),
        description,
        probability,
        impact,
        status,
        createdAt: currentRisk?.createdAt || '',
        updatedAt: currentRisk?.updatedAt || '',
        createdBy: currentRisk?.createdBy || 'User',
        updatedBy: 'User'
    };
    onSave(riskToSave, linkedReqIds, linkedCiIds);

    // Track asset usage if an asset was applied
    if (suggestedAsset && (suggestedAsset as any)._wasUsed && onAssetUsed) {
      onAssetUsed(suggestedAsset.id, 'risk', riskToSave.id);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary">{isEditing ? 'Edit Risk' : 'Add New Risk'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <label htmlFor="risk-id" className="block text-sm font-medium text-gray-300 mb-1">Risk ID</label>
                    <input type="text" id="risk-id" value={id} onChange={e => setId(e.target.value)} placeholder="e.g., RISK-003" 
                        className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary ${isEditing ? 'cursor-not-allowed text-gray-400' : ''}`} 
                        readOnly={isEditing}
                    />
                    {isEditing && <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation.</p>}
                </div>
                
                <div>
                    <label htmlFor="risk-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea id="risk-description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"></textarea>

                    {/* Enhanced AI Suggestion */}
                    <AiSuggestionCard
                      isLoading={isCheckingAssets}
                      suggestedAsset={suggestedAsset}
                      onApply={handleApplySuggestedAsset}
                      onDismiss={handleDismissSuggestion}
                      context="risk"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="risk-probability" className="block text-sm font-medium text-gray-300 mb-1">Probability</label>
                        <select id="risk-probability" value={probability} onChange={e => setProbability(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="risk-impact" className="block text-sm font-medium text-gray-300 mb-1">Impact</label>
                        <select id="risk-impact" value={impact} onChange={e => setImpact(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                </div>

                 <div>
                    <label htmlFor="risk-status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select id="risk-status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        <option>Open</option>
                        <option>Mitigated</option>
                        <option>Closed</option>
                    </select>
                 </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t md:border-t-0 md:border-l border-gray-800 md:pl-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-2"><CheckSquare size={16}/> Link to Requirements</label>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                        {projectData.requirements.length > 0 ? projectData.requirements.map(req => (
                            <div key={req.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                            <input type="checkbox" id={`req-link-${req.id}`} checked={linkedReqIds.includes(req.id)} onChange={() => handleToggleReqLink(req.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                            <label htmlFor={`req-link-${req.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full">
                                <span className="font-mono font-medium text-white">{req.id}:</span> {req.description}
                            </label>
                            </div>
                        )) : <p className="p-4 text-center text-sm text-gray-500">No requirements exist yet.</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-2"><Package size={16}/> Link to Configuration Items</label>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                        {projectData.configurationItems.length > 0 ? projectData.configurationItems.map(ci => (
                            <div key={ci.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                            <input type="checkbox" id={`ci-link-${ci.id}`} checked={linkedCiIds.includes(ci.id)} onChange={() => handleToggleCiLink(ci.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                            <label htmlFor={`ci-link-${ci.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full">
                                <span className="font-mono font-medium text-white">{ci.id}:</span> {ci.name}
                            </label>
                            </div>
                        )) : <p className="p-4 text-center text-sm text-gray-500">No CIs exist yet.</p>}
                    </div>
                </div>
            </div>

          {error && <p className="md:col-span-2 text-sm text-red-400 flex items-center gap-2 mt-2"><AlertTriangle size={16}/>{error}</p>}
        </main>
        <footer className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-2 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save Risk
          </button>
        </footer>
      </div>
    </div>
  );
};


const RisksPage: React.FC<RisksPageProps> = ({ projectData, onAddRisk, onUpdateRisk, onDeleteRisk, onAssetUsed }) => {
    const { risks, processAssets = [] } = projectData;
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const [currentRisk, setCurrentRisk] = useState<Risk | null>(null);
    const [isHeatMapModalOpen, setIsHeatMapModalOpen] = useState(false);
    const [modalRisks, setModalRisks] = useState<Risk[]>([]);
    const [modalTitle, setModalTitle] = useState('');
    const [isAssetSelectionOpen, setIsAssetSelectionOpen] = useState(false);
    const [prefilledData, setPrefilledData] = useState<{ description?: string } | null>(null);


    const handleAdd = () => {
        setCurrentRisk(null);
        setPrefilledData(null);
        setIsRiskModalOpen(true);
    };

    const handleEdit = (risk: Risk) => {
        setCurrentRisk(risk);
        setPrefilledData(null);
        setIsRiskModalOpen(true);
    };

    const handleCreateFromAsset = () => {
        setIsAssetSelectionOpen(true);
    };

    const handleAssetSelected = (asset: ProcessAsset) => {
        setPrefilledData({ description: asset.content });
        setCurrentRisk(null);
        setIsRiskModalOpen(true);
    };

    const handleSave = useCallback((risk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => {
        if(currentRisk) {
            onUpdateRisk(risk, linkedReqIds, linkedCiIds);
        } else {
            onAddRisk(risk, linkedReqIds, linkedCiIds);
        }
        setIsRiskModalOpen(false);
    }, [currentRisk, onUpdateRisk, onAddRisk]);
    
    const handleCellClick = useCallback((risks: Risk[], title: string) => {
        setModalRisks(risks);
        setModalTitle(title);
        setIsHeatMapModalOpen(true);
    }, []);

    const getLinkedReqsCount = (riskId: string): number => {
        return Object.values(projectData.links).filter(link => link.risks?.includes(riskId)).length;
    }

    const getLinkedCisCount = (riskId: string): number => {
        return projectData.riskCiLinks?.[riskId]?.length || 0;
    }

    const getRepoUrl = (): string | null => {
        try {
           const settings = JSON.parse(window.localStorage.getItem('githubSettings') || '{}');
           return settings.repoUrl || null;
        } catch {
            return null;
        }
   };
   const repoUrl = getRepoUrl();

   const getLinkedIssues = (riskId: string): number[] => {
       const linked: number[] = [];
       if (!projectData.issueRiskLinks) return linked;
       Object.keys(projectData.issueRiskLinks).forEach(issueNumStr => {
           const issueNum = parseInt(issueNumStr, 10);
           if (projectData.issueRiskLinks[issueNum]?.includes(riskId)) {
               linked.push(issueNum);
           }
       });
       return linked;
   };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Risk Management</h1>
                    <p className="text-gray-400 mt-1">Identify, analyze, and mitigate project risks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateFromAsset}
                        className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={processAssets.filter(a => a.type === 'Risk Playbook').length === 0}
                    >
                        <Library size={20} />
                        <span>Create from Asset</span>
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                        <Plus size={20} />
                        <span>Add Risk</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Risk Heat Map</h2>
                <p className="text-sm text-gray-400 mb-6">An interactive visualization of project risks based on probability and impact. Click a cell to see the associated risks.</p>
                <div className="max-w-md mx-auto">
                    <RiskHeatMap risks={projectData.risks} onCellClick={handleCellClick} isInteractive={true} />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <h2 className="text-xl font-semibold text-white p-6 border-b border-gray-800">Risk Register</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-24">ID</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Probability</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Impact</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Linked Reqs</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Linked CIs</th>
                                <th scope="col" className="px-6 py-3 w-32 text-center">Linked Issues</th>
                                <th scope="col" className="px-6 py-3 w-28 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectData.risks.map((risk) => {
                                const linkedIssues = getLinkedIssues(risk.id);
                                return (
                                <tr key={risk.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{risk.id}</td>
                                    <td className="px-6 py-4 text-gray-300">{risk.description}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-20 px-2.5 py-0.5 rounded-full text-xs font-medium border ${PROBABILITY_IMPACT_STYLES[risk.probability]}`}>
                                            {risk.probability}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-20 px-2.5 py-0.5 rounded-full text-xs font-medium border ${PROBABILITY_IMPACT_STYLES[risk.impact]}`}>
                                            {risk.impact}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-20 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[risk.status]}`}>
                                            {risk.status}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 text-center font-semibold text-white">{getLinkedReqsCount(risk.id)}</td>
                                     <td className="px-6 py-4 text-center font-semibold text-white">{getLinkedCisCount(risk.id)}</td>
                                     <td className="px-6 py-4 text-center">
                                        {linkedIssues.length > 0 && repoUrl ? (
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
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
                                            <button onClick={() => handleEdit(risk)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label={`Edit ${risk.id}`}><Edit size={16} /></button>
                                            <button onClick={() => onDeleteRisk(risk.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" aria-label={`Delete ${risk.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                             {projectData.risks.length === 0 && (
                                <tr className="bg-gray-900 border-b border-gray-800">
                                    <td colSpan={9} className="text-center py-8 text-gray-500">
                                        No risks found. Click "Add Risk" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <RiskModal
                isOpen={isRiskModalOpen}
                onClose={() => setIsRiskModalOpen(false)}
                onSave={handleSave}
                projectData={projectData}
                currentRisk={currentRisk}
                prefilledData={prefilledData}
                onAssetUsed={onAssetUsed}
            />
            <RiskListModal
                isOpen={isHeatMapModalOpen}
                onClose={() => setIsHeatMapModalOpen(false)}
                risks={modalRisks}
                title={modalTitle}
            />
            <AssetSelectionModal
                isOpen={isAssetSelectionOpen}
                onClose={() => setIsAssetSelectionOpen(false)}
                onSelect={handleAssetSelected}
                assets={processAssets}
                assetType="Risk Playbook"
                title="Select Risk Playbook"
            />
        </div>
    );
};

export default RisksPage;