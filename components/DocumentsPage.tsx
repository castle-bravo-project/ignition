
import { ChevronLeft, FileText } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { CMMI_PA_FULL_NAMES } from '../constants';
import { getPaInfo } from '../services/geminiService';
import { Document } from '../types';
import DocumentSection from './DocumentSection';
import PaInfoModal from './PaInfoModal';

interface DocumentsPageProps {
  documents: { [key: string]: Document };
  onDocumentUpdate: (documentId: string, sectionId: string, newDescription: string, actor: 'User' | 'AI') => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, onDocumentUpdate }) => {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedPaId, setSelectedPaId] = useState<string | null>(null);
  const [paInfoCache, setPaInfoCache] = useState<Record<string, string>>({});
  const [isPaInfoLoading, setIsPaInfoLoading] = useState(false);

  const handlePaClick = useCallback((paId: string) => {
    setSelectedPaId(paId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPaId(null);
  }, []);

  React.useEffect(() => {
    if (selectedPaId && !paInfoCache[selectedPaId]) {
      const fetchInfo = async () => {
        setIsPaInfoLoading(true);
        const paFullName = CMMI_PA_FULL_NAMES[selectedPaId] || selectedPaId;
        const info = await getPaInfo(selectedPaId, paFullName);
        setPaInfoCache(prev => ({ ...prev, [selectedPaId]: info }));
        setIsPaInfoLoading(false);
      };
      fetchInfo();
    }
  }, [selectedPaId, paInfoCache]);

  const activeDocument = activeDocumentId ? documents[activeDocumentId] : null;

  const renderDocumentList = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Project Documents</h1>
        <p className="text-gray-400 mt-1">Select a document to view or edit.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(documents).map(doc => (
          <button
            key={doc.id}
            onClick={() => setActiveDocumentId(doc.id)}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-left hover:border-brand-primary hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <div className="flex items-center gap-4">
              <div className="bg-brand-primary/10 p-3 rounded-lg">
                <FileText className="text-brand-primary" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{doc.title}</h2>
                <p className="text-sm text-gray-400">{doc.content?.length || 0} main sections</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDocumentEditor = () => {
    if (!activeDocument) return null;

    const handleUpdate = (sectionId: string, newDescription: string, actor: 'User' | 'AI') => {
      onDocumentUpdate(activeDocument.id, sectionId, newDescription, actor);
    };

    return (
      <div className="space-y-8">
        <div>
          <button
            onClick={() => setActiveDocumentId(null)}
            className="flex items-center gap-2 text-sm text-brand-secondary hover:text-brand-primary mb-4 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Document List
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Document</h1>
          <p className="text-gray-400 mt-1">Manage and edit your structured project documentation.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-6 text-brand-secondary">{activeDocument.title}</h2>
          <div className="space-y-6">
            {activeDocument.content?.map(section => (
              <DocumentSection 
                key={section.id} 
                section={section} 
                onUpdate={handleUpdate} 
                level={0}
                onPaClick={handlePaClick}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeDocumentId ? renderDocumentEditor() : renderDocumentList()}
      {selectedPaId && (
        <PaInfoModal
          paId={selectedPaId}
          paFullName={CMMI_PA_FULL_NAMES[selectedPaId] || selectedPaId}
          content={paInfoCache[selectedPaId] || ''}
          isLoading={isPaInfoLoading || !paInfoCache[selectedPaId]}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default DocumentsPage;