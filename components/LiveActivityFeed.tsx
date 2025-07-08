/**
 * Live Activity Feed - Real-Time Updates Component
 * 
 * Real-time activity feed with live updates, progress indicators,
 * and interactive activity timeline using WebSocket simulation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap,
  GitCommit,
  FileText,
  TestTube,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

export interface ActivityEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'test_result' | 'deployment' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    relatedId?: string;
    progress?: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
}

interface LiveActivityFeedProps {
  activities: ActivityEvent[];
  onActivityClick?: (activity: ActivityEvent) => void;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
  className?: string;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  activities,
  onActivityClick,
  maxItems = 50,
  autoRefresh = true,
  refreshInterval = 5000,
  showFilters = true,
  className = ''
}) => {
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>(activities);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(autoRefresh);
  const feedRef = useRef<HTMLDivElement>(null);
  const [newActivityCount, setNewActivityCount] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive || isPaused) return;

    const interval = setInterval(() => {
      // Simulate new activity (in real app, this would come from WebSocket)
      const simulatedActivity: ActivityEvent = {
        id: `activity-${Date.now()}`,
        type: ['user_action', 'system_event', 'test_result'][Math.floor(Math.random() * 3)] as any,
        title: [
          'New requirement added',
          'Test case executed',
          'System backup completed',
          'User logged in',
          'Configuration updated'
        ][Math.floor(Math.random() * 5)],
        description: 'Simulated real-time activity event',
        timestamp: new Date(),
        user: {
          name: ['Alice', 'Bob', 'Charlie', 'Diana'][Math.floor(Math.random() * 4)]
        },
        metadata: {
          category: ['Development', 'Testing', 'System', 'User'][Math.floor(Math.random() * 4)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: ['completed', 'in_progress', 'pending'][Math.floor(Math.random() * 3)] as any
        }
      };

      setNewActivityCount(prev => prev + 1);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, isPaused, refreshInterval]);

  // Filter activities
  useEffect(() => {
    let filtered = activities;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered.slice(0, maxItems));
  }, [activities, selectedFilter, searchQuery, maxItems]);

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'user_action':
        return <User size={16} className="text-blue-400" />;
      case 'system_event':
        return <Settings size={16} className="text-green-400" />;
      case 'test_result':
        return <TestTube size={16} className="text-purple-400" />;
      case 'deployment':
        return <GitCommit size={16} className="text-orange-400" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'info':
        return <Info size={16} className="text-blue-400" />;
      default:
        return <Activity size={16} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-600';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const scrollToTop = () => {
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setNewActivityCount(0);
  };

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-brand-primary" />
            <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
            {isLive && (
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
              onClick={() => setIsLive(!isLive)}
              className={`p-2 rounded transition-colors ${
                isLive ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800 text-gray-400'
              }`}
              title={isLive ? 'Stop Live Updates' : 'Start Live Updates'}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:border-brand-primary focus:outline-none"
              >
                <option value="all">All Activities</option>
                <option value="user_action">User Actions</option>
                <option value="system_event">System Events</option>
                <option value="test_result">Test Results</option>
                <option value="deployment">Deployments</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* New Activity Indicator */}
      <AnimatePresence>
        {newActivityCount > 0 && (
          <motion.button
            className="w-full bg-brand-primary/20 border-b border-brand-primary/30 px-6 py-2 text-brand-primary text-sm hover:bg-brand-primary/30 transition-colors"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {newActivityCount} new activit{newActivityCount === 1 ? 'y' : 'ies'} • Click to view
          </motion.button>
        )}
      </AnimatePresence>

      {/* Activity List */}
      <div
        ref={feedRef}
        className="max-h-96 overflow-y-auto"
      >
        <AnimatePresence>
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>No activities found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className={`p-4 hover:bg-gray-800/50 cursor-pointer border-l-4 ${getPriorityColor(activity.metadata?.priority)} transition-colors`}
                  onClick={() => onActivityClick?.(activity)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {activity.metadata?.status && (
                            <span className={`capitalize ${getStatusColor(activity.metadata.status)}`}>
                              {activity.metadata.status}
                            </span>
                          )}
                          <Clock size={12} />
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs">
                          {activity.user && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <User size={12} />
                              <span>{activity.user.name}</span>
                            </div>
                          )}
                          {activity.metadata?.category && (
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              {activity.metadata.category}
                            </span>
                          )}
                        </div>
                        
                        {activity.metadata?.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                              <motion.div
                                className="bg-brand-primary h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${activity.metadata.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {activity.metadata.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-center">
        <span className="text-xs text-gray-500">
          Showing {filteredActivities.length} of {activities.length} activities
        </span>
      </div>
    </motion.div>
  );
};

export default LiveActivityFeed;
