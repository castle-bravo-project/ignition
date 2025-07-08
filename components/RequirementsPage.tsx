import { AlertTriangle, Edit, Github, Library, Loader, Package, Plus, RefreshCw, Save, Sparkles, TestTube2, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { suggestRequirementDetails, suggestTestCasesForRequirement } from '../services/geminiService';
import { GitHubIssue, ProcessAsset, ProjectData, Requirement, TestCase } from '../types';
import AiSuggestionCard from './AiSuggestionCard';
import AssetSelectionModal from './AssetSelectionModal';

interface RequirementsPageProps {
  projectData: ProjectData;
  onAddRequirement: (requirement: Requirement) => void;
  onUpdateRequirement: (requirement: Requirement, linkedTestIds: string[], linkedCiIds: string[], linkedIssueIds: number[]) => void;
  onDeleteRequirement: (id: string) => void;
  onAddTestCase: (testCase: TestCase, actor: 'User' | 'AI') => void;
  githubIssues: GitHubIssue[];
  isFetchingIssues: boolean;
  onFetchIssues: () => void;
  githubSettingsConfigured: boolean;
  onAssetUsed?: (assetId: string, generatedItemType: 'requirement', generatedItemId: string) => void;
}

const PRIORITY_STYLES: { [key: string]: string } = {
  High: 'bg-red-900/50 text-red-300 border-red-700',
  Medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  Low: 'bg-sky-900/50 text-sky-300 border-sky-700',
};

const STATUS_STYLES: { [key: string]: string } = {
  Proposed: 'bg-gray-700/80 text-gray-300 border-gray-600',
  Active: 'bg-blue-900/50 text-blue-300 border-blue-700',
  Implemented: 'bg-purple-900/50 text-purple-300 border-purple-700',
  Verified: 'bg-green-900/50 text-green-300 border-green-700',
};

// Helper function to create a concise summary of the project for AI context
const getProjectContextSummary = (data: ProjectData): string => {
    const docSummaries = Object.values(data.documents).map(doc => {
        const topLevelSections = doc.content?.map(s => s.title).join(', ') || 'No sections';
        return `- ${doc.title}: Contains sections like ${topLevelSections}.`;
    }).join('\n');
    return `DOCUMENTATION OVERVIEW:\n${docSummaries}`;
};


const RequirementModal = ({
  isOpen,
  onClose,
  onSave,
  projectData,
  currentRequirement,
  onAddTestCase,
  githubIssues,
  isFetchingIssues,
  onFetchIssues,
  githubSettingsConfigured,
  prefilledData
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requirement: Requirement, linkedTestIds: string[], linkedCiIds: string[], linkedIssueIds: number[]) => void;
  projectData: ProjectData;
  currentRequirement: Requirement | null;
  onAddTestCase: (testCase: TestCase, actor: 'User' | 'AI') => void;
  githubIssues: GitHubIssue[];
  isFetchingIssues: boolean;
  onFetchIssues: () => void;
  githubSettingsConfigured: boolean;
  prefilledData?: { description?: string } | null;
  onAssetUsed?: (assetId: string, generatedItemType: 'requirement', generatedItemId: string) => void;
}) => {
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<'Proposed' | 'Active' | 'Implemented' | 'Verified'>('Proposed');
  const [linkedTestIds, setLinkedTestIds] = useState<string[]>([]);
  const [linkedCiIds, setLinkedCiIds] = useState<string[]>([]);
  const [linkedIssueIds, setLinkedIssueIds] = useState<number[]>([]);
  
  const [suggestedCases, setSuggestedCases] = useState<TestCase[]>([]);
  const [isSuggestingReq, setIsSuggestingReq] = useState(false);
  const [isSuggestingTests, setIsSuggestingTests] = useState(false);
  const [suggestedAsset, setSuggestedAsset] = useState<ProcessAsset | null>(null);
  const [isCheckingAssets, setIsCheckingAssets] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = currentRequirement !== null;

  useEffect(() => {
    if (isOpen) {
      const req = currentRequirement;
      setId(req?.id || '');
      setDescription(req?.description || prefilledData?.description || '');
      setPriority(req?.priority || 'Medium');
      setStatus(req?.status || 'Proposed');
      setLinkedTestIds(req ? projectData.links[req.id]?.tests || [] : []);
      setLinkedCiIds(req ? projectData.links[req.id]?.cis || [] : []);
      setLinkedIssueIds(req ? projectData.links[req.id]?.issues || [] : []);
      setError('');
      setIsSuggestingReq(false);
      setIsSuggestingTests(false);
      setSuggestedCases([]);
    }
  }, [isOpen, currentRequirement, projectData.links, prefilledData]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if(isOpen && githubSettingsConfigured && githubIssues.length === 0){
        onFetchIssues();
    }
  }, [isOpen, githubSettingsConfigured, githubIssues.length]);

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
        const suggestion = await suggestRelevantAsset(description, projectData.processAssets || [], 'Requirement Archetype');
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

  const handleAiSuggestReq = async () => {
    setIsSuggestingReq(true);
    setError('');
    try {
        const { documents, requirements } = projectData;
        const suggestions = await suggestRequirementDetails(documents, requirements);
        if(!isEditing) setId(suggestions.suggestedId);
        setDescription(suggestions.suggestedDescription);
    } catch (e: any) {
        setError(e.message || 'An unexpected error occurred getting AI suggestion.');
    } finally {
        setIsSuggestingReq(false);
    }
  };

  const handleAiSuggestTests = async () => {
    if (!description.trim() || !id.trim()) {
        setError("Please provide a Requirement ID and Description before suggesting tests.");
        return;
    }
    setIsSuggestingTests(true);
    setError('');
    try {
        const tempRequirement: Requirement = { id, description, priority, status, createdAt: '', updatedAt: '', createdBy: 'User', updatedBy: 'User' };
        const context = getProjectContextSummary(projectData);
        const suggestions = await suggestTestCasesForRequirement(tempRequirement, projectData.testCases, context);
        // Filter out any suggestions that might already exist by ID
        const newSuggestions = suggestions.filter(s => !projectData.testCases.some(tc => tc.id === s.id));
        setSuggestedCases(newSuggestions);

    } catch(e: any) {
        setError(e.message || 'An unexpected error occurred getting test case suggestions.');
    } finally {
        setIsSuggestingTests(false);
    }
  };

  const handleAddSuggestedCase = (testCase: TestCase) => {
    onAddTestCase(testCase, 'AI');
    setLinkedTestIds(prev => [...prev, testCase.id]);
    setSuggestedCases(prev => prev.filter(s => s.id !== testCase.id));
  };
  
  const handleToggleTestCaseLink = (testId: string) => {
    setLinkedTestIds(prev => 
        prev.includes(testId)
            ? prev.filter(id => id !== testId)
            : [...prev, testId]
    );
  };
  
  const handleToggleCiLink = (ciId: string) => {
    setLinkedCiIds(prev =>
        prev.includes(ciId)
            ? prev.filter(id => id !== ciId)
            : [...prev, ciId]
    );
  };

  const handleToggleIssueLink = (issueNumber: number) => {
    setLinkedIssueIds(prev =>
        prev.includes(issueNumber)
            ? prev.filter(num => num !== issueNumber)
            : [...prev, issueNumber]
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
    if (!id.trim()) { setError('ID cannot be empty.'); return; }
    if (!description.trim()) { setError('Description cannot be empty.'); return; }

    if (!isEditing && projectData.requirements.some(r => r.id.toLowerCase() === id.trim().toLowerCase())) {
        setError(`ID "${id}" already exists. Please choose a unique ID.`);
        return;
    }

    setError('');
    const requirementToSave: Requirement = {
      id: id.trim(),
      description,
      priority,
      status,
      createdAt: currentRequirement?.createdAt || '',
      updatedAt: currentRequirement?.updatedAt || '',
      createdBy: currentRequirement?.createdBy || 'User',
      updatedBy: 'User'
    };
    onSave(requirementToSave, linkedTestIds, linkedCiIds, linkedIssueIds);

    // Track asset usage if an asset was applied
    if (suggestedAsset && (suggestedAsset as any)._wasUsed && onAssetUsed) {
      onAssetUsed(suggestedAsset.id, 'requirement', requirementToSave.id);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary">{isEditing ? 'Edit Requirement' : 'Add New Requirement'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 overflow-y-auto">
            <div className="space-y-4">
                {isEditing ? (
                     <div>
                        <label htmlFor="id-edit" className="block text-sm font-medium text-gray-300 mb-1">Requirement ID</label>
                        <input type="text" id="id-edit" value={id} readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed" />
                        <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation.</p>
                    </div>
                ) : (
                    <div>
                        <label htmlFor="id-add" className="block text-sm font-medium text-gray-300 mb-1">Requirement ID</label>
                        <input type="text" id="id-add" value={id} onChange={e => setId(e.target.value)} placeholder="e.g., REQ-007" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                )}
                
              <div>
                <div className="flex justify-between items-end mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                     <button 
                        type="button" onClick={handleAiSuggestReq} disabled={isSuggestingReq}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-brand-primary bg-brand-primary/10 rounded-md border border-brand-primary/30 hover:bg-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSuggestingReq ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        <span>{isEditing ? 'Improve' : 'Suggest'}</span>
                    </button>
                </div>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"></textarea>

                {/* Enhanced AI Suggestion */}
                <AiSuggestionCard
                  isLoading={isCheckingAssets}
                  suggestedAsset={suggestedAsset}
                  onApply={handleApplySuggestedAsset}
                  onDismiss={handleDismissSuggestion}
                  context="requirement"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                  <select id="priority" value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <option>Proposed</option>
                    <option>Active</option>
                    <option>Implemented</option>
                    <option>Verified</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t md:border-t-0 md:border-l border-gray-800 md:pl-8">
                <h3 className="text-base font-semibold text-gray-200">Traceability Links</h3>
                
                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2"><TestTube2 size={16}/> Link Test Cases</label>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-24 overflow-y-auto">
                        {projectData.testCases.length > 0 ? projectData.testCases.map(tc => (
                          <div key={tc.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                            <input type="checkbox" id={`tc-link-${tc.id}`} checked={linkedTestIds.includes(tc.id)} onChange={() => handleToggleTestCaseLink(tc.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                            <label htmlFor={`tc-link-${tc.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full truncate" title={tc.description}>
                                <span className="font-mono font-medium text-white">{tc.id}:</span> {tc.description}
                            </label>
                          </div>
                        )) : <p className="p-4 text-center text-sm text-gray-500">No test cases exist.</p>}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2"><Package size={16}/> Link Configuration Items</label>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-24 overflow-y-auto">
                        {projectData.configurationItems.length > 0 ? projectData.configurationItems.map(ci => (
                          <div key={ci.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                            <input type="checkbox" id={`ci-link-${ci.id}`} checked={linkedCiIds.includes(ci.id)} onChange={() => handleToggleCiLink(ci.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                            <label htmlFor={`ci-link-${ci.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full truncate" title={ci.name}>
                                <span className="font-mono font-medium text-white">{ci.id}:</span> {ci.name}
                            </label>
                          </div>
                        )) : <p className="p-4 text-center text-sm text-gray-500">No CIs exist.</p>}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2"><Github size={16}/> Link GitHub Issues</label>
                        <button onClick={onFetchIssues} disabled={isFetchingIssues} className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait transition-colors p-1" aria-label="Refresh GitHub Issues">
                            <RefreshCw size={14} className={isFetchingIssues ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-24 overflow-y-auto">
                        {isFetchingIssues ? <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2"><Loader size={16} className="animate-spin" /> Fetching issues...</div> :
                         !githubSettingsConfigured ? <p className="p-4 text-center text-sm text-gray-500">Configure GitHub settings to link issues.</p> :
                         githubIssues.length > 0 ? githubIssues.map(issue => (
                          <div key={issue.number} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                            <input type="checkbox" id={`issue-link-${issue.number}`} checked={linkedIssueIds.includes(issue.number)} onChange={() => handleToggleIssueLink(issue.number)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                            <label htmlFor={`issue-link-${issue.number}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full truncate" title={issue.title}>
                                <span className="font-mono font-medium text-white">#{issue.number}:</span> {issue.title}
                            </label>
                          </div>
                        )) : <p className="p-4 text-center text-sm text-gray-500">No open issues found in repo.</p>}
                    </div>
                 </div>

                 <div>
                    <button type="button" onClick={handleAiSuggestTests} disabled={isSuggestingTests} className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 border border-brand-primary/50 text-brand-primary font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSuggestingTests ? <Loader size={20} className="animate-spin" /> : <TestTube2 size={20} />}
                        <span>AI Suggest Test Cases</span>
                    </button>
                 </div>
                
                 {suggestedCases.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-300">AI Suggestions:</h4>
                        {suggestedCases.map(suggestion => (
                            <div key={suggestion.id} className="bg-gray-800/50 border border-gray-700 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-white"><span className="font-mono">{suggestion.id}:</span> {suggestion.description}</p>
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">Show Gherkin Script</summary>
                                            <pre className="mt-1 text-xs bg-gray-950 p-2 rounded-md whitespace-pre-wrap font-mono text-cyan-300">{suggestion.gherkin}</pre>
                                        </details>
                                    </div>
                                    <button onClick={() => handleAddSuggestedCase(suggestion)} className="flex-shrink-0 ml-4 text-xs bg-green-600/80 text-white font-bold px-3 py-1 rounded-md hover:bg-green-500/80 transition-colors">Add</button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
            


          {error && <p className="md:col-span-2 text-sm text-red-400 flex items-center gap-2 mt-2"><AlertTriangle size={16}/>{error}</p>}
        </main>
        <footer className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save Requirement
          </button>
        </footer>
      </div>
    </div>
  );
};

const RequirementsPage: React.FC<RequirementsPageProps> = ({ projectData, onAddRequirement, onUpdateRequirement, onDeleteRequirement, onAddTestCase, githubIssues, isFetchingIssues, onFetchIssues, githubSettingsConfigured, onAssetUsed }) => {
    const { requirements, processAssets = [] } = projectData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRequirement, setCurrentRequirement] = useState<Requirement | null>(null);
    const [isAssetSelectionOpen, setIsAssetSelectionOpen] = useState(false);
    const [prefilledData, setPrefilledData] = useState<{ description?: string } | null>(null);

    const handleAdd = () => {
        setCurrentRequirement(null);
        setPrefilledData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (req: Requirement) => {
        setCurrentRequirement(req);
        setPrefilledData(null);
        setIsModalOpen(true);
    };

    const handleCreateFromAsset = () => {
        setIsAssetSelectionOpen(true);
    };

    const handleAssetSelected = (asset: ProcessAsset) => {
        setPrefilledData({ description: asset.content });
        setCurrentRequirement(null);
        setIsModalOpen(true);
    };

    const handleSave = useCallback((requirement: Requirement, linkedTestIds: string[], linkedCiIds: string[], linkedIssueIds: number[]) => {
        if(currentRequirement) {
            onUpdateRequirement(requirement, linkedTestIds, linkedCiIds, linkedIssueIds);
        } else {
            onAddRequirement(requirement);
            // After adding, we need to update links for the new requirement
            onUpdateRequirement(requirement, [], [], []);
        }
        setIsModalOpen(false);
    }, [currentRequirement, onUpdateRequirement, onAddRequirement]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Requirements Management</h1>
                    <p className="text-gray-400 mt-1">Create, track, and manage all project requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateFromAsset}
                        className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={processAssets.filter(a => a.type === 'Requirement Archetype').length === 0}
                    >
                        <Library size={20} />
                        <span>Create from Asset</span>
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                        <Plus size={20} />
                        <span>Add Requirement</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-24">ID</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 w-32">Status</th>
                                <th scope="col" className="px-6 py-3 w-32">Priority</th>
                                <th scope="col" className="px-6 py-3 w-28 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.map((req) => (
                                <tr key={req.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{req.id}</td>
                                    <td className="px-6 py-4 text-gray-300">{req.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_STYLES[req.priority]}`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleEdit(req)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label={`Edit ${req.id}`}><Edit size={16} /></button>
                                            <button onClick={() => onDeleteRequirement(req.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" aria-label={`Delete ${req.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {requirements.length === 0 && (
                                <tr className="bg-gray-900 border-b border-gray-800">
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No requirements found. Click "Add Requirement" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <RequirementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                projectData={projectData}
                currentRequirement={currentRequirement}
                onAddTestCase={onAddTestCase}
                githubIssues={githubIssues}
                isFetchingIssues={isFetchingIssues}
                onFetchIssues={onFetchIssues}
                githubSettingsConfigured={githubSettingsConfigured}
                prefilledData={prefilledData}
                onAssetUsed={onAssetUsed}
            />
            <AssetSelectionModal
                isOpen={isAssetSelectionOpen}
                onClose={() => setIsAssetSelectionOpen(false)}
                onSelect={handleAssetSelected}
                assets={processAssets}
                assetType="Requirement Archetype"
                title="Select Requirement Archetype"
            />
        </div>
    );
};

export default RequirementsPage;