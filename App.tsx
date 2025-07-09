

import { Loader } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ArchitecturePage from './components/ArchitecturePage';
import AssessmentGenerator from './components/AssessmentGenerator';
import AuditLogPage from './components/AuditLogPage';
import BadgesPage from './components/BadgesPage';
import CmmiPage from './components/CmmiPage';
import ComplianceDashboard from './components/ComplianceDashboard';
import CompliancePage from './components/CompliancePage';
import ConfigurationPage from './components/ConfigurationPage';
import DocumentsPage from './components/DocumentsPage';
import EnhancedDashboard from './components/EnhancedDashboard';
import IssuesPage from './components/IssuesPage';
import ProcessAssetsPage from './components/ProcessAssetsPage';
import PullRequestsPage from './components/PullRequestsPage';
import QualityAssurancePage from './components/QualityAssurancePage';
import RequirementsPage from './components/RequirementsPage';
import RisksPage from './components/RisksPage';
import SecurityDashboard from './components/SecurityDashboard';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import TestCasesPage from './components/TestCasesPage';
import { initialProjectData } from './data/projectData';
import { analyzePullRequest, generateTestWorkflowFiles, scaffoldRepositoryFiles } from './services/geminiService';
import { getFileContent, getPullRequestFiles, getPullRequests, getRepoIssues, postCommentToPr, saveFileToRepo } from './services/githubService';
import { createPersistentAuditEntry, createPersistentAuditService, PersistentAuditService } from './services/persistentAuditService';
import { createWebhookAuditService, WebhookAuditService, WebhookConfig } from './services/webhookAuditService';
import { AuditLogEntry, ConfigurationItem, Document, DocumentSectionData, GitHubIssue, GitHubSettings, Page, PrAnalysisResult, ProcessAsset, ProjectData, PullRequest, Requirement, Risk, TestCase } from './types';

// Legacy createLogEntry function - now handled by createPersistentLogEntry in App component
// This is kept for backwards compatibility but should be replaced with persistent logging
const createLogEntry = (
  eventType: string,
  summary: string,
  details: Record<string, any> = {},
  actor: 'User' | 'AI' | 'System' | 'Automation' = 'User'
): AuditLogEntry => {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    actor,
    eventType,
    summary,
    details,
  };
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [projectData, setProjectData] = useState<ProjectData>(initialProjectData);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [githubSettings, setGithubSettings] = useState<GitHubSettings>(() => {
    try {
      const item = window.localStorage.getItem('githubSettings');
      return item ? JSON.parse(item) : { repoUrl: '', pat: '', filePath: 'ignition-project.json' };
    } catch (error) {
      console.error('Failed to load GitHub settings from localStorage', error);
      return { repoUrl: '', pat: '', filePath: 'ignition-project.json' };
    }
  });
  const [projectFileSha, setProjectFileSha] = useState<string | undefined>(undefined);
  const [persistentAuditService, setPersistentAuditService] = useState<PersistentAuditService | null>(null);
  const [webhookAuditService, setWebhookAuditService] = useState<WebhookAuditService | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(() => {
    try {
      const item = window.localStorage.getItem('webhookConfig');
      return item ? JSON.parse(item) : {
        enabled: false,
        secret: '',
        endpoint: '/api/webhooks/github',
        events: ['push', 'pull_request', 'issues'],
        fallbackToPAT: true
      };
    } catch (error) {
      console.error('Failed to load webhook config from localStorage', error);
      return {
        enabled: false,
        secret: '',
        endpoint: '/api/webhooks/github',
        events: ['push', 'pull_request', 'issues'],
        fallbackToPAT: true
      };
    }
  });

  // GitHub data states
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isFetchingPrs, setIsFetchingPrs] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<number, PrAnalysisResult>>({});
  const [isAnalyzingPr, setIsAnalyzingPr] = useState<number | null>(null);

  const githubSettingsConfigured = !!(githubSettings.repoUrl && githubSettings.pat && githubSettings.filePath);

  // Initialize persistent audit service when GitHub settings are configured
  useEffect(() => {
    if (githubSettingsConfigured) {
      const auditService = createPersistentAuditService({
        repoUrl: githubSettings.repoUrl,
        token: githubSettings.pat,
        filePath: 'audit-log.json'
      });
      setPersistentAuditService(auditService);

      // Load existing audit log from GitHub
      auditService.loadAuditLog().then(remoteEntries => {
        if (remoteEntries.length > 0) {
          setProjectData(currentData => ({
            ...currentData,
            auditLog: [...(currentData.auditLog || []), ...remoteEntries]
          }));
          console.log(`📋 Loaded ${remoteEntries.length} audit entries from GitHub repository`);
        }
      }).catch(error => {
        console.warn('Could not load audit log from GitHub:', error.message);
      });
    } else {
      setPersistentAuditService(null);
    }
  }, [githubSettingsConfigured, githubSettings.repoUrl, githubSettings.pat]);

  // Initialize webhook audit service
  useEffect(() => {
    const webhookService = createWebhookAuditService(webhookConfig);
    setWebhookAuditService(webhookService);

    // Save webhook config to localStorage when it changes
    try {
      window.localStorage.setItem('webhookConfig', JSON.stringify(webhookConfig));
    } catch (error) {
      console.error('Failed to save webhook config to localStorage', error);
    }
  }, [webhookConfig]);

  // Enhanced audit logging with persistent storage
  const createPersistentLogEntry = useCallback(async (
    eventType: string,
    summary: string,
    details: Record<string, any> = {},
    actor: 'User' | 'AI' | 'System' | 'Automation' = 'User'
  ): Promise<AuditLogEntry> => {
    const entry = createPersistentAuditEntry(eventType, summary, details, actor);

    // Add to local state immediately
    setProjectData(currentData => ({
      ...currentData,
      auditLog: [...(currentData.auditLog || []), entry]
    }));

    // Save to GitHub if persistent service is available (async, non-blocking)
    if (persistentAuditService) {
      persistentAuditService.addAuditEntry(entry).then(() => {
        console.log(`📋 Audit entry saved to GitHub: ${eventType}`);
      }).catch(error => {
        console.warn(`Failed to save audit entry to GitHub: ${error.message}`);
      });
    }

    return entry;
  }, [persistentAuditService]);

  // Auto-save audit entries to GitHub when they're added to local state
  useEffect(() => {
    if (persistentAuditService && projectData.auditLog && projectData.auditLog.length > 0) {
      // Get the last entry that might not be saved yet
      const lastEntry = projectData.auditLog[projectData.auditLog.length - 1];
      const cachedEntries = persistentAuditService.getCachedEntries();

      // Check if this entry is new (not in cached entries)
      const isNewEntry = !cachedEntries.find(entry => entry.id === lastEntry.id);

      if (isNewEntry && lastEntry.details?.persistentLogging !== false) {
        // Save new entry to GitHub (async, non-blocking)
        persistentAuditService.addAuditEntry(lastEntry).catch(error => {
          console.warn(`Background save to GitHub failed: ${error.message}`);
        });
      }
    }
  }, [projectData.auditLog, persistentAuditService]);


  const handleDocumentUpdate = useCallback((documentId: string, sectionId: string, newDescription: string, actor: 'User' | 'AI' = 'User') => {
    setProjectData(currentData => {
        const documents = currentData.documents;
        const targetDoc = documents[documentId];
        if (!targetDoc) return currentData;

        let oldSection: DocumentSectionData | null = null;
        const findOldSection = (sections: DocumentSectionData[]) => {
            for (const section of sections) {
                if (section.id === sectionId) {
                    oldSection = section;
                    return;
                }
                if(section.children) findOldSection(section.children);
            }
        };
        findOldSection(targetDoc.content);

        const updateRecursively = (sections: DocumentSectionData[]): DocumentSectionData[] => {
          return sections.map(section => {
            if (section.id === sectionId) {
              return { ...section, description: newDescription };
            }
            if (section.children && section.children.length > 0) {
              return { ...section, children: updateRecursively(section.children) };
            }
            return section;
          });
        };

        const updatedContent = updateRecursively(targetDoc.content);
        const updatedDoc: Document = { ...targetDoc, content: updatedContent };

        const logEntry = createLogEntry(
            'DOCUMENT_UPDATE',
            `Updated section "${oldSection?.title || sectionId}" in document "${targetDoc.title}"`,
            {
                documentId,
                sectionId,
                sectionTitle: oldSection?.title,
                before: oldSection?.description,
                after: newDescription,
            },
            actor
        );

        return {
            ...currentData,
            documents: { ...documents, [documentId]: updatedDoc },
            auditLog: [...(currentData.auditLog || []), logEntry]
        };
    });
  }, []);

  const handleExportProject = useCallback(() => {
    try {
      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.projectName.toLowerCase().replace(/\s/g, '-')}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const logEntry = createLogEntry('PROJECT_EXPORT', 'Project data exported to JSON file.', {}, 'System');
      setProjectData(currentData => ({
        ...currentData,
        auditLog: [...(currentData.auditLog || []), logEntry]
      }));

    } catch (error) {
      console.error("Error exporting project:", error);
      alert("An error occurred while exporting the project data.");
    }
  }, [projectData]);

  const handleImportProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text === 'string') {
                    const importedData = JSON.parse(text);
                    if (importedData && importedData.documents && importedData.requirements) {
                        const logEntry = createLogEntry('PROJECT_IMPORT', `Project data imported from file "${file.name}".`, { fileName: file.name }, 'System');
                        if (!importedData.auditLog) importedData.auditLog = [];
                        if (!importedData.projectName) importedData.projectName = "Imported Project";
                        if (!importedData.processAssets) importedData.processAssets = [];
                        importedData.auditLog.push(logEntry);
                        setProjectData(importedData);
                        setProjectFileSha(undefined); // Invalidate GitHub SHA
                         alert('Project imported successfully!');
                    } else {
                        throw new Error("Invalid project file format. The file is missing key structures like 'documents' or 'requirements'.");
                    }
                }
            } catch (error) {
                console.error("Failed to parse project file:", error);
                alert(`Error: Could not import project. The file might be corrupted or in the wrong format.\n\n${error}`);
            }
        };
        reader.onerror = () => {
             alert(`Error reading file: ${reader.error}`);
        };
        reader.readAsText(file);
    };
    input.click();
  }, []);

  const loadUIImpactAssessment = useCallback(async () => {
    try {
      const response = await fetch('/assessments/github_app_ui_impact_assessment.json');
      const assessmentData = await response.json();

      const logEntry = createLogEntry(
        'ASSESSMENT_LOADED',
        'GitHub App UI Impact Assessment loaded for meta-compliance analysis',
        { assessmentType: 'UI Impact Analysis', scope: 'GitHub App Integration' },
        'Meta-Compliance System'
      );
      assessmentData.auditLog.push(logEntry);

      setProjectData(assessmentData);
      setActivePage('Dashboard');
      alert('🎯 UI Impact Assessment loaded! Use Ignition to analyze GitHub App integration impacts.');
    } catch (error) {
      console.error('Error loading UI assessment:', error);
      alert('Error loading UI Impact Assessment. Make sure the assessment file exists.');
    }
  }, []);

  const handleAddRequirement = useCallback((newRequirement: Requirement) => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const requirementWithMeta: Requirement = {
            ...newRequirement,
            createdAt: now,
            updatedAt: now,
            createdBy: 'User',
            updatedBy: 'User',
        };
        const logEntry = createLogEntry(
            'REQUIREMENT_CREATE',
            `Created requirement ${requirementWithMeta.id}: "${requirementWithMeta.description}"`,
            { payload: requirementWithMeta },
            'User'
        );
        return {
            ...currentData,
            requirements: [...currentData.requirements, requirementWithMeta],
            auditLog: [...(currentData.auditLog || []), logEntry],
        };
    });
  }, []);

  const handleUpdateRequirement = useCallback((updatedRequirement: Requirement, linkedTestIds: string[], linkedCiIds: string[], linkedIssueIds: number[]) => {
    setProjectData(currentData => {
      const oldReq = currentData.requirements.find(r => r.id === updatedRequirement.id);
      const oldLinks = currentData.links[updatedRequirement.id] || { tests:[], cis:[], risks:[], issues:[] };

      const requirementWithMeta: Requirement = {
        ...updatedRequirement,
        updatedAt: new Date().toISOString(),
        updatedBy: 'User'
      };

      const updatedRequirements = currentData.requirements.map(r => r.id === requirementWithMeta.id ? requirementWithMeta : r);
      const updatedLinks = { ...currentData.links, [requirementWithMeta.id]: { ...(currentData.links[requirementWithMeta.id] || { risks: [] }), tests: linkedTestIds, cis: linkedCiIds, issues: linkedIssueIds } };

      const logEntry = createLogEntry('REQUIREMENT_UPDATE', `Updated requirement ${requirementWithMeta.id}`, { before: { requirement: oldReq, links: oldLinks }, after: { requirement: requirementWithMeta, links: { tests: linkedTestIds, cis: linkedCiIds, issues: linkedIssueIds } } });

      return { ...currentData, requirements: updatedRequirements, links: updatedLinks, auditLog: [...(currentData.auditLog || []), logEntry] };
    });
  }, []);

  const handleDeleteRequirement = useCallback((requirementId: string) => {
    setProjectData(currentData => {
      const requirementToDelete = currentData.requirements.find(r => r.id === requirementId);
      const newLinks = { ...currentData.links };
      delete newLinks[requirementId];

      const logEntry = createLogEntry('REQUIREMENT_DELETE', `Deleted requirement ${requirementId}: "${requirementToDelete?.description}"`, { payload: requirementToDelete });

      return {
        ...currentData,
        requirements: currentData.requirements.filter(r => r.id !== requirementId),
        links: newLinks,
        auditLog: [...(currentData.auditLog || []), logEntry]
      };
    });
  }, []);

  const handleAddTestCase = useCallback((newTestCase: TestCase, actor: 'User' | 'AI' = 'User') => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const testCaseWithMeta: TestCase = { ...newTestCase, createdAt: now, updatedAt: now, createdBy: actor, updatedBy: actor };
        const logEntry = createLogEntry('TEST_CASE_CREATE', `Created test case ${testCaseWithMeta.id}: "${testCaseWithMeta.description}"`, { payload: testCaseWithMeta }, actor);
        return {
            ...currentData,
            testCases: [...currentData.testCases, testCaseWithMeta],
            auditLog: [...(currentData.auditLog || []), logEntry]
        };
    });
  }, []);

  const handleUpdateTestCase = useCallback((updatedTestCase: TestCase) => {
      setProjectData(currentData => {
          const oldTestCase = currentData.testCases.find(tc => tc.id === updatedTestCase.id);
          const testCaseWithMeta: TestCase = { ...updatedTestCase, updatedAt: new Date().toISOString(), updatedBy: 'User' };
          const logEntry = createLogEntry('TEST_CASE_UPDATE', `Updated test case ${testCaseWithMeta.id}`, { before: oldTestCase, after: testCaseWithMeta });
          return {
              ...currentData,
              testCases: currentData.testCases.map(tc => tc.id === testCaseWithMeta.id ? testCaseWithMeta : tc),
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleDeleteTestCase = useCallback((testCaseId: string) => {
      setProjectData(currentData => {
          const testCaseToDelete = currentData.testCases.find(tc => tc.id === testCaseId);
          const newLinks = { ...currentData.links };
          Object.keys(newLinks).forEach(reqId => {
              if (newLinks[reqId]?.tests) {
                  newLinks[reqId].tests = newLinks[reqId].tests.filter(tId => tId !== testCaseId);
              }
          });
          const logEntry = createLogEntry('TEST_CASE_DELETE', `Deleted test case ${testCaseId}: "${testCaseToDelete?.description}"`, { payload: testCaseToDelete });
          return {
              ...currentData,
              testCases: currentData.testCases.filter(tc => tc.id !== testCaseId),
              links: newLinks,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleAddConfigurationItem = useCallback((newItem: ConfigurationItem) => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const itemWithMeta: ConfigurationItem = { ...newItem, createdAt: now, updatedAt: now, createdBy: 'User', updatedBy: 'User' };
        const logEntry = createLogEntry('CI_CREATE', `Created CI ${itemWithMeta.id}: "${itemWithMeta.name}"`, { payload: itemWithMeta });
        return {
            ...currentData,
            configurationItems: [...currentData.configurationItems, itemWithMeta],
            auditLog: [...(currentData.auditLog || []), logEntry]
        };
    });
  }, []);

  const handleUpdateConfigurationItem = useCallback((updatedItem: ConfigurationItem) => {
      setProjectData(currentData => {
          const oldItem = currentData.configurationItems.find(ci => ci.id === updatedItem.id);
          const itemWithMeta: ConfigurationItem = { ...updatedItem, updatedAt: new Date().toISOString(), updatedBy: 'User' };
          const logEntry = createLogEntry('CI_UPDATE', `Updated CI ${itemWithMeta.id}: "${itemWithMeta.name}"`, { before: oldItem, after: itemWithMeta });
          return {
              ...currentData,
              configurationItems: currentData.configurationItems.map(ci => ci.id === itemWithMeta.id ? itemWithMeta : ci),
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleDeleteConfigurationItem = useCallback((itemId: string) => {
      setProjectData(currentData => {
          const itemToDelete = currentData.configurationItems.find(ci => ci.id === itemId);
          const newLinks = { ...currentData.links };
          Object.keys(newLinks).forEach(reqId => {
              if (newLinks[reqId]?.cis) {
                  newLinks[reqId].cis = newLinks[reqId].cis.filter(ciId => ciId !== itemId);
              }
          });
          const newRiskCiLinks = { ...(currentData.riskCiLinks || {}) };
          Object.keys(newRiskCiLinks).forEach(riskId => {
              newRiskCiLinks[riskId] = newRiskCiLinks[riskId].filter(ciId => ciId !== itemId);
          });
          const logEntry = createLogEntry('CI_DELETE', `Deleted CI ${itemId}: "${itemToDelete?.name}"`, { payload: itemToDelete });

          return {
              ...currentData,
              configurationItems: currentData.configurationItems.filter(ci => ci.id !== itemId),
              links: newLinks,
              riskCiLinks: newRiskCiLinks,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleAddRisk = useCallback((newRisk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const riskWithMeta: Risk = { ...newRisk, createdAt: now, updatedAt: now, createdBy: 'User', updatedBy: 'User' };
        const newLinks = { ...currentData.links };
        linkedReqIds.forEach(reqId => {
            if (!newLinks[reqId]) newLinks[reqId] = { tests: [], risks: [], cis: [], issues: [] };
            if (!newLinks[reqId].risks) newLinks[reqId].risks = [];
            newLinks[reqId].risks.push(riskWithMeta.id);
        });

        const newRiskCiLinks = { ...(currentData.riskCiLinks || {}), [riskWithMeta.id]: linkedCiIds };
        const logEntry = createLogEntry('RISK_CREATE', `Created risk ${riskWithMeta.id}: "${riskWithMeta.description}"`, { payload: { risk: riskWithMeta, linkedReqs: linkedReqIds, linkedCis: linkedCiIds } });

        return {
            ...currentData,
            risks: [...currentData.risks, riskWithMeta],
            links: newLinks,
            riskCiLinks: newRiskCiLinks,
            auditLog: [...(currentData.auditLog || []), logEntry]
        };
    });
  }, []);

  const handleUpdateRisk = useCallback((updatedRisk: Risk, linkedReqIds: string[], linkedCiIds: string[]) => {
      setProjectData(currentData => {
          const oldRisk = currentData.risks.find(r => r.id === updatedRisk.id);
          const oldLinkedReqs = Object.keys(currentData.links).filter(reqId => currentData.links[reqId]?.risks?.includes(updatedRisk.id));
          const oldLinkedCis = currentData.riskCiLinks?.[updatedRisk.id] || [];

          const riskWithMeta: Risk = { ...updatedRisk, updatedAt: new Date().toISOString(), updatedBy: 'User' };
          const updatedRisks = currentData.risks.map(r => r.id === riskWithMeta.id ? riskWithMeta : r);

          const newLinks = { ...currentData.links };
          Object.keys(newLinks).forEach(reqId => {
              if (newLinks[reqId].risks) newLinks[reqId].risks = newLinks[reqId].risks.filter(riskId => riskId !== riskWithMeta.id);
          });
          linkedReqIds.forEach(reqId => {
              if (!newLinks[reqId]) newLinks[reqId] = { tests: [], risks: [], cis: [], issues: [] };
              if (!newLinks[reqId].risks) newLinks[reqId].risks = [];
              newLinks[reqId].risks.push(riskWithMeta.id);
          });

          const newRiskCiLinks = { ...(currentData.riskCiLinks || {}), [riskWithMeta.id]: linkedCiIds };
          const logEntry = createLogEntry('RISK_UPDATE', `Updated risk ${riskWithMeta.id}`, { before: { risk: oldRisk, linkedReqs: oldLinkedReqs, linkedCis: oldLinkedCis }, after: { risk: riskWithMeta, linkedReqs: linkedReqIds, linkedCis: linkedCiIds } });

          return {
              ...currentData,
              risks: updatedRisks,
              links: newLinks,
              riskCiLinks: newRiskCiLinks,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleDeleteRisk = useCallback((riskId: string) => {
      setProjectData(currentData => {
          const riskToDelete = currentData.risks.find(r => r.id === riskId);
          const newLinks = { ...currentData.links };
          Object.keys(newLinks).forEach(reqId => {
              if (newLinks[reqId]?.risks) newLinks[reqId].risks = newLinks[reqId].risks.filter(rId => rId !== riskId);
          });
          const newRiskCiLinks = { ...(currentData.riskCiLinks || {}) };
          delete newRiskCiLinks[riskId];
          const logEntry = createLogEntry('RISK_DELETE', `Deleted risk ${riskId}: "${riskToDelete?.description}"`, { payload: riskToDelete });

          return {
              ...currentData,
              risks: currentData.risks.filter(r => r.id !== riskId),
              links: newLinks,
              riskCiLinks: newRiskCiLinks,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleUpdateIssueLinks = useCallback((issueNumber: number, linkedReqIds: string[], linkedCiIds: string[], linkedRiskIds: string[]) => {
    setProjectData(currentData => {
        // --- Store old state for logging ---
        const oldLinkedReqIds = Object.keys(currentData.links).filter(reqId => currentData.links[reqId]?.issues?.includes(issueNumber));
        const oldLinkedCiIds = currentData.issueCiLinks?.[issueNumber] || [];
        const oldLinkedRiskIds = currentData.issueRiskLinks?.[issueNumber] || [];

        // --- Update Requirement links (many-to-many) ---
        const newLinks = JSON.parse(JSON.stringify(currentData.links)); // Deep copy to be safe
        // Remove all existing links from requirements TO this issue
        Object.keys(newLinks).forEach(reqId => {
            if (newLinks[reqId].issues) {
                newLinks[reqId].issues = newLinks[reqId].issues.filter((num: number) => num !== issueNumber);
            }
        });
        // Add the new links from requirements TO this issue
        linkedReqIds.forEach(reqId => {
            if (newLinks[reqId]) {
                if (!newLinks[reqId].issues) newLinks[reqId].issues = [];
                newLinks[reqId].issues.push(issueNumber);
            }
        });

        // --- Update CI links (one-to-many from issue) ---
        const newIssueCiLinks = { ...(currentData.issueCiLinks || {}), [issueNumber]: linkedCiIds };

        // --- Update Risk links (one-to-many from issue) ---
        const newIssueRiskLinks = { ...(currentData.issueRiskLinks || {}), [issueNumber]: linkedRiskIds };

        const logEntry = createLogEntry(
            'ISSUE_LINK_UPDATE',
            `Updated traceability links for GitHub Issue #${issueNumber}`,
            {
                issueNumber,
                before: { reqs: oldLinkedReqIds, cis: oldLinkedCiIds, risks: oldLinkedRiskIds },
                after: { reqs: linkedReqIds, cis: linkedCiIds, risks: linkedRiskIds },
            },
            'User'
        );

        return {
            ...currentData,
            links: newLinks,
            issueCiLinks: newIssueCiLinks,
            issueRiskLinks: newIssueRiskLinks,
            auditLog: [...(currentData.auditLog || []), logEntry]
        };
    });
  }, []);

  const handleUpdateProjectName = useCallback((newName: string) => {
      setProjectData(currentData => {
          const oldName = currentData.projectName;
          const logEntry = createLogEntry(
              'PROJECT_UPDATE',
              `Project name changed from "${oldName}" to "${newName}"`,
              { before: { projectName: oldName }, after: { projectName: newName } },
              'User'
          );

          return {
              ...currentData,
              projectName: newName,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleAddProcessAsset = useCallback((newAsset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const assetWithMeta: ProcessAsset = {
            ...newAsset,
            createdAt: now,
            updatedAt: now,
            createdBy: 'User',
            updatedBy: 'User',
        };

        // Create asset links
        const newAssetLinks = { ...(currentData.assetLinks || {}) };
        newAssetLinks[assetWithMeta.id] = {
            requirements: linkedReqIds || [],
            risks: linkedRiskIds || [],
            cis: linkedCiIds || [],
        };

        // Initialize asset usage tracking
        const newAssetUsage = { ...(currentData.assetUsage || {}) };
        newAssetUsage[assetWithMeta.id] = {
            usageCount: 0,
            lastUsed: now,
            generatedItems: [],
        };

        const logEntry = createLogEntry(
            'PROCESS_ASSET_CREATE',
            `Created process asset ${assetWithMeta.id}: "${assetWithMeta.name}" with ${(linkedReqIds || []).length} requirements, ${(linkedRiskIds || []).length} risks, ${(linkedCiIds || []).length} CIs linked`,
            { payload: assetWithMeta, links: { requirements: linkedReqIds || [], risks: linkedRiskIds || [], cis: linkedCiIds || [] } },
            'User'
        );
        return {
            ...currentData,
            processAssets: [...(currentData.processAssets || []), assetWithMeta],
            assetLinks: newAssetLinks,
            assetUsage: newAssetUsage,
            auditLog: [...(currentData.auditLog || []), logEntry],
        };
    });
  }, []);

  const handleUpdateProcessAsset = useCallback((updatedAsset: ProcessAsset, linkedReqIds: string[], linkedRiskIds: string[], linkedCiIds: string[]) => {
      setProjectData(currentData => {
          const oldAsset = (currentData.processAssets || []).find(a => a.id === updatedAsset.id);
          const oldLinks = currentData.assetLinks?.[updatedAsset.id] || { requirements: [], risks: [], cis: [] };

          const assetWithMeta: ProcessAsset = {
              ...updatedAsset,
              updatedAt: new Date().toISOString(),
              updatedBy: 'User'
          };

          // Update asset links
          const newAssetLinks = { ...(currentData.assetLinks || {}) };
          newAssetLinks[assetWithMeta.id] = {
              requirements: linkedReqIds,
              risks: linkedRiskIds,
              cis: linkedCiIds,
          };

          const logEntry = createLogEntry(
              'PROCESS_ASSET_UPDATE',
              `Updated process asset ${assetWithMeta.id} with ${linkedReqIds.length} requirements, ${linkedRiskIds.length} risks, ${linkedCiIds.length} CIs linked`,
              {
                  before: { asset: oldAsset, links: oldLinks },
                  after: { asset: assetWithMeta, links: { requirements: linkedReqIds, risks: linkedRiskIds, cis: linkedCiIds } }
              }
          );
          return {
              ...currentData,
              processAssets: (currentData.processAssets || []).map(a => a.id === assetWithMeta.id ? assetWithMeta : a),
              assetLinks: newAssetLinks,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleDeleteProcessAsset = useCallback((assetId: string) => {
      setProjectData(currentData => {
          const assetToDelete = (currentData.processAssets || []).find(a => a.id === assetId);
          const deletedLinks = currentData.assetLinks?.[assetId];
          const deletedUsage = currentData.assetUsage?.[assetId];

          // Clean up asset links
          const newAssetLinks = { ...(currentData.assetLinks || {}) };
          delete newAssetLinks[assetId];

          // Clean up asset usage
          const newAssetUsage = { ...(currentData.assetUsage || {}) };
          delete newAssetUsage[assetId];

          const logEntry = createLogEntry(
              'PROCESS_ASSET_DELETE',
              `Deleted process asset ${assetId}: "${assetToDelete?.name}"`,
              { payload: assetToDelete, deletedLinks, deletedUsage }
          );

          return {
              ...currentData,
              processAssets: (currentData.processAssets || []).filter(a => a.id !== assetId),
              assetLinks: newAssetLinks,
              assetUsage: newAssetUsage,
              auditLog: [...(currentData.auditLog || []), logEntry]
          };
      });
  }, []);

  const handleAssetUsed = useCallback((assetId: string, generatedItemType: 'requirement' | 'risk' | 'test' | 'ci', generatedItemId: string) => {
    setProjectData(currentData => {
        const now = new Date().toISOString();
        const newAssetUsage = { ...(currentData.assetUsage || {}) };

        if (!newAssetUsage[assetId]) {
            newAssetUsage[assetId] = {
                usageCount: 0,
                lastUsed: now,
                generatedItems: [],
            };
        }

        newAssetUsage[assetId] = {
            ...newAssetUsage[assetId],
            usageCount: newAssetUsage[assetId].usageCount + 1,
            lastUsed: now,
            generatedItems: [
                ...newAssetUsage[assetId].generatedItems,
                {
                    type: generatedItemType,
                    id: generatedItemId,
                    createdAt: now,
                }
            ],
        };

        const logEntry = createLogEntry(
            'ASSET_USAGE',
            `Process asset ${assetId} was used to generate ${generatedItemType} ${generatedItemId}`,
            { assetId, generatedItemType, generatedItemId },
            'User'
        );

        return {
            ...currentData,
            assetUsage: newAssetUsage,
            auditLog: [...(currentData.auditLog || []), logEntry],
        };
    });
  }, []);

  const handleResetProjectData = useCallback(() => {
      const logEntry = createLogEntry(
          'PROJECT_RESET',
          'Project data has been reset to its initial state.',
          {},
          'System'
      );
      const resetData = { ...initialProjectData, auditLog: [logEntry] };
      setProjectData(resetData);
      setProjectFileSha(undefined); // Invalidate GitHub SHA
      setActivePage('Dashboard');
  }, []);

  const handleUpdateGithubSettings = useCallback((settings: GitHubSettings) => {
    setGithubSettings(settings);
    window.localStorage.setItem('githubSettings', JSON.stringify(settings));
    setProjectFileSha(undefined); // Invalidate SHA as settings changed
    setGithubIssues([]); // Clear issues cache as repo might have changed
    setPullRequests([]); // Clear PRs cache
    alert('GitHub settings saved!');
  }, []);

  const handleUpdateWebhookConfig = useCallback((config: WebhookConfig) => {
    setWebhookConfig(config);

    // Create audit entry for webhook configuration change
    const logEntry = createLogEntry(
      'WEBHOOK_CONFIG_UPDATE',
      `Webhook configuration updated: ${config.enabled ? 'enabled' : 'disabled'}`,
      {
        config: { ...config, secret: config.secret ? '[REDACTED]' : '' },
        events: config.events,
        fallbackToPAT: config.fallbackToPAT
      },
      'User'
    );

    setProjectData(currentData => ({
      ...currentData,
      auditLog: [...(currentData.auditLog || []), logEntry]
    }));

    alert(`Webhook configuration ${config.enabled ? 'enabled' : 'disabled'}!`);
  }, []);

  const handleLoadFromGithub = useCallback(async () => {
    if (!githubSettingsConfigured) {
        alert("Please configure GitHub repository URL, PAT, and file path in Settings.");
        setActivePage('Settings');
        return;
    }

    setLoadingMessage('Loading from GitHub...');
    setIsLoading(true);

    try {
        const { content, sha } = await getFileContent(githubSettings);
        const importedData = JSON.parse(content);

        if (importedData && importedData.documents && importedData.requirements) {
             const logEntry = createLogEntry('PROJECT_IMPORT_GITHUB', `Project data loaded from GitHub repo: ${githubSettings.repoUrl}`, { path: githubSettings.filePath }, 'System');
             if (!importedData.auditLog) importedData.auditLog = [];
             if (!importedData.processAssets) importedData.processAssets = [];
             importedData.auditLog.push(logEntry);
             setProjectData(importedData);
             setProjectFileSha(sha); // Store the sha for the next save
             alert('Project loaded successfully from GitHub!');
        } else {
             throw new Error("Invalid project file format from GitHub.");
        }
    } catch (error: any) {
        console.error("Failed to load from GitHub:", error);
        let alertMessage = `Error loading from GitHub: ${error.message}`;
        if (error.message.includes('404')) {
            alertMessage += `\n\nPossible reasons:\n- The repository URL is incorrect.\n- The file path '${githubSettings.filePath}' does not exist in the repository.\n- The repository is private and the Personal Access Token (PAT) does not have access.`;
        } else if (error.message.includes('403')) {
             alertMessage += `\n\nYour Personal Access Token (PAT) may not have the required 'repo' scope or access to this repository.`;
        }
        alert(alertMessage);
    } finally {
        setIsLoading(false);
    }
  }, [githubSettings, githubSettingsConfigured]);

  const handleSaveToGithub = useCallback(async () => {
    if (!githubSettingsConfigured) {
        alert("Please configure GitHub repository URL, PAT, and file path in Settings.");
        setActivePage('Settings');
        return;
    }

    // Use default commit message for Electron compatibility (prompt() not supported)
    const commitMessage = `Update project state via Ignition - ${new Date().toISOString()}`;

    setLoadingMessage('Saving to GitHub...');
    setIsLoading(true);

    try {
        const jsonString = JSON.stringify(projectData, null, 2);
        let currentSha = projectFileSha;

        if (!currentSha) {
            try {
                const fileData = await getFileContent(githubSettings);
                currentSha = fileData.sha;
            } catch (e: any) {
                if (!e.message.includes('404')) {
                    throw e;
                }
            }
        }

        const result = await saveFileToRepo(githubSettings, githubSettings.filePath, jsonString, commitMessage, currentSha);
        setProjectFileSha(result.content.sha);

        const logEntry = createLogEntry('PROJECT_EXPORT_GITHUB', `Project data saved to GitHub repo: ${githubSettings.repoUrl}`, { commit: result.commit.sha, path: githubSettings.filePath }, 'System');
         setProjectData(currentData => ({
            ...currentData,
            auditLog: [...(currentData.auditLog || []), logEntry]
        }));

        alert(`Project successfully saved to GitHub! Commit: ${result.commit.sha.substring(0,7)}`);
    } catch (error: any) {
        console.error("Failed to save to GitHub:", error);
        let alertMessage = `Error saving to GitHub: ${error.message}`;
        if (error.message.includes('409') || error.message.includes('sha')) {
            alertMessage = 'Conflict detected. The file on GitHub may have been updated. Please "Load from GitHub" first to get the latest version before saving.';
            setProjectFileSha(undefined);
        } else if (error.message.includes('404')) {
            alertMessage += `\n\nThe repository was not found or the path is incorrect. Please check your GitHub settings.`;
        } else if (error.message.includes('403')) {
            alertMessage += `\n\nYour Personal Access Token (PAT) may not have the required 'repo' scope to write to this repository.`;
        }
        alert(alertMessage);
    } finally {
        setIsLoading(false);
    }
  }, [projectData, githubSettings, projectFileSha, githubSettingsConfigured]);

  const handleFetchIssues = useCallback(async () => {
    if (!githubSettingsConfigured || isFetchingIssues) {
        return;
    }

    setIsFetchingIssues(true);
    try {
        const issues = await getRepoIssues(githubSettings);
        setGithubIssues(issues);
    } catch (error: any) {
        console.error("Failed to fetch GitHub issues:", error);
        let alertMessage = `Error fetching GitHub issues: ${error.message}`;
        if (error.message.includes('404')) {
             alertMessage += "\n\nCould not find the repository. Please check your GitHub settings.";
        } else if (error.message.includes('403')) {
             alertMessage += "\n\nYour Personal Access Token (PAT) may not have permission to read issues from this repository.";
        }
        alert(alertMessage);
        setGithubIssues([]); // Clear issues on error
    } finally {
        setIsFetchingIssues(false);
    }
  }, [githubSettings, githubSettingsConfigured, isFetchingIssues]);

  const handleFetchPullRequests = useCallback(async () => {
      if (!githubSettingsConfigured || isFetchingPrs) return;
      setIsFetchingPrs(true);
      try {
          const prs = await getPullRequests(githubSettings);
          setPullRequests(prs);
      } catch (error: any) {
          console.error("Failed to fetch GitHub pull requests:", error);
          let alertMessage = `Error fetching GitHub pull requests: ${error.message}`;
          if (error.message.includes('404')) {
            alertMessage += "\n\nCould not find the repository. Please check your GitHub settings.";
          } else if (error.message.includes('403')) {
            alertMessage += "\n\nYour Personal Access Token (PAT) may not have permission to read pull requests from this repository.";
          }
          alert(alertMessage);
          setPullRequests([]);
      } finally {
          setIsFetchingPrs(false);
      }
  }, [githubSettings, githubSettingsConfigured, isFetchingPrs]);

  const handleAnalyzePullRequest = useCallback(async (pr: PullRequest) => {
      if (!githubSettingsConfigured || isAnalyzingPr) return;
      setIsAnalyzingPr(pr.number);
      try {
          const files = await getPullRequestFiles(githubSettings, pr.number);
          const result = await analyzePullRequest(pr, files, projectData);
          setAnalysisResults(prev => ({ ...prev, [pr.number]: result }));
          const logEntry = createLogEntry('PR_ANALYSIS', `AI analysis completed for PR #${pr.number}`, { prNumber: pr.number, result }, 'AI');
          setProjectData(currentData => ({...currentData, auditLog: [...(currentData.auditLog || []), logEntry]}));
      } catch (error: any) {
          console.error(`Failed to analyze PR #${pr.number}:`, error);
          let alertMessage = `Error analyzing pull request: ${error.message}`;
          if (error.message.includes('GitHub API Error')) {
              alertMessage += `\n\nPlease check your GitHub settings and that your PAT has 'repo' scope.`
          }
          alert(alertMessage);
          setAnalysisResults(prev => ({...prev, [pr.number]: { error: error.message } as any }));
      } finally {
          setIsAnalyzingPr(null);
      }
  }, [githubSettings, githubSettingsConfigured, projectData, isAnalyzingPr]);

  const handlePostPrComment = useCallback(async (prNumber: number, commentBody: string) => {
    setLoadingMessage(`Posting comment to PR #${prNumber}...`);
    setIsLoading(true);
    try {
      await postCommentToPr(githubSettings, prNumber, commentBody);
      alert('Successfully posted analysis to Pull Request!');
      const logEntry = createLogEntry('PR_COMMENT', `Posted AI analysis to PR #${prNumber}`, { prNumber }, 'System');
      setProjectData(currentData => ({...currentData, auditLog: [...(currentData.auditLog || []), logEntry]}));
    } catch (error: any)      {
      console.error(`Failed to post comment to PR #${prNumber}:`, error);
      let alertMessage = `Error posting comment: ${error.message}`;
      if (error.message.includes('403')) {
          alertMessage += `\n\nYour PAT may not have permission to write comments to this repository.`;
      } else if (error.message.includes('404')) {
          alertMessage += `\n\nCould not find the repository or the pull request.`;
      }
      alert(alertMessage);
    } finally {
        setIsLoading(false);
    }
  }, [githubSettings]);

  const handleScaffoldRepository = useCallback(async () => {
    if (!githubSettingsConfigured) {
        alert("Please configure and save your GitHub settings first.");
        return;
    }

    setLoadingMessage('Scaffolding repository...');
    setIsLoading(true);
    try {
        const files = await scaffoldRepositoryFiles(projectData);
        let createdFiles = [];

        for (const [filePath, content] of Object.entries(files)) {
            setLoadingMessage(`Committing ${filePath}...`);
            await saveFileToRepo(githubSettings, filePath, content, `feat: add ${filePath}`);
            createdFiles.push(filePath);
        }

        const logEntry = createLogEntry('REPO_SCAFFOLD', 'AI scaffolded repository with initial files.', { files: createdFiles }, 'AI');
        setProjectData(currentData => ({...currentData, auditLog: [...(currentData.auditLog || []), logEntry]}));

        alert(`Repository scaffolding complete! The following files have been committed:\n\n- ${createdFiles.join('\n- ')}`);
    } catch (e: any) {
        console.error("Failed to scaffold repository:", e);
        let alertMessage = `Error scaffolding repository: ${e.message}`;
        if (e.message.includes('403')) {
            alertMessage += `\n\nThis usually means your Personal Access Token (PAT) lacks the necessary 'repo' scope to write to the repository. Please verify your PAT permissions on GitHub.`;
        } else if (e.message.includes('404')) {
            alertMessage += `\n\nThe repository was not found. Please check if the Repository URL is correct.`;
        }
        alert(alertMessage);
    } finally {
        setIsLoading(false);
    }
  }, [githubSettings, githubSettingsConfigured, projectData]);

  const handleGenerateTestWorkflow = useCallback(async () => {
    if (!githubSettingsConfigured) {
        alert("Please configure and save your GitHub settings first.");
        return;
    }

    setLoadingMessage('Generating test workflow...');
    setIsLoading(true);
    try {
        const files = await generateTestWorkflowFiles();
        let createdFiles = [];

        for (const [filePath, content] of Object.entries(files)) {
            setLoadingMessage(`Committing ${filePath}...`);
            await saveFileToRepo(githubSettings, filePath, content, `ci: add Ignition testing workflow for ${filePath}`);
            createdFiles.push(filePath);
        }

        const logEntry = createLogEntry('TEST_WORKFLOW_GENERATE', 'AI generated GitHub Actions testing workflow.', { files: createdFiles }, 'AI');
        setProjectData(currentData => ({...currentData, auditLog: [...(currentData.auditLog || []), logEntry]}));

        alert(`Testing workflow generated successfully! The following files have been committed:\n\n- ${createdFiles.join('\n- ')}\n\nTo complete setup, ensure '@cucumber/cucumber' is in your package.json and your test runner is configured. You can use the 'Scaffold Repository' action to generate a suitable package.json.`);
    } catch (e: any) {
        console.error("Failed to generate test workflow:", e);
        let alertMessage = `Error generating workflow: ${e.message}`;
        if (e.message.includes('403')) {
            alertMessage += `\n\nThis usually means your Personal Access Token (PAT) lacks the necessary 'repo' scope to write to the repository. Please verify your PAT permissions on GitHub.`;
        }
        alert(alertMessage);
    } finally {
        setIsLoading(false);
    }
  }, [githubSettings, githubSettingsConfigured]);

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return <EnhancedDashboard projectData={projectData} onDocumentUpdate={handleDocumentUpdate} />;
      case 'Documents':
        return <DocumentsPage documents={projectData.documents} onDocumentUpdate={handleDocumentUpdate} />;
      case 'Requirements':
        return <RequirementsPage
                  projectData={projectData}
                  onAddRequirement={handleAddRequirement}
                  onUpdateRequirement={handleUpdateRequirement}
                  onDeleteRequirement={handleDeleteRequirement}
                  onAddTestCase={handleAddTestCase}
                  githubIssues={githubIssues}
                  isFetchingIssues={isFetchingIssues}
                  onFetchIssues={handleFetchIssues}
                  githubSettingsConfigured={githubSettingsConfigured}
                  onAssetUsed={handleAssetUsed}
               />;
      case 'Test Cases':
        return <TestCasesPage
                  projectData={projectData}
                  onAddTestCase={handleAddTestCase}
                  onUpdateTestCase={handleUpdateTestCase}
                  onDeleteTestCase={handleDeleteTestCase}
               />;
      case 'Configuration':
        return <ConfigurationPage
                  projectData={projectData}
                  onAddConfigurationItem={handleAddConfigurationItem}
                  onUpdateConfigurationItem={handleUpdateConfigurationItem}
                  onDeleteConfigurationItem={handleDeleteConfigurationItem}
                />;
      case 'Architecture':
        return <ArchitecturePage projectData={projectData} />;
      case 'Organizational Intelligence':
        return <OrganizationalDashboard
                  projectData={projectData}
                  organizationalData={projectData.organizationalData}
                  onRefreshData={() => {
                    // TODO: Implement organizational data refresh
                    console.log('Refreshing organizational data...');
                  }}
               />;
      case 'Process Assets':
        return <ProcessAssetsPage
                  projectData={projectData}
                  onAddProcessAsset={handleAddProcessAsset}
                  onUpdateProcessAsset={handleUpdateProcessAsset}
                  onDeleteProcessAsset={handleDeleteProcessAsset}
               />;
      case 'Pull Requests':
        return <PullRequestsPage
                  pullRequests={pullRequests}
                  isFetchingPrs={isFetchingPrs}
                  onFetchPullRequests={handleFetchPullRequests}
                  githubSettingsConfigured={githubSettingsConfigured}
                  onAnalyzePullRequest={handleAnalyzePullRequest}
                  analysisResults={analysisResults}
                  isAnalyzingPr={isAnalyzingPr}
                  onPostComment={handlePostPrComment}
                />;
       case 'Issues':
        return <IssuesPage
                  projectData={projectData}
                  githubIssues={githubIssues}
                  isFetchingIssues={isFetchingIssues}
                  onFetchIssues={handleFetchIssues}
                  githubSettingsConfigured={githubSettingsConfigured}
                  onUpdateIssueLinks={handleUpdateIssueLinks}
                />;
      case 'Risks':
        return <RisksPage
                  projectData={projectData}
                  onAddRisk={handleAddRisk}
                  onUpdateRisk={handleUpdateRisk}
                  onDeleteRisk={handleDeleteRisk}
                  onAssetUsed={handleAssetUsed}
                />;
      case 'CMMI':
        return <CmmiPage projectData={projectData} />;
      case 'Badges':
        return <BadgesPage projectData={projectData} />;
      case 'Quality Assurance':
        return <QualityAssurancePage projectData={projectData} />;
      case 'Compliance':
        return <CompliancePage projectData={projectData} />;
      case 'Compliance Dashboard':
        return <ComplianceDashboard
          auditLog={projectData.auditLog || []}
          githubSettings={githubSettings}
          onGenerateIntegrityReport={async () => {
            // TODO: Implement integrity report generation
            alert('Integrity report generation coming soon!');
          }}
          onExportCompliancePackage={async () => {
            // TODO: Implement compliance package export
            alert('Compliance package export coming soon!');
          }}
        />;
      case 'Security':
        return <SecurityDashboard projectData={projectData} githubSettings={githubSettings} />;
      case 'Audit Log':
        return <AuditLogPage
          projectData={projectData}
          githubSettings={githubSettings}
          onAddAuditEntries={async (entries) => {
            if (persistentAuditService) {
              await persistentAuditService.addAuditEntries(entries);
              // Reload project data to show new entries
              await loadProjectData();
            }
          }}
        />;
      case 'AI Assessment':
        return <AssessmentGenerator
                  onAssessmentGenerated={(assessment) => {
                    setProjectData(assessment);
                    setActivePage('Dashboard');
                  }}
                  existingProject={projectData}
               />;
      case 'Settings':
        return <SettingsPage
                  projectName={projectData.projectName}
                  projectData={projectData}
                  onUpdateProjectName={handleUpdateProjectName}
                  onResetProjectData={handleResetProjectData}
                  githubSettings={githubSettings}
                  onUpdateGithubSettings={handleUpdateGithubSettings}
                  webhookConfig={webhookConfig}
                  onUpdateWebhookConfig={handleUpdateWebhookConfig}
                  onScaffoldRepository={handleScaffoldRepository}
                  onGenerateTestWorkflow={handleGenerateTestWorkflow}
                  onLoadUIAssessment={loadUIImpactAssessment}
               />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{activePage}</h2>
              <p>This section is under construction.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen font-sans text-white bg-gray-950 overflow-hidden">
       {isLoading && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="animate-spin text-brand-primary" />
            <p className="text-xl text-white font-semibold">{loadingMessage}</p>
            </div>
        </div>
        )}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onImportProject={handleImportProject}
        onExportProject={handleExportProject}
        onLoadFromGithub={handleLoadFromGithub}
        onSaveToGithub={handleSaveToGithub}
        githubSettingsConfigured={githubSettingsConfigured}
        projectName={projectData.projectName}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;