import { Bot, Cog, Eye, GitCommit, History, RefreshCw, Search, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { getRecentCommits, processCommitsToAuditEntries } from '../services/githubService';
import { AuditLogEntry, GitHubSettings, ProjectData } from '../types';

const LogDetailModal: React.FC<{ log: AuditLogEntry; onClose: () => void; }> = ({ log, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-brand-primary">Log Event Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1"><X size={24} /></button>
        </header>
        <main className="p-6 overflow-y-auto bg-gray-950">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
        </main>
      </div>
    </div>
  );
};


const EVENT_TYPE_STYLES: { [key: string]: string } = {
  CREATE: 'bg-green-900/50 text-green-300 border-green-700',
  UPDATE: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  DELETE: 'bg-red-900/50 text-red-300 border-red-700',
  SYSTEM: 'bg-blue-900/50 text-blue-300 border-blue-700',
};

const ACTOR_ICONS: { [key: string]: React.ReactNode } = {
  User: <User size={16} />,
  AI: <Bot size={16} />,
  System: <Cog size={16} />,
};

interface AuditLogPageProps {
  projectData: ProjectData;
  githubSettings?: GitHubSettings;
  onAddAuditEntries?: (entries: AuditLogEntry[]) => void;
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({
  projectData,
  githubSettings,
  onAddAuditEntries
}) => {
  const [filter, setFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);

  const handleFetchCommits = async () => {
    if (!githubSettings?.repoUrl || !githubSettings?.pat || !onAddAuditEntries) {
      alert('GitHub settings not configured or audit entry handler not available');
      return;
    }

    setIsLoadingCommits(true);
    try {
      // Get commits from the last 7 days
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const commits = await getRecentCommits(githubSettings, since, 25);

      if (commits.length === 0) {
        alert('No recent commits found in the last 7 days');
        return;
      }

      // Convert commits to audit entries
      const repoName = githubSettings.repoUrl.split('/').slice(-2).join('/');
      const auditEntries = processCommitsToAuditEntries(commits, repoName);

      // Add to audit log
      onAddAuditEntries(auditEntries);

      alert(`Successfully added ${auditEntries.length} commit entries to audit log`);
    } catch (error: any) {
      console.error('Failed to fetch commits:', error);
      alert(`Failed to fetch commits: ${error.message}`);
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const logs = projectData.auditLog || [];
  const filteredLogs = logs.filter(log =>
    (log.summary || '').toLowerCase().includes(filter.toLowerCase()) ||
    (log.eventType || '').toLowerCase().includes(filter.toLowerCase()) ||
    (log.actor || '').toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventTypeStyle = (eventType: string) => {
    if(!eventType) return EVENT_TYPE_STYLES.SYSTEM;
    if(eventType.endsWith('_CREATE')) return EVENT_TYPE_STYLES.CREATE;
    if(eventType.endsWith('_UPDATE')) return EVENT_TYPE_STYLES.UPDATE;
    if(eventType.endsWith('_DELETE')) return EVENT_TYPE_STYLES.DELETE;
    return EVENT_TYPE_STYLES.SYSTEM;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><History /> Project Audit Log</h1>
        <p className="text-gray-400 mt-1">A chronological record of all significant events in the project.</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter logs by summary, event type, or actor..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-brand-primary focus:border-brand-primary"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>

        {githubSettings?.repoUrl && githubSettings?.pat && onAddAuditEntries && (
          <button
            onClick={handleFetchCommits}
            disabled={isLoadingCommits}
            className="bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            {isLoadingCommits ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <GitCommit size={16} />
            )}
            {isLoadingCommits ? 'Fetching...' : 'Fetch Commits'}
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 w-1/4">Timestamp</th>
                <th scope="col" className="px-6 py-3">Event Type</th>
                <th scope="col" className="px-6 py-3">Actor</th>
                <th scope="col" className="px-6 py-3 w-1/2">Summary</th>
                <th scope="col" className="px-6 py-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-mono text-gray-300 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'long'})}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventTypeStyle(log.eventType)}`}>
                        {log.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-2 text-white font-semibold">
                        {ACTOR_ICONS[log.actor]}
                        {log.actor}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.summary}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedLog(log)} className="text-gray-400 hover:text-brand-primary p-1 rounded-md transition-colors" aria-label="View event details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr className="bg-gray-900 border-b border-gray-800">
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {logs.length === 0 ? "No audit events have been recorded yet." : "No logs match your filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
};

export default AuditLogPage;
