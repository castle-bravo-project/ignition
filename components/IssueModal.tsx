import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectData, GitHubIssue } from '../types';
import { X, Save, CheckSquare, Package, ShieldAlert, AlertCircle } from 'lucide-react';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issueNumber: number, linkedReqIds: string[], linkedCiIds: string[], linkedRiskIds: string[]) => void;
  projectData: ProjectData;
  issue: GitHubIssue;
}

const CheckboxList = ({ title, items, selectedIds, onToggle, icon }: { title: string, items: {id: string, name: string}[], selectedIds: string[], onToggle: (id: string) => void, icon: React.ReactNode }) => {
    return (
        <div>
            <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2 mb-2">{icon} {title}</h3>
            <div className="w-full bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {items.length > 0 ? items.map(item => (
                    <div key={item.id} className="flex items-center px-3 py-2 border-b border-gray-700/50 last:border-b-0">
                        <input type="checkbox" id={`link-${item.id}`} checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary" />
                        <label htmlFor={`link-${item.id}`} className="ml-3 block text-sm text-gray-300 cursor-pointer w-full truncate" title={item.name}>
                            <span className="font-mono font-medium text-white">{item.id}:</span> {item.name}
                        </label>
                    </div>
                )) : <p className="p-4 text-center text-sm text-gray-500">No {title.toLowerCase()} exist.</p>}
            </div>
        </div>
    );
};

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, onSave, projectData, issue }) => {
  const [linkedReqIds, setLinkedReqIds] = useState<string[]>([]);
  const [linkedCiIds, setLinkedCiIds] = useState<string[]>([]);
  const [linkedRiskIds, setLinkedRiskIds] = useState<string[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Calculate initial linked items
      const reqs = Object.keys(projectData.links).filter(reqId => projectData.links[reqId]?.issues?.includes(issue.number));
      setLinkedReqIds(reqs);

      const cis = projectData.issueCiLinks?.[issue.number] || [];
      setLinkedCiIds(cis);
      
      const risks = projectData.issueRiskLinks?.[issue.number] || [];
      setLinkedRiskIds(risks);

    }
  }, [isOpen, issue, projectData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSaveClick = () => {
    onSave(issue.number, linkedReqIds, linkedCiIds, linkedRiskIds);
  };
  
  if (!isOpen) return null;

  const requirementsForList = useMemo(() => projectData.requirements.map(r => ({ id: r.id, name: r.description })), [projectData.requirements]);
  const cisForList = useMemo(() => projectData.configurationItems.map(c => ({ id: c.id, name: c.name })), [projectData.configurationItems]);
  const risksForList = useMemo(() => projectData.risks.map(r => ({ id: r.id, name: r.description })), [projectData.risks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-start justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                <AlertCircle /> Edit Traceability Links for Issue
            </h2>
            <p className="text-gray-300 mt-1">#{issue.number}: {issue.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
          <CheckboxList title="Requirements" items={requirementsForList} selectedIds={linkedReqIds} onToggle={(id) => handleToggle(setLinkedReqIds, id)} icon={<CheckSquare size={18}/>} />
          <CheckboxList title="Configuration Items" items={cisForList} selectedIds={linkedCiIds} onToggle={(id) => handleToggle(setLinkedCiIds, id)} icon={<Package size={18}/>} />
          <CheckboxList title="Risks" items={risksForList} selectedIds={linkedRiskIds} onToggle={(id) => handleToggle(setLinkedRiskIds, id)} icon={<ShieldAlert size={18}/>} />
        </main>

        <footer className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors flex items-center gap-2">
            <Save size={16}/> Save Links
          </button>
        </footer>
      </div>
    </div>
  );
};

export default IssueModal;
