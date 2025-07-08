/**
 * Automated Asset Refinement Service - Phase 4 Implementation
 * 
 * This service implements automated asset evolution using AI analysis of performance data,
 * user feedback, and cross-project patterns to suggest asset improvements.
 */

import { ProjectData, ProcessAsset, AssetEvolutionHistory, EvolutionTrigger } from '../types';
import { AssetPerformanceService } from './assetPerformanceService';
import { FeedbackService } from './feedbackService';
import { getAiClient } from './geminiService';

export interface RefinementRequest {
  assetId: string;
  trigger: 'performance_decline' | 'user_feedback' | 'pattern_analysis' | 'manual_review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: {
    performanceData: any;
    feedbackSummary: any;
    crossProjectData?: any;
    manualNotes?: string;
  };
  requestedBy: string;
  timestamp: string;
}

export interface RefinementSuggestion {
  assetId: string;
  currentVersion: ProcessAsset;
  suggestedVersion: ProcessAsset;
  rationale: string;
  expectedImprovements: {
    successRate?: number;
    timeToImplement?: number;
    userSatisfaction?: number;
    bugReduction?: number;
  };
  confidence: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
    mitigations: string[];
  };
  implementationPlan: {
    steps: string[];
    rollbackPlan: string;
    testingStrategy: string;
  };
}

export interface RefinementApproval {
  suggestionId: string;
  approved: boolean;
  approvedBy: string;
  approvalDate: string;
  modifications?: string[];
  rollbackTriggers?: string[];
}

/**
 * Service for automated asset refinement and evolution
 */
export class AssetRefinementService {
  
  /**
   * Analyzes assets and identifies candidates for refinement
   */
  static async identifyRefinementCandidates(
    projectData: ProjectData,
    organizationalData?: any
  ): Promise<RefinementRequest[]> {
    const candidates: RefinementRequest[] = [];
    const timestamp = new Date().toISOString();

    // Identify underperforming assets
    const underperformingAssets = AssetPerformanceService.identifyUnderperformingAssets(projectData);
    
    for (const asset of underperformingAssets) {
      const performanceReport = AssetPerformanceService.generateAssetPerformanceReport(asset, projectData);
      const feedbackSummary = FeedbackService.getFeedbackSummary(projectData, asset.id);
      
      candidates.push({
        assetId: asset.id,
        trigger: 'performance_decline',
        priority: this.calculatePriority(performanceReport, feedbackSummary),
        context: {
          performanceData: performanceReport,
          feedbackSummary,
          crossProjectData: organizationalData?.crossProjectAssets?.find((a: any) => a.id === asset.id)
        },
        requestedBy: 'system',
        timestamp
      });
    }

    // Identify assets with negative feedback patterns
    for (const asset of projectData.processAssets) {
      const feedbackSummary = FeedbackService.getFeedbackSummary(projectData, asset.id);
      
      if (feedbackSummary.negativeCount > feedbackSummary.positiveCount && feedbackSummary.totalFeedback >= 5) {
        candidates.push({
          assetId: asset.id,
          trigger: 'user_feedback',
          priority: 'high',
          context: {
            performanceData: AssetPerformanceService.generateAssetPerformanceReport(asset, projectData),
            feedbackSummary
          },
          requestedBy: 'system',
          timestamp
        });
      }
    }

    return candidates;
  }

  /**
   * Generates AI-powered refinement suggestions for an asset
   */
  static async generateRefinementSuggestion(
    request: RefinementRequest,
    projectData: ProjectData
  ): Promise<RefinementSuggestion> {
    const ai = getAiClient();
    if (!ai) {
      throw new Error('AI client not available for asset refinement');
    }

    const asset = projectData.processAssets.find(a => a.id === request.assetId);
    if (!asset) {
      throw new Error(`Asset ${request.assetId} not found`);
    }

    const prompt = this.buildRefinementPrompt(asset, request, projectData);
    
    try {
      const result = await ai.generateContent(prompt);
      const response = result.response.text();
      
      // Parse AI response into structured suggestion
      const suggestion = this.parseRefinementResponse(response, asset, request);
      
      return suggestion;
    } catch (error) {
      console.error('Error generating refinement suggestion:', error);
      throw new Error('Failed to generate AI-powered refinement suggestion');
    }
  }

  /**
   * Builds the AI prompt for asset refinement
   */
  private static buildRefinementPrompt(
    asset: ProcessAsset,
    request: RefinementRequest,
    projectData: ProjectData
  ): string {
    const { performanceData, feedbackSummary } = request.context;
    
    return `
You are an expert process improvement consultant specializing in software development methodologies. Your task is to analyze an underperforming process asset and suggest improvements.

CURRENT ASSET:
---
Name: ${asset.name}
Type: ${asset.type}
Description: ${asset.description}
Content: ${asset.content}
Tags: ${asset.tags.join(', ')}
Created: ${asset.createdAt}
Last Updated: ${asset.updatedAt}

PERFORMANCE DATA:
---
Success Rate: ${performanceData.metrics.successRate}%
Average Implementation Time: ${performanceData.metrics.avgTimeToImplement} minutes
Bug Rate: ${performanceData.metrics.bugRate} bugs per implementation
User Satisfaction: ${performanceData.metrics.userSatisfactionScore}%

FEEDBACK SUMMARY:
---
Total Feedback: ${feedbackSummary.totalFeedback}
Positive: ${feedbackSummary.positiveCount}
Negative: ${feedbackSummary.negativeCount}
Neutral: ${feedbackSummary.neutralCount}

REFINEMENT TRIGGER: ${request.trigger}

TASK:
Analyze the asset and its performance data, then provide an improved version that addresses the identified issues. Focus on:

1. **Content Clarity**: Make instructions clearer and more actionable
2. **Completeness**: Add missing steps or considerations
3. **Usability**: Improve the user experience and reduce implementation time
4. **Quality**: Address factors that might be causing bugs or failures
5. **Relevance**: Ensure the asset remains current with best practices

Respond with a JSON object containing:
{
  "suggestedAsset": {
    "name": "improved name",
    "description": "improved description", 
    "content": "improved content with specific actionable steps",
    "tags": ["relevant", "tags"],
    "type": "${asset.type}"
  },
  "rationale": "detailed explanation of changes and why they will improve performance",
  "expectedImprovements": {
    "successRate": estimated_new_success_rate_percentage,
    "timeToImplement": estimated_new_time_in_minutes,
    "userSatisfaction": estimated_new_satisfaction_percentage,
    "bugReduction": estimated_bug_reduction_percentage
  },
  "confidence": confidence_level_0_to_100,
  "riskAssessment": {
    "level": "low|medium|high",
    "concerns": ["potential concerns with the changes"],
    "mitigations": ["ways to mitigate the risks"]
  },
  "implementationPlan": {
    "steps": ["step 1", "step 2", "step 3"],
    "rollbackPlan": "how to revert if needed",
    "testingStrategy": "how to validate the improvements"
  }
}
`;
  }

  /**
   * Parses AI response into structured refinement suggestion
   */
  private static parseRefinementResponse(
    response: string,
    originalAsset: ProcessAsset,
    request: RefinementRequest
  ): RefinementSuggestion {
    try {
      const parsed = JSON.parse(response);
      
      const suggestedAsset: ProcessAsset = {
        ...originalAsset,
        ...parsed.suggestedAsset,
        id: originalAsset.id, // Keep original ID
        version: this.incrementVersion(originalAsset.version || '1.0.0'),
        updatedAt: new Date().toISOString(),
        updatedBy: 'AI Refinement System'
      };

      return {
        assetId: request.assetId,
        currentVersion: originalAsset,
        suggestedVersion: suggestedAsset,
        rationale: parsed.rationale,
        expectedImprovements: parsed.expectedImprovements,
        confidence: parsed.confidence,
        riskAssessment: parsed.riskAssessment,
        implementationPlan: parsed.implementationPlan
      };
    } catch (error) {
      console.error('Error parsing refinement response:', error);
      throw new Error('Failed to parse AI refinement suggestion');
    }
  }

  /**
   * Applies an approved refinement to the project data
   */
  static applyRefinement(
    projectData: ProjectData,
    suggestion: RefinementSuggestion,
    approval: RefinementApproval
  ): ProjectData {
    if (!approval.approved) {
      throw new Error('Cannot apply unapproved refinement');
    }

    const updatedData = { ...projectData };
    
    // Update the asset
    const assetIndex = updatedData.processAssets.findIndex(a => a.id === suggestion.assetId);
    if (assetIndex === -1) {
      throw new Error(`Asset ${suggestion.assetId} not found`);
    }

    // Apply any modifications from the approval
    let finalAsset = { ...suggestion.suggestedVersion };
    if (approval.modifications) {
      // TODO: Apply specific modifications from approval
      finalAsset.description += ` (Modified during approval: ${approval.modifications.join(', ')})`;
    }

    updatedData.processAssets[assetIndex] = finalAsset;

    // Record the evolution in asset history
    this.recordAssetEvolution(updatedData, suggestion, approval);

    // Reset usage metrics for the refined asset
    if (updatedData.assetUsage[suggestion.assetId]) {
      updatedData.assetUsage[suggestion.assetId].performanceMetrics.lastCalculated = new Date().toISOString();
    }

    return updatedData;
  }

  /**
   * Records asset evolution history
   */
  private static recordAssetEvolution(
    projectData: ProjectData,
    suggestion: RefinementSuggestion,
    approval: RefinementApproval
  ): void {
    if (!projectData.assetEvolutionHistory) {
      projectData.assetEvolutionHistory = [];
    }

    let evolution = projectData.assetEvolutionHistory.find(e => e.assetId === suggestion.assetId);
    if (!evolution) {
      evolution = {
        assetId: suggestion.assetId,
        versions: [],
        evolutionTriggers: [],
        performanceHistory: []
      };
      projectData.assetEvolutionHistory.push(evolution);
    }

    // Record new version
    evolution.versions.push({
      version: suggestion.suggestedVersion.version || '1.0.0',
      timestamp: approval.approvalDate,
      changes: [suggestion.rationale],
      performanceImpact: 0, // Will be calculated after implementation
      approvedBy: approval.approvedBy,
      rollbackAvailable: true
    });

    // Record evolution trigger
    evolution.evolutionTriggers.push({
      timestamp: approval.approvalDate,
      trigger: 'performance_decline', // From the original request
      details: suggestion.rationale,
      actionTaken: 'Asset refined and updated'
    });
  }

  /**
   * Calculates priority for refinement requests
   */
  private static calculatePriority(
    performanceReport: any,
    feedbackSummary: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    const metrics = performanceReport.metrics;
    
    if (metrics.successRate < 30 || feedbackSummary.satisfactionScore < -50) {
      return 'critical';
    }
    
    if (metrics.successRate < 50 || feedbackSummary.satisfactionScore < -20) {
      return 'high';
    }
    
    if (metrics.successRate < 70 || feedbackSummary.satisfactionScore < 0) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Increments semantic version
   */
  private static incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1; // Increment patch version
    return parts.join('.');
  }

  /**
   * Schedules automated refinement analysis
   */
  static async scheduleAutomatedRefinement(
    projectData: ProjectData,
    organizationalData?: any
  ): Promise<RefinementRequest[]> {
    console.log('Running scheduled asset refinement analysis...');
    
    const candidates = await this.identifyRefinementCandidates(projectData, organizationalData);
    
    // Filter for high-priority candidates that should be auto-processed
    const autoCandidates = candidates.filter(c => 
      c.priority === 'critical' || 
      (c.priority === 'high' && c.trigger === 'performance_decline')
    );

    console.log(`Identified ${candidates.length} refinement candidates, ${autoCandidates.length} for auto-processing`);
    
    return autoCandidates;
  }
}
