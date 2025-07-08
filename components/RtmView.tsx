
import React from 'react';
import { ProjectData } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Github } from 'lucide-react';

interface RtmViewProps {
    projectData: ProjectData;
}

const RtmView: React.FC<RtmViewProps> = ({ projectData }) => {
    const { requirements = [], links = {}, configurationItems = [] } = projectData;

    const getRepoUrl = (): string | null => {
         try {
            const settings = JSON.parse(window.localStorage.getItem('githubSettings') || '{}');
            return settings.repoUrl || null;
         } catch {
             return null;
         }
    };
    const repoUrl = getRepoUrl();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 rounded-l-lg">Requirement</th>
                        <th scope="col" className="px-6 py-3">Linked Test Cases</th>
                        <th scope="col" className="px-6 py-3">Linked CIs</th>
                        <th scope="col" className="px-6 py-3">Linked Risks</th>
                        <th scope="col" className="px-6 py-3 rounded-r-lg">Linked Issues</th>
                    </tr>
                </thead>
                <tbody>
                    {requirements.map((req) => {
                        const reqLinks = links[req.id];
                        const hasTestCoverage = reqLinks?.tests?.length > 0;
                        const hasCiCoverage = reqLinks?.cis?.length > 0;
                        const hasRisks = reqLinks?.risks?.length > 0;
                        const hasIssues = reqLinks?.issues?.length > 0;
                        
                        const linkedCiNames = reqLinks?.cis?.map(ciId => configurationItems.find(ci => ci.id === ciId)?.name || ciId).join(', ') || '';


                        return (
                            <tr key={req.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{req.id}</td>
                                <td className="px-6 py-4">
                                    {hasTestCoverage ? (
                                        <div className="flex items-center text-green-400">
                                            <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                                            <span className="font-mono">{reqLinks.tests.join(', ')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-yellow-400">
                                            <AlertTriangle size={16} className="mr-2 flex-shrink-0"/>
                                            <span>No Test Link</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {hasCiCoverage ? (
                                        <div className="flex items-center text-green-400" title={linkedCiNames}>
                                            <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                                            <span className="font-mono">{reqLinks.cis.join(', ')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-yellow-400">
                                            <AlertTriangle size={16} className="mr-2 flex-shrink-0"/>
                                            <span>No CI Link</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     {hasRisks ? (
                                        <div className="flex items-center text-red-400">
                                            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                                            <span className="font-mono">{reqLinks.risks.join(', ')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-400">
                                            <XCircle size={16} className="mr-2 flex-shrink-0"/>
                                            <span>None Identified</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     {hasIssues && repoUrl ? (
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {reqLinks.issues.map(issueNum => (
                                                <a 
                                                    key={issueNum}
                                                    href={`${repoUrl}/issues/${issueNum}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 font-mono text-xs bg-gray-700 text-gray-200 px-2 py-0.5 rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                                                >
                                                   <Github size={12} /> #{issueNum}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-400">
                                            <XCircle size={16} className="mr-2 flex-shrink-0"/>
                                            <span>No Issue Link</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RtmView;