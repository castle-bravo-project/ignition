/**
 * Relationship Graph Dashboard - Impact Analysis & Change Estimation
 * 
 * Interactive graph showing relationships between documents, process assets, risks, 
 * issues, requirements, and test cases. Provides impact analysis and change estimation.
 */

import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckSquare,
    Eye,
    FileText,
    GitBranch,
    Network,
    Search,
    Settings,
    TestTube,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DocumentSectionData, ProjectData, Requirement, Risk, TestCase } from '../types';

interface RelationshipGraphDashboardProps {
  projectData: ProjectData;
  className?: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'requirement' | 'document' | 'test' | 'risk' | 'ci' | 'process_asset';
  category: string;
  status?: string;
  priority?: string;
  maturityLevel?: number;
  connections: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'implements' | 'tests' | 'mitigates' | 'references' | 'depends_on';
  strength: number;
}

interface ImpactAnalysis {
  nodeId: string;
  directImpacts: string[];
  indirectImpacts: string[];
  estimatedEffort: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedAreas: string[];
}

const RelationshipGraphDashboard: React.FC<RelationshipGraphDashboardProps> = ({
  projectData,
  className = ''
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'hierarchy'>('graph');

  // Generate graph data from project data
  const { nodes, links } = useMemo(() => {
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];

    // Add requirement nodes
    projectData.requirements?.forEach((req: Requirement) => {
      const connections = (projectData.links?.[req.id]?.tests?.length || 0) +
                         (projectData.links?.[req.id]?.cis?.length || 0) +
                         (projectData.links?.[req.id]?.risks?.length || 0);
      
      graphNodes.push({
        id: req.id,
        label: req.title,
        type: 'requirement',
        category: req.category || 'functional',
        status: req.status,
        priority: req.priority,
        connections
      });

      // Add links to tests
      projectData.links?.[req.id]?.tests?.forEach((testId: string) => {
        graphLinks.push({
          source: req.id,
          target: testId,
          type: 'tests',
          strength: 1
        });
      });

      // Add links to configuration items
      projectData.links?.[req.id]?.cis?.forEach((ciId: string) => {
        graphLinks.push({
          source: req.id,
          target: ciId,
          type: 'implements',
          strength: 1
        });
      });

      // Add links to risks
      projectData.links?.[req.id]?.risks?.forEach((riskId: string) => {
        graphLinks.push({
          source: req.id,
          target: riskId,
          type: 'mitigates',
          strength: 1
        });
      });
    });

    // Add test case nodes
    projectData.testCases?.forEach((test: TestCase) => {
      const connections = graphLinks.filter(l => l.target === test.id).length;
      
      graphNodes.push({
        id: test.id,
        label: test.title,
        type: 'test',
        category: test.type || 'functional',
        status: test.status,
        connections
      });
    });

    // Add risk nodes
    projectData.risks?.forEach((risk: Risk) => {
      const connections = graphLinks.filter(l => l.target === risk.id).length;
      
      graphNodes.push({
        id: risk.id,
        label: risk.title,
        type: 'risk',
        category: risk.category || 'technical',
        status: risk.status,
        priority: risk.impact,
        connections
      });
    });

    // Add document nodes
    Object.values(projectData.documents || {}).forEach((doc: any) => {
      const processDocSections = (sections: DocumentSectionData[], docId: string) => {
        sections.forEach((section: DocumentSectionData) => {
          graphNodes.push({
            id: section.id,
            label: section.title,
            type: 'document',
            category: docId,
            maturityLevel: section.maturityLevel,
            connections: section.cmmiPaIds?.length || 0
          });

          if (section.children) {
            processDocSections(section.children, docId);
          }
        });
      };

      if (doc.content) {
        processDocSections(doc.content, doc.id);
      }
    });

    // Add configuration item nodes
    projectData.configurationItems?.forEach((ci: any) => {
      const connections = graphLinks.filter(l => l.target === ci.id).length;
      
      graphNodes.push({
        id: ci.id,
        label: ci.name,
        type: 'ci',
        category: ci.type || 'software',
        status: ci.status,
        connections
      });
    });

    return { nodes: graphNodes, links: graphLinks };
  }, [projectData]);

  // Filter nodes based on search and filter type
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesFilter = filterType === 'all' || node.type === filterType;
      const matchesSearch = searchTerm === '' || 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [nodes, filterType, searchTerm]);

  // Calculate impact analysis for selected node
  const calculateImpactAnalysis = (nodeId: string): ImpactAnalysis => {
    const directImpacts = links
      .filter(l => l.source === nodeId || l.target === nodeId)
      .map(l => l.source === nodeId ? l.target : l.source);

    const indirectImpacts: string[] = [];
    directImpacts.forEach(directId => {
      const secondLevel = links
        .filter(l => (l.source === directId || l.target === directId) && 
                    l.source !== nodeId && l.target !== nodeId)
        .map(l => l.source === directId ? l.target : l.source);
      indirectImpacts.push(...secondLevel);
    });

    const totalImpacts = directImpacts.length + indirectImpacts.length;
    const node = nodes.find(n => n.id === nodeId);
    
    let estimatedEffort: ImpactAnalysis['estimatedEffort'] = 'low';
    let riskLevel: ImpactAnalysis['riskLevel'] = 'low';

    if (totalImpacts > 10) {
      estimatedEffort = 'critical';
      riskLevel = 'critical';
    } else if (totalImpacts > 5) {
      estimatedEffort = 'high';
      riskLevel = 'high';
    } else if (totalImpacts > 2) {
      estimatedEffort = 'medium';
      riskLevel = 'medium';
    }

    const affectedAreas = [...new Set([
      ...directImpacts.map(id => nodes.find(n => n.id === id)?.type || 'unknown'),
      ...indirectImpacts.map(id => nodes.find(n => n.id === id)?.type || 'unknown')
    ])];

    return {
      nodeId,
      directImpacts,
      indirectImpacts: [...new Set(indirectImpacts)],
      estimatedEffort,
      riskLevel,
      affectedAreas
    };
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setImpactAnalysis(calculateImpactAnalysis(node.id));
  };

  const getNodeColor = (node: GraphNode): string => {
    switch (node.type) {
      case 'requirement': return '#3B82F6'; // Blue
      case 'test': return '#10B981'; // Green
      case 'risk': return '#EF4444'; // Red
      case 'document': return '#8B5CF6'; // Purple
      case 'ci': return '#F59E0B'; // Orange
      case 'process_asset': return '#06B6D4'; // Cyan
      default: return '#6B7280'; // Gray
    }
  };

  const getNodeIcon = (node: GraphNode): React.ReactNode => {
    switch (node.type) {
      case 'requirement':
        return <CheckSquare size={16} />;
      case 'test':
        return <TestTube size={16} />;
      case 'risk':
        return <AlertTriangle size={16} />;
      case 'document':
        return <FileText size={16} />;
      case 'ci':
        return <Settings size={16} />;
      case 'process_asset':
        return <Network size={16} />;
      default:
        return <Network size={16} />;
    }
  };

  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const nodeTypes = [
    { value: 'all', label: 'All Types', icon: Network },
    { value: 'requirement', label: 'Requirements', icon: FileText },
    { value: 'test', label: 'Test Cases', icon: TestTube },
    { value: 'risk', label: 'Risks', icon: AlertTriangle },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'ci', label: 'Config Items', icon: Settings }
  ];

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Network size={24} className="text-brand-primary" />
          <h2 className="text-2xl font-bold text-white">Relationship Graph Dashboard</h2>
        </div>
        <p className="text-gray-400">
          Visualize relationships between project elements and analyze change impacts with intelligent estimation.
        </p>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-brand-primary focus:outline-none"
          >
            {nodeTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex gap-2">
            {[
              { mode: 'graph', icon: Network, label: 'Graph' },
              { mode: 'matrix', icon: GitBranch, label: 'Matrix' },
              { mode: 'hierarchy', icon: TrendingUp, label: 'Hierarchy' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 h-96 relative overflow-hidden">
              {viewMode === 'graph' && (
                <div className="absolute inset-0 p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">Interactive Relationship Graph</h3>
                    <p className="text-gray-400 text-sm">
                      {filteredNodes.length} nodes, {links.length} connections
                    </p>
                  </div>

                  {/* Simple Grid Layout for Nodes */}
                  <div className="grid grid-cols-6 gap-2 h-64 overflow-y-auto">
                    {filteredNodes.map((node, index) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNodeClick(node)}
                        className={`
                          relative w-12 h-12 rounded-full border-2 cursor-pointer
                          flex items-center justify-center text-xs font-medium
                          transition-all duration-200 hover:scale-110 hover:shadow-lg
                          ${selectedNode?.id === node.id
                            ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-gray-800'
                            : ''
                          }
                        `}
                        style={{
                          backgroundColor: getNodeColor(node),
                          borderColor: getNodeColor(node),
                          color: '#ffffff'
                        }}
                        title={`${node.label} (${node.type})`}
                      >
                        {getNodeIcon(node)}
                        {node.connections > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full text-xs flex items-center justify-center text-white">
                            {node.connections}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Statistics */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-700/80 rounded p-2 text-center">
                        <div className="text-blue-400 font-semibold">{nodes.filter(n => n.type === 'requirement').length}</div>
                        <div className="text-gray-300">Requirements</div>
                      </div>
                      <div className="bg-gray-700/80 rounded p-2 text-center">
                        <div className="text-green-400 font-semibold">{nodes.filter(n => n.type === 'test').length}</div>
                        <div className="text-gray-300">Tests</div>
                      </div>
                      <div className="bg-gray-700/80 rounded p-2 text-center">
                        <div className="text-red-400 font-semibold">{nodes.filter(n => n.type === 'risk').length}</div>
                        <div className="text-gray-300">Risks</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'matrix' && (
                <div className="absolute inset-0 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Relationship Matrix</h3>
                  <div className="text-gray-400 text-sm">Matrix view coming soon...</div>
                </div>
              )}

              {viewMode === 'hierarchy' && (
                <div className="absolute inset-0 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Hierarchy View</h3>
                  <div className="text-gray-400 text-sm">Hierarchy view coming soon...</div>
                </div>
              )}
            </div>
          </div>

          {/* Impact Analysis Panel */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-brand-primary" />
              Impact Analysis
            </h3>
            
            {selectedNode && impactAnalysis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">{selectedNode.label}</h4>
                  <div className="text-sm text-gray-400">
                    Type: <span className="text-white">{selectedNode.type}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Category: <span className="text-white">{selectedNode.category}</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Change Impact</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Effort:</span>
                      <span className={`font-medium ${getEffortColor(impactAnalysis.estimatedEffort)}`}>
                        {impactAnalysis.estimatedEffort.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk:</span>
                      <span className={`font-medium ${getEffortColor(impactAnalysis.riskLevel)}`}>
                        {impactAnalysis.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Direct Impacts:</span>
                      <span className="text-white font-medium">{impactAnalysis.directImpacts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Indirect Impacts:</span>
                      <span className="text-white font-medium">{impactAnalysis.indirectImpacts.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Affected Areas</h5>
                  <div className="flex flex-wrap gap-1">
                    {impactAnalysis.affectedAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye size={32} className="mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400 text-sm">
                  Click on a node to see impact analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RelationshipGraphDashboard;
