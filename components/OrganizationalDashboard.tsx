/**
 * Organizational Dashboard & Analytics - Phase 4 Final Component
 * 
 * Comprehensive dashboard showing cross-project insights, asset effectiveness trends,
 * organizational maturity metrics, and knowledge base health indicators.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ProjectData, 
  OrganizationalIntelligence,
  CrossProjectAsset,
  OrganizationalMetrics 
} from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Activity,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface OrganizationalDashboardProps {
  projectData: ProjectData;
  organizationalData?: OrganizationalIntelligence;
  onRefreshData?: () => void;
}

const OrganizationalDashboard: React.FC<OrganizationalDashboardProps> = ({
  projectData,
  organizationalData,
  onRefreshData
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'effectiveness' | 'reuse' | 'maturity' | 'growth'>('effectiveness');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate organizational metrics
  const metrics = useMemo(() => {
    if (!organizationalData) {
      // Generate mock data for demonstration
      return {
        totalProjects: 12,
        totalAssets: 156,
        avgAssetReuse: 3.2,
        organizationalMaturityLevel: 4,
        assetEffectivenessDistribution: {
          excellent: 45,
          good: 67,
          fair: 32,
          poor: 12
        },
        trendAnalysis: {
          assetGrowthRate: 15.3,
          reuseGrowthRate: 8.7,
          qualityTrend: 'improving' as const
        }
      };
    }
    return organizationalData.organizationalMetrics;
  }, [organizationalData]);

  // Top performing assets
  const topAssets = useMemo(() => {
    if (!organizationalData?.crossProjectAssets) {
      // Mock data
      return [
        { id: 'ASSET-001', name: 'Authentication Service Blueprint', maturityScore: 95, sourceProjects: ['proj-a', 'proj-b', 'proj-c'], type: 'Solution Blueprint' },
        { id: 'ASSET-002', name: 'API Gateway Pattern', maturityScore: 92, sourceProjects: ['proj-a', 'proj-d'], type: 'Solution Blueprint' },
        { id: 'ASSET-003', name: 'Database Migration Template', maturityScore: 88, sourceProjects: ['proj-b', 'proj-c', 'proj-e'], type: 'Solution Blueprint' },
        { id: 'ASSET-004', name: 'Security Compliance Checklist', maturityScore: 85, sourceProjects: ['proj-a', 'proj-b'], type: 'Solution Blueprint' },
        { id: 'ASSET-005', name: 'CI/CD Pipeline Template', maturityScore: 82, sourceProjects: ['proj-c', 'proj-d', 'proj-e'], type: 'Solution Blueprint' }
      ];
    }
    return organizationalData.crossProjectAssets
      .sort((a, b) => b.maturityScore - a.maturityScore)
      .slice(0, 5);
  }, [organizationalData]);

  // Knowledge base health indicators
  const healthIndicators = useMemo(() => {
    return {
      assetCoverage: 87,
      documentationQuality: 92,
      assetFreshness: 78,
      userEngagement: 85,
      complianceScore: 94
    };
  }, []);

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', suffix = '' }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}{suffix}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {change > 0 ? <ArrowUp size={14} /> : change < 0 ? <ArrowDown size={14} /> : <Minus size={14} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-900/50 border border-${color}-700`}>
          <Icon size={24} className={`text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const EffectivenessChart = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Asset Effectiveness Distribution</h3>
      <div className="space-y-4">
        {Object.entries(metrics.assetEffectivenessDistribution).map(([level, count]) => {
          const percentage = (count / metrics.totalAssets) * 100;
          const colors = {
            excellent: 'bg-green-500',
            good: 'bg-blue-500',
            fair: 'bg-yellow-500',
            poor: 'bg-red-500'
          };
          
          return (
            <div key={level} className="flex items-center gap-4">
              <div className="w-20 text-sm text-gray-400 capitalize">{level}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${colors[level as keyof typeof colors]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-16 text-sm text-gray-300 text-right">{count} assets</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TopAssetsTable = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Performing Assets</h3>
      <div className="space-y-3">
        {topAssets.map((asset, index) => (
          <div key={asset.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-brand-primary rounded-full text-white text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white">{asset.name}</h4>
              <p className="text-xs text-gray-400">Used in {asset.sourceProjects.length} projects</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-400">{asset.maturityScore}%</div>
              <div className="text-xs text-gray-400">Maturity</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const HealthIndicators = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Knowledge Base Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(healthIndicators).map(([indicator, score]) => (
          <div key={indicator} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-300 capitalize">{indicator.replace(/([A-Z])/g, ' $1').trim()}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm text-white w-8">{score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MaturityLevelIndicator = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Organizational Maturity</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray={`${(metrics.organizationalMaturityLevel / 5) * 100}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{metrics.organizationalMaturityLevel}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          {metrics.organizationalMaturityLevel >= 4 ? 'Advanced' : 
           metrics.organizationalMaturityLevel >= 3 ? 'Intermediate' : 
           metrics.organizationalMaturityLevel >= 2 ? 'Developing' : 'Initial'} Organization
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Based on asset reuse, quality, and process maturity
        </p>
      </div>
    </div>
  );

  const TrendAnalysis = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Growth Trends</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" size={20} />
            <span className="text-sm text-gray-300">Asset Growth Rate</span>
          </div>
          <span className="text-lg font-semibold text-green-400">+{metrics.trendAnalysis.assetGrowthRate}%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-400" size={20} />
            <span className="text-sm text-gray-300">Reuse Growth Rate</span>
          </div>
          <span className="text-lg font-semibold text-blue-400">+{metrics.trendAnalysis.reuseGrowthRate}%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="text-yellow-400" size={20} />
            <span className="text-sm text-gray-300">Quality Trend</span>
          </div>
          <span className={`text-lg font-semibold capitalize ${
            metrics.trendAnalysis.qualityTrend === 'improving' ? 'text-green-400' :
            metrics.trendAnalysis.qualityTrend === 'stable' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.trendAnalysis.qualityTrend}
          </span>
        </div>
      </div>
    </div>
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizational Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Cross-project insights, asset effectiveness trends, and organizational maturity metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          change={8}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Assets"
          value={metrics.totalAssets}
          change={15}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Avg Asset Reuse"
          value={metrics.avgAssetReuse.toFixed(1)}
          change={12}
          icon={Activity}
          color="purple"
          suffix="x"
        />
        <MetricCard
          title="Maturity Level"
          value={metrics.organizationalMaturityLevel}
          change={5}
          icon={Award}
          color="yellow"
          suffix="/5"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EffectivenessChart />
        <MaturityLevelIndicator />
        <TopAssetsTable />
        <TrendAnalysis />
      </div>

      {/* Health Indicators */}
      <HealthIndicators />
    </div>
  );
};

export default OrganizationalDashboard;
