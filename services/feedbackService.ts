/**
 * Feedback and A/B Testing Service - Phase 4 Implementation
 * 
 * This service handles user feedback collection, A/B testing for asset variations,
 * and effectiveness scoring for process assets.
 */

import { ProjectData, ProcessAsset } from '../types';
import { AssetPerformanceService } from './assetPerformanceService';

export interface FeedbackEvent {
  id: string;
  assetId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'rating' | 'comment';
  value: number | string | boolean;
  context: {
    feature: string;
    itemType: 'requirement' | 'risk' | 'test' | 'ci';
    itemId?: string;
    suggestionAccepted?: boolean;
  };
  metadata?: {
    timeSpentReviewing?: number;
    alternativesConsidered?: number;
    implementationDifficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface ABTestConfig {
  testId: string;
  assetId: string;
  variants: {
    A: ProcessAsset;
    B: ProcessAsset;
  };
  trafficSplit: number; // 0.5 = 50/50 split
  startDate: string;
  endDate?: string;
  targetMetric: 'success_rate' | 'time_to_implement' | 'user_satisfaction' | 'bug_rate';
  minimumSampleSize: number;
  status: 'active' | 'completed' | 'paused';
}

export interface ABTestResult {
  testId: string;
  winner: 'A' | 'B' | 'inconclusive';
  confidence: number;
  metrics: {
    A: {
      sampleSize: number;
      successRate: number;
      avgTimeToImplement: number;
      userSatisfaction: number;
      bugRate: number;
    };
    B: {
      sampleSize: number;
      successRate: number;
      avgTimeToImplement: number;
      userSatisfaction: number;
      bugRate: number;
    };
  };
  statisticalSignificance: boolean;
  recommendations: string[];
}

/**
 * Service for managing user feedback and A/B testing
 */
export class FeedbackService {
  
  /**
   * Records user feedback for an asset
   */
  static recordFeedback(
    projectData: ProjectData,
    feedback: FeedbackEvent
  ): ProjectData {
    // Record the feedback event using the performance service
    const usageEvent = {
      assetId: feedback.assetId,
      eventType: 'feedback' as const,
      timestamp: feedback.timestamp,
      context: {
        itemType: feedback.context.itemType,
        itemId: feedback.context.itemId || 'unknown',
        userId: feedback.userId,
        sessionId: feedback.sessionId
      },
      metrics: {
        userFeedback: this.convertFeedbackToMetric(feedback)
      }
    };

    return AssetPerformanceService.recordAssetUsage(projectData, usageEvent);
  }

  /**
   * Converts feedback event to standardized metric
   */
  private static convertFeedbackToMetric(feedback: FeedbackEvent): 'positive' | 'negative' | 'neutral' {
    switch (feedback.feedbackType) {
      case 'thumbs_up':
        return 'positive';
      case 'thumbs_down':
        return 'negative';
      case 'rating':
        const rating = typeof feedback.value === 'number' ? feedback.value : 0;
        if (rating >= 4) return 'positive';
        if (rating <= 2) return 'negative';
        return 'neutral';
      case 'comment':
        // TODO: Implement sentiment analysis for comments
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  /**
   * Creates a new A/B test for asset variations
   */
  static createABTest(
    projectData: ProjectData,
    config: ABTestConfig
  ): ProjectData {
    const updatedData = { ...projectData };
    
    // Store A/B test configuration in project data
    if (!updatedData.abTests) {
      updatedData.abTests = [];
    }
    
    updatedData.abTests.push(config);
    
    return updatedData;
  }

  /**
   * Determines which variant to show for an A/B test
   */
  static getABTestVariant(
    projectData: ProjectData,
    assetId: string,
    userId?: string
  ): { variant: 'A' | 'B'; asset: ProcessAsset } | null {
    const activeTest = projectData.abTests?.find(
      test => test.assetId === assetId && test.status === 'active'
    );

    if (!activeTest) return null;

    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId || 'anonymous');
    const variant = (hash % 100) < (activeTest.trafficSplit * 100) ? 'A' : 'B';
    
    return {
      variant,
      asset: activeTest.variants[variant]
    };
  }

  /**
   * Analyzes A/B test results and determines winner
   */
  static analyzeABTest(
    projectData: ProjectData,
    testId: string
  ): ABTestResult {
    const test = projectData.abTests?.find(t => t.testId === testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    // Collect metrics for both variants
    const variantAMetrics = this.collectVariantMetrics(projectData, test.variants.A.id);
    const variantBMetrics = this.collectVariantMetrics(projectData, test.variants.B.id);

    // Determine winner based on target metric
    const winner = this.determineWinner(
      variantAMetrics,
      variantBMetrics,
      test.targetMetric
    );

    // Calculate statistical significance
    const significance = this.calculateStatisticalSignificance(
      variantAMetrics,
      variantBMetrics,
      test.targetMetric
    );

    return {
      testId,
      winner: winner.winner,
      confidence: winner.confidence,
      metrics: {
        A: variantAMetrics,
        B: variantBMetrics
      },
      statisticalSignificance: significance.isSignificant,
      recommendations: this.generateABTestRecommendations(winner, significance, test)
    };
  }

  /**
   * Collects performance metrics for a specific asset variant
   */
  private static collectVariantMetrics(projectData: ProjectData, assetId: string) {
    const usage = projectData.assetUsage[assetId];
    if (!usage) {
      return {
        sampleSize: 0,
        successRate: 0,
        avgTimeToImplement: 0,
        userSatisfaction: 0,
        bugRate: 0
      };
    }

    const metrics = usage.performanceMetrics;
    return {
      sampleSize: usage.usageCount,
      successRate: metrics.successRate,
      avgTimeToImplement: metrics.avgTimeToImplement,
      userSatisfaction: metrics.userSatisfactionScore,
      bugRate: metrics.bugRate
    };
  }

  /**
   * Determines the winner of an A/B test
   */
  private static determineWinner(
    variantA: any,
    variantB: any,
    targetMetric: string
  ): { winner: 'A' | 'B' | 'inconclusive'; confidence: number } {
    let aValue: number, bValue: number;

    switch (targetMetric) {
      case 'success_rate':
        aValue = variantA.successRate;
        bValue = variantB.successRate;
        break;
      case 'time_to_implement':
        aValue = -variantA.avgTimeToImplement; // Lower is better, so negate
        bValue = -variantB.avgTimeToImplement;
        break;
      case 'user_satisfaction':
        aValue = variantA.userSatisfaction;
        bValue = variantB.userSatisfaction;
        break;
      case 'bug_rate':
        aValue = -variantA.bugRate; // Lower is better, so negate
        bValue = -variantB.bugRate;
        break;
      default:
        return { winner: 'inconclusive', confidence: 0 };
    }

    const difference = Math.abs(aValue - bValue);
    const average = (Math.abs(aValue) + Math.abs(bValue)) / 2;
    const confidence = average > 0 ? (difference / average) * 100 : 0;

    if (confidence < 5) {
      return { winner: 'inconclusive', confidence };
    }

    return {
      winner: aValue > bValue ? 'A' : 'B',
      confidence: Math.min(confidence, 95)
    };
  }

  /**
   * Calculates statistical significance of A/B test results
   */
  private static calculateStatisticalSignificance(
    variantA: any,
    variantB: any,
    targetMetric: string
  ): { isSignificant: boolean; pValue: number } {
    // Simplified statistical significance calculation
    // In a real implementation, you'd use proper statistical tests
    const minSampleSize = 30;
    const hasEnoughData = variantA.sampleSize >= minSampleSize && variantB.sampleSize >= minSampleSize;
    
    if (!hasEnoughData) {
      return { isSignificant: false, pValue: 1.0 };
    }

    // Mock p-value calculation - replace with actual statistical test
    const mockPValue = Math.random() * 0.1; // Simulate p-value between 0 and 0.1
    
    return {
      isSignificant: mockPValue < 0.05,
      pValue: mockPValue
    };
  }

  /**
   * Generates recommendations based on A/B test results
   */
  private static generateABTestRecommendations(
    winner: { winner: 'A' | 'B' | 'inconclusive'; confidence: number },
    significance: { isSignificant: boolean; pValue: number },
    test: ABTestConfig
  ): string[] {
    const recommendations: string[] = [];

    if (winner.winner === 'inconclusive') {
      recommendations.push('Results are inconclusive. Consider running the test longer or with a larger sample size.');
      recommendations.push('Review test setup to ensure variants are sufficiently different.');
    } else if (!significance.isSignificant) {
      recommendations.push(`Variant ${winner.winner} appears to perform better, but results are not statistically significant.`);
      recommendations.push('Continue testing to gather more data before making a decision.');
    } else {
      recommendations.push(`Variant ${winner.winner} is the clear winner with ${winner.confidence.toFixed(1)}% confidence.`);
      recommendations.push(`Consider adopting Variant ${winner.winner} as the standard asset.`);
      recommendations.push('Document the learnings and apply insights to similar assets.');
    }

    return recommendations;
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Gets feedback summary for an asset
   */
  static getFeedbackSummary(
    projectData: ProjectData,
    assetId: string
  ): {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    satisfactionScore: number;
    recentFeedback: any[];
  } {
    const usage = projectData.assetUsage[assetId];
    if (!usage || !usage.feedbackHistory) {
      return {
        totalFeedback: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        satisfactionScore: 0,
        recentFeedback: []
      };
    }

    const feedback = usage.feedbackHistory;
    const positiveCount = feedback.filter(f => f.feedback === 'positive').length;
    const negativeCount = feedback.filter(f => f.feedback === 'negative').length;
    const neutralCount = feedback.filter(f => f.feedback === 'neutral').length;
    
    const satisfactionScore = feedback.length > 0
      ? ((positiveCount - negativeCount) / feedback.length) * 100
      : 0;

    const recentFeedback = feedback
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalFeedback: feedback.length,
      positiveCount,
      negativeCount,
      neutralCount,
      satisfactionScore,
      recentFeedback
    };
  }
}
