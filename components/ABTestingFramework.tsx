/**
 * A/B Testing Framework - UX Innovation Component
 * 
 * Comprehensive A/B testing system with experiment configuration, user segmentation,
 * metrics tracking, and statistical analysis dashboard.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Play, 
  Pause, 
  Stop,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  traffic: number; // Percentage of traffic (0-100)
  config: Record<string, any>;
  metrics: {
    conversions: number;
    visitors: number;
    conversionRate: number;
    confidence: number;
  };
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;
  targetMetric: string;
  variants: ABTestVariant[];
  segmentation: {
    criteria: string[];
    percentage: number;
  };
  results?: {
    winner?: string;
    confidence: number;
    significance: number;
    recommendation: string;
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

interface ABTestingFrameworkProps {
  experiments: ABTestExperiment[];
  onCreateExperiment: (experiment: Omit<ABTestExperiment, 'id' | 'metadata'>) => void;
  onUpdateExperiment: (id: string, updates: Partial<ABTestExperiment>) => void;
  onDeleteExperiment: (id: string) => void;
  className?: string;
}

const ABTestingFramework: React.FC<ABTestingFrameworkProps> = ({
  experiments,
  onCreateExperiment,
  onUpdateExperiment,
  onDeleteExperiment,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experiments' | 'results' | 'settings'>('overview');
  const [selectedExperiment, setSelectedExperiment] = useState<ABTestExperiment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const totalExperiments = experiments.length;
    const runningExperiments = experiments.filter(e => e.status === 'running').length;
    const completedExperiments = experiments.filter(e => e.status === 'completed').length;
    const totalVisitors = experiments.reduce((sum, exp) => 
      sum + exp.variants.reduce((varSum, variant) => varSum + variant.metrics.visitors, 0), 0
    );
    const avgConversionRate = experiments.length > 0 
      ? experiments.reduce((sum, exp) => {
          const expAvg = exp.variants.reduce((varSum, variant) => 
            varSum + variant.metrics.conversionRate, 0) / exp.variants.length;
          return sum + expAvg;
        }, 0) / experiments.length
      : 0;

    return {
      totalExperiments,
      runningExperiments,
      completedExperiments,
      totalVisitors,
      avgConversionRate: avgConversionRate.toFixed(2)
    };
  }, [experiments]);

  const getStatusColor = (status: ABTestExperiment['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'draft':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      case 'archived':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: ABTestExperiment['status']) => {
    switch (status) {
      case 'running':
        return <Play size={14} />;
      case 'paused':
        return <Pause size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'draft':
        return <Edit size={14} />;
      case 'archived':
        return <Clock size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical size={16} className="text-brand-primary" />
            <span className="text-sm text-gray-400">Total Tests</span>
          </div>
          <div className="text-2xl font-bold text-white">{overviewMetrics.totalExperiments}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Play size={16} className="text-green-400" />
            <span className="text-sm text-gray-400">Running</span>
          </div>
          <div className="text-2xl font-bold text-white">{overviewMetrics.runningExperiments}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-blue-400" />
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">{overviewMetrics.completedExperiments}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-purple-400" />
            <span className="text-sm text-gray-400">Total Visitors</span>
          </div>
          <div className="text-2xl font-bold text-white">{overviewMetrics.totalVisitors.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-orange-400" />
            <span className="text-sm text-gray-400">Avg Conv. Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{overviewMetrics.avgConversionRate}%</div>
        </div>
      </div>

      {/* Recent Experiments */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Experiments</h3>
        <div className="space-y-3">
          {experiments.slice(0, 5).map((experiment) => (
            <div key={experiment.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(experiment.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(experiment.status)}
                    <span className="capitalize">{experiment.status}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white">{experiment.name}</div>
                  <div className="text-sm text-gray-400">{experiment.variants.length} variants</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedExperiment(experiment)}
                className="text-brand-primary hover:text-brand-secondary transition-colors"
              >
                <Eye size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ExperimentsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">All Experiments</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
        >
          <Plus size={16} />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Experiments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {experiments.map((experiment) => (
          <motion.div
            key={experiment.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-primary/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-white">{experiment.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{experiment.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(experiment.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(experiment.status)}
                  <span className="capitalize">{experiment.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Variants:</span>
                <span className="text-white">{experiment.variants.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Target Metric:</span>
                <span className="text-white">{experiment.targetMetric}</span>
              </div>
              {experiment.startDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">{experiment.startDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setSelectedExperiment(experiment)}
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
              >
                View Details
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Edit size={16} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ResultsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Experiment Results</h3>
      
      {experiments.filter(e => e.status === 'completed').map((experiment) => (
        <div key={experiment.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="font-semibold text-white mb-4">{experiment.name}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experiment.variants.map((variant) => (
              <div key={variant.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{variant.name}</span>
                  {experiment.results?.winner === variant.id && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Winner</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Visitors:</span>
                    <span className="text-white">{variant.metrics.visitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions:</span>
                    <span className="text-white">{variant.metrics.conversions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conv. Rate:</span>
                    <span className="text-white">{variant.metrics.conversionRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white">{variant.metrics.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {experiment.results && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h5 className="font-medium text-white mb-2">Recommendation</h5>
              <p className="text-sm text-gray-300">{experiment.results.recommendation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const CreateExperimentModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Create New Experiment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experiment Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-primary focus:outline-none"
                  placeholder="Enter experiment name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-primary focus:outline-none"
                  rows={3}
                  placeholder="Describe your experiment..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Metric</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-primary focus:outline-none">
                    <option>Conversion Rate</option>
                    <option>Click-through Rate</option>
                    <option>Revenue per Visitor</option>
                    <option>Time on Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Traffic Split</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-primary focus:outline-none">
                    <option>50/50</option>
                    <option>70/30</option>
                    <option>80/20</option>
                    <option>90/10</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Create Experiment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <CreateExperimentModal />
      <motion.div
        className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical size={20} className="text-brand-primary" />
          <h2 className="text-xl font-semibold text-white">A/B Testing Framework</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'experiments', label: 'Experiments', icon: FlaskConical },
          { id: 'results', label: 'Results', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'experiments' && <ExperimentsTab />}
          {activeTab === 'results' && <ResultsTab />}
          {activeTab === 'settings' && (
            <div className="text-center text-gray-400 py-8">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p>Settings panel coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ABTestingFramework;
