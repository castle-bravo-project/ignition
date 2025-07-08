/**
 * Asset Performance Tracking Service - Phase 4 Implementation
 * 
 * This service handles detailed performance tracking, metrics calculation,
 * and feedback collection for process assets.
 */

import { ProjectData, ProcessAsset } from '../types';

export interface AssetUsageEvent {
  assetId: string;
  eventType: 'applied' | 'generated' | 'feedback' | 'completed';
  timestamp: string;
  context: {
    itemType: 'requirement' | 'risk' | 'test' | 'ci';
    itemId: string;
    userId?: string;
    sessionId?: string;
  };
  metrics?: {
    timeToImplement?: number;
    userFeedback?: 'positive' | 'negative' | 'neutral';
    implementationSuccess?: boolean;
    associatedBugs?: number;
  };
}

export interface PerformanceCalculationResult {
  avgTimeToImplement: number;
  successRate: number;
  bugRate: number;
  userSatisfactionScore: number;
  lastCalculated: string;
}

/**
 * Service for tracking and analyzing asset performance
 */
export class AssetPerformanceService {
  
  /**
   * Records an asset usage event
   */
  static recordAssetUsage(
    projectData: ProjectData, 
    event: AssetUsageEvent
  ): ProjectData {
    const updatedData = { ...projectData };
    
    // Initialize asset usage if it doesn't exist
    if (!updatedData.assetUsage[event.assetId]) {
      updatedData.assetUsage[event.assetId] = {
        usageCount: 0,
        lastUsed: event.timestamp,
        generatedItems: [],
        performanceMetrics: {
          avgTimeToImplement: 0,
          successRate: 0,
          bugRate: 0,
          userSatisfactionScore: 0,
          lastCalculated: event.timestamp
        },
        feedbackHistory: []
      };
    }

    const assetUsage = updatedData.assetUsage[event.assetId];

    // Update based on event type
    switch (event.eventType) {
      case 'applied':
        assetUsage.usageCount++;
        assetUsage.lastUsed = event.timestamp;
        break;

      case 'generated':
        assetUsage.generatedItems.push({
          type: event.context.itemType,
          id: event.context.itemId,
          createdAt: event.timestamp,
          timeToImplement: event.metrics?.timeToImplement,
          associatedBugs: event.metrics?.associatedBugs,
          userFeedback: event.metrics?.userFeedback,
          implementationSuccess: event.metrics?.implementationSuccess
        });
        break;

      case 'feedback':
        if (event.metrics?.userFeedback) {
          assetUsage.feedbackHistory.push({
            timestamp: event.timestamp,
            feedback: event.metrics.userFeedback,
            context: `${event.context.itemType}:${event.context.itemId}`,
            userId: event.context.userId
          });
        }
        break;

      case 'completed':
        // Update the generated item with completion metrics
        const item = assetUsage.generatedItems.find(
          item => item.id === event.context.itemId
        );
        if (item && event.metrics) {
          item.timeToImplement = event.metrics.timeToImplement;
          item.associatedBugs = event.metrics.associatedBugs;
          item.implementationSuccess = event.metrics.implementationSuccess;
        }
        break;
    }

    // Recalculate performance metrics
    assetUsage.performanceMetrics = this.calculatePerformanceMetrics(assetUsage);

    return updatedData;
  }

  /**
   * Calculates comprehensive performance metrics for an asset
   */
  static calculatePerformanceMetrics(assetUsage: any): PerformanceCalculationResult {
    const { generatedItems, feedbackHistory } = assetUsage;
    
    // Calculate average time to implement
    const implementationTimes = generatedItems
      .filter((item: any) => item.timeToImplement !== undefined)
      .map((item: any) => item.timeToImplement);
    
    const avgTimeToImplement = implementationTimes.length > 0
      ? implementationTimes.reduce((sum: number, time: number) => sum + time, 0) / implementationTimes.length
      : 0;

    // Calculate success rate
    const completedItems = generatedItems.filter((item: any) => item.implementationSuccess !== undefined);
    const successfulItems = completedItems.filter((item: any) => item.implementationSuccess === true);
    const successRate = completedItems.length > 0
      ? (successfulItems.length / completedItems.length) * 100
      : 0;

    // Calculate bug rate
    const itemsWithBugData = generatedItems.filter((item: any) => item.associatedBugs !== undefined);
    const totalBugs = itemsWithBugData.reduce((sum: number, item: any) => sum + (item.associatedBugs || 0), 0);
    const bugRate = itemsWithBugData.length > 0
      ? totalBugs / itemsWithBugData.length
      : 0;

    // Calculate user satisfaction score
    const positiveFeedback = feedbackHistory.filter((f: any) => f.feedback === 'positive').length;
    const negativeFeedback = feedbackHistory.filter((f: any) => f.feedback === 'negative').length;
    const totalFeedback = feedbackHistory.length;
    
    const userSatisfactionScore = totalFeedback > 0
      ? ((positiveFeedback - negativeFeedback) / totalFeedback) * 100
      : 0;

    return {
      avgTimeToImplement,
      successRate,
      bugRate,
      userSatisfactionScore,
      lastCalculated: new Date().toISOString()
    };
  }

  /**
   * Identifies underperforming assets that need attention
   */
  static identifyUnderperformingAssets(
    projectData: ProjectData,
    thresholds: {
      minSuccessRate: number;
      maxBugRate: number;
      minSatisfactionScore: number;
      minUsageCount: number;
    } = {
      minSuccessRate: 70,
      maxBugRate: 2,
      minSatisfactionScore: 0,
      minUsageCount: 3
    }
  ): ProcessAsset[] {
    const underperformingAssets: ProcessAsset[] = [];

    Object.entries(projectData.assetUsage).forEach(([assetId, usage]) => {
      const asset = projectData.processAssets.find(a => a.id === assetId);
      if (!asset || usage.usageCount < thresholds.minUsageCount) return;

      const metrics = usage.performanceMetrics;
      const isUnderperforming = 
        metrics.successRate < thresholds.minSuccessRate ||
        metrics.bugRate > thresholds.maxBugRate ||
        metrics.userSatisfactionScore < thresholds.minSatisfactionScore;

      if (isUnderperforming) {
        underperformingAssets.push(asset);
      }
    });

    return underperformingAssets;
  }

  /**
   * Generates performance report for an asset
   */
  static generateAssetPerformanceReport(
    asset: ProcessAsset,
    projectData: ProjectData
  ): {
    asset: ProcessAsset;
    metrics: PerformanceCalculationResult;
    insights: string[];
    recommendations: string[];
  } {
    const usage = projectData.assetUsage[asset.id];
    if (!usage) {
      return {
        asset,
        metrics: {
          avgTimeToImplement: 0,
          successRate: 0,
          bugRate: 0,
          userSatisfactionScore: 0,
          lastCalculated: new Date().toISOString()
        },
        insights: ['No usage data available'],
        recommendations: ['Promote asset usage across the organization']
      };
    }

    const metrics = usage.performanceMetrics;
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Generate insights
    if (metrics.successRate >= 80) {
      insights.push('High success rate indicates excellent asset quality');
    } else if (metrics.successRate < 50) {
      insights.push('Low success rate suggests asset needs improvement');
      recommendations.push('Review asset content and update based on failure patterns');
    }

    if (metrics.avgTimeToImplement > 0) {
      if (metrics.avgTimeToImplement > 240) { // 4 hours
        insights.push('Implementation time is above average');
        recommendations.push('Consider breaking down asset into smaller, more focused components');
      } else if (metrics.avgTimeToImplement < 60) { // 1 hour
        insights.push('Quick implementation time indicates good asset design');
      }
    }

    if (metrics.bugRate > 1) {
      insights.push('Higher than expected bug rate');
      recommendations.push('Review asset for potential quality issues or missing guidance');
    }

    if (metrics.userSatisfactionScore > 50) {
      insights.push('Positive user feedback indicates asset value');
    } else if (metrics.userSatisfactionScore < -20) {
      insights.push('Negative user feedback requires immediate attention');
      recommendations.push('Gather detailed user feedback and revise asset accordingly');
    }

    // Usage pattern insights
    if (usage.usageCount > 10) {
      insights.push('High usage indicates asset popularity and utility');
    } else if (usage.usageCount < 3) {
      insights.push('Low usage may indicate discoverability or relevance issues');
      recommendations.push('Improve asset discoverability and relevance');
    }

    return {
      asset,
      metrics,
      insights,
      recommendations
    };
  }

  /**
   * Tracks A/B testing results for asset variations
   */
  static trackABTestResult(
    projectData: ProjectData,
    testId: string,
    assetId: string,
    variant: 'A' | 'B',
    outcome: 'success' | 'failure',
    metrics: {
      timeToImplement?: number;
      userSatisfaction?: number;
      bugCount?: number;
    }
  ): ProjectData {
    // TODO: Implement A/B testing tracking
    // This would store test results and help determine which asset variants perform better
    return projectData;
  }

  /**
   * Exports performance data for external analysis
   */
  static exportPerformanceData(projectData: ProjectData): {
    exportTimestamp: string;
    projectId: string;
    assets: Array<{
      assetId: string;
      assetName: string;
      assetType: string;
      metrics: PerformanceCalculationResult;
      usageCount: number;
      generatedItemsCount: number;
      feedbackCount: number;
    }>;
  } {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      projectId: projectData.projectName,
      assets: [] as any[]
    };

    projectData.processAssets.forEach(asset => {
      const usage = projectData.assetUsage[asset.id];
      if (usage) {
        exportData.assets.push({
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          metrics: usage.performanceMetrics,
          usageCount: usage.usageCount,
          generatedItemsCount: usage.generatedItems.length,
          feedbackCount: usage.feedbackHistory.length
        });
      }
    });

    return exportData;
  }
}
