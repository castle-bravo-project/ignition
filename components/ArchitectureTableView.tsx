import React from 'react';
import { ConfigurationItem } from '../types';

interface ArchitectureTableViewProps {
    configurationItems: ConfigurationItem[];
}

const TYPE_STYLES: { [key: string]: string } = {
  'Software Component': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'Document': 'bg-green-900/50 text-green-300 border-green-700',
  'Tool': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'Hardware': 'bg-amber-900/50 text-amber-300 border-amber-700',
  'Architectural Product': 'bg-sky-900/50 text-sky-300 border-sky-700',
};

const STATUS_STYLES: { [key: string]: string } = {
  'Baseline': 'bg-green-900/50 text-green-300 border-green-700',
  'In Development': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  'Deprecated': 'bg-red-900/50 text-red-300 border-red-700',
};

const ArchitectureTableView: React.FC<ArchitectureTableViewProps> = ({ configurationItems }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 rounded-l-lg">ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Version</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3 rounded-r-lg">Dependencies</th>
                    </tr>
                </thead>
                <tbody>
                    {configurationItems.map((ci) => (
                        <tr key={ci.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{ci.id}</td>
                            <td className="px-6 py-4 text-gray-300 font-medium">{ci.name}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_STYLES[ci.type] || ''}`}>
                                    {ci.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono">{ci.version}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[ci.status] || ''}`}>
                                    {ci.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {ci.dependencies && ci.dependencies.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                    {ci.dependencies.map(dep => (
                                        <span key={dep} className="font-mono text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                            {dep}
                                        </span>
                                    ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500">None</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ArchitectureTableView;
