import React from 'react';
import { ProcessAreaStatus } from '../types';
import CircularProgressBar from './common/CircularProgressBar';
import { Bot, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ProcessAreaCardProps {
  paStatus: ProcessAreaStatus;
  onGetRecommendations: (paStatus: ProcessAreaStatus) => void;
  isGeneratingReport: boolean;
}

const ProcessAreaCard: React.FC<ProcessAreaCardProps> = ({ paStatus, onGetRecommendations, isGeneratingReport }) => {
  const { name, score, evidence, gaps, isSatisfied } = paStatus;
  const cardBorderColor = isSatisfied ? 'border-green-700/50 hover:border-green-600' : 'border-gray-800 hover:border-brand-primary';

  return (
    <div className={`bg-gray-900 border ${cardBorderColor} rounded-lg p-6 flex flex-col justify-between transition-colors duration-200`}>
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400">Process Area</p>
          </div>
          <CircularProgressBar score={score} size={60} strokeWidth={6} />
        </div>

        <div className="mt-4 space-y-3 text-sm">
          {evidence.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-300 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Evidence</h4>
              <ul className="mt-1 pl-4 text-gray-400 list-disc list-outside marker:text-green-500 space-y-1">
                {evidence.slice(0, 2).map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
          {gaps.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-300 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500"/> Gaps</h4>
              <ul className="mt-1 pl-4 text-gray-400 list-disc list-outside marker:text-yellow-500 space-y-1">
                 {gaps.slice(0, 2).map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
          {evidence.length === 0 && gaps.length === 0 && (
             <div>
                <h4 className="font-semibold text-gray-300 flex items-center gap-2"><XCircle size={16} className="text-gray-500"/> No Data</h4>
                <p className="mt-1 pl-4 text-gray-500">No data available for assessment.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => onGetRecommendations(paStatus)}
          disabled={isGeneratingReport}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 border border-brand-primary/50 text-brand-primary font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bot size={16} />
          <span>AI Recommendations</span>
        </button>
      </div>
    </div>
  );
};

export default ProcessAreaCard;
