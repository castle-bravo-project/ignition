import React, { useState, useMemo, useCallback } from 'react';
import { ProjectData, CmmiAssessment, ProcessAreaStatus } from '../types';
import { calculateCmmiAssessment } from '../services/cmmiService';
import { generateCmmiRecommendations } from '../services/geminiService';
import ProcessAreaCard from './ProcessAreaCard';
import AiRecommendationModal from './AiRecommendationModal';
import { Award, TrendingUp, Bot, Loader } from 'lucide-react';

// Helper to create a concise summary of the project for AI context
const getProjectContextSummary = (data: ProjectData): string => {
    const docSummaries = Object.values(data.documents).map(doc => {
        const topLevelSections = doc.content.map(s => s.title).join(', ');
        return `- ${doc.title}: Contains sections like ${topLevelSections}.`;
    }).join('\n');
    const reqSummary = `There are ${data.requirements.length} requirements, ${data.testCases.length} test cases, ${data.risks.length} risks, and ${data.configurationItems.length} CIs defined.`;
    return `DOCUMENTATION OVERVIEW:\n${docSummaries}\n\nPROJECT ARTIFACTS OVERVIEW:\n${reqSummary}`;
};


const CmmiPage: React.FC<{ projectData: ProjectData }> = ({ projectData }) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedPa, setSelectedPa] = useState<ProcessAreaStatus | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assessment: CmmiAssessment = useMemo(() => calculateCmmiAssessment(projectData), [projectData]);

  const handleGetRecommendations = useCallback(async (paStatus: ProcessAreaStatus) => {
    setSelectedPa(paStatus);
    setIsGeneratingReport(true);
    setError(null);
    setRecommendations(null);
    try {
        const context = getProjectContextSummary(projectData);
        const result = await generateCmmiRecommendations(paStatus, context);
        setRecommendations(result);
    } catch (e: any) {
        setError(e.message || 'An unexpected error occurred while generating recommendations.');
    } finally {
        setIsGeneratingReport(false);
    }
  }, [projectData]);
  
  const handleCloseModal = () => {
      setSelectedPa(null);
      setRecommendations(null);
      setError(null);
  }

  const { maturityLevel, levelProgress, processAreasByLevel } = assessment;
  const nextLevel = maturityLevel + 1;
  const sortedLevels = Object.keys(processAreasByLevel).map(Number).sort((a,b)=>a-b);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">CMMI Maturity Assessment</h1>
        <p className="text-gray-400 mt-1">Live analysis of your project's alignment with CMMI process areas.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
            <Award size={80} className={`text-brand-primary ${maturityLevel > 1 ? 'opacity-100' : 'opacity-30'}`}/>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white">{maturityLevel}</span>
        </div>
        <div className="flex-1 w-full">
            <div className="flex justify-between items-baseline">
                <h2 className="text-2xl font-bold text-white">Maturity Level {maturityLevel}</h2>
                <p className="text-sm font-semibold text-brand-secondary">Progress to Level {nextLevel}: {levelProgress}%</p>
            </div>
            <p className="text-gray-400 mt-1">Your project is currently assessed at Level {maturityLevel}. Keep improving your processes to reach the next level.</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
                <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }}></div>
            </div>
        </div>
      </div>
      
      {sortedLevels.map(level => (
        <div key={level}>
            <h2 className="text-2xl font-semibold text-white mb-4 border-b-2 border-gray-800 pb-2 flex items-center gap-2">
                <TrendingUp size={24} className="text-brand-secondary"/>
                Maturity Level {level} Process Areas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processAreasByLevel[level].map(paStatus => (
                    <ProcessAreaCard 
                        key={paStatus.id} 
                        paStatus={paStatus}
                        onGetRecommendations={handleGetRecommendations}
                        isGeneratingReport={isGeneratingReport && selectedPa?.id === paStatus.id}
                    />
                ))}
            </div>
        </div>
      ))}
      
      {selectedPa && (
        <AiRecommendationModal 
            paName={selectedPa.name}
            isLoading={isGeneratingReport}
            content={recommendations || (error ? `Error: ${error}` : null)}
            onClose={handleCloseModal}
        />
      )}

    </div>
  );
};

export default CmmiPage;
