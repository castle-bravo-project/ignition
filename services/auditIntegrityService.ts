import { AuditLogEntry } from '../types';
import { ComplianceAuditEntry } from './githubWebhookAuditService';

export interface AuditLogSignature {
  entryId: string;
  previousHash: string;
  currentHash: string;
  signature: string;
  timestamp: string;
  algorithm: 'SHA-256' | 'SHA-512';
  chainIndex: number;
}

export interface IntegrityVerificationResult {
  isValid: boolean;
  brokenChainAt?: number;
  tamperedEntries: string[];
  verificationTimestamp: string;
  totalEntries: number;
  verifiedEntries: number;
}

export class AuditIntegrityService {
  private static readonly HASH_ALGORITHM = 'SHA-256';
  private static readonly SIGNATURE_PREFIX = 'IGNITION_AUDIT_';

  /**
   * Generate cryptographic hash for audit entry
   */
  static async generateEntryHash(entry: AuditLogEntry | ComplianceAuditEntry): Promise<string> {
    // Create deterministic string representation
    const entryString = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      actor: entry.actor,
      eventType: entry.eventType,
      summary: entry.summary,
      details: entry.details
    }, Object.keys(entry).sort());

    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(entryString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate hash chain for audit log entries
   */
  static async generateHashChain(entries: (AuditLogEntry | ComplianceAuditEntry)[]): Promise<AuditLogSignature[]> {
    const signatures: AuditLogSignature[] = [];
    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const currentHash = await this.generateEntryHash(entry);
      
      // Create chain hash (previous + current)
      const chainString = previousHash + currentHash;
      const encoder = new TextEncoder();
      const chainData = encoder.encode(chainString);
      const chainHashBuffer = await crypto.subtle.digest('SHA-256', chainData);
      const chainHashArray = Array.from(new Uint8Array(chainHashBuffer));
      const chainHash = chainHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const signature: AuditLogSignature = {
        entryId: entry.id,
        previousHash,
        currentHash,
        signature: this.SIGNATURE_PREFIX + chainHash,
        timestamp: new Date().toISOString(),
        algorithm: 'SHA-256',
        chainIndex: i
      };

      signatures.push(signature);
      previousHash = chainHash;
    }

    return signatures;
  }

  /**
   * Verify integrity of audit log chain
   */
  static async verifyAuditLogIntegrity(
    entries: (AuditLogEntry | ComplianceAuditEntry)[],
    signatures: AuditLogSignature[]
  ): Promise<IntegrityVerificationResult> {
    const result: IntegrityVerificationResult = {
      isValid: true,
      tamperedEntries: [],
      verificationTimestamp: new Date().toISOString(),
      totalEntries: entries.length,
      verifiedEntries: 0
    };

    if (entries.length !== signatures.length) {
      result.isValid = false;
      return result;
    }

    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const signature = signatures[i];

      try {
        // Verify entry hash
        const calculatedHash = await this.generateEntryHash(entry);
        if (calculatedHash !== signature.currentHash) {
          result.isValid = false;
          result.tamperedEntries.push(entry.id);
          if (result.brokenChainAt === undefined) {
            result.brokenChainAt = i;
          }
          continue;
        }

        // Verify chain hash
        const chainString = previousHash + calculatedHash;
        const encoder = new TextEncoder();
        const chainData = encoder.encode(chainString);
        const chainHashBuffer = await crypto.subtle.digest('SHA-256', chainData);
        const chainHashArray = Array.from(new Uint8Array(chainHashBuffer));
        const expectedChainHash = chainHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const expectedSignature = this.SIGNATURE_PREFIX + expectedChainHash;

        if (signature.signature !== expectedSignature) {
          result.isValid = false;
          result.tamperedEntries.push(entry.id);
          if (result.brokenChainAt === undefined) {
            result.brokenChainAt = i;
          }
          continue;
        }

        // Verify previous hash matches
        if (signature.previousHash !== previousHash) {
          result.isValid = false;
          result.tamperedEntries.push(entry.id);
          if (result.brokenChainAt === undefined) {
            result.brokenChainAt = i;
          }
          continue;
        }

        result.verifiedEntries++;
        previousHash = expectedChainHash;

      } catch (error) {
        console.error(`Error verifying entry ${entry.id}:`, error);
        result.isValid = false;
        result.tamperedEntries.push(entry.id);
        if (result.brokenChainAt === undefined) {
          result.brokenChainAt = i;
        }
      }
    }

    return result;
  }

  /**
   * Add integrity hash to audit entry
   */
  static async enhanceEntryWithIntegrity(
    entry: AuditLogEntry | ComplianceAuditEntry,
    previousHash?: string
  ): Promise<ComplianceAuditEntry> {
    const currentHash = await this.generateEntryHash(entry);
    const prevHash = previousHash || '0000000000000000000000000000000000000000000000000000000000000000';
    
    // Create chain hash
    const chainString = prevHash + currentHash;
    const encoder = new TextEncoder();
    const chainData = encoder.encode(chainString);
    const chainHashBuffer = await crypto.subtle.digest('SHA-256', chainData);
    const chainHashArray = Array.from(new Uint8Array(chainHashBuffer));
    const chainHash = chainHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const enhancedEntry: ComplianceAuditEntry = {
      ...entry,
      integrityHash: currentHash,
      previousEntryHash: prevHash,
      dataClassification: (entry as ComplianceAuditEntry).dataClassification || 'INTERNAL',
      complianceFrameworks: (entry as ComplianceAuditEntry).complianceFrameworks || ['SOC2'],
      retentionPeriod: (entry as ComplianceAuditEntry).retentionPeriod || 'P3Y',
      accessLevel: (entry as ComplianceAuditEntry).accessLevel || 'WRITE',
      sourceSystem: (entry as ComplianceAuditEntry).sourceSystem || 'IGNITION',
      details: {
        ...entry.details,
        integrityVerified: true,
        chainHash,
        hashAlgorithm: this.HASH_ALGORITHM
      }
    };

    return enhancedEntry;
  }

  /**
   * Generate compliance report for audit log integrity
   */
  static async generateIntegrityReport(
    entries: (AuditLogEntry | ComplianceAuditEntry)[],
    signatures: AuditLogSignature[]
  ): Promise<{
    reportId: string;
    timestamp: string;
    verificationResult: IntegrityVerificationResult;
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
    recommendations: string[];
    summary: {
      totalEntries: number;
      verifiedEntries: number;
      tamperedEntries: number;
      integrityScore: number;
    };
  }> {
    const verificationResult = await this.verifyAuditLogIntegrity(entries, signatures);
    const integrityScore = entries.length > 0 ? (verificationResult.verifiedEntries / entries.length) * 100 : 100;
    
    let complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING' = 'COMPLIANT';
    const recommendations: string[] = [];

    if (integrityScore < 100) {
      complianceStatus = integrityScore < 95 ? 'NON_COMPLIANT' : 'WARNING';
      recommendations.push('Investigate tampered audit entries');
      recommendations.push('Review access controls and authentication logs');
      recommendations.push('Consider implementing additional security measures');
    }

    if (entries.length === 0) {
      complianceStatus = 'WARNING';
      recommendations.push('No audit entries found - ensure audit logging is properly configured');
    }

    if (signatures.length !== entries.length) {
      complianceStatus = 'NON_COMPLIANT';
      recommendations.push('Audit signature count mismatch - integrity chain may be broken');
    }

    return {
      reportId: `integrity_report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      verificationResult,
      complianceStatus,
      recommendations,
      summary: {
        totalEntries: entries.length,
        verifiedEntries: verificationResult.verifiedEntries,
        tamperedEntries: verificationResult.tamperedEntries.length,
        integrityScore: Math.round(integrityScore * 100) / 100
      }
    };
  }

  /**
   * Export audit log with integrity proofs for legal compliance
   */
  static async exportCompliancePackage(
    entries: (AuditLogEntry | ComplianceAuditEntry)[],
    signatures: AuditLogSignature[],
    metadata: {
      projectName: string;
      exportReason: string;
      requestedBy: string;
      complianceFramework: string;
    }
  ): Promise<{
    package: {
      metadata: any;
      auditEntries: (AuditLogEntry | ComplianceAuditEntry)[];
      integritySignatures: AuditLogSignature[];
      verificationResult: IntegrityVerificationResult;
      exportTimestamp: string;
      digitalSignature: string;
    };
    packageHash: string;
  }> {
    const verificationResult = await this.verifyAuditLogIntegrity(entries, signatures);
    
    const exportPackage = {
      metadata: {
        ...metadata,
        exportId: `export_${Date.now()}`,
        ignitionVersion: '1.0.0',
        complianceStandards: ['SOC2', 'ISO27001', 'FRE901', 'FRE902'],
        legalDisclaimer: 'This audit log export is generated for compliance purposes and maintains cryptographic integrity verification.'
      },
      auditEntries: entries,
      integritySignatures: signatures,
      verificationResult,
      exportTimestamp: new Date().toISOString(),
      digitalSignature: '' // Will be filled below
    };

    // Generate package hash
    const packageString = JSON.stringify(exportPackage, null, 2);
    const encoder = new TextEncoder();
    const packageData = encoder.encode(packageString);
    const packageHashBuffer = await crypto.subtle.digest('SHA-256', packageData);
    const packageHashArray = Array.from(new Uint8Array(packageHashBuffer));
    const packageHash = packageHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Add digital signature
    exportPackage.digitalSignature = `IGNITION_EXPORT_${packageHash}`;

    return {
      package: exportPackage,
      packageHash
    };
  }
}

/**
 * Utility function to create integrity-enhanced audit entry
 */
export async function createIntegrityAuditEntry(
  eventType: string,
  summary: string,
  details: Record<string, any> = {},
  actor: 'User' | 'AI' | 'System' | 'Automation' = 'User',
  previousHash?: string
): Promise<ComplianceAuditEntry> {
  const baseEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    actor,
    eventType,
    summary,
    details
  };

  return await AuditIntegrityService.enhanceEntryWithIntegrity(baseEntry, previousHash);
}
