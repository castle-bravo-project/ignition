import { ProjectData } from '../types';

export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  version: string;
  domains: ComplianceDomain[];
}

export interface ComplianceDomain {
  id: string;
  name: string;
  description: string;
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  requirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  mappedRequirements?: string[];
  mappedRisks?: string[];
  mappedCIs?: string[];
  evidenceRequired: string[];
}

export interface ComplianceAssessment {
  standardId: string;
  overallScore: number;
  domainScores: { [domainId: string]: number };
  controlResults: { [controlId: string]: ComplianceControlResult };
  gaps: ComplianceGap[];
  recommendations: string[];
  isCompliant: boolean;
}

export interface ComplianceControlResult {
  controlId: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  score: number;
  evidence: string[];
  gaps: string[];
  recommendations: string[];
}

export interface ComplianceGap {
  id: string;
  controlId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  remediation: string;
  estimatedEffort: string;
}

// ISO 27001:2022 Standard Definition
export const ISO27001_STANDARD: ComplianceStandard = {
  id: 'iso27001',
  name: 'ISO 27001:2022',
  description: 'Information Security Management Systems',
  version: '2022',
  domains: [
    {
      id: 'information-security-policies',
      name: 'Information Security Policies',
      description: 'Management direction and support for information security',
      controls: [
        {
          id: 'A.5.1',
          name: 'Information Security Policy',
          description:
            'Information security policy shall be defined, approved by management, published and communicated to employees and relevant external parties',
          requirement:
            'Documented information security policy must exist and be approved',
          severity: 'critical',
          category: 'Policy',
          evidenceRequired: [
            'Security policy document',
            'Management approval',
            'Communication records',
          ],
        },
      ],
    },
    {
      id: 'organization-information-security',
      name: 'Organization of Information Security',
      description:
        'Establishment of management framework to initiate and control implementation',
      controls: [
        {
          id: 'A.6.1',
          name: 'Information Security Roles and Responsibilities',
          description:
            'All information security responsibilities shall be defined and allocated',
          requirement:
            'Clear roles and responsibilities for information security must be documented',
          severity: 'high',
          category: 'Organization',
          evidenceRequired: [
            'Role definitions',
            'Responsibility matrix',
            'Job descriptions',
          ],
        },
      ],
    },
    {
      id: 'access-control',
      name: 'Access Control',
      description:
        'Limit access to information and information processing facilities',
      controls: [
        {
          id: 'A.9.1',
          name: 'Access Control Policy',
          description:
            'Access control policy shall be established, documented and reviewed',
          requirement:
            'Access control policy must be documented and regularly reviewed',
          severity: 'critical',
          category: 'Access Control',
          evidenceRequired: [
            'Access control policy',
            'Review records',
            'Approval documentation',
          ],
        },
      ],
    },
  ],
};

// SOC 2 Standard Definition
export const SOC2_STANDARD: ComplianceStandard = {
  id: 'soc2',
  name: 'SOC 2 Type II',
  description: 'Service Organization Control 2',
  version: '2017',
  domains: [
    {
      id: 'security',
      name: 'Security',
      description: 'Protection against unauthorized access',
      controls: [
        {
          id: 'CC6.1',
          name: 'Logical and Physical Access Controls',
          description:
            'Logical and physical access controls restrict access to the system',
          requirement: 'Access controls must be implemented and monitored',
          severity: 'critical',
          category: 'Security',
          evidenceRequired: [
            'Access control procedures',
            'Access logs',
            'Physical security measures',
          ],
        },
      ],
    },
    {
      id: 'availability',
      name: 'Availability',
      description: 'System availability for operation and use',
      controls: [
        {
          id: 'A1.1',
          name: 'System Availability',
          description: 'System availability objectives are achieved',
          requirement: 'System availability must meet defined objectives',
          severity: 'high',
          category: 'Availability',
          evidenceRequired: [
            'Availability metrics',
            'Monitoring reports',
            'Incident records',
          ],
        },
      ],
    },
  ],
};

// HIPAA Standard Definition
export const HIPAA_STANDARD: ComplianceStandard = {
  id: 'hipaa',
  name: 'HIPAA Security Rule',
  description: 'Health Insurance Portability and Accountability Act',
  version: '2013',
  domains: [
    {
      id: 'administrative-safeguards',
      name: 'Administrative Safeguards',
      description: 'Administrative actions and policies to manage security',
      controls: [
        {
          id: '164.308(a)(1)',
          name: 'Security Officer',
          description: 'Assign security responsibilities to an individual',
          requirement: 'Designated security officer must be assigned',
          severity: 'critical',
          category: 'Administrative',
          evidenceRequired: [
            'Security officer designation',
            'Role documentation',
            'Training records',
          ],
        },
      ],
    },
    {
      id: 'physical-safeguards',
      name: 'Physical Safeguards',
      description: 'Physical protection of electronic information systems',
      controls: [
        {
          id: '164.310(a)(1)',
          name: 'Facility Access Controls',
          description:
            'Limit physical access to electronic information systems',
          requirement: 'Physical access controls must be implemented',
          severity: 'high',
          category: 'Physical',
          evidenceRequired: [
            'Access control procedures',
            'Physical security measures',
            'Access logs',
          ],
        },
      ],
    },
  ],
};

// FDA 21 CFR Part 11 Standard Definition
export const FDA_CFR_STANDARD: ComplianceStandard = {
  id: 'fda-cfr-11',
  name: 'FDA 21 CFR Part 11',
  description: 'Electronic Records; Electronic Signatures',
  version: '1997',
  domains: [
    {
      id: 'electronic-records',
      name: 'Electronic Records',
      description: 'Requirements for electronic records',
      controls: [
        {
          id: '11.10(a)',
          name: 'Validation of Systems',
          description:
            'Systems must be validated to ensure accuracy, reliability, and performance',
          requirement: 'Electronic record systems must be validated',
          severity: 'critical',
          category: 'Validation',
          evidenceRequired: [
            'Validation documentation',
            'Test results',
            'Performance metrics',
          ],
        },
      ],
    },
    {
      id: 'electronic-signatures',
      name: 'Electronic Signatures',
      description: 'Requirements for electronic signatures',
      controls: [
        {
          id: '11.50',
          name: 'Signature Manifestations',
          description:
            'Electronic signatures must be linked to their respective electronic records',
          requirement:
            'Electronic signatures must be properly linked and secured',
          severity: 'critical',
          category: 'Signatures',
          evidenceRequired: [
            'Signature procedures',
            'Linking mechanisms',
            'Security controls',
          ],
        },
      ],
    },
  ],
};

// Federal Rules of Evidence (FRE) Standard Definition for Legal Technology
export const FRE_LEGAL_STANDARD: ComplianceStandard = {
  id: 'fre-legal',
  name: 'Federal Rules of Evidence (Legal Tech)',
  description:
    'Evidence admissibility standards for legal technology tools and expert analysis',
  version: '2023',
  domains: [
    {
      id: 'authentication-901-902',
      name: 'Authentication & Self-Authentication (FRE 901 & 902)',
      description:
        'Evidence must be authenticated to show it is what it purports to be',
      controls: [
        {
          id: 'FRE.901.1',
          name: 'Chain of Custody Documentation',
          description:
            'Complete documentation of evidence handling from collection to presentation',
          requirement:
            'Unbroken chain of custody must be documented with timestamps, handlers, and transfer records',
          severity: 'critical',
          category: 'Chain of Custody',
          evidenceRequired: [
            'Custody transfer logs with digital signatures',
            'Handler identification and authentication',
            'Timestamp records with time synchronization proof',
            'Storage location and access control logs',
            'Transportation and handling procedures',
          ],
        },
        {
          id: 'FRE.901.2',
          name: 'Digital Signature Verification',
          description:
            'Verification of electronic signatures and digital certificates for authenticity',
          requirement:
            'Digital signatures must be cryptographically verified with certificate validation',
          severity: 'critical',
          category: 'Digital Authentication',
          evidenceRequired: [
            'PKI certificate validation records',
            'Certificate authority verification',
            'Signature algorithm verification',
            'Timestamp authority validation',
            'Revocation status checking',
          ],
        },
        {
          id: 'FRE.901.3',
          name: 'Hash Value Verification',
          description:
            'Cryptographic verification of data integrity using hash functions',
          requirement:
            'Hash values must be calculated, documented, and verified to prove data integrity',
          severity: 'critical',
          category: 'Data Integrity',
          evidenceRequired: [
            'Original hash calculation records',
            'Hash algorithm specification (SHA-256 minimum)',
            'Verification hash calculations',
            'Hash comparison documentation',
            'Integrity verification timestamps',
          ],
        },
        {
          id: 'FRE.902.1',
          name: 'Self-Authenticating Records',
          description:
            'Documents that authenticate themselves under FRE 902 provisions',
          requirement:
            'Self-authenticating documents must meet specific FRE 902 criteria',
          severity: 'high',
          category: 'Self-Authentication',
          evidenceRequired: [
            'Certification of business records',
            'Notarized affidavits from custodians',
            'Official government certifications',
            'Compliance with FRE 902 subsections',
          ],
        },
      ],
    },
    {
      id: 'best-evidence-1001-1008',
      name: 'Best Evidence Rule (FRE 1001-1008)',
      description: 'Original document requirements and acceptable duplicates',
      controls: [
        {
          id: 'FRE.1001.1',
          name: 'Original Document Requirements',
          description:
            'Preference for original documents or acceptable duplicates',
          requirement:
            'Original documents must be produced unless duplicate is admissible under FRE 1003',
          severity: 'high',
          category: 'Original Evidence',
          evidenceRequired: [
            'Original document identification',
            'Duplicate creation methodology',
            'Accuracy verification of duplicates',
            'Justification for using duplicates',
          ],
        },
        {
          id: 'FRE.1001.2',
          name: 'Electronic Record Originals',
          description: 'Definition and handling of electronic record originals',
          requirement:
            'Electronic records must be preserved in original format with metadata',
          severity: 'critical',
          category: 'Electronic Originals',
          evidenceRequired: [
            'Original file format preservation',
            'Metadata preservation documentation',
            'System-generated record verification',
            'Storage medium authentication',
          ],
        },
      ],
    },
    {
      id: 'hearsay-exceptions-803-804',
      name: 'Hearsay Exceptions (FRE 803 & 804)',
      description:
        'Business records and other hearsay exceptions for automated systems',
      controls: [
        {
          id: 'FRE.803.6',
          name: 'Business Records Exception',
          description: 'Records kept in regular course of business activity',
          requirement:
            'Business records must be made at or near time of event by person with knowledge',
          severity: 'high',
          category: 'Business Records',
          evidenceRequired: [
            'Regular business practice documentation',
            'Record creation timing verification',
            'Knowledge source identification',
            'Custodian testimony or affidavit',
          ],
        },
        {
          id: 'FRE.803.8',
          name: 'Public Records Exception',
          description: 'Records of public offices and agencies',
          requirement:
            'Public records must be properly certified and from authorized sources',
          severity: 'medium',
          category: 'Public Records',
          evidenceRequired: [
            'Official certification of records',
            'Source authority verification',
            'Record authenticity confirmation',
            'Proper custodial procedures',
          ],
        },
      ],
    },
    {
      id: 'digital-evidence-standards',
      name: 'Digital Evidence Standards',
      description:
        'Specialized requirements for digital and electronic evidence',
      controls: [
        {
          id: 'DIGITAL.1',
          name: 'Forensic Imaging Standards',
          description: 'Bit-for-bit forensic imaging of digital media',
          requirement:
            'Digital media must be imaged using forensically sound methods',
          severity: 'critical',
          category: 'Forensic Imaging',
          evidenceRequired: [
            'Forensic imaging tool validation',
            'Write-blocking verification',
            'Hash verification of images',
            'Imaging process documentation',
            'Tool calibration records',
          ],
        },
        {
          id: 'DIGITAL.2',
          name: 'Metadata Preservation',
          description: 'Preservation of file and system metadata',
          requirement: 'All relevant metadata must be preserved and documented',
          severity: 'high',
          category: 'Metadata',
          evidenceRequired: [
            'File system metadata capture',
            'Application metadata preservation',
            'System timestamp documentation',
            'User activity metadata',
            'Network metadata records',
          ],
        },
        {
          id: 'DIGITAL.3',
          name: 'Network Evidence Collection',
          description: 'Collection and preservation of network-based evidence',
          requirement:
            'Network evidence must be collected with proper authorization and documentation',
          severity: 'high',
          category: 'Network Evidence',
          evidenceRequired: [
            'Legal authorization documentation',
            'Network capture methodology',
            'Packet integrity verification',
            'Chain of custody for network data',
            'Analysis tool validation',
          ],
        },
      ],
    },
    {
      id: 'indiana-specific',
      name: 'Indiana Rules of Evidence Specifics',
      description:
        'Indiana-specific evidence requirements and variations from FRE',
      controls: [
        {
          id: 'IRE.902.11',
          name: 'Indiana Business Records',
          description:
            'Indiana-specific business records authentication requirements',
          requirement:
            'Business records must comply with Indiana Rule 902(11) certification requirements',
          severity: 'medium',
          category: 'Indiana Business Records',
          evidenceRequired: [
            'Indiana-compliant certification',
            'Custodian affidavit per IRE 902(11)',
            'Regular business practice proof',
            'Indiana court precedent compliance',
          ],
        },
        {
          id: 'IRE.EXPERT',
          name: 'Expert Testimony Standards',
          description:
            'Indiana standards for expert testimony on technical evidence',
          requirement:
            'Expert testimony must meet Indiana qualification and reliability standards',
          severity: 'high',
          category: 'Expert Testimony',
          evidenceRequired: [
            'Expert qualification documentation',
            'Methodology reliability proof',
            'Peer review and acceptance evidence',
            'Error rate documentation',
            'Standards and controls proof',
          ],
        },
      ],
    },
  ],
};

export const COMPLIANCE_STANDARDS = [
  ISO27001_STANDARD,
  SOC2_STANDARD,
  HIPAA_STANDARD,
  FDA_CFR_STANDARD,
  FRE_LEGAL_STANDARD,
];

// Compliance Assessment Functions
export const assessCompliance = (
  data: ProjectData,
  standardId: string
): ComplianceAssessment => {
  const standard = COMPLIANCE_STANDARDS.find((s) => s.id === standardId);
  if (!standard) {
    throw new Error(`Unknown compliance standard: ${standardId}`);
  }

  const controlResults: { [controlId: string]: ComplianceControlResult } = {};
  const domainScores: { [domainId: string]: number } = {};
  const gaps: ComplianceGap[] = [];
  const recommendations: string[] = [];

  standard.domains.forEach((domain) => {
    let domainScore = 0;
    let controlCount = 0;

    domain.controls.forEach((control) => {
      const result = assessControl(data, control);
      controlResults[control.id] = result;
      domainScore += result.score;
      controlCount++;

      if (result.status === 'non-compliant' || result.status === 'partial') {
        gaps.push(...generateGapsForControl(control, result));
      }

      recommendations.push(...result.recommendations);
    });

    domainScores[domain.id] = controlCount > 0 ? domainScore / controlCount : 0;
  });

  const overallScore =
    Object.values(domainScores).reduce((sum, score) => sum + score, 0) /
    Object.keys(domainScores).length;
  const isCompliant =
    overallScore >= 80 &&
    gaps.filter((g) => g.severity === 'critical').length === 0;

  return {
    standardId,
    overallScore: Math.round(overallScore),
    domainScores: Object.fromEntries(
      Object.entries(domainScores).map(([k, v]) => [k, Math.round(v)])
    ),
    controlResults,
    gaps,
    recommendations: [...new Set(recommendations)],
    isCompliant,
  };
};

const assessControl = (
  data: ProjectData,
  control: ComplianceControl
): ComplianceControlResult => {
  // Enhanced assessment for legal evidence standards
  if (
    control.id.startsWith('FRE.') ||
    control.id.startsWith('IRE.') ||
    control.id.startsWith('DIGITAL.')
  ) {
    return assessLegalControl(data, control);
  }

  // Basic assessment logic for other compliance standards
  const evidence: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // Check if control is addressed in documents
  const relevantDocs = Object.values(data.documents).filter(
    (doc) =>
      doc.content &&
      doc.content.some(
        (section) =>
          section.description
            .toLowerCase()
            .includes(control.category.toLowerCase()) ||
          section.description.toLowerCase().includes('security') ||
          section.description.toLowerCase().includes('policy')
      )
  );

  if (relevantDocs.length > 0) {
    evidence.push(`Addressed in ${relevantDocs.length} document(s)`);
    score += 30;
  } else {
    gaps.push('No relevant documentation found');
    recommendations.push(`Create documentation addressing ${control.name}`);
  }

  // Check if control is addressed in requirements
  const relevantReqs = data.requirements.filter(
    (req) =>
      req.description.toLowerCase().includes(control.category.toLowerCase()) ||
      req.description.toLowerCase().includes('security') ||
      req.description.toLowerCase().includes('compliance')
  );

  if (relevantReqs.length > 0) {
    evidence.push(`${relevantReqs.length} related requirement(s) defined`);
    score += 40;
  } else {
    gaps.push('No related requirements defined');
    recommendations.push(`Define requirements for ${control.name}`);
  }

  // Check if control is addressed in risks
  const relevantRisks = data.risks.filter(
    (risk) =>
      risk.description.toLowerCase().includes(control.category.toLowerCase()) ||
      risk.description.toLowerCase().includes('security') ||
      risk.description.toLowerCase().includes('compliance')
  );

  if (relevantRisks.length > 0) {
    evidence.push(`${relevantRisks.length} related risk(s) identified`);
    score += 30;
  } else {
    gaps.push('No related risks identified');
    recommendations.push(`Identify risks related to ${control.name}`);
  }

  let status: ComplianceControlResult['status'];
  if (score >= 80) status = 'compliant';
  else if (score >= 50) status = 'partial';
  else status = 'non-compliant';

  return {
    controlId: control.id,
    status,
    score,
    evidence,
    gaps,
    recommendations,
  };
};

// Specialized assessment for legal evidence controls
const assessLegalControl = (
  data: ProjectData,
  control: ComplianceControl
): ComplianceControlResult => {
  const evidence: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // Legal evidence controls require stricter assessment
  const legalKeywords = [
    'chain of custody',
    'authentication',
    'hash',
    'signature',
    'metadata',
    'forensic',
    'evidence',
    'legal',
    'court',
    'admissible',
    'testimony',
  ];

  // Check for legal-specific documentation
  const legalDocs = Object.values(data.documents).filter(
    (doc) =>
      doc.content &&
      doc.content.some((section) =>
        legalKeywords.some(
          (keyword) =>
            section.description.toLowerCase().includes(keyword) ||
            section.title.toLowerCase().includes(keyword)
        )
      )
  );

  if (legalDocs.length > 0) {
    evidence.push(
      `Legal documentation found in ${legalDocs.length} document(s)`
    );
    score += 25;
  } else {
    gaps.push('No legal evidence documentation found');
    recommendations.push(
      `Create legal evidence documentation for ${control.name}`
    );
  }

  // Check for evidence-related requirements
  const evidenceReqs = data.requirements.filter((req) =>
    legalKeywords.some((keyword) =>
      req.description.toLowerCase().includes(keyword)
    )
  );

  if (evidenceReqs.length > 0) {
    evidence.push(
      `${evidenceReqs.length} evidence-related requirement(s) defined`
    );
    score += 25;
  } else {
    gaps.push('No evidence-related requirements defined');
    recommendations.push(
      `Define evidence handling requirements for ${control.name}`
    );
  }

  // Check for legal risks
  const legalRisks = data.risks.filter(
    (risk) =>
      legalKeywords.some((keyword) =>
        risk.description.toLowerCase().includes(keyword)
      ) ||
      risk.description.toLowerCase().includes('admissibility') ||
      risk.description.toLowerCase().includes('court')
  );

  if (legalRisks.length > 0) {
    evidence.push(`${legalRisks.length} legal risk(s) identified`);
    score += 20;
  } else {
    gaps.push('No legal admissibility risks identified');
    recommendations.push(`Identify legal risks for ${control.name}`);
  }

  // Check for specific evidence requirements based on control type
  if (control.id.includes('901.1') || control.category === 'Chain of Custody') {
    const custodyDocs = Object.values(data.documents).filter(
      (doc) =>
        doc.content &&
        doc.content.some(
          (section) =>
            section.description.toLowerCase().includes('custody') ||
            section.description.toLowerCase().includes('handling')
        )
    );

    if (custodyDocs.length > 0) {
      evidence.push('Chain of custody procedures documented');
      score += 15;
    } else {
      gaps.push('Chain of custody procedures not documented');
      recommendations.push(
        'Document chain of custody procedures with timestamps and handlers'
      );
    }
  }

  if (control.id.includes('901.3') || control.category === 'Data Integrity') {
    const hashDocs = Object.values(data.documents).filter(
      (doc) =>
        doc.content &&
        doc.content.some(
          (section) =>
            section.description.toLowerCase().includes('hash') ||
            section.description.toLowerCase().includes('integrity') ||
            section.description.toLowerCase().includes('checksum')
        )
    );

    if (hashDocs.length > 0) {
      evidence.push('Hash verification procedures documented');
      score += 15;
    } else {
      gaps.push('Hash verification procedures not documented');
      recommendations.push(
        'Document hash calculation and verification procedures (SHA-256 minimum)'
      );
    }
  }

  // Legal standards require higher thresholds
  let status: ComplianceControlResult['status'];
  if (score >= 85) status = 'compliant';
  else if (score >= 60) status = 'partial';
  else status = 'non-compliant';

  return {
    controlId: control.id,
    status,
    score,
    evidence,
    gaps,
    recommendations,
  };
};

const generateGapsForControl = (
  control: ComplianceControl,
  result: ComplianceControlResult
): ComplianceGap[] => {
  const gaps: ComplianceGap[] = [];

  if (result.status === 'non-compliant') {
    gaps.push({
      id: `gap-${control.id}`,
      controlId: control.id,
      severity: control.severity,
      title: `Non-compliance with ${control.name}`,
      description: `Control ${control.id} is not adequately addressed`,
      impact: 'High compliance risk and potential regulatory violations',
      remediation: `Implement ${control.name} according to standard requirements`,
      estimatedEffort:
        control.severity === 'critical' ? '2-4 weeks' : '1-2 weeks',
    });
  }

  return gaps;
};
