/**
 * Organizational Intelligence Service - Phase 4 Implementation
 * 
 * This service implements cross-project analysis, organizational knowledge base management,
 * and automated asset evolution for the Ignition Process Asset Framework.
 */

import { 
  ProjectData, 
  ProcessAsset, 
  OrganizationalIntelligence, 
  CrossProjectAsset,
  OrganizationalMetrics,
  AssetEvolutionHistory,
  BenchmarkData,
  GitHubSettings 
} from '../types';
import { getRepoContents, getFileContent } from './githubService';

export interface OrganizationConfig {
  organizationName: string;
  githubSettings: GitHubSettings;
  analysisSettings: {
    syncInterval: number; // hours
    minProjectsForAsset: number;
    performanceThreshold: number;
    autoEvolutionEnabled: boolean;
  };
}

/**
 * Cross-Project Analysis Engine
 * Scans GitHub organization for Ignition projects and aggregates process assets
 */
export class CrossProjectAnalysisEngine {
  private config: OrganizationConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: OrganizationConfig) {
    this.config = config;
  }

  /**
   * Discovers all Ignition projects in the organization
   */
  async discoverIgnitionProjects(): Promise<string[]> {
    try {
      const repos = await this.getOrganizationRepositories();
      const ignitionProjects: string[] = [];

      for (const repo of repos) {
        try {
          // Check if repository has ignition-project.json
          await getFileContent(this.config.githubSettings, 'ignition-project.json');
          ignitionProjects.push(repo);
        } catch (error) {
          // Repository doesn't have Ignition project file, skip
          continue;
        }
      }

      return ignitionProjects;
    } catch (error) {
      console.error('Error discovering Ignition projects:', error);
      throw new Error('Failed to discover Ignition projects in organization');
    }
  }

  /**
   * Fetches and analyzes project data from all discovered repositories
   */
  async analyzeOrganizationalAssets(): Promise<OrganizationalIntelligence> {
    const projects = await this.discoverIgnitionProjects();
    const allProjectData: { [repoName: string]: ProjectData } = {};
    
    // Fetch project data from all repositories
    for (const repo of projects) {
      try {
        const projectDataContent = await getFileContent(
          { ...this.config.githubSettings, repoUrl: `https://github.com/${this.config.organizationName}/${repo}` },
          'ignition-project.json'
        );
        allProjectData[repo] = JSON.parse(projectDataContent);
      } catch (error) {
        console.warn(`Failed to fetch project data from ${repo}:`, error);
      }
    }

    // Aggregate and analyze assets
    const crossProjectAssets = this.aggregateAssets(allProjectData);
    const organizationalMetrics = this.calculateOrganizationalMetrics(allProjectData, crossProjectAssets);
    const assetEvolution = this.analyzeAssetEvolution(allProjectData);
    const benchmarkData = this.generateBenchmarkData(organizationalMetrics);

    return {
      organizationId: this.config.organizationName,
      lastSync: new Date().toISOString(),
      crossProjectAssets,
      organizationalMetrics,
      assetEvolution,
      benchmarkData
    };
  }

  /**
   * Aggregates process assets from all projects and identifies cross-project patterns
   */
  private aggregateAssets(allProjectData: { [repoName: string]: ProjectData }): CrossProjectAsset[] {
    const assetMap = new Map<string, CrossProjectAsset>();

    Object.entries(allProjectData).forEach(([repoName, projectData]) => {
      projectData.processAssets?.forEach(asset => {
        const key = this.generateAssetKey(asset);
        
        if (assetMap.has(key)) {
          // Asset exists across projects - merge data
          const existingAsset = assetMap.get(key)!;
          existingAsset.sourceProjects.push(repoName);
          
          // Merge usage data
          const usage = projectData.assetUsage?.[asset.id];
          if (usage) {
            existingAsset.crossProjectUsage[repoName] = {
              usageCount: usage.usageCount,
              successRate: usage.performanceMetrics?.successRate || 0,
              lastUsed: usage.lastUsed,
              adaptations: this.identifyAdaptations(asset, existingAsset)
            };
          }
        } else {
          // New cross-project asset
          const crossProjectAsset: CrossProjectAsset = {
            ...asset,
            sourceProjects: [repoName],
            crossProjectUsage: {},
            organizationalRank: 0,
            maturityScore: 0
          };

          const usage = projectData.assetUsage?.[asset.id];
          if (usage) {
            crossProjectAsset.crossProjectUsage[repoName] = {
              usageCount: usage.usageCount,
              successRate: usage.performanceMetrics?.successRate || 0,
              lastUsed: usage.lastUsed,
              adaptations: []
            };
          }

          assetMap.set(key, crossProjectAsset);
        }
      });
    });

    // Calculate organizational rankings and maturity scores
    const assets = Array.from(assetMap.values());
    return this.calculateAssetRankings(assets);
  }

  /**
   * Calculates organizational metrics from aggregated data
   */
  private calculateOrganizationalMetrics(
    allProjectData: { [repoName: string]: ProjectData },
    crossProjectAssets: CrossProjectAsset[]
  ): OrganizationalMetrics {
    const totalProjects = Object.keys(allProjectData).length;
    const totalAssets = crossProjectAssets.length;
    
    // Calculate average asset reuse
    const reuseData = crossProjectAssets.map(asset => asset.sourceProjects.length);
    const avgAssetReuse = reuseData.reduce((sum, count) => sum + count, 0) / totalAssets;

    // Calculate effectiveness distribution
    const effectivenessScores = crossProjectAssets.map(asset => 
      this.calculateAssetEffectiveness(asset)
    );
    
    const distribution = {
      excellent: effectivenessScores.filter(score => score >= 80).length,
      good: effectivenessScores.filter(score => score >= 60 && score < 80).length,
      fair: effectivenessScores.filter(score => score >= 40 && score < 60).length,
      poor: effectivenessScores.filter(score => score < 40).length
    };

    // Calculate organizational maturity level
    const avgEffectiveness = effectivenessScores.reduce((sum, score) => sum + score, 0) / effectivenessScores.length;
    const organizationalMaturityLevel = this.calculateMaturityLevel(avgEffectiveness, avgAssetReuse, totalProjects);

    return {
      totalProjects,
      totalAssets,
      avgAssetReuse,
      organizationalMaturityLevel,
      assetEffectivenessDistribution: distribution,
      trendAnalysis: {
        assetGrowthRate: 0, // TODO: Calculate from historical data
        reuseGrowthRate: 0, // TODO: Calculate from historical data
        qualityTrend: 'stable' // TODO: Calculate from historical data
      }
    };
  }

  /**
   * Analyzes asset evolution patterns across the organization
   */
  private analyzeAssetEvolution(allProjectData: { [repoName: string]: ProjectData }): AssetEvolutionHistory[] {
    // TODO: Implement asset evolution analysis
    // This would track how assets change over time across projects
    return [];
  }

  /**
   * Generates benchmark data for organizational comparison
   */
  private generateBenchmarkData(metrics: OrganizationalMetrics): BenchmarkData {
    // TODO: Implement industry benchmarking
    // This would compare against industry standards and best practices
    return {
      industryAverages: {
        assetReuseRate: 2.5,
        avgSuccessRate: 75,
        avgTimeToImplement: 120
      },
      organizationRanking: {
        percentile: 75,
        category: 'above_average'
      },
      competitiveAnalysis: {
        strengths: ['High asset reuse rate', 'Strong documentation practices'],
        improvementAreas: ['Asset evolution tracking', 'Cross-team collaboration'],
        recommendations: ['Implement automated asset refinement', 'Establish asset governance board']
      }
    };
  }

  // Helper methods
  private async getOrganizationRepositories(): Promise<string[]> {
    // TODO: Implement GitHub API call to get organization repositories
    // For now, return mock data
    return ['project-alpha', 'project-beta', 'project-gamma'];
  }

  private generateAssetKey(asset: ProcessAsset): string {
    // Generate a key based on asset content similarity
    return `${asset.type}-${asset.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private identifyAdaptations(asset: ProcessAsset, existingAsset: CrossProjectAsset): string[] {
    // TODO: Implement adaptation identification logic
    return [];
  }

  private calculateAssetRankings(assets: CrossProjectAsset[]): CrossProjectAsset[] {
    // Sort by usage and effectiveness, assign rankings
    assets.forEach((asset, index) => {
      asset.organizationalRank = index + 1;
      asset.maturityScore = this.calculateAssetEffectiveness(asset);
    });
    
    return assets.sort((a, b) => b.maturityScore - a.maturityScore);
  }

  private calculateAssetEffectiveness(asset: CrossProjectAsset): number {
    const usageData = Object.values(asset.crossProjectUsage);
    if (usageData.length === 0) return 0;

    const avgSuccessRate = usageData.reduce((sum, usage) => sum + usage.successRate, 0) / usageData.length;
    const reuseScore = Math.min(asset.sourceProjects.length * 20, 100);
    
    return Math.round((avgSuccessRate * 0.7) + (reuseScore * 0.3));
  }

  private calculateMaturityLevel(avgEffectiveness: number, avgReuse: number, projectCount: number): number {
    // Simple maturity calculation - can be enhanced
    if (avgEffectiveness >= 80 && avgReuse >= 3 && projectCount >= 10) return 5;
    if (avgEffectiveness >= 70 && avgReuse >= 2.5 && projectCount >= 5) return 4;
    if (avgEffectiveness >= 60 && avgReuse >= 2 && projectCount >= 3) return 3;
    if (avgEffectiveness >= 50 && avgReuse >= 1.5) return 2;
    return 1;
  }
}

/**
 * Service for managing organizational intelligence data
 */
export class OrganizationalIntelligenceService {
  private analysisEngine: CrossProjectAnalysisEngine;

  constructor(config: OrganizationConfig) {
    this.analysisEngine = new CrossProjectAnalysisEngine(config);
  }

  /**
   * Performs full organizational analysis and returns intelligence data
   */
  async performOrganizationalAnalysis(): Promise<OrganizationalIntelligence> {
    return await this.analysisEngine.analyzeOrganizationalAssets();
  }

  /**
   * Updates project data with organizational intelligence
   */
  async enrichProjectWithOrganizationalData(projectData: ProjectData): Promise<ProjectData> {
    const orgIntelligence = await this.performOrganizationalAnalysis();
    
    return {
      ...projectData,
      organizationalData: orgIntelligence
    };
  }
}
