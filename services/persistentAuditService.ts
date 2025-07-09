import { AuditLogEntry, GitHubSettings } from '../types';
import { getFileContent, saveFileToRepo } from './githubService';

export interface PersistentAuditLog {
  auditLog: AuditLogEntry[];
  metadata: {
    created: string;
    version: string;
    projectName: string;
    description: string;
    lastUpdated?: string;
    totalEntries?: number;
  };
}

export class PersistentAuditService {
  private static readonly AUDIT_LOG_PATH = 'audit-log.json';
  private githubSettings: GitHubSettings;
  private localCache: AuditLogEntry[] = [];
  private lastSyncTimestamp: string | null = null;

  constructor(githubSettings: GitHubSettings) {
    this.githubSettings = githubSettings;
  }

  /**
   * Load audit log from GitHub repository
   */
  async loadAuditLog(): Promise<AuditLogEntry[]> {
    try {
      const { content } = await getFileContent({
        ...this.githubSettings,
        filePath: PersistentAuditService.AUDIT_LOG_PATH
      });

      const persistentLog: PersistentAuditLog = JSON.parse(content);
      this.localCache = persistentLog.auditLog || [];
      this.lastSyncTimestamp = persistentLog.metadata.lastUpdated || persistentLog.metadata.created;
      
      console.log(`📋 Loaded ${this.localCache.length} audit entries from GitHub`);
      return this.localCache;
    } catch (error: any) {
      if (error.message.includes('404')) {
        console.log('📋 No existing audit log found in repository - will create on first save');
        return [];
      }
      console.error('Failed to load audit log from GitHub:', error);
      throw new Error(`Failed to load audit log: ${error.message}`);
    }
  }

  /**
   * Save audit log to GitHub repository
   */
  async saveAuditLog(auditEntries: AuditLogEntry[], commitMessage?: string): Promise<void> {
    try {
      // Merge local entries with any new entries
      const mergedEntries = this.mergeAuditEntries(this.localCache, auditEntries);
      
      const persistentLog: PersistentAuditLog = {
        auditLog: mergedEntries,
        metadata: {
          created: this.lastSyncTimestamp || new Date().toISOString(),
          version: '1.0.0',
          projectName: this.githubSettings.repoUrl?.split('/').pop() || 'Unknown Project',
          description: 'Persistent audit log for Ignition meta-compliance tracking',
          lastUpdated: new Date().toISOString(),
          totalEntries: mergedEntries.length
        }
      };

      const content = JSON.stringify(persistentLog, null, 2);
      const message = commitMessage || `audit: update audit log (${mergedEntries.length} entries)`;

      await saveFileToRepo(
        this.githubSettings,
        PersistentAuditService.AUDIT_LOG_PATH,
        content,
        message
      );

      this.localCache = mergedEntries;
      this.lastSyncTimestamp = persistentLog.metadata.lastUpdated;
      
      console.log(`📋 Saved ${mergedEntries.length} audit entries to GitHub`);
    } catch (error: any) {
      console.error('Failed to save audit log to GitHub:', error);
      throw new Error(`Failed to save audit log: ${error.message}`);
    }
  }

  /**
   * Add new audit entry and auto-save to GitHub
   */
  async addAuditEntry(entry: AuditLogEntry): Promise<void> {
    const newEntries = [...this.localCache, entry];
    await this.saveAuditLog(newEntries, `audit: ${entry.eventType} - ${entry.summary}`);
  }

  /**
   * Add multiple audit entries and batch save to GitHub
   */
  async addAuditEntries(entries: AuditLogEntry[]): Promise<void> {
    const newEntries = [...this.localCache, ...entries];
    await this.saveAuditLog(newEntries, `audit: batch update (${entries.length} new entries)`);
  }

  /**
   * Merge local and remote audit entries, removing duplicates
   */
  private mergeAuditEntries(localEntries: AuditLogEntry[], newEntries: AuditLogEntry[]): AuditLogEntry[] {
    const entryMap = new Map<string, AuditLogEntry>();
    
    // Add local entries first
    localEntries.forEach(entry => {
      entryMap.set(entry.id, entry);
    });
    
    // Add new entries (will overwrite if same ID)
    newEntries.forEach(entry => {
      entryMap.set(entry.id, entry);
    });
    
    // Convert back to array and sort by timestamp (newest first)
    return Array.from(entryMap.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get current cached audit entries
   */
  getCachedEntries(): AuditLogEntry[] {
    return [...this.localCache];
  }

  /**
   * Check if audit log exists in repository
   */
  async auditLogExists(): Promise<boolean> {
    try {
      await getFileContent({
        ...this.githubSettings,
        filePath: PersistentAuditService.AUDIT_LOG_PATH
      });
      return true;
    } catch (error: any) {
      return !error.message.includes('404');
    }
  }

  /**
   * Initialize audit log in repository if it doesn't exist
   */
  async initializeAuditLog(projectName: string): Promise<void> {
    const exists = await this.auditLogExists();
    if (exists) {
      console.log('📋 Audit log already exists in repository');
      return;
    }

    const initialEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: 'System',
      eventType: 'AUDIT_LOG_INIT',
      summary: 'Persistent audit log initialized for meta-compliance tracking',
      details: {
        projectName,
        metaCompliance: true,
        initializedBy: 'Ignition Persistent Audit Service'
      }
    };

    await this.saveAuditLog([initialEntry], 'feat: initialize persistent audit log for meta-compliance');
    console.log('📋 Initialized persistent audit log in repository');
  }
}

/**
 * Create a persistent audit service instance
 */
export function createPersistentAuditService(githubSettings: GitHubSettings): PersistentAuditService {
  return new PersistentAuditService(githubSettings);
}

/**
 * Utility function to create audit log entry with consistent format
 */
export function createPersistentAuditEntry(
  eventType: string,
  summary: string,
  details: Record<string, any> = {},
  actor: 'User' | 'AI' | 'System' | 'Automation' = 'User'
): AuditLogEntry {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    actor,
    eventType,
    summary,
    details: {
      ...details,
      persistentLogging: true,
      metaCompliance: true
    }
  };
}
