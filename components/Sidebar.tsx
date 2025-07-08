

import { Download, GitCommit, GitPullRequest, Upload, Zap } from 'lucide-react';
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onImportProject: () => void;
  onExportProject: () => void;
  onLoadFromGithub: () => void;
  onSaveToGithub: () => void;
  githubSettingsConfigured: boolean;
  projectName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    activePage, 
    setActivePage, 
    onImportProject, 
    onExportProject,
    onLoadFromGithub,
    onSaveToGithub,
    githubSettingsConfigured,
    projectName 
}) => {
  const orderedNavItems: Page[] = [
    'Dashboard', 'Documents', 'Requirements', 'Test Cases', 'Configuration',
    'Architecture', 'Process Assets', 'Pull Requests', 'Issues', 'Risks', 'CMMI', 'Quality Assurance', 'Compliance', 'Security', 'AI Assessment', 'Badges', 'Audit Log', 'Settings'
  ];

  const sortedNavItems = NAV_ITEMS.filter(item => orderedNavItems.includes(item.name)).sort((a, b) => {
      return orderedNavItems.indexOf(a.name) - orderedNavItems.indexOf(b.name);
  });


  return (
    <div className="w-64 bg-gray-900 flex flex-col border-r border-gray-700">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <Zap className="text-brand-primary" size={28} />
        <h1 className="text-2xl font-bold ml-2">Ignition</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sortedNavItems.map((item) => (
          <a
            key={item.name}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.name);
            }}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activePage === item.name
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="ml-4">{item.name}</span>
          </a>
        ))}
      </nav>

      <div className="px-4 pb-4 space-y-2">
         <button
            onClick={onLoadFromGithub}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            aria-label="Load project from GitHub"
            disabled={!githubSettingsConfigured}
            title={!githubSettingsConfigured ? "Configure GitHub settings first" : "Load project from GitHub"}
        >
            <GitPullRequest size={16} className="mr-3 flex-shrink-0"/>
            <span>Load from GitHub</span>
        </button>
        <button
            onClick={onSaveToGithub}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            aria-label="Save project to GitHub"
            disabled={!githubSettingsConfigured}
            title={!githubSettingsConfigured ? "Configure GitHub settings first" : "Save project to GitHub"}
        >
            <GitCommit size={16} className="mr-3 flex-shrink-0"/>
            <span>Save to GitHub</span>
        </button>
        <hr className="border-gray-700 my-2" />
        <button
            onClick={onImportProject}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Import Project from JSON file"
        >
            <Upload size={16} className="mr-3 flex-shrink-0"/>
            <span>Import from File</span>
        </button>
        <button
            onClick={onExportProject}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Export Project to JSON file"
        >
            <Download size={16} className="mr-3 flex-shrink-0"/>
            <span>Export to File</span>
        </button>
      </div>

      <div className="px-4 py-6 border-t border-gray-700">
        <div className="flex items-center p-3 bg-gray-800 rounded-lg">
           <GitCommit className="text-brand-secondary" size={20} />
           <div className="ml-3 overflow-hidden">
             <p className="text-sm font-semibold text-white truncate" title={projectName}>{projectName}</p>
             <p className="text-xs text-gray-400">main</p>
           </div>
        </div>
        <div className="mt-4 text-xs text-center text-gray-600">
          <p>Powered by Castle Bravo</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;