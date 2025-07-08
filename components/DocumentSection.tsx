
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { DocumentSectionData } from '../types';
import { improveContent } from '../services/geminiService';

interface DocumentSectionProps {
  section: DocumentSectionData;
  onUpdate: (id: string, newDescription: string, actor: 'User' | 'AI') => void;
  level: number;
  onPaClick: (paId: string) => void;
}

const PaTag: React.FC<{ paId: string; onClick: () => void; }> = ({ paId, onClick }) => {
    const colors: { [key: string]: string } = {
        'PP': 'bg-blue-900/50 text-blue-300 border-blue-700 hover:bg-blue-800/60',
        'REQM': 'bg-green-900/50 text-green-300 border-green-700 hover:bg-green-800/60',
        'CM': 'bg-purple-900/50 text-purple-300 border-purple-700 hover:bg-purple-800/60',
        'IPM': 'bg-indigo-900/50 text-indigo-300 border-indigo-700 hover:bg-indigo-800/60',
        'TS': 'bg-teal-900/50 text-teal-300 border-teal-700 hover:bg-teal-800/60',
        'VAL': 'bg-pink-900/50 text-pink-300 border-pink-700 hover:bg-pink-800/60',
        'VER': 'bg-rose-900/50 text-rose-300 border-rose-700 hover:bg-rose-800/60',
        'RSKM': 'bg-red-900/50 text-red-300 border-red-700 hover:bg-red-800/60',
        'PPQA': 'bg-amber-900/50 text-amber-300 border-amber-700 hover:bg-amber-800/60',
    };
    const colorClass = colors[paId] || 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700/80';

    return (
        <button 
            onClick={onClick}
            className={`inline-block px-2 py-0.5 text-xs font-mono rounded-full border ${colorClass} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary`}
            aria-label={`Learn more about ${paId}`}
        >
            {paId}
        </button>
    );
};


const DocumentSection: React.FC<DocumentSectionProps> = ({ section, onUpdate, level, onPaClick }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [section.description]);
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(section.id, e.target.value, 'User');
  }

  const handleImproveContent = async () => {
    if (isImproving || !section.description) return;
    setIsImproving(true);
    try {
      const improved = await improveContent(section.description);
      onUpdate(section.id, improved, 'AI');
    } catch (error) {
      console.error("Failed to improve content:", error);
      // Optionally show an error to the user
    } finally {
      setIsImproving(false);
    }
  };

  const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;

  return (
    <div 
        className="border-l-2 border-gray-700 transition-colors duration-300 hover:border-brand-primary"
        style={{ marginLeft: `${level * 1}rem`, paddingLeft: '1.5rem' }}
    >
        <div className="mb-2">
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                <HeadingTag className="text-lg font-semibold text-gray-200">
                    {section.title}
                </HeadingTag>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleImproveContent}
                      disabled={isImproving || !section.description}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-brand-primary bg-brand-primary/10 rounded-md border border-brand-primary/30 hover:bg-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Improve content with AI"
                    >
                      {isImproving ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>Improve</span>
                    </button>
                    {section.cmmiPaIds.map(paId => <PaTag key={paId} paId={paId} onClick={() => onPaClick(paId)} />)}
                </div>
            </div>
        </div>
      
      <textarea
        ref={textareaRef}
        value={section.description}
        onChange={handleDescriptionChange}
        className="w-full bg-gray-950 p-3 text-gray-300 text-base leading-relaxed border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none overflow-hidden transition-colors"
        rows={1}
      />

      {section.children && section.children.length > 0 && (
        <div className="mt-6 space-y-6">
          {section.children.map(child => (
            <DocumentSection
              key={child.id}
              section={child}
              onUpdate={onUpdate}
              level={level + 1}
              onPaClick={onPaClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentSection;