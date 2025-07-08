/**
 * Development Activity Intelligence Service - Phase 5 Implementation
 *
 * This service implements real-time monitoring and analysis of development activities
 * with automatic requirement traceability, risk detection, and process compliance validation.
 */

import {
  DevelopmentActivity,
  GitHubSettings,
  ProjectData,
  QualityImpact,
  Risk,
  TraceabilityUpdate,
} from '../types';
import { DevelopmentWorkflowService } from './developmentWorkflowService';
import { getAiClient } from './geminiService';

export interface ActivityIntelligenceReport {
  activity: DevelopmentActivity;
  traceabilityAnalysis: TraceabilityAnalysis;
  riskAssessment: RiskAssessment;
  qualityAnalysis: QualityAnalysis;
  complianceValidation: ComplianceValidation;
  recommendations: ActivityRecommendation[];
}

export interface TraceabilityAnalysis {
  automaticLinks: TraceabilityUpdate[];
  suggestedLinks: TraceabilityUpdate[];
  missingLinks: MissingLink[];
  linkConfidence: number;
  coverageScore: number;
}

export interface MissingLink {
  type: 'requirement' | 'risk' | 'ci' | 'test';
  id: string;
  reason: string;
  confidence: number;
  suggestedAction: string;
}

export interface RiskAssessment {
  detectedRisks: DetectedRisk[];
  riskScore: number;
  mitigationSuggestions: string[];
  escalationRequired: boolean;
}

export interface DetectedRisk {
  type: 'Technical' | 'Process' | 'Quality' | 'Security' | 'Schedule';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  indicators: string[];
  probability: number;
  impact: number;
  mitigationActions: string[];
}

export interface QualityAnalysis {
  codeQualityScore: number;
  testCoverageImpact: number;
  maintainabilityImpact: number;
  securityImplications: SecurityImplication[];
  performanceImpact: PerformanceImpact;
  technicalDebtChange: number;
}

export interface SecurityImplication {
  type: 'Vulnerability' | 'Exposure' | 'Compliance' | 'Best Practice';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  recommendation: string;
  cveReferences?: string[];
}

export interface PerformanceImpact {
  category: 'Positive' | 'Neutral' | 'Negative';
  magnitude: number; // -100 to +100
  areas: string[];
  recommendations: string[];
}

export interface ComplianceValidation {
  overallCompliance: number;
  processAreaImpacts: { [area: string]: number };
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceViolation {
  processArea: string;
  requirement: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  remediation: string;
}

export interface ComplianceRecommendation {
  processArea: string;
  action: string;
  benefit: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface ActivityRecommendation {
  type: 'Process' | 'Quality' | 'Security' | 'Performance' | 'Compliance';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  actionItems: string[];
  estimatedEffort: string;
  benefits: string[];
}

/**
 * Service for intelligent analysis of development activities
 */
export class DevelopmentActivityIntelligence {
  /**
   * Performs comprehensive analysis of a development activity
   */
  static async analyzeActivity(
    activity: DevelopmentActivity,
    projectData: ProjectData,
    githubSettings?: GitHubSettings
  ): Promise<ActivityIntelligenceReport> {
    // Perform parallel analysis
    const [
      traceabilityAnalysis,
      riskAssessment,
      qualityAnalysis,
      complianceValidation,
    ] = await Promise.all([
      this.analyzeTraceability(activity, projectData),
      this.assessRisks(activity, projectData),
      this.analyzeQuality(activity, projectData, githubSettings),
      this.validateCompliance(activity, projectData),
    ]);

    // Generate recommendations based on all analyses
    const recommendations = this.generateRecommendations(
      activity,
      traceabilityAnalysis,
      riskAssessment,
      qualityAnalysis,
      complianceValidation
    );

    return {
      activity,
      traceabilityAnalysis,
      riskAssessment,
      qualityAnalysis,
      complianceValidation,
      recommendations,
    };
  }

  /**
   * Monitors development activities in real-time
   */
  static async monitorActivities(
    projectData: ProjectData,
    githubSettings: GitHubSettings
  ): Promise<DevelopmentActivity[]> {
    try {
      // Fetch recent activities from GitHub
      const activities = await this.fetchRecentActivities(githubSettings);

      // Enrich activities with intelligence
      const enrichedActivities = await Promise.all(
        activities.map((activity) => this.enrichActivity(activity, projectData))
      );

      return enrichedActivities;
    } catch (error) {
      console.error('Error monitoring activities:', error);
      return [];
    }
  }

  /**
   * Automatically updates project data based on activity intelligence
   */
  static async updateProjectFromActivity(
    activity: DevelopmentActivity,
    intelligence: ActivityIntelligenceReport,
    projectData: ProjectData
  ): Promise<ProjectData> {
    let updatedData = { ...projectData };

    // Apply automatic traceability updates
    intelligence.traceabilityAnalysis.automaticLinks.forEach((link) => {
      updatedData = this.applyTraceabilityUpdate(link, updatedData);
    });

    // Create new risks if detected
    intelligence.riskAssessment.detectedRisks.forEach((detectedRisk) => {
      if (
        detectedRisk.severity === 'High' ||
        detectedRisk.severity === 'Critical'
      ) {
        updatedData = this.createRiskFromDetection(
          detectedRisk,
          activity,
          updatedData
        );
      }
    });

    // Update quality metrics
    updatedData = this.updateQualityMetrics(
      intelligence.qualityAnalysis,
      updatedData
    );

    // Record activity
    if (!updatedData.developmentActivities) {
      updatedData.developmentActivities = [];
    }
    updatedData.developmentActivities.push(activity);

    return updatedData;
  }

  /**
   * Analyzes traceability for an activity
   */
  private static async analyzeTraceability(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<TraceabilityAnalysis> {
    const automaticLinks = await DevelopmentWorkflowService.updateTraceability(
      activity,
      projectData
    );
    const suggestedLinks = await this.generateSuggestedLinks(
      activity,
      projectData
    );
    const missingLinks = this.identifyMissingLinks(activity, projectData);

    const totalPossibleLinks =
      projectData.requirements.length +
      projectData.risks.length +
      projectData.configurationItems.length;
    const actualLinks = automaticLinks.length + suggestedLinks.length;
    const coverageScore =
      totalPossibleLinks > 0 ? (actualLinks / totalPossibleLinks) * 100 : 100;

    const linkConfidence =
      automaticLinks.reduce((sum, link) => sum + link.confidence, 0) /
      Math.max(automaticLinks.length, 1);

    return {
      automaticLinks,
      suggestedLinks,
      missingLinks,
      linkConfidence,
      coverageScore,
    };
  }

  /**
   * Assesses risks associated with an activity
   */
  private static async assessRisks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<RiskAssessment> {
    const detectedRisks: DetectedRisk[] = [];

    // Analyze activity for risk patterns
    switch (activity.type) {
      case 'Commit':
        detectedRisks.push(...this.analyzeCommitRisks(activity, projectData));
        break;
      case 'Pull Request':
        detectedRisks.push(
          ...this.analyzePullRequestRisks(activity, projectData)
        );
        break;
      case 'Deploy':
        detectedRisks.push(
          ...this.analyzeDeploymentRisks(activity, projectData)
        );
        break;
    }

    // Calculate overall risk score
    const riskScore =
      detectedRisks.reduce((sum, risk) => {
        const severityWeight = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        return (
          sum + severityWeight[risk.severity] * risk.probability * risk.impact
        );
      }, 0) / Math.max(detectedRisks.length, 1);

    const mitigationSuggestions = detectedRisks.flatMap(
      (risk) => risk.mitigationActions
    );
    const escalationRequired = detectedRisks.some(
      (risk) => risk.severity === 'Critical'
    );

    return {
      detectedRisks,
      riskScore,
      mitigationSuggestions,
      escalationRequired,
    };
  }

  /**
   * Analyzes quality impact of an activity
   */
  private static async analyzeQuality(
    activity: DevelopmentActivity,
    projectData: ProjectData,
    githubSettings?: GitHubSettings
  ): Promise<QualityAnalysis> {
    // Mock quality analysis - in real implementation, integrate with code analysis tools
    const codeQualityScore = Math.random() * 100; // Replace with actual analysis
    const testCoverageImpact = Math.random() * 20 - 10; // -10 to +10
    const maintainabilityImpact = Math.random() * 20 - 10;
    const technicalDebtChange = Math.random() * 10 - 5;

    const securityImplications = await this.analyzeSecurityImplications(
      activity,
      projectData
    );
    const performanceImpact = this.analyzePerformanceImpact(
      activity,
      projectData
    );

    return {
      codeQualityScore,
      testCoverageImpact,
      maintainabilityImpact,
      securityImplications,
      performanceImpact,
      technicalDebtChange,
    };
  }

  /**
   * Validates compliance for an activity
   */
  private static async validateCompliance(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<ComplianceValidation> {
    const processAreaImpacts: { [area: string]: number } = {};
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Analyze compliance impact by activity type
    switch (activity.type) {
      case 'Commit':
        processAreaImpacts['CM'] = 5; // Positive impact on Configuration Management
        break;
      case 'Pull Request':
        processAreaImpacts['VER'] = 10; // Positive impact on Verification
        break;
      case 'Deploy':
        processAreaImpacts['VAL'] = 8; // Positive impact on Validation
        break;
    }

    // Check for compliance violations
    if (
      activity.type === 'Commit' &&
      !activity.metadata.message?.includes('REQ-')
    ) {
      violations.push({
        processArea: 'REQM',
        requirement: 'All commits must reference requirements',
        severity: 'Medium',
        description: 'Commit message does not reference any requirements',
        remediation: 'Include requirement ID in commit message format: REQ-XXX',
      });
    }

    const overallCompliance =
      Object.values(processAreaImpacts).reduce(
        (sum, impact) => sum + impact,
        0
      ) / Object.keys(processAreaImpacts).length;

    return {
      overallCompliance,
      processAreaImpacts,
      violations,
      recommendations,
    };
  }

  /**
   * Generates comprehensive recommendations
   */
  private static generateRecommendations(
    activity: DevelopmentActivity,
    traceability: TraceabilityAnalysis,
    risks: RiskAssessment,
    quality: QualityAnalysis,
    compliance: ComplianceValidation
  ): ActivityRecommendation[] {
    const recommendations: ActivityRecommendation[] = [];

    // Traceability recommendations
    if (traceability.coverageScore < 70) {
      recommendations.push({
        type: 'Process',
        priority: 'Medium',
        title: 'Improve Traceability Coverage',
        description:
          'Activity has low traceability coverage to project artifacts',
        actionItems: [
          'Review and link to relevant requirements',
          'Update commit messages with artifact references',
          'Use standardized linking conventions',
        ],
        estimatedEffort: '10-15 minutes',
        benefits: [
          'Better change impact analysis',
          'Improved compliance',
          'Enhanced project visibility',
        ],
      });
    }

    // Risk recommendations
    risks.detectedRisks.forEach((risk) => {
      if (risk.severity === 'High' || risk.severity === 'Critical') {
        recommendations.push({
          type: 'Security',
          priority: risk.severity === 'Critical' ? 'Critical' : 'High',
          title: `Address ${risk.type} Risk`,
          description: risk.description,
          actionItems: risk.mitigationActions,
          estimatedEffort:
            risk.severity === 'Critical' ? '1-2 hours' : '30-60 minutes',
          benefits: [
            'Reduced risk exposure',
            'Improved system security',
            'Better compliance',
          ],
        });
      }
    });

    // Quality recommendations
    if (quality.codeQualityScore < 70) {
      recommendations.push({
        type: 'Quality',
        priority: 'Medium',
        title: 'Improve Code Quality',
        description: 'Code quality metrics are below recommended thresholds',
        actionItems: [
          'Run static code analysis',
          'Address code smells and violations',
          'Improve test coverage',
          'Refactor complex methods',
        ],
        estimatedEffort: '1-3 hours',
        benefits: [
          'Better maintainability',
          'Reduced technical debt',
          'Fewer defects',
        ],
      });
    }

    // Compliance recommendations
    compliance.violations.forEach((violation) => {
      recommendations.push({
        type: 'Compliance',
        priority: violation.severity === 'Critical' ? 'Critical' : 'Medium',
        title: `Fix ${violation.processArea} Compliance`,
        description: violation.description,
        actionItems: [violation.remediation],
        estimatedEffort: '5-15 minutes',
        benefits: [
          'Improved process compliance',
          'Better audit readiness',
          'Reduced compliance risk',
        ],
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods for specific risk analysis
  private static analyzeCommitRisks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    // Check for large commits
    if (activity.metadata.filesChanged > 20) {
      risks.push({
        type: 'Quality',
        severity: 'Medium',
        description: 'Large commit with many file changes',
        indicators: [`${activity.metadata.filesChanged} files changed`],
        probability: 0.7,
        impact: 0.6,
        mitigationActions: [
          'Break down into smaller commits',
          'Increase review scrutiny',
        ],
      });
    }

    return risks;
  }

  private static analyzePullRequestRisks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    // Check for PRs without tests
    if (!activity.metadata.hasTests) {
      risks.push({
        type: 'Quality',
        severity: 'High',
        description: 'Pull request does not include test changes',
        indicators: ['No test files modified'],
        probability: 0.8,
        impact: 0.7,
        mitigationActions: [
          'Add appropriate test coverage',
          'Require tests for all changes',
        ],
      });
    }

    return risks;
  }

  private static analyzeDeploymentRisks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    // Check for deployments without proper validation
    if (!activity.metadata.preDeploymentValidation) {
      risks.push({
        type: 'Process',
        severity: 'High',
        description: 'Deployment without proper pre-deployment validation',
        indicators: ['No validation checks recorded'],
        probability: 0.9,
        impact: 0.8,
        mitigationActions: [
          'Implement pre-deployment validation',
          'Add automated checks',
        ],
      });
    }

    return risks;
  }

  // Additional helper methods
  private static async generateSuggestedLinks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<TraceabilityUpdate[]> {
    // Use AI to suggest additional links
    const ai = getAiClient();
    if (!ai) return [];

    try {
      const prompt = `
Analyze this development activity and suggest additional traceability links:

Activity: ${activity.type}
Metadata: ${JSON.stringify(activity.metadata)}

Available artifacts:
Requirements: ${projectData.requirements
        .map((r) => `${r.id}: ${r.description}`)
        .slice(0, 10)
        .join('\n')}
Risks: ${projectData.risks
        .map((r) => `${r.id}: ${r.description}`)
        .slice(0, 10)
        .join('\n')}

Suggest additional links in JSON format:
{
  "suggestedLinks": [
    {
      "sourceType": "Requirement|Risk|CI",
      "sourceId": "ID",
      "confidence": 0-100,
      "reasoning": "explanation"
    }
  ]
}
`;

      const result = await ai.generateContent(prompt);
      const response = result.response.text();
      const parsed = JSON.parse(response);

      return parsed.suggestedLinks.map((link: any) => ({
        type: 'Added' as const,
        sourceType: link.sourceType,
        sourceId: link.sourceId,
        targetType: activity.type === 'Commit' ? 'Commit' : 'PR',
        targetId: activity.id,
        confidence: link.confidence,
        method: 'AI-Suggested' as const,
      }));
    } catch (error) {
      console.error('Error generating suggested links:', error);
      return [];
    }
  }

  private static identifyMissingLinks(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): MissingLink[] {
    const missingLinks: MissingLink[] = [];

    // Simple heuristic - if activity mentions keywords but no links exist
    const activityText = JSON.stringify(activity.metadata).toLowerCase();

    projectData.requirements.forEach((req) => {
      const reqKeywords =
        req.description
          ?.toLowerCase()
          .split(' ')
          .filter((word) => word.length > 4) || [];
      const hasKeywordMatch = reqKeywords.some((keyword) =>
        activityText.includes(keyword)
      );
      const hasExistingLink = activity.relatedRequirements.includes(req.id);

      if (hasKeywordMatch && !hasExistingLink) {
        missingLinks.push({
          type: 'requirement',
          id: req.id,
          reason: 'Activity content suggests relationship but no link exists',
          confidence: 60,
          suggestedAction: `Link to requirement ${req.id}`,
        });
      }
    });

    return missingLinks;
  }

  private static async analyzeSecurityImplications(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<SecurityImplication[]> {
    // Mock security analysis - integrate with security scanning tools
    return [
      {
        type: 'Best Practice',
        severity: 'Low',
        description: 'Consider adding input validation',
        recommendation: 'Implement proper input sanitization and validation',
      },
    ];
  }

  private static analyzePerformanceImpact(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): PerformanceImpact {
    // Mock performance analysis
    return {
      category: 'Neutral',
      magnitude: 0,
      areas: [],
      recommendations: [],
    };
  }

  private static async fetchRecentActivities(
    githubSettings: GitHubSettings
  ): Promise<DevelopmentActivity[]> {
    // Mock implementation - integrate with actual GitHub API
    return [];
  }

  private static async enrichActivity(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<DevelopmentActivity> {
    // Enrich activity with process and quality impact analysis
    const processImpact = DevelopmentWorkflowService['analyzeProcessImpact'](
      activity,
      projectData
    );
    const qualityImpact: QualityImpact = {
      codeQuality: 0,
      testCoverage: 0,
      securityRisk: 0,
      performanceImpact: 0,
      maintainabilityChange: 0,
    };

    return {
      ...activity,
      processImpact,
      qualityImpact,
    };
  }

  private static applyTraceabilityUpdate(
    link: TraceabilityUpdate,
    projectData: ProjectData
  ): ProjectData {
    // Apply traceability update to project data
    const updatedData = { ...projectData };

    if (link.sourceType === 'Requirement') {
      const reqLinks = updatedData.links[link.sourceId] || {
        tests: [],
        risks: [],
        cis: [],
        issues: [],
      };
      // Add appropriate link based on target type
      updatedData.links[link.sourceId] = reqLinks;
    }

    return updatedData;
  }

  private static createRiskFromDetection(
    detectedRisk: DetectedRisk,
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): ProjectData {
    const newRisk: Risk = {
      id: `RISK-AUTO-${Date.now()}`,
      description: `${detectedRisk.description} (Auto-detected from ${activity.type})`,
      probability:
        detectedRisk.probability > 0.7
          ? 'High'
          : detectedRisk.probability > 0.4
          ? 'Medium'
          : 'Low',
      impact:
        detectedRisk.impact > 0.7
          ? 'High'
          : detectedRisk.impact > 0.4
          ? 'Medium'
          : 'Low',
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'AI System',
      updatedBy: 'AI System',
    };

    return {
      ...projectData,
      risks: [...projectData.risks, newRisk],
    };
  }

  private static updateQualityMetrics(
    qualityAnalysis: QualityAnalysis,
    projectData: ProjectData
  ): ProjectData {
    // Update quality metrics in configuration items
    const updatedCIs = projectData.configurationItems.map((ci) => ({
      ...ci,
      metrics: {
        ...ci.metrics,
        testCoverage: Math.max(
          0,
          Math.min(
            100,
            (ci.metrics?.testCoverage || 0) + qualityAnalysis.testCoverageImpact
          )
        ),
        technicalDebt: Math.max(
          0,
          Math.min(
            10,
            (ci.metrics?.technicalDebt || 5) +
              qualityAnalysis.technicalDebtChange
          )
        ),
      },
    }));

    return {
      ...projectData,
      configurationItems: updatedCIs,
    };
  }
}
