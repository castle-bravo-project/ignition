

import { AlertTriangle, BookOpen, Database, FileText, GitBranch, Github, Loader, RefreshCw, Save, TestTube2 } from 'lucide-react';
import React, { useState } from 'react';
import { generateIssueTemplates } from '../services/geminiService';
import { saveFileToRepo } from '../services/githubService';
import { GitHubSettings, ProjectData } from '../types';
import ConfirmationModal from './common/ConfirmationModal';

interface SettingsPageProps {
  projectName: string;
  projectData: ProjectData;
  onUpdateProjectName: (newName: string) => void;
  onResetProjectData: () => void;
  githubSettings: GitHubSettings;
  onUpdateGithubSettings: (settings: GitHubSettings) => void;
  onScaffoldRepository: () => void;
  onGenerateTestWorkflow: () => Promise<void>;
  onLoadUIAssessment?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  projectName,
  projectData,
  onUpdateProjectName,
  onResetProjectData,
  githubSettings,
  onUpdateGithubSettings,
  onScaffoldRepository,
  onGenerateTestWorkflow,
  onLoadUIAssessment,
}) => {
  const [name, setName] = useState(projectName);
  const [repoUrl, setRepoUrl] = useState(githubSettings.repoUrl);
  const [pat, setPat] = useState(githubSettings.pat);
  const [filePath, setFilePath] = useState(githubSettings.filePath);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);

  // Hybrid Wiki state
  const [isInitializingWiki, setIsInitializingWiki] = useState(false);
  const [isRegeneratingDocs, setIsRegeneratingDocs] = useState(false);
  const [isSyncingAssets, setIsSyncingAssets] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const hasNameChanged = name.trim() !== projectName;
  const hasGithubSettingsChanged =
    repoUrl.trim() !== githubSettings.repoUrl ||
    pat.trim() !== githubSettings.pat ||
    filePath.trim() !== githubSettings.filePath;
  
  const githubSettingsConfigured = !!(githubSettings.repoUrl && githubSettings.pat);

  const handleSaveName = () => {
    if (hasNameChanged && name.trim()) {
      onUpdateProjectName(name.trim());
    }
  };

  const handleSaveGithubSettings = () => {
    if (hasGithubSettingsChanged) {
        onUpdateGithubSettings({ 
            repoUrl: repoUrl.trim(), 
            pat: pat.trim(), 
            filePath: filePath.trim() || 'ignition-project.json'
        });
    }
  };

  const handleResetConfirm = () => {
    onResetProjectData();
    setIsResetModalOpen(false);
  };
  
  const handleGenerateTemplates = async () => {
    if (!githubSettingsConfigured) {
        alert("Please configure and save your GitHub settings first.");
        return;
    }
    setIsTemplateLoading(true);
    try {
        const templates = await generateIssueTemplates(projectData);
        for (const [fileName, content] of Object.entries(templates)) {
            const path = `.github/ISSUE_TEMPLATE/${fileName}`;
            await saveFileToRepo(githubSettings, path, content, `feat: add ${fileName} issue template`);
        }
        alert("Successfully generated and saved issue templates to your repository's `.github/ISSUE_TEMPLATE` directory!");
    } catch(e: any) {
        console.error("Failed to generate or save issue templates:", e);
        let alertMessage = `Error: ${e.message}`;
        if (e.message.includes('403')) {
            alertMessage += `\n\nThis usually means your Personal Access Token (PAT) lacks the necessary 'repo' scope to write to the repository. Please verify your PAT permissions on GitHub.`;
        } else if (e.message.includes('404')) {
            alertMessage += `\n\nThe repository was not found. Please check if the Repository URL is correct.`;
        } else if (e.message.includes('422')) {
            alertMessage += `\n\nThis can happen if the '.github' folder does not exist. Please try creating it in your repository first.`;
        }
        alert(alertMessage);
    } finally {
        setIsTemplateLoading(false);
    }
  };

  const handleScaffoldClick = async () => {
    setIsScaffolding(true);
    // onScaffoldRepository already handles the global loading spinner
    await onScaffoldRepository();
    setIsScaffolding(false);
  };

  const handleGenerateWorkflowClick = async () => {
    setIsGeneratingWorkflow(true);
    await onGenerateTestWorkflow();
    setIsGeneratingWorkflow(false);
  };

  // Hybrid Wiki handlers
  const handleInitializeWiki = async () => {
    if (!githubSettingsConfigured) {
      alert('Please configure GitHub settings first.');
      return;
    }

    setIsInitializingWiki(true);
    try {
      // Import dynamically to avoid auto-formatter issues
      const { initializeHybridWiki, DEFAULT_HYBRID_WIKI_CONFIG } = await import('../services/hybridWikiService');
      await initializeHybridWiki(githubSettings, DEFAULT_HYBRID_WIKI_CONFIG);
      alert('🚀 Hybrid Wiki System initialized successfully!\n\nCheck your repository for:\n- .ignition/assets/ directory structure\n- PROCESS_ASSETS.md documentation\n- Configuration files');
    } catch (e: any) {
      console.error('Failed to initialize hybrid wiki:', e);
      alert(`Error initializing hybrid wiki: ${e.message}`);
    } finally {
      setIsInitializingWiki(false);
    }
  };

  const handleRegenerateDocs = async () => {
    if (!githubSettingsConfigured) {
      alert('Please configure GitHub settings first.');
      return;
    }

    setIsRegeneratingDocs(true);
    try {
      const { regenerateDocumentation, DEFAULT_HYBRID_WIKI_CONFIG } = await import('../services/hybridWikiService');
      await regenerateDocumentation(projectData, githubSettings, DEFAULT_HYBRID_WIKI_CONFIG);
      alert('📚 Documentation regenerated successfully!\n\nCheck PROCESS_ASSETS.md in your repository.');
    } catch (e: any) {
      console.error('Failed to regenerate documentation:', e);
      alert(`Error regenerating documentation: ${e.message}`);
    } finally {
      setIsRegeneratingDocs(false);
    }
  };

  const handleSyncAssets = async () => {
    if (!githubSettingsConfigured) {
      alert('Please configure GitHub settings first.');
      return;
    }

    setIsSyncingAssets(true);
    try {
      const { syncAssetsWithFiles, DEFAULT_HYBRID_WIKI_CONFIG } = await import('../services/hybridWikiService');
      await syncAssetsWithFiles(projectData, githubSettings, DEFAULT_HYBRID_WIKI_CONFIG);
      alert('🔄 Assets synced successfully!\n\nAll process assets have been saved as structured files and documentation updated.');
    } catch (e: any) {
      console.error('Failed to sync assets:', e);
      alert(`Error syncing assets: ${e.message}`);
    } finally {
      setIsSyncingAssets(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!githubSettingsConfigured) {
      alert('Please configure GitHub settings first.');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const { generateAssetAnalyticsReport } = await import('../services/hybridWikiService');
      const report = await generateAssetAnalyticsReport(projectData, githubSettings);

      // Save the report to the repository
      await saveFileToRepo(
        githubSettings,
        'ASSET_ANALYTICS_REPORT.md',
        report,
        'Generate process asset analytics report'
      );

      alert('📊 Analytics report generated successfully!\n\nCheck ASSET_ANALYTICS_REPORT.md in your repository.');
    } catch (e: any) {
      console.error('Failed to generate analytics report:', e);
      alert(`Error generating analytics report: ${e.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };


  return (
    <>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your project settings and data.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white">Project Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Update the general settings for this project.</p>
          </div>
          <div className="border-t border-gray-800 p-6 space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="projectName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  onClick={handleSaveName}
                  disabled={!hasNameChanged || !name.trim()}
                  className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-white">GitHub Integration</h2>
                <p className="text-sm text-gray-400 mt-1">Connect to a GitHub repository to save and load your project state.</p>
            </div>
            <div className="border-t border-gray-800 p-6 space-y-4">
                <div>
                    <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">Repository URL</label>
                    <input id="repoUrl" type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                </div>
                <div>
                    <label htmlFor="pat" className="block text-sm font-medium text-gray-300 mb-2">Personal Access Token (PAT)</label>
                    <input id="pat" type="password" value={pat} onChange={(e) => setPat(e.target.value)} placeholder="ghp_..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                    <p className="text-xs text-gray-500 mt-1">Requires 'repo' scope. Stored only in your browser's local storage.</p>
                </div>
                <div>
                    <label htmlFor="filePath" className="block text-sm font-medium text-gray-300 mb-2">Project File Path</label>
                    <input id="filePath" type="text" value={filePath} onChange={(e) => setFilePath(e.target.value)} placeholder="ignition-project.json" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveGithubSettings}
                        disabled={!hasGithubSettingsChanged}
                        className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <Save size={16} />
                        Save GitHub Settings
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-white">Repository Actions</h2>
                <p className="text-sm text-gray-400 mt-1">Automate repository setup and maintenance tasks.</p>
            </div>
            <div className="border-t border-gray-800 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div>
                        <h3 className="font-semibold text-white">AI-Powered Repository Scaffolder</h3>
                        <p className="text-sm text-gray-400 max-w-lg mt-1">Bootstrap your repository with essential files. The AI will generate a `.gitignore`, `README.md`, `CONTRIBUTING.md`, `PULL_REQUEST_TEMPLATE.md`, `package.json`, and a basic GitHub Actions CI workflow, then commit them to your repo.</p>
                    </div>
                    <button
                        onClick={handleScaffoldClick}
                        disabled={!githubSettingsConfigured || isTemplateLoading || isScaffolding || isGeneratingWorkflow}
                        className="flex-shrink-0 flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isScaffolding ? <Loader size={16} className="animate-spin" /> : <GitBranch size={16} />}
                        {isScaffolding ? 'Scaffolding...' : 'Scaffold Repository'}
                    </button>
                </div>
                <div className="border-t border-gray-700/50"></div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div>
                        <h3 className="font-semibold text-white">GitHub Issue Templates</h3>
                        <p className="text-sm text-gray-400 max-w-lg mt-1">Automatically generate and save context-aware issue templates (`bug_report.md`, `feature_request.md`) to your repository's `.github/ISSUE_TEMPLATE` directory.</p>
                    </div>
                    <button
                        onClick={handleGenerateTemplates}
                        disabled={!githubSettingsConfigured || isTemplateLoading || isScaffolding || isGeneratingWorkflow}
                        className="flex-shrink-0 flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isTemplateLoading ? <Loader size={16} className="animate-spin" /> : <Github size={16} />}
                        {isTemplateLoading ? 'Generating...' : 'Generate Templates'}
                    </button>
                 </div>
                 <div className="border-t border-gray-700/50"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div>
                        <h3 className="font-semibold text-white">Automated Testing Workflow</h3>
                        <p className="text-sm text-gray-400 max-w-lg mt-1">Generate a GitHub Actions workflow and a runner script to automatically execute your Gherkin test cases and update their status in this project file on every push.</p>
                    </div>
                    <button
                        onClick={handleGenerateWorkflowClick}
                        disabled={!githubSettingsConfigured || isTemplateLoading || isScaffolding || isGeneratingWorkflow}
                        className="flex-shrink-0 flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isGeneratingWorkflow ? <Loader size={16} className="animate-spin" /> : <TestTube2 size={16} />}
                        {isGeneratingWorkflow ? 'Generating...' : 'Generate Test Workflow'}
                    </button>
                 </div>
            </div>
        </div>

        {/* Hybrid Wiki System */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen size={20} />
              Hybrid Wiki System
            </h2>
            <p className="text-sm text-gray-400 mt-1">Advanced process asset management with structured files and auto-generated documentation.</p>
          </div>
          <div className="border-t border-gray-700 p-6 space-y-6">

            {/* Initialize Wiki */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Database size={16} />
                  Initialize Wiki System
                </h3>
                <p className="text-sm text-gray-400 max-w-lg mt-1">Set up the .ignition/assets/ directory structure and create initial documentation files in your repository.</p>
              </div>
              <button
                onClick={handleInitializeWiki}
                disabled={!githubSettingsConfigured || isInitializingWiki}
                className="flex-shrink-0 flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isInitializingWiki ? <Loader size={16} className="animate-spin" /> : <Database size={16} />}
                {isInitializingWiki ? 'Initializing...' : 'Initialize Wiki'}
              </button>
            </div>

            <div className="border-t border-gray-700/50"></div>

            {/* Regenerate Documentation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText size={16} />
                  Regenerate Documentation
                </h3>
                <p className="text-sm text-gray-400 max-w-lg mt-1">Update the PROCESS_ASSETS.md file with current asset information, usage statistics, and links.</p>
              </div>
              <button
                onClick={handleRegenerateDocs}
                disabled={!githubSettingsConfigured || isRegeneratingDocs}
                className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isRegeneratingDocs ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                {isRegeneratingDocs ? 'Regenerating...' : 'Regenerate Docs'}
              </button>
            </div>

            <div className="border-t border-gray-700/50"></div>

            {/* Sync Assets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <RefreshCw size={16} />
                  Sync Assets to Files
                </h3>
                <p className="text-sm text-gray-400 max-w-lg mt-1">Save all current process assets as individual structured JSON files and update documentation.</p>
              </div>
              <button
                onClick={handleSyncAssets}
                disabled={!githubSettingsConfigured || isSyncingAssets}
                className="flex-shrink-0 flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isSyncingAssets ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isSyncingAssets ? 'Syncing...' : 'Sync Assets'}
              </button>
            </div>

            <div className="border-t border-gray-700/50"></div>

            {/* Generate Analytics Report */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  📊 Analytics Report
                </h3>
                <p className="text-sm text-gray-400 max-w-lg mt-1">Generate a comprehensive analytics report showing asset usage patterns and organizational insights.</p>
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={!githubSettingsConfigured || isGeneratingReport}
                className="flex-shrink-0 flex items-center gap-2 bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isGeneratingReport ? <Loader size={16} className="animate-spin" /> : '📊'}
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {!githubSettingsConfigured && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <AlertTriangle size={16} className="inline mr-2" />
                  Configure GitHub settings above to enable Hybrid Wiki features.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Meta-Compliance Assessment */}
        <div className="bg-gray-900 border border-brand-primary/30 rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-brand-primary flex items-center gap-2">
              <TestTube2 /> Meta-Compliance Assessment
            </h2>
            <p className="text-sm text-gray-400 mt-1">Use Ignition to analyze its own development process.</p>
          </div>
          <div className="border-t border-brand-primary/30 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">GitHub App UI Impact Assessment</h3>
                <p className="text-sm text-gray-400 max-w-lg mt-1">
                  Load a comprehensive assessment of UI/UX impacts for GitHub App integration.
                  This demonstrates meta-compliance - using Ignition to manage its own development.
                </p>
              </div>
              {onLoadUIAssessment && (
                <button
                  onClick={onLoadUIAssessment}
                  className="flex-shrink-0 flex items-center gap-2 bg-brand-primary text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  <FileText size={16}/>
                  Load UI Assessment
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-red-700/50 rounded-lg">
           <div className="p-6">
            <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle /> Danger Zone
            </h2>
            <p className="text-sm text-gray-400 mt-1">These actions are destructive and cannot be undone.</p>
          </div>
           <div className="border-t border-red-700/50 p-6">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-white">Reset Project Data</h3>
                    <p className="text-sm text-gray-400 max-w-lg mt-1">This will permanently delete all your current project data (documents, requirements, etc.) and restore the initial sample project. It's recommended to export your project first.</p>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="flex-shrink-0 flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw size={16}/>
                  Reset Project Data
                </button>
             </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Project Data?"
        message="Are you sure you want to reset all project data? This action is irreversible and will restore the project to its initial state. Consider exporting your current data first."
        confirmButtonText="Yes, reset data"
      />
    </>
  );
};

export default SettingsPage;