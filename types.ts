export type Page =
  | 'Dashboard'
  | 'Documents'
  | 'Requirements'
  | 'Test Cases'
  | 'Configuration'
  | 'Architecture'
  | 'Organizational Intelligence'
  | 'Risks'
  | 'CMMI'
  | 'Settings'
  | 'Audit Log'
  | 'Badges'
  | 'Pull Requests'
  | 'Issues'
  | 'Process Assets'
  | 'Quality Assurance'
  | 'Compliance'
  | 'Compliance Dashboard'
  | 'Security'
  | 'AI Assessment';

export interface Metric {
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export interface Badge {
  category: string;
  label: string;
  message: string;
  color: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface DocumentSectionData {
  id: string;
  title: string;
  description: string;
  maturityLevel: number;
  cmmiPaIds: string[];
  children: DocumentSectionData[];
}

export interface Document {
  id: string;
  title: string;
  content: DocumentSectionData[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  actor: 'User' | 'AI' | 'System' | 'Automation';
  eventType: string; // e.g., 'REQUIREMENT_CREATE', 'DOCUMENT_UPDATE'
  summary: string;
  details: Record<string, any>; // e.g., { before: {...}, after: {...} }
}

// Base for auditable items
interface Auditable {
  createdAt: string;
  updatedAt: string;
  createdBy: 'User' | 'AI' | 'System' | 'Automation';
  updatedBy: 'User' | 'AI' | 'System' | 'Automation';
}

export interface Requirement extends Auditable {
  id: string;
  description: string;
  status: 'Proposed' | 'Active' | 'Implemented' | 'Verified';
  priority: 'High' | 'Medium' | 'Low';
}

export interface TestCase extends Auditable {
  id: string;
  description: string;
  status: 'Not Run' | 'Passed' | 'Failed';
  gherkin?: string;
}

export interface Risk extends Auditable {
  id: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface ConfigurationItem extends Auditable {
  id: string;
  name: string;
  type:
    | 'Software Component'
    | 'Document'
    | 'Tool'
    | 'Hardware'
    | 'Architectural Product'
    | 'Service'
    | 'Database'
    | 'API'
    | 'Infrastructure';
  version: string;
  status: 'Baseline' | 'In Development' | 'Deprecated' | 'Planned' | 'Retired';
  dependencies?: string[];
  designPatterns?: string;
  keyInterfaces?: string;
  // Enhanced architectural properties
  architecturalLayer?:
    | 'Presentation'
    | 'Business'
    | 'Data'
    | 'Infrastructure'
    | 'Integration';
  technologyStack?: string[];
  deploymentModel?: 'On-Premise' | 'Cloud' | 'Hybrid' | 'Edge';
  scalabilityPattern?: 'Horizontal' | 'Vertical' | 'Auto-scaling' | 'Static';
  securityClassification?:
    | 'Public'
    | 'Internal'
    | 'Confidential'
    | 'Restricted';
  businessCapabilities?: string[];
  qualityAttributes?: {
    performance?: number; // 1-5 scale
    reliability?: number;
    security?: number;
    maintainability?: number;
    scalability?: number;
  };
  metrics?: {
    complexity?: number;
    coupling?: number;
    cohesion?: number;
    testCoverage?: number;
    technicalDebt?: number;
  };
}

export interface ProcessAsset extends Auditable {
  id: string;
  type:
    | 'Requirement Archetype'
    | 'Solution Blueprint'
    | 'Risk Playbook'
    | 'Test Strategy';
  name: string;
  description: string;
  content: string; // Could be Markdown or structured JSON as a string
  tags?: string[];
}

export interface GitHubSettings {
  repoUrl: string;
  pat: string;
  filePath: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
}

export interface PullRequest {
  number: number;
  title: string;
  user: {
    login: string;
  };
  html_url: string;
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface PullRequestFile {
  filename: string;
  status:
    | 'added'
    | 'removed'
    | 'modified'
    | 'renamed'
    | 'copied'
    | 'changed'
    | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
}

export interface PrAnalysisResult {
  summary: string;
  linkedRequirements: Requirement[];
  linkedCis: ConfigurationItem[];
  linkedRisks: Risk[];
  suggestedCommitMessage: string;
}

export interface ProjectData {
  projectName: string;
  documents: {
    [key: string]: Document;
  };
  requirements: Requirement[];
  testCases: TestCase[];
  configurationItems: ConfigurationItem[];
  processAssets: ProcessAsset[];
  risks: Risk[];
  links: {
    [reqId: string]: {
      tests: string[];
      risks: string[];
      cis: string[];
      issues: number[];
    };
  };
  riskCiLinks: {
    [riskId: string]: string[];
  };
  issueCiLinks: {
    [issueNumber: number]: string[];
  };
  issueRiskLinks: {
    [issueNumber: number]: string[];
  };
  assetLinks: {
    [assetId: string]: {
      requirements: string[];
      risks: string[];
      cis: string[];
    };
  };
  assetUsage: {
    [assetId: string]: {
      usageCount: number;
      lastUsed: string;
      generatedItems: {
        type: 'requirement' | 'risk' | 'test' | 'ci';
        id: string;
        createdAt: string;
        timeToImplement?: number; // minutes
        associatedBugs?: number;
        userFeedback?: 'positive' | 'negative' | 'neutral';
        implementationSuccess?: boolean;
      }[];
      performanceMetrics: {
        avgTimeToImplement: number;
        successRate: number;
        bugRate: number;
        userSatisfactionScore: number;
        lastCalculated: string;
      };
      feedbackHistory: {
        timestamp: string;
        feedback: 'positive' | 'negative' | 'neutral';
        context: string;
        userId?: string;
      }[];
    };
  };
  auditLog: AuditLogEntry[];
  organizationalData?: OrganizationalIntelligence;
  abTests?: ABTestConfig[];
  assetEvolutionHistory?: AssetEvolutionHistory[];
  // Phase 5: Advanced Architecture Data
  architecturalViews?: ArchitecturalView[];
  architecturalPatterns?: ArchitecturalPattern[];
  architecturalAnalysis?: ArchitecturalAnalysis;
  technologyPortfolio?: TechnologyPortfolio;
  // Phase 5: Live Development Process Integration
  developmentWorkflows?: DevelopmentWorkflow[];
  developmentActivities?: DevelopmentActivity[];
  processComplianceStatus?: ProcessComplianceStatus;
  [key: string]: any;
}

// Phase 4: Organizational Intelligence Types
export interface OrganizationalIntelligence {
  organizationId: string;
  lastSync: string;
  crossProjectAssets: CrossProjectAsset[];
  organizationalMetrics: OrganizationalMetrics;
  assetEvolution: AssetEvolutionHistory[];
  benchmarkData: BenchmarkData;
}

export interface CrossProjectAsset extends ProcessAsset {
  sourceProjects: string[];
  crossProjectUsage: {
    [projectId: string]: {
      usageCount: number;
      successRate: number;
      lastUsed: string;
      adaptations: string[];
    };
  };
  organizationalRank: number;
  maturityScore: number;
}

export interface OrganizationalMetrics {
  totalProjects: number;
  totalAssets: number;
  avgAssetReuse: number;
  organizationalMaturityLevel: number;
  assetEffectivenessDistribution: {
    excellent: number; // 80-100%
    good: number; // 60-79%
    fair: number; // 40-59%
    poor: number; // 0-39%
  };
  trendAnalysis: {
    assetGrowthRate: number;
    reuseGrowthRate: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
  };
}

export interface AssetEvolutionHistory {
  assetId: string;
  versions: AssetVersion[];
  evolutionTriggers: EvolutionTrigger[];
  performanceHistory: PerformanceSnapshot[];
}

export interface AssetVersion {
  version: string;
  timestamp: string;
  changes: string[];
  performanceImpact: number;
  approvedBy: string;
  rollbackAvailable: boolean;
}

export interface EvolutionTrigger {
  timestamp: string;
  trigger:
    | 'performance_decline'
    | 'user_feedback'
    | 'pattern_analysis'
    | 'manual_review';
  details: string;
  actionTaken: string;
}

export interface PerformanceSnapshot {
  timestamp: string;
  metrics: {
    usageCount: number;
    successRate: number;
    userSatisfaction: number;
    bugRate: number;
    timeToImplement: number;
  };
  projectCount: number;
}

export interface BenchmarkData {
  industryAverages: {
    assetReuseRate: number;
    avgSuccessRate: number;
    avgTimeToImplement: number;
  };
  organizationRanking: {
    percentile: number;
    category: 'top_performer' | 'above_average' | 'average' | 'below_average';
  };
  competitiveAnalysis: {
    strengths: string[];
    improvementAreas: string[];
    recommendations: string[];
  };
}

export interface ABTestConfig {
  testId: string;
  assetId: string;
  variants: {
    A: ProcessAsset;
    B: ProcessAsset;
  };
  trafficSplit: number;
  startDate: string;
  endDate?: string;
  targetMetric:
    | 'success_rate'
    | 'time_to_implement'
    | 'user_satisfaction'
    | 'bug_rate';
  minimumSampleSize: number;
  status: 'active' | 'completed' | 'paused';
}

// Phase 5: Advanced Architectural Modeling Types
export interface ArchitecturalView {
  id: string;
  name: string;
  type:
    | 'Logical'
    | 'Physical'
    | 'Development'
    | 'Process'
    | 'Scenarios'
    | 'Data'
    | 'Security';
  description: string;
  components: string[]; // CI IDs
  relationships: ArchitecturalRelationship[];
  viewSpecificData?: any;
}

export interface ArchitecturalRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type:
    | 'depends_on'
    | 'calls'
    | 'contains'
    | 'implements'
    | 'extends'
    | 'uses'
    | 'deploys_to'
    | 'communicates_with';
  strength: 'weak' | 'medium' | 'strong';
  protocol?: string;
  dataFlow?: 'unidirectional' | 'bidirectional';
  frequency?: 'low' | 'medium' | 'high';
  criticality?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ArchitecturalPattern {
  id: string;
  name: string;
  type:
    | 'Structural'
    | 'Behavioral'
    | 'Creational'
    | 'Architectural'
    | 'Integration';
  description: string;
  components: string[];
  benefits: string[];
  tradeoffs: string[];
  implementationGuidance: string;
}

export interface ArchitecturalAnalysis {
  timestamp: string;
  systemComplexity: {
    overall: number; // 1-10 scale
    componentCount: number;
    relationshipCount: number;
    cyclomaticComplexity: number;
    layerViolations: number;
  };
  qualityMetrics: {
    coupling: number; // 0-1 scale (lower is better)
    cohesion: number; // 0-1 scale (higher is better)
    modularity: number;
    reusability: number;
    maintainability: number;
  };
  architecturalSmells: ArchitecturalSmell[];
  recommendations: ArchitecturalRecommendation[];
  technologyDiversity: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    platforms: string[];
    diversityScore: number;
  };
}

export interface ArchitecturalSmell {
  id: string;
  type:
    | 'God_Component'
    | 'Chatty_Service'
    | 'Data_Clumps'
    | 'Circular_Dependencies'
    | 'Unused_Components'
    | 'Technology_Sprawl';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedComponents: string[];
  impact: string;
  remediation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface ArchitecturalRecommendation {
  id: string;
  category:
    | 'Performance'
    | 'Security'
    | 'Maintainability'
    | 'Scalability'
    | 'Reliability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  implementationSteps: string[];
  estimatedEffort: string;
  expectedBenefits: string[];
  risks: string[];
}

export interface TechnologyPortfolio {
  categories: {
    [category: string]: TechnologyCategory;
  };
  riskAssessment: TechnologyRiskAssessment;
  evolutionPlan: TechnologyEvolutionPlan;
  complianceStatus: TechnologyComplianceStatus;
}

export interface TechnologyCategory {
  name: string;
  technologies: Technology[];
  standardization: 'High' | 'Medium' | 'Low';
  strategicAlignment: 'Core' | 'Supporting' | 'Emerging' | 'Legacy';
}

export interface Technology {
  name: string;
  version: string;
  vendor: string;
  licenseType: 'Open Source' | 'Commercial' | 'Proprietary' | 'Hybrid';
  maturity: 'Emerging' | 'Growing' | 'Mature' | 'Declining';
  supportStatus: 'Active' | 'Maintenance' | 'End of Life' | 'Unknown';
  usageCount: number;
  lastUpdated: string;
  securityRating: number; // 1-5 scale
  performanceRating: number;
  communitySupport: number;
}

export interface TechnologyRiskAssessment {
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: TechnologyRisk[];
  mitigationStrategies: string[];
}

export interface TechnologyRisk {
  type:
    | 'End of Life'
    | 'Security Vulnerability'
    | 'Vendor Lock-in'
    | 'Skill Gap'
    | 'Performance'
    | 'Compliance';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: 'Low' | 'Medium' | 'High';
  impact: string;
  affectedTechnologies: string[];
  mitigationPlan: string;
}

export interface TechnologyEvolutionPlan {
  phases: EvolutionPhase[];
  timeline: string;
  budget: string;
  riskMitigation: string[];
}

export interface EvolutionPhase {
  name: string;
  duration: string;
  objectives: string[];
  technologies: {
    adopt: string[];
    trial: string[];
    assess: string[];
    hold: string[];
  };
  dependencies: string[];
  risks: string[];
}

export interface TechnologyComplianceStatus {
  frameworks: ComplianceFramework[];
  overallCompliance: number; // 0-100%
  gaps: ComplianceGap[];
  recommendations: string[];
}

export interface ComplianceFramework {
  name: string;
  version: string;
  applicableStandards: string[];
  complianceLevel: number; // 0-100%
  lastAssessment: string;
  nextReview: string;
}

export interface ComplianceGap {
  standard: string;
  requirement: string;
  currentState: string;
  targetState: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  effort: string;
  timeline: string;
}

// Phase 5: Live Development Process Integration Types
export interface DevelopmentWorkflow {
  id: string;
  name: string;
  type: 'CI/CD' | 'Code Review' | 'Testing' | 'Deployment' | 'Monitoring';
  status: 'Active' | 'Paused' | 'Failed' | 'Completed';
  stages: WorkflowStage[];
  triggers: WorkflowTrigger[];
  integrations: WorkflowIntegration[];
  metrics: WorkflowMetrics;
  processCompliance: ProcessComplianceStatus;
}

export interface WorkflowStage {
  id: string;
  name: string;
  type:
    | 'Build'
    | 'Test'
    | 'Security Scan'
    | 'Quality Gate'
    | 'Deploy'
    | 'Verify';
  status: 'Pending' | 'Running' | 'Success' | 'Failed' | 'Skipped';
  duration?: number; // milliseconds
  startTime?: string;
  endTime?: string;
  artifacts: WorkflowArtifact[];
  qualityGates: QualityGate[];
  processChecks: ProcessCheck[];
}

export interface WorkflowTrigger {
  type: 'Push' | 'Pull Request' | 'Schedule' | 'Manual' | 'Dependency Update';
  conditions: string[];
  branch?: string;
  schedule?: string;
}

export interface WorkflowIntegration {
  service:
    | 'GitHub Actions'
    | 'Jenkins'
    | 'Azure DevOps'
    | 'GitLab CI'
    | 'CircleCI';
  endpoint: string;
  authentication: 'Token' | 'OAuth' | 'Certificate';
  capabilities: string[];
  lastSync: string;
  status: 'Connected' | 'Disconnected' | 'Error';
}

export interface WorkflowMetrics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
  failureReasons: { [reason: string]: number };
  performanceTrend: 'Improving' | 'Stable' | 'Degrading';
  lastExecution: string;
}

export interface WorkflowArtifact {
  id: string;
  name: string;
  type:
    | 'Build Output'
    | 'Test Results'
    | 'Security Report'
    | 'Coverage Report'
    | 'Documentation';
  path: string;
  size: number;
  checksum: string;
  metadata: { [key: string]: any };
}

export interface QualityGate {
  id: string;
  name: string;
  type: 'Coverage' | 'Security' | 'Performance' | 'Complexity' | 'Compliance';
  threshold: number;
  actualValue: number;
  status: 'Passed' | 'Failed' | 'Warning';
  blocking: boolean;
  message: string;
}

export interface ProcessCheck {
  id: string;
  processArea: string; // CMMI Process Area
  requirement: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Not Applicable';
  evidence: string[];
  gaps: string[];
  recommendations: string[];
}

export interface ProcessComplianceStatus {
  overallCompliance: number; // 0-100%
  processAreas: { [area: string]: number };
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
  lastAssessment: string;
}

export interface ComplianceViolation {
  id: string;
  processArea: string;
  requirement: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  impact: string;
  remediation: string;
  dueDate?: string;
}

export interface ComplianceRecommendation {
  id: string;
  category:
    | 'Process Improvement'
    | 'Tool Integration'
    | 'Training'
    | 'Documentation';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  benefits: string[];
  effort: string;
  timeline: string;
}

export interface DevelopmentActivity {
  id: string;
  type:
    | 'Commit'
    | 'Pull Request'
    | 'Build'
    | 'Test'
    | 'Deploy'
    | 'Issue'
    | 'Review';
  timestamp: string;
  actor: string;
  repository: string;
  branch?: string;
  metadata: { [key: string]: any };
  relatedRequirements: string[];
  relatedRisks: string[];
  relatedCIs: string[];
  processImpact: ProcessImpact;
  qualityImpact: QualityImpact;
}

export interface ProcessImpact {
  affectedProcessAreas: string[];
  complianceChange: number; // -100 to +100
  traceabilityUpdates: TraceabilityUpdate[];
  documentationNeeded: string[];
}

export interface QualityImpact {
  codeQuality: number; // -100 to +100
  testCoverage: number;
  securityRisk: number;
  performanceImpact: number;
  maintainabilityChange: number;
}

export interface TraceabilityUpdate {
  type: 'Added' | 'Modified' | 'Removed';
  sourceType: 'Requirement' | 'Risk' | 'CI' | 'Test';
  sourceId: string;
  targetType: 'Commit' | 'PR' | 'Issue' | 'Build';
  targetId: string;
  confidence: number; // 0-100%
  method: 'Manual' | 'Automatic' | 'AI-Suggested';
}

export interface ProcessGuidance {
  type: 'suggestion' | 'warning' | 'requirement' | 'best_practice';
  processArea: string;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  timing: 'immediate' | 'before_merge' | 'before_release' | 'periodic';
}

export interface ProcessAreaStatus {
  id: string;
  name: string;
  level: number;
  score: number; // 0-100
  evidence: string[];
  gaps: string[];
  isSatisfied: boolean;
}

export interface CmmiAssessment {
  maturityLevel: number;
  levelProgress: number; // 0-100 progress to next level
  processAreasByLevel: { [level: number]: ProcessAreaStatus[] };
}
