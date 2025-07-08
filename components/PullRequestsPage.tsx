import React, { useEffect, useState } from 'react';
import { PullRequest, PrAnalysisResult } from '../types';
import { GitPullRequestArrow, Github, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import PrAnalysisView from './PrAnalysisView';

interface PullRequestsPageProps {
  pullRequests: PullRequest[];
  isFetchingPrs: boolean;
  onFetchPullRequests: () => void;
  githubSettingsConfigured: boolean;
  onAnalyzePullRequest: (pr: PullRequest) => void;
  analysisResults: Record<number, PrAnalysisResult>;
  isAnalyzingPr: number | null;
  onPostComment: (prNumber: number, commentBody: string) => Promise<void>;
}

const PullRequestsPage: React.FC<PullRequestsPageProps> = ({
  pullRequests,
  isFetchingPrs,
  onFetchPullRequests,
  githubSettingsConfigured,
  onAnalyzePullRequest,
  analysisResults,
  isAnalyzingPr,
  onPostComment
}) => {
  const [selectedPrNumber, setSelectedPrNumber] = useState<number | null>(null);

  useEffect(() => {
    if (githubSettingsConfigured) {
      onFetchPullRequests();
    }
  }, [githubSettingsConfigured, onFetchPullRequests]);
  
  const handleTogglePr = (prNumber: number) => {
    setSelectedPrNumber(current => current === prNumber ? null : prNumber);
  };

  const timeSince = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  const renderContent = () => {
    if (!githubSettingsConfigured) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-gray-900 border border-dashed border-gray-700 rounded-lg p-12 min-h-[400px]">
          <Github size={48} className="text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">GitHub Not Configured</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Please go to the 'Settings' page to configure your GitHub repository URL and Personal Access Token (PAT) to use this feature.</p>
        </div>
      );
    }
    if (isFetchingPrs) {
        return (
            <div className="flex items-center justify-center text-center p-12">
                <Loader size={32} className="animate-spin text-brand-primary" />
                <p className="ml-4 text-gray-400">Fetching Pull Requests...</p>
            </div>
        )
    }
    if (pullRequests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center bg-gray-900 border border-dashed border-gray-700 rounded-lg p-12 min-h-[400px]">
                <GitPullRequestArrow size={48} className="text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white">No Open Pull Requests</h2>
                <p className="text-gray-500 mt-2">There are currently no open pull requests in the connected repository.</p>
            </div>
        );
    }
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-800">
                {pullRequests.map(pr => (
                    <li key={pr.number}>
                        <div 
                            className="p-4 sm:p-6 cursor-pointer hover:bg-gray-800/50"
                            onClick={() => handleTogglePr(pr.number)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-grow min-w-0">
                                    <p className="text-base font-bold text-white truncate">{pr.title}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        #{pr.number} opened {timeSince(pr.createdAt)} by <span className="font-semibold text-gray-300">{pr.user.login}</span>
                                    </p>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent li onClick
                                            onAnalyzePullRequest(pr);
                                        }}
                                        disabled={isAnalyzingPr === pr.number}
                                        className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-600 disabled:cursor-wait"
                                     >
                                        {isAnalyzingPr === pr.number ? (
                                            <>
                                                <Loader size={16} className="animate-spin"/>
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            'Analyze PR'
                                        )}
                                     </button>
                                </div>
                            </div>
                        </div>
                        {selectedPrNumber === pr.number && (
                           <div className="bg-gray-950 p-4 sm:p-6 border-t border-brand-primary/20">
                                <PrAnalysisView 
                                    pr={pr}
                                    result={analysisResults[pr.number]}
                                    isLoading={isAnalyzingPr === pr.number}
                                    onPostComment={onPostComment}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitPullRequestArrow /> Pull Request Analysis
          </h1>
          <p className="text-gray-400 mt-1">Analyze open Pull Requests for traceability and impact against your project plan.</p>
        </div>
        <button
          onClick={onFetchPullRequests}
          disabled={isFetchingPrs || !githubSettingsConfigured}
          className="flex items-center gap-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetchingPrs ? 'animate-spin' : ''}/>
          <span>Refresh</span>
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default PullRequestsPage;
