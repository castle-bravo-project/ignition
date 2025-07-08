import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Users, Zap, BarChart3, Activity } from 'lucide-react';
import { ProcessAsset, ProjectData } from '../types';

interface AssetAnalyticsCardProps {
  asset: ProcessAsset;
  projectData: ProjectData;
  className?: string;
}

interface AssetMetrics {
  usageCount: number;
  lastUsed: string;
  generatedItems: number;
  successRate: number;
  avgTimeToImplement: number;
  popularityRank: number;
  trendDirection: 'up' | 'down' | 'stable';
  effectivenessScore: number;
}

const AssetAnalyticsCard: React.FC<AssetAnalyticsCardProps> = ({
  asset,
  projectData,
  className = ''
}) => {
  const calculateMetrics = (): AssetMetrics => {
    const usage = projectData.assetUsage?.[asset.id];
    const allAssets = projectData.processAssets || [];
    const allUsage = Object.values(projectData.assetUsage || {});
    
    // Calculate usage metrics
    const usageCount = usage?.usageCount || 0;
    const lastUsed = usage?.lastUsed || asset.updatedAt;
    const generatedItems = usage?.generatedItems?.length || 0;
    
    // Calculate success rate (simplified - based on generated items vs usage)
    const successRate = usageCount > 0 ? Math.min((generatedItems / usageCount) * 100, 100) : 0;
    
    // Calculate average time to implement (mock calculation)
    const avgTimeToImplement = Math.random() * 5 + 1; // 1-6 hours mock
    
    // Calculate popularity rank
    const sortedByUsage = allUsage.sort((a, b) => b.usageCount - a.usageCount);
    const popularityRank = sortedByUsage.findIndex(u => u.usageCount === usageCount) + 1;
    
    // Calculate trend direction (mock - based on recent usage)
    const recentUsage = usage?.generatedItems?.filter(item => 
      new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )?.length || 0;
    const trendDirection: 'up' | 'down' | 'stable' = 
      recentUsage > 2 ? 'up' : recentUsage === 0 ? 'down' : 'stable';
    
    // Calculate effectiveness score (composite metric)
    const effectivenessScore = Math.min(
      (successRate * 0.4) + 
      (Math.min(usageCount / 10, 1) * 30) + 
      (Math.min(generatedItems / 5, 1) * 30), 
      100
    );
    
    return {
      usageCount,
      lastUsed,
      generatedItems,
      successRate,
      avgTimeToImplement,
      popularityRank,
      trendDirection,
      effectivenessScore
    };
  };

  const metrics = calculateMetrics();
  const TrendIcon = metrics.trendDirection === 'up' ? TrendingUp : 
                   metrics.trendDirection === 'down' ? TrendingDown : Activity;
  
  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEffectivenessBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm mb-1">{asset.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2">{asset.description}</p>
        </div>
        <div className={`px-2 py-1 rounded-md border text-xs font-medium ${getEffectivenessBg(metrics.effectivenessScore)}`}>
          <span className={getEffectivenessColor(metrics.effectivenessScore)}>
            {metrics.effectivenessScore.toFixed(0)}% Effective
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{metrics.usageCount}</span>
            <TrendIcon size={12} className={
              metrics.trendDirection === 'up' ? 'text-green-400' :
              metrics.trendDirection === 'down' ? 'text-red-400' : 'text-gray-400'
            } />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-purple-400" />
            <span className="text-xs text-gray-400">Generated</span>
          </div>
          <span className="text-lg font-bold text-white">{metrics.generatedItems}</span>
        </div>

        <div className="bg-gray-900/50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-green-400" />
            <span className="text-xs text-gray-400">Success Rate</span>
          </div>
          <span className="text-lg font-bold text-white">{metrics.successRate.toFixed(0)}%</span>
        </div>

        <div className="bg-gray-900/50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-orange-400" />
            <span className="text-xs text-gray-400">Rank</span>
          </div>
          <span className="text-lg font-bold text-white">#{metrics.popularityRank}</span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Last used {new Date(metrics.lastUsed).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={12} />
          <span>~{metrics.avgTimeToImplement.toFixed(1)}h avg</span>
        </div>
      </div>
    </div>
  );
};

export default AssetAnalyticsCard;
