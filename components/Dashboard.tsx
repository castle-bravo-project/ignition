import React from 'react';
import { DocumentSectionData, Metric, ProjectData } from '../types';
import AiChat from './AiChat';
import BadgeShowcase from './BadgeShowcase';
import MetricCard from './MetricCard';
import RiskHeatMap from './RiskHeatMap';
import RtmView from './RtmView';

interface DashboardProps {
    projectData: ProjectData;
    onDocumentUpdate: (documentId: string, sectionId: string, newDescription: string, actor: 'User' | 'AI') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projectData, onDocumentUpdate }) => {
    const { requirements = [], documents = {}, links = {}, testCases = [], risks = [] } = projectData;

    // --- Requirements Coverage Metric (Tests) ---
    const totalReqs = requirements.length;
    const linkedReqsToTests = requirements.filter(r => links[r.id] && links[r.id].tests.length > 0).length;
    const reqTestCoverage = totalReqs > 0 ? Math.round((linkedReqsToTests / totalReqs) * 100) : 0;

    // --- Requirements Coverage Metric (CIs) ---
    const linkedReqsToCis = requirements.filter(r => links[r.id] && links[r.id].cis.length > 0).length;
    const ciCoverage = totalReqs > 0 ? Math.round((linkedReqsToCis / totalReqs) * 100) : 0;

    // --- Document Completeness Metric ---
    let totalSections = 0;
    let filledSections = 0;
    Object.values(documents).forEach(doc => {
        const countSections = (sections: DocumentSectionData[]) => {
            sections.forEach(s => {
                totalSections++;
                if (s.description && s.description.trim().length > 10) filledSections++;
                if (s.children) countSections(s.children);
            });
        };
        if (doc.content) countSections(doc.content);
    });
    const docCompleteness = totalSections > 0 ? Math.round((filledSections / totalSections) * 100) : 0;
    
    // --- Test Coverage Metric ---
    const totalTests = testCases.length;
    const passedTests = testCases.filter(tc => tc.status === 'Passed').length;
    const testCoverage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // --- Overall Project Health ---
    const healthReqTestCoverage = totalReqs > 0 ? (linkedReqsToTests / totalReqs) : 0;
    const healthCiCoverage = totalReqs > 0 ? (linkedReqsToCis / totalReqs) : 0;
    const healthDocCompleteness = totalSections > 0 ? (filledSections / totalSections) : 0;
    const healthTestCoverage = totalTests > 0 ? (passedTests / totalTests) : 0;
    const projectHealth = Math.round(((healthReqTestCoverage + healthCiCoverage + healthDocCompleteness + healthTestCoverage) / 4) * 100);

    // --- Open Risks Metric ---
    const openRisks = risks.filter(r => r.status === 'Open').length;

    const projectMetrics: Metric[] = [
        { title: 'Project Health', value: projectHealth, unit: '/ 100', description: 'Overall project score' },
        { title: 'Doc Completeness', value: docCompleteness, unit: '%', description: 'Based on section content' },
        { title: 'Req. Test Coverage', value: reqTestCoverage, unit: '%', description: '% of reqs with linked tests' },
        { title: 'Req. CI Coverage', value: ciCoverage, unit: '%', description: '% of reqs with linked CIs' },
        { title: 'Open Risks', value: openRisks, unit: '', description: 'Number of risks with "Open" status' },
    ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, here's your project's status at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {projectMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Live Traceability View</h2>
          <p className="text-sm text-gray-400 mb-4">At-a-glance view of how requirements are covered by tests and implemented by configuration items.</p>
          <RtmView projectData={projectData} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold">Risk Heat Map</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">Summary of risks by probability and impact.</p>
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto">
                    <RiskHeatMap risks={projectData.risks} isInteractive={false} />
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
            <AiChat projectData={projectData} onDocumentUpdate={onDocumentUpdate} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Badges</h2>
            <BadgeShowcase />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;