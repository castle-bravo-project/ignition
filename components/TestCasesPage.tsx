
import { AlertTriangle, Bot, Edit, Library, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProcessAsset, ProjectData, TestCase } from '../types';
import AiSuggestionCard from './AiSuggestionCard';
import AssetSelectionModal from './AssetSelectionModal';

interface TestCasesPageProps {
  projectData: ProjectData;
  onAddTestCase: (testCase: TestCase, actor?: 'User' | 'AI') => void;
  onUpdateTestCase: (testCase: TestCase) => void;
  onDeleteTestCase: (id: string) => void;
  onAssetUsed?: (assetId: string, generatedItemType: 'test', generatedItemId: string) => void;
}

const STATUS_STYLES: { [key: string]: string } = {
  'Not Run': 'bg-gray-700/80 text-gray-300 border-gray-600',
  'Passed': 'bg-green-900/50 text-green-300 border-green-700',
  'Failed': 'bg-red-900/50 text-red-300 border-red-700',
};

const TestCaseModal = ({
  isOpen,
  onClose,
  onSave,
  testCases,
  currentTestCase,
  projectData,
  prefilledData,
  onAssetUsed
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testCase: TestCase) => void;
  testCases: TestCase[];
  currentTestCase: TestCase | null;
  projectData: ProjectData;
  prefilledData?: { description?: string; gherkin?: string } | null;
  onAssetUsed?: (assetId: string, generatedItemType: 'test', generatedItemId: string) => void;
}) => {
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Not Run' | 'Passed' | 'Failed'>('Not Run');
  const [gherkin, setGherkin] = useState('');
  const [error, setError] = useState('');

  // Asset suggestion state
  const [suggestedAsset, setSuggestedAsset] = useState<ProcessAsset | null>(null);
  const [isCheckingAssets, setIsCheckingAssets] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = currentTestCase !== null;

  useEffect(() => {
    if (isOpen) {
      setId(currentTestCase?.id || '');
      setDescription(currentTestCase?.description || prefilledData?.description || '');
      setStatus(currentTestCase?.status || 'Not Run');
      setGherkin(currentTestCase?.gherkin || prefilledData?.gherkin || '');
      setError('');
      setSuggestedAsset(null);
      setIsCheckingAssets(false);
    }
  }, [isOpen, currentTestCase, prefilledData]);
  
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
        const suggestion = await suggestRelevantAsset(description, projectData.processAssets || [], 'Test Strategy');
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

  const handleApplySuggestedAsset = () => {
    if (suggestedAsset) {
      // Parse the asset content and apply to relevant fields
      const content = suggestedAsset.content;
      setDescription(suggestedAsset.name);
      setGherkin(content);
      // Track asset usage - we'll pass this to the parent when saving
      setSuggestedAsset({ ...suggestedAsset, _wasUsed: true } as any);
    }
  };

  const handleDismissSuggestion = () => {
    setSuggestedAsset(null);
  };

  const handleSaveClick = () => {
    if (!id.trim()) {
        setError('ID cannot be empty.');
        return;
    }
    if (!description.trim()) {
      setError('Description cannot be empty.');
      return;
    }

    if (!isEditing && testCases.some(tc => tc.id.toLowerCase() === id.trim().toLowerCase())) {
        setError(`ID "${id}" already exists. Please choose a unique ID.`);
        return;
    }

    setError('');
    const testCaseToSave: TestCase = {
        id: id.trim(),
        description,
        status,
        gherkin: gherkin.trim(),
        createdAt: currentTestCase?.createdAt || '',
        updatedAt: currentTestCase?.updatedAt || '',
        createdBy: currentTestCase?.createdBy || 'User',
        updatedBy: 'User',
    };
    onSave(testCaseToSave);

    // Track asset usage if an asset was applied
    if (suggestedAsset && (suggestedAsset as any)._wasUsed && onAssetUsed) {
      onAssetUsed(suggestedAsset.id, 'test', testCaseToSave.id);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-brand-primary">{isEditing ? 'Edit Test Case' : 'Add New Test Case'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>
        <main className="p-6 space-y-4">
            <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-300 mb-1">Test Case ID</label>
                <input 
                    type="text" 
                    id="id" 
                    value={id} 
                    onChange={e => setId(e.target.value)} 
                    placeholder="e.g., TC-006" 
                    className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary ${isEditing ? 'cursor-not-allowed text-gray-400' : ''}`} 
                    readOnly={isEditing}
                />
                 {isEditing && <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation to preserve traceability links.</p>}
            </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"></textarea>

            {/* Enhanced AI Suggestion */}
            <AiSuggestionCard
              isLoading={isCheckingAssets}
              suggestedAsset={suggestedAsset}
              onApply={handleApplySuggestedAsset}
              onDismiss={handleDismissSuggestion}
              context="test"
            />


          </div>
           <div>
            <label htmlFor="gherkin" className="block text-sm font-medium text-gray-300 mb-1">Gherkin Script (Optional)</label>
            <textarea id="gherkin" value={gherkin} onChange={e => setGherkin(e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-cyan-300 placeholder-gray-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="Feature: ...&#10;  Scenario: ...&#10;    Given ...&#10;    When ...&#10;    Then ..."></textarea>
          </div>
          <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option>Not Run</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>
          </div>
          {error && <p className="text-sm text-red-400 flex items-center gap-2"><AlertTriangle size={16}/>{error}</p>}
        </main>
        <footer className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save Test Case
          </button>
        </footer>
      </div>
    </div>
  );
};

const TestCasesPage: React.FC<TestCasesPageProps> = ({ projectData, onAddTestCase, onUpdateTestCase, onDeleteTestCase, onAssetUsed }) => {
    const { testCases } = projectData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTestCase, setCurrentTestCase] = useState<TestCase | null>(null);

    // Asset selection state
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [prefilledData, setPrefilledData] = useState<{ description?: string; gherkin?: string } | null>(null);

    const handleAdd = () => {
        setCurrentTestCase(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tc: TestCase) => {
        setCurrentTestCase(tc);
        setIsModalOpen(true);
    };

    const handleSave = useCallback((testCase: TestCase) => {
        if(currentTestCase) {
            onUpdateTestCase(testCase);
        } else {
            onAddTestCase(testCase, 'User');
        }
        setIsModalOpen(false);
    }, [currentTestCase, onUpdateTestCase, onAddTestCase]);

    const handleCreateFromAsset = () => {
        setIsAssetModalOpen(true);
    };

    const handleAssetSelected = (asset: ProcessAsset) => {
        // Pre-fill the modal with asset content
        setPrefilledData({
            description: asset.name,
            gherkin: asset.content
        });
        setCurrentTestCase(null);
        setIsAssetModalOpen(false);
        setIsModalOpen(true);

        // Track asset usage
        if (onAssetUsed) {
            // We'll track this when the test case is actually saved
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Test Case Management</h1>
                    <p className="text-gray-400 mt-1">Create, track, and manage all project test cases.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCreateFromAsset} className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        <Library size={20} />
                        <span>Create from Asset</span>
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                        <Plus size={20} />
                        <span>Add Test Case</span>
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
                                <th scope="col" className="px-6 py-3 w-28 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testCases.map((tc) => (
                                <tr key={tc.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{tc.id}</td>
                                    <td className="px-6 py-4 text-gray-300">{tc.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[tc.status]}`}>
                                            {tc.status}
                                            {tc.updatedBy === 'Automation' && <span title={`Automated run on ${new Date(tc.updatedAt).toLocaleString()}`}><Bot size={12} /></span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleEdit(tc)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label={`Edit ${tc.id}`}><Edit size={16} /></button>
                                            <button onClick={() => onDeleteTestCase(tc.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" aria-label={`Delete ${tc.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {testCases.length === 0 && (
                                <tr className="bg-gray-900 border-b border-gray-800">
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No test cases found. Click "Add Test Case" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <TestCaseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPrefilledData(null);
                }}
                onSave={handleSave}
                testCases={projectData.testCases}
                currentTestCase={currentTestCase}
                projectData={projectData}
                prefilledData={prefilledData}
                onAssetUsed={onAssetUsed}
            />

            <AssetSelectionModal
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                onSelectAsset={handleAssetSelected}
                assets={projectData.processAssets || []}
                assetType="Test Strategy"
                title="Select Test Strategy"
                description="Choose a Test Strategy to use as a template for your Test Case."
            />
        </div>
    );
};

export default TestCasesPage;
