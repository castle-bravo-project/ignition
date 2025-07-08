/**
 * Enterprise Architecture Dashboard - Phase 5 Implementation
 * 
 * Comprehensive enterprise architecture visualization with business capability mapping,
 * technology portfolio analysis, and architectural health monitoring.
 */

import React, { useState, useMemo } from 'react';
import { 
  ProjectData, 
  ArchitecturalAnalysis, 
  TechnologyPortfolio,
  DevelopmentWorkflow,
  ProcessComplianceStatus 
} from '../types';
import { 
  BarChart3, 
  Network, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Zap,
  Target,
  Activity,
  Layers
} from 'lucide-react';

interface EnterpriseArchitectureDashboardProps {
  projectData: ProjectData;
  onRefreshAnalysis?: () => void;
}

const EnterpriseArchitectureDashboard: React.FC<EnterpriseArchitectureDashboardProps> = ({
  projectData,
  onRefreshAnalysis
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'architecture' | 'technology' | 'compliance' | 'workflows'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const { configurationItems, architecturalAnalysis, technologyPortfolio, developmentWorkflows, processComplianceStatus } = projectData;
    
    return {
      totalComponents: configurationItems?.length || 0,
      architecturalHealth: architecturalAnalysis?.qualityMetrics?.maintainability || 0,
      technologyDiversity: technologyPortfolio?.categories ? Object.keys(technologyPortfolio.categories).length : 0,
      complianceScore: processComplianceStatus?.overallCompliance || 0,
      activeWorkflows: developmentWorkflows?.filter(w => w.status === 'Active').length || 0,
      criticalIssues: (architecturalAnalysis?.architecturalSmells?.filter(s => s.severity === 'critical').length || 0) +
                     (processComplianceStatus?.violations?.filter(v => v.severity === 'Critical').length || 0)
    };
  }, [projectData]);

  const ViewToggle = () => (
    <div className="flex bg-gray-800 rounded-lg p-1">
      {[
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'architecture', label: 'Architecture', icon: Network },
        { key: 'technology', label: 'Technology', icon: Layers },
        { key: 'compliance', label: 'Compliance', icon: Shield },
        { key: 'workflows', label: 'Workflows', icon: Activity }
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveView(key as any)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === key
              ? 'bg-brand-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-900/50 border border-${color}-700`}>
          <Icon size={24} className={`text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const OverviewView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Components"
          value={dashboardMetrics.totalComponents}
          icon={Network}
          trend={5}
          color="blue"
        />
        <MetricCard
          title="Architectural Health"
          value={`${Math.round(dashboardMetrics.architecturalHealth * 100)}%`}
          icon={CheckCircle}
          trend={2}
          color="green"
        />
        <MetricCard
          title="Technology Diversity"
          value={dashboardMetrics.technologyDiversity}
          icon={Layers}
          trend={-1}
          color="purple"
        />
        <MetricCard
          title="Compliance Score"
          value={`${Math.round(dashboardMetrics.complianceScore)}%`}
          icon={Shield}
          trend={3}
          color="emerald"
        />
        <MetricCard
          title="Active Workflows"
          value={dashboardMetrics.activeWorkflows}
          icon={Activity}
          trend={0}
          color="orange"
        />
        <MetricCard
          title="Critical Issues"
          value={dashboardMetrics.criticalIssues}
          icon={AlertTriangle}
          trend={-10}
          color="red"
        />
      </div>

      {/* Architecture Health Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Architecture Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Quality Metrics</h4>
            <div className="space-y-3">
              {projectData.architecturalAnalysis?.qualityMetrics && Object.entries(projectData.architecturalAnalysis.qualityMetrics).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          value > 0.8 ? 'bg-green-500' : value > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12">{Math.round(value * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">System Complexity</h4>
            <div className="space-y-3">
              {projectData.architecturalAnalysis?.systemComplexity && Object.entries(projectData.architecturalAnalysis.systemComplexity).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm text-gray-400">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recommendations */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Recommendations</h3>
        <div className="space-y-3">
          {projectData.architecturalAnalysis?.recommendations?.slice(0, 5).map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div className={`p-1 rounded ${
                rec.priority === 'critical' ? 'bg-red-900 text-red-400' :
                rec.priority === 'high' ? 'bg-orange-900 text-orange-400' :
                rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                'bg-blue-900 text-blue-400'
              }`}>
                <Target size={14} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{rec.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Category: {rec.category}</span>
                  <span>Effort: {rec.estimatedEffort}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ArchitectureView = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Architectural Smells</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectData.architecturalAnalysis?.architecturalSmells?.map((smell, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{smell.type.replace(/_/g, ' ')}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  smell.severity === 'critical' ? 'bg-red-900 text-red-300' :
                  smell.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                  smell.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-blue-900 text-blue-300'
                }`}>
                  {smell.severity}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{smell.description}</p>
              <p className="text-xs text-gray-500">Affected: {smell.affectedComponents.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TechnologyView = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Technology Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectData.technologyPortfolio?.categories && Object.entries(projectData.technologyPortfolio.categories).map(([category, data]) => (
            <div key={category} className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">{category}</h4>
              <div className="space-y-2">
                {data.technologies.slice(0, 3).map((tech, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{tech.name}</span>
                    <span className="text-gray-500">{tech.version}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Standardization:</span>
                <span className={`px-2 py-1 rounded ${
                  data.standardization === 'High' ? 'bg-green-900 text-green-300' :
                  data.standardization === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {data.standardization}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ComplianceView = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Process Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Process Areas</h4>
            <div className="space-y-3">
              {projectData.processComplianceStatus?.processAreas && Object.entries(projectData.processComplianceStatus.processAreas).map(([area, score]) => (
                <div key={area} className="flex items-center justify-between">
                  <span className="text-gray-300">{area}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12">{Math.round(score)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Compliance Violations</h4>
            <div className="space-y-2">
              {projectData.processComplianceStatus?.violations?.slice(0, 5).map((violation, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{violation.processArea}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      violation.severity === 'Critical' ? 'bg-red-900 text-red-300' :
                      violation.severity === 'High' ? 'bg-orange-900 text-orange-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {violation.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{violation.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WorkflowsView = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Development Workflows</h3>
        <div className="space-y-4">
          {projectData.developmentWorkflows?.map((workflow, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">{workflow.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    workflow.status === 'Active' ? 'bg-green-900 text-green-300' :
                    workflow.status === 'Failed' ? 'bg-red-900 text-red-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {workflow.status}
                  </span>
                  <span className="text-xs text-gray-400">{workflow.type}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-white ml-2">{Math.round(workflow.metrics.successRate * 100)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Avg Duration:</span>
                  <span className="text-white ml-2">{Math.round(workflow.metrics.averageDuration / 1000 / 60)}m</span>
                </div>
                <div>
                  <span className="text-gray-400">Executions:</span>
                  <span className="text-white ml-2">{workflow.metrics.executionCount}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">Stages:</span>
                </div>
                <div className="flex gap-2">
                  {workflow.stages.map((stage, stageIndex) => (
                    <div key={stageIndex} className={`px-2 py-1 rounded text-xs ${
                      stage.status === 'Success' ? 'bg-green-900 text-green-300' :
                      stage.status === 'Failed' ? 'bg-red-900 text-red-300' :
                      stage.status === 'Running' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {stage.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Architecture Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Comprehensive view of your organization's architectural health and intelligence.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          {onRefreshAnalysis && (
            <button
              onClick={onRefreshAnalysis}
              className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors"
            >
              Refresh Analysis
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <ViewToggle />

      {/* Content */}
      <div className="min-h-[600px]">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'architecture' && <ArchitectureView />}
        {activeView === 'technology' && <TechnologyView />}
        {activeView === 'compliance' && <ComplianceView />}
        {activeView === 'workflows' && <WorkflowsView />}
      </div>
    </div>
  );
};

export default EnterpriseArchitectureDashboard;
