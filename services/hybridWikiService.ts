/**
 * Hybrid Wiki Service - Orchestrates the hybrid wiki/structured data system
 * 
 * This service manages the complete lifecycle of process assets as both
 * machine-readable structured files and human-readable documentation.
 */

import { ProcessAsset, ProjectData, GitHubSettings } from '../types';
import { 
  saveAssetToFile, 
  loadAssetFromFile, 
  initializeAssetDirectories,
  AssetFileStructure 
} from './assetFileService';
import { 
  generateProcessAssetsDocumentation, 
  saveDocumentationToRepo,
  DocumentationOptions 
} from './assetDocumentationService';
import { saveFileToRepo, getFileContent } from './githubService';

export interface HybridWikiConfig {
  enableStructuredFiles: boolean;
  enableDocumentationGeneration: boolean;
  enableGitHubWiki: boolean;
  documentationOptions: DocumentationOptions;
  autoGenerateOnSave: boolean;
  structuredFilesPath: string;
  documentationPath: string;
}

export const DEFAULT_HYBRID_WIKI_CONFIG: HybridWikiConfig = {
  enableStructuredFiles: true,
  enableDocumentationGeneration: true,
  enableGitHubWiki: false,
  documentationOptions: {
    includeUsageStats: true,
    includeLinks: true,
    includeExamples: true,
    groupByType: true,
    generateTOC: true
  },
  autoGenerateOnSave: true,
  structuredFilesPath: '.ignition/assets',
  documentationPath: 'PROCESS_ASSETS.md'
};

/**
 * Initializes the hybrid wiki system in a repository
 */
export async function initializeHybridWiki(
  githubSettings: GitHubSettings,
  config: HybridWikiConfig = DEFAULT_HYBRID_WIKI_CONFIG
): Promise<void> {
  console.log('🚀 Initializing Hybrid Wiki System...');

  try {
    // Create directory structure
    if (config.enableStructuredFiles) {
      console.log('📁 Creating asset directory structure...');
      await initializeAssetDirectories(githubSettings);
    }

    // Create main documentation file
    if (config.enableDocumentationGeneration) {
      console.log('📝 Creating initial documentation...');
      const initialDoc = await generateProcessAssetsDocumentation([], {
        projectName: 'Project',
        documents: {},
        requirements: [],
        testCases: [],
        configurationItems: [],
        processAssets: [],
        risks: [],
        links: {},
        riskCiLinks: {},
        issueCiLinks: {},
        issueRiskLinks: {},
        assetLinks: {},
        assetUsage: {},
        auditLog: []
      }, config.documentationOptions);

      await saveDocumentationToRepo(initialDoc, githubSettings, config.documentationPath);
    }

    // Create configuration file
    const configContent = JSON.stringify(config, null, 2);
    await saveFileToRepo(
      githubSettings,
      '.ignition/hybrid-wiki-config.json',
      configContent,
      'Initialize hybrid wiki configuration'
    );

    console.log('✅ Hybrid Wiki System initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Hybrid Wiki System:', error);
    throw error;
  }
}

/**
 * Saves a process asset using the hybrid wiki system
 */
export async function saveAssetHybrid(
  asset: ProcessAsset,
  projectData: ProjectData,
  githubSettings: GitHubSettings,
  config: HybridWikiConfig = DEFAULT_HYBRID_WIKI_CONFIG
): Promise<void> {
  console.log(`💾 Saving asset ${asset.id} using hybrid wiki system...`);

  try {
    // Save as structured file
    if (config.enableStructuredFiles) {
      await saveAssetToFile(asset, projectData, githubSettings);
      console.log(`📄 Saved structured file for ${asset.id}`);
    }

    // Regenerate documentation if auto-generation is enabled
    if (config.autoGenerateOnSave && config.enableDocumentationGeneration) {
      await regenerateDocumentation(projectData, githubSettings, config);
    }

    console.log(`✅ Asset ${asset.id} saved successfully!`);
  } catch (error) {
    console.error(`❌ Failed to save asset ${asset.id}:`, error);
    throw error;
  }
}

/**
 * Loads all assets from structured files
 */
export async function loadAllAssetsFromFiles(
  githubSettings: GitHubSettings,
  config: HybridWikiConfig = DEFAULT_HYBRID_WIKI_CONFIG
): Promise<{ assets: ProcessAsset[]; structures: AssetFileStructure[] }> {
  console.log('📖 Loading assets from structured files...');

  const assets: ProcessAsset[] = [];
  const structures: AssetFileStructure[] = [];
  const assetTypes: ProcessAsset['type'][] = [
    'Requirement Archetype',
    'Solution Blueprint',
    'Risk Playbook',
    'Test Strategy'
  ];

  try {
    for (const assetType of assetTypes) {
      // This is a simplified approach - in a real implementation,
      // you'd want to list directory contents first
      // For now, we'll rely on the main project data to know which assets exist
    }

    console.log(`✅ Loaded ${assets.length} assets from structured files`);
    return { assets, structures };
  } catch (error) {
    console.error('❌ Failed to load assets from files:', error);
    return { assets: [], structures: [] };
  }
}

/**
 * Regenerates the complete documentation from current project data
 */
export async function regenerateDocumentation(
  projectData: ProjectData,
  githubSettings: GitHubSettings,
  config: HybridWikiConfig = DEFAULT_HYBRID_WIKI_CONFIG
): Promise<void> {
  console.log('📚 Regenerating process assets documentation...');

  try {
    const documentation = await generateProcessAssetsDocumentation(
      projectData.processAssets || [],
      projectData,
      config.documentationOptions
    );

    await saveDocumentationToRepo(
      documentation,
      githubSettings,
      config.documentationPath
    );

    console.log('✅ Documentation regenerated successfully!');
  } catch (error) {
    console.error('❌ Failed to regenerate documentation:', error);
    throw error;
  }
}

/**
 * Syncs assets between the main project data and structured files
 */
export async function syncAssetsWithFiles(
  projectData: ProjectData,
  githubSettings: GitHubSettings,
  config: HybridWikiConfig = DEFAULT_HYBRID_WIKI_CONFIG
): Promise<ProjectData> {
  console.log('🔄 Syncing assets with structured files...');

  try {
    // Save all current assets as structured files
    if (config.enableStructuredFiles) {
      for (const asset of projectData.processAssets || []) {
        await saveAssetToFile(asset, projectData, githubSettings);
      }
    }

    // Regenerate documentation
    if (config.enableDocumentationGeneration) {
      await regenerateDocumentation(projectData, githubSettings, config);
    }

    console.log('✅ Assets synced successfully!');
    return projectData;
  } catch (error) {
    console.error('❌ Failed to sync assets:', error);
    throw error;
  }
}

/**
 * Gets the current hybrid wiki configuration
 */
export async function getHybridWikiConfig(
  githubSettings: GitHubSettings
): Promise<HybridWikiConfig> {
  try {
    const configContent = await getFileContent(githubSettings, '.ignition/hybrid-wiki-config.json');
    return JSON.parse(configContent);
  } catch (error) {
    console.log('Using default hybrid wiki configuration');
    return DEFAULT_HYBRID_WIKI_CONFIG;
  }
}

/**
 * Updates the hybrid wiki configuration
 */
export async function updateHybridWikiConfig(
  config: HybridWikiConfig,
  githubSettings: GitHubSettings
): Promise<void> {
  const configContent = JSON.stringify(config, null, 2);
  await saveFileToRepo(
    githubSettings,
    '.ignition/hybrid-wiki-config.json',
    configContent,
    'Update hybrid wiki configuration'
  );
}

/**
 * Generates a comprehensive asset analytics report
 */
export async function generateAssetAnalyticsReport(
  projectData: ProjectData,
  githubSettings: GitHubSettings
): Promise<string> {
  const assets = projectData.processAssets || [];
  const report = [];

  report.push('# Process Asset Analytics Report');
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');

  // Usage analytics
  report.push('## 📊 Usage Analytics');
  report.push('');

  const usageData = assets.map(asset => {
    const usage = projectData.assetUsage?.[asset.id] || { usageCount: 0, lastUsed: asset.updatedAt, generatedItems: [] };
    return {
      asset,
      usage: usage.usageCount,
      lastUsed: new Date(usage.lastUsed),
      generatedItems: usage.generatedItems.length
    };
  }).sort((a, b) => b.usage - a.usage);

  report.push('### Most Used Assets');
  report.push('');
  report.push('| Asset | Type | Usage Count | Generated Items | Last Used |');
  report.push('|-------|------|-------------|-----------------|-----------|');

  for (const item of usageData.slice(0, 10)) {
    report.push(`| ${item.asset.name} | ${item.asset.type} | ${item.usage} | ${item.generatedItems} | ${item.lastUsed.toLocaleDateString()} |`);
  }

  report.push('');

  // Type distribution
  const typeStats = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  report.push('### Asset Type Distribution');
  report.push('');
  for (const [type, count] of Object.entries(typeStats)) {
    report.push(`- **${type}**: ${count} assets`);
  }

  return report.join('\n');
}
