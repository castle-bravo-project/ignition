
import React, { useEffect, useRef } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { Risk } from '../types';

interface RiskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  risks: Risk[];
}

const RiskListModal: React.FC<RiskListModalProps> = ({ isOpen, onClose, title, risks }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-primary">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </header>
        <main className="p-6 overflow-y-auto text-gray-300">
          {risks.length > 0 ? (
            <ul className="space-y-3">
              {risks.map(risk => (
                <li key={risk.id} className="bg-gray-800/50 p-3 rounded-md flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <div>
                      <span className="font-mono font-bold text-white">{risk.id}:</span>
                      <p className="text-gray-300">{risk.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No risks in this category.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default RiskListModal;
