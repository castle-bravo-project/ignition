import { DocumentSectionData, ProjectData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'completeness'
    | 'consistency'
    | 'traceability'
    | 'quality'
    | 'compliance';
  title: string;
  description: string;
  affectedItems: string[];
  suggestedFix?: string;
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  criteria: QualityCriteria[];
  requiredScore: number;
  isBlocking: boolean;
}

export interface QualityCriteria {
  id: string;
  name: string;
  weight: number;
  validator: (data: ProjectData) => ValidationResult;
}

// Document Completeness Validation
export const validateDocumentCompleteness = (
  data: ProjectData
): ValidationResult => {
  const issues: ValidationIssue[] = [];
  let totalSections = 0;
  let completeSections = 0;

  Object.values(data.documents).forEach((doc) => {
    const checkSection = (section: DocumentSectionData, path: string) => {
      totalSections++;
      const isComplete = section.description && section.description.length > 50;
      if (isComplete) completeSections++;
      else {
        issues.push({
          id: `doc-incomplete-${section.id}`,
          severity: 'medium',
          category: 'completeness',
          title: 'Incomplete Document Section',
          description: `Section "${section.title}" in document "${doc.title}" lacks sufficient detail`,
          affectedItems: [section.id],
          suggestedFix: 'Add detailed description (minimum 50 characters)',
        });
      }
      section.children?.forEach((child) =>
        checkSection(child, `${path}.${child.id}`)
      );
    };

    doc.content?.forEach((section) => checkSection(section, section.id));
  });

  const score =
    totalSections > 0
      ? Math.round((completeSections / totalSections) * 100)
      : 0;

  return {
    isValid: score >= 80,
    score,
    issues,
    recommendations:
      score < 80
        ? ['Complete all document sections with detailed descriptions']
        : [],
  };
};

// Requirements Quality Validation
export const validateRequirementsQuality = (
  data: ProjectData
): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const requirements = data.requirements;

  // Check for orphaned requirements
  const linkedReqIds = new Set(Object.keys(data.links));
  const orphanedReqs = requirements.filter((req) => !linkedReqIds.has(req.id));

  orphanedReqs.forEach((req) => {
    issues.push({
      id: `req-orphaned-${req.id}`,
      severity: 'high',
      category: 'traceability',
      title: 'Orphaned Requirement',
      description: `Requirement "${req.id}" is not linked to any test cases or configuration items`,
      affectedItems: [req.id],
      suggestedFix:
        'Link requirement to appropriate test cases and configuration items',
    });
  });

  // Check requirement description quality
  requirements.forEach((req) => {
    if (!req.description || req.description.length < 20) {
      issues.push({
        id: `req-quality-${req.id}`,
        severity: 'medium',
        category: 'quality',
        title: 'Poor Requirement Quality',
        description: `Requirement "${req.id}" has insufficient description`,
        affectedItems: [req.id],
        suggestedFix:
          'Provide detailed, clear requirement description (minimum 20 characters)',
      });
    }

    // Check for ambiguous language
    const ambiguousWords = ['should', 'could', 'might', 'probably', 'maybe'];
    const hasAmbiguousLanguage = ambiguousWords.some((word) =>
      req.description.toLowerCase().includes(word)
    );

    if (hasAmbiguousLanguage) {
      issues.push({
        id: `req-ambiguous-${req.id}`,
        severity: 'medium',
        category: 'quality',
        title: 'Ambiguous Requirement Language',
        description: `Requirement "${req.id}" contains ambiguous language`,
        affectedItems: [req.id],
        suggestedFix: 'Use precise language like "shall", "must", or "will"',
      });
    }
  });

  const score = Math.max(0, 100 - issues.length * 10);

  return {
    isValid:
      issues.filter((i) => i.severity === 'critical' || i.severity === 'high')
        .length === 0,
    score,
    issues,
    recommendations: [
      'Ensure all requirements are linked to test cases',
      'Use precise, unambiguous language in requirements',
      'Provide detailed descriptions for all requirements',
    ],
  };
};

// Risk Assessment Validation
export const validateRiskAssessment = (data: ProjectData): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const risks = data.risks;

  // Check for unmitigated high-impact risks
  const highImpactOpenRisks = risks.filter(
    (risk) => risk.impact === 'High' && risk.status === 'Open'
  );

  highImpactOpenRisks.forEach((risk) => {
    issues.push({
      id: `risk-unmitigated-${risk.id}`,
      severity: 'critical',
      category: 'compliance',
      title: 'Unmitigated High-Impact Risk',
      description: `High-impact risk "${risk.id}" remains open without mitigation`,
      affectedItems: [risk.id],
      suggestedFix: 'Develop and implement risk mitigation strategy',
    });
  });

  // Check risk-CI traceability
  const riskCiLinks = data.riskCiLinks || {};
  const unlinkedRisks = risks.filter(
    (risk) => !riskCiLinks[risk.id] || riskCiLinks[risk.id].length === 0
  );

  unlinkedRisks.forEach((risk) => {
    issues.push({
      id: `risk-unlinked-${risk.id}`,
      severity: 'medium',
      category: 'traceability',
      title: 'Risk Not Linked to Configuration Items',
      description: `Risk "${risk.id}" is not linked to any configuration items`,
      affectedItems: [risk.id],
      suggestedFix:
        'Link risk to relevant configuration items that could be affected',
    });
  });

  const score = Math.max(0, 100 - issues.length * 15);

  return {
    isValid: issues.filter((i) => i.severity === 'critical').length === 0,
    score,
    issues,
    recommendations: [
      'Mitigate all high-impact risks',
      'Link risks to affected configuration items',
      'Regularly review and update risk status',
    ],
  };
};

// Traceability Validation
export const validateTraceability = (data: ProjectData): ValidationResult => {
  const issues: ValidationIssue[] = [];

  // Check requirement-test traceability
  const reqsWithoutTests = data.requirements.filter(
    (req) => !data.links[req.id]?.tests || data.links[req.id].tests.length === 0
  );

  reqsWithoutTests.forEach((req) => {
    issues.push({
      id: `trace-req-test-${req.id}`,
      severity: 'high',
      category: 'traceability',
      title: 'Missing Requirement-Test Traceability',
      description: `Requirement "${req.id}" has no linked test cases`,
      affectedItems: [req.id],
      suggestedFix: 'Create and link test cases to verify this requirement',
    });
  });

  // Check for orphaned test cases
  const linkedTestIds = new Set(
    Object.values(data.links).flatMap((link) => link.tests)
  );
  const orphanedTests = data.testCases.filter(
    (test) => !linkedTestIds.has(test.id)
  );

  orphanedTests.forEach((test) => {
    issues.push({
      id: `trace-test-orphaned-${test.id}`,
      severity: 'medium',
      category: 'traceability',
      title: 'Orphaned Test Case',
      description: `Test case "${test.id}" is not linked to any requirement`,
      affectedItems: [test.id],
      suggestedFix: 'Link test case to appropriate requirements',
    });
  });

  const score = Math.max(0, 100 - issues.length * 12);

  return {
    isValid:
      issues.filter((i) => i.severity === 'critical' || i.severity === 'high')
        .length === 0,
    score,
    issues,
    recommendations: [
      'Ensure all requirements have associated test cases',
      'Link all test cases to requirements',
      'Maintain bidirectional traceability',
    ],
  };
};

// Quality Gates Definition
export const qualityGates: QualityGate[] = [
  {
    id: 'requirements-gate',
    name: 'Requirements Quality Gate',
    description: 'Ensures all requirements meet quality standards',
    criteria: [
      {
        id: 'req-completeness',
        name: 'Requirements Completeness',
        weight: 0.4,
        validator: validateRequirementsQuality,
      },
      {
        id: 'req-traceability',
        name: 'Requirements Traceability',
        weight: 0.6,
        validator: validateTraceability,
      },
    ],
    requiredScore: 85,
    isBlocking: true,
  },
  {
    id: 'documentation-gate',
    name: 'Documentation Quality Gate',
    description: 'Ensures documentation completeness and quality',
    criteria: [
      {
        id: 'doc-completeness',
        name: 'Document Completeness',
        weight: 1.0,
        validator: validateDocumentCompleteness,
      },
    ],
    requiredScore: 80,
    isBlocking: false,
  },
  {
    id: 'risk-gate',
    name: 'Risk Management Gate',
    description: 'Ensures proper risk assessment and mitigation',
    criteria: [
      {
        id: 'risk-assessment',
        name: 'Risk Assessment Quality',
        weight: 1.0,
        validator: validateRiskAssessment,
      },
    ],
    requiredScore: 90,
    isBlocking: true,
  },
];

// Comprehensive Quality Assessment
export const performQualityAssessment = (
  data: ProjectData
): {
  overallScore: number;
  gateResults: {
    [gateId: string]: {
      passed: boolean;
      score: number;
      issues: ValidationIssue[];
    };
  };
  allIssues: ValidationIssue[];
  recommendations: string[];
  isReadyForRelease: boolean;
} => {
  const gateResults: {
    [gateId: string]: {
      passed: boolean;
      score: number;
      issues: ValidationIssue[];
    };
  } = {};
  const allIssues: ValidationIssue[] = [];
  const allRecommendations: string[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  qualityGates.forEach((gate) => {
    let gateScore = 0;
    let gateWeight = 0;
    const gateIssues: ValidationIssue[] = [];

    gate.criteria.forEach((criteria) => {
      const result = criteria.validator(data);
      gateScore += result.score * criteria.weight;
      gateWeight += criteria.weight;
      gateIssues.push(...result.issues);
      allRecommendations.push(...result.recommendations);
    });

    const finalGateScore = gateWeight > 0 ? gateScore / gateWeight : 0;
    const gatePassed = finalGateScore >= gate.requiredScore;

    gateResults[gate.id] = {
      passed: gatePassed,
      score: Math.round(finalGateScore),
      issues: gateIssues,
    };

    allIssues.push(...gateIssues);
    totalWeightedScore += finalGateScore;
    totalWeight += 1;
  });

  const overallScore =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const blockingGatesFailed = qualityGates
    .filter((gate) => gate.isBlocking)
    .some((gate) => !gateResults[gate.id].passed);

  return {
    overallScore,
    gateResults,
    allIssues,
    recommendations: [...new Set(allRecommendations)],
    isReadyForRelease: !blockingGatesFailed && overallScore >= 85,
  };
};

// Custom Validation Rules Engine
export interface CustomValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'completeness'
    | 'consistency'
    | 'traceability'
    | 'quality'
    | 'compliance';
  validator: (data: ProjectData) => {
    isValid: boolean;
    message?: string;
    affectedItems?: string[];
  };
}

export const customValidationRules: CustomValidationRule[] = [
  {
    id: 'min-requirements-count',
    name: 'Minimum Requirements Count',
    description: 'Project must have at least 5 requirements',
    severity: 'high',
    category: 'completeness',
    validator: (data) => ({
      isValid: data.requirements.length >= 5,
      message: `Project has ${data.requirements.length} requirements, minimum 5 required`,
      affectedItems: ['requirements'],
    }),
  },
  {
    id: 'test-coverage-ratio',
    name: 'Test Coverage Ratio',
    description: 'At least 80% of requirements must have test cases',
    severity: 'high',
    category: 'traceability',
    validator: (data) => {
      const reqsWithTests = data.requirements.filter(
        (req) =>
          data.links[req.id]?.tests && data.links[req.id].tests.length > 0
      ).length;
      const coverage =
        data.requirements.length > 0
          ? (reqsWithTests / data.requirements.length) * 100
          : 0;
      return {
        isValid: coverage >= 80,
        message: `Test coverage is ${Math.round(
          coverage
        )}%, minimum 80% required`,
        affectedItems: ['requirements', 'testCases'],
      };
    },
  },
];

export const validateCustomRules = (data: ProjectData): ValidationResult => {
  const issues: ValidationIssue[] = [];

  customValidationRules.forEach((rule) => {
    const result = rule.validator(data);
    if (!result.isValid) {
      issues.push({
        id: `custom-${rule.id}`,
        severity: rule.severity,
        category: rule.category,
        title: rule.name,
        description: result.message || rule.description,
        affectedItems: result.affectedItems || [],
        suggestedFix: `Address the ${rule.name} validation rule`,
      });
    }
  });

  const score = Math.max(0, 100 - issues.length * 20);

  return {
    isValid:
      issues.filter((i) => i.severity === 'critical' || i.severity === 'high')
        .length === 0,
    score,
    issues,
    recommendations: ['Ensure all custom validation rules pass'],
  };
};
