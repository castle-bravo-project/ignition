/**
 * Advanced Architectural Analysis Service - Phase 5 Implementation
 *
 * This service provides enterprise-grade architectural modeling, analysis, and intelligence
 * including complexity analysis, architectural smells detection, and technology portfolio management.
 */

import {
  ArchitecturalAnalysis,
  ArchitecturalRecommendation,
  ArchitecturalSmell,
  ConfigurationItem,
  ProjectData,
} from '../types';

export interface ArchitecturalInsights {
  complexity: ComplexityAnalysis;
  qualityMetrics: QualityMetrics;
  smells: ArchitecturalSmell[];
  recommendations: ArchitecturalRecommendation[];
  patterns: DetectedPattern[];
  dependencies: DependencyAnalysis;
}

export interface ComplexityAnalysis {
  overall: number;
  byLayer: { [layer: string]: number };
  byComponent: { [componentId: string]: number };
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  structuralComplexity: number;
}

export interface QualityMetrics {
  coupling: number;
  cohesion: number;
  modularity: number;
  reusability: number;
  maintainability: number;
  testability: number;
  deployability: number;
}

export interface DetectedPattern {
  name: string;
  type: string;
  confidence: number;
  components: string[];
  description: string;
  benefits: string[];
  concerns: string[];
}

export interface DependencyAnalysis {
  totalDependencies: number;
  circularDependencies: string[][];
  criticalPath: string[];
  fanIn: { [componentId: string]: number };
  fanOut: { [componentId: string]: number };
  instability: { [componentId: string]: number };
  abstractness: { [componentId: string]: number };
}

/**
 * Service for advanced architectural analysis and modeling
 */
export class ArchitecturalAnalysisService {
  /**
   * Performs comprehensive architectural analysis
   */
  static analyzeArchitecture(projectData: ProjectData): ArchitecturalAnalysis {
    const { configurationItems } = projectData;

    const complexity = this.analyzeComplexity(configurationItems);
    const qualityMetrics = this.calculateQualityMetrics(configurationItems);
    const smells = this.detectArchitecturalSmells(configurationItems);
    const recommendations = this.generateRecommendations(
      complexity,
      qualityMetrics,
      smells
    );
    const technologyDiversity =
      this.analyzeTechnologyDiversity(configurationItems);

    return {
      timestamp: new Date().toISOString(),
      systemComplexity: {
        overall: complexity.overall,
        componentCount: configurationItems.length,
        relationshipCount: this.countRelationships(configurationItems),
        cyclomaticComplexity: complexity.cyclomaticComplexity,
        layerViolations: this.detectLayerViolations(configurationItems),
      },
      qualityMetrics,
      architecturalSmells: smells,
      recommendations,
      technologyDiversity,
    };
  }

  /**
   * Analyzes system complexity across multiple dimensions
   */
  private static analyzeComplexity(
    components: ConfigurationItem[]
  ): ComplexityAnalysis {
    const byComponent: { [id: string]: number } = {};
    const byLayer: { [layer: string]: number } = {};

    let totalComplexity = 0;

    components.forEach((component) => {
      // Calculate component complexity based on dependencies, interfaces, and metrics
      const dependencyComplexity = (component.dependencies?.length || 0) * 2;
      const interfaceComplexity = component.keyInterfaces
        ? component.keyInterfaces.split('\n').length * 1.5
        : 0;
      const metricComplexity = component.metrics?.complexity || 0;

      const componentComplexity =
        dependencyComplexity + interfaceComplexity + metricComplexity;
      byComponent[component.id] = componentComplexity;
      totalComplexity += componentComplexity;

      // Aggregate by layer
      const layer = component.architecturalLayer || 'Unknown';
      byLayer[layer] = (byLayer[layer] || 0) + componentComplexity;
    });

    return {
      overall: Math.min(totalComplexity / components.length, 10),
      byLayer,
      byComponent,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(components),
      cognitiveComplexity: this.calculateCognitiveComplexity(components),
      structuralComplexity: this.calculateStructuralComplexity(components),
    };
  }

  /**
   * Calculates quality metrics for the architecture
   */
  private static calculateQualityMetrics(
    components: ConfigurationItem[]
  ): QualityMetrics {
    const coupling = this.calculateCoupling(components);
    const cohesion = this.calculateCohesion(components);
    const modularity = this.calculateModularity(components);
    const reusability = this.calculateReusability(components);
    const maintainability = this.calculateMaintainability(components);
    const testability = this.calculateTestability(components);
    const deployability = this.calculateDeployability(components);

    return {
      coupling,
      cohesion,
      modularity,
      reusability,
      maintainability,
      testability,
      deployability,
    };
  }

  /**
   * Detects architectural smells and anti-patterns
   */
  private static detectArchitecturalSmells(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    const smells: ArchitecturalSmell[] = [];

    // Detect God Components
    smells.push(...this.detectGodComponents(components));

    // Detect Circular Dependencies
    smells.push(...this.detectCircularDependencies(components));

    // Detect Unused Components
    smells.push(...this.detectUnusedComponents(components));

    // Detect Technology Sprawl
    smells.push(...this.detectTechnologySprawl(components));

    // Detect Chatty Services
    smells.push(...this.detectChattyServices(components));

    return smells;
  }

  /**
   * Generates architectural recommendations
   */
  private static generateRecommendations(
    complexity: ComplexityAnalysis,
    quality: QualityMetrics,
    smells: ArchitecturalSmell[]
  ): ArchitecturalRecommendation[] {
    const recommendations: ArchitecturalRecommendation[] = [];

    // High complexity recommendations
    if (complexity.overall > 7) {
      recommendations.push({
        id: 'reduce-complexity',
        category: 'Maintainability',
        priority: 'high',
        title: 'Reduce System Complexity',
        description: 'System complexity is above recommended thresholds',
        rationale: `Overall complexity score of ${complexity.overall.toFixed(
          1
        )} exceeds the recommended maximum of 7.0`,
        implementationSteps: [
          'Identify the most complex components',
          'Break down large components into smaller, focused modules',
          'Simplify interfaces and reduce coupling',
          'Implement facade patterns for complex subsystems',
        ],
        estimatedEffort: '2-4 weeks',
        expectedBenefits: [
          'Improved maintainability',
          'Reduced development time',
          'Lower defect rates',
        ],
        risks: [
          'Temporary disruption during refactoring',
          'Potential introduction of new bugs',
        ],
      });
    }

    // Low cohesion recommendations
    if (quality.cohesion < 0.6) {
      recommendations.push({
        id: 'improve-cohesion',
        category: 'Maintainability',
        priority: 'medium',
        title: 'Improve Component Cohesion',
        description: 'Components have low internal cohesion',
        rationale: `Cohesion score of ${quality.cohesion.toFixed(
          2
        )} is below the recommended minimum of 0.6`,
        implementationSteps: [
          'Review component responsibilities',
          'Extract unrelated functionality into separate components',
          'Ensure single responsibility principle',
          'Refactor mixed concerns',
        ],
        estimatedEffort: '1-2 weeks',
        expectedBenefits: [
          'Better code organization',
          'Easier testing',
          'Improved reusability',
        ],
        risks: ['Interface changes may affect dependent components'],
      });
    }

    // High coupling recommendations
    if (quality.coupling > 0.7) {
      recommendations.push({
        id: 'reduce-coupling',
        category: 'Maintainability',
        priority: 'high',
        title: 'Reduce Component Coupling',
        description: 'Components are too tightly coupled',
        rationale: `Coupling score of ${quality.coupling.toFixed(
          2
        )} exceeds the recommended maximum of 0.7`,
        implementationSteps: [
          'Introduce abstraction layers',
          'Implement dependency injection',
          'Use event-driven communication',
          'Apply interface segregation principle',
        ],
        estimatedEffort: '3-5 weeks',
        expectedBenefits: [
          'Improved flexibility',
          'Better testability',
          'Easier maintenance',
        ],
        risks: [
          'Increased initial complexity',
          'Performance overhead from abstractions',
        ],
      });
    }

    // Smell-based recommendations
    smells.forEach((smell) => {
      if (smell.severity === 'high' || smell.severity === 'critical') {
        recommendations.push({
          id: `fix-${smell.type.toLowerCase()}`,
          category: 'Maintainability',
          priority: smell.severity === 'critical' ? 'critical' : 'high',
          title: `Address ${smell.type.replace(/_/g, ' ')}`,
          description: smell.description,
          rationale: smell.impact,
          implementationSteps:
            smell.remediation?.split('. ').filter((step) => step.length > 0) ||
            [],
          estimatedEffort:
            smell.effort === 'high'
              ? '2-4 weeks'
              : smell.effort === 'medium'
              ? '1-2 weeks'
              : '2-5 days',
          expectedBenefits: [
            'Improved code quality',
            'Better maintainability',
            'Reduced technical debt',
          ],
          risks: [
            'Refactoring effort required',
            'Potential temporary instability',
          ],
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyzes technology diversity and sprawl
   */
  private static analyzeTechnologyDiversity(components: ConfigurationItem[]) {
    const languages = new Set<string>();
    const frameworks = new Set<string>();
    const databases = new Set<string>();
    const platforms = new Set<string>();

    components.forEach((component) => {
      component.technologyStack?.forEach((tech) => {
        // Simple categorization - in real implementation, use a technology taxonomy
        if (
          tech.includes('Java') ||
          tech.includes('Python') ||
          tech.includes('JavaScript')
        ) {
          languages.add(tech);
        } else if (
          tech.includes('React') ||
          tech.includes('Spring') ||
          tech.includes('Express')
        ) {
          frameworks.add(tech);
        } else if (
          tech.includes('SQL') ||
          tech.includes('MongoDB') ||
          tech.includes('Redis')
        ) {
          databases.add(tech);
        } else {
          platforms.add(tech);
        }
      });
    });

    const totalTechnologies =
      languages.size + frameworks.size + databases.size + platforms.size;
    const diversityScore = Math.min(totalTechnologies / components.length, 1);

    return {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      databases: Array.from(databases),
      platforms: Array.from(platforms),
      diversityScore,
    };
  }

  // Helper methods for complexity calculations
  private static calculateCyclomaticComplexity(
    components: ConfigurationItem[]
  ): number {
    // Simplified calculation based on dependencies
    return components.reduce(
      (total, comp) => total + (comp.dependencies?.length || 0),
      0
    );
  }

  private static calculateCognitiveComplexity(
    components: ConfigurationItem[]
  ): number {
    // Simplified calculation - in real implementation, analyze actual code
    return components.length * 2;
  }

  private static calculateStructuralComplexity(
    components: ConfigurationItem[]
  ): number {
    const relationships = this.countRelationships(components);
    return Math.log2(components.length + relationships + 1);
  }

  private static countRelationships(components: ConfigurationItem[]): number {
    return components.reduce(
      (total, comp) => total + (comp.dependencies?.length || 0),
      0
    );
  }

  private static detectLayerViolations(
    components: ConfigurationItem[]
  ): number {
    // Simplified layer violation detection
    let violations = 0;
    const layerOrder = ['Presentation', 'Business', 'Data', 'Infrastructure'];

    components.forEach((comp) => {
      const compLayer = comp.architecturalLayer;
      if (!compLayer) return;

      const compLayerIndex = layerOrder.indexOf(compLayer);
      comp.dependencies?.forEach((depId) => {
        const dep = components.find((c) => c.id === depId);
        if (dep?.architecturalLayer) {
          const depLayerIndex = layerOrder.indexOf(dep.architecturalLayer);
          if (depLayerIndex < compLayerIndex) {
            violations++;
          }
        }
      });
    });

    return violations;
  }

  // Quality metric calculations (simplified implementations)
  private static calculateCoupling(components: ConfigurationItem[]): number {
    const totalPossibleConnections =
      components.length * (components.length - 1);
    const actualConnections = this.countRelationships(components);
    return actualConnections / totalPossibleConnections;
  }

  private static calculateCohesion(components: ConfigurationItem[]): number {
    // Simplified cohesion calculation
    return (
      components.reduce((avg, comp) => {
        const interfaces = comp.keyInterfaces?.split('\n').length || 1;
        const patterns = comp.designPatterns?.split(',').length || 1;
        return avg + 1 / Math.max(interfaces, patterns);
      }, 0) / components.length
    );
  }

  private static calculateModularity(components: ConfigurationItem[]): number {
    // Simplified modularity score
    const layerCount = new Set(components.map((c) => c.architecturalLayer))
      .size;
    return Math.min(layerCount / 5, 1); // Assume 5 is optimal layer count
  }

  private static calculateReusability(components: ConfigurationItem[]): number {
    // Based on how many components depend on each component
    const dependencyCount = new Map<string, number>();
    components.forEach((comp) => {
      comp.dependencies?.forEach((depId) => {
        dependencyCount.set(depId, (dependencyCount.get(depId) || 0) + 1);
      });
    });

    const avgReuse =
      Array.from(dependencyCount.values()).reduce(
        (sum, count) => sum + count,
        0
      ) / components.length;
    return Math.min(avgReuse / 3, 1); // Normalize to 0-1 scale
  }

  private static calculateMaintainability(
    components: ConfigurationItem[]
  ): number {
    return (
      components.reduce((avg, comp) => {
        const complexity = comp.metrics?.complexity || 5;
        const testCoverage = comp.metrics?.testCoverage || 0;
        const technicalDebt = comp.metrics?.technicalDebt || 5;

        const maintainability =
          (testCoverage / 100) * 0.4 +
          ((10 - complexity) / 10) * 0.3 +
          ((10 - technicalDebt) / 10) * 0.3;
        return avg + maintainability;
      }, 0) / components.length
    );
  }

  private static calculateTestability(components: ConfigurationItem[]): number {
    return (
      components.reduce((avg, comp) => {
        const coupling = comp.metrics?.coupling || 5;
        const complexity = comp.metrics?.complexity || 5;
        return (
          avg + ((10 - coupling) / 10) * 0.6 + ((10 - complexity) / 10) * 0.4
        );
      }, 0) / components.length
    );
  }

  private static calculateDeployability(
    components: ConfigurationItem[]
  ): number {
    // Based on deployment model and dependencies
    const cloudComponents = components.filter(
      (c) => c.deploymentModel === 'Cloud'
    ).length;
    const independentComponents = components.filter(
      (c) => !c.dependencies || c.dependencies.length === 0
    ).length;

    return (
      (cloudComponents / components.length) * 0.6 +
      (independentComponents / components.length) * 0.4
    );
  }

  // Architectural smell detection methods
  private static detectGodComponents(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    const smells: ArchitecturalSmell[] = [];

    components.forEach((comp) => {
      const dependencyCount = comp.dependencies?.length || 0;
      const interfaceCount = comp.keyInterfaces?.split('\n').length || 0;

      if (dependencyCount > 10 || interfaceCount > 15) {
        smells.push({
          id: `god-component-${comp.id}`,
          type: 'God_Component',
          severity: dependencyCount > 15 ? 'critical' : 'high',
          description: `Component ${comp.name} has too many responsibilities`,
          affectedComponents: [comp.id],
          impact: 'Reduces maintainability and increases complexity',
          remediation:
            'Break down into smaller, focused components. Apply Single Responsibility Principle.',
          effort: 'high',
        });
      }
    });

    return smells;
  }

  private static detectCircularDependencies(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    // Simplified circular dependency detection
    const smells: ArchitecturalSmell[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (compId: string, path: string[]): boolean => {
      if (recursionStack.has(compId)) {
        const cycleStart = path.indexOf(compId);
        const cycle = path.slice(cycleStart);

        smells.push({
          id: `circular-dep-${cycle.join('-')}`,
          type: 'Circular_Dependencies',
          severity: 'high',
          description: `Circular dependency detected: ${cycle.join(' -> ')}`,
          affectedComponents: cycle,
          impact: 'Prevents proper testing and deployment ordering',
          remediation: 'Introduce abstraction layer or invert dependencies',
          effort: 'medium',
        });

        return true;
      }

      if (visited.has(compId)) return false;

      visited.add(compId);
      recursionStack.add(compId);

      const comp = components.find((c) => c.id === compId);
      comp?.dependencies?.forEach((depId) => {
        hasCycle(depId, [...path, compId]);
      });

      recursionStack.delete(compId);
      return false;
    };

    components.forEach((comp) => {
      if (!visited.has(comp.id)) {
        hasCycle(comp.id, []);
      }
    });

    return smells;
  }

  private static detectUnusedComponents(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    const smells: ArchitecturalSmell[] = [];
    const usedComponents = new Set<string>();

    components.forEach((comp) => {
      comp.dependencies?.forEach((depId) => usedComponents.add(depId));
    });

    components.forEach((comp) => {
      if (!usedComponents.has(comp.id) && comp.type !== 'Document') {
        smells.push({
          id: `unused-${comp.id}`,
          type: 'Unused_Components',
          severity: 'medium',
          description: `Component ${comp.name} is not used by any other component`,
          affectedComponents: [comp.id],
          impact: 'Increases maintenance burden and complexity',
          remediation: 'Remove unused component or find appropriate usage',
          effort: 'low',
        });
      }
    });

    return smells;
  }

  private static detectTechnologySprawl(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    const smells: ArchitecturalSmell[] = [];
    const technologies = new Set<string>();

    components.forEach((comp) => {
      comp.technologyStack?.forEach((tech) => technologies.add(tech));
    });

    if (technologies.size > components.length * 0.8) {
      smells.push({
        id: 'technology-sprawl',
        type: 'Technology_Sprawl',
        severity: 'medium',
        description: 'Too many different technologies in use',
        affectedComponents: components.map((c) => c.id),
        impact: 'Increases learning curve and maintenance complexity',
        remediation:
          'Standardize on fewer technologies and create technology guidelines',
        effort: 'high',
      });
    }

    return smells;
  }

  private static detectChattyServices(
    components: ConfigurationItem[]
  ): ArchitecturalSmell[] {
    // Simplified chatty service detection based on dependency count
    const smells: ArchitecturalSmell[] = [];

    components.forEach((comp) => {
      if (comp.type === 'Service' && (comp.dependencies?.length || 0) > 8) {
        smells.push({
          id: `chatty-service-${comp.id}`,
          type: 'Chatty_Service',
          severity: 'medium',
          description: `Service ${comp.name} has too many external dependencies`,
          affectedComponents: [comp.id],
          impact: 'Increases network latency and reduces performance',
          remediation:
            'Aggregate calls, use caching, or redesign service boundaries',
          effort: 'medium',
        });
      }
    });

    return smells;
  }
}
