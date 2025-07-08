/**
 * Intelligent Workflow Orchestrator - Phase 5 Implementation
 * 
 * This service provides AI-powered workflow orchestration with just-in-time process guidance,
 * automated compliance checking, and intelligent task routing based on project context.
 */

import { 
  ProjectData, 
  DevelopmentActivity, 
  ProcessGuidance,
  DevelopmentWorkflow,
  ProcessComplianceStatus,
  Requirement,
  Risk,
  ConfigurationItem
} from '../types';
import { getAiClient } from './geminiService';
import { DevelopmentWorkflowService } from './developmentWorkflowService';
import { AssetPerformanceService } from './assetPerformanceService';

export interface WorkflowOrchestrationContext {
  currentActivity: DevelopmentActivity;
  projectPhase: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Maintenance';
  teamVelocity: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceRequirements: string[];
  deadlines: { [milestone: string]: string };
}

export interface IntelligentTask {
  id: string;
  type: 'Process Check' | 'Quality Gate' | 'Documentation' | 'Review' | 'Testing' | 'Compliance';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  estimatedEffort: number; // minutes
  prerequisites: string[];
  assignedTo?: string;
  dueDate?: string;
  automatable: boolean;
  processArea: string;
  context: WorkflowOrchestrationContext;
  guidance: ProcessGuidance[];
}

export interface OrchestrationDecision {
  action: 'proceed' | 'pause' | 'escalate' | 'redirect' | 'optimize';
  reasoning: string;
  confidence: number;
  alternatives: string[];
  riskMitigation: string[];
  nextSteps: IntelligentTask[];
}

export interface ProcessIntelligence {
  currentState: ProcessState;
  predictedOutcomes: PredictedOutcome[];
  optimizationOpportunities: OptimizationOpportunity[];
  riskIndicators: RiskIndicator[];
  complianceStatus: ProcessComplianceStatus;
}

export interface ProcessState {
  phase: string;
  completionPercentage: number;
  velocity: number;
  qualityTrend: 'Improving' | 'Stable' | 'Declining';
  teamMorale: number; // 1-10 scale
  technicalDebt: number;
  riskExposure: number;
}

export interface PredictedOutcome {
  scenario: string;
  probability: number;
  impact: 'Positive' | 'Neutral' | 'Negative';
  timeframe: string;
  confidence: number;
  mitigationActions: string[];
}

export interface OptimizationOpportunity {
  area: 'Process' | 'Quality' | 'Performance' | 'Team' | 'Tools';
  title: string;
  description: string;
  potentialBenefit: string;
  implementationEffort: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  prerequisites: string[];
}

export interface RiskIndicator {
  type: 'Schedule' | 'Quality' | 'Technical' | 'Process' | 'Team';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  earlyWarningSignals: string[];
  mitigationStrategies: string[];
  escalationTriggers: string[];
}

/**
 * AI-powered workflow orchestration service
 */
export class IntelligentWorkflowOrchestrator {

  /**
   * Orchestrates workflow decisions based on current context and AI analysis
   */
  static async orchestrateWorkflow(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): Promise<OrchestrationDecision> {
    // Analyze current process intelligence
    const processIntelligence = await this.analyzeProcessIntelligence(context, projectData);
    
    // Generate AI-powered decision
    const decision = await this.generateOrchestrationDecision(context, processIntelligence, projectData);
    
    // Create intelligent tasks based on decision
    const nextSteps = await this.generateIntelligentTasks(decision, context, projectData);
    
    return {
      ...decision,
      nextSteps
    };
  }

  /**
   * Provides just-in-time process guidance based on current activity
   */
  static async provideJustInTimeGuidance(
    activity: DevelopmentActivity,
    projectData: ProjectData
  ): Promise<ProcessGuidance[]> {
    const ai = getAiClient();
    if (!ai) {
      return DevelopmentWorkflowService.provideProcessGuidance(activity, projectData);
    }

    try {
      const prompt = this.buildGuidancePrompt(activity, projectData);
      const result = await ai.generateContent(prompt);
      const response = result.response.text();
      
      const aiGuidance = this.parseGuidanceResponse(response);
      const standardGuidance = await DevelopmentWorkflowService.provideProcessGuidance(activity, projectData);
      
      // Combine AI and standard guidance, removing duplicates
      return this.mergeGuidance(aiGuidance, standardGuidance);
    } catch (error) {
      console.error('Error generating AI guidance:', error);
      return DevelopmentWorkflowService.provideProcessGuidance(activity, projectData);
    }
  }

  /**
   * Automatically routes tasks to appropriate team members based on skills and workload
   */
  static async routeIntelligentTasks(
    tasks: IntelligentTask[],
    teamMembers: any[], // In real implementation, this would be a proper TeamMember type
    projectData: ProjectData
  ): Promise<{ [taskId: string]: string }> {
    const assignments: { [taskId: string]: string } = {};
    
    // Simple routing algorithm - in real implementation, use ML for optimal assignment
    tasks.forEach(task => {
      const suitableMembers = teamMembers.filter(member => 
        member.skills.includes(task.processArea) && 
        member.currentWorkload < member.capacity
      );
      
      if (suitableMembers.length > 0) {
        // Assign to member with lowest workload
        const assignee = suitableMembers.reduce((min, member) => 
          member.currentWorkload < min.currentWorkload ? member : min
        );
        assignments[task.id] = assignee.id;
      }
    });

    return assignments;
  }

  /**
   * Performs automated compliance checking with intelligent recommendations
   */
  static async performAutomatedComplianceCheck(
    workflow: DevelopmentWorkflow,
    projectData: ProjectData
  ): Promise<ProcessComplianceStatus> {
    const baseCompliance = DevelopmentWorkflowService.validateProcessCompliance(workflow, projectData);
    
    // Enhance with AI-powered analysis
    const ai = getAiClient();
    if (!ai) return baseCompliance;

    try {
      const prompt = this.buildComplianceAnalysisPrompt(workflow, projectData, baseCompliance);
      const result = await ai.generateContent(prompt);
      const response = result.response.text();
      
      const enhancedCompliance = this.parseComplianceResponse(response, baseCompliance);
      return enhancedCompliance;
    } catch (error) {
      console.error('Error in AI compliance analysis:', error);
      return baseCompliance;
    }
  }

  /**
   * Analyzes current process intelligence and state
   */
  private static async analyzeProcessIntelligence(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): Promise<ProcessIntelligence> {
    const currentState = this.assessProcessState(context, projectData);
    const predictedOutcomes = await this.predictOutcomes(context, projectData);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(context, projectData);
    const riskIndicators = this.identifyRiskIndicators(context, projectData);
    const complianceStatus = await this.assessComplianceStatus(context, projectData);

    return {
      currentState,
      predictedOutcomes,
      optimizationOpportunities,
      riskIndicators,
      complianceStatus
    };
  }

  /**
   * Generates AI-powered orchestration decisions
   */
  private static async generateOrchestrationDecision(
    context: WorkflowOrchestrationContext,
    intelligence: ProcessIntelligence,
    projectData: ProjectData
  ): Promise<Omit<OrchestrationDecision, 'nextSteps'>> {
    const ai = getAiClient();
    if (!ai) {
      return this.generateFallbackDecision(context, intelligence);
    }

    try {
      const prompt = this.buildDecisionPrompt(context, intelligence, projectData);
      const result = await ai.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseDecisionResponse(response);
    } catch (error) {
      console.error('Error generating AI decision:', error);
      return this.generateFallbackDecision(context, intelligence);
    }
  }

  /**
   * Generates intelligent tasks based on orchestration decision
   */
  private static async generateIntelligentTasks(
    decision: Omit<OrchestrationDecision, 'nextSteps'>,
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): Promise<IntelligentTask[]> {
    const tasks: IntelligentTask[] = [];

    // Generate tasks based on decision action
    switch (decision.action) {
      case 'proceed':
        tasks.push(...this.generateProceedTasks(context, projectData));
        break;
      case 'pause':
        tasks.push(...this.generatePauseTasks(context, projectData));
        break;
      case 'escalate':
        tasks.push(...this.generateEscalationTasks(context, projectData));
        break;
      case 'optimize':
        tasks.push(...this.generateOptimizationTasks(context, projectData));
        break;
    }

    return tasks;
  }

  // Helper methods for process state assessment
  private static assessProcessState(context: WorkflowOrchestrationContext, projectData: ProjectData): ProcessState {
    // Calculate completion percentage based on requirements, tests, etc.
    const totalRequirements = projectData.requirements.length;
    const completedRequirements = projectData.requirements.filter(r => r.status === 'Approved').length;
    const completionPercentage = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

    // Assess quality trend based on recent activities
    const qualityTrend = this.assessQualityTrend(projectData);

    return {
      phase: context.projectPhase,
      completionPercentage,
      velocity: context.teamVelocity,
      qualityTrend,
      teamMorale: 7, // Mock data - in real implementation, survey or analyze team metrics
      technicalDebt: 3, // Mock data - analyze code metrics
      riskExposure: context.riskLevel === 'High' ? 8 : context.riskLevel === 'Medium' ? 5 : 2
    };
  }

  private static async predictOutcomes(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): Promise<PredictedOutcome[]> {
    // Simplified prediction logic - in real implementation, use ML models
    const outcomes: PredictedOutcome[] = [];

    if (context.teamVelocity > 0.8) {
      outcomes.push({
        scenario: 'On-time delivery',
        probability: 0.85,
        impact: 'Positive',
        timeframe: '2-4 weeks',
        confidence: 0.75,
        mitigationActions: ['Maintain current pace', 'Monitor for blockers']
      });
    }

    if (context.riskLevel === 'High') {
      outcomes.push({
        scenario: 'Schedule delay',
        probability: 0.65,
        impact: 'Negative',
        timeframe: '1-2 weeks',
        confidence: 0.80,
        mitigationActions: ['Address high-priority risks', 'Increase testing frequency']
      });
    }

    return outcomes;
  }

  private static identifyOptimizationOpportunities(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Check for automation opportunities
    if (projectData.testCases.filter(tc => tc.status === 'Not Run').length > 5) {
      opportunities.push({
        area: 'Process',
        title: 'Test Automation',
        description: 'Automate manual test cases to improve efficiency',
        potentialBenefit: '30% reduction in testing time',
        implementationEffort: 'Medium',
        priority: 'High',
        prerequisites: ['Test framework setup', 'CI/CD integration']
      });
    }

    // Check for documentation gaps
    const undocumentedCIs = projectData.configurationItems.filter(ci => !ci.designPatterns && !ci.keyInterfaces);
    if (undocumentedCIs.length > 3) {
      opportunities.push({
        area: 'Quality',
        title: 'Documentation Improvement',
        description: 'Improve component documentation for better maintainability',
        potentialBenefit: 'Reduced onboarding time and maintenance effort',
        implementationEffort: 'Low',
        priority: 'Medium',
        prerequisites: ['Documentation templates', 'Review process']
      });
    }

    return opportunities;
  }

  private static identifyRiskIndicators(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): RiskIndicator[] {
    const indicators: RiskIndicator[] = [];

    // Check for schedule risks
    if (context.teamVelocity < 0.6) {
      indicators.push({
        type: 'Schedule',
        severity: 'High',
        description: 'Team velocity below target threshold',
        earlyWarningSignals: ['Declining sprint completion rates', 'Increasing story cycle time'],
        mitigationStrategies: ['Remove blockers', 'Adjust scope', 'Add resources'],
        escalationTriggers: ['Velocity below 0.4 for 2 sprints', 'Critical milestone at risk']
      });
    }

    // Check for quality risks
    const failedTests = projectData.testCases.filter(tc => tc.status === 'Failed').length;
    if (failedTests > projectData.testCases.length * 0.1) {
      indicators.push({
        type: 'Quality',
        severity: 'Medium',
        description: 'High test failure rate indicates quality issues',
        earlyWarningSignals: ['Increasing defect rate', 'Test failures in critical paths'],
        mitigationStrategies: ['Increase code review rigor', 'Implement pair programming'],
        escalationTriggers: ['Failure rate above 20%', 'Critical functionality affected']
      });
    }

    return indicators;
  }

  private static async assessComplianceStatus(
    context: WorkflowOrchestrationContext,
    projectData: ProjectData
  ): Promise<ProcessComplianceStatus> {
    // Mock compliance assessment - in real implementation, integrate with compliance tools
    return {
      overallCompliance: 85,
      processAreas: {
        'PP': 90,
        'REQM': 85,
        'CM': 80,
        'VER': 88,
        'VAL': 82
      },
      violations: [],
      recommendations: [],
      lastAssessment: new Date().toISOString()
    };
  }

  // Task generation methods
  private static generateProceedTasks(context: WorkflowOrchestrationContext, projectData: ProjectData): IntelligentTask[] {
    return [
      {
        id: 'proceed-quality-check',
        type: 'Quality Gate',
        priority: 'Medium',
        title: 'Pre-proceed Quality Check',
        description: 'Verify quality metrics before proceeding',
        estimatedEffort: 15,
        prerequisites: [],
        automatable: true,
        processArea: 'VER',
        context,
        guidance: []
      }
    ];
  }

  private static generatePauseTasks(context: WorkflowOrchestrationContext, projectData: ProjectData): IntelligentTask[] {
    return [
      {
        id: 'pause-analysis',
        type: 'Process Check',
        priority: 'High',
        title: 'Analyze Pause Reasons',
        description: 'Investigate and document reasons for workflow pause',
        estimatedEffort: 30,
        prerequisites: [],
        automatable: false,
        processArea: 'PMC',
        context,
        guidance: []
      }
    ];
  }

  private static generateEscalationTasks(context: WorkflowOrchestrationContext, projectData: ProjectData): IntelligentTask[] {
    return [
      {
        id: 'escalation-report',
        type: 'Documentation',
        priority: 'Critical',
        title: 'Prepare Escalation Report',
        description: 'Document issues and prepare for management escalation',
        estimatedEffort: 45,
        prerequisites: [],
        automatable: false,
        processArea: 'PMC',
        context,
        guidance: []
      }
    ];
  }

  private static generateOptimizationTasks(context: WorkflowOrchestrationContext, projectData: ProjectData): IntelligentTask[] {
    return [
      {
        id: 'optimization-plan',
        type: 'Process Check',
        priority: 'Medium',
        title: 'Create Optimization Plan',
        description: 'Develop plan to optimize current workflow',
        estimatedEffort: 60,
        prerequisites: [],
        automatable: false,
        processArea: 'OPD',
        context,
        guidance: []
      }
    ];
  }

  // AI prompt building methods
  private static buildGuidancePrompt(activity: DevelopmentActivity, projectData: ProjectData): string {
    return `
You are an expert software process consultant. Analyze this development activity and provide intelligent process guidance.

Activity: ${activity.type}
Context: ${JSON.stringify(activity.metadata)}
Project Phase: ${this.inferProjectPhase(projectData)}

Current Project State:
- Requirements: ${projectData.requirements.length} (${projectData.requirements.filter(r => r.status === 'Approved').length} approved)
- Test Cases: ${projectData.testCases.length} (${projectData.testCases.filter(tc => tc.status === 'Passed').length} passed)
- Risks: ${projectData.risks.filter(r => r.status === 'Open').length} open risks

Provide guidance in JSON format:
{
  "guidance": [
    {
      "type": "suggestion|warning|requirement|best_practice",
      "processArea": "CMMI process area",
      "title": "guidance title",
      "description": "detailed description",
      "actionItems": ["action 1", "action 2"],
      "priority": "low|medium|high|critical",
      "timing": "immediate|before_merge|before_release|periodic"
    }
  ]
}
`;
  }

  private static buildComplianceAnalysisPrompt(
    workflow: DevelopmentWorkflow,
    projectData: ProjectData,
    baseCompliance: ProcessComplianceStatus
  ): string {
    return `
Analyze this workflow for CMMI compliance and provide enhanced recommendations.

Workflow: ${workflow.name}
Current Compliance: ${baseCompliance.overallCompliance}%
Process Areas: ${JSON.stringify(baseCompliance.processAreas)}

Workflow Stages: ${workflow.stages.map(s => `${s.name} (${s.status})`).join(', ')}

Provide enhanced compliance analysis in JSON format:
{
  "enhancedCompliance": number,
  "additionalViolations": [...],
  "improvedRecommendations": [...],
  "insights": [...]
}
`;
  }

  private static buildDecisionPrompt(
    context: WorkflowOrchestrationContext,
    intelligence: ProcessIntelligence,
    projectData: ProjectData
  ): string {
    return `
You are an AI workflow orchestrator. Make an intelligent decision about how to proceed.

Current Context:
- Activity: ${context.currentActivity.type}
- Phase: ${context.projectPhase}
- Risk Level: ${context.riskLevel}
- Team Velocity: ${context.teamVelocity}

Process Intelligence:
- Completion: ${intelligence.currentState.completionPercentage}%
- Quality Trend: ${intelligence.currentState.qualityTrend}
- Risk Exposure: ${intelligence.currentState.riskExposure}

Make a decision in JSON format:
{
  "action": "proceed|pause|escalate|redirect|optimize",
  "reasoning": "detailed explanation",
  "confidence": 0-100,
  "alternatives": ["alternative 1", "alternative 2"],
  "riskMitigation": ["mitigation 1", "mitigation 2"]
}
`;
  }

  // Response parsing methods
  private static parseGuidanceResponse(response: string): ProcessGuidance[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.guidance || [];
    } catch (error) {
      console.error('Error parsing guidance response:', error);
      return [];
    }
  }

  private static parseComplianceResponse(response: string, baseCompliance: ProcessComplianceStatus): ProcessComplianceStatus {
    try {
      const parsed = JSON.parse(response);
      return {
        ...baseCompliance,
        overallCompliance: parsed.enhancedCompliance || baseCompliance.overallCompliance,
        violations: [...baseCompliance.violations, ...(parsed.additionalViolations || [])],
        recommendations: [...baseCompliance.recommendations, ...(parsed.improvedRecommendations || [])]
      };
    } catch (error) {
      console.error('Error parsing compliance response:', error);
      return baseCompliance;
    }
  }

  private static parseDecisionResponse(response: string): Omit<OrchestrationDecision, 'nextSteps'> {
    try {
      const parsed = JSON.parse(response);
      return {
        action: parsed.action || 'proceed',
        reasoning: parsed.reasoning || 'No specific reasoning provided',
        confidence: parsed.confidence || 50,
        alternatives: parsed.alternatives || [],
        riskMitigation: parsed.riskMitigation || []
      };
    } catch (error) {
      console.error('Error parsing decision response:', error);
      return this.generateFallbackDecision({} as any, {} as any);
    }
  }

  // Utility methods
  private static generateFallbackDecision(
    context: WorkflowOrchestrationContext,
    intelligence: ProcessIntelligence
  ): Omit<OrchestrationDecision, 'nextSteps'> {
    return {
      action: 'proceed',
      reasoning: 'Fallback decision due to AI unavailability',
      confidence: 60,
      alternatives: ['Manual review', 'Escalate to team lead'],
      riskMitigation: ['Monitor progress closely', 'Implement additional quality checks']
    };
  }

  private static mergeGuidance(aiGuidance: ProcessGuidance[], standardGuidance: ProcessGuidance[]): ProcessGuidance[] {
    const merged = [...aiGuidance];
    
    standardGuidance.forEach(standard => {
      const exists = merged.some(ai => ai.title === standard.title && ai.processArea === standard.processArea);
      if (!exists) {
        merged.push(standard);
      }
    });

    return merged.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static assessQualityTrend(projectData: ProjectData): 'Improving' | 'Stable' | 'Declining' {
    // Simplified quality trend analysis
    const passedTests = projectData.testCases.filter(tc => tc.status === 'Passed').length;
    const totalTests = projectData.testCases.length;
    const passRate = totalTests > 0 ? passedTests / totalTests : 1;

    if (passRate > 0.9) return 'Improving';
    if (passRate > 0.7) return 'Stable';
    return 'Declining';
  }

  private static inferProjectPhase(projectData: ProjectData): string {
    const approvedReqs = projectData.requirements.filter(r => r.status === 'Approved').length;
    const totalReqs = projectData.requirements.length;
    const passedTests = projectData.testCases.filter(tc => tc.status === 'Passed').length;
    const totalTests = projectData.testCases.length;

    if (totalReqs === 0) return 'Planning';
    if (approvedReqs / totalReqs < 0.8) return 'Planning';
    if (totalTests === 0 || passedTests / totalTests < 0.5) return 'Development';
    if (passedTests / totalTests < 0.9) return 'Testing';
    return 'Deployment';
  }
}
