/**
 * Interactive Dashboard Widget - UX Innovation Component
 * 
 * Advanced interactive widget with animations, hover effects, drill-down capabilities,
 * and real-time data updates using Framer Motion and modern UX patterns.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Maximize2, 
  RefreshCw, 
  Filter,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  description?: string;
  lastUpdated?: Date;
  drillDownData?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

interface InteractiveDashboardWidgetProps {
  data: WidgetData;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed';
  onDrillDown?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const InteractiveDashboardWidget: React.FC<InteractiveDashboardWidgetProps> = ({
  data,
  size = 'medium',
  variant = 'default',
  onDrillDown,
  onRefresh,
  isLoading = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-refresh simulation
  useEffect(() => {
    if (isRefreshing) {
      const timer = setTimeout(() => setIsRefreshing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.(data.id);
  };

  const handleDrillDown = () => {
    if (data.drillDownData && data.drillDownData.length > 0) {
      setShowDrillDown(!showDrillDown);
    }
    onDrillDown?.(data.id);
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      case 'info':
        return <Info size={16} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4 min-h-[120px]';
      case 'large':
        return 'p-8 min-h-[200px]';
      default:
        return 'p-6 min-h-[160px]';
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const valueVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  const drillDownVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={widgetRef}
      className={`
        bg-gray-900 border border-gray-800 rounded-lg 
        hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10
        transition-all duration-200 cursor-pointer relative overflow-hidden
        ${getSizeClasses()} ${className}
      `}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleDrillDown}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {(isLoading || isRefreshing) && (
          <motion.div
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={24} className="text-brand-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="text-sm font-medium text-gray-300">{data.title}</h3>
        </div>
        
        <motion.div 
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={14} className="text-gray-400" />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 transition-colors">
            <MoreHorizontal size={14} className="text-gray-400" />
          </button>
        </motion.div>
      </div>

      {/* Main Value */}
      <motion.div 
        className="mb-4"
        variants={valueVariants}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{data.value}</span>
          {data.trend && data.trendPercentage && (
            <motion.div 
              className={`flex items-center gap-1 text-sm ${
                data.trend === 'up' ? 'text-green-400' : 
                data.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {getTrendIcon()}
              <span>{data.trendPercentage}%</span>
            </motion.div>
          )}
        </div>
        
        {data.description && (
          <motion.p 
            className="text-xs text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {data.description}
          </motion.p>
        )}
      </motion.div>

      {/* Last Updated */}
      {data.lastUpdated && (
        <motion.div 
          className="flex items-center gap-1 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Clock size={12} />
          <span>Updated {data.lastUpdated.toLocaleTimeString()}</span>
        </motion.div>
      )}

      {/* Drill Down Indicator */}
      {data.drillDownData && data.drillDownData.length > 0 && (
        <motion.div 
          className="absolute bottom-2 right-2"
          animate={{ 
            rotate: showDrillDown ? 180 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      )}

      {/* Drill Down Content */}
      <AnimatePresence>
        {showDrillDown && data.drillDownData && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-800"
            variants={drillDownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {data.drillDownData.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-gray-400">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{item.value}</span>
                    {item.trend === 'up' && <TrendingUp size={12} className="text-green-400" />}
                    {item.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default InteractiveDashboardWidget;
