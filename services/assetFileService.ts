/**
 * Asset File Service - Hybrid Wiki/Structured Data Implementation
 * 
 * This service manages the storage of process assets as individual structured files
 * in the .ignition/assets/ directory and generates human-readable documentation.
 */

import { ProcessAsset, ProjectData } from '../types';
import { saveFileToRepo, getFileContent } from './githubService';

export interface AssetFileStructure {
  metadata: {
    id: string;
    type: ProcessAsset['type'];
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    tags?: string[];
    version: string;
  };
  content: {
    template: string;
    variables?: Record<string, any>;
    examples?: string[];
    relatedAssets?: string[];
  };
  usage: {
    usageCount: number;
    lastUsed: string;
    generatedItems: Array<{
      type: 'requirement' | 'risk' | 'test' | 'ci';
      id: string;
      createdAt: string;
    }>;
  };
  links: {
    requirements: string[];
    risks: string[];
    cis: string[];
  };
}

/**
 * Converts a ProcessAsset to the structured file format
 */
export function assetToFileStructure(
  asset: ProcessAsset, 
  projectData: ProjectData
): AssetFileStructure {
  const assetLinks = projectData.assetLinks?.[asset.id] || { requirements: [], risks: [], cis: [] };
  const assetUsage = projectData.assetUsage?.[asset.id] || { 
    usageCount: 0, 
    lastUsed: asset.updatedAt, 
    generatedItems: [] 
  };

  return {
    metadata: {
      id: asset.id,
      type: asset.type,
      name: asset.name,
      description: asset.description,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      createdBy: asset.createdBy,
      updatedBy: asset.updatedBy,
      tags: asset.tags,
      version: '1.0.0'
    },
    content: {
      template: asset.content,
      variables: {},
      examples: [],
      relatedAssets: []
    },
    usage: assetUsage,
    links: assetLinks
  };
}

/**
 * Converts structured file format back to ProcessAsset
 */
export function fileStructureToAsset(structure: AssetFileStructure): ProcessAsset {
  return {
    id: structure.metadata.id,
    type: structure.metadata.type,
    name: structure.metadata.name,
    description: structure.metadata.description,
    content: structure.content.template,
    tags: structure.metadata.tags,
    createdAt: structure.metadata.createdAt,
    updatedAt: structure.metadata.updatedAt,
    createdBy: structure.metadata.createdBy,
    updatedBy: structure.metadata.updatedBy
  };
}

/**
 * Gets the file path for an asset based on its type and ID
 */
export function getAssetFilePath(asset: ProcessAsset): string {
  const typeFolder = asset.type.toLowerCase().replace(/\s+/g, '_');
  return `.ignition/assets/${typeFolder}/${asset.id}.json`;
}

/**
 * Gets the directory path for a specific asset type
 */
export function getAssetTypeDirectory(assetType: ProcessAsset['type']): string {
  const typeFolder = assetType.toLowerCase().replace(/\s+/g, '_');
  return `.ignition/assets/${typeFolder}`;
}

/**
 * Saves a process asset as a structured file to the repository
 */
export async function saveAssetToFile(
  asset: ProcessAsset,
  projectData: ProjectData,
  githubSettings: { repoUrl: string; pat: string }
): Promise<void> {
  const structure = assetToFileStructure(asset, projectData);
  const filePath = getAssetFilePath(asset);
  const content = JSON.stringify(structure, null, 2);

  await saveFileToRepo(
    githubSettings,
    filePath,
    content,
    `Add/Update process asset: ${asset.name} (${asset.id})`
  );
}

/**
 * Loads a process asset from its structured file
 */
export async function loadAssetFromFile(
  assetId: string,
  assetType: ProcessAsset['type'],
  githubSettings: { repoUrl: string; pat: string }
): Promise<{ asset: ProcessAsset; structure: AssetFileStructure } | null> {
  try {
    const filePath = `.ignition/assets/${assetType.toLowerCase().replace(/\s+/g, '_')}/${assetId}.json`;
    const content = await getFileContent(githubSettings, filePath);
    const structure: AssetFileStructure = JSON.parse(content);
    const asset = fileStructureToAsset(structure);
    
    return { asset, structure };
  } catch (error) {
    console.error(`Failed to load asset ${assetId}:`, error);
    return null;
  }
}

/**
 * Generates the directory structure for all asset types
 */
export function generateAssetDirectoryStructure(): string[] {
  const assetTypes: ProcessAsset['type'][] = [
    'Requirement Archetype',
    'Solution Blueprint', 
    'Risk Playbook',
    'Test Strategy'
  ];

  return assetTypes.map(type => getAssetTypeDirectory(type));
}

/**
 * Creates the initial .ignition/assets/ directory structure
 */
export async function initializeAssetDirectories(
  githubSettings: { repoUrl: string; pat: string }
): Promise<void> {
  const directories = generateAssetDirectoryStructure();
  
  // Create README files for each directory
  for (const dir of directories) {
    const readmePath = `${dir}/README.md`;
    const assetType = dir.split('/').pop()?.replace(/_/g, ' ') || '';
    const readmeContent = `# ${assetType.charAt(0).toUpperCase() + assetType.slice(1)}

This directory contains ${assetType} process assets in structured JSON format.

## File Structure

Each asset file follows this structure:
- \`metadata\`: Asset information and versioning
- \`content\`: Template content and variables  
- \`usage\`: Usage tracking and analytics
- \`links\`: Connections to project artifacts

## Auto-Generated

This directory and its contents are automatically managed by the Ignition Process Asset Framework.
`;

    try {
      await saveFileToRepo(
        githubSettings,
        readmePath,
        readmeContent,
        `Initialize ${assetType} directory`
      );
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
    }
  }
}
