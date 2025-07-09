import { AlertCircle, Edit, Github, Loader, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { GitHubIssue, ProjectData } from '../types';
import IssueModal from './IssueModal';

interface IssuesPageProps {
  projectData: ProjectData;
  githubIssues: GitHubIssue[];
  isFetchingIssues: boolean;
  onFetchIssues: () => void;
  githubSettingsConfigured: boolean;
  onUpdateIssueLinks: (issueNumber: number, linkedReqIds: string[], linkedCiIds: string[], linkedRiskIds: string[]) => void;
}

const IssuesPage: React.FC<IssuesPageProps> = ({
  projectData,
  githubIssues,
  isFetchingIssues,
  onFetchIssues,
  githubSettingsConfigured,
  onUpdateIssueLinks
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);

  useEffect(() => {
    if (githubSettingsConfigured) {
      onFetchIssues();
    }
  }, [githubSettingsConfigured]); // Removed onFetchIssues from deps to prevent infinite loop

  const handleEditLinks = (issue: GitHubIssue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleSaveLinks = useCallback((issueNumber: number, reqIds: string[], ciIds: string[], riskIds: string[]) => {
    onUpdateIssueLinks(issueNumber, reqIds, ciIds, riskIds);
    setIsModalOpen(false);
  }, [onUpdateIssueLinks]);
  
  const getLinkedItemCounts = (issueNumber: number) => {
    const reqs = Object.values(projectData.links).filter(l => l.issues?.includes(issueNumber)).length;
    const cis = projectData.issueCiLinks?.[issueNumber]?.length || 0;
    const risks = projectData.issueRiskLinks?.[issueNumber]?.length || 0;
    return { reqs, cis, risks };
  };

  const renderContent = () => {
    if (!githubSettingsConfigured) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-gray-900 border border-dashed border-gray-700 rounded-lg p-12 min-h-[400px]">
          <Github size={48} className="text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">GitHub Not Configured</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Please go to the 'Settings' page to connect to a GitHub repository.</p>
        </div>
      );
    }

    if (isFetchingIssues) {
      return (
        <div className="flex items-center justify-center text-center p-12">
          <Loader size={32} className="animate-spin text-brand-primary" />
          <p className="ml-4 text-gray-400">Fetching GitHub Issues...</p>
        </div>
      );
    }

    if (githubIssues.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-gray-900 border border-dashed border-gray-700 rounded-lg p-12 min-h-[400px]">
          <AlertCircle size={48} className="text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">No Open Issues Found</h2>
          <p className="text-gray-500 mt-2">There are currently no open issues in the connected repository.</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3">Issue</th>
                <th scope="col" className="px-6 py-3 text-center">Linked Reqs</th>
                <th scope="col" className="px-6 py-3 text-center">Linked CIs</th>
                <th scope="col" className="px-6 py-3 text-center">Linked Risks</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {githubIssues.map((issue) => {
                const counts = getLinkedItemCounts(issue.number);
                return (
                  <tr key={issue.number} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-brand-primary transition-colors">
                        #{issue.number}: {issue.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-white">{counts.reqs}</td>
                    <td className="px-6 py-4 text-center font-mono text-white">{counts.cis}</td>
                    <td className="px-6 py-4 text-center font-mono text-white">{counts.risks}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditLinks(issue)}
                        className="flex items-center gap-1.5 mx-auto text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Edit size={14} />
                        Edit Links
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <AlertCircle /> Issue Traceability
          </h1>
          <p className="text-gray-400 mt-1">Link GitHub issues to your project artifacts for end-to-end traceability.</p>
        </div>
        <button
          onClick={onFetchIssues}
          disabled={isFetchingIssues || !githubSettingsConfigured}
          className="flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetchingIssues ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
      {renderContent()}
      {isModalOpen && selectedIssue && (
        <IssueModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLinks}
          projectData={projectData}
          issue={selectedIssue}
        />
      )}
    </div>
  );
};

export default IssuesPage;
