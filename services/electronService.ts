/**
 * Electron Service - Desktop-specific functionality
 * 
 * Provides file system operations, native dialogs, and desktop integration
 * for the Electron version of Ignition.
 */

import { ProjectData } from '../types';

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI?: {
      saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      loadFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths?: string[] }>;
      onMenuNewProject: (callback: () => void) => void;
      onMenuOpenProject: (callback: (event: any, filePath: string) => void) => void;
      onMenuSaveProject: (callback: () => void) => void;
      onMenuExportDocs: (callback: () => void) => void;
      onMenuInitWiki: (callback: () => void) => void;
      onMenuGenerateDocs: (callback: () => void) => void;
      onMenuComplianceCheck: (callback: () => void) => void;
      onMenuSettings: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      isElectron: boolean;
    };
    nodeAPI?: {
      path: {
        join: (...args: string[]) => string;
        dirname: (path: string) => string;
        basename: (path: string) => string;
        extname: (path: string) => string;
      };
    };
  }
}

export class ElectronService {
  private static instance: ElectronService;
  
  public static getInstance(): ElectronService {
    if (!ElectronService.instance) {
      ElectronService.instance = new ElectronService();
    }
    return ElectronService.instance;
  }

  /**
   * Check if running in Electron environment
   */
  public isElectron(): boolean {
    return !!(window.electronAPI?.isElectron);
  }

  /**
   * Get platform information
   */
  public getPlatform(): string {
    return window.electronAPI?.platform || 'unknown';
  }

  /**
   * Save project data to file system
   */
  public async saveProjectToFile(projectData: ProjectData, filePath?: string): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('File system operations only available in Electron');
      return false;
    }

    try {
      let targetPath = filePath;
      
      if (!targetPath) {
        const result = await window.electronAPI!.showSaveDialog({
          title: 'Save Ignition Project',
          defaultPath: `${projectData.projectName}.ignition.json`,
          filters: [
            { name: 'Ignition Projects', extensions: ['ignition.json', 'json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (result.canceled || !result.filePath) {
          return false;
        }
        
        targetPath = result.filePath;
      }

      const content = JSON.stringify(projectData, null, 2);
      const saveResult = await window.electronAPI!.saveFile(targetPath, content);
      
      if (saveResult.success) {
        console.log('Project saved successfully to:', targetPath);
        return true;
      } else {
        console.error('Failed to save project:', saveResult.error);
        return false;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    }
  }

  /**
   * Load project data from file system
   */
  public async loadProjectFromFile(filePath?: string): Promise<ProjectData | null> {
    if (!this.isElectron()) {
      console.warn('File system operations only available in Electron');
      return null;
    }

    try {
      let targetPath = filePath;
      
      if (!targetPath) {
        const result = await window.electronAPI!.showOpenDialog({
          title: 'Open Ignition Project',
          filters: [
            { name: 'Ignition Projects', extensions: ['ignition.json', 'json'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
          return null;
        }
        
        targetPath = result.filePaths[0];
      }

      const loadResult = await window.electronAPI!.loadFile(targetPath);
      
      if (loadResult.success && loadResult.content) {
        const projectData = JSON.parse(loadResult.content) as ProjectData;
        console.log('Project loaded successfully from:', targetPath);
        return projectData;
      } else {
        console.error('Failed to load project:', loadResult.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  /**
   * Export documentation to file system
   */
  public async exportDocumentation(content: string, fileName: string = 'documentation.md'): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('File system operations only available in Electron');
      return false;
    }

    try {
      const result = await window.electronAPI!.showSaveDialog({
        title: 'Export Documentation',
        defaultPath: fileName,
        filters: [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return false;
      }

      const saveResult = await window.electronAPI!.saveFile(result.filePath, content);
      
      if (saveResult.success) {
        console.log('Documentation exported successfully to:', result.filePath);
        return true;
      } else {
        console.error('Failed to export documentation:', saveResult.error);
        return false;
      }
    } catch (error) {
      console.error('Error exporting documentation:', error);
      return false;
    }
  }

  /**
   * Set up menu event listeners
   */
  public setupMenuListeners(callbacks: {
    onNewProject?: () => void;
    onOpenProject?: (filePath: string) => void;
    onSaveProject?: () => void;
    onExportDocs?: () => void;
    onInitWiki?: () => void;
    onGenerateDocs?: () => void;
    onComplianceCheck?: () => void;
    onSettings?: () => void;
  }): void {
    if (!this.isElectron()) {
      return;
    }

    const { electronAPI } = window;
    if (!electronAPI) return;

    // Clean up existing listeners
    electronAPI.removeAllListeners('menu-new-project');
    electronAPI.removeAllListeners('menu-open-project');
    electronAPI.removeAllListeners('menu-save-project');
    electronAPI.removeAllListeners('menu-export-docs');
    electronAPI.removeAllListeners('menu-init-wiki');
    electronAPI.removeAllListeners('menu-generate-docs');
    electronAPI.removeAllListeners('menu-compliance-check');
    electronAPI.removeAllListeners('menu-settings');

    // Set up new listeners
    if (callbacks.onNewProject) {
      electronAPI.onMenuNewProject(callbacks.onNewProject);
    }
    
    if (callbacks.onOpenProject) {
      electronAPI.onMenuOpenProject((event: any, filePath: string) => {
        callbacks.onOpenProject!(filePath);
      });
    }
    
    if (callbacks.onSaveProject) {
      electronAPI.onMenuSaveProject(callbacks.onSaveProject);
    }
    
    if (callbacks.onExportDocs) {
      electronAPI.onMenuExportDocs(callbacks.onExportDocs);
    }
    
    if (callbacks.onInitWiki) {
      electronAPI.onMenuInitWiki(callbacks.onInitWiki);
    }
    
    if (callbacks.onGenerateDocs) {
      electronAPI.onMenuGenerateDocs(callbacks.onGenerateDocs);
    }
    
    if (callbacks.onComplianceCheck) {
      electronAPI.onMenuComplianceCheck(callbacks.onComplianceCheck);
    }
    
    if (callbacks.onSettings) {
      electronAPI.onMenuSettings(callbacks.onSettings);
    }
  }

  /**
   * Get user data directory path
   */
  public getUserDataPath(): string {
    if (!this.isElectron() || !window.nodeAPI) {
      return '';
    }

    // This would typically be provided by the main process
    // For now, return a placeholder
    return 'userData';
  }

  /**
   * Check if file system persistence is available
   */
  public hasFileSystemAccess(): boolean {
    return this.isElectron();
  }
}

// Export singleton instance
export const electronService = ElectronService.getInstance();
