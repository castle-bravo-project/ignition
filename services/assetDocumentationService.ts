/**
 * Asset Documentation Service - Auto-generates human-readable documentation
 * 
 * This service creates beautiful markdown documentation from structured process assets
 * and can update GitHub wikis or generate standalone documentation files.
 */

import { ProcessAsset, ProjectData } from '../types';
import { AssetFileStructure } from './assetFileService';
import { saveFileToRepo } from './githubService';

export interface DocumentationOptions {
  includeUsageStats: boolean;
  includeLinks: boolean;
  includeExamples: boolean;
  groupByType: boolean;
  generateTOC: boolean;
}

/**
 * Generates a comprehensive PROCESS_ASSETS.md file from all assets
 */
export async function generateProcessAssetsDocumentation(
  assets: ProcessAsset[],
  projectData: ProjectData,
  options: DocumentationOptions = {
    includeUsageStats: true,
    includeLinks: true,
    includeExamples: true,
    groupByType: true,
    generateTOC: true
  }
): Promise<string> {
  const doc = [];
  
  // Header
  doc.push('# Process Asset Library');
  doc.push('');
  doc.push('> **Auto-generated documentation** from the Ignition Process Asset Framework');
  doc.push('> Last updated: ' + new Date().toISOString().split('T')[0]);
  doc.push('');
  
  // Summary stats
  const stats = generateAssetStatistics(assets, projectData);
  doc.push('## 📊 Library Overview');
  doc.push('');
  doc.push(`- **Total Assets**: ${stats.totalAssets}`);
  doc.push(`- **Requirement Archetypes**: ${stats.requirementArchetypes}`);
  doc.push(`- **Solution Blueprints**: ${stats.solutionBlueprints}`);
  doc.push(`- **Risk Playbooks**: ${stats.riskPlaybooks}`);
  doc.push(`- **Test Strategies**: ${stats.testStrategies}`);
  doc.push(`- **Total Usage**: ${stats.totalUsage} times`);
  doc.push('');

  // Table of Contents
  if (options.generateTOC) {
    doc.push('## 📑 Table of Contents');
    doc.push('');
    
    if (options.groupByType) {
      const types: ProcessAsset['type'][] = ['Requirement Archetype', 'Solution Blueprint', 'Risk Playbook', 'Test Strategy'];
      for (const type of types) {
        const typeAssets = assets.filter(a => a.type === type);
        if (typeAssets.length > 0) {
          doc.push(`- [${type}s](#${type.toLowerCase().replace(/\s+/g, '-')}s)`);
          for (const asset of typeAssets) {
            doc.push(`  - [${asset.name}](#${asset.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})`);
          }
        }
      }
    } else {
      for (const asset of assets) {
        doc.push(`- [${asset.name}](#${asset.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})`);
      }
    }
    doc.push('');
  }

  // Asset documentation
  if (options.groupByType) {
    const types: ProcessAsset['type'][] = ['Requirement Archetype', 'Solution Blueprint', 'Risk Playbook', 'Test Strategy'];
    
    for (const type of types) {
      const typeAssets = assets.filter(a => a.type === type);
      if (typeAssets.length === 0) continue;
      
      doc.push(`## ${type}s`);
      doc.push('');
      doc.push(getTypeDescription(type));
      doc.push('');
      
      for (const asset of typeAssets) {
        doc.push(...generateAssetDocumentation(asset, projectData, options));
      }
    }
  } else {
    doc.push('## All Assets');
    doc.push('');
    
    for (const asset of assets) {
      doc.push(...generateAssetDocumentation(asset, projectData, options));
    }
  }

  // Footer
  doc.push('---');
  doc.push('');
  doc.push('*This documentation is automatically generated from the Ignition Process Asset Framework.*');
  doc.push('*To update this documentation, modify the assets in your project and regenerate.*');
  doc.push('');

  return doc.join('\n');
}

/**
 * Generates documentation for a single asset
 */
function generateAssetDocumentation(
  asset: ProcessAsset,
  projectData: ProjectData,
  options: DocumentationOptions
): string[] {
  const doc = [];
  
  // Asset header
  doc.push(`### ${asset.name}`);
  doc.push('');
  doc.push(`**ID**: \`${asset.id}\` | **Type**: ${asset.type}`);
  doc.push('');
  doc.push(asset.description);
  doc.push('');

  // Content/Template
  doc.push('#### 📝 Template');
  doc.push('');
  doc.push('```');
  doc.push(asset.content);
  doc.push('```');
  doc.push('');

  // Usage statistics
  if (options.includeUsageStats) {
    const usage = projectData.assetUsage?.[asset.id];
    if (usage) {
      doc.push('#### 📈 Usage Statistics');
      doc.push('');
      doc.push(`- **Times Used**: ${usage.usageCount}`);
      doc.push(`- **Last Used**: ${new Date(usage.lastUsed).toLocaleDateString()}`);
      
      if (usage.generatedItems.length > 0) {
        doc.push(`- **Generated Items**: ${usage.generatedItems.length}`);
        const itemsByType = usage.generatedItems.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        for (const [type, count] of Object.entries(itemsByType)) {
          doc.push(`  - ${type}s: ${count}`);
        }
      }
      doc.push('');
    }
  }

  // Links to project artifacts
  if (options.includeLinks) {
    const links = projectData.assetLinks?.[asset.id];
    if (links && (links.requirements.length > 0 || links.risks.length > 0 || links.cis.length > 0)) {
      doc.push('#### 🔗 Linked Artifacts');
      doc.push('');
      
      if (links.requirements.length > 0) {
        doc.push('**Requirements:**');
        for (const reqId of links.requirements) {
          const req = projectData.requirements.find(r => r.id === reqId);
          if (req) {
            doc.push(`- \`${req.id}\`: ${req.description.substring(0, 100)}${req.description.length > 100 ? '...' : ''}`);
          }
        }
        doc.push('');
      }
      
      if (links.risks.length > 0) {
        doc.push('**Risks:**');
        for (const riskId of links.risks) {
          const risk = projectData.risks.find(r => r.id === riskId);
          if (risk) {
            doc.push(`- \`${risk.id}\`: ${risk.description.substring(0, 100)}${risk.description.length > 100 ? '...' : ''}`);
          }
        }
        doc.push('');
      }
      
      if (links.cis.length > 0) {
        doc.push('**Configuration Items:**');
        for (const ciId of links.cis) {
          const ci = projectData.configurationItems.find(c => c.id === ciId);
          if (ci) {
            doc.push(`- \`${ci.id}\`: ${ci.name}`);
          }
        }
        doc.push('');
      }
    }
  }

  // Metadata
  doc.push('#### ℹ️ Metadata');
  doc.push('');
  doc.push(`- **Created**: ${new Date(asset.createdAt).toLocaleDateString()} by ${asset.createdBy}`);
  doc.push(`- **Updated**: ${new Date(asset.updatedAt).toLocaleDateString()} by ${asset.updatedBy}`);
  if (asset.tags && asset.tags.length > 0) {
    doc.push(`- **Tags**: ${asset.tags.map(tag => `\`${tag}\``).join(', ')}`);
  }
  doc.push('');
  doc.push('---');
  doc.push('');

  return doc;
}

/**
 * Generates asset statistics for the overview section
 */
function generateAssetStatistics(assets: ProcessAsset[], projectData: ProjectData) {
  const stats = {
    totalAssets: assets.length,
    requirementArchetypes: assets.filter(a => a.type === 'Requirement Archetype').length,
    solutionBlueprints: assets.filter(a => a.type === 'Solution Blueprint').length,
    riskPlaybooks: assets.filter(a => a.type === 'Risk Playbook').length,
    testStrategies: assets.filter(a => a.type === 'Test Strategy').length,
    totalUsage: 0
  };

  // Calculate total usage
  for (const asset of assets) {
    const usage = projectData.assetUsage?.[asset.id];
    if (usage) {
      stats.totalUsage += usage.usageCount;
    }
  }

  return stats;
}

/**
 * Gets a description for each asset type
 */
function getTypeDescription(type: ProcessAsset['type']): string {
  switch (type) {
    case 'Requirement Archetype':
      return 'Reusable requirement templates that capture common patterns and best practices for defining system requirements.';
    case 'Solution Blueprint':
      return 'Architectural and design patterns that provide proven solutions to recurring technical challenges.';
    case 'Risk Playbook':
      return 'Risk management templates that help identify, assess, and mitigate common project risks.';
    case 'Test Strategy':
      return 'Testing methodologies and templates that ensure comprehensive quality assurance coverage.';
    default:
      return 'Process assets that provide reusable templates and guidance for project activities.';
  }
}

/**
 * Saves the generated documentation to the repository
 */
export async function saveDocumentationToRepo(
  documentation: string,
  githubSettings: { repoUrl: string; pat: string },
  filePath: string = 'PROCESS_ASSETS.md'
): Promise<void> {
  await saveFileToRepo(
    githubSettings,
    filePath,
    documentation,
    'Auto-generate process assets documentation'
  );
}
