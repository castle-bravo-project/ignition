import { AuditLogEntry, ProjectData } from '../types';

export interface AuditSettings {
  enabled: boolean;
  level: 'basic' | 'detailed' | 'verbose';
  retention: number; // days
  exportFormat: 'json' | 'csv' | 'xml';
  enableOnProjectInit: boolean;
  categories: {
    userActions: boolean;
    aiActions: boolean;
    systemActions: boolean;
    automationActions: boolean;
    securityEvents: boolean;
    dataChanges: boolean;
    integrationEvents: boolean;
  };
  sensitiveDataMasking: boolean;
  realTimeNotifications: boolean;
  batchSize: number; // for export operations
}

export interface AuditEventContext {
  sessionId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  previousValue?: any;
  newValue?: any;
  affectedEntities?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  complianceRelevant?: boolean;
  tags?: string[];
}

export interface EnhancedAuditLogEntry extends AuditLogEntry {
  category: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  context: AuditEventContext;
  checksum?: string; // for integrity verification
  encrypted?: boolean;
  retentionDate?: string; // when this entry should be purged
}

export interface AuditExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  categories?: string[];
  actors?: string[];
  eventTypes?: string[];
  includeDetails: boolean;
  includeContext: boolean;
  maskSensitiveData: boolean;
}

export interface AuditReport {
  summary: {
    totalEvents: number;
    eventsByActor: { [actor: string]: number };
    eventsByType: { [type: string]: number };
    eventsByCategory: { [category: string]: number };
    criticalEvents: number;
    securityEvents: number;
    complianceEvents: number;
  };
  timeline: Array<{
    date: string;
    eventCount: number;
    criticalCount: number;
  }>;
  topEvents: EnhancedAuditLogEntry[];
  anomalies: Array<{
    type: string;
    description: string;
    events: EnhancedAuditLogEntry[];
  }>;
}

// Default audit settings
export const DEFAULT_AUDIT_SETTINGS: AuditSettings = {
  enabled: true,
  level: 'detailed',
  retention: 365, // 1 year
  exportFormat: 'json',
  enableOnProjectInit: true,
  categories: {
    userActions: true,
    aiActions: true,
    systemActions: true,
    automationActions: true,
    securityEvents: true,
    dataChanges: true,
    integrationEvents: true,
  },
  sensitiveDataMasking: true,
  realTimeNotifications: false,
  batchSize: 1000,
};

// Enhanced audit service class
export class AuditService {
  private settings: AuditSettings;
  private sessionId: string;

  constructor(settings: AuditSettings = DEFAULT_AUDIT_SETTINGS) {
    this.settings = settings;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChecksum(entry: Omit<EnhancedAuditLogEntry, 'checksum'>): string {
    const data = JSON.stringify({
      timestamp: entry.timestamp,
      actor: entry.actor,
      eventType: entry.eventType,
      summary: entry.summary,
      details: entry.details,
    });
    // Simple checksum - in production, use a proper cryptographic hash
    return btoa(data).slice(0, 16);
  }

  private maskSensitiveData(data: any): any {
    if (!this.settings.sensitiveDataMasking) return data;

    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'pat', 'api_key'];
    
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      for (const key in masked) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          masked[key] = '***MASKED***';
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }
      return masked;
    }
    return data;
  }

  private categorizeEvent(eventType: string): string {
    const categoryMap: { [key: string]: string } = {
      'REQUIREMENT_CREATE': 'userActions',
      'REQUIREMENT_UPDATE': 'userActions',
      'REQUIREMENT_DELETE': 'userActions',
      'TEST_CASE_CREATE': 'userActions',
      'TEST_CASE_UPDATE': 'userActions',
      'CI_CREATE': 'userActions',
      'RISK_CREATE': 'userActions',
      'DOCUMENT_UPDATE': 'userActions',
      'PR_ANALYSIS': 'aiActions',
      'AI_GENERATION': 'aiActions',
      'REPO_SCAFFOLD': 'aiActions',
      'TEST_WORKFLOW_GENERATE': 'aiActions',
      'SYSTEM_STARTUP': 'systemActions',
      'SYSTEM_SHUTDOWN': 'systemActions',
      'DATA_EXPORT': 'systemActions',
      'DATA_IMPORT': 'systemActions',
      'SECURITY_ALERT': 'securityEvents',
      'LOGIN_ATTEMPT': 'securityEvents',
      'PERMISSION_CHANGE': 'securityEvents',
      'GITHUB_SYNC': 'integrationEvents',
      'API_CALL': 'integrationEvents',
      'WEBHOOK_RECEIVED': 'integrationEvents',
    };

    return categoryMap[eventType] || 'userActions';
  }

  private getSeverity(eventType: string, context: AuditEventContext): 'info' | 'warning' | 'error' | 'critical' {
    if (context.riskLevel === 'critical') return 'critical';
    if (context.riskLevel === 'high') return 'error';
    if (context.riskLevel === 'medium') return 'warning';

    const criticalEvents = ['SECURITY_ALERT', 'DATA_BREACH', 'SYSTEM_FAILURE'];
    const errorEvents = ['LOGIN_FAILED', 'API_ERROR', 'VALIDATION_FAILED'];
    const warningEvents = ['PERMISSION_CHANGE', 'CONFIG_CHANGE', 'RATE_LIMIT'];

    if (criticalEvents.includes(eventType)) return 'critical';
    if (errorEvents.includes(eventType)) return 'error';
    if (warningEvents.includes(eventType)) return 'warning';

    return 'info';
  }

  public createLogEntry(
    eventType: string,
    summary: string,
    details: Record<string, any> = {},
    actor: 'User' | 'AI' | 'System' | 'Automation' = 'User',
    context: Partial<AuditEventContext> = {}
  ): EnhancedAuditLogEntry {
    if (!this.settings.enabled) {
      throw new Error('Audit logging is disabled');
    }

    const category = this.categorizeEvent(eventType);
    
    // Check if this category is enabled
    if (!this.settings.categories[category as keyof typeof this.settings.categories]) {
      throw new Error(`Audit logging for category '${category}' is disabled`);
    }

    const enhancedContext: AuditEventContext = {
      sessionId: this.sessionId,
      ...context,
    };

    const maskedDetails = this.maskSensitiveData(details);
    const severity = this.getSeverity(eventType, enhancedContext);

    const entry: Omit<EnhancedAuditLogEntry, 'checksum'> = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor,
      eventType,
      summary,
      details: maskedDetails,
      category,
      severity,
      context: enhancedContext,
      encrypted: false,
      retentionDate: new Date(Date.now() + this.settings.retention * 24 * 60 * 60 * 1000).toISOString(),
    };

    const checksum = this.generateChecksum(entry);

    return {
      ...entry,
      checksum,
    };
  }

  public shouldLogEvent(eventType: string, actor: string): boolean {
    if (!this.settings.enabled) return false;

    const category = this.categorizeEvent(eventType);
    return this.settings.categories[category as keyof typeof this.settings.categories];
  }

  public cleanupExpiredEntries(auditLog: EnhancedAuditLogEntry[]): EnhancedAuditLogEntry[] {
    const now = new Date();
    return auditLog.filter(entry => {
      if (!entry.retentionDate) return true;
      return new Date(entry.retentionDate) > now;
    });
  }

  public validateLogIntegrity(entry: EnhancedAuditLogEntry): boolean {
    if (!entry.checksum) return false;
    
    const entryWithoutChecksum = { ...entry };
    delete entryWithoutChecksum.checksum;
    
    const expectedChecksum = this.generateChecksum(entryWithoutChecksum);
    return entry.checksum === expectedChecksum;
  }

  public generateReport(auditLog: EnhancedAuditLogEntry[], options?: Partial<AuditExportOptions>): AuditReport {
    const filteredLog = this.filterLogEntries(auditLog, options);

    const summary = {
      totalEvents: filteredLog.length,
      eventsByActor: this.groupBy(filteredLog, 'actor'),
      eventsByType: this.groupBy(filteredLog, 'eventType'),
      eventsByCategory: this.groupBy(filteredLog, 'category'),
      criticalEvents: filteredLog.filter(e => e.severity === 'critical').length,
      securityEvents: filteredLog.filter(e => e.category === 'securityEvents').length,
      complianceEvents: filteredLog.filter(e => e.context.complianceRelevant).length,
    };

    const timeline = this.generateTimeline(filteredLog);
    const topEvents = filteredLog
      .filter(e => e.severity === 'critical' || e.severity === 'error')
      .slice(0, 10);
    
    const anomalies = this.detectAnomalies(filteredLog);

    return {
      summary,
      timeline,
      topEvents,
      anomalies,
    };
  }

  private filterLogEntries(auditLog: EnhancedAuditLogEntry[], options?: Partial<AuditExportOptions>): EnhancedAuditLogEntry[] {
    if (!options) return auditLog;

    return auditLog.filter(entry => {
      if (options.dateRange) {
        const entryDate = new Date(entry.timestamp);
        const start = new Date(options.dateRange.start);
        const end = new Date(options.dateRange.end);
        if (entryDate < start || entryDate > end) return false;
      }

      if (options.categories && !options.categories.includes(entry.category)) return false;
      if (options.actors && !options.actors.includes(entry.actor)) return false;
      if (options.eventTypes && !options.eventTypes.includes(entry.eventType)) return false;

      return true;
    });
  }

  private groupBy(array: EnhancedAuditLogEntry[], key: keyof EnhancedAuditLogEntry): { [key: string]: number } {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private generateTimeline(auditLog: EnhancedAuditLogEntry[]): Array<{ date: string; eventCount: number; criticalCount: number }> {
    const timelineMap = new Map<string, { eventCount: number; criticalCount: number }>();

    auditLog.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      const existing = timelineMap.get(date) || { eventCount: 0, criticalCount: 0 };
      existing.eventCount++;
      if (entry.severity === 'critical') existing.criticalCount++;
      timelineMap.set(date, existing);
    });

    return Array.from(timelineMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private detectAnomalies(auditLog: EnhancedAuditLogEntry[]): Array<{ type: string; description: string; events: EnhancedAuditLogEntry[] }> {
    const anomalies: Array<{ type: string; description: string; events: EnhancedAuditLogEntry[] }> = [];

    // Detect unusual activity patterns
    const recentEvents = auditLog.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // High frequency of failed events
    const failedEvents = recentEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
    if (failedEvents.length > 10) {
      anomalies.push({
        type: 'high_error_rate',
        description: `Unusually high number of error events in the last 24 hours (${failedEvents.length})`,
        events: failedEvents.slice(0, 5),
      });
    }

    // Unusual actor activity
    const actorCounts = this.groupBy(recentEvents, 'actor');
    Object.entries(actorCounts).forEach(([actor, count]) => {
      if (count > 100) {
        anomalies.push({
          type: 'high_activity',
          description: `Unusually high activity from ${actor} (${count} events in 24h)`,
          events: recentEvents.filter(e => e.actor === actor).slice(0, 5),
        });
      }
    });

    return anomalies;
  }

  public exportAuditLog(auditLog: EnhancedAuditLogEntry[], options: AuditExportOptions): string {
    const filteredLog = this.filterLogEntries(auditLog, options);
    const processedLog = options.maskSensitiveData 
      ? filteredLog.map(entry => ({ ...entry, details: this.maskSensitiveData(entry.details) }))
      : filteredLog;

    switch (options.format) {
      case 'json':
        return JSON.stringify(processedLog, null, 2);
      case 'csv':
        return this.exportToCsv(processedLog, options);
      case 'xml':
        return this.exportToXml(processedLog, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private exportToCsv(auditLog: EnhancedAuditLogEntry[], options: AuditExportOptions): string {
    const headers = ['Timestamp', 'Actor', 'Event Type', 'Category', 'Severity', 'Summary'];
    if (options.includeDetails) headers.push('Details');
    if (options.includeContext) headers.push('Context');

    const rows = auditLog.map(entry => {
      const row = [
        entry.timestamp,
        entry.actor,
        entry.eventType,
        entry.category,
        entry.severity,
        `"${entry.summary.replace(/"/g, '""')}"`,
      ];
      
      if (options.includeDetails) {
        row.push(`"${JSON.stringify(entry.details).replace(/"/g, '""')}"`);
      }
      
      if (options.includeContext) {
        row.push(`"${JSON.stringify(entry.context).replace(/"/g, '""')}"`);
      }
      
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  private exportToXml(auditLog: EnhancedAuditLogEntry[], options: AuditExportOptions): string {
    const xmlEntries = auditLog.map(entry => {
      let xml = `    <entry id="${entry.id}">
      <timestamp>${entry.timestamp}</timestamp>
      <actor>${entry.actor}</actor>
      <eventType>${entry.eventType}</eventType>
      <category>${entry.category}</category>
      <severity>${entry.severity}</severity>
      <summary><![CDATA[${entry.summary}]]></summary>`;

      if (options.includeDetails) {
        xml += `\n      <details><![CDATA[${JSON.stringify(entry.details)}]]></details>`;
      }

      if (options.includeContext) {
        xml += `\n      <context><![CDATA[${JSON.stringify(entry.context)}]]></context>`;
      }

      xml += '\n    </entry>';
      return xml;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<auditLog>
  <metadata>
    <exportDate>${new Date().toISOString()}</exportDate>
    <totalEntries>${auditLog.length}</totalEntries>
  </metadata>
  <entries>
${xmlEntries}
  </entries>
</auditLog>`;
  }

  public updateSettings(newSettings: Partial<AuditSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getSettings(): AuditSettings {
    return { ...this.settings };
  }
}
