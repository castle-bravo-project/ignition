/**
 * Real-Time Progress Indicator - Live Updates Component
 * 
 * Advanced progress indicators with real-time updates, animations,
 * and multiple visualization styles for different types of progress tracking.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  Target,
  Activity,
  BarChart3,
  Loader,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export interface ProgressData {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  type: 'linear' | 'circular' | 'stepped' | 'gauge';
  status: 'active' | 'completed' | 'paused' | 'error' | 'warning';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  estimatedCompletion?: Date;
  metadata?: {
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    steps?: Array<{
      label: string;
      completed: boolean;
      current?: boolean;
    }>;
  };
}

interface RealTimeProgressIndicatorProps {
  progressItems: ProgressData[];
  onProgressClick?: (item: ProgressData) => void;
  autoUpdate?: boolean;
  updateInterval?: number;
  showDetails?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

const RealTimeProgressIndicator: React.FC<RealTimeProgressIndicatorProps> = ({
  progressItems,
  onProgressClick,
  autoUpdate = true,
  updateInterval = 2000,
  showDetails = true,
  layout = 'grid',
  className = ''
}) => {
  const [items, setItems] = useState<ProgressData[]>(progressItems);
  const [isPaused, setIsPaused] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoUpdate || isPaused) return;

    const interval = setInterval(() => {
      setItems(prevItems => 
        prevItems.map(item => {
          if (item.status === 'completed' || item.status === 'error') return item;
          
          const increment = Math.random() * 5; // Random increment
          const newCurrent = Math.min(item.current + increment, item.target);
          const newStatus = newCurrent >= item.target ? 'completed' : item.status;
          
          return {
            ...item,
            current: newCurrent,
            status: newStatus,
            trend: increment > 2 ? 'up' : increment < 1 ? 'down' : 'stable',
            trendValue: increment
          };
        })
      );
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, isPaused, updateInterval]);

  const getPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: ProgressData['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'warning':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getProgressColor = (status: ProgressData['status']) => {
    switch (status) {
      case 'active':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-green-400" />;
      case 'down':
        return <TrendingUp size={12} className="text-red-400 rotate-180" />;
      default:
        return null;
    }
  };

  const LinearProgress = ({ item }: { item: ProgressData }) => {
    const percentage = getPercentage(item.current, item.target);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{item.label}</span>
          <div className="flex items-center gap-2 text-sm">
            {item.trend && getTrendIcon(item.trend)}
            <span className="text-gray-400">
              {item.current.toFixed(1)}{item.unit} / {item.target}{item.unit}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: getProgressColor(item.status) }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="absolute right-0 -top-6 text-xs text-gray-400">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  const CircularProgress = ({ item }: { item: ProgressData }) => {
    const percentage = getPercentage(item.current, item.target);
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={getProgressColor(item.status)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <span className="text-sm font-medium text-white text-center">{item.label}</span>
        <span className="text-xs text-gray-400">
          {item.current.toFixed(1)}{item.unit} / {item.target}{item.unit}
        </span>
      </div>
    );
  };

  const SteppedProgress = ({ item }: { item: ProgressData }) => {
    const steps = item.metadata?.steps || [];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{item.label}</span>
          <span className="text-xs text-gray-400">
            {steps.filter(s => s.completed).length} / {steps.length} steps
          </span>
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                step.current ? 'bg-brand-primary/20 border border-brand-primary/30' : 
                step.completed ? 'bg-green-500/10' : 'bg-gray-800'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500' : 
                step.current ? 'bg-brand-primary' : 'bg-gray-600'
              }`}>
                {step.completed && <CheckCircle size={12} className="text-white" />}
                {step.current && !step.completed && (
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-green-400' : 
                step.current ? 'text-white' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const GaugeProgress = ({ item }: { item: ProgressData }) => {
    const percentage = getPercentage(item.current, item.target);
    const angle = (percentage / 100) * 180 - 90;
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-32 h-16">
          <svg className="w-32 h-16" viewBox="0 0 128 64">
            <path
              d="M 10 54 A 54 54 0 0 1 118 54"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <motion.path
              d="M 10 54 A 54 54 0 0 1 118 54"
              stroke={getProgressColor(item.status)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="170"
              initial={{ strokeDashoffset: 170 }}
              animate={{ strokeDashoffset: 170 - (percentage / 100) * 170 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.line
              x1="64"
              y1="54"
              x2="64"
              y2="20"
              stroke={getProgressColor(item.status)}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ rotate: -90 }}
              animate={{ rotate: angle }}
              style={{ transformOrigin: '64px 54px' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <span className="text-lg font-bold text-white">{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <span className="text-sm font-medium text-white text-center">{item.label}</span>
        <span className="text-xs text-gray-400">
          {item.current.toFixed(1)}{item.unit} / {item.target}{item.unit}
        </span>
      </div>
    );
  };

  const renderProgress = (item: ProgressData) => {
    switch (item.type) {
      case 'circular':
        return <CircularProgress item={item} />;
      case 'stepped':
        return <SteppedProgress item={item} />;
      case 'gauge':
        return <GaugeProgress item={item} />;
      default:
        return <LinearProgress item={item} />;
    }
  };

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-brand-primary" />
          <h3 className="text-lg font-semibold text-white">Real-Time Progress</h3>
          {autoUpdate && !isPaused && (
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded transition-colors ${
              isPaused ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-gray-800 text-gray-400'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          
          <button
            onClick={() => setItems(progressItems)}
            className="p-2 rounded hover:bg-gray-800 text-gray-400 transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Progress Items */}
      <div className={`${
        layout === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-6'
      }`}>
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-brand-primary/50 cursor-pointer transition-colors"
              onClick={() => onProgressClick?.(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                  <span className="capitalize">{item.status}</span>
                </div>
                {item.estimatedCompletion && item.status === 'active' && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>ETA: {item.estimatedCompletion.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {/* Progress Visualization */}
              {renderProgress(item)}

              {/* Details */}
              {showDetails && item.metadata?.description && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">{item.metadata.description}</p>
                  {item.metadata.category && (
                    <span className="inline-block mt-2 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {item.metadata.category}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RealTimeProgressIndicator;
