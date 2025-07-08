import { AlertTriangle, LayoutGrid, List, Loader, Network, Target } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArchitecturalAnalysisService } from '../services/architecturalAnalysisService';
import { ProjectData } from '../types';
import ArchitectureTableView from './ArchitectureTableView';

declare global {
    interface Window {
        mermaid?: any;
    }
}

const ArchitecturePage: React.FC<{ projectData: ProjectData }> = ({ projectData }) => {
  const { configurationItems } = projectData;
  const [viewMode, setViewMode] = useState<'enterprise' | 'graph' | 'table'>('enterprise');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Perform architectural analysis
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = ArchitecturalAnalysisService.analyzeArchitecture(projectData);
      setAnalysisData(analysis);

      // Update project data with analysis results
      const updatedProjectData = {
        ...projectData,
        architecturalAnalysis: analysis
      };

      // In a real app, you'd save this back to the project
      console.log('Architectural analysis completed:', analysis);
    } catch (error) {
      console.error('Error performing architectural analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform analysis on component mount
  useEffect(() => {
    if (configurationItems.length > 0 && !analysisData) {
      performAnalysis();
    }
  }, [configurationItems.length]);

  const graphDefinition = useMemo(() => {
    if (!configurationItems || configurationItems.length === 0) return '';

    let mermaidString = 'graph TD;\n';
    
    mermaidString += '    classDef arch fill:#0d1117,stroke:#f59e0b,stroke-width:2px,color:#fff,font-weight:bold;\n';
    mermaidString += '    classDef comp fill:#21262d,stroke:#4b5563,stroke-width:1px,color:#e5e7eb;\n';
    mermaidString += '    classDef doc fill:#105c42,stroke:#34d399,stroke-width:1px,color:#e5e7eb;\n';
    mermaidString += '    classDef tool fill:#4338ca,stroke:#818cf8,stroke-width:1px,color:#e5e7eb;\n';
    mermaidString += '    classDef hardware fill:#9a3412,stroke:#fb923c,stroke-width:1px,color:#e5e7eb;\n';
    
    configurationItems.forEach(ci => {
        const sanitizedName = ci.name.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        mermaidString += `    ${ci.id}["${ci.id}<br/><i>${sanitizedName}</i>"];\n`;
    });

    configurationItems.forEach(ci => {
        let nodeClass = 'comp';
        if (ci.type === 'Architectural Product') nodeClass = 'arch';
        else if (ci.type === 'Document') nodeClass = 'doc';
        else if (ci.type === 'Tool') nodeClass = 'tool';
        else if (ci.type === 'Hardware') nodeClass = 'hardware';
        mermaidString += `    class ${ci.id} ${nodeClass};\n`;
    });
    
    configurationItems.forEach(item => {
        if (item.dependencies && item.dependencies.length > 0) {
            item.dependencies.forEach(depId => {
                if (configurationItems.some(ci => ci.id === depId)) {
                    mermaidString += `    ${item.id} --> ${depId};\n`;
                }
            });
        }
    });

    return mermaidString;
  }, [configurationItems]);

  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'graph' && window.mermaid && mermaidContainerRef.current && graphDefinition) {
        window.mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
        });
        
        const renderMermaid = async () => {
          if (!mermaidContainerRef.current) return;
          try {
            // Set loading state before rendering
            mermaidContainerRef.current.innerHTML = `<div class="flex items-center justify-center h-full min-h-[400px]">
              <div class="animate-spin text-brand-primary" role="status" aria-label="Loading graph">
                  <span class="sr-only">Loading...</span>
              </div>
              <p class="ml-4 text-gray-400">Rendering graph...</p>
            </div>`.replace('<div class="animate-spin', `<svg class="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.92993 4.92993L7.75993 7.75993" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.24 16.24L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.92993 19.07L7.75993 16.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.24 7.75993L19.07 4.92993" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

            const { svg } = await window.mermaid.render('mermaid-graph-' + Date.now(), graphDefinition);
            if (mermaidContainerRef.current) {
              mermaidContainerRef.current.innerHTML = svg;
            }
          } catch(e: any) {
            console.error("Mermaid rendering error:", e);
            if(mermaidContainerRef.current) {
              mermaidContainerRef.current.innerHTML = `<div class="text-center p-4">
                  <p class="text-red-400 font-semibold">Error rendering architecture graph.</p>
                  <pre class="text-left text-xs text-red-500 bg-gray-950 p-2 mt-2 rounded">${e.message}</pre>
              </div>`;
            }
          }
        };

        renderMermaid();
    }
  }, [graphDefinition, viewMode]);

  const ViewToggle = () => (
      <div className="bg-gray-800 p-1 rounded-lg flex w-min">
          <button
              onClick={() => setViewMode('enterprise')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'enterprise' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-pressed={viewMode === 'enterprise'}
          >
              <Network size={16} />
              <span>Enterprise View</span>
          </button>
          <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'graph' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-pressed={viewMode === 'graph'}
          >
              <LayoutGrid size={16} />
              <span>Graph View</span>
          </button>
          <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-pressed={viewMode === 'table'}
          >
              <List size={16} />
              <span>Table View</span>
          </button>
      </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">System Architecture</h1>
            <p className="text-gray-400 mt-1">
            Visualize your system's components and their relationships.
            </p>
        </div>
        <ViewToggle />
      </div>

      {configurationItems && configurationItems.length > 0 ? (
        <div className="min-h-[400px]">
            {viewMode === 'enterprise' ? (
                <div>
                  {isAnalyzing ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[400px] flex justify-center items-center">
                      <Loader className="animate-spin text-brand-primary" size={40} />
                      <p className="ml-4 text-gray-400">Analyzing architecture...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Enterprise Architecture Dashboard would go here */}
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Enterprise Architecture Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Total Components</h4>
                            <p className="text-2xl font-bold text-white">{configurationItems.length}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Architecture Health</h4>
                            <p className="text-2xl font-bold text-green-400">
                              {analysisData ? Math.round(analysisData.qualityMetrics.maintainability * 100) : 'N/A'}%
                            </p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Complexity Score</h4>
                            <p className="text-2xl font-bold text-yellow-400">
                              {analysisData ? analysisData.systemComplexity.overall.toFixed(1) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {analysisData && analysisData.architecturalSmells && analysisData.architecturalSmells.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Architectural Issues</h4>
                            <div className="space-y-2">
                              {analysisData.architecturalSmells.slice(0, 3).map((smell: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                  <div className={`p-1 rounded ${
                                    smell.severity === 'critical' ? 'bg-red-900 text-red-400' :
                                    smell.severity === 'high' ? 'bg-orange-900 text-orange-400' :
                                    'bg-yellow-900 text-yellow-400'
                                  }`}>
                                    <AlertTriangle size={14} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-white">{smell.type.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-gray-400">{smell.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisData && analysisData.recommendations && analysisData.recommendations.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Recommendations</h4>
                            <div className="space-y-2">
                              {analysisData.recommendations.slice(0, 3).map((rec: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                  <div className="p-1 rounded bg-blue-900 text-blue-400">
                                    <Target size={14} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-white">{rec.title}</p>
                                    <p className="text-xs text-gray-400">{rec.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={performAnalysis}
                            disabled={isAnalyzing}
                            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors disabled:opacity-50"
                          >
                            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            ) : viewMode === 'graph' ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[400px] flex justify-center items-center">
                    <div
                        ref={mermaidContainerRef}
                        key={graphDefinition}
                        className="w-full"
                    >
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                          <Loader className="animate-spin text-brand-primary" size={40} />
                          <p className="ml-4 text-gray-400">Rendering graph...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[400px]">
                    <ArchitectureTableView configurationItems={configurationItems} />
                </div>
            )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center bg-gray-900 border border-dashed border-gray-700 rounded-lg p-12 min-h-[400px]">
            <Network size={48} className="text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No Configuration Items Found</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">To visualize your system, go to the 'Configuration' page and add Configuration Items. If you define dependencies between them, they will be shown here.</p>
        </div>
      )}
    </div>
  );
};

export default ArchitecturePage;
