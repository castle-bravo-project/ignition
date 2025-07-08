/**
 * Performance Monitoring Utility
 * 
 * Real-time performance monitoring for the Ignition dashboard
 * including metrics collection, analysis, and reporting.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'load' | 'render' | 'interaction' | 'memory' | 'network';
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  pageLoad: number;
  componentRender: number;
  userInteraction: number;
  memoryUsage: number;
  networkRequest: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    pageLoad: 3000,
    componentRender: 1000,
    userInteraction: 100,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    networkRequest: 2000,
  };

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric({
                name: 'page_load_time',
                value: navEntry.loadEventEnd - navEntry.navigationStart,
                timestamp: Date.now(),
                category: 'load',
                metadata: {
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                  firstPaint: navEntry.responseEnd - navEntry.navigationStart,
                },
              });
            }
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric({
                name: 'resource_load_time',
                value: resourceEntry.responseEnd - resourceEntry.startTime,
                timestamp: Date.now(),
                category: 'network',
                metadata: {
                  name: resourceEntry.name,
                  size: resourceEntry.transferSize,
                  type: this.getResourceType(resourceEntry.name),
                },
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }

      // Measure observer for custom metrics
      try {
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordMetric({
                name: entry.name,
                value: entry.duration,
                timestamp: Date.now(),
                category: 'render',
                metadata: {
                  startTime: entry.startTime,
                },
              });
            }
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);
      } catch (error) {
        console.warn('Measure observer not supported:', error);
      }
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Check thresholds and warn if exceeded
    this.checkThresholds(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    let threshold: number | undefined;
    
    switch (metric.category) {
      case 'load':
        threshold = this.thresholds.pageLoad;
        break;
      case 'render':
        threshold = this.thresholds.componentRender;
        break;
      case 'interaction':
        threshold = this.thresholds.userInteraction;
        break;
      case 'network':
        threshold = this.thresholds.networkRequest;
        break;
    }
    
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${threshold}ms)`);
    }
  }

  public startMeasure(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  public endMeasure(name: string): number {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        return measures[measures.length - 1].duration;
      }
    }
    return 0;
  }

  public measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    this.startMeasure(`component-render-${componentName}`);
    const result = renderFunction();
    const duration = this.endMeasure(`component-render-${componentName}`);
    
    this.recordMetric({
      name: `component_render_${componentName}`,
      value: duration,
      timestamp: Date.now(),
      category: 'render',
      metadata: { component: componentName },
    });
    
    return result;
  }

  public measureUserInteraction(
    interactionName: string,
    interactionFunction: () => void | Promise<void>
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const startTime = Date.now();
      
      try {
        await interactionFunction();
      } finally {
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          name: `user_interaction_${interactionName}`,
          value: duration,
          timestamp: Date.now(),
          category: 'interaction',
          metadata: { interaction: interactionName },
        });
        
        resolve();
      }
    });
  }

  public getMemoryUsage(): PerformanceMetric | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const metric: PerformanceMetric = {
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        timestamp: Date.now(),
        category: 'memory',
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        },
      };
      
      this.recordMetric(metric);
      return metric;
    }
    return null;
  }

  public getMetrics(category?: string, timeRange?: { start: number; end: number }): PerformanceMetric[] {
    let filteredMetrics = this.metrics;
    
    if (category) {
      filteredMetrics = filteredMetrics.filter(m => m.category === category);
    }
    
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return filteredMetrics;
  }

  public getAverageMetric(name: string, timeRange?: { start: number; end: number }): number {
    const metrics = this.getMetrics(undefined, timeRange).filter(m => m.name === name);
    
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  public getPerformanceReport(): {
    summary: Record<string, number>;
    slowestOperations: PerformanceMetric[];
    memoryTrend: PerformanceMetric[];
    recommendations: string[];
  } {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    
    const recentMetrics = this.getMetrics(undefined, { start: lastHour, end: now });
    
    const summary = {
      totalMetrics: recentMetrics.length,
      averagePageLoad: this.getAverageMetric('page_load_time', { start: lastHour, end: now }),
      averageComponentRender: this.getAverageMetric('component_render', { start: lastHour, end: now }),
      averageUserInteraction: this.getAverageMetric('user_interaction', { start: lastHour, end: now }),
    };
    
    const slowestOperations = recentMetrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    const memoryTrend = this.getMetrics('memory', { start: lastHour, end: now });
    
    const recommendations = this.generateRecommendations(summary, slowestOperations);
    
    return {
      summary,
      slowestOperations,
      memoryTrend,
      recommendations,
    };
  }

  private generateRecommendations(
    summary: Record<string, number>,
    slowestOperations: PerformanceMetric[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (summary.averagePageLoad > this.thresholds.pageLoad) {
      recommendations.push('Consider optimizing initial bundle size and implementing code splitting');
    }
    
    if (summary.averageComponentRender > this.thresholds.componentRender) {
      recommendations.push('Review component rendering performance and consider memoization');
    }
    
    if (summary.averageUserInteraction > this.thresholds.userInteraction) {
      recommendations.push('Optimize user interaction handlers and consider debouncing');
    }
    
    const slowRenderOperations = slowestOperations.filter(op => op.category === 'render');
    if (slowRenderOperations.length > 0) {
      recommendations.push(`Optimize slow rendering operations: ${slowRenderOperations.map(op => op.name).join(', ')}`);
    }
    
    return recommendations;
  }

  public dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    measureComponentRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    measureUserInteraction: performanceMonitor.measureUserInteraction.bind(performanceMonitor),
    getMemoryUsage: performanceMonitor.getMemoryUsage.bind(performanceMonitor),
    getPerformanceReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor),
  };
}
